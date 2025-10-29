
import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { useNavigate } from "react-router-dom";

interface Member {
  id: number;
  name: string;
  avatar: string;
}

export default function Step1Page5() {
  const { user } = useUser();
  const username = user?.name || "משתמשת";
  const room = `group-${user?.groupId || 1}`;
  const navigate = useNavigate();

  const { messages, resetChat } = useChat(room, username);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ שליפת חברות אמיתיות מהשרת
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${user?.groupId}/members`
        );
        if (!res.ok) throw new Error("שגיאה בשליפת חברות הקבוצה מהשרת");

        const data = await res.json();
        const formattedData = data.map((student: any) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          avatar: student.avatarUrl || "/images/default-profile.png",
        }));

        setMembers(formattedData);
      } catch (err) {
        console.error("שגיאה בשליפת נתונים", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [user?.groupId]);

  if (loading) return <div className="text-center mt-20">טוען נתונים...</div>;

  // רשימת המשתתפות מתוך השרת
  const participants = members.map((m) => m.name);

  // מוודאים מי שלחה הודעה
  const senders = Array.from(new Set(messages.map((m) => m.username)));
  const missing = participants.filter((p) => !senders.includes(p));

  const current = messages.filter((m) => m.content.startsWith("[מצוי]"));
  const desired = messages.filter((m) => m.content.startsWith("[רצוי]"));

  const handleNext = async () => {
    if (missing.length > 0) {
      alert(`עדיין לא כל המשתתפות שיתפו 🙂\nחסרות: ${missing.join(", ")}`);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/choose-editor`,
        { method: "POST" }
      );
      const data = await res.json();
      localStorage.setItem("groupEditor", data.editorName);
      resetChat();
      navigate("/Step1Page6");
    } catch (err) {
      console.error("שגיאה בבחירת עורכת:", err);
      alert("שגיאה בהגרלה, נסי שוב מאוחר יותר 😔");
    }
  };

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-start rounded-3xl shadow-lg px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-10">
        סיכום האתגר הקבוצתי
      </h1>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        <Column
          title="המצוי – מה קיים היום?"
          color="blue"
          data={current}
          members={members}
        />
        <Column
          title="הרצוי – מה הייתי רוצה?"
          color="purple"
          data={desired}
          members={members}
        />
      </div>

      <button
        onClick={handleNext}
        className={`mt-10 px-12 py-3 rounded-full text-xl font-semibold transition ${
          missing.length > 0
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-[#1f1f75] text-white hover:bg-[#2a2aa2]"
        }`}
      >
        לשלב הבא ←
      </button>

      {missing.length > 0 && (
        <p className="mt-4 text-sm text-red-600 font-semibold">
          עדיין לא שלחו: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}

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
    </div>
  );
}
