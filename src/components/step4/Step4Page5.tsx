// src/pages/step4/Step4Page5.tsx
import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";

interface IdeaForRating {
  ideaId: number;
  ownerId: number;
  user: string;
  text: string;
  avatar?: string;
}

const STEP4_PREFIX = "[step4-response]";

export default function Step4Page5() {
  const { user } = useUser();
  const navigate = useNavigate();

  const username = user?.name || "";
  const raterId = user?.id || 0;
  const groupId = user?.groupId || 1;
  const room = `group-${groupId}`;

  const { messages } = useChat(room, username);

  const [ideas, setIdeas] = useState<IdeaForRating[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  // שליפת רעיונות מהצ'אט
  useEffect(() => {
    if (!messages?.length) return;

    const byIdeaId = new Map<number, IdeaForRating>();

    messages.forEach((m) => {
      if (!m.content.startsWith(STEP4_PREFIX)) return;

      const clean = m.content.replace(STEP4_PREFIX, "").trim();

      try {
        const obj = JSON.parse(clean);

        if (typeof obj.ideaId !== "number") return;

        if (!byIdeaId.has(obj.ideaId)) {
          byIdeaId.set(obj.ideaId, {
            ideaId: obj.ideaId,
            ownerId: obj.ownerId ?? 0,
            user: obj.user || m.username,
            text: obj.text || "",
            avatar: obj.avatar || "/images/default-profile.png",
          });
        }
      } catch (e) {
        console.log("Bad JSON idea:", clean);
      }
    });

    const collected = Array.from(byIdeaId.values());
    setIdeas(collected);

    setScores((prev) => {
      const copy = { ...prev };
      collected.forEach((i) => {
        if (!copy[i.ideaId]) copy[i.ideaId] = 1;
      });
      return copy;
    });
  }, [messages]);

  const canGoNext = ideas.length > 0;

  const changeScore = (ideaId: number, delta: number) => {
    setScores((prev) => {
      let next = (prev[ideaId] ?? 1) + delta;
      if (next < 1) next = 1;
      if (next > 10) next = 10;
      return { ...prev, [ideaId]: next };
    });
  };

  const handleNext = async () => {
    if (!canGoNext || !raterId) return;

    try {
      setSaving(true);

      await fetch("http://localhost:8080/api/ideas/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raterId,
          groupId,
          ratings: ideas.map((i) => ({
            ideaId: i.ideaId,
            score: scores[i.ideaId],
          })),
        }),
      });

      navigate("/step4Page6");
    } catch (e) {
      console.error("❌ שגיאה בשמירת הדירוג:", e);
      alert("שגיאה בשמירת הדירוג. נסי שוב 🙂");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="p-10 min-h-[93vh] flex flex-col items-center justify-between bg-white rounded-3xl shadow-lg"
    >
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-[#1f1f75] mb-8 text-center">
          נקדי את הרעיונות של חברות הקבוצה:
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.ideaId}
              idea={idea}
              score={scores[idea.ideaId] ?? 1}
              onChangeScore={(d) => changeScore(idea.ideaId, d)}
            />
          ))}
        </div>
      </div>

      <button
        disabled={!canGoNext || saving}
        onClick={handleNext}
        className={`mt-10 px-12 py-3 text-xl font-semibold rounded-full flex items-center gap-2 transition ${
          !canGoNext || saving
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#1f1f75] text-white hover:bg-[#14125f]"
        }`}
      >
        לשלב הבא
        <ChevronLeft size={24} />
      </button>
    </div>
  );
}

function IdeaCard({
  idea,
  score,
  onChangeScore,
}: {
  idea: IdeaForRating;
  score: number;
  onChangeScore: (delta: number) => void;
}) {
  return (
    <div className="bg-white shadow rounded-2xl p-5 border border-gray-200">
      <div className="flex items-center gap-3">
        <img
          src={idea.avatar}
          alt={idea.user}
          className="w-10 h-10 rounded-full border object-cover"
        />
        <span className="font-bold text-[#1f1f75]">{idea.user}</span>
      </div>

      <p className="mt-3 text-sm text-gray-600">{idea.text}</p>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => onChangeScore(-1)}
          className="w-8 h-8 border rounded"
        >
          –
        </button>
        <div className="w-12 text-center font-bold">{score}</div>
        <button
          onClick={() => onChangeScore(1)}
          className="w-8 h-8 border rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}
