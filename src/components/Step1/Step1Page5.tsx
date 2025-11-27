import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { useNavigate } from "react-router-dom";

export default function Step1Page5() {
  const { user } = useUser();
  const username = user?.name || "משתמשת";
  const room = `group-${user?.groupId || 1}`;
  const navigate = useNavigate();
  const { messages, sendMessage } = useChat(room, username);

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isWaitingForSummary, setIsWaitingForSummary] = useState(false); // ✅ רק למי שלחצה

  const groupId = user.groupId;
  const processId = 1;

  // ✅ שליפת חברות הקבוצה
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
        console.error("❌ שגיאה בשליפת נתונים:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [groupId]);

  // 🧠 האזנה רק לסיום הסיכום
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    // ✅ רק אם המשתמשת הזו *מחכה* – נעביר אותה לעמוד הבא
    if (lastMsg.content === "[SUMMARY_READY]" && isWaitingForSummary) {
      setIsLoadingSummary(false);
      navigate("/step1Page6");
    }
  }, [messages, isWaitingForSummary, navigate]);

  if (loading)
    return <div className="text-center mt-20">טוען נתונים...</div>;

  // ✅ זיהוי מי חסרה בשיתופים
  const participants = members.map((m) => m.name);
  const senders = Array.from(new Set(messages.map((m) => m.username)));
  const missing = participants.filter((p) => !senders.includes(p));
  const allShared = missing.length === 0;

  // מסננים הודעות למצוי ורצוי
  const current = messages.filter((m) => m.content.startsWith("[מצוי]"));
  const desired = messages.filter((m) => m.content.startsWith("[רצוי]"));

  // ✅ לחיצה על “לשלב הבא”
  const handleNext = async () => {
    if (!allShared) {
      alert(`עדיין לא כל המשתתפות שיתפו 🙂\nחסרות: ${missing.join(", ")}`);
      return;
    }

    // אם כבר בתהליך – לא לעשות כלום (מניעת לחיצות כפולות)
    if (isLoadingSummary) return;

    // קודם בודקים אם כבר יש סיכום קיים — במקרה שבינתיים מישהי אחרת כבר סיימה
    try {
      const check = await fetch(
        `http://localhost:8080/api/groups/${groupId}/summary?processId=${processId}`
      );
      const existing = await check.json();
      if (existing.success && (existing.current || existing.desired)) {
        navigate("/step1Page6");
        return;
      }
    } catch (err) {
      console.error("❌ שגיאה בבדיקת סיכום קיים:", err);
      // אם יש שגיאה כאן, נמשיך בכל זאת לנסות ליצור סיכום
    }

    // מכאן – המשתמשת הזו מתחילה/מצטרפת לחיכוי לסיכום
    setIsLoadingSummary(true);
    setIsWaitingForSummary(true);

    try {
      // אם אין עורכת — נגדיר את ChatGPT כעורכת
      const editorCheck = await fetch(
        `http://localhost:8080/api/groups/${groupId}/editor?processId=${processId}`
      );
      const editorData = await editorCheck.json();
      let isFirst = false;

      if (!editorData.editorName) {
        const chooseRes = await fetch(
          `http://localhost:8080/api/groups/${groupId}/choose-editor?processId=${processId}&editorName=ChatGPT`,
          { method: "POST" }
        );
        if (!chooseRes.ok) {
          throw new Error("שגיאה בהגדרת עורכת ChatGPT");
        }
        isFirst = true;
      }

      if (isFirst) {
        // 🔹 רק הראשונה שיוצרת תיצור את הסיכום

        const currentMsgs = current
          .map((m) => `${m.username}: ${m.content.replace(/^\[.*?\]\s*/, "")}`)
          .join("\n");
        const desiredMsgs = desired
          .map((m) => `${m.username}: ${m.content.replace(/^\[.*?\]\s*/, "")}`)
          .join("\n");

        const summarize = async (type: string, text: string) => {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content:
                    "את מסכמת שיחות קבוצתיות לעברית פשוטה וברורה בסגנון נעים.",
                },
                {
                  role: "user",
                  content: `סכמי את ${type} הבא:\n${text}`,
                },
              ],
            }),
          });
          const data = await res.json();
          return data.choices?.[0]?.message?.content || "";
        };

        // 🔹 שליחה ל־GPT
        const currentSummary = await summarize("המצוי", currentMsgs);
        const desiredSummary = await summarize("הרצוי", desiredMsgs);

        // 🔹 שמירה בשרת
        await fetch(
          `http://localhost:8080/api/groups/${groupId}/summary?processId=${processId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              current: currentSummary,
              desired: desiredSummary,
            }),
          }
        );

        // הודעה לצ׳אט כדי שבנות שלחצו בזמן יחכו ויעברו
        sendMessage("[SUMMARY_READY]");

        // גם אצל היוצרת נעבור מיד
        navigate("/step1Page6");
      } else {
        // הבנות האחרות לא יוצרות סיכום נוסף – רק מחכות ל-[SUMMARY_READY]
        console.log("מישהי אחרת כבר יוצרת את הסיכום – מחכה להודעת SUMMARY_READY");
      }
    } catch (err) {
      console.error("❌ שגיאה בתהליך:", err);
      alert("שגיאה בתהליך הסיכום 😔");
      setIsLoadingSummary(false);
      setIsWaitingForSummary(false);
    }
  };

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center rounded-3xl px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-10">
        המציאות בעיניים שלכן – חברות הקבוצה משתפות:
      </h1>

      {/* שתי העמודות */}
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        <Column
          title="מה המצב המצוי כיום?"
          color="blue"
          data={current}
          members={members}
        />
        <Column
          title="מהו המצב הרצוי לדעתכן?"
          color="purple"
          data={desired}
          members={members}
        />
      </div>

      {/* כפתור מעבר לשלב הבא */}
      <button
        onClick={handleNext}
        disabled={!allShared || isLoadingSummary}
        className={`mt-10 px-12 py-3 rounded-full text-xl font-semibold transition ${
          !allShared || isLoadingSummary
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-[#1f1f75] text-white hover:bg-[#2a2aa2]"
        }`}
      >
        {isLoadingSummary ? "יוצרות סיכום..." : "⏭ לשלב הבא"}
      </button>

      {!allShared && (
        <p className="mt-4 text-sm text-red-600 font-semibold">
          עדיין לא שלחו: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}

// ✅ עמודת המצוי / הרצוי
function Column({
  title,
  color,
  data,
  members,
}: {
  title: string;
  color: "blue" | "purple";
  data: { username: string; content: string }[];
  members: { name: string; avatar: string }[];
}) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#e7f9ff]", border: "border-[#baeaff]" }
      : { bg: "bg-[#f6f2ff]", border: "border-[#e0d4ff]" };

  return (
    <div
      className={`flex-1 ${colors.bg} border ${colors.border} rounded-2xl p-6 text-right shadow-sm`}
    >
      <h2 className="text-xl font-semibold text-[#1f1f75] mb-4">{title}</h2>

      <div className="flex flex-wrap gap-3 justify-start">
        {data.map((msg, i) => {
          const member = members.find((m) => m.name === msg.username);
          return (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-3 w-[48%] shadow-sm text-sm flex flex-col"
            >
              <div className="flex items-center gap-2 mt-auto">
                <img
                  src={member?.avatar || "/images/default-profile.png"}
                  alt={msg.username}
                  className="w-6 h-6 rounded-full border border-gray-300 object-cover"
                />
                <p className="text-[#1f1f75] text-xs font-semibold text-left">
                  {msg.username}
                </p>
              </div>
              <p className="text-gray-700 mb-2">
                {msg.content.replace(/^\[.*?\]\s*/, "")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
