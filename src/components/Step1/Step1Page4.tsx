
import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";

export default function Step1Page4() {
  const { user } = useUser();
  const navigate = useNavigate();

  const username = user?.name || "משתמשת";
  const room = `group-${user?.groupId || 1}`;

  const { sendMessage, connected, allReady, sendProgress } = useChat(room, username);

  const [current, setCurrent] = useState("");
  const [desired, setDesired] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (allReady) {
      alert("🎉 כל הקבוצה מוכנה! אפשר לעבור לשלב הבא!");
      navigate("/Step1Page5");
    }
  }, [allReady, navigate]);

  const handleShare = async () => {
    if (!current.trim() || !desired.trim())
      return alert("נא למלא את שני השדות לפני השיתוף 🙂");

    if (!connected) return alert("החיבור לשרת לא פעיל כרגע.");

    setSending(true);
    if (current.trim()) sendMessage(`[מצוי] ${current}`);
    if (desired.trim()) sendMessage(`[רצוי] ${desired}`);

    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    setSent(true);
    navigate("/Step1Page5")
  };

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-center rounded-3xl px-4">
      <div className="w-full max-w-5xl text-center mt-16">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-2">
          שלום {username}
        </h1>
        <p className="text-lg mb-10 text-gray-700">נשמח לשמוע את דעתך על האתגר</p>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-12">
          <TextareaBlock
            title="האם קיים תוצר או מענה מתאים בסביבתך?"
            value={current}
            onChange={setCurrent}
            placeholder="תארי בכמה מילים כיצד נראה תוצר זה"
            color="blue"
          />
          <TextareaBlock
            title="מה היית מציעה להוסיף או לשלב בתוצר מסוג זה?"
            value={desired}
            onChange={setDesired}
            placeholder="תארי בכמה מילים כיצד לדעתך יראה תוצר מסוג זה באופן מיטבי"
            color="purple"
          />
        </div>

        {!sent ? (
          <button
            onClick={handleShare}
            disabled={sending}
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 
             z-50 px-10 py-3 bg-[#1f1f75] text-white rounded-full 
             text-xl font-semibold hover:bg-[#2a2aa2] 
             transition flex items-center gap-2' ${sending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#1f1f75] text-white hover:bg-[#2a2aa2]"
              }`}
          >
            {sending ? "שולח..." : "לשלב הבא"}
            {!sending && <ChevronLeft size={22} className="inline ml-2" />}
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-xl text-[#1f1f75] font-semibold mb-4">
              ✅ ההודעה נשלחה לקבוצה!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TextareaBlock({
  title,
  value,
  onChange,
  placeholder,
  color,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  color: "blue" | "purple";
}) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#e7f9ff]", border: "border-[#baeaff]" }
      : { bg: "bg-[#f6f2ff]", border: "border-[#e0d4ff]" };

  return (
    <div
      className={`flex-1 ${colors.bg} border ${colors.border} rounded-2xl p-6 text-right`}
    >
      <h2 className="text-lg font-semibold text-[#1f1f75] mb-3">{title}</h2>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={200}
        className="w-full min-h-[120px] rounded-xl p-3 border border-gray-200 focus:ring-2 focus:ring-indigo-200 text-gray-700 resize-none"
      />
    </div>
  );
}
