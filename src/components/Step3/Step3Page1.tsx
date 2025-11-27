import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Step3Page1() {
  const navigate = useNavigate();

  const sources = [
    {
      title: "ראיונות",
      text: "בעלות מקצוע משפחות בכל הסודות שצריך לדעת",
      color: "bg-[#E6F9FF]",
      icon: "💬",
    },
    {
      title: "תמונות",
      text: "דוגמאות ממוצרים בשטח",
      color: "bg-[#F8ECFF]",
      icon: "🖼️",
    },
    {
      title: "מאמרים ומצגות",
      text: "מידע מקצועי מעובד ומתומצת",
      color: "bg-[#E8FFF3]",
      icon: "📄",
    },
    {
      title: "סרטונים",
      text: "כלים פרקטיים וטיפים שימושיים",
      color: "bg-[#F2EFFF]",
      icon: "🎥",
    },
  ];

  return (
    <div
      dir="rtl"
      className="min-h-[calc(100%-3rem)] bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center justify-between overflow-y-auto"
    >
      {/* טיימר בחלק העליון */}
      <div className="w-full flex justify-start">
        <div className="bg-[#1f1f75] text-white px-6 py-2 rounded-lg text-lg font-bold shadow-md">
          00:00:00
        </div>
      </div>

      {/* טקסט כותרת */}
      <div className="text-center max-w-3xl mt-4">
        <h1 className="text-2xl font-bold text-[#1f1f75] mb-3">
          בדרך לפתרון מקצועי ויעיל, חפשו במקורות מידע הבאים תוכן מתאים.
        </h1>
        <p className="text-gray-600 text-lg">
          שמנה לב, איסוף המידע ע"י בנות הקבוצה מוגבל בזמן, מומלץ לפזר את איסוף המידע
          באופן מושכל בין בנות הקבוצה.
        </p>
      </div>

      {/* הכרטיסים */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 w-full max-w-6xl">
        {sources.map((s, idx) => (
          <div
            key={idx}
            className={`${s.color} rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition`}
          >
            <div className="text-4xl mb-3">{s.icon}</div>
            <h3 className="text-xl font-bold text-[#1f1f75] mb-2">{s.title}</h3>
            <p className="text-gray-700 text-center text-sm leading-snug">
              {s.text}
            </p>
          </div>
        ))}
      </div>

      {/* כפתור המשך */}
      <button
        onClick={() => navigate("/step3Page2")}
        className="mt-12 px-10 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold hover:bg-[#14125f] transition flex items-center gap-2"
      >
        לשלב הבא
        <ChevronLeft size={22} />
      </button>
    </div>
  );
}
