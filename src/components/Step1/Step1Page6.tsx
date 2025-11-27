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
  const { messages, sendMessage, connected } = useChat(room, username);

  const [editorName, setEditorName] = useState<string | null>(null);
  const [summary, setSummary] = useState({ current: "", desired: "" });
  const [loading, setLoading] = useState(true);
  const [isEditor, setIsEditor] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ⭐ חדש – רשימת בנות הקבוצה
  const [members, setMembers] = useState<string[]>([]);

  const processId = 1;

  const [hasSentReady, setHasSentReady] = useState(false);

  // === שליפת נתונים ראשונית ===
  useEffect(() => {
    async function fetchData() {
      if (!user?.groupId || !user?.name) return;

      try {
        // 🔹 מי העורכת
        const res = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId}`
        );
        const data = await res.json();

        let chosenEditor = data.editorName as string | undefined;

        // אם אין עורכת — נגריל אחת ושולחים לצ'אט
        if (!chosenEditor) {
          const res2 = await fetch(
            `http://localhost:8080/api/groups/${user.groupId}/choose-editor?processId=${processId}`,
            { method: "POST" }
          );
          const chosen = await res2.json();
          chosenEditor = chosen.editorName;

          if (connected) {           // ⬅️ שולחים לצ'אט רק אם מחוברים
            sendMessage(`[EDITOR_CHOSEN]${chosen.editorName}`);
          }
        }


        if (!chosenEditor) {
          setLoading(false);
          return;
        }

        setEditorName(chosenEditor);
        const meIsEditor = chosenEditor === user.name;
        setIsEditor(meIsEditor);

        setPopupMessage(
          meIsEditor
            ? "נבחרת לבדוק אם כל בנות הקבוצה מסכימות עם הסיכום המוצע.\nבמידה ולא, תוכלי לערוך את הסיכום מחדש על פי הנחיית הקבוצה."
            : `${chosenEditor} נבחרה לבדוק אם כל בנות הקבוצה מסכימות עם הסיכום המוצע.\nבמידה ולא, ${chosenEditor} תערוך את הסיכום מחדש על פי הנחיית הקבוצה.`
        );

        // 🔹 שליפת הסיכום
        const sumRes = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`
        );
        const sumData = await sumRes.json();
        if (sumData.success) {
          setSummary({
            current: sumData.current || "",
            desired: sumData.desired || "",
          });
        }

        // ⭐ חדש – שליפת חברות הקבוצה (כמו בעמוד 5)
        const memRes = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/members`
        );
        const memData = await memRes.json();
        setMembers(
          memData.map(
            (s: any) => `${s.firstName} ${s.lastName}`
          )
        );
      } catch (err) {
        console.error("❌ שגיאה בשליפת נתונים:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?.groupId, user?.name]);

  // ⭐ חדש – כשנכנסים לעמוד, מסמנות בצ'אט שאנחנו בעמוד 6
  // כשנכנסים לעמוד 6 – מסמנות בצ'אט שאנחנו בעמוד 6 (פעם אחת בלבד למשתמשת)

  useEffect(() => {
    if (!user?.name) return;
    if (!connected) return;   // ⬅️ מחכים עד שה-WebSocket מחובר
    if (hasSentReady) return; // ⬅️ שלא נשלח פעמיים

    sendMessage("[STEP1_PAGE6_READY]");
    setHasSentReady(true);
  }, [user?.name, connected, hasSentReady, sendMessage]);



  // 🧠 האזנה להודעות מהצ'אט
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;

    if (last.content.startsWith("[EDITOR_CHOSEN]")) {
      const name = last.content.replace("[EDITOR_CHOSEN]", "").trim();
      setEditorName(name);
      setIsEditor(name === user?.name);

      setPopupMessage(
        name === user?.name
          ? "נבחרת לבדוק אם כל בנות הקבוצה מסכימות עם הסיכום המוצע.\nבמידה ולא, תוכלי לערוך את הסיכום מחדש על פי הנחיית הקבוצה."
          : `${name} נבחרה לבדוק אם כל בנות הקבוצה מסכימות עם הסיכום המוצע.\nבמידה ולא, ${name} תערוך את הסיכום מחדש על פי הנחיית הקבוצה.`
      );
    }

    if (last.content === "[SUMMARY_APPROVED]") navigate("/step1Page8");
    if (last.content === "[SUMMARY_EDIT]") navigate("/step1Page7");
  }, [messages, navigate, user?.name]);

  // ⭐ חדש – חישוב מי כבר "נמצאת בעמוד 6" לפי הודעות STEP1_PAGE6_READY
  const readyUsernames = Array.from(
    new Set(
      messages
        .filter((m: any) => m.content === "[STEP1_PAGE6_READY]")
        .map((m: any) => m.username)
    )
  );

  const missing = members.filter((name) => !readyUsernames.includes(name));
  const allReady = members.length > 0 && missing.length === 0;

  // ⭐ העורכת יכולה לבחור רק אם היא העורכת וגם כולן בעמוד
  const canEditorDecide = isEditor && allReady;

  // === פעולות העורכת ===
  const handleApprove = () => {
    if (!canEditorDecide) return;
    sendMessage("[SUMMARY_APPROVED]");
    navigate("/step1Page8");
  };

  const handleEdit = () => {
    if (!canEditorDecide) return;
    sendMessage("[SUMMARY_EDIT]");
    navigate("/step1Page7");
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] text-[#1f1f75]">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>טוען נתונים...</p>
      </div>
    );

  return (
    <div
      dir="rtl"
      className="min-h-[93vh] bg-white flex flex-col items-center rounded-3xl px-6 py-10 text-right relative"
    >
      {/* הודעה קופצת */}
      {popupMessage && (
        <div className="fixed top-10 left-10 bg-white shadow-lg border border-[#C6C6F8] rounded-xl px-6 py-4 text-right max-w-lg w-[380px] animate-fade-slide z-50">
          <div className="flex justify-between items-start">
            <p className="text-sm text-[#1f1f75] font-medium leading-relaxed whitespace-pre-line">
              {popupMessage}
            </p>
            <button
              onClick={() => setPopupMessage("")}
              className="text-gray-400 hover:text-[#3B2DBB] text-lg font-bold ml-3"
              title="סגירה"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-[#1f1f75] mb-10">לסיכום:</h1>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl justify-center items-start">
        <SummaryBox title="המצוי:" color="blue" value={summary.current} />
        <SummaryBox title="הרצוי:" color="purple" value={summary.desired} />
      </div>

      <p className="mt-10 text-[#1f1f75] font-semibold">
        האם אתן מסכימות עם ניסוח הסיכום המוצע?
      </p>

      {/* ⭐ טקסט הסבר כמו בעמוד 5 */}
      <p className="mt-3 text-sm text-[#1f1f75]">
        {allReady ? (
          <>
            {editorName ?? ""} – כולן בקצב, אפשר לבחור את החלטת הקבוצה.
          </>
        ) : (
          <>
            הבחירה תינתן לעורכת {editorName ?? ""} רק כאשר כל בנות הקבוצה נמצאות בשלב זה.
            {!allReady && missing.length > 0 && (
              <>
                <br />
                עדיין מחכות ל: {missing.join(", ")}
              </>
            )}
          </>
        )}
      </p>

      {/* כפתורים */}
      <div className="mt-8 flex gap-8">
        {/* מסכימות – בצבע של המסגרת/הרצוי */}
        <button
          onClick={handleApprove}
          disabled={!canEditorDecide}
          className={`px-10 py-3 rounded-full text-xl font-semibold transition ${canEditorDecide
            ? "bg-[#E0D4FF] text-[#1f1f75] hover:bg-[#C9B7FF]"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
        >
          מסכימות
        </button>

        {/* ניתן לנסח זאת נכון יותר – אפור */}
        <button
          onClick={handleEdit}
          disabled={!canEditorDecide}
          className={`px-10 py-3 rounded-full text-xl font-semibold transition ${canEditorDecide
            ? "bg-[#E0E0E0] text-[#1f1f75] hover:bg-[#D5D5D5]"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
        >
          חושבות שניתן לנסח זאת נכון יותר
        </button>
      </div>
    </div>
  );
}

// ✅ קומפוננטת סיכום – נשאר כמו שהיה
function SummaryBox({
  title,
  color,
  value,
}: {
  title: string;
  color: "blue" | "purple";
  value: string;
}) {
  const colors =
    color === "blue"
      ? {
        outerBg: "bg-[#E6F9FF]", // כחול עדין
        outerBorder: "border-[#BEEAFF]",
        innerBorder: "border-[#87D8FF]", // כחול חזק יותר
      }
      : {
        outerBg: "bg-[#F6EFFF]", // סגול עדין
        outerBorder: "border-[#E0D4FF]",
        innerBorder: "border-[#C39BFF]", // סגול חזק יותר
      };

  return (
    <div
      dir="rtl"
      className={`flex-1 rounded-[20px] p-6 shadow-md border ${colors.outerBorder} ${colors.outerBg}`}
      style={{ width: "447px" }}
    >
      <div className="flex items-center justify-start mb-4">
        <img
          src={color === "blue" ? "/images/Emoji2.png" : "/images/Emoji1.png"}
          alt=""
          className="w-6 h-6 ml-2"
        />
        <h2 className="text-xl font-semibold text-[#1f1f75]">{title}</h2>
      </div>

      <div
        className={`bg-white rounded-xl p-4 h-[230px] border text-gray-800 leading-relaxed text-right overflow-y-auto whitespace-pre-wrap ${colors.innerBorder}`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

/* ✨ אנימציה לקופצת */
const style = document.createElement("style");
style.innerHTML = `
@keyframes fade-slide {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-slide {
  animation: fade-slide 0.5s ease-out;
}
`;
document.head.appendChild(style);
