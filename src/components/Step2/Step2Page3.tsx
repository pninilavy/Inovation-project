import React, { useEffect, useState } from "react";
import { ChevronLeft, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

interface Item {
  id: number;
  text: string;
  type: "need" | "constraint";
  sender: string;
  avatarUrl?: string;
  values: Record<string, number>;
}

export default function Step2Page3() {
  const { user } = useUser();
  const navigate = useNavigate();
  const username = user?.name || "משתמשת";
  const avatarUrl = user?.avatar || "/images/default-profile.png";
  const room = `group-${user?.groupId || 1}`;
  const [items, setItems] = useState<Item[]>([]);

  // === טעינת הנתונים הסופיים מהעורכת + מהTop10 ===
  useEffect(() => {
    const base = JSON.parse(localStorage.getItem(`step2_final_${room}`) || "[]");
    const reset = base.map((item: Item) => ({
      ...item,
      avatarUrl: item.avatarUrl || "/images/default-profile.png",
      values: { [username]: 1 },
    }));

    setItems(reset);
  }, [room]);

  // === שינוי דירוג לוקאלי בלבד (שלא ישפיע על אחרות) ===
  const handleValueChange = (item: Item, delta: number) => {
    const newVal = Math.max(1, Math.min(3, (item.values?.[username] || 1) + delta));
    const updated = { ...item, values: { ...item.values, [username]: newVal } };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  };

  // === מעבר לשלב הבא ===
  const handleNext = () => {
    localStorage.setItem(`step3_rankings_${room}`, JSON.stringify(items));
    navigate("/step2Page4");
  };

  return (
    <div dir="rtl" className="min-h-[93vh] bg-white rounded-3xl shadow-lg p-10 rtl">
      <h1 className="text-3xl font-bold text-[#1f1f75] text-center mb-6">
        דרגו שוב את הצרכים והאילוצים שנבחרו על ידי הקבוצה
      </h1>
      <p className="text-center text-gray-700 mb-10 text-lg">
        דרגי כל אחד מהם לפי שיקול דעתך בטווח של 1–3.
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-10">
        <Column
          title="צרכים – מה הצורך באתגר?"
          color="blue"
          items={items.filter((i) => i.type === "need")}
          handleValueChange={handleValueChange}
        />
        <Column
          title="אילוצים – מה האילוץ באתגר?"
          color="purple"
          items={items.filter((i) => i.type === "constraint")}
          handleValueChange={handleValueChange}
        />
      </div>

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

function Column({
  title,
  color,
  items,
  handleValueChange,
}: {
  title: string;
  color: "blue" | "purple";
  items: Item[];
  handleValueChange: (item: Item, delta: number) => void;
}) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} border ${colors.border} rounded-[20px] shadow-md p-6 w-[450px]`}
    >
      <h2 className="text-xl font-semibold text-[#1f1f75] mb-5">{title}</h2>

      {items.map((item) => (
        <div
          key={item.id}
          className="relative bg-white border border-[#DADADA] rounded-xl px-5 py-4 mb-4 shadow-sm w-full text-right"
        >
          {/* תמונת פרופיל + שם */}
          <div className="absolute top-1 right-3 flex items-center gap-2 translate-y-[0px]">
            <img
              src={item.avatarUrl || "/images/default-profile.png"}
              alt="avatar"
              className={`w-8 h-8 rounded-full border-2 ${
                color === "blue" ? "border-[#00bcd4]" : "border-[#b47cff]"
              } object-cover`}
            />
            <span className="text-sm font-semibold text-[#1f1f75]">
              {item.sender}
            </span>
          </div>

          {/* טקסט הצורך / אילוץ */}
          <p className="text-sm text-[#1f1f75] leading-snug translate-y-[35px]">
            <span className="font-semibold">
              {color === "blue" ? "צורך:" : "אילוץ:"}
            </span>{" "}
            {item.text}
          </p>

          {/* כפתורי דירוג */}
          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={() => handleValueChange(item, 1)}
              className="bg-[#f3e8ff] text-[#4b0082] w-8 h-8 flex justify-center items-center rounded-md"
            >
              <Plus size={14} />
            </button>
            <span className="text-[#1f1f75] font-semibold w-4 text-center">
              {item.values?.[Object.keys(item.values).find((k) => k)] || 1}
            </span>
            <button
              onClick={() => handleValueChange(item, -1)}
              className="bg-[#f3e8ff] text-[#4b0082] w-8 h-8 flex justify-center items-center rounded-md"
            >
              <Minus size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
