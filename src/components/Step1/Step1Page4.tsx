import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Step1Page4() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [current, setCurrent] = useState("");
  const [desired, setDesired] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState("");

  const buildMessage = () => {
    let message = "אני חושבת ";
    if (current) message += `שהמצוי הוא: ${current}. `;
    if (desired) message += `שהרצוי הוא: ${desired}.`;
    return message.trim();
  };

  const handleShare = async () => {
    if (!current && !desired) return alert("נא למלא לפחות אחד מהשדות 🙂");

    setSending(true);
    const message = buildMessage();
    setPreview(message);

    const feedback = {
      userId: user?.id || "guest",
      name: user?.name || "משתמשת אנונימית",
      message,
      groupId: user?.groupId || 1,
      timestamp: new Date().toISOString(),
    };

    // שמירה מקומית בלבד (אפשר להחליף בעתיד ל-API)
    localStorage.setItem("lastFeedback", JSON.stringify(feedback));

    await new Promise((res) => setTimeout(res, 1000)); // הדמיית שליחה

    setSending(false);
    setSent(true);
  };

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-center relative overflow-hidden rtl text-gray-800 rounded-3xl shadow-lg px-4">
      <div className="w-full max-w-5xl text-center mt-16">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-2">
          שלום {user?.name || "דסי"} :)
        </h1>
        <p className="text-lg mb-10 text-gray-700">כתבי מה דעתך על האתגר</p>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 mb-12">
          {/* המצוי */}
          <div className="flex-1 bg-[#e7f9ff] border border-[#baeaff] rounded-2xl p-6 text-right">
            <h2 className="text-lg font-semibold text-[#1f1f75] mb-3 flex items-center justify-between">
              <span>המצוי – מה קיים היום?</span>
              <span className="text-gray-400 text-sm">
                {current.length}/200
              </span>
            </h2>
            <textarea
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              maxLength={200}
              className="w-full min-h-[120px] rounded-xl p-3 border border-[#cceeff] focus:outline-none focus:ring-2 focus:ring-[#7dd3fc] text-gray-700 resize-none"
              placeholder="כתבי כאן מה קיים היום..."
            />
          </div>

          {/* הרצוי */}
          <div className="flex-1 bg-[#f6f2ff] border border-[#e0d4ff] rounded-2xl p-6 text-right">
            <h2 className="text-lg font-semibold text-[#1f1f75] mb-3 flex items-center justify-between">
              <span>הרצוי – מה הייתי רוצה?</span>
              <span className="text-gray-400 text-sm">
                {desired.length}/200
              </span>
            </h2>
            <textarea
              value={desired}
              onChange={(e) => setDesired(e.target.value)}
              maxLength={200}
              className="w-full min-h-[120px] rounded-xl p-3 border border-[#ddd2ff] focus:outline-none focus:ring-2 focus:ring-[#c4b5fd] text-gray-700 resize-none"
              placeholder="כתבי כאן מה היית רוצה שיהיה..."
            />
          </div>
        </div>

        {/* כפתור שיתוף */}
        {!sent && (
          <button
            onClick={handleShare}
            disabled={sending}
            className={`mt-4 mb-10 px-12 py-3 rounded-full text-xl font-semibold transition flex items-center justify-center gap-2 mx-auto
              ${
                sending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1f1f75] text-white hover:bg-[#2a2aa2]"
              }`}
          >
            {sending ? "שולח..." : "שיתוף בקבוצה"}
            {!sending && <ChevronLeft size={22} className="text-white" />}
          </button>
        )}

        {/* הודעת הצלחה + כפתור מעבר לשלב הבא */}
        {sent && (
          <div className="flex flex-col items-center">
            <p className="text-xl text-[#1f1f75] font-semibold mb-4">
              ✅ ההודעה נשמרה בהצלחה!
            </p>
            <button
              onClick={() => navigate("/Step1Page5")}
              className="px-10 py-3 bg-[#1f1f75] text-white rounded-full text-lg font-semibold hover:bg-[#2a2aa2] transition"
            >
              מעבר לשלב הבא
            </button>
          </div>
        )}

        {/* תצוגת ההודעה */}
        {preview && (
          <div className="bg-[#f9f9ff] border border-[#ddd] rounded-2xl p-4 max-w-lg mx-auto text-right text-gray-700 mt-6">
            <p className="font-semibold mb-1 text-[#1f1f75]">
              נוסח ההודעה שישלח:
            </p>
            <p>{preview}</p>
          </div>
        )}
      </div>
    </div>
  );
}
