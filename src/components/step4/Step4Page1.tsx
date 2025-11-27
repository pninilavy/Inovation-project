// src/pages/step4/Step4Page1.tsx
import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { useUser } from "../../context/UserContext";

const STEP4_PREFIX = "[step4-response]";

export default function Step4Page1() {
  const { user } = useUser();
  const navigate = useNavigate();

  console.log("🔍 Step4Page1 — user מהקונטקסט:", user);

  if (!user) {
    console.warn("⚠️ user עדיין NULL בשלב Step4Page1!");
  }

  if (!user) {
    return (
      <div className="text-center mt-20 text-[#1f1f75]">
        טוען משתמש...
      </div>
    );
  }

  const username = user.name;
  const userId = user.id;
  const avatar = user.avatar || "/images/default-profile.png";
  const groupId = user.groupId;
  const room = `group-${groupId}`;


  const { sendMessage, connected } = useChat(room, username);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`step4_myIdea_${room}_${userId}`);
    if (saved) {
      setInput(saved);
      setSent(true);
    }
  }, [room, userId]);

  const handleShare = async () => {
    const text = input.trim();
    if (!text) {
      alert("נא לכתוב רעיון לפני השיתוף 🙂");
      return;
    }
    if (!connected) {
      alert("החיבור לשרת לא פעיל כרגע, נסי שוב בעוד רגע.");
      return;
    }
    if (!userId) {
      alert("לא נמצא מזהה משתמש. בדקי את ההתחברות.");
      return;
    }

    try {
      setSending(true);

      // 1️⃣ שומרים את הרעיון ב־DB
      const res = await fetch("http://localhost:8080/api/ideas/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          ownerId: userId,
          text,
          avatar,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save idea");
      }

      const idea = await res.json(); // מחזיר את ה־Idea שנשמר

      // 2️⃣ שולחים לצ'אט הודעה מיוחדת לשלב 4
      const msg = {
        ideaId: idea.id,
        ownerId: idea.ownerId,
        user: username,
        text,
        avatar,
      };

      sendMessage(`${STEP4_PREFIX} ${JSON.stringify(msg)}`);

      // 3️⃣ שומרים בלוקאלסטורג׳ כדי לזכור ששלחנו
      localStorage.setItem(`step4_myIdea_${room}_${userId}`, text);

      setSent(true);
    } catch (err) {
      console.error("❌ שגיאה בשמירת הרעיון:", err);
      alert("הייתה שגיאה בשמירת הרעיון. נסי שוב 🙂");
    } finally {
      setSending(false);
    }
  };

  const handleNext = () => {
    if (!sent) return;
    navigate("/step4Page2");
  };

  return (
    <div
      dir="rtl"
      className="min-h-full bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center justify-between"
    >
      <div className="flex flex-col items-center text-center max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-[#1f1f75] mb-6">
          מרעיון לביצוע
        </h1>

        <div className="bg-[#E9FAFF] rounded-2xl p-6 w-full text-[#1f1f75]">
          <p className="mb-4">
            בהשראת הדיונים הקבוצתיים ועיון בחומרים – הציעי רעיון שלך למוצר
            מיטיב. תוכלי להשתמש בידע ממקורות קיימים או ברעיונות חדשים ומקוריים.
          </p>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="אפשרות להקליד עד 20 מילים..."
            className={`w-full border border-[#B3E4F3] rounded-xl p-3 text-[#1f1f75] resize-none h-24 focus:outline-none ${sent ? "bg-gray-100 text-gray-500" : "bg-white"
              }`}
            maxLength={140}
            disabled={sent}
          />
        </div>

        {!sent && (
          <button
            onClick={handleShare}
            disabled={sending}
            className={`mt-6 px-10 py-3 rounded-full text-xl font-semibold flex items-center gap-2 transition ${sending
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#1f1f75] text-white hover:bg-[#14125f]"
              }`}
          >
            {sending ? "שולחת..." : "שיתוף הרעיון שלי"}
            {!sending && <ChevronLeft size={22} />}
          </button>
        )}

        {sent && (
          <p className="mt-4 text-[#1f1f75] font-semibold">
            ✅ הרעיון שלך נשלח לקבוצה!
          </p>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!sent}
        className={`mt-8 px-10 py-3 rounded-full text-xl font-semibold flex items-center gap-2 transition ${sent
            ? "bg-[#1f1f75] text-white hover:bg-[#14125f]"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
      >
        לשלב הבא
        <ChevronLeft size={22} />
      </button>
    </div>
  );
}
