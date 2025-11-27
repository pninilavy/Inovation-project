import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

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
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [doneUsers, setDoneUsers] = useState<string[]>([]);

  // ✅ בנות הקבוצה + דגל האם כולן כבר הגיעו לשלב
  const [members, setMembers] = useState<string[]>([]);
  const [allArrived, setAllArrived] = useState(false);

  // ✅ שליפת כל בנות הקבוצה (רק שמות, בלי שמירה בשרת)
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${groupId}/members`
        );
        const data = await res.json();
        setMembers(
          data.map(
            (s: any) => `${s.firstName} ${s.lastName}`
          )
        );
      } catch (err) {
        console.error("❌ שגיאה בשליפת חברות קבוצה:", err);
      }
    }
    fetchMembers();
  }, [groupId]);

  // === קביעת עורכת אקראית (נשמר רק ב-localStorage לשם, לא לפריטים) ===
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
  }, [messages, username, room, sendMessage]);

  // === קבלת הודעות מה-WebSocket ובניית המצב מהצ׳אט בלבד ===
  useEffect(() => {
    let newItems: Item[] = [];
    const removedIds = new Set<number>();
    let editorName = editor;
    let editingFinished = false;
    const doneList: string[] = [];

    messages.forEach((m) => {
      const content = m.content || "";

      if (content.startsWith("[editor]")) {
        const name = content.replace("[editor]", "").trim();
        editorName = name;
      } else if (content.startsWith("[add-item]")) {
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
      } else if (content.startsWith("[editing-done]")) {
        editingFinished = true;
      } else if (content.startsWith("[step2-done]")) {
        const name = content.replace("[step2-done]", "").trim();
        if (!doneList.includes(name)) doneList.push(name);
      }
    });

    const uniqueById = new Map<number, Item>();
    newItems.forEach((it) => {
      if (!removedIds.has(it.id)) {
        uniqueById.set(it.id, it);
      }
    });

    setItems(Array.from(uniqueById.values()));
    if (editorName) setEditor(editorName);
    setEditingDone(editingFinished);
    setDoneUsers(doneList);

    if (editorName && editorName === username) {
      setIsEditor(true);
    } else if (editorName) {
      setIsEditor(false);
    }
  }, [messages, username, editor]);

  // ✅ חישוב אם *כולן* כבר סיימו את Step2Page1 (שלחו [step2-done])
  const missingUsers = members.filter((name) => !doneUsers.includes(name));

  useEffect(() => {
    if (!members.length) return;
    setAllArrived(missingUsers.length === 0);
  }, [members, doneUsers]); // missingUsers נגזר מהם

  // === הוספה חדשה ע"י העורכת בלבד ===
  const [addingType, setAddingType] = useState<"need" | "constraint" | null>(
    null
  );
  const [newText, setNewText] = useState("");

  const handleSaveNewItem = () => {
    // ✅ הגנה נוספת – אם עדיין לא כולם הגיעו, לא עושים כלום
    if (!allArrived || !isEditor) return;
    if (!newText.trim() || !addingType) return;

    const newItem: Item = {
      id: Date.now(),
      text: newText.trim(),
      sender: username,
      avatarUrl,
      type: addingType,
      values: {},
    };

    sendMessage(`[add-item] ${JSON.stringify(newItem)}`);
    setNewText("");
    setAddingType(null);
  };

  // === מחיקת פריט (לעורכת בלבד) ===
  const handleDelete = (id: number) => {
    if (!isEditor || !allArrived) return; // ✅ גם כאן
    setConfirmDelete(id);
  };

  // === סיום עריכה ===
  const handleFinishEditing = () => {
    if (!isEditor || !allArrived) return; // ✅ לא מסיימת לפני שכולן הגיעו
    sendMessage("[editing-done]");
    setShowPopup("✅ סיימת להוסיף! כל הבנות יכולות לעבור לשלב הבא 🎉");
  };

  // === לשלב הבא ===
  const handleNext = () => {
    if (!editingDone) {
      alert("העורכת עדיין לא סיימה להוסיף. נא להמתין.");
      return;
    }
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

      {/* ✅ הודעה קטנה לעורכת מי עדיין לא נכנסה לשלב */}
      {isEditor && !allArrived && (
        <p className="text-center text-sm text-[#1f1f75] mb-4">
          מחכות עדיין ל: {missingUsers.join(", ")}
          <br />
          העריכה תיפתח כשתיכן תעברו לשלב זה 🙂
        </p>
      )}

      <div className="flex flex-row justify-center gap-10">
        <Column
          title="צרכים"
          color="blue"
          items={items.filter((i) => i.type === "need")}
          onAdd={() => setAddingType("need")}
          onDelete={handleDelete}
          // ✅ עריכה מותרת רק אם: היא העורכת + כולן הגיעו + עוד לא סיימה
          canAdd={isEditor && allArrived && !editingDone}
          canDelete={isEditor && allArrived && !editingDone}
          addingType={addingType}
          newText={newText}
          setNewText={setNewText}
          handleSaveNewItem={handleSaveNewItem}
          setAddingType={setAddingType}
        />
        <Column
          title="אילוצים"
          color="purple"
          items={items.filter((i) => i.type === "constraint")}
          onAdd={() => setAddingType("constraint")}
          onDelete={handleDelete}
          canAdd={isEditor && allArrived && !editingDone}
          canDelete={isEditor && allArrived && !editingDone}
          addingType={addingType}
          newText={newText}
          setNewText={setNewText}
          handleSaveNewItem={handleSaveNewItem}
          setAddingType={setAddingType}
        />
      </div>

      <div className="flex flex-col items-center mt-10">
        {isEditor && !editingDone && (
          <button
            onClick={handleFinishEditing}
            disabled={!allArrived} // ✅ נעול עד שכולן הגיעו
            className={`px-8 py-3 rounded-full text-lg font-semibold transition ${
              allArrived
                ? "bg-[#3B2DBB] text-white hover:bg-[#2d2199]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
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
            בעריכה כעת ע״י: {editor || "—"}
          </p>
        )}
      </div>

      {/* פופאפ אישור מחיקה */}
      {confirmDelete && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-[320px]">
            <p className="text-lg text-[#1f1f75] font-semibold mb-4">
              למחוק את הפריט הזה?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  sendMessage(
                    `[remove-item] ${JSON.stringify(confirmDelete)}`
                  );
                  setConfirmDelete(null);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
              >
                כן, מחקי
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Column({
  title,
  color,
  items,
  onAdd,
  onDelete,
  canAdd,
  canDelete,
  addingType,
  newText,
  setNewText,
  handleSaveNewItem,
  setAddingType,
}: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} p-6 border ${colors.border} rounded-[20px] shadow-md w-[450px]`}
    >
      <h2 className="text-xl font-semibold text-[#1f1f75] mb-5">{title}</h2>

      {items.map((i: Item) => (
        <div
          key={i.id}
          className="relative bg-white border border-[#DADADA] rounded-xl px-5 py-4 mb-3 w-full shadow-sm text-right"
        >
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

          <p className="text-sm text-[#1f1f75] leading-snug mt-10">{i.text}</p>

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

      {canAdd && (
        <div className="mt-auto w-full">
          {(addingType === "need" && title === "צרכים") ||
          (addingType === "constraint" && title === "אילוצים") ? (
            <div className="bg-white border border-[#DADADA] rounded-xl px-4 py-3 shadow-sm w-full flex flex-col gap-3">
              <input
                type="text"
                placeholder={`הקלידי ${
                  title === "צרכים" ? "צורך" : "אילוץ"
                } חדש...`}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="border border-[#DADADA] rounded-lg px-3 py-2 w-full text-right outline-none focus:ring-2 focus:ring-[#9E77ED]"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveNewItem}
                  className="bg-[#1f1f75] text-white px-4 py-1 rounded-full text-sm hover:bg-[#15115f] transition"
                >
                  שמירה
                </button>
                <button
                  onClick={() => setAddingType(null)}
                  className="text-gray-600 text-sm hover:text-[#1f1f75]"
                >
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() =>
                setAddingType(title === "צרכים" ? "need" : "constraint")
              }
              className={`mt-auto px-6 py-2 rounded-full font-semibold text-lg shadow-sm border ${
                color === "blue"
                  ? "border-[#00bcd4] text-[#007b8e]"
                  : "border-[#b47cff] text-[#7a3eff]"
              } bg-white hover:bg-[#f8f8ff] transition w-full`}
            >
              {color === "blue" ? "הוספת צורך +" : "הוספת אילוץ +"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
