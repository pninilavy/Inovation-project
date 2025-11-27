import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { useUser } from "../../context/UserContext";

interface ResponseItem {
  user: string;
  text: string;
  avatar?: string;
}

export default function Step3Page3() {
  const navigate = useNavigate();
  const { user } = useUser();
  const username = user?.name || "משתמשת";
  const avatar = user?.avatar || "/images/default-profile.png";
  const groupId = user?.groupId || 1;
  const room = `group-${groupId}`;
  const { messages, sendMessage } = useChat(room, username);

  const [input, setInput] = useState("");
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [hasShared, setHasShared] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // --- טעינת חברות הקבוצה ---
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`http://localhost:8080/api/groups/${groupId}/members`);
        const data = await res.json();
        const names = data.map((m: any) => `${m.firstName} ${m.lastName}`);
        setMembers(names);
      } catch (err) {
        console.error("שגיאה בשליפת חברות הקבוצה:", err);
      } finally {
        setLoadingMembers(false);
      }
    }
    fetchMembers();
  }, [groupId]);

  // --- שליחת תגובה ---
  const handleShare = () => {
    if (!input.trim()) return;
    const msg = { user: username, text: input.trim(), avatar };
    sendMessage(`[group-response] ${JSON.stringify(msg)}`);
    setInput("");
    setHasShared(true);

    const saved = JSON.parse(localStorage.getItem(`step3_responses_${room}`) || "[]");
    localStorage.setItem(`step3_responses_${room}`, JSON.stringify([...saved, msg]));
  };

  // --- קליטת הודעות ---
  useEffect(() => {
    messages.forEach((m) => {
      if (m.content.startsWith("[group-response]")) {
        const data = JSON.parse(m.content.replace("[group-response]", "").trim());
        setResponses((prev) => {
          if (prev.find((r) => r.user === data.user)) return prev;
          return [...prev, data];
        });
      }
    });
  }, [messages]);

  // --- שליפה מקומית ---
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`step3_responses_${room}`) || "[]");
    setResponses(saved);
  }, [room]);

  const allShared = !loadingMembers && members.length > 0 && responses.length >= members.length;

  const handleNext = () => {
    if (allShared) {
      navigate("/step4Page1");
    }
  };

  if (loadingMembers)
    return <div className="text-center text-[#1f1f75] mt-20">טוען את חברות הקבוצה...</div>;
  return (
    <div
      dir="rtl"
      className="min-h-full md:h-screen bg-white rounded-3xl shadow-lg p-10 flex flex-col justify-between items-center overflow-hidden"
      >
      {/* תוכן עליון */}
      <div className="flex-1 w-full flex flex-col items-center">
        {/* מלבן עליון ורוד */}
        <div className="bg-[#F8ECFF] rounded-2xl p-6 w-full max-w-5xl relative flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-lg font-bold text-[#1f1f75]">
              לאחר העיון במקורות השונים, סכמי במשפט קצר מה למדת או נתרמת מהקריאה / הצפייה?
            </h1>
            <button
              onClick={handleShare}
              disabled={hasShared || !input.trim()}
              className={`px-5 py-2 rounded-full text-white font-semibold transition text-sm ${
                hasShared
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#DF57FF] hover:bg-[#c93fe9]"
              }`}
            >
              {hasShared ? "נשלח בהצלחה" : "שיתוף התגובה שלי עם הקבוצה >"}
            </button>
          </div>
  
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="המשפט שלי (מקום לכתוב חופשי)"
            className="w-full border border-[#E0C4FF] rounded-xl p-3 text-[#1f1f75] resize-none h-20 focus:outline-none"
            disabled={hasShared}
          />
        </div>
  
        {/* תגובות אמיתיות בלבד */}
        {responses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-5xl">
            {responses.map((r, i) => (
              <div
                key={i}
                className="bg-white border border-[#E2E2E2] rounded-2xl shadow-sm p-5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={r.avatar || "/images/default-profile.png"}
                    alt={r.user}
                    className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                  />
                  <p className="text-[#1f1f75] font-semibold text-sm">{r.user}</p>
                </div>
                <p className="text-[#1f1f75] text-sm leading-snug min-h-[40px]">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
  
      {/* אזור תחתון – קבוע בתחתית */}
      <div className="w-full flex flex-col items-center mt-12">
        {/* פס ירוק */}
        <div className="bg-[#E0F6E9] text-green-700 px-10 py-3 rounded-full text-center font-medium w-full max-w-5xl mb-4">
          המלצה: שתפי את חברותייך בתגובה ובהמשך קיימנה שיח על ההסכמות.
        </div>
  
        {/* הודעת התקדמות */}
        {!allShared && (
          <p className="text-[#1f1f75] mb-4 text-center text-lg">
            ⏳ לא ניתן להתקדם —{" "}
            {members.find((m) => !responses.find((r) => r.user === m)) ||
              "יש חברות שעדיין לא שיתפו"}{" "}
            עדיין לא שיתפה בתגובה שלה.
          </p>
        )}
  
        {/* כפתור לשלב הבא */}
        <button
          onClick={handleNext}
          disabled={!allShared}
          className={`px-10 py-3 rounded-full text-xl font-semibold transition flex items-center gap-2 ${
            allShared
              ? "bg-[#1f1f75] text-white hover:bg-[#14125f]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          לשלב הבא
          <ChevronLeft size={22} />
        </button>
      </div>
    </div>
  );
  
}
