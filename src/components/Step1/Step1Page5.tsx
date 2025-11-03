
import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { useNavigate } from "react-router-dom";

export default function Step1Page5() {
  const { user } = useUser();
  const username = user?.name || "משתמשת";
  const room = `group-${user?.groupId || 1}`;
  const navigate = useNavigate();
  const { messages, resetChat } = useChat(room, username);

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<{
    current: string;
    desired: string;
  } | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const groupId = user.groupId;
  const processId = 1;

  // ✅ שליפת חברות מהשרת
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
        console.error("שגיאה בשליפת נתונים:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [groupId]);

  if (loading) return <div className="text-center mt-20">טוען נתונים...</div>;

  const participants = members.map((m) => m.name);
  const senders = Array.from(new Set(messages.map((m) => m.username)));
  const missing = participants.filter((p) => !senders.includes(p));

  const current = messages.filter((m) => m.content.startsWith("[מצוי]"));
  const desired = messages.filter((m) => m.content.startsWith("[רצוי]"));

  // ✅ יצירת או שליפת סיכום
  const handleNext = async () => {
    if (missing.length > 0) {
      alert(`עדיין לא כל המשתתפות שיתפו 🙂\nחסרות: ${missing.join(", ")}`);
      return;
    }

    try {
      setIsLoadingSummary(true);
      console.log("🔍 בודקת אם קיים סיכום בקבוצה", groupId);

      // 🔹 שלב 1: לבדוק אם כבר יש סיכום קיים
      const existingRes = await fetch(
        `http://localhost:8080/api/groups/${groupId}/summary?processId=${processId}`
      );
      const existingData = await existingRes.json();

      if (
        existingData.success &&
        (existingData.current || existingData.desired)
      ) {
        console.log("🟢 סיכום קיים נמצא:", existingData);
        setSummaries({
          current: existingData.current,
          desired: existingData.desired,
        });
        setIsLoadingSummary(false);
        return;
      }

      // 🔹 שלב 2: לבדוק אם קיימת עורכת
      console.log("🧾 בודקת אם קיימת עורכת...");
      const editorRes = await fetch(
        `http://localhost:8080/api/groups/${groupId}/editor?processId=${processId}`
      );
      const editorData = await editorRes.json();

      if (!editorData.editorName) {
        console.log("🤖 אין עורכת — מגדירה את ChatGPT כעורכת...");
        const chooseRes = await fetch(
          `http://localhost:8080/api/groups/${groupId}/choose-editor?processId=${processId}&editorName=ChatGPT`,
          { method: "POST" }
        );
        if (!chooseRes.ok) throw new Error("שגיאה ביצירת עורכת ChatGPT");
      } else {
        console.log("👩‍💼 קיימת כבר עורכת:", editorData.editorName);
      }

      // 🔹 שלב 3: יצירת סיכום חדש
      console.log("📤 שולחת נתונים ל-GPT...");

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

      const currentMsgs = current
        .map((m) => `${m.username}: ${m.content.replace(/^\[.*?\]\s*/, "")}`)
        .join("\n");
      const desiredMsgs = desired
        .map((m) => `${m.username}: ${m.content.replace(/^\[.*?\]\s*/, "")}`)
        .join("\n");

      const currentSummary = await summarize("המצוי", currentMsgs);
      const desiredSummary = await summarize("הרצוי", desiredMsgs);

      console.log("✅ סיכום המצוי:", currentSummary);
      console.log("✅ סיכום הרצוי:", desiredSummary);

      // 🔹 שלב 4: שמירה בשרת
      const saveRes = await fetch(
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

      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.message);

      // עדכון תצוגה
      setSummaries({ current: currentSummary, desired: desiredSummary });
      console.log("🧠 נוצר סיכום חדש בהצלחה!");
    } catch (err) {
      console.error("❌ שגיאה בתהליך הסיכום:", err);
      alert("שגיאה בתהליך הסיכום 😔");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center rounded-3xl shadow-lg px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-10">
        סיכום האתגר הקבוצתי
      </h1>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        <Column
          title="המצוי – מה קיים היום?"
          color="blue"
          data={current}
          members={members}
          summary={summaries?.current}
        />
        <Column
          title="הרצוי – מה הייתי רוצה?"
          color="purple"
          data={desired}
          members={members}
          summary={summaries?.desired}
        />
      </div>

      {/* 🧠 כפתור יצירת סיכום – יוצג רק אם עדיין אין סיכום */}
      {!summaries && (
        <button
          onClick={handleNext}
          disabled={isLoadingSummary}
          className={`mt-10 px-12 py-3 rounded-full text-xl font-semibold transition ${
            isLoadingSummary
              ? "bg-gray-400 cursor-wait text-white"
              : "bg-[#1f1f75] text-white hover:bg-[#2a2aa2]"
          }`}
        >
          {isLoadingSummary ? "מכינה סיכום..." : "🧠 יצירת סיכום בעזרת GPT"}
        </button>
      )}

      {/* ⏭ כפתור לשלב הבא – יוצג רק אחרי שנוצר סיכום */}
      {summaries && (
        <button
          onClick={() => navigate("/Step1Page7")}
          className="mt-10 px-12 py-3 rounded-full text-xl font-semibold bg-green-600 text-white hover:bg-green-700 transition"
        >
          ⏭ לשלב הבא
        </button>
      )}

      {missing.length > 0 && (
        <p className="mt-4 text-sm text-red-600 font-semibold">
          עדיין לא שלחו: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}

// ✅ קומפוננטת עמודה
function Column({
  title,
  color,
  data,
  members,
  summary,
}: {
  title: string;
  color: "blue" | "purple";
  data: { username: string; content: string }[];
  members: { name: string; avatar: string }[];
  summary?: string;
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
              <p className="text-gray-700 mb-2">
                {msg.content.replace(/^\[.*?\]\s*/, "")}
              </p>
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
            </div>
          );
        })}
      </div>

      {/* תיבת סיכום בתוך המסגרת */}
      {summary && (
        <div
          className={`mt-6 border-t pt-3 ${
            color === "blue" ? "border-[#baeaff]" : "border-[#d5c8ff]"
          }`}
        >
          <div
            className={`p-4 rounded-xl ${
              color === "blue" ? "bg-[#dff6ff]" : "bg-[#efe9ff]"
            } shadow-inner`}
          >
            <h3 className="font-bold text-[#1f1f75] mb-2 text-sm">
              סיכום {title.includes("המצוי") ? "המצוי" : "הרצוי"}:
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
