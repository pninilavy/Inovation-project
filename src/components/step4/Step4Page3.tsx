import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { useNavigate } from "react-router-dom";

export default function Step4Page3() {
  const { user } = useUser();
  const navigate = useNavigate();

  const username = user?.name || "משתמשת";
  const groupId = user?.groupId || 1;
  const room = `group-${groupId}`;

  // ⬅️ לוקחים גם connected
  const { messages, sendMessage, connected } = useChat(room, username);

  const [leaderName, setLeaderName] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  const [members, setMembers] = useState<
    { id: number; name: string; avatar: string }[]
  >([]);
  const [readyUsers, setReadyUsers] = useState<string[]>([]);
  const [sentReady, setSentReady] = useState(false);

  const processId = 4;

  // --- שליפת חברות הקבוצה ---
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${groupId}/members`
        );
        const data = await res.json();
        setMembers(
          data.map((s: any) => ({
            id: s.id,
            name: `${s.firstName} ${s.lastName}`,
            avatar: s.avatarUrl || "/images/default-profile.png",
          }))
        );
      } catch (err) {
        console.error("שגיאה בשליפת חברות הקבוצה:", err);
      }
    }
    fetchMembers();
  }, [groupId]);

  // --- מי המנהלת ---
  useEffect(() => {
    async function fetchLeader() {
      if (!user?.groupId) return;

      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId}`
        );
        const data = await res.json();

        if (data.message === "טרם נבחרה עורכת לשלב זה") {
          const res2 = await fetch(
            `http://localhost:8080/api/groups/${user.groupId}/choose-editor?processId=${processId}`,
            { method: "POST" }
          );
          const chosen = await res2.json();

          setLeaderName(chosen.editorName);
          const me = chosen.editorName === user.name;
          setIsLeader(me);
          setShowPopup(true);

          sendMessage(
            JSON.stringify({
              type: "STEP4_LEADER_CHOSEN",
              step: processId,
              leader: chosen.editorName,
            })
          );
        } else {
          setLeaderName(data.editorName);
          const me = data.editorName === user.name;
          setIsLeader(me);
          setShowPopup(true);
        }
      } catch (err) {
        console.error("❌ שגיאה בשליפת מנהלת הסבב:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeader();
  }, [user?.groupId, user?.name, sendMessage]);

  // --- כל מי שנכנסת לעמוד 3 מדווחת "אני פה" רק כשהחיבור פעיל ---
  useEffect(() => {
    if (!connected || sentReady || !username) return;

    sendMessage(
      JSON.stringify({
        type: "STEP4_PAGE3_READY",
        user: username,
      })
    );
    setSentReady(true);
  }, [connected, sentReady, username, sendMessage]);

  // --- האזנה להודעות מערכת: מי כבר בעמוד 3 / האם לעבור לשלב 4 ---
  useEffect(() => {
    if (!messages.length) return;

    const readySet = new Set<string>();
    let roundReady = false;

    messages.forEach((m) => {
      try {
        const data = JSON.parse(m.content);
        if (data.type === "STEP4_PAGE3_READY" && data.user) {
          readySet.add(data.user);
        }
        if (data.type === "STEP4_ROUND_READY") {
          roundReady = true;
        }
      } catch {
        // לא JSON – מתעלמים
      }
    });

    // ← תמיד מחשבים מחדש לפי כל ההודעות
    setReadyUsers(Array.from(readySet));

    if (roundReady) {
      navigate("/step4Page4");
    }
  }, [messages, navigate]);

  // האם כל הבנות כבר בעמוד 3?
  const allOnPage3 =
    members.length > 0 &&
    members.every((m) => readyUsers.includes(m.name));

  // העורכת מאשרת מעבר לסבב
  const handleApprove = () => {
    if (!isLeader || !allOnPage3) return;

    sendMessage(
      JSON.stringify({
        type: "STEP4_ROUND_READY",
        step: processId,
        approvedBy: username,
      })
    );

    navigate("/step4Page4");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh] text-[#1f1f75]">
        טוען נתוני קבוצה...
      </div>
    );
  }

  return (
    <div className="min-h-[93vh] bg-white rounded-3xl shadow-lg flex flex-col items-center justify-between px-10 py-10">
      {showPopup && leaderName && (
        <div className="fixed top-8 right-8 bg-white shadow-xl border border-[#3B2DBB] rounded-2xl p-5 text-right z-50">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-[#1f1f75] font-bold mb-2">📢 הודעה לקבוצה</p>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {leaderName} נבחרה לנהל את סבב הצגת הרעיונות.
                {"\n"}
                {leaderName}, רק אחרי שאת מוודאת שכולן מוכנות להציג בקצרה את
                הרעיון – תאשרי מעבר לשלב הבא.
              </p>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="text-gray-400 hover:text-[#1f1f75] text-xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center w-full">
        <div className="max-w-3xl text-center text-[#1f1f75] leading-relaxed">
          <h1 className="text-2xl font-bold mb-6">
            כעת כל אחת תציג בפני הקבוצה את הרעיון שלה.
          </h1>

          <p className="mb-3 text-lg">
            לכל אחת מוקצבות כ־2 דקות דיבור – חשבי מראש כיצד להציג את הפתרון שלך
            באופן מובן, ברור ובתוך הזמן המוקצב.
          </p>

          <p className="mb-3 text-lg">
            {leaderName || "אחת מבנות הקבוצה"},{" "}
            תפקידך לוודא שכל אחת עומדת בזמן ולעבור להצגת הרעיון הבא בין אחת
            לשנייה.
          </p>

          {!allOnPage3 && (
            <p className="mt-4 text-sm text-[#c05621] font-semibold">
              מחכים עדיין שכולן ייכנסו לשלב הזה לפני שמתחילים את סבב ההצגה 🙂
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleApprove}
        disabled={!isLeader || !allOnPage3}
        className={`mb-4 px-10 py-3 rounded-full text-lg font-semibold min-w-[320px] transition ${
          isLeader && allOnPage3
            ? "bg-[#1f1f75] text-white hover:bg-[#14125f]"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {leaderName
          ? `${leaderName} מאשרת שכולן מוכנות לסבב 〈`
          : "ממתינים לבחירת מנהלת סבב..."}
      </button>
    </div>
  );
}
