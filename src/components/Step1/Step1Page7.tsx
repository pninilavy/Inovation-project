

import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";


export default function Step1Page7() {
  const { user } = useUser();
  const navigate = useNavigate();
  const room = `group-${user?.groupId}`;
  const username = user?.name || "משתמשת";

  const { sendMessage, messages } = useChat(room, username);

  const [summary, setSummary] = useState({ current: "", desired: "" });
  const [editorName, setEditorName] = useState<string>("");
  const [newCurrent, setNewCurrent] = useState("");
  const [newDesired, setNewDesired] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [popupMessage, setPopupMessage] = useState(""); // הטקסט של הקופצת
  const [isEditor, setIsEditor] = useState(false);


  const processId = 2;
  useEffect(() => {
    if (!user?.groupId) return;
  
    const ensureProcess2Editor = async () => {
      try {
        await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/next-process`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              processId,   // כלומר 2
              keepEditor: true, // משמרת את אותה עורכת משלב 1
            }),
          }
        );
      } catch (err) {
        console.error("❌ שגיאה ביצירת process 2:", err);
      }
    };
  
    ensureProcess2Editor();
  }, [user?.groupId]);
  

  // 📥 שליפת סיכום קודם + שם העורכת
  useEffect(() => {
    if (!user?.groupId) return;

    async function fetchSummaryAndEditor() {
      try {
        // 👈 גם הסיכום וגם העורכת נשלפים מה־processId הקודם (1)
        const [summaryRes, editorRes] = await Promise.all([
          fetch(
            `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId - 1}`
          ),
          fetch(
            `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId - 1}`
          ),
        ]);

        const summaryData = await summaryRes.json();
        const editorData = await editorRes.json();

        if (summaryData.success) {
          setSummary({
            current: summaryData.current || "",
            desired: summaryData.desired || "",
          });
        }

        // ❗ בלי הגרלה חדשה – משתמשים באותה עורכת של שלב 6
        // ❗ בלי הגרלה חדשה – משתמשים באותה עורכת של שלב 6
        const nameFromServer = editorData.editorName || "לא נבחרה עורכת";
        setEditorName(nameFromServer);

        const meIsEditor = user?.name === nameFromServer;
        setIsEditor(meIsEditor);

        // קובעות הודעה קופצת לכל בנות הקבוצה
        if (nameFromServer && nameFromServer !== "לא נבחרה עורכת") {
          setPopupMessage(
            meIsEditor
              ? "נבחרת להיות העורכת של הקבוצה בסיכום המחודש."
              : `${nameFromServer} נבחרה להיות העורכת של הקבוצה בסיכום המחודש.`
          );
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
          navigate("/step1Page8");
        }
      } catch (err) {
        console.error("❌ שגיאה בבדיקה החוזרת:", err);
      }
    }, 5000); // כל 5 שניות

    return () => clearInterval(interval);
  }, [user?.groupId, isEditor, navigate]);


  useEffect(() => {
    messages.forEach((m) => {
      try {
        const data = JSON.parse(m.content);

        if (data.type === "EDITOR_UPDATE_CURRENT") {
          setNewCurrent(data.text);
        }

        if (data.type === "EDITOR_UPDATE_DESIRED") {
          setNewDesired(data.text);
        }

      } catch { }
    });
  }, [messages]);
  const STORAGE_KEY = `messages_${room}`; // יהיה messages_group-1

  function cleanupEditorDrafts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
  
      const msgs = JSON.parse(raw); // המערך שמאחסן useChat
      if (!Array.isArray(msgs)) return;
  
      const cleaned = msgs.filter((m: any) => {
        try {
          const data = JSON.parse(m.content);
          // מסננים כל הודעה מסוג EDITOR_UPDATE_*
          return !(
            data?.type === "EDITOR_UPDATE_CURRENT" ||
            data?.type === "EDITOR_UPDATE_DESIRED"
          );
        } catch {
          // אם זה לא JSON (הודעות רגילות כמו [מצוי] וכו') – נשאיר
          return true;
        }
      });
  
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    } catch (e) {
      console.error("❌ שגיאה בניקוי טיוטות:", e);
    }
  }
  
  // 🧩 שמירה ועדכון סיכום חדש
  const handleSave = async () => {
    try {
      // --- ולידציה בסיסית ---
      const currentWords = newCurrent.trim().split(/\s+/).filter(Boolean);
      const desiredWords = newDesired.trim().split(/\s+/).filter(Boolean);

      if (!currentWords.length || !desiredWords.length) {
        alert("יש למלא סיכום מחודש גם למצוי וגם לרצוי לפני המעבר לשלב הבא.");
        return;
      }

     
      // --- סוף ולידציה ---

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
      console.log("📦 תגובת שרת בשמירה:", data);
      
      if (data.success) {
        cleanupEditorDrafts();
        navigate("/step1Page8");
      } else {
        alert(data.message || "⚠️ שגיאה בשמירה, נסי שוב.");
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
    <div className="h-full bg-white rounded-3xl shadow-lg p-10 flex flex-col justify-between text-right rtl relative overflow-hidden">
      <h1 className="text-3xl font-bold text-[#1f1f75] mb-4 text-center">
        סיכום מחודש
      </h1>

      {popupMessage && (
        <div className="fixed top-10 left-10 bg-white shadow-lg border border-[#C6C6F8] rounded-xl px-6 py-4 text-right max-w-lg w-[380px] animate-fade-slide z-50">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-[#1f1f75] mb-1"></p>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {isEditor
                  ? `${editorName}  נבחרת לדייק עם כל הבנות הקבוצה את משפטי הסיכום.\n ${editorName} כתבי את הסיכום מחדש על פי הנחיית הקבוצה.`
                  : `${editorName}  נבחרה לדייק עם כל הבנות הקבוצה את משפטי הסיכום.\n ${editorName} תכתוב את הסיכום מחדש על פי הנחיית הקבוצה.`}
              </p>
            </div>

            <button
              onClick={() => setPopupMessage("")}
              className="text-gray-400 hover:text-[#3B2DBB] text-xl font-bold ml-3"
              title="סגירה"
            >
              ✕
            </button>
          </div>
        </div>
      )}


      {/* 🔹 מבנה התיבות */}
      <div className="flex flex-col justify-center gap-6 flex-1">
        {/* בלוק המצוי - כותרת + קוביות יחד */}
        <div className="w-full max-w-6xl mx-auto">
          {/* כותרת חיצונית למצוי */}
          <div className="flex flex-row-reverse items-center gap-2 mb-3.5 w-[21%] ml-auto">
            <span className="text-[#1f1f75] font-semibold text-lg">סיכום המצוי</span>
            <img src="/images/Emoji2.png" alt="" className="w-5 h-5" />
          </div>


          {/* אזור המצוי */}
          <div className="flex flex-row justify-end gap-6 items-start">
            <SummaryBox
              title="הסיכום המוצע:"
              color="blue"
              text={summary.current}
            />
            <EditableBox
              title="סיכום מחודש לתוצרים קיימים:"
              color="blue"
              text={newCurrent}
              setText={setNewCurrent}
              isEditable={isEditor}
              editorName={editorName}
              sendMessage={sendMessage}
              placeholder="מלל חופשי עד 20 מילים לסיכום המצוי"
            />
          </div>

        </div>

        {/* בלוק הרצוי - כותרת + קוביות יחד */}
        <div className="w-full max-w-6xl mx-auto mt-8">
          {/* כותרת חיצונית לרצוי */}
          <div className="flex flex-row-reverse items-center gap-2 mb-3.5 w-[21%] ml-auto">
            <span className="text-[#1f1f75] font-semibold text-lg">סיכום הרצוי</span>
            <img src="/images/Emoji1.png" alt="" className="w-5 h-5" />
          </div>


          {/* אזור הרצוי */}
          <div className="flex flex-row justify-end gap-6 items-start">
            <SummaryBox
              title="הסיכום המוצע:"
              color="purple"
              text={summary.desired}
            />
            <EditableBox
              title="סיכום מחודש לתוצר מיטבי:"
              color="purple"
              text={newDesired}
              setText={setNewDesired}
              isEditable={isEditor}
              editorName={editorName}
              sendMessage={sendMessage}
              placeholder="מלל חופשי עד 20 מילים לסיכום הרצוי"
            />
          </div>

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
            {saving ? "שומרת..." : `${editorName} מאשרת את הניסוח, אתן עוברות לשלב הבא!`}
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
function SummaryBox({ title, color, text }: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} w-[33%] p-[16px] border ${colors.border} rounded-[20px] shadow-md h-[200px] text-right`}
    >
      <div className="flex justify-end items-center mb-2 w-full">
        <h2 className="text-lg font-semibold text-[#1f1f75] text-right w-full">
          {title}
        </h2>
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
  //emoji,
  isEditable,
  editorName,
  sendMessage,
  placeholder,
}: any) {

  const colors =
    color === "blue"
      ? { bg: "bg-[#E9FBFF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#F5EEFF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} w-[55%] p-[16px] border ${colors.border} rounded-[20px] shadow-md h-[200px] text-right`}
    >
      <div className="flex flex-row-reverse items-center mb-2 w-full" dir="rtl">
        <h2 className="text-lg font-semibold text-[#1f1f75] text-right w-full">
          {title}
        </h2>
      </div>


      {isEditable ? (
        <textarea
          className="w-full h-[130px] bg-white border border-[#DADADA] rounded-[15px] p-3 text-sm text-[#1f1f75] resize-none focus:ring-2 focus:ring-[#DF57FF] outline-none"
          value={text}
          onChange={(e) => {
            const value = e.target.value;

            // מחשבת כמה מילים יש כרגע
            const words = value.trim().split(/\s+/).filter(Boolean);

            // אם עברנו 20 מילים – לא מעדכנות את הטקסט
            if (words.length > 20) {
              return;
            }

            // אחרת כן מעדכנות
            setText(value);

            if (sendMessage) {
              sendMessage(
                JSON.stringify({
                  type: title.includes("קיימים")
                    ? "EDITOR_UPDATE_CURRENT"
                    : "EDITOR_UPDATE_DESIRED",
                  text: value,
                })
              );
            }
          }}
          placeholder={placeholder}
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
