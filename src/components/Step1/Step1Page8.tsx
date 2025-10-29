import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Step1Page8() {
  const { user } = useUser();
  const navigate = useNavigate();
  const processId = 2;
  const [summary, setSummary] = useState({ current: "", desired: "" });
  const [editorName, setEditorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditor = user?.name === localStorage.getItem("newEditor");

  // 📦 שליפת שם העורכת והסיכום
  useEffect(() => {
    async function fetchData() {
      if (!user?.groupId) return;
      try {
        const resEditor = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId}`
        );
        const editorData = await resEditor.json();
        setEditorName(editorData.editorName);

        const resSummary = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`
        );
        const data = await resSummary.json();
        if (data.success)
          setSummary({ current: data.current, desired: data.desired });
      } catch (err) {
        console.error("❌ שגיאה:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.groupId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/groups/${user.groupId}/summary?processId=${processId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(summary),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("✅ הסיכום נשמר בהצלחה!");
        navigate("/step1Page9");
      }
    } catch (err) {
      console.error(err);
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
    <div className="min-h-[93vh] bg-white rounded-3xl shadow-lg p-10 text-right rtl flex flex-col items-center">
      <h1 className="text-3xl font-bold text-[#1f1f75] mb-4 text-center">
        סיכום בשלב העריכה מחדש
      </h1>

      <p className="text-[#3B2DBB] text-lg font-semibold mb-8 text-center">
        בעריכה כעת ע״י <span className="text-[#DF57FF]">{editorName}</span>
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-10 mb-10">
        <EditBox
          title="המצוי – מה קיים היום?"
          color="blue"
          value={summary.current}
          onChange={(v: string) => setSummary((p) => ({ ...p, current: v }))}
          readOnly={!isEditor}
        />
        <EditBox
          title="הרצוי – מה הייתי רוצה?"
          color="purple"
          value={summary.desired}
          onChange={(v: string) => setSummary((p) => ({ ...p, desired: v }))}
          readOnly={!isEditor}
        />
      </div>

      {isEditor && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1f1f75] text-white px-10 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-[#2a2aa2] transition"
        >
          {saving ? "שומרת..." : "שמירת הסיכום"}
        </button>
      )}
    </div>
  );
}

function EditBox({ title, color, value, onChange, readOnly }: any) {
  const colors =
    color === "blue"
      ? { bg: "bg-[#E6F9FF]", border: "border-[#BEEAFF]" }
      : { bg: "bg-[#EFE9FF]", border: "border-[#E0D4FF]" };

  return (
    <div
      className={`flex flex-col items-end ${colors.bg} p-[19px] border ${colors.border} rounded-[20px] shadow-md w-[447px] text-right`}
    >
      <h2 className="text-xl font-semibold text-[#1f1f75] mb-2">{title}</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className="w-full bg-white border border-[#DADADA] rounded-[15px] p-4 text-[#1f1f75] resize-none min-h-[150px]"
      />
    </div>
  );
}
