
// import React, { useEffect, useState } from "react";
// import { useUser } from "../../context/UserContext";
// import { useChat } from "../../hooks/useChat";
// import { Loader2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function Step1Page6() {
//   const { user } = useUser();
//   const navigate = useNavigate();
//   const room = `group-${user?.groupId}`;
//   const username = user?.name || "משתמשת";
//   const { sendMessage } = useChat(room, username);

//   const [editorName, setEditorName] = useState<string | null>(null);
//   const [summary, setSummary] = useState({ current: "", desired: "" });
//   const [loading, setLoading] = useState(true);
//   const [isEditor, setIsEditor] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);
//   const [popupMessage, setPopupMessage] = useState("");

//   const processId = 1;

//   // === שליפת נתונים ראשונית ===
//   useEffect(() => {
//     async function fetchData() {
//       if (!user?.groupId || !user?.name) return;

//       try {
//         const res = await fetch(
//           `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId}`
//         );
//         const data = await res.json();

//         if (data.message === "טרם נבחרה עורכת לשלב זה") {
//           const res2 = await fetch(
//             `http://localhost:8080/api/groups/${user.groupId}/choose-editor?processId=${processId}`,
//             { method: "POST" }
//           );
//           const chosen = await res2.json();
//           localStorage.setItem("groupEditor", chosen.editorName);
//           setEditorName(chosen.editorName);
//           setIsEditor(chosen.editorName === user.name);

//           setPopupMessage(
//             chosen.editorName === user.name
//               ? "🎉 נבחרת להיות העורכת בהצלחה!"
//               : `נבחרה להיות העורכת: ${chosen.editorName}`
//           );
//           setShowPopup(true);
//         } else {
//           setEditorName(data.editorName);
//           setIsEditor(data.editorName === user.name);
//         }

//         // שליפת סיכום קודם
//         const sumRes = await fetch(
//           `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`
//         );
//         const sumData = await sumRes.json();
//         if (sumData.success) {
//           setSummary({
//             current: sumData.current || "",
//             desired: sumData.desired || "",
//           });
//         }
//       } catch (err) {
//         console.error("שגיאה בשליפת נתונים:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, [user?.groupId, user?.name]);
//   // ✅ מאזין אוטומטי להתעדכנות הסיכום אצל העורכת
//   useEffect(() => {
//     if (!user?.groupId || isEditor) return; // העורכת לא צריכה מאזין

//     const interval = setInterval(async () => {
//       try {
//         const res = await fetch(
//           `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`
//         );
//         if (!res.ok) return;
//         const data = await res.json();

//         // אם נשמר סיכום — נעבור אוטומטית
//         if (data.success && (data.current || data.desired)) {
//           console.log("📢 הסיכום נשמר — מעבר אוטומטי לעמוד 7");
//           clearInterval(interval);
//           navigate(`/step1Page7?processId=${processId}`);
//         }
//       } catch (err) {
//         console.error("שגיאה בבדיקת סיכום:", err);
//       }
//     }, 5000); // בדיקה כל 5 שניות

//     return () => clearInterval(interval);
//   }, [user?.groupId, isEditor]);

//   // === שמירת סיכום ===
//   const handleSave = async () => {
//     if (!user?.groupId) return;
//     if (!summary.current.trim() || !summary.desired.trim()) {
//       alert("יש למלא את שני השדות לפני השמירה.");
//       return;
//     }

//     try {
//       const res = await fetch(
//         `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(summary),
//         }
//       );

//       if (res.ok) {
//         // שליחת הודעה לשאר המשתתפות
//         sendMessage(
//           JSON.stringify({
//             type: "summary_saved",
//             text: `📢 ${username} שמרה את סיכום הקבוצה!`,
//             link: `/step1Page7?processId=${processId}`,
//           })
//         );

//         setPopupMessage("✅ הסיכום נשמר ונשלח לקבוצה בהצלחה!");
//         setShowPopup(true);

//         // מעבר אוטומטי לעורכת בלבד
//         if (isEditor) {
//           setTimeout(() => {
//             navigate(`/step1Page7?processId=${processId}`);
//           }, 2000);
//         }
//       } else {
//         alert("❌ אירעה שגיאה בשמירה.");
//       }
//     } catch (err) {
//       console.error("שגיאה בשמירה:", err);
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex flex-col items-center justify-center h-[90vh] text-[#1f1f75]">
//         <Loader2 className="animate-spin mb-4" size={40} />
//         <p>טוען נתונים...</p>
//       </div>
//     );

//   return (
//     <div className="min-h-[93vh] bg-white flex flex-col items-center justify-start rtl rounded-3xl shadow-lg px-6 py-10 text-gray-800 relative">
//       {/* ✅ פופאפ הודעה */}
//       {showPopup && (
//         <div className="fixed top-8 right-8 bg-white shadow-xl border border-[#3B2DBB] rounded-2xl p-5 text-right z-50 animate-slide-in">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-[#1f1f75] font-bold mb-2">📢 הודעה לקבוצה</p>
//               <p className="text-gray-700 text-lg whitespace-pre-line leading-relaxed">
//                 {popupMessage}
//               </p>
//             </div>
//             <button
//               onClick={() => setShowPopup(false)}
//               className="text-gray-400 hover:text-[#1f1f75] text-2xl font-bold"
//             >
//               ✕
//             </button>
//           </div>
//         </div>
//       )}

//       <h1 className="text-3xl font-bold text-[#1f1f75] mb-10">סיכום</h1>

//       <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl justify-center items-start">
//         <SummaryBox
//           title="המצוי – מה קיים היום?"
//           color="blue"
//           value={summary.current}
//           onChange={(v) => setSummary({ ...summary, current: v })}
//           readOnly={!isEditor}
//           placeholder="כתבי כאן את הסיכום של המצוי..."
//         />
//         <SummaryBox
//           title="הרצוי – מה הייתי רוצה?"
//           color="purple"
//           value={summary.desired}
//           onChange={(v) => setSummary({ ...summary, desired: v })}
//           readOnly={!isEditor}
//           placeholder="כתבי כאן את הסיכום של הרצוי..."
//         />
//       </div>

//       {isEditor ? (
//         <button
//           onClick={handleSave}
//           className="mt-10 px-10 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold hover:bg-[#2a2aa2] transition"
//         >
//           שמרי סיכום
//         </button>
//       ) : (
//         <p className="mt-6 text-[#1f1f75] font-semibold">
//           בעריכה כעת ע״י: {editorName || "—"}
//         </p>
//       )}
//     </div>
//   );
// }

// function SummaryBox({
//   title,
//   color,
//   value,
//   onChange,
//   readOnly,
//   placeholder,
// }: any) {
//   const colors =
//     color === "blue"
//       ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
//       : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

//   return (
//     <div
//       className={`flex-1 rounded-[20px] p-[19px] border ${colors.border} ${colors.bg} h-[311px] shadow-md`}
//       style={{ width: "447px" }}
//     >
//       <div className="flex flex-row-reverse items-center gap-2 mb-3">
//         <img
//           src={color === "blue" ? "/images/Emoji2.png" : "/images/Emoji1.png"}
//           alt=""
//           className="w-6 h-6"
//         />
//         <h2 className="text-xl font-semibold text-[#1f1f75]">{title}</h2>
//       </div>
//       <textarea
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         readOnly={readOnly}
//         placeholder={placeholder}
//         className={`w-full h-[230px] border rounded-xl p-3 text-right resize-none ${
//           readOnly
//             ? "bg-gray-100 text-gray-500"
//             : "border-[#3B2DBB] focus:ring-2 focus:ring-[#3B2DBB]"
//         }`}
//       />
//     </div>
//   );
// }

// /* ✨ אנימציה לפופאפים */
// const style = document.createElement("style");
// style.innerHTML = `
// @keyframes slide-in {
//   from { opacity: 0; transform: translateX(100px); }
//   to { opacity: 1; transform: translateX(0); }
// }
// .animate-slide-in {
//   animation: slide-in 0.5s ease-out;
// }
// `;
// document.head.appendChild(style);
import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Step1Page6() {
  const { user } = useUser();
  const navigate = useNavigate();
  const room = `group-${user?.groupId}`;
  const username = user?.name || "משתמשת";
  const { sendMessage } = useChat(room, username);

  const [editorName, setEditorName] = useState<string | null>(null);
  const [summary, setSummary] = useState({ current: "", desired: "" });
  const [loading, setLoading] = useState(true);
  const [isEditor, setIsEditor] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const processId = 1;

  // === שליפת נתונים ראשונית ===
  useEffect(() => {
    async function fetchData() {
      if (!user?.groupId || !user?.name) return;

      try {
        console.log(
          "📡 טוען נתוני עורכת עבור קבוצה:",
          user.groupId,
          "תהליך:",
          processId
        );
        const res = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId}`
        );
        const data = await res.json();
        console.log("🧩 תגובה מהשרת (/editor):", data);

        if (data.message === "טרם נבחרה עורכת לשלב זה") {
          console.log("🎲 אין עורכת עדיין — מבצע הגרלה...");
          const res2 = await fetch(
            `http://localhost:8080/api/groups/${user.groupId}/choose-editor?processId=${processId}`,
            { method: "POST" }
          );
          const chosen = await res2.json();
          console.log("🎯 נבחרה עורכת חדשה:", chosen);

          localStorage.setItem("groupEditor", chosen.editorName);
          setEditorName(chosen.editorName);
          setIsEditor(chosen.editorName === user.name);

          setPopupMessage(
            chosen.editorName === user.name
              ? "🎉 נבחרת להיות העורכת בהצלחה!"
              : `נבחרה להיות העורכת: ${chosen.editorName}`
          );
          setShowPopup(true);
        } else {
          console.log("✅ נמצאה עורכת קיימת:", data.editorName);
          setEditorName(data.editorName);
          setIsEditor(data.editorName === user.name);
        }

        // === שליפת סיכום קודם ===
        console.log("📄 טוען סיכום מהשרת...");
        const sumRes = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`
        );
        const sumData = await sumRes.json();
        console.log("🗒️ תגובה מהשרת (/summary):", sumData);

        if (sumData.success) {
          console.log("✅ סיכום קיים בשרת:", sumData);
          setSummary({
            current: sumData.current || "",
            desired: sumData.desired || "",
          });
        } else {
          console.log("ℹ️ אין סיכום קיים לשלב זה");
        }
      } catch (err) {
        console.error("❌ שגיאה בשליפת נתונים:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?.groupId, user?.name]);

  // ✅ מאזין להתעדכנות אצל המשתתפות שאינן עורכת
  useEffect(() => {
    if (!user?.groupId || isEditor) return; // העורכת לא צריכה מאזין

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`
        );
        if (!res.ok) return;
        const data = await res.json();
        console.log("🔁 בדיקת סיכום תקופתית:", data);

        // אם נשמר סיכום — מעבר אוטומטי
        if (data.success && (data.current || data.desired)) {
          console.log("📢 הסיכום נשמר — מעבר אוטומטי לעמוד 7");
          clearInterval(interval);
          navigate(`/step1Page7?processId=${processId}`);
        }
      } catch (err) {
        console.error("⚠️ שגיאה בבדיקת סיכום:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.groupId, isEditor]);

  // === שמירת סיכום ===
  const handleSave = async () => {
    if (!user?.groupId) return;
    if (!summary.current.trim() || !summary.desired.trim()) {
      alert("יש למלא את שני השדות לפני השמירה.");
      return;
    }

    try {
      console.log("💾 שומר סיכום בשרת:", summary);
      const res = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(summary),
        }
      );

      const data = await res.json();
      console.log("📬 תגובה מהשרת לאחר שמירה:", data);

      if (res.ok && data.success) {
        sendMessage(
          JSON.stringify({
            type: "summary_saved",
            text: `📢 ${username} שמרה את סיכום הקבוצה!`,
            link: `/step1Page7?processId=${processId}`,
          })
        );

        setPopupMessage("✅ הסיכום נשמר ונשלח לקבוצה בהצלחה!");
        setShowPopup(true);

        if (isEditor) {
          console.log("🚀 מעבר אוטומטי לעמוד 7 תוך 2 שניות...");
          setTimeout(() => {
            navigate(`/step1Page7?processId=${processId}`);
          }, 2000);
        }
      } else {
        console.warn("⚠️ אירעה שגיאה בשמירה:", data);
        alert("❌ אירעה שגיאה בשמירה.");
      }
    } catch (err) {
      console.error("❌ שגיאה בשמירה:", err);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] text-[#1f1f75]">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>טוען נתונים...</p>
      </div>
    );

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-start rtl rounded-3xl shadow-lg px-6 py-10 text-gray-800 relative">
      {/* ✅ פופאפ הודעה */}
      {showPopup && (
        <div className="fixed top-8 right-8 bg-white shadow-xl border border-[#3B2DBB] rounded-2xl p-5 text-right z-50 animate-slide-in">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#1f1f75] font-bold mb-2">📢 הודעה לקבוצה</p>
              <p className="text-gray-700 text-lg whitespace-pre-line leading-relaxed">
                {popupMessage}
              </p>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="text-gray-400 hover:text-[#1f1f75] text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-[#1f1f75] mb-10">סיכום</h1>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl justify-center items-start">
        <SummaryBox
          title="המצוי – מה קיים היום?"
          color="blue"
          value={summary.current}
          onChange={(v) => setSummary({ ...summary, current: v })}
          readOnly={!isEditor}
          placeholder="כתבי כאן את הסיכום של המצוי..."
        />
        <SummaryBox
          title="הרצוי – מה הייתי רוצה?"
          color="purple"
          value={summary.desired}
          onChange={(v) => setSummary({ ...summary, desired: v })}
          readOnly={!isEditor}
          placeholder="כתבי כאן את הסיכום של הרצוי..."
        />
      </div>

      {isEditor ? (
        <button
          onClick={handleSave}
          className="mt-10 px-10 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold hover:bg-[#2a2aa2] transition"
        >
          שמרי סיכום
        </button>
      ) : (
        <p className="mt-6 text-[#1f1f75] font-semibold">
          בעריכה כעת ע״י: {editorName || "—"}
        </p>
      )}
    </div>
  );
}

function SummaryBox({
  title,
  color,
  value,
  onChange,
  readOnly,
  placeholder,
}: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex-1 rounded-[20px] p-[19px] border ${colors.border} ${colors.bg} h-[311px] shadow-md`}
      style={{ width: "447px" }}
    >
      <div className="flex flex-row-reverse items-center gap-2 mb-3">
        <h2 className="text-xl font-semibold text-[#1f1f75]">{title}</h2>
        <img
          src={color === "blue" ? "/images/Emoji2.png" : "/images/Emoji1.png"}
          alt=""
          className="w-6 h-6"
        />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full h-[230px] border rounded-xl p-3 text-right resize-none ${
          readOnly
            ? "bg-gray-100 text-gray-500"
            : "border-[#3B2DBB] focus:ring-2 focus:ring-[#3B2DBB]"
        }`}
      />
    </div>
  );
}

/* ✨ אנימציה לפופאפים */
const style = document.createElement("style");
style.innerHTML = `
@keyframes slide-in {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in 0.5s ease-out;
}
`;
document.head.appendChild(style);
