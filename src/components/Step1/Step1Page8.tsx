

import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Step1Page8() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [summary, setSummary] = useState({ current: "", desired: "" });
  const [editorName, setEditorName] = useState<string>("");
  const [newCurrent, setNewCurrent] = useState("");
  const [newDesired, setNewDesired] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const processId = 2;

  // 📥 שליפת סיכום קודם + שם העורכת
  useEffect(() => {
    if (!user?.groupId) return;

    async function fetchSummaryAndEditor() {
      try {
        const [summaryRes, editorRes] = await Promise.all([
          fetch(
            `http://localhost:8080/api/groups/${
              user.groupId
            }/summary?processId=${processId - 1}`
          ),
          fetch(
            `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId}`
          ),
        ]);

        const summaryData = await summaryRes.json();
        const editorData = await editorRes.json();

        if (summaryData.success) {
          setSummary({
            current: summaryData.current || "",
            desired: summaryData.desired || "",
          });
          setNewCurrent(summaryData.current || "");
          setNewDesired(summaryData.desired || "");
        }

        setEditorName(editorData.editorName || "לא נבחרה עורכת");

        if (user?.name === editorData.editorName) {
          setIsEditor(true);
          setShowPopup(true);
        }
      } catch (err) {
        console.error("❌ שגיאה בשליפת נתונים:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaryAndEditor();
  }, [user?.groupId]);

  // 🕒 בדיקה כל כמה שניות למשתמשות שאינן עורכת אם נשמר כבר הסיכום המחודש
  useEffect(() => {
    if (!user?.groupId || isEditor) return; // העורכת עצמה לא צריכה לבדוק

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`
        );
        const data = await res.json();
        if (data.success && (data.current || data.desired)) {
          // אם הסיכום החדש נשמר — מעבר אוטומטי לעמוד הבא
          navigate("/step1Page9");
        }
      } catch (err) {
        console.error("❌ שגיאה בבדיקה החוזרת:", err);
      }
    }, 5000); // כל 5 שניות

    return () => clearInterval(interval);
  }, [user?.groupId, isEditor, navigate]);

  // 🧩 שמירה ועדכון סיכום חדש
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            processId,
            current: newCurrent,
            desired: newDesired,
            editor: editorName,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        navigate("/step1Page9");
      } else {
        alert("⚠️ שגיאה בשמירה, נסי שוב.");
      }
    } catch (err) {
      console.error("❌ שגיאה בשמירה:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[90vh] text-[#1f1f75]">
        <Loader2 className="animate-spin mr-2" size={36} />
        טוען נתונים...
      </div>
    );

  return (
    <div className="h-screen bg-white rounded-3xl shadow-lg p-10 flex flex-col justify-between text-right rtl relative overflow-hidden">
      <h1 className="text-3xl font-bold text-[#1f1f75] mb-4 text-center">
        סיכום מחודש ✏️
      </h1>

      {showPopup && (
        <div className="fixed top-10 right-10 bg-white border border-[#3B2DBB] rounded-2xl shadow-xl p-5 z-50">
          <p className="text-[#1f1f75] font-bold mb-2">📢 הודעה לקבוצה</p>
          <p className="text-gray-700 text-lg">
            נבחרת להיות העורכת של הקבוצה ✏️
          </p>
          <button
            onClick={() => setShowPopup(false)}
            className="mt-3 text-[#3B2DBB] font-semibold underline"
          >
            סגור
          </button>
        </div>
      )}

      {/* 🔹 מבנה התיבות */}
      <div className="flex flex-col justify-center gap-6 flex-1">
        {/* 🔹 אזור המצוי */}
        <div className="flex flex-row justify-center gap-6 items-start">
          <SummaryBox
            title="המצוי – מה קיים היום?"
            color="blue"
            emoji="/images/Emoji2.png"
            text={summary.current}
            fixed
          />
          <EditableBox
            title="סיכום מחודש לתוצרים קיימים"
            color="blue"
            emoji="/images/Emoji2.png"
            text={newCurrent}
            setText={setNewCurrent}
            isEditable={isEditor}
            editorName={editorName}
            fixed
          />
        </div>

        {/* 🔹 אזור הרצוי */}
        <div className="flex flex-row justify-center gap-6 items-start">
          <SummaryBox
            title="הרצוי – מה הייתי רוצה?"
            color="purple"
            emoji="/images/Emoji1.png"
            text={summary.desired}
            fixed
          />
          <EditableBox
            title="סיכום מחודש לתוצרים רצויים"
            color="purple"
            emoji="/images/Emoji1.png"
            text={newDesired}
            setText={setNewDesired}
            isEditable={isEditor}
            editorName={editorName}
            fixed
          />
        </div>
      </div>

      {/* כפתור שמירה */}
      {isEditor ? (
        <div className="flex justify-center mt-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-[300px] h-[50px] bg-[#DF57FF] text-white text-lg font-semibold rounded-full shadow-md hover:scale-105 transition disabled:opacity-50"
          >
            {saving ? "שומרת..." : "שומרת את הסיכום החדש"}
          </button>
        </div>
      ) : (
        <div className="flex justify-center mt-2">
          <p className="text-[#1f1f75] text-md font-semibold">
            כעת בעריכה ע״י {editorName}
          </p>
        </div>
      )}
    </div>
  );
}

// תיבת סיכום מוצע
function SummaryBox({ title, color, text, emoji }: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} w-[33%] p-[16px] border ${colors.border} rounded-[20px] shadow-md h-[200px] text-right`}
    >
      <div className="flex justify-end items-center gap-2 mb-2 w-full">
        <img src={emoji} alt="emoji" className="w-5 h-5" />
        <h2 className="text-lg font-semibold text-[#1f1f75]">{title}</h2>
      </div>
      <div className="w-full h-[130px] bg-white border border-[#DADADA] rounded-[15px] p-3 text-sm overflow-hidden">
        <p className="text-[#1f1f75] whitespace-pre-line leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}

// תיבת עריכה
function EditableBox({
  title,
  color,
  text,
  setText,
  emoji,
  isEditable,
  editorName,
}: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E9FBFF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#F5EEFF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} w-[55%] p-[16px] border ${colors.border} rounded-[20px] shadow-md h-[200px] text-right`}
    >
      <div className="flex justify-end items-center gap-2 mb-2 w-full">
        <img src={emoji} alt="emoji" className="w-5 h-5" />
        <h2 className="text-lg font-semibold text-[#1f1f75]">{title}</h2>
      </div>

      {isEditable ? (
        <textarea
          className="w-full h-[130px] bg-white border border-[#DADADA] rounded-[15px] p-3 text-sm text-[#1f1f75] resize-none focus:ring-2 focus:ring-[#DF57FF] outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="כתבי כאן את הנוסח החדש..."
        />
      ) : (
        <div className="w-full h-[130px] bg-white border border-[#DADADA] rounded-[15px] p-3 text-sm text-[#1f1f75] overflow-hidden">
          <p className="whitespace-pre-line">{text}</p>
        </div>
      )}

      {!isEditable && (
        <p className="text-xs text-gray-500 mt-1">
          כעת בעריכה ע״י <span className="font-semibold">{editorName}</span>
        </p>
      )}
    </div>
  );
}
