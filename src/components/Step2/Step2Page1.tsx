import React, { useEffect, useState } from "react";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";

interface Item {
  id: number;
  text: string;
  type: "need" | "constraint";
  sender: string;
  avatarUrl?: string;
  values: Record<string, number>;
}

export default function Step2Page1() {
  const navigate = useNavigate();
  const { user } = useUser();
  const username = user?.name || "משתמשת";
  const avatarUrl = user?.avatar || "/images/default-profile.png";
  const groupId = user?.groupId || 1;
  const room = `group-${groupId}`;
  const { messages, sendMessage } = useChat(room, username);

  const [needs, setNeeds] = useState<Item[]>([]);
  const [constraints, setConstraints] = useState<Item[]>([]);
  const [newText, setNewText] = useState("");
  const [activeType, setActiveType] = useState<"need" | "constraint" | null>(null);

  // === קבלת פריטים משותפים בזמן אמת ===
  useEffect(() => {
    messages.forEach((msg) => {
      try {
        const body = msg.content;
        if (body.startsWith("[new-item]")) {
          const item: Item = JSON.parse(body.replace("[new-item]", "").trim());
          if (item.type === "need") setNeeds((prev) => addUnique(prev, item));
          else setConstraints((prev) => addUnique(prev, item));
        }
      } catch {}
    });
  }, [messages]);

  const addUnique = (list: Item[], item: Item) =>
    list.find((i) => i.id === item.id) ? list : [...list, item];

  // === פתיחת שדה הוספה ===
  const handleAdd = (type: "need" | "constraint") => {
    setActiveType(type);
    setNewText("");
  };

  // === שמירת פריט חדש ===
  const handleSave = () => {
    if (!newText.trim() || !activeType) return;

    const newItem: Item = {
      id: Date.now(),
      text: newText.trim(),
      type: activeType,
      sender: username,
      avatarUrl,
      values: {},
    };

    if (activeType === "need") setNeeds((p) => [...p, newItem]);
    else setConstraints((p) => [...p, newItem]);

    sendMessage(`[new-item] ${JSON.stringify(newItem)}`);
    setNewText("");
    setActiveType(null);
  };

  // === שינוי דירוג ===
  const handleValueChange = (item: Item, delta: number) => {
    const newVal = Math.max(1, Math.min(3, (item.values?.[username] || 1) + delta));
    const updated = { ...item, values: { ...item.values, [username]: newVal } };
    const setter = item.type === "need" ? setNeeds : setConstraints;
    setter((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  };

  // === לשלב הבא ===
  const handleNext = () => {
    const all = [...needs, ...constraints];
    const ranked = all
      .map((i) => ({
        ...i,
        total: Object.values(i.values).reduce((a, b) => a + b, 0),
      }))
      .sort((a, b) => b.total - a.total);

    const topNeeds = ranked.filter((i) => i.type === "need").slice(0, 5);
    const topConstraints = ranked.filter((i) => i.type === "constraint").slice(0, 5);

    localStorage.setItem(
      `step2_top_${room}`,
      JSON.stringify([...topNeeds, ...topConstraints])
    );
    navigate("/step2Page2");
  };

  return (
<div dir="rtl" className="min-h-[93vh] bg-white rounded-3xl shadow-lg p-10 flex flex-col justify-between text-right">
<h1 className="text-3xl font-bold text-[#1f1f75] text-center mb-4">
        חשבי על צרכים ואילוצים שצריך לקחת בחשבון בתכנון המוצר.
      </h1>
      <p className="text-center text-gray-700 mb-10 text-lg">
        כולכן יכולות להוסיף ולדרג 1–3 לפי חשיבות. כל בת מדרגת לעצמה בלבד.
      </p>

      {/* עמודות */}
      <div className="flex flex-col md:flex-row justify-center gap-10">
        <Column
          title="צרכים – מה הצורך באתגר?"
          color="blue"
          items={needs}
          handleValueChange={handleValueChange}
          username={username}
          isActive={activeType === "need"}
          onAddClick={() => handleAdd("need")}
          newText={newText}
          setNewText={setNewText}
          handleSave={handleSave}
          onCancel={() => setActiveType(null)}
        />
        <Column
          title="אילוצים – מה האילוץ באתגר?"
          color="purple"
          items={constraints}
          handleValueChange={handleValueChange}
          username={username}
          isActive={activeType === "constraint"}
          onAddClick={() => handleAdd("constraint")}
          newText={newText}
          setNewText={setNewText}
          handleSave={handleSave}
          onCancel={() => setActiveType(null)}
        />
      </div>

      {/* כפתור המשך */}
      <div className="flex justify-center mt-12">
        <button
          onClick={handleNext}
          className="px-10 py-3 bg-[#DF57FF] text-white rounded-full text-xl font-semibold hover:bg-[#c93fe9] transition flex items-center gap-2"
        >
          לשלב הבא
          <ChevronLeft size={22} />
        </button>
      </div>
    </div>
  );
}

/* --- קומפוננטת עמודה --- */
function Column({
  title,
  color,
  items,
  handleValueChange,
  username,
  isActive,
  onAddClick,
  newText,
  setNewText,
  handleSave,
  onCancel,
}: any) {
  const colors =
    color === "blue"
      ? {
          bg: "bg-[#E6F9FF]",
          border: "border-[#BEEAFF]",
          accent: "text-[#007b8e] border-[#00bcd4]",
          label: "צורך:",
        }
      : {
          bg: "bg-[#EFE9FF]",
          border: "border-[#E0D4FF]",
          accent: "text-[#7a3eff] border-[#b47cff]",
          label: "אילוץ:",
        };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} border ${colors.border} rounded-[20px] shadow-md p-6 w-[450px]`}
    >
      <h2 className="text-xl font-semibold text-[#1f1f75] mb-5">{title}</h2>

      {/* פריטים קיימים */}
     {/* פריטים קיימים */}
{items.map((item: any) => (
  <div
    key={item.id}
    className="relative bg-white border border-[#DADADA] rounded-xl px-5 py-4 mb-4 shadow-sm w-full text-right"
  >
  {/* תמונת פרופיל + שם */}
  <div className="absolute top-1 right-3 flex items-center gap-2 translate-y-[0px]">
  <img
    src={item.avatarUrl || "/images/default-profile.png"}
    alt="avatar"
    className={`w-8 h-8 rounded-full ${
      color === "blue" ? "border-[#00bcd4]" : "border-[#b47cff]"
    } object-cover`}
  />
  <span className="text-sm font-semibold text-[#1f1f75]">
    {item.sender}
  </span>
</div>

    {/* שורה שנייה – צורך/אילוץ + טקסט + כפתורי דירוג */}
    <div className="flex items-center justify-between">
      {/* טקסט */}
      <p className="text-sm text-[#1f1f75] leading-snug translate-y-[15px]">
  <span className="font-semibold">
    {color === "blue" ? "צורך:" : "אילוץ:"}
  </span>{" "}
  {item.text}
</p>


      {/* כפתורי דירוג */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleValueChange(item, 1)}
          className="bg-[#f3e8ff] text-[#4b0082] w-8 h-8 flex justify-center items-center rounded-md"
        >
          <Plus size={14} />
        </button>
        <span className="text-[#1f1f75] font-semibold w-4 text-center">
          {item.values?.[username] || 1}
        </span>
        <button
          onClick={() => handleValueChange(item, -1)}
          className="bg-[#f3e8ff] text-[#4b0082] w-8 h-8 flex justify-center items-center rounded-md"
        >
          <Minus size={14} />
        </button>
      </div>
    </div>
  </div>
))}

      {/* שדה הוספה חדש */}
      {isActive ? (
        <div className="bg-white border border-[#DADADA] rounded-xl px-4 py-3 shadow-sm w-full flex flex-col gap-3 mt-4 animate-[fadeIn_0.3s_ease]">
          <input
            type="text"
            placeholder={
              color === "blue" ? "הקלידי צורך חדש..." : "הקלידי אילוץ חדש..."
            }
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="border border-[#DADADA] rounded-lg px-3 py-2 w-full text-right outline-none focus:ring-2 focus:ring-[#9E77ED]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSave}
              className="bg-[#1f1f75] text-white px-4 py-1 rounded-full text-sm hover:bg-[#15115f] transition"
            >
              שמירה
            </button>
            <button
              onClick={onCancel}
              className="text-gray-600 text-sm hover:text-[#1f1f75]"
            >
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onAddClick}
          className={`mt-auto px-6 py-2 rounded-full font-semibold text-lg shadow-sm border ${colors.accent} bg-white hover:bg-[#f8f8ff] transition`}
        >
          {color === "blue" ? "הוספת צורך +" : "הוספת אילוץ +"}
        </button>
      )}
    </div>
  );
}
