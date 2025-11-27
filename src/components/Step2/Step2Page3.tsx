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

interface Member {
  id: number;
  name: string;
  avatar: string;
}

export default function Step2Page3() {
  const navigate = useNavigate();
  const { user } = useUser();
  const username = user?.name || "משתמשת";
  const avatarUrl = user?.avatar || "/images/default-profile.png";
  const groupId = user?.groupId || 1;
  const room = `group-${groupId}`;
  const { messages, sendMessage } = useChat(room, username);

  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [doneUsers, setDoneUsers] = useState<string[]>([]);
  const [allFinished, setAllFinished] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [locked, setLocked] = useState(false); // ⭐ חדש — נעילת הדירוגים אחרי "סיימתי"

  // --- טעינת חברות הקבוצה ---
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`http://localhost:8080/api/groups/${groupId}/members`);
        const data = await res.json();
        const formatted = data.map((m: any) => ({
          id: m.id,
          name: `${m.firstName} ${m.lastName}`,
          avatar: m.avatarUrl || "/images/default-profile.png",
        }));
        setMembers(formatted);
        localStorage.setItem(`group_${groupId}_members`, formatted.length.toString());
      } catch (err) {
        console.error("❌ שגיאה בשליפת חברות:", err);
      } finally {
        setLoadingMembers(false);
      }
    }
    fetchMembers();
  }, [groupId]);

  // --- טעינת הצרכים והאילוצים ---
  // --- בניית רשימת הצרכים/אילוצים מהצ'אט (אחרי כל ההוספות והמחיקות) ---
  useEffect(() => {
    let newItems: Item[] = [];
    const removedIds = new Set<number>();

    messages.forEach((m) => {
      const content = m.content || "";

      if (content.startsWith("[add-item]")) {
        try {
          const item: Item = JSON.parse(
            content.replace("[add-item]", "").trim()
          );
          newItems.push(item);
        } catch (e) {
          console.error("parse add-item error", e);
        }
      } else if (content.startsWith("[remove-item]")) {
        try {
          const id = JSON.parse(
            content.replace("[remove-item]", "").trim()
          ) as number;
          removedIds.add(id);
        } catch (e) {
          console.error("parse remove-item error", e);
        }
      }
    });

    // מורידים פריטים שנמחקו + מסננים כפילויות לפי id
    const uniqueById = new Map<number, Item>();
    newItems.forEach((it) => {
      if (!removedIds.has(it.id)) {
        uniqueById.set(it.id, it);
      }
    });

    setItems(Array.from(uniqueById.values()));
  }, [messages]);

  // --- שינוי דירוג ---
  const handleValueChange = (item: Item, delta: number) => {
    if (locked) return; // ⭐ נעול — אי אפשר לשנות

    const newVal = Math.max(1, Math.min(3, (item.values?.[username] || 1) + delta));
    const updated = { ...item, values: { ...item.values, [username]: newVal } };

    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    sendMessage(`[update-value] ${JSON.stringify({ id: item.id, username, value: newVal })}`);
  };

  // --- הודעות צ'אט ---
  useEffect(() => {
    messages.forEach((msg) => {
      const content = msg.content;

      if (content.startsWith("[update-value]")) {
        const { id, username, value } = JSON.parse(content.replace("[update-value]", "").trim());
        setItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, values: { ...i.values, [username]: value } } : i
          )
        );
      }

      else if (content.startsWith("[user-finished]")) {
        const name = content.replace("[user-finished]", "").trim();
        setDoneUsers((prev) => (prev.includes(name) ? prev : [...prev, name]));
      }

      else if (content.startsWith("[all-finished]")) {
        setAllFinished(true);
      }
    });
  }, [messages]);

  // --- כשלוחצת "סיימתי" ---
  const handleFinish = () => {
    // ⭐ שמירת הדירוגים בלוקאל
    const existing = JSON.parse(localStorage.getItem(`step3_rankings_${room}`) || "{}");

    existing[username] = items.map((item) => ({
      id: item.id,
      text: item.text,
      type: item.type,
      sender: item.sender,
      avatarUrl: item.avatarUrl,
      value: item.values?.[username] || 1,
    }));

    localStorage.setItem(`step3_rankings_${room}`, JSON.stringify(existing));

    setLocked(true); // ⭐ נועלים את הדירוגים
    sendMessage(`[user-finished] ${username}`);
  };

  // --- כשהכולן סיימו ---
  useEffect(() => {
    const membersCount = Number(localStorage.getItem(`group_${groupId}_members`) || 0);
    if (membersCount > 0 && doneUsers.length === membersCount) {
      sendMessage("[all-finished]");
      setAllFinished(true);
    }
  }, [doneUsers]);

  // --- לשלב הבא ---
  const handleNext = () => {
    navigate("/step2Page4");
  };

  if (loadingMembers)
    return <div className="text-center mt-20 text-[#1f1f75]">טוען את חברות הקבוצה...</div>;

  return (
    <div dir="rtl" className="min-h-[93vh] bg-white rounded-3xl shadow-lg p-10 rtl">
      <h1 className="text-3xl font-bold text-[#1f1f75] text-center mb-6">
        דרגו שוב את הצרכים והאילוצים שנבחרו על ידי הקבוצה
      </h1>

      <p className="text-center text-gray-700 mb-10 text-lg">
        דרגי כל אחד מהם בטווח של 1–3 לפי שיקול דעתך.
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-10">
        <Column
          title="צרכים – מה הצורך באתגר?"
          color="blue"
          items={items.filter((i) => i.type === "need")}
          handleValueChange={handleValueChange}
          username={username}
          locked={locked} // ⭐ נעילה
        />
        <Column
          title="אילוצים – מה האילוץ באתגר?"
          color="purple"
          items={items.filter((i) => i.type === "constraint")}
          handleValueChange={handleValueChange}
          username={username}
          locked={locked}
        />
      </div>

      <div className="flex justify-center mt-12 gap-4">
        <button
          onClick={handleFinish}
          disabled={locked}
          className={`px-10 py-3 rounded-full text-xl font-semibold transition
            ${locked ? "bg-blue-400 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}
          `}
        >
          {locked ? "✔ סיימת" : "סיימתי"}
        </button>

        <button
          onClick={handleNext}
          disabled={!allFinished}
          className={`px-10 py-3 rounded-full text-xl font-semibold transition ${allFinished
              ? "bg-[#DF57FF] text-white hover:bg-[#c93fe9]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          לשלב הבא <ChevronLeft size={22} />
        </button>
      </div>

      {!allFinished && (
        <p className="text-center text-[#1f1f75] mt-4 text-lg">
          ⏳ מחכים שכל הבנות יסיימו...
        </p>
      )}
    </div>
  );
}

function Column({ title, color, items, handleValueChange, username, locked }: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div className={`flex flex-col items-end ${colors.bg} border ${colors.border} rounded-[20px] shadow-md p-6 w-[450px]`}>
      <h2 className="text-xl font-semibold text-[#1f1f75] mb-5">{title}</h2>

      {items.map((item: any) => (
        <div
          key={item.id}
          className="relative bg-white border border-[#DADADA] rounded-xl px-5 py-4 mb-4 shadow-sm w-full text-right"
        >
          <div className="absolute top-1 right-3 flex items-center gap-2">
            <img
              src={item.avatarUrl || "/images/default-profile.png"}
              alt="avatar"
              className={`w-8 h-8 rounded-full border ${color === "blue" ? "border-[#00bcd4]" : "border-[#b47cff]"
                } object-cover`}
            />
            <span className="text-sm font-semibold text-[#1f1f75]">{item.sender}</span>
          </div>

          <p className="text-sm text-[#1f1f75] leading-snug translate-y-[30px]">
            {item.text}
          </p>

          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              disabled={locked}
              onClick={() => handleValueChange(item, 1)}
              className={`w-8 h-8 flex justify-center items-center rounded-md
                ${locked ? "opacity-40 cursor-not-allowed" : ""}
                ${color === "blue" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}
              `}
            >
              <Plus size={14} />
            </button>

            <span className="text-[#1f1f75] font-semibold w-4 text-center">
              {item.values?.[username] || 1}
            </span>

            <button
              disabled={locked}
              onClick={() => handleValueChange(item, -1)}
              className={`w-8 h-8 flex justify-center items-center rounded-md
                ${locked ? "opacity-40 cursor-not-allowed" : ""}
                ${color === "blue" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}
              `}
            >
              <Minus size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
