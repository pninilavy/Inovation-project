import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

// טיפוסים
interface ResponseItem {
  id: number;
  name: string;
  text: string;
  agree?: boolean | null; // true = מסכימה, false = לא מסכימה, null = לא נבחר
}

interface GroupData {
  current: ResponseItem[];
  desired: ResponseItem[];
  summaryCurrent: string;
  summaryDesired: string;
}

export default function Step1Page5() {
  const navigate = useNavigate();

  const [data, setData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- שליפה מדומה (בהמשך תוחלף בקריאה אמיתית לשרת) ---
  useEffect(() => {
    async function fetchGroupData() {
      setLoading(true);

      const mockData: GroupData = {
        current: [
          {
            id: 1,
            name: "נעמי",
            text: "שיעורי החשבון כיום מועברים בעיקר פרונטלית...",
            agree: null,
          },
          {
            id: 2,
            name: "דסי",
            text: "הילדים לומדים בקצב אחיד, ללא התחשבות בצרכים שונים.",
            agree: null,
          },
          {
            id: 3,
            name: "חנה",
            text: "אין שימוש כמעט בכלים דיגיטליים או שיתופיים.",
            agree: null,
          },
        ],
        desired: [
          {
            id: 1,
            name: "נעמי",
            text: "פינת למידה חווייתית עם תחנות מגוונות.",
            agree: null,
          },
          {
            id: 2,
            name: "דסי",
            text: "שילוב משחקים דיגיטליים שיעודדו למידה פעילה.",
            agree: null,
          },
          {
            id: 3,
            name: "חנה",
            text: "למידה בקבוצות קטנות לפי רמות ותחומי עניין.",
            agree: null,
          },
        ],
        summaryCurrent:
          "שיעורי החשבון כיום מועברים בעיקר פרונטלית, עם מעט כלים מוחשיים או אמצעים טכנולוגיים.",
        summaryDesired:
          "פינת הלמידה הרצויה כוללת סביבות גמישות, חווייתיות ודיגיטליות, שמעודדות שיתופיות וחשיבה יצירתית.",
      };

      await new Promise((res) => setTimeout(res, 1000)); // הדמיית טעינה
      setData(mockData);
      setLoading(false);
    }

    fetchGroupData();
  }, []);

  // --- עדכון הסכמה/אי־הסכמה ---
  const toggleAgree = (
    type: "current" | "desired",
    id: number,
    agree: boolean
  ) => {
    if (!data) return;
    setData((prev) => {
      if (!prev) return prev;
      const updatedList = prev[type].map((item) =>
        item.id === id ? { ...item, agree } : item
      );
      return { ...prev, [type]: updatedList };
    });
  };

  if (loading || !data) {
    return (
      <div className="min-h-[93vh] flex items-center justify-center text-xl text-[#1f1f75]">
        ⏳ טוען נתונים...
      </div>
    );
  }

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-start relative overflow-hidden rtl text-gray-800 rounded-3xl shadow-lg px-6 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f75] mb-10">
        סיכום האתגר הקבוצתי
      </h1>

      <div className="flex flex-col md:flex-row justify-center gap-8 w-full max-w-6xl">
        {/* המצוי */}
        <ColumnSection
          title="המצוי – מה קיים היום?"
          color="blue"
          data={data.current}
          summary={data.summaryCurrent}
          onToggle={toggleAgree}
          type="current"
        />

        {/* הרצוי */}
        <ColumnSection
          title="הרצוי – מה הייתי רוצה?"
          color="purple"
          data={data.desired}
          summary={data.summaryDesired}
          onToggle={toggleAgree}
          type="desired"
        />
      </div>

      <button
        onClick={() => navigate("/next-step")}
        className="mt-10 px-12 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold hover:bg-[#2a2aa2] transition"
      >
        לשלב הבא
      </button>
    </div>
  );
}

// --- קומפוננטת עמודה ---
interface ColumnSectionProps {
  title: string;
  color: "blue" | "purple";
  data: ResponseItem[];
  summary: string;
  onToggle: (type: "current" | "desired", id: number, agree: boolean) => void;
  type: "current" | "desired";
}

const ColumnSection: React.FC<ColumnSectionProps> = ({
  title,
  color,
  data,
  summary,
  onToggle,
  type,
}) => {
  const colorMap = {
    blue: {
      bg: "bg-[#e7f9ff]",
      border: "border-[#baeaff]",
      innerBorder: "border-[#cdefff]",
    },
    purple: {
      bg: "bg-[#f6f2ff]",
      border: "border-[#e0d4ff]",
      innerBorder: "border-[#e0d4ff]",
    },
  };

  return (
    <div
      className={`flex-1 ${colorMap[color].bg} border ${colorMap[color].border} rounded-2xl p-6 text-right shadow-sm`}
    >
      <h2 className="text-xl font-semibold text-[#1f1f75] mb-4 flex items-center justify-between">
        <span>{title}</span>
        <MessageSquare className="text-[#1f1f75]" size={20} />
      </h2>

      {/* תיבות */}
      <div className="flex flex-wrap gap-4 justify-start">
        {data.map((item) => (
          <div
            key={item.id}
            className={`bg-white w-[48%] rounded-xl border ${colorMap[color].innerBorder} p-3 text-sm shadow-sm`}
          >
            <p className="text-gray-700 mb-2">{item.text}</p>
            <div className="flex justify-between items-center">
              <p className="text-[#1f1f75] text-xs font-semibold">
                {item.name}
              </p>

              {/* בחירה אישית */}
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => onToggle(type, item.id, true)}
                  className={`px-2 py-1 rounded-full transition ${
                    item.agree === true
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  מסכימה
                </button>
                <button
                  onClick={() => onToggle(type, item.id, false)}
                  className={`px-2 py-1 rounded-full transition ${
                    item.agree === false
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  לא מסכימה
                </button>
              </div>
            </div>

            {/* תצוגה של בחירת המשתמשת */}
            {item.agree !== null && (
              <p className="mt-2 text-xs text-left text-gray-600">
                הבחירה שלך:{" "}
                <span
                  className={
                    item.agree
                      ? "text-green-700 font-semibold"
                      : "text-red-700 font-semibold"
                  }
                >
                  {item.agree ? "מסכימה" : "לא מסכימה"}
                </span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* סיכום */}
      <div
        className={`bg-white mt-6 border ${colorMap[color].innerBorder} rounded-xl p-4`}
      >
        <h3 className="text-[#1f1f75] font-semibold mb-2 flex items-center gap-2">
          <MessageSquare size={16} /> סיכום
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
      </div>
    </div>
  );
};
