import React, { useEffect, useState } from "react";
import { ChevronLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

interface Item {
  id: number;
  text: string;
  type: "need" | "constraint";
  sender: string;
  avg?: number;
}

interface Member {
  id: number;
  name: string;
  avatar: string;
}

export default function Step2Page4() {
  const { user } = useUser();
  const navigate = useNavigate();
  const room = `group-${user?.groupId || 1}`;
  const [needs, setNeeds] = useState<Item[]>([]);
  const [constraints, setConstraints] = useState<Item[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  /* --- שליפת חברות הקבוצה --- */
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`http://localhost:8080/api/groups/${user?.groupId}/members`);
        if (!res.ok) throw new Error("שגיאה בשליפת חברות הקבוצה");
        const data = await res.json();
        const formatted = data.map((student: any) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          avatar: student.avatarUrl || "/images/default-profile.png",
        }));
        setMembers(formatted);
      } catch (err) {
        console.error("❌ שגיאה בשליפת חברות הקבוצה:", err);
      }
    }
    if (user?.groupId) fetchMembers();
  }, [user?.groupId]);

  /* --- שליפת נתוני דירוגים --- */
  useEffect(() => {
    const rankings = JSON.parse(localStorage.getItem(`step3_rankings_${room}`) || "[]");

    const withAvg = rankings.map((item: any) => {
      const allVals = Object.values(item.values || {});
      const avg =
        allVals.length > 0
          ? allVals.reduce((a: number, b: number) => a + b, 0) / allVals.length
          : 0;
      return { ...item, avg };
    });

    setNeeds(
      withAvg
        .filter((i) => i.type === "need")
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3)
    );
    setConstraints(
      withAvg
        .filter((i) => i.type === "constraint")
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3)
    );
  }, [room]);

  return (
<div className="h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-lg p-8 md:p-10 flex flex-col rtl items-center overflow-y-auto md:overflow-hidden">
{/* כותרת */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="text-5xl mb-4">👍</div>
        <h1 className="text-3xl font-bold text-[#1f1f75]">כל הכבוד!</h1>
        <p className="text-lg text-[#1f1f75] mt-2">
          בעבודה משותפת סיימתן את שלב הגדרת האתגר
        </p>
      </div>

      {/* קופסאות עליונות */}
      <div className="flex flex-col md:flex-row justify-center gap-8 mb-10 w-full max-w-5xl">
        <Box title="שאלת האתגר המעשי, שניסחתן עבור המשימה:" text="ציטוט מתוך שאלת האתגר" />
        <Box title="המשימה שקיבלתן היום:" text="ציטוט מהאתגר הראשון" />
      </div>

      <p className="text-center font-semibold text-[#1f1f75] mb-6">
        בעת גיבוש מענה יש לתת את הדעת על
      </p>

      {/* הצרכים והאילוצים */}
      <div className="w-full max-w-5xl flex flex-col gap-8">
      <Section title="הצרכים הבאים" items={needs} members={members} />
        <Section title="האילוצים הבאים" items={constraints} members={members} />
      </div>

      {/* כפתור */}
      <div className="flex justify-center mt-8 md:mt-10">
      <button
          onClick={() => navigate("/step-3")}
          className="px-10 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold hover:bg-[#15115f] transition flex items-center gap-2"
        >
          לשלב הבא
          <ChevronLeft size={22} />
        </button>
      </div>
    </div>
  );
}

/* --- Box עליון --- */
function Box({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col justify-between bg-white border border-[#E2E2E2] rounded-[15px] shadow-md p-5 text-right w-full">
      <h3 className="text-[#1f1f75] font-semibold mb-3">{title}</h3>
      <div className="bg-[#fafafa] border border-[#DADADA] rounded-xl px-4 py-3 shadow-sm text-[#1f1f75]">
        {text}
      </div>
    </div>
  );
}

/* --- Section לרוחב (3 קלפים בשורה) --- */
function Section({
  title,
  items,
  members,
}: {
  title: string;
  items: Item[];
  members: Member[];
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1f1f75] mb-5 text-right">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((i) => (
          <Card key={i.id} item={i} members={members} />
        ))}
      </div>
    </div>
  );
}

/* --- קלף בודד --- */
function Card({ item, members }: { item: Item; members: Member[] }) {
  const member = members.find((m) => m.name === item.sender);

  return (
    <div className="bg-white border border-[#E2E2E2] rounded-2xl shadow-md px-5 py-4 flex flex-col text-right justify-between min-h-[160px]">
      {/* שורה עליונה - שם, תמונה, כוכבים */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <img
            src={member?.avatar || "/images/default-profile.png"}
            alt={item.sender}
            className="w-8 h-8 rounded-full border border-gray-300 object-cover"
          />
          <p className="text-[#1f1f75] font-semibold">{item.sender}</p>
        </div>
        <div className="flex text-yellow-400">
          {[...Array(3)].map((_, idx) => (
            <Star
              key={idx}
              size={16}
              fill={idx < Math.round(item.avg || 0) ? "#FFB400" : "none"}
              stroke="#FFB400"
            />
          ))}
        </div>
      </div>

      {/* טקסט */}
      <p className="text-sm text-[#1f1f75] leading-snug">{item.text}</p>
    </div>
  );
}
