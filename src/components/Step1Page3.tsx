import React from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Target } from "lucide-react";

export default function Step1Page3() {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-center relative overflow-hidden rtl text-gray-800 rounded-3xl shadow-lg">
      {/* לוגואים */}
      <img
        src="/images/pituachlogo.png"
        alt="פיתוח"
        className="absolute top-6 left-8 w-32 object-contain"
      />
      <img
        src="/images/ladaatlogo.png"
        alt="לדעת חכמה"
        className="absolute top-6 right-8 w-32 object-contain"
      />

      {/* כותרת עליונה */}
      <div className="text-center mb-10 mt-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75]">
          שלום קבוצה מס׳ {user?.groupId || "1"}
        </h1>
        <p className="text-lg mt-2">יש לנו משימה מאתגרת עבורכן!</p>
      </div>

      {/* כרטיס תוכן */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-8 w-[90%] max-w-2xl text-center mb-12">
        <h2 className="text-xl font-semibold text-[#1f1f75] flex items-center justify-center gap-2 mb-4">
          <Target size={22} className="text-[#1f1f75]" />
          היעד שלכן הוא
        </h2>

        <div className="bg-[#ecf8ff] rounded-xl border border-[#c9e8ff] p-6 text-gray-700 leading-relaxed text-md">
          כאן יהיה טקסט מותאם אישי לכל פעילות בהתאם לצורך.
          <br />
          לדוגמה: הכנת פינת למידה מתחלפת למקצוע מסוים בכיתה מסוימת.
          <br />
          בהגדרה מראש לכל הקבוצות או לכל קבוצה בנפרד חובה לפרט שכבות גיל,
          אופציונלי מחיר, תוצר סופי וכו׳.
        </div>
      </div>

      {/* כפתור המשך */}
      <button
        onClick={() => navigate("/step-2")}
        className="mt-6 px-10 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold hover:bg-[#2a2aa2] transition flex items-center gap-2"
      >
        מתחילים!!!
        <ChevronLeft size={22} className="text-white" />
      </button>
    </div>
  );
}
