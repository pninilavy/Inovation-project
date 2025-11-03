
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import AppContainer from "../components/AppContainer";
import { resetLocalData } from "../hooks/useResetLocalData";

export default function Welcome() {
  const [current, setCurrent] = useState(2);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agree, setAgree] = useState(false);
  const { setUser } = useUser();
  const navigate = useNavigate();

  // תמונות פרופיל
  const profileImages = [
    "/images/profile1.png",
    "/images/profile2.png",
    "/images/profile3.png",
    "/images/profile4.png",
    "/images/profile5.png",
    "/images/profile6.png",
    "/images/profile7.png",
    "/images/profile8.png",
    "/images/profile9.png",
    "/images/profile10.png",
    "/images/profile11.png",
    "/images/profile12.png",
    "/images/profile13.png",
    "/images/profile14.png",
    "/images/profile15.png",
    "/images/profile16.png",
  ];

  const total = profileImages.length;

  // פונקציות מעבר
  const next = () => setCurrent((c) => (c + 1) % total);
  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  // חמש התמונות שמוצגות
  const getVisibleImages = () => {
    const visible = [];
    for (let offset = -2; offset <= 2; offset++) {
      visible.push(profileImages[(current + offset + total) % total]);
    }
    return visible;
  };
  const handleEnter = async () => {
    if (!agree || !name) return alert("אנא מלאי שם ואשרי את ההשתתפות 🙂");
  
    const response = await fetch("http://localhost:8080/api/students/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: name,
        lastName: lastName,
        tabletId: Math.floor(Math.random() * 10) + 1,
        avatarUrl: profileImages[current],
      }),
    });
  
    const savedStudent = await response.json();
    const groupId = savedStudent.groupId;
  
    // 🔹 נבדוק אם יש כבר נתונים לקבוצה הזו בלוקאלסטורג'
    const existingKeys = Object.keys(localStorage).filter((k) =>
      k.includes(`group-${groupId}`)
    );
  
    if (existingKeys.length === 0) {
      // אין שום מפתח קודם ⇒ זו הקבוצה החדשה
      console.log("🧹 קבוצה חדשה — מבצעת איפוס");
      resetLocalData(groupId);
    } else {
      console.log("➡️ נתונים קיימים — מדלגת על איפוס");
    }
  
    // ממשיכים רגיל
    setUser({
      name: `${savedStudent.firstName} ${savedStudent.lastName}`,
      avatar: savedStudent.avatarUrl,
      groupId,
    });
  
    navigate("/group");
  };
  

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

      {/* כותרת */}
      <h1 className="text-3xl md:text-4xl font-bold text-[#1f1f75] mb-2">
        ברוכה הבאה לחדר חדשנות!
      </h1>
      <p className="text-lg mb-8">בחרי את האיור שהכי קרוב לתמונת הפרופיל שלך</p>

      {/* קרוסלה */}
      <div className="relative flex items-center justify-center mb-10 w-full max-w-4xl">
        <button
          onClick={prev}
          className="absolute right-0 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition z-30"
        >
          <ChevronRight size={22} className="text-[#3B2DBB]" />
        </button>

        <div className="flex justify-center items-center gap-8 overflow-hidden w-full h-56">
          {getVisibleImages().map((src, i) => {
            const isCenter = i === 2;
            return (
              <img
                key={i}
                src={src}
                alt={`profile-${i}`}
                className={`transition-all duration-500 ease-in-out rounded-full border-4 object-contain ${
                  isCenter
                    ? "w-32 h-32 scale-125 border-[#3B2DBB] shadow-[0_0_15px_rgba(59,45,187,0.4)]"
                    : "w-24 h-24 border-transparent opacity-80"
                }`}
              />
            );
          })}
        </div>

        <button
          onClick={next}
          className="absolute left-0 bg-white shadow-md rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition z-30"
        >
          <ChevronLeft size={22} className="text-[#3B2DBB]" />
        </button>
      </div>

      {/* טופס */}
      <div className="w-full max-w-md flex flex-col gap-4 items-center">
        <input
          type="text"
          placeholder="השם שלך?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-center border border-gray-300 rounded-xl py-3 text-lg outline-none focus:ring-2 focus:ring-[#3B2DBB]"
        />
        <input
          type="text"
          placeholder="שם משפחה"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full text-center border border-gray-300 rounded-xl py-3 text-lg outline-none focus:ring-2 focus:ring-[#3B2DBB]"
        />

        <label className="flex items-center justify-center gap-2 text-sm text-gray-700 mt-2">
          <input
            type="checkbox"
            className="accent-[#3B2DBB]"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          אשמח לקחת חלק במשימה, אני מוכנה להתחיל!
        </label>

        <button
          onClick={handleEnter}
          className="mt-6 px-10 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold hover:bg-[#2a2aa2] transition flex items-center gap-2"
        >
          כניסה לחדר
          <ChevronLeft size={22} className="text-white" />
        </button>
      </div>
    </div>
  );
}
