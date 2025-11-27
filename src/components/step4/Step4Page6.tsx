// src/pages/step4/Step4Page6.tsx
import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

interface TopIdea {
  ideaId: number;
  ownerId?: number;
  text: string;
  avatar?: string;
  totalScore: number;
  averageScore?: number;
  votesCount?: number;
}

export default function Step4Page6() {
  const { user } = useUser();
  const navigate = useNavigate();

  const groupId = user?.groupId || 1;

  const [topIdeas, setTopIdeas] = useState<TopIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopIdeas() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/ideas/top/${groupId}?limit=3`
        );
        const data = await res.json();

        const list: TopIdea[] = (data as any[]).map((item) => ({
          ideaId: item.ideaId,
          ownerId: item.ownerId,
          text: item.text || "",
          avatar: item.avatar || "/images/default-profile.png",
          totalScore: item.totalScore ?? 0,
          averageScore: item.averageScore,
          votesCount: item.votesCount,
        }));

        list.sort((a, b) => b.totalScore - a.totalScore);
        setTopIdeas(list);
      } catch (err) {
        console.error("❌ שגיאה בשליפת הרעיונות המובילים:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopIdeas();
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[90vh] text-[#1f1f75]">
        טוען את הרעיונות המובילים...
      </div>
    );
  }

  const goNext = () => {
    navigate("/step4Page7"); // אם יש שלב כזה אצלך
  };

  // מרפדים ל־3 עמודות
  const paddedIdeas = [...topIdeas];
  while (paddedIdeas.length < 3) {
    paddedIdeas.push({
      ideaId: -1,
      text: "",
      totalScore: 0,
    });
  }

  return (
    <div
      dir="rtl"
      className="min-h-[93vh] bg-white rounded-3xl shadow-lg px-10 py-10 flex flex-col items-center justify-between"
    >
      <div className="w-full max-w-6xl flex flex-col items-center">
        <h1 className="text-2xl font-bold text-[#1f1f75] mb-2">
          הרעיונות המובילים
        </h1>
        <p className="text-gray-700 mb-10">
          ההצעות שקיבלו את מירב הנקודות מכל חברות הקבוצה
        </p>

        <div className="flex flex-col md:flex-row items-end justify-center gap-6 w-full mt-4">
          <PodiumCard idea={paddedIdeas[2]} place={3} color="pink" className="md:mt-12" />
          <PodiumCard
            idea={paddedIdeas[0]}
            place={1}
            color="purple"
            className="md:mt-0 scale-105"
            highlight
          />
          <PodiumCard idea={paddedIdeas[1]} place={2} color="green" className="md:mt-8" />
        </div>
      </div>

      <button
        onClick={goNext}
        className="mt-10 px-12 py-3 rounded-full text-xl font-semibold flex items-center gap-2 bg-[#1f1f75] text-white hover:bg-[#14125f] transition"
      >
        לשלב הבא
        <ChevronLeft size={22} />
      </button>
    </div>
  );
}

function PodiumCard({
  idea,
  place,
  color,
  highlight,
  className = "",
}: {
  idea: TopIdea;
  place: number;
  color: "pink" | "purple" | "green";
  highlight?: boolean;
  className?: string;
}) {
  const bg =
    color === "pink"
      ? "bg-[#FDE9FF]"
      : color === "green"
      ? "bg-[#E6FFF1]"
      : "bg-[#F3EDFF]";

  const avatarBg =
    color === "pink"
      ? "bg-[#FAD1FF]"
      : color === "green"
      ? "bg-[#CCF4DF]"
      : "bg-[#DED1FF]";

  return (
    <div
      className={`relative flex-1 max-w-xs ${className} ${
        highlight ? "shadow-xl" : ""
      }`}
    >
      <div className="absolute -top-10 left-1/2 -translate-x-1/2">
        <div
          className={`w-20 h-20 rounded-full ${avatarBg} flex items-center justify-center border-4 border-white shadow-md overflow-hidden`}
        >
          {idea.avatar ? (
            <img
              src={idea.avatar}
              alt={idea.text}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl text-[#1f1f75]">👩</span>
          )}
        </div>
      </div>

      <div
        className={`${bg} rounded-3xl pt-14 pb-8 px-8 text-center flex flex-col items-center`}
      >
        <p className="text-sm text-gray-500 mb-1">
          {place === 1
            ? "מקום ראשון"
            : place === 2
            ? "מקום שני"
            : "מקום שלישי"}
        </p>

        {/* טקסט הרעיון */}
        {idea.text && (
          <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
            {idea.text}
          </p>
        )}

        {/* נתונים מספריים */}
        {idea.totalScore > 0 && (
          <div className="text-xs text-gray-600 space-y-1 mt-2">
            <p>סה״כ נקודות: {idea.totalScore}</p>
            {idea.averageScore != null && (
              <p>דירוג ממוצע: {idea.averageScore.toFixed(1)}</p>
            )}
            {idea.votesCount != null && (
              <p>מספר מדרגות: {idea.votesCount}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
