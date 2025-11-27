import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, Star, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";

interface Item {
  id: number;
  text: string;
  type: "need" | "constraint";
  sender: string;
  avatarUrl?: string;
  total?: number; // סכום הדירוגים
  stars?: number; // 1–3 כוכבים להצגה
}


interface FinalResult {
  needs: Item[];
  constraints: Item[];
}

export default function Step2Page4() {
  const { user } = useUser();
  const navigate = useNavigate();

  const username = user?.name || "משתמשת";
  const groupId = user?.groupId || 1;
  const room = `group-${groupId}`;

  const { messages, sendMessage, connected } = useChat(room, username);

  const [needs, setNeeds] = useState<Item[]>([]);
  const [constraints, setConstraints] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);

  // 🔹 טקסטים לחלק העליון
  const [missionText, setMissionText] = useState("");       // "המשימה שקיבלתן היום"
  const [challengeQuestion, setChallengeQuestion] = useState(""); // "שאלת האתגר המעשית"

  const sentRef = useRef(false);

  const STORAGE_KEY_FINAL = `final_top3_${room}`;
  const STORAGE_KEY_RANKINGS = `step3_rankings_${room}`;
  const STORAGE_KEY_MEMBERS = `group_${groupId}_members`;


  // פונקציה שעושה את הטופ 3 + כוכבים לפי הלוגיקה שלך
  function computeTop3WithStars(list: Item[]): Item[] {
    const sorted = [...list]
      .sort((a, b) => (b.total || 0) - (a.total || 0))
      .slice(0, 3);

    if (sorted.length === 0) return [];
    if (sorted.length === 1) return [{ ...sorted[0], stars: 3 }];
    if (sorted.length === 2)
      return [
        { ...sorted[0], stars: 3 },
        { ...sorted[1], stars: 1 },
      ];

    const max = sorted[0].total || 0;
    const mid = sorted[1].total || 0;
    const min = sorted[2].total || 0;

    const midPoint = (max + min) / 2;
    const dMax = Math.abs(max - mid);
    const dMin = Math.abs(mid - min);
    const dMid = Math.abs(midPoint - mid);

    let midStars: number;
    const smallest = Math.min(dMax, dMin, dMid);

    if (smallest === dMax) midStars = 3;      // הכי קרוב לגבוה
    else if (smallest === dMin) midStars = 1; // הכי קרוב לנמוך
    else midStars = 2;                        // הכי קרוב לחציון

    return [
      { ...sorted[0], stars: 3 },
      { ...sorted[1], stars: midStars },
      { ...sorted[2], stars: 1 },
    ];
  }

  // --- 1) חישוב מקומי או טעינה מלוקאל ---
  useEffect(() => {
    const savedStr = localStorage.getItem(STORAGE_KEY_FINAL);
    if (savedStr) {
      const saved: FinalResult = JSON.parse(savedStr);
      setNeeds(saved.needs);
      setConstraints(saved.constraints);
      setReady(true);
      return;
    }

    const rankingsStr = localStorage.getItem(STORAGE_KEY_RANKINGS);
    const membersCount = Number(localStorage.getItem(STORAGE_KEY_MEMBERS) || 0);
    if (!rankingsStr || !membersCount) return;

    let allFinished: Record<string, any[]> = {};
    try {
      allFinished = JSON.parse(rankingsStr);
    } catch {
      return;
    }

    if (Object.keys(allFinished).length < membersCount) {
      return;
    }

    // חישוב סכומי הדירוגים
    const merged: Record<number, { sum: number; item: any }> = {};

    Object.values(allFinished).forEach((userItems: any[]) => {
      userItems.forEach((i) => {
        if (!merged[i.id]) merged[i.id] = { sum: 0, item: i };
        merged[i.id].sum += i.value;
      });
    });

    const withTotals: Item[] = Object.values(merged).map((x) => ({
      ...(x.item as Item),
      total: x.sum,
    }));

    const needsTop = computeTop3WithStars(
      withTotals.filter((i) => i.type === "need")
    );
    const constraintsTop = computeTop3WithStars(
      withTotals.filter((i) => i.type === "constraint")
    );

    const final: FinalResult = { needs: needsTop, constraints: constraintsTop };

    localStorage.setItem(STORAGE_KEY_FINAL, JSON.stringify(final));

    setNeeds(needsTop);
    setConstraints(constraintsTop);
    setReady(true);
  }, [room, groupId]);


  // --- 2) שידור ברגע שיש תוצאה וחיבור ---
  useEffect(() => {
    if (!ready) return;
    if (!connected) return;
    if (sentRef.current) return;

    const payload: FinalResult = { needs, constraints };
    sendMessage(`[final-top3] ${JSON.stringify(payload)}`);
    sentRef.current = true;
  }, [ready, connected, needs, constraints, sendMessage]);

  // --- 3) קבלת הודעה מהקבוצה ---
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.content.startsWith("[final-top3]")) {
        const dataStr = msg.content.replace("[final-top3]", "").trim();
        const data: FinalResult = JSON.parse(dataStr);

        setNeeds(data.needs);
        setConstraints(data.constraints);
        setReady(true);
        localStorage.setItem(STORAGE_KEY_FINAL, JSON.stringify(data));
      }
    });
  }, [messages]);

  if (!ready) {
    return (
      <div className="text-center mt-20 text-[#1f1f75] text-xl">
        ⏳ מחשבות את התוצאות הקבוצתיות...
      </div>
    );
  }

  return (
    <div className="h-[calc(100%-3rem)] bg-white rounded-3xl p-10 flex flex-col rtl items-center">
      {/* 🔹 החלק העליון – כמו במוקאפ */}
      <div className="flex flex-col items-center mb-10 w-full max-w-5xl">
        <div className="w-16 h-16 rounded-full bg-[#E6F9FF] flex items-center justify-center mb-4">
          <ThumbsUp size={32} className="text-[#1f1f75]" />
        </div>
        <h1 className="text-3xl font-bold text-[#1f1f75] mb-2">
          כל הכבוד!
        </h1>
        <p className="text-lg text-[#404040] text-center mb-6">
          בעבודה משותפת סיימתן את שלב הגדרת האתגר
        </p>

        <div className="flex flex-col md:flex-row gap-6 w-full">
          <TopBox
            title="המשימה שקיבלתן היום:"
            subtitle=" "
            color="blue"
            text={missionText}
          />
          <TopBox
            title="שאלת האתגר המעשית, שניסחתן עבור המשימה:"
            subtitle=""
            color="purple"
            text={challengeQuestion}
          />
        </div>
      </div>

      <p className="mb-4 text-[#404040] text-center text-sm md:text-base">
        בעת גיבוש מענה יש לתת את הדעת על
      </p>

      {/* 🔹 שלושת הצרכים והאילוצים */}
      <div className="flex flex-col gap-10 w-full max-w-5xl">
        <Section title="הצרכים הבולטים ביותר" items={needs} />
        <Section title="האילוצים הבולטים ביותר" items={constraints} />
      </div>

      <button
        onClick={() => navigate("/Step3Page1")}
        className="mt-10 px-10 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold flex items-center gap-2"
      >
        לשלב הבא <ChevronLeft size={22} />
      </button>
    </div>
  );
}

// ---------------- UI קטנים ----------------

function TopBox({
  title,
  subtitle,
  color,
  text,
}: {
  title: string;
  subtitle: string;
  color: "blue" | "purple";
  text: string;
}) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", inner: "bg-[#DFF4FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", inner: "bg-[#F6EFFF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex-1 ${colors.bg} border ${colors.border} rounded-[20px] p-4 text-right`}
    >
      <p className="text-sm font-semibold text-[#404040] mb-2">{title}</p>
      <div
        className={`${colors.inner} rounded-[16px] px-4 py-3 min-h-[80px] flex flex-col justify-center`}
      >
        <p className="text-xs text-[#808080] mb-1">{subtitle}</p>
        <p className="text-sm text-[#1f1f75] whitespace-pre-line leading-relaxed">
          {text || "—"}
        </p>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#1f1f75] mb-5">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((i) => (
          <Card key={i.id} item={i} />
        ))}
      </div>
    </div>
  );
}

function Card({ item }: { item: Item }) {
  return (
    <div className="bg-white border border-[#E2E2E2] rounded-2xl shadow-md px-5 py-4 min-h-[160px] text-right">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <img
            src={item.avatarUrl || "/images/default-profile.png"}
            alt={item.sender}
            className="w-8 h-8 rounded-full border border-gray-300 object-cover"
          />
          <p className="text-[#1f1f75] font-semibold">{item.sender}</p>
        </div>

        <div className="flex text-yellow-400">
          {[...Array(3)].map((_, idx) => (
            <Star
              key={idx}
              size={18}
              fill={idx + 1 <= (item.avg || 0) ? "#FFB400" : "none"}
              stroke="#FFB400"
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-[#1f1f75]">{item.text}</p>
    </div>
  );
}
