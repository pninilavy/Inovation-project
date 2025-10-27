
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

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

  const handleEnter = () => {
    if (!agree || !name) return alert("אנא מלאי שם ואשרי את ההשתתפות 🙂");

    // כרגע נקבע groupId/groupName מדומים — בהמשך זה יבוא מהשרת
      setUser({
        name: `${name} ${lastName}`,
        avatar: profileImages[current],
        groupId: 9, // ← ערך מדומה (לדוגמה)
      });

    navigate("/group");
  };

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-center relative overflow-hidden rtl text-gray-800  ">
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
