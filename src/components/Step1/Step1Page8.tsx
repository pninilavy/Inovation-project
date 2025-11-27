

import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";

export default function Step1Page8() {
  const { user } = useUser();
  const navigate = useNavigate();
  const room = `group-${user?.groupId}`;
  const username = user?.name || "משתמשת";
  const { sendMessage, messages } = useChat(room, username);

  const [summary, setSummary] = useState({ current: "", desired: "" });
  const [loading, setLoading] = useState(true);
  const [editorName, setEditorName] = useState<string | null>(null);
  const [isEditor, setIsEditor] = useState(false);
  const [question, setQuestion] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const processId = 3; // שלב שאלת האתגר
  useEffect(() => {
    // רק אם:
    // - את העורכת
    // - אין עדיין שאלה
    // - יש סיכום מצוי + רצוי
    if (
      isEditor &&
      !question.trim() &&
      summary.current.trim() &&
      summary.desired.trim()
    ) {
      generateQuestionWithGPT(summary.current, summary.desired);
    }
  }, [isEditor, question, summary.current, summary.desired]);

  useEffect(() => {
    async function fetchData() {
      if (!user?.groupId || !user?.name) return;

      // 1️⃣ סיכומים (processId 2 או 1)
      let summaryData = null;
      const sumRes = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/summary?processId=2`
      );
      const sumData = await sumRes.json();

      if (!sumData.success || (!sumData.current && !sumData.desired)) {
        const aiRes = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/summary?processId=1`
        );
        summaryData = await aiRes.json();
      } else {
        summaryData = sumData;
      }

      if (summaryData?.success) {
        setSummary({
          current: summaryData.current || "",
          desired: summaryData.desired || "",
        });
      }

      // 2️⃣ עורכת לשלב 3
      let editorFromServer: string | null = null;

      const res = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId}`
      );
      const data = await res.json();

      if (data.message === "טרם נבחרה עורכת לשלב זה") {
        const res2 = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/choose-editor?processId=${processId}`,
          { method: "POST" }
        );
        const chosen = await res2.json();
        editorFromServer = chosen.editorName;
        setEditorName(chosen.editorName);
        setIsEditor(chosen.editorName === user.name);
      } else {
        editorFromServer = data.editorName;
        setEditorName(data.editorName);
        setIsEditor(data.editorName === user.name);
      }

      // 3️⃣ שאלה קיימת (אם יש)
      const qRes = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`
      );
      const qData = await qRes.json();

      if (qData.success && qData.current) {
        // כולן רואות את השאלה מהשרת
        setQuestion(qData.current);

        // 💡 אם כבר יש שאלה שמורה – נדליק גם כפתור וגם קופצת לכולן
        setShowButton(true);

        if (editorFromServer) {
          setPopupMessage(
            `${editorFromServer} תבדוק\n` +
            `אם כל בנות הקבוצה\n` +
            `מסכימות עם ניסוח שאלת האתגר המוצע.\n` +
            `במידה ולא, ${editorFromServer} תנסח את השאלה מחדש על פי הנחיית הקבוצה.`
          );
          setShowPopup(true);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [user?.groupId, user?.name]);



  // 📨 האזנה להודעות צ׳אט — עדכון שאלת האתגר בזמן אמת
  // 📨 האזנה להודעות צ׳אט — עדכון שאלת האתגר בזמן אמת
  // 📨 האזנה להודעות צ׳אט — עדכון שאלת האתגר בזמן אמת
  useEffect(() => {
    if (!messages.length) return;

    const last = messages[messages.length - 1];
    if (!last?.content || !last.content.trim().startsWith("{")) return;

    try {
      const data = JSON.parse(last.content);

      if (data.type === "QUESTION_UPDATE") {
        setQuestion(data.text);
      }

      if (data.type === "QUESTION_READY") {
        setShowButton(true);

        const editor = data.username;

        setPopupMessage(
          `${editor} תבדוק\n` +
          `עם כל בנות הקבוצה\n` +
          `מסכימות עם ניסוח שאלת האתגר המוצע.\n\n` +
          `במידה ולא, ${editor} תנסח את השאלה מחדש על פי הנחיית הקבוצה.`
        );

        setShowPopup(true);
      }

      // ✅ כשהעורכת מאשרת – כל הבנות עוברות אוטומטית לעמוד הבא
      if (data.type === "QUESTION_CONFIRMED") {
        navigate("/step2Page1");
      }

    } catch (err) {
      console.error("❌ שגיאה בפענוח:", err);
    }
  }, [messages, navigate]);




  // === יצירת שאלה בעזרת GPT ===
  const generateQuestionWithGPT = async (
    currentText: string,
    desiredText: string
  ) => {
    if (!currentText || !desiredText) return;

    try {
      setIsGenerating(true);
      setQuestion("מנסח שאלת אתגר...");

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "את עוזרת לנסח שאלת אתגר קבוצתית המבוססת על פער בין 'מצוי' ל'רצוי'. הניסוח צריך להיות שאלה פתוחה אחת, קצרה, חיובית וברורה בעברית תקנית.",
            },
            {
              role: "user",
              content: `המצוי: ${currentText}\nהרצוי: ${desiredText}\nנסחי שאלה מתאימה.`,
            },
          ],
        }),
      });

      const data = await res.json();
      const gptQuestion =
        data.choices?.[0]?.message?.content?.trim() ||
        "כיצד ניתן לגשר על הפער בין המצוי והרצוי בצורה מיטבית?";

      // ✅ מעדכן את הטקסט אצל העורכת
      setQuestion(gptQuestion);

      // משדר לכל הקבוצה את הטיוטה
      sendMessage(
        JSON.stringify({
          type: "QUESTION_UPDATE",
          text: gptQuestion,
        })
      );

      // ✅ שמירה במסד הנתונים
      const saveRes = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current: gptQuestion }),
        }
      );

      const saveData = await saveRes.json();
      if (saveData.success) {
        // ❗ במקום קופצת רק לעורכת – שולחים הודעה לכולן
        sendMessage(
          JSON.stringify({
            type: "QUESTION_READY",
            username,   // שם העורכת
            processId,
          })
        );
      }
    } catch (err) {
      console.error("❌ שגיאה ביצירת שאלת GPT:", err);
      setQuestion("שגיאה בניסוח השאלה 😔");
    } finally {
      setIsGenerating(false);
    }
  };


  // === שמירה ידנית ע"י העורכת ===
  const handleSave = async () => {
    if (!question.trim()) {
      alert("יש לנסח את שאלת האתגר לפני השמירה.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current: question }),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {

        // שולחת לכל הקבוצה שהעורכת סיימה
        sendMessage(
          JSON.stringify({
            type: "QUESTION_READY",
            username,
            processId,
          })
        );

        sendMessage(
          JSON.stringify({
            type: "question_saved",
            text: `📢 ${username} שמרה את שאלת האתגר לקבוצה!`,
          })
        );

        // הכפתור נדלק גם אצל העורכת

      }

    } catch (err) {
      console.error("❌ שגיאה בשמירה:", err);
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
    <div className="h-screen bg-white rounded-3xl shadow-lg flex flex-col items-center justify-start rtl text-right relative overflow-hidden py-4 px-8">
      {/* הודעת פופאפ */}
      {showPopup && (
        <div className="fixed top-8 left-8 bg-white shadow-xl border border-[#3B2DBB] rounded-2xl p-5 text-right z-50 animate-slide-in">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#1f1f75] font-bold mb-2">
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-gray-400 hover:text-[#1f1f75] text-2xl font-bold"
                >
                  ✕
                </button>
              </p>
              <p className="text-gray-700 text-lg whitespace-pre-line leading-relaxed">
                {popupMessage}
              </p>
            </div>

          </div>
        </div>
      )}

      <h1 className="text-[26px] font-bold text-[#1f1f75] mb-6 mt-[110px]">
        הפער בין המצוי לרצוי
      </h1>

      {/* תיבות סיכום */}
      <div className="flex flex-row-reverse justify-center gap-8 mb-6">
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
            onChange={(e) => {
              const newText = e.target.value;
              setQuestion(newText);
              sendMessage(JSON.stringify({ type: "QUESTION_UPDATE", text: newText }));
            }}
            placeholder="כתבי כאן את שאלת האתגר..."
            disabled={isGenerating} // 🔒 לא מאפשרת הקלדה בזמן ניסוח
          />
        ) : (
          <div className="bg-white border border-[#DADADA] rounded-[20px] w-[900px] h-[140px] shadow-sm flex items-center justify-center text-center p-4">
            <p className="text-[#1f1f75] text-[16px] whitespace-pre-line leading-relaxed">
              {question || "—"}
            </p>
          </div>
        )}

        {isGenerating && (
          <p className="mt-3 text-[#3B2DBB] font-semibold">
            🤖 מנסח שאלת אתגר...
          </p>
        )}

        {!isEditor && (
          <p className="mt-2 text-[#1f1f75] font-semibold text-sm">
            כעת בעריכה ע״י: {editorName || "—"}
          </p>
        )}
      </div>

      {/* כפתורים */}
      {isEditor && !showButton && (
        <button
          onClick={handleSave}
          className="mt-6 px-12 py-3 bg-[#1f1f75] text-white text-md font-semibold rounded-full shadow-md hover:scale-105 transition"
        >
          שמרי שאלת אתגר
        </button>
      )}

      {showButton && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => {
              if (!isEditor) return;

              // 📣 שולחת לכולן שהשאלה אושרה סופית
              sendMessage(
                JSON.stringify({
                  type: "QUESTION_CONFIRMED",
                  username,
                  processId,
                })
              );

              // העורכת עצמה עוברת מיד (השאר יעברו דרך ה-useEffect)
              navigate("/step2Page1");
            }}
            disabled={!isEditor}
            className={`px-12 py-3 rounded-full text-md font-semibold shadow-md transition
        ${isEditor
                ? "bg-[#1f1f75] text-white hover:scale-105"
                : "bg-[#A9B1E8] text-white cursor-not-allowed"
              }`}
          >
            {`${editorName || "—"} מאשרת את שאלת האתגר, אתן עוברות לשלב הבא!`}
          </button>
        </div>
      )}



    </div>
  );
}

// קומפוננטת תיבות סיכום
function SummaryBox({ title, color, text }: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div
      dir="rtl"
      className={`flex flex-col items-stretch ${colors.bg} p-[12px] border ${colors.border} rounded-[20px] shadow-md w-[380px] h-[180px] text-right`}
    >
      {/* הכותרת בצד ימין של הקוביה */}
      <h2 className="text-[18px] font-semibold text-[#1f1f75] mb-1 text-right w-full">
        {title}
      </h2>

      <p className="text-[#1f1f75] whitespace-pre-line text-[14px] leading-relaxed w-full text-right overflow-hidden">
        {text || "—"}
      </p>
    </div>
  );
}

