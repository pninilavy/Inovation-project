

// import React, { useState } from "react";
// import { useUser } from "../../context/UserContext";
// import { ChevronLeft } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useChat } from "../../hooks/useChat";

// export default function Step1Page4() {
//   const { user } = useUser();
//   const navigate = useNavigate();

//   const username = user?.name || "משתמשת";
//   const room = `group-${user?.groupId || 1}`;

//   const { sendMessage, connected } = useChat(room, username);

//   const [current, setCurrent] = useState("");
//   const [desired, setDesired] = useState("");
//   const [sending, setSending] = useState(false);
//   const [sent, setSent] = useState(false);

//   const handleShare = async () => {
//     if (!current && !desired) return alert("נא למלא לפחות אחד מהשדות 🙂");
//     if (!connected) return alert("החיבור לשרת לא פעיל כרגע.");

//     setSending(true);
//     if (current.trim()) sendMessage(`[מצוי] ${current}`);
//     if (desired.trim()) sendMessage(`[רצוי] ${desired}`);

//     await new Promise((r) => setTimeout(r, 500));
//     setSending(false);
//     setSent(true);
//   };

//   return (
//     <div className="min-h-[93vh] bg-white flex flex-col items-center justify-center rounded-3xl shadow-lg px-4">
//       <div className="w-full max-w-5xl text-center mt-16">
//         <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-2">
//           שלום {username}
//         </h1>
//         <p className="text-lg mb-10 text-gray-700">כתבי מה דעתך על האתגר</p>

//         <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-12">
//           <TextareaBlock
//             title="המצוי – מה קיים היום?"
//             value={current}
//             onChange={setCurrent}
//             color="blue"
//           />
//           <TextareaBlock
//             title="הרצוי – מה הייתי רוצה?"
//             value={desired}
//             onChange={setDesired}
//             color="purple"
//           />
//         </div>

//         {!sent ? (
//           <button
//             onClick={handleShare}
//             disabled={sending}
//             className={`mt-4 mb-10 px-12 py-3 rounded-full text-xl font-semibold transition ${
//               sending
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-[#1f1f75] text-white hover:bg-[#2a2aa2]"
//             }`}
//           >
//             {sending ? "שולח..." : "שיתוף בקבוצה"}
//             {!sending && <ChevronLeft size={22} className="inline ml-2" />}
//           </button>
//         ) : (
//           <div className="flex flex-col items-center">
//             <p className="text-xl text-[#1f1f75] font-semibold mb-4">
//               ✅ ההודעה נשלחה לקבוצה!
//             </p>
//             <button
//               onClick={() => navigate("/Step1Page5")}
//               className="px-10 py-3 bg-[#1f1f75] text-white rounded-full text-lg font-semibold hover:bg-[#2a2aa2] transition"
//             >
//               מעבר לשלב הבא
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function TextareaBlock({
//   title,
//   value,
//   onChange,
//   color,
// }: {
//   title: string;
//   value: string;
//   onChange: (v: string) => void;
//   color: "blue" | "purple";
// }) {
//   const colors =
//     color === "blue"
//       ? { bg: "bg-[#e7f9ff]", border: "border-[#baeaff]" }
//       : { bg: "bg-[#f6f2ff]", border: "border-[#e0d4ff]" };

//   return (
//     <div
//       className={`flex-1 ${colors.bg} border ${colors.border} rounded-2xl p-6 text-right`}
//     >
//       <h2 className="text-lg font-semibold text-[#1f1f75] mb-3">{title}</h2>
//       <textarea
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         maxLength={200}
//         className="w-full min-h-[120px] rounded-xl p-3 border border-gray-200 focus:ring-2 focus:ring-indigo-200 text-gray-700 resize-none"
//       />
//     </div>
//   );
// }
import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";

export default function Step1Page4() {
  const { user } = useUser();
  const navigate = useNavigate();

  const username = user?.name || "משתמשת";
  const room = `group-${user?.groupId || 1}`;

  const { sendMessage, connected } = useChat(room, username);

  const [current, setCurrent] = useState("");
  const [desired, setDesired] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleShare = async () => {
    if (!current && !desired) return alert("נא למלא לפחות אחד מהשדות 🙂");
    if (!connected) return alert("החיבור לשרת לא פעיל כרגע.");

    setSending(true);
    if (current.trim()) sendMessage(`[מצוי] ${current}`);
    if (desired.trim()) sendMessage(`[רצוי] ${desired}`);

    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-center rounded-3xl shadow-lg px-4">
      <div className="w-full max-w-5xl text-center mt-16">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-2">
          שלום {username}
        </h1>
        <p className="text-lg mb-10 text-gray-700">כתבי מה דעתך על האתגר</p>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-12">
          <TextareaBlock
            title="המצוי – מה קיים היום?"
            value={current}
            onChange={setCurrent}
            color="blue"
          />
          <TextareaBlock
            title="הרצוי – מה הייתי רוצה?"
            value={desired}
            onChange={setDesired}
            color="purple"
          />
        </div>

        {!sent ? (
          <button
            onClick={handleShare}
            disabled={sending}
            className={`mt-4 mb-10 px-12 py-3 rounded-full text-xl font-semibold transition ${
              sending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#1f1f75] text-white hover:bg-[#2a2aa2]"
            }`}
          >
            {sending ? "שולח..." : "שיתוף בקבוצה"}
            {!sending && <ChevronLeft size={22} className="inline ml-2" />}
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-xl text-[#1f1f75] font-semibold mb-4">
              ✅ ההודעה נשלחה לקבוצה!
            </p>
            <button
              onClick={() => navigate("/Step1Page5")}
              className="px-10 py-3 bg-[#1f1f75] text-white rounded-full text-lg font-semibold hover:bg-[#2a2aa2] transition"
            >
              מעבר לשלב הבא
            </button>
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
  color,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={200}
        className="w-full min-h-[120px] rounded-xl p-3 border border-gray-200 focus:ring-2 focus:ring-indigo-200 text-gray-700 resize-none"
      />
    </div>
  );
}
