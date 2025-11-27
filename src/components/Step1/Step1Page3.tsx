import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Target } from "lucide-react";

export default function Step1Page3() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [challengeText, setChallengeText] = useState("");

  // נתוני דמה — רשימת משימות לפי מספר קבוצה
  const challenges = {
    1: "כאן יהיה טקסט מותאם אישית לכל פעילות בהתאם לקבוצה",
    2: "כאן יהיה טקסט מותאם אישית לכל פעילות בהתאם לקבוצה",
    3: "כאן יהיה טקסט מותאם אישית לכל פעילות בהתאם לקבוצה",
    4: "כאן יהיה טקסט מותאם אישית לכל פעילות בהתאם לקבוצה",
    9: "כאן יהיה טקסט מותאם אישית לכל פעילות בהתאם לקבוצה",
  };

  useEffect(() => {
    // ניקח את הקבוצה של המשתמש או נשתמש בברירת מחדל
    const groupId = user?.groupId || 1;
    const text = challenges[groupId] || "לא נמצאה משימה מתאימה 😅";
    setChallengeText(text);
  }, [user]);

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-center relative overflow-hidden rtl text-gray-800 rounded-3xl">
  

      <div className="text-center mb-10 mt-10">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75]">
          שלום קבוצה מס׳ {user?.groupId || "1"}
        </h1>
        <p className="text-lg mt-2">יש לנו משימה מאתגרת עבורכן!</p>
      </div>

      <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-8 w-[90%] max-w-2xl text-center mb-12">
        <h2 className="text-xl font-semibold text-[#1f1f75] flex items-center justify-center gap-2 mb-4">
          <Target size={22} className="text-[#1f1f75]" />
          היעד שלכן הוא
        </h2>

        <div className="bg-[#ecf8ff] rounded-xl border border-[#c9e8ff] p-6 text-gray-700 leading-relaxed text-md">
          {challengeText}
        </div>
      </div>

      <button
        onClick={() => navigate("/step1Page4")}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 
             z-50 px-10 py-3 bg-[#1f1f75] text-white rounded-full 
             text-xl font-semibold hover:bg-[#2a2aa2] 
             transition flex items-center gap-2"
      >
        מתחילים!!!
        <ChevronLeft size={22} className="text-white" />
      </button>
    </div>
  );
}
