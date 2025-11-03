import React, { useEffect, useState } from "react";
 import { useUser } from "../../context/UserContext";
 import { Loader2 } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import { useChat } from "../../hooks/useChat";

 export default function Step1Page9() {
   const { user } = useUser();
   const navigate = useNavigate();
   const room = `group-${user?.groupId}`;
   const username = user?.name || "משתמשת";
   const { sendMessage } = useChat(room, username);

   const [summary, setSummary] = useState({ current: "", desired: "" });
   const [loading, setLoading] = useState(true);
   const [editorName, setEditorName] = useState<string | null>(null);
   const [isEditor, setIsEditor] = useState(false);
   const [question, setQuestion] = useState("");
   const [showButton, setShowButton] = useState(false);
   const [showPopup, setShowPopup] = useState(false);
   const [popupMessage, setPopupMessage] = useState("");

   const processId = 3; // 👈 תהליך 3 – שלב שאלת האתגר

   // === שליפה ראשונית ===
   useEffect(() => {
     if (!user?.groupId || !user?.name) return;

     async function fetchData() {
       try {
         // 1️⃣ בדיקה אם יש עורכת
         const res = await fetch(
           `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId}`
         );
         const data = await res.json();

         if (data.message === "טרם נבחרה עורכת לשלב זה") {
           // 🎲 בוחרים עורכת חדשה
           const res2 = await fetch(
             `http://localhost:8080/api/groups/${user.groupId}/choose-editor?processId=${processId}`,
             { method: "POST" }
           );
           const chosen = await res2.json();
           setEditorName(chosen.editorName);
           setIsEditor(chosen.editorName === user.name);

           setPopupMessage(
             chosen.editorName === user.name
               ? "🎉 נבחרת להיות העורכת! תוכלי כעת לנסח את שאלת האתגר"
               : `נבחרה להיות העורכת: ${chosen.editorName}`
           );
           setShowPopup(true);
         } else {
           setEditorName(data.editorName);
           setIsEditor(data.editorName === user.name);
         }

         // 2️⃣ שליפת סיכום קודם (תהליך 2)
         const sumRes = await fetch(
           `http://localhost:8080/api/groups/${user.groupId}/summary?processId=2`
         );
         const sumData = await sumRes.json();
         if (sumData.success) {
           setSummary({
             current: sumData.current || "",
             desired: sumData.desired || "",
           });
         }

         // 3️⃣ שליפת שאלת אתגר (תהליך 3)
         const qRes = await fetch(
           `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`
         );
         const qData = await qRes.json();

         if (qData.success && qData.current) {
           setQuestion(qData.current);
           setShowButton(true);
         }
       } catch (err) {
         console.error("❌ שגיאה בשליפת נתונים:", err);
       } finally {
         setLoading(false);
       }
     }

     fetchData();
   }, [user?.groupId, user?.name]);

   // === רענון כל 5 שניות לבדוק אם תהליך 3 נוסף ===
   useEffect(() => {
     if (!user?.groupId) return;

     const interval = setInterval(async () => {
       try {
         const res = await fetch(
           `http://localhost:8080/api/groups/${user.groupId}/summary?processId=3`
         );
         const data = await res.json();

         if (data.success && data.current) {
           setQuestion(data.current);
           if (!showButton) setShowButton(true);
         }
       } catch (err) {
         console.error("שגיאה בבדיקה מחזורית:", err);
       }
     }, 5000);

     return () => clearInterval(interval);
   }, [user?.groupId, showButton]);

   // === שמירת שאלת האתגר ===
   const handleSave = async () => {
     if (!user?.groupId || !question.trim()) {
       alert("יש לנסח את שאלת האתגר לפני השמירה.");
       return;
     }

     try {
       const res = await fetch(
         `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`,
         {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             current: question, // 👈 השאלה נשמרת בעמודת המצוי (summary_current)
           }),
         }
       );

       const data = await res.json();

       if (res.ok && data.success) {
         setShowButton(true);
         sendMessage(
           JSON.stringify({
             type: "question_saved",
             text: `📢 ${username} שמרה את שאלת האתגר לקבוצה!`,
           })
         );
         setPopupMessage("✅ שאלת האתגר נשמרה בהצלחה!");
         setShowPopup(true);
       } else {
         alert("❌ שגיאה בשמירה, נסי שוב.");
       }
     } catch (err) {
       console.error("שגיאה בשמירה:", err);
     }
   };

   // === טעינה ===
   if (loading)
     return (
       <div className="flex items-center justify-center h-[90vh] text-[#1f1f75]">
         <Loader2 className="animate-spin mr-2" size={36} />
         טוען נתונים...
       </div>
     );

   return (
     <div className="h-screen bg-white rounded-3xl shadow-lg flex flex-col items-center justify-start rtl text-right relative overflow-hidden py-4 px-8">
       {/* פופאפ הודעה */}
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

       {/* קו גרדיאנט */}
       <div
         className="absolute left-[230px] top-[95px] w-[1355px] h-[8px] rounded-[16px]"
         style={{
           background:
             "linear-gradient(90deg, rgba(223,87,255,0.4) 0%, rgba(56,233,205,0.4) 100%)",
         }}
       ></div>

       <h1 className="text-[26px] font-bold text-[#1f1f75] mb-4 mt-[110px]">
         הפער בין המצוי לרצוי
       </h1>

       {/* תיבות המצוי והרצוי */}
       <div className="flex flex-row justify-center gap-8 mb-6">
         <SummaryBox title="המצוי" color="blue" text={summary.current} />
         <SummaryBox title="הרצוי" color="purple" text={summary.desired} />
       </div>

       {/* שאלת אתגר */}
       <div className="flex flex-col items-center mt-2 w-full">
         <h2 className="font-[Rubik] font-medium text-[26px] text-[#404040] text-center mb-1">
           שאלת אתגר
         </h2>
         <p className="font-[Rubik] text-[18px] text-[#404040] text-center mb-3">
           כיצד ניתן מענה לצורך הרצוי, בהתאמה לדרישות המציאות?
         </p>

         {isEditor ? (
           <textarea
             className="bg-white border border-[#DADADA] rounded-[20px] w-[900px] h-[140px] shadow-sm text-right p-4 text-[#1f1f75] text-[16px] leading-relaxed resize-none focus:ring-2 focus:ring-[#3B2DBB]"
             value={question}
             onChange={(e) => setQuestion(e.target.value)}
             placeholder="כתבי כאן את שאלת האתגר..."
           />
         ) : (
           <div className="bg-white border border-[#DADADA] rounded-[20px] w-[900px] h-[140px] shadow-sm flex items-center justify-center text-center p-4">
             <p className="text-[#1f1f75] text-[16px] whitespace-pre-line leading-relaxed">
               {question || "—"}
             </p>
           </div>
         )}

         {!isEditor && (
           <p className="mt-2 text-[#1f1f75] font-semibold text-sm">
             כעת בעריכה ע״י: {editorName || "—"}
           </p>
         )}
       </div>

       {/* כפתור שמירה / מעבר */}
       {isEditor && !showButton && (
         <button
           onClick={handleSave}
           className="mt-5 px-8 py-2.5 bg-[#1f1f75] text-white text-md font-semibold rounded-full shadow-md hover:scale-105 transition"
         >
           שמרי שאלת אתגר
         </button>
       )}

       {showButton && (
         <div className="flex justify-center mt-5">
           <button
             onClick={() => navigate("/step2Page1")}
             className="px-8 py-2.5 bg-[#1f1f75] text-white text-md font-semibold rounded-full shadow-md hover:scale-105 transition"
           >
             {`${editorName || "—"} מאשרת! אתן עוברות לשלב הבא ←`}
           </button>
         </div>
       )}
     </div>
   );
 }

 // תיבות קומפקטיות
 function SummaryBox({ title, color, text }: any) {
   const colors =
     color === "blue"
       ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
       : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

   return (
     <div
       className={`flex flex-col items-end ${colors.bg} p-[12px] border ${colors.border} rounded-[20px] shadow-md w-[380px] h-[180px] text-right`}
     >
       <h2 className="text-[18px] font-semibold text-[#1f1f75] mb-1">
         {title}
       </h2>
       <p className="text-[#1f1f75] whitespace-pre-line text-[14px] leading-relaxed w-full text-right overflow-hidden">
         {text || "—"}
       </p>
     </div>
   );
 }
