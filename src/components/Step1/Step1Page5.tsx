
// import React from "react";
// import { useUser } from "../../context/UserContext";
// import { useChat } from "../../hooks/useChat";
// import { useNavigate } from "react-router-dom";

// export default function Step1Page5() {
//   const { user } = useUser();
//   const username = user?.name || "משתמשת";
//   const room = `group-${user?.groupId || 1}`;
//   const navigate = useNavigate();

//   const { messages, resetChat } = useChat(room, username);

//   const participants = ["פניני ברכץ", "יעל אקסלרד"]; // רשימת הקבוצה
//   const senders = Array.from(new Set(messages.map((m) => m.username)));
//   const missing = participants.filter((p) => !senders.includes(p));

//   const current = messages.filter((m) => m.content.startsWith("[מצוי]"));
//   const desired = messages.filter((m) => m.content.startsWith("[רצוי]"));

//   const handleNext = () => {
//     if (missing.length > 0) {
//       alert(`עדיין לא כל המשתתפות שיתפו 🙂\nחסרות: ${missing.join(", ")}`);
//       return;
//     }

//     resetChat();
//     navigate("/Step1Page6");
//   };

//   return (
//     <div className="min-h-[93vh] bg-white flex flex-col items-center justify-start rounded-3xl shadow-lg px-6 py-10">
//       <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-10">
//         סיכום האתגר הקבוצתי
//       </h1>

//       <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
//         <Column
//           title="המצוי – מה קיים היום?"
//           color="blue"
//           data={current}
//           summary="שיעורי החשבון כיום מועברים בעיקר פרונטלית, עם מעט כלים מוחשיים או טכנולוגיים."
//         />
//         <Column
//           title="הרצוי – מה הייתי רוצה?"
//           color="purple"
//           data={desired}
//           summary="פינת הלמידה הרצויה כוללת סביבות גמישות, חווייתיות ודיגיטליות, המעודדות שיתופיות וחשיבה יצירתית."
//         />
//       </div>

//       <button
//         onClick={handleNext}
//         className={`mt-10 px-12 py-3 rounded-full text-xl font-semibold transition ${
//           missing.length > 0
//             ? "bg-gray-400 cursor-not-allowed text-white"
//             : "bg-[#1f1f75] text-white hover:bg-[#2a2aa2]"
//         }`}
//       >
//         לשלב הבא ⬅
//       </button>

//       {missing.length > 0 && (
//         <p className="mt-4 text-sm text-red-600 font-semibold">
//           עדיין לא שלחו: {missing.join(", ")}
//         </p>
//       )}
//     </div>
//   );
// }

// function Column({
//   title,
//   color,
//   data,
//   summary,
// }: {
//   title: string;
//   color: "blue" | "purple";
//   data: { username: string; content: string }[];
//   summary: string;
// }) {
//   const colors =
//     color === "blue"
//       ? { bg: "bg-[#e7f9ff]", border: "border-[#baeaff]" }
//       : { bg: "bg-[#f6f2ff]", border: "border-[#e0d4ff]" };

//   return (
//     <div
//       className={`flex-1 ${colors.bg} border ${colors.border} rounded-2xl p-6 text-right shadow-sm`}
//     >
//       <h2 className="text-xl font-semibold text-[#1f1f75] mb-4">{title}</h2>
//       <div className="flex flex-wrap gap-3 justify-start">
//         {data.map((msg, i) => (
//           <div
//             key={i}
//             className="bg-white border border-gray-200 rounded-xl p-3 w-[48%] shadow-sm text-sm"
//           >
//             <p className="text-gray-700 mb-2">
//               {msg.content.replace(/^\[.*?\]\s*/, "")}
//             </p>
//             <p className="text-[#1f1f75] text-xs font-semibold text-left">
//               {msg.username}
//             </p>
//           </div>
//         ))}
//       </div>
//       <div className={`bg-white mt-6 border ${colors.border} rounded-xl p-4`}>
//         <h3 className="text-[#1f1f75] font-semibold mb-2">סיכום</h3>
//         <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
//       </div>
//     </div>
//   );
// }
import React from "react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { useNavigate } from "react-router-dom";

export default function Step1Page5() {
  const { user } = useUser();
  const username = user?.name || "משתמשת";
  const room = `group-${user?.groupId || 1}`;
  const navigate = useNavigate();

  const { messages, resetChat } = useChat(room, username);

  // 👩‍🏫 רשימת המשתתפות בקבוצה — כדאי להביא אותה מהשרת בעתיד
  const participants = ["פניני ברכץ", "יעל אקסלרד", "שרה ישראלי"];

  // מוודאים מי שלחה הודעה
  const senders = Array.from(new Set(messages.map((m) => m.username)));
  const missing = participants.filter((p) => !senders.includes(p));

  const current = messages.filter((m) => m.content.startsWith("[מצוי]"));
  const desired = messages.filter((m) => m.content.startsWith("[רצוי]"));

  const handleNext = async () => {
    // 1️⃣ אם לא כל המשתתפות שלחו — הצג הודעה ועצור
    if (missing.length > 0) {
      alert(`עדיין לא כל המשתתפות שיתפו 🙂\nחסרות: ${missing.join(", ")}`);
      return;
    }

    // 2️⃣ שליחת בקשה לשרת — להגרלת עורכת
    try {
      const res = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/choose-editor`,
        { method: "POST" }
      );
      const data = await res.json();

      // שמירה מקומית מי נבחרה
      localStorage.setItem("groupEditor", data.editorName);
      console.log("נבחרה עורכת:", data.editorName);

      // 3️⃣ ניקוי הצ'אט וסגירת ה-WebSocket
      resetChat();

      // 4️⃣ מעבר לשלב הבא
      navigate("/Step1Page6");
    } catch (err) {
      console.error("שגיאה בבחירת עורכת:", err);
      alert("שגיאה בהגרלה, נסי שוב מאוחר יותר 😔");
    }
  };

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-start rounded-3xl shadow-lg px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-10">
        סיכום האתגר הקבוצתי
      </h1>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        <Column
          title="המצוי – מה קיים היום?"
          color="blue"
          data={current}
          summary="שיעורי החשבון כיום מועברים בעיקר פרונטלית, עם מעט כלים מוחשיים או טכנולוגיים."
        />
        <Column
          title="הרצוי – מה הייתי רוצה?"
          color="purple"
          data={desired}
          summary="פינת הלמידה הרצויה כוללת סביבות גמישות, חווייתיות ודיגיטליות, המעודדות שיתופיות וחשיבה יצירתית."
        />
      </div>

      <button
        onClick={handleNext}
        className={`mt-10 px-12 py-3 rounded-full text-xl font-semibold transition ${
          missing.length > 0
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-[#1f1f75] text-white hover:bg-[#2a2aa2]"
        }`}
      >
        לשלב הבא ←
      </button>

      {missing.length > 0 && (
        <p className="mt-4 text-sm text-red-600 font-semibold">
          עדיין לא שלחו: {missing.join(", ")}
        </p>
      )}
    </div>
  );
}

function Column({
  title,
  color,
  data,
  summary,
}: {
  title: string;
  color: "blue" | "purple";
  data: { username: string; content: string }[];
  summary: string;
}) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#e7f9ff]", border: "border-[#baeaff]" }
      : { bg: "bg-[#f6f2ff]", border: "border-[#e0d4ff]" };

  return (
    <div
      className={`flex-1 ${colors.bg} border ${colors.border} rounded-2xl p-6 text-right shadow-sm`}
    >
      <h2 className="text-xl font-semibold text-[#1f1f75] mb-4">{title}</h2>
      <div className="flex flex-wrap gap-3 justify-start">
        {data.map((msg, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-3 w-[48%] shadow-sm text-sm"
          >
            <p className="text-gray-700 mb-2">
              {msg.content.replace(/^\[.*?\]\s*/, "")}
            </p>
            <p className="text-[#1f1f75] text-xs font-semibold text-left">
              {msg.username}
            </p>
          </div>
        ))}
      </div>
      <div className={`bg-white mt-6 border ${colors.border} rounded-xl p-4`}>
        <h3 className="text-[#1f1f75] font-semibold mb-2">סיכום</h3>
        <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}
