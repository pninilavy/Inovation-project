
import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Step1Page7() {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user?.groupId) {
    return (
      <div className="text-center mt-20 text-[#1f1f75]">
        טוען נתוני קבוצה...
      </div>
    );
  }

  const room = `group-${user.groupId}`;
  const username = user?.name || "משתמשת";
  const { sendMessage, messages } = useChat(room, username);

  const [summary, setSummary] = useState({ current: "", desired: "" });
  const [responses, setResponses] = useState<
    { name: string; agree: boolean }[]
  >([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [editor, setEditor] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [Members, setMembers] = useState<
    { id: number; name: string; avatar: string }[]
  >([]);

  const processId = 2; // תהליך חדש שייבנה אחרי שלב זה

  // 📥 שליפת חברות הקבוצה
  useEffect(() => {
    if (!user?.groupId) return;

    async function fetchMembers() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/members`
        );
        if (!res.ok) throw new Error("שגיאה בשליפת חברות הקבוצה מהשרת");

        const data = await res.json();
        const formattedData = data.map((student: any) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          avatar: student.avatarUrl || "/images/default-profile.png",
        }));

        console.log("📦 חברות קבוצה מהשרת:", formattedData);
        setMembers(formattedData);
      } catch (err) {
        console.error("❌ שגיאה בשליפת נתוני חברות קבוצה:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [user?.groupId]);

  // 📥 שליפת סיכום קודם
  useEffect(() => {
    if (!user?.groupId) return;

    async function fetchSummary() {
      try {
        console.log("📡 טוען סיכום לקבוצה:", user.groupId);
        const res = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${
            processId - 1
          }`
        );
        const data = await res.json();
        console.log("📦 סיכום שהתקבל:", data);

        if (data.success) {
          setSummary({
            current: data.current || "",
            desired: data.desired || "",
          });
        }
      } catch (err) {
        console.error("❌ שגיאה בשליפת סיכום:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [user?.groupId]);

  // 📨 קבלת הצבעות חדשות מהצ'אט
  useEffect(() => {
    messages.forEach((m) => {
      if (m.content.startsWith("[הצבעה]")) {
        const data = JSON.parse(m.content.replace("[הצבעה]", ""));
        setResponses((prev) => {
          if (prev.find((r) => r.name === data.name)) return prev;
          return [...prev, data];
        });
      }
    });
  }, [messages]);

  // ⚙️ בדיקה מחדש בכל פעם שיש שינוי בהצבעות
  useEffect(() => {
    if (!Members.length || responses.length === 0) return;

    const allResponded = responses.length === Members.length;
    if (!allResponded) return;

    const allAgree = responses.every((r) => r.agree);

    if (allAgree) {
      console.log("✅ כולן מסכימות — יצירת תהליך חדש עם אותה עורכת");
      fetch(`http://localhost:8080/api/groups/${user.groupId}/next-process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processId, keepEditor: true }),
      })
        .then(async (res) => {
          const data = await res.json();
          console.log("📦 תגובה מ-next-process:", data);

          if (data.success) {
            console.log("🚀 מעבר לעמוד 9");
            navigate("/step1Page9");
          } else {
            console.warn("⚠️ שגיאה: לא נוצר תהליך חדש", data);
          }
        })
        .catch((err) => console.error("❌ שגיאת next-process:", err));
    } else {
      console.log("🎯 יש מתנגדת — נבחרת עורכת חדשה");
      fetch(
        `http://localhost:8080/api/groups/${user.groupId}/choose-editor?processId=${processId}`,
        { method: "POST" }
      )
        .then(async (res) => {
          if (!res.ok) throw new Error("שגיאה בבקשת choose-editor");
          const data = await res.json();
          console.log("📦 תגובה מ-choose-editor:", data);

          setEditor(data.editorName);
          setShowPopup(
            `${data.editorName} תערוך את הסיכום מחדש על פי הנחיית הקבוצה`
          );
          localStorage.setItem("newEditor", data.editorName);

          setTimeout(() => {
            console.log("🚀 מעבר לעמוד 8 (עריכה חדשה)");
            navigate("/step1Page8");
          }, 2000);
        })
        .catch((err) => console.error("❌ שגיאת choose-editor:", err));
    }
  }, [responses, Members]);

  // 📨 שליחת הצבעה
  const handleVote = (agree: boolean) => {
    const msg = { name: username, agree };
    sendMessage(`[הצבעה]${JSON.stringify(msg)}`);
    setHasVoted(true);
    console.log("📤 נשלחה הצבעה:", msg);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[90vh] text-[#1f1f75]">
        <Loader2 className="animate-spin mr-2" size={36} />
        טוען סיכום...
      </div>
    );

  return (
    <div className="min-h-[93vh] bg-white rounded-3xl shadow-lg p-10 flex flex-col justify-between text-right rtl relative">
      <h1 className="text-3xl font-bold text-[#1f1f75] mb-10 text-center">
        סיכום
      </h1>

      {/* 🔹 הצגת הסיכום הקיים */}
      <div className="flex flex-col md:flex-row justify-center gap-10 mb-10">
        <SummaryBox
          title="המצוי – מה קיים היום?"
          color="blue"
          text={summary.current}
          emoji="/images/Emoji2.png"
        />
        <SummaryBox
          title="הרצוי – מה הייתי רוצה?"
          color="purple"
          text={summary.desired}
          emoji="/images/Emoji1.png"
        />
      </div>

      {/* 🔹 שאלה להצבעה */}
      <div className="text-center mb-6">
        <p className="text-[#1f1f75] text-xl font-semibold">
          האם את מסכימה עם הסיכום הסופי?
        </p>
      </div>

      {/* 🔹 כפתורי הצבעה */}
      {!hasVoted && (
        <div className="flex flex-col items-center gap-4 mb-10">
          <button
            onClick={() => handleVote(true)}
            className="w-[300px] h-[56px] bg-[#DF57FF] text-white text-xl font-semibold rounded-full shadow-md hover:scale-105 transition"
          >
            מסכימה לסיכום
          </button>
          <button
            onClick={() => handleVote(false)}
            className="w-[300px] h-[56px] bg-[#E6E6E6] text-[#1f1f75] text-xl font-semibold rounded-full shadow-md hover:scale-105 transition"
          >
            ניתן לנסח זאת טוב יותר
          </button>
        </div>
      )}

      {/* 💬 הצבעות שהתקבלו */}
      {responses.length > 0 && (
        <div className="flex flex-col items-center gap-2 mt-4 mb-10">
          {responses.map((r, i) => (
            <div
              key={i}
              className={`px-5 py-2 rounded-full shadow-sm text-sm font-semibold ${
                r.agree
                  ? "bg-[#F6E1FF] text-[#3B2DBB]"
                  : "bg-[#EAEAEA] text-[#1f1f75]"
              }`}
            >
              {r.name} {r.agree ? "מסכימה ✅" : "רוצה לנסח אחרת ✏️"}
            </div>
          ))}
        </div>
      )}

      {/* 🔹 פופאפ לעורכת חדשה */}
      {showPopup && (
        <div className="fixed top-10 right-10 bg-white border border-[#3B2DBB] rounded-2xl shadow-xl p-5 z-50">
          <p className="text-[#1f1f75] font-bold mb-2">📢 הודעה לקבוצה</p>
          <p className="text-gray-700 text-lg">{showPopup}</p>
          <button
            onClick={() => setShowPopup(null)}
            className="mt-3 text-[#3B2DBB] font-semibold underline"
          >
            סגור
          </button>
        </div>
      )}
    </div>
  );
}

// 🧩 קומפוננטת תיבת סיכום
function SummaryBox({ title, color, text, emoji }: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} p-[19px] border ${colors.border} rounded-[20px] shadow-md w-[447px] min-h-[311px] text-right`}
    >
      <div className="flex justify-end items-center gap-2 mb-3 w-full text-right">
        <img src={emoji} alt="emoji" className="w-6 h-6" />
        <h2 className="text-xl font-semibold text-[#1f1f75] text-right leading-relaxed">
          {title}
        </h2>
      </div>
      <div className="w-full bg-white border border-[#DADADA] rounded-[15px] p-4 text-right leading-relaxed">
        <p className="text-[#1f1f75] whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}