import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react"; // ← אייקון פח למחיקה

interface Item {
  id: number;
  text: string;
  type: "need" | "constraint";
  sender: string;
  avatarUrl?: string;
  values: Record<string, number>;
}

export default function Step2Page2() {
  const { user } = useUser();
  const username = user?.name || "משתמשת";
  const avatarUrl = user?.avatar || "/images/default-profile.png";
  const groupId = user?.groupId || 1;
  const room = `group-${groupId}`;
  const { messages, sendMessage } = useChat(room, username);
  const navigate = useNavigate();

  const [editor, setEditor] = useState("");
  const [isEditor, setIsEditor] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [showPopup, setShowPopup] = useState("");
  const [editingDone, setEditingDone] = useState(false);

  // === קביעת עורכת אקראית ===
  useEffect(() => {
    const savedEditor = localStorage.getItem(`editor_step2_${room}`);
    if (savedEditor) {
      setEditor(savedEditor);
      setIsEditor(savedEditor === username);
      return;
    }

    const existingEditorMessage = messages.find((m) =>
      m.content.startsWith("[editor]")
    );

    if (existingEditorMessage) {
      const name = existingEditorMessage.content.replace("[editor]", "").trim();
      localStorage.setItem(`editor_step2_${room}`, name);
      setEditor(name);
      setIsEditor(name === username);
    } else {
      const chosen = username;
      localStorage.setItem(`editor_step2_${room}`, chosen);
      sendMessage(`[editor] ${chosen}`);
      setEditor(chosen);
      setIsEditor(true);
    }
  }, [messages, username, room]);

  // === קבלת הודעות מה-WebSocket ===
  useEffect(() => {
    messages.forEach((m) => {
      if (m.content.startsWith("[editor]")) {
        const name = m.content.replace("[editor]", "").trim();
        setEditor(name);
        if (name === username)
          setShowPopup("🎉 נבחרת להיות העורכת לשלב זה!");
        else setShowPopup(`נבחרה להיות העורכת: ${name}`);

      } else if (m.content.startsWith("[add-item]")) {
        const i = JSON.parse(m.content.replace("[add-item]", "").trim());
        setItems((prev) => {
          if (prev.some((x) => x.id === i.id)) return prev;
          const updated = [...prev, i];
          localStorage.setItem(`step2_top_${room}`, JSON.stringify(updated));
          return updated;
        });

      } else if (m.content.startsWith("[remove-item]")) {
        const id = JSON.parse(m.content.replace("[remove-item]", "").trim());
        setItems((prev) => {
          const updated = prev.filter((x) => x.id !== id);
          localStorage.setItem(`step2_top_${room}`, JSON.stringify(updated));
          return updated;
        });

      } else if (m.content.startsWith("[editing-done]")) {
        setEditingDone(true);
        setShowPopup("✅ העורכת סיימה להוסיף פריטים. ניתן להמשיך לשלב הבא!");
        localStorage.setItem(`editing_done_${room}`, "true");
      }
    });
  }, [messages]);

  // === טעינה מהלוקל סטורג׳ ===
  useEffect(() => {
    const base = JSON.parse(localStorage.getItem(`step2_top_${room}`) || "[]");
    setItems(base);
    const done = localStorage.getItem(`editing_done_${room}`) === "true";
    setEditingDone(done);
  }, []);

  // === הוספה חדשה ===
  const handleAdd = (type: "need" | "constraint") => {
    if (!isEditor) return alert("רק העורכת יכולה להוסיף");
    const text = prompt(
      type === "need" ? "הוסיפי צורך חדש" : "הוסיפי אילוץ חדש"
    );
    if (!text?.trim()) return;
    const newItem = {
      id: Date.now(),
      text,
      sender: username,
      avatarUrl,
      type,
      values: {},
    };
    sendMessage(`[add-item] ${JSON.stringify(newItem)}`);
    setItems((prev) => {
      const updated = [...prev, newItem];
      localStorage.setItem(`step2_top_${room}`, JSON.stringify(updated));
      return updated;
    });
  };

  // === מחיקת פריט (לעורכת בלבד) ===
  const handleDelete = (id: number) => {
    if (!isEditor) return alert("רק העורכת יכולה למחוק פריטים");
    if (!window.confirm("האם את בטוחה שברצונך למחוק את הפריט הזה?")) return;
    sendMessage(`[remove-item] ${JSON.stringify(id)}`);
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem(`step2_top_${room}`, JSON.stringify(updated));
      return updated;
    });
  };

  // === סיום עריכה ===
  const handleFinishEditing = () => {
    if (!isEditor) return;
    sendMessage("[editing-done]");
    setEditingDone(true);
    localStorage.setItem(`editing_done_${room}`, "true");
    setShowPopup("✅ סיימת להוסיף! כל הבנות יכולות לעבור לשלב הבא 🎉");
  };

  // === לשלב הבא ===
  const handleNext = () => {
    if (!editingDone) {
      alert("העורכת עדיין לא סיימה להוסיף. נא להמתין.");
      return;
    }
    localStorage.setItem(`step2_final_${room}`, JSON.stringify(items));
    navigate("/step2Page3");
  };

  return (
    <div
      dir="rtl"
      className="min-h-[93vh] bg-white rounded-3xl shadow-lg p-10 flex flex-col rtl"
    >
      {showPopup && (
        <div className="fixed top-8 right-8 bg-white border border-[#3B2DBB] rounded-2xl shadow-lg p-5 text-right z-50">
          <b className="text-[#1f1f75]">📢 הודעה לקבוצה</b>
          <p>{showPopup}</p>
        </div>
      )}

      <h1 className="text-3xl font-bold text-[#1f1f75] text-center mb-10">
        אלו 10 הצרכים והאילוצים שנבחרו ע״י הקבוצה
      </h1>

      <div className="flex flex-row justify-center gap-10">
        <Column
          title="צרכים"
          color="blue"
          items={items.filter((i) => i.type === "need")}
          onAdd={() => handleAdd("need")}
          onDelete={handleDelete}
          canAdd={isEditor && !editingDone}
          canDelete={isEditor && !editingDone}
        />
        <Column
          title="אילוצים"
          color="purple"
          items={items.filter((i) => i.type === "constraint")}
          onAdd={() => handleAdd("constraint")}
          onDelete={handleDelete}
          canAdd={isEditor && !editingDone}
          canDelete={isEditor && !editingDone}
        />
      </div>

      <div className="flex flex-col items-center mt-10">
        {isEditor && !editingDone && (
          <button
            onClick={handleFinishEditing}
            className="bg-[#3B2DBB] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#2d2199] transition"
          >
            סיימתי להוסיף 🚀
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={!editingDone}
          className={`mt-4 px-10 py-3 rounded-full text-xl font-semibold transition ${
            editingDone
              ? "bg-[#DF57FF] text-white hover:bg-[#c93fe9]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          לשלב הבא
        </button>

        {!isEditor && (
          <p className="text-center text-[#1f1f75] mt-5">
            בעריכה כעת ע״י: {editor}
          </p>
        )}
      </div>
    </div>
  );
}

function Column({ title, color, items, onAdd, onDelete, canAdd, canDelete }: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} p-6 border ${colors.border} rounded-[20px] shadow-md w-[450px]`}
    >
      <h2 className="text-xl font-semibold text-[#1f1f75] mb-5">{title}</h2>

      {items.map((i) => (
        <div
          key={i.id}
          className="relative bg-white border border-[#DADADA] rounded-xl px-5 py-4 mb-3 w-full shadow-sm text-right"
        >
          {/* תמונה + שם */}
          <div className="absolute top-2 right-3 flex items-center gap-2">
            <img
              src={i.avatarUrl || "/images/default-profile.png"}
              alt="avatar"
              className={`w-8 h-8 rounded-full border-2 ${
                color === "blue" ? "border-[#00bcd4]" : "border-[#b47cff]"
              } object-cover`}
            />
            <span className="text-sm font-semibold text-[#1f1f75]">
              {i.sender}
            </span>
          </div>

          {/* טקסט */}
          <p className="text-sm text-[#1f1f75] leading-snug mt-10">{i.text}</p>

          {/* כפתור מחיקה לעורכת בלבד */}
          {canDelete && (
            <button
              onClick={() => onDelete(i.id)}
              className="absolute top-2 left-3 text-[#888] hover:text-[#ef4444] transition"
              title="מחקי פריט"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ))}

      {/* כפתור הוספה */}
      {canAdd && (
        <button
          onClick={onAdd}
          className={`mt-auto px-6 py-2 rounded-full font-semibold text-lg shadow-sm ${
            color === "blue"
              ? "bg-[#E6F9FF] border border-[#00bcd4] text-[#007b8e]"
              : "bg-[#F5E6FF] border border-[#b47cff] text-[#7a3eff]"
          }`}
        >
          {color === "blue" ? "הוספת צורך +" : "הוספת אילוץ +"}
        </button>
      )}
    </div>
  );
}
