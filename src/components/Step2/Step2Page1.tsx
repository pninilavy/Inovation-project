import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { Trash } from "lucide-react";

// ---------- TYPES ----------
interface DraftItem {
  id: number;
  text: string;
}

interface AiExamples {
  needs: string[];
  constraints: string[];
}

// -----------------------------------------------------

export default function Step2Page1() {
  const navigate = useNavigate();
  const { user } = useUser();

  const groupId = user?.groupId || 1;
  const username = user?.name || "משתמשת";
  const avatarUrl = user?.avatar || "/images/default-profile.png";

  const room = `group-${groupId}`;
  const { messages, sendMessage, connected } = useChat(room, username);

  // --- STATES ---
  const [summaryQuestion, setSummaryQuestion] = useState("");
  const [aiExamples, setAiExamples] = useState<AiExamples | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const hasRequestedAiRef = useRef(false);

  const [needsDrafts, setNeedsDrafts] = useState<DraftItem[]>([]);
  const [constraintsDrafts, setConstraintsDrafts] = useState<DraftItem[]>([]);
  const [newNeedText, setNewNeedText] = useState("");
  const [newConstraintText, setNewConstraintText] = useState("");

  const [selectedNeedId, setSelectedNeedId] = useState<number | null>(null);
  const [selectedConstraintId, setSelectedConstraintId] = useState<number | null>(null);

  // ----- טעינת שאלת האתגר -----
  useEffect(() => {
    async function loadQuestion() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${groupId}/summary?processId=3`
        );
        const data = await res.json();

        if (data.success && data.current) {
          setSummaryQuestion(data.current);
        }
      } catch (err) {
        console.error("Failed loading question", err);
      }
    }

    loadQuestion();
  }, [groupId]);

  // ⭐ יצירת או קבלת דוגמאות אוטומטית בכניסה לעמוד
  useEffect(() => {
    if (!connected) return;
    if (!summaryQuestion) return;
    if (aiExamples) return;
    if (hasRequestedAiRef.current) return;

    const msg = messages.find((m) =>
      m.content?.startsWith("[AI_EXAMPLES]")
    );

    if (msg) {
      try {
        const parsed = JSON.parse(msg.content.replace("[AI_EXAMPLES]", "").trim());
        setAiExamples(parsed.data);
        setAiLoading(false);
      } catch (e) {
        console.error("parse error", e);
      }
      return;
    }

    console.log("⭐ את הראשונה — יוצרת דוגמאות GPT");
    hasRequestedAiRef.current = true;
    generateAiExamples();
  }, [connected, messages, summaryQuestion]);

  // ----- האזנה להגעת דוגמאות מהקבוצה -----
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;

    if (last.content.startsWith("[AI_EXAMPLES]")) {
      const json = JSON.parse(last.content.replace("[AI_EXAMPLES]", "").trim());

      if (json.sender === username) return;

      setAiExamples(json.data);
      setAiLoading(false);
    }
  }, [messages]);

  // ----- GPT -----
  async function generateAiExamples() {
    sendMessage("[LOCK_EXAMPLES]");
    setAiLoading(true);
    setAiError(null);

    try {
      const payload = {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              'את יוצרת דוגמאות לצרכים ואילוצים בהקשר לשאלת האתגר. החזירי JSON בלבד: {"needs":["..."],"constraints":["..."]}',
          },
          {
            role: "user",
            content: `שאלת האתגר: ${summaryQuestion}`,
          },
        ],
      };

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content || "{}";

      const first = raw.indexOf("{");
      const last = raw.lastIndexOf("}");
      const jsonText = raw.slice(first, last + 1);

      const parsed = JSON.parse(jsonText);

      setAiExamples(parsed);

      sendMessage(
        "[AI_EXAMPLES] " +
        JSON.stringify({
          sender: username,
          data: parsed,
        })
      );

      console.log("✅ נוצרו דוגמאות GPT ונשלחו");
    } catch (err) {
      console.error("GPT error", err);
      setAiError("שגיאה בחיבור ל־GPT");
    } finally {
      setAiLoading(false);
    }
  }

  // ----- ADD ITEMS -----
  function addNeed() {
    if (!newNeedText.trim() || needsDrafts.length >= 2) return;
    setNeedsDrafts((p) => [...p, { id: Date.now(), text: newNeedText.trim() }]);
    setNewNeedText("");
  }

  function addConstraint() {
    if (!newConstraintText.trim() || constraintsDrafts.length >= 2) return;
    setConstraintsDrafts((p) => [
      ...p,
      { id: Date.now(), text: newConstraintText.trim() },
    ]);
    setNewConstraintText("");
  }

  function deleteNeed(id: number) {
    setNeedsDrafts((prev) => prev.filter((n) => n.id !== id));
    if (selectedNeedId === id) setSelectedNeedId(null);
  }

  function deleteConstraint(id: number) {
    setConstraintsDrafts((prev) => prev.filter((c) => c.id !== id));
    if (selectedConstraintId === id) setSelectedConstraintId(null);
  }

  // ----- SEND -----
  async function handleSend() {
    if (
      needsDrafts.length !== 2 ||
      constraintsDrafts.length !== 2 ||
      selectedNeedId === null ||
      selectedConstraintId === null
    )
      return;
  
    if (!connected) {
      alert("החיבור לקבוצה לא פעיל כרגע");
      return;
    }
  
    const need = needsDrafts.find((n) => n.id === selectedNeedId)!;
    const con = constraintsDrafts.find((c) => c.id === selectedConstraintId)!;
  
    sendMessage(
      "[add-item] " +
        JSON.stringify({
          id: Date.now(),
          text: need.text,
          type: "need",
          sender: username,
          avatarUrl,
          values: {},
        })
    );
  
    sendMessage(
      "[add-item] " +
        JSON.stringify({
          id: Date.now() + 1,
          text: con.text,
          type: "constraint",
          sender: username,
          avatarUrl,
          values: {},
        })
    );
  
    sendMessage(`[step2-done] ${username}`);
  
    // 👇 כמו בעמוד 4 – לתת רגע לצ'אט להתעדכן
    await new Promise((r) => setTimeout(r, 400));
  
    navigate("/step2Page2");
  }
  // ----- LOADING -----
  if (aiLoading && !aiExamples) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="loader"></div>
        <p className="mt-4 text-xl font-semibold">מכינה דוגמה…</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-[93vh] bg-white p-10 rounded-3xl shadow-lg">
      <h1 className="text-3xl font-bold text-center text-[#1f1f75] mb-6">
        חשבי על 2 צרכים ו־2 אילוצים
      </h1>

      <div className="flex justify-center gap-10">
        <DraftColumn
          title="צרכים – מה הצורך?"
          color="blue"
          drafts={needsDrafts}
          newText={newNeedText}
          setNewText={setNewNeedText}
          onAdd={addNeed}
          selectedId={selectedNeedId}
          onSelect={setSelectedNeedId}
          onDelete={deleteNeed}
          aiItems={aiExamples?.needs || []}
          user={user}
        />

        <DraftColumn
          title="אילוצים – מה האילוץ?"
          color="purple"
          drafts={constraintsDrafts}
          newText={newConstraintText}
          setNewText={setNewConstraintText}
          onAdd={addConstraint}
          selectedId={selectedConstraintId}
          onSelect={setSelectedConstraintId}
          onDelete={deleteConstraint}
          aiItems={aiExamples?.constraints || []}
          user={user}
        />
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleSend}
          disabled={
            needsDrafts.length !== 2 ||
            constraintsDrafts.length !== 2 ||
            selectedNeedId === null ||
            selectedConstraintId === null
          }
          className={`px-10 py-3 rounded-full text-xl font-semibold flex items-center gap-2 ${needsDrafts.length === 2 &&
            constraintsDrafts.length === 2 &&
            selectedNeedId !== null &&
            selectedConstraintId !== null
            ? "bg-[#DF57FF] text-white"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
        >
          שמרי ושלחי לקבוצה <ChevronLeft />
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// -------------------- DRAFT COLUMN COMPONENT --------------------------

function DraftColumn({
  title,
  color,
  drafts,
  newText,
  setNewText,
  onAdd,
  selectedId,
  onSelect,
  onDelete,
  aiItems,
  user,
}: {
  title: string;
  color: "blue" | "purple";
  drafts: DraftItem[];
  newText: string;
  setNewText: (v: string) => void;
  onAdd: () => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  user: any;
  aiItems: string[];
}) {
  const style =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", pastel: "bg-[#F0FBFF]", label: "text-[#006d83]" }
      : { bg: "bg-[#EFE9FF]", pastel: "bg-[#F7F0FF]", label: "text-[#7a3eff]" };

  return (
    <div
      className={`flex flex-col items-end w-[460px] p-6 rounded-[20px] shadow-md border ${style.bg}`}
    >
      <h2
        className="text-xl font-semibold text-[#1f1f75] mb-4 text-right w-full"
        dir="rtl"
      >
        {title}
      </h2>

      {aiItems.length > 0 && (
        <div className="w-full mb-4">
          <div className={`${style.pastel} p-4 rounded-xl`}>
            <p className={`font-semibold ${style.label}`}>
              <Lightbulb className="inline-block ml-1" size={16} /> דוגמה
            </p>
            <p className="text-sm text-[#1f1f75] mt-2">{aiItems[0]}</p>
          </div>
        </div>
      )}

      {drafts.map((item) => (
        <div
          key={item.id}
          className={`bg-white w-full p-3 mb-3 rounded-xl border ${selectedId === item.id ? "border-[#1f1f75]" : "border-gray-300"
            }`}
        >

          {/* שורה עליונה – פרופיל מימין, פח משמאל */}
          <div className="flex justify-between items-center">

            {/* פרופיל */}
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                className="w-6 h-6 rounded-full border object-cover"
              />
              <p className="text-xs text-[#1f1f75] font-semibold">{user.name}</p>
            </div>

            {/* פח אפור */}
            <button
              onClick={() => onDelete(item.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Trash size={16} />
            </button>
          </div>

          {/* שורה של המשפט + כפתור סמני כחשוב */}
          <div className="flex justify-between items-center mt-2">

            {/* טקסט הצורך/אילוץ */}
            <p className="text-[#1f1f75] text-sm">{item.text}</p>

            {/* כפתור חשיבות */}
            <button
              onClick={() => onSelect(item.id)}
              className="text-xs px-3 py-1 rounded-full border whitespace-nowrap"
            >
              {selectedId === item.id ? "החשוב ביותר" : "סמני כחשוב"}
            </button>
          </div>
        </div>
      ))}


      {drafts.length < 2 && (
        <div className="bg-white border p-4 rounded-xl w-full">
          <input
            className="w-full border p-2 rounded"
            placeholder="הקלידי..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={onAdd}
              className="bg-[#1f1f75] text-white px-4 py-1 rounded-full"
            >
              הוספה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
