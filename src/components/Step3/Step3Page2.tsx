import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, Image, FileText, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { useUser } from "../../context/UserContext";

interface Card {
  id: number;
  title: string;
  image: string;
}

export default function Step3Page2() {
  const navigate = useNavigate();
  const { user } = useUser();
  const username = user?.name || "משתמשת";
  const groupId = user?.groupId || 1;
  const room = `group-${groupId}`;
  const { messages, sendMessage } = useChat(room, username);

  const [activeTab, setActiveTab] = useState("ראיונות");
  const [page, setPage] = useState(1);
  const [progress, setProgress] = useState(40);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // 🕒 זמן כולל לשלב — שעה אחת (בשניות)
  const DURATION = 60 * 60;

  // 💬 כשנכנסים לעמוד: נבדוק אם יש טיימר קבוצתי
  useEffect(() => {
    const saved = localStorage.getItem(`timer_start_${room}`);

    if (saved) {
      setStartTime(Number(saved)); // יש טיימר קיים
    } else {
      const now = Date.now();
      localStorage.setItem(`timer_start_${room}`, now.toString());
      setStartTime(now);
      sendMessage(`[timer-start] ${now}`);
    }
  }, [room]);

  // 📩 קבלת טיימר מקבוצת הצ׳אט
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.content.startsWith("[timer-start]")) {
        const t = Number(msg.content.replace("[timer-start]", "").trim());
        if (!startTime) {
          localStorage.setItem(`timer_start_${room}`, t.toString());
          setStartTime(t);
        }
      }
    });
  }, [messages]);

  // ⏱️ ספירה לאחור
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, DURATION - elapsed);
      setTime(remaining);

      // כשמגיע לאפס → מעבר אוטומטי
      if (remaining === 0) {
        clearInterval(interval);
        navigate("/step3Page3");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, navigate]);

  // ⌛ פונקציה לעיצוב זמן
  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const tabs = [
    { name: "ראיונות", color: "bg-[#E6F9FF]", icon: <MessageCircle size={24} color="#00BCD4" /> },
    { name: "תמונות", color: "bg-[#F8ECFF]", icon: <Image size={24} color="#B047E6" /> },
    { name: "מאמרים ומצגות", color: "bg-[#E8FFF3]", icon: <FileText size={24} color="#00A676" /> },
    { name: "סרטונים", color: "bg-[#F2EFFF]", icon: <Video size={24} color="#6B5DD3" /> },
  ];

  const mockCards: Card[] = [
    { id: 1, title: "שם התמונה", image: "/images/example1.jpg" },
    { id: 2, title: "שם התמונה", image: "/images/example2.jpg" },
    { id: 3, title: "שם התמונה", image: "/images/example3.jpg" },
    { id: 4, title: "שם התמונה", image: "/images/example4.jpg" },
    { id: 5, title: "שם התמונה", image: "/images/example5.jpg" },
    { id: 6, title: "שם התמונה", image: "/images/example6.jpg" },
  ];

  return (
    <div
      dir="rtl"
      className="relative min-h-[calc(100%-3rem)] bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center overflow-y-auto"
    >
      {/* טיימר */}
      <div className="w-full flex justify-between items-start">
        <div className="flex flex-col items-start">
          <div className="bg-[#1f1f75] text-white px-6 py-2 rounded-lg text-xl font-bold shadow-md">
            {formatTime(time)}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            עבדתם עד כה על {progress}% מהחומר
          </p>
        </div>
      </div>

      {/* תוכן */}
      <div className="text-center mt-5">
        <h1 className="text-2xl font-bold text-[#1f1f75] mb-2">
          בדרך לפתרון מקצועי ויעיל, חפשו במקורות מידע הבאים תוכן מתאים.
        </h1>
        <p className="text-gray-600 text-lg">
          שמנה לב, איסוף המידע ע"י בנות הקבוצה מוגבל בזמן, מומלץ לפזר את איסוף המידע
          באופן מושכל בין בנות הקבוצה.
        </p>
      </div>

      {/* טאבים */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        {tabs.map((t) => (
          <button
            key={t.name}
            onClick={() => setActiveTab(t.name)}
            className={`flex flex-col items-center justify-center w-[200px] h-[100px] rounded-2xl transition shadow-sm ${activeTab === t.name
                ? `${t.color} border-b-4 border-[#1f1f75]`
                : `${t.color} opacity-70 hover:opacity-100`
              }`}
          >
            {t.icon}
            <p className="text-[#1f1f75] font-semibold text-lg mt-2">{t.name}</p>
          </button>
        ))}
      </div>

      {/* גלריה */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full max-w-6xl">
        {mockCards.map((card) => (
          <div
            key={card.id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <img src={card.image} alt={card.title} className="w-full h-40 object-cover" />
            <div className="p-3 text-right">
              <p className="text-[#1f1f75] font-semibold text-sm">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* עמודים */}
      <div className="flex justify-center items-center gap-2 mt-10 mb-24">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="bg-[#1f1f75] text-white w-10 h-10 flex justify-center items-center rounded-md hover:bg-[#14125f]"
        >
          <ChevronRight size={20} />
        </button>
        <span className="bg-gray-100 text-[#1f1f75] px-4 py-2 rounded-md font-semibold">
          {page}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="bg-[#1f1f75] text-white w-10 h-10 flex justify-center items-center rounded-md hover:bg-[#14125f]"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      {/* כפתור המשך */}
      <button
        onClick={() => navigate("/step3Page3")}
        className="mt-12 px-10 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold hover:bg-[#14125f] transition flex items-center gap-2"
      >
        לשלב הבא
        <ChevronLeft size={22} />
      </button>
    </div>
  );
}
