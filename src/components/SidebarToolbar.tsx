import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  FileText,
  Sun,
  Edit3,
  Eye,
  Printer,
  PieChart,
  MessageCircle,
  ChevronLeft,
} from "lucide-react";

// SidebarToolbar.tsx
// שימוש: שמרי בקובץ src/components/SidebarToolbar.tsx
// תלוי ב: tailwindcss, lucide-react
// התקנה: npm i lucide-react

const ICON_SIZE = 20;

const items = [
  { key: "back", to: "/", icon: ArrowLeft, title: "חזרה" },
  { key: "define", to: "/step-1", icon: FileText, title: "הגדרת האתגר" },
  { key: "ideas", to: "/step-2", icon: MessageCircle, title: "מקורות ותובנות" },
  { key: "insights", to: "/step-3", icon: PieChart, title: "תובנות" },
  { key: "light", to: "/settings/theme", icon: Sun, title: "עיצב/תצוגה" },
  { key: "edit", to: "/editor", icon: Edit3, title: "עריכה" },
  { key: "preview", to: "/preview", icon: Eye, title: "תצוגה מקדימה" },
  { key: "print", to: "/print", icon: Printer, title: "הדפסה" },
];

export default function SidebarToolbar() {
  const location = useLocation();

  return (
    <aside className="fixed top-6 bottom-6 right-6 w-16 md:w-20 lg:w-24 rounded-2xl bg-brand-900 text-white flex flex-col items-center p-3 gap-4 z-40 shadow-card">
      {/* top circular green back button like the screenshot */}
      <div className="w-full flex justify-center">
        <Link
          to="/"
          className="bg-[#00D67A] rounded-full w-11 h-11 flex items-center justify-center shadow-[0_6px_14px_rgba(0,0,0,0.12)]"
        >
          <ChevronLeft size={20} />
        </Link>
      </div>

      {/* spacer to separate top button from icons */}
      <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-auto mt-2 md:mt-4">
        {items.map((it) => {
          const ActiveIcon = it.icon;
          const isActive = location.pathname === it.to;
          return (
            <Link
              key={it.key}
              to={it.to}
              title={it.title}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-shadow relative group ${
                isActive
                  ? "bg-white/10 ring-2 ring-white/20"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <ActiveIcon size={ICON_SIZE} className="pointer-events-none" />

              {/* small circular white dot to the left inside the sidebar (to mimic picture where icons have right/left notch) */}
              <span className="absolute -left-3 w-3 h-3 rounded-full bg-white/20 hidden group-hover:block" />
            </Link>
          );
        })}
      </div>

      {/* bottom area: avatar card like in screenshot */}
      <div className="w-full flex flex-col items-center gap-2">
        <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center overflow-hidden">
          {/* placeholder avatar - swap to real image if you have one */}
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-sm font-semibold text-brand-900">
            ש"י
          </div>
        </div>
        <div className="text-xs text-white text-center">שירה 'ישראלי'</div>
        <div className="text-[10px] text-white/60">קבוצת אתר 1</div>
      </div>
    </aside>
  );
}

/* הערות עיצוב והתאמה */
/*
1. הקומפוננטה משתמשת ב-TAILWIND; צבעי המותג (brand-900) נלקחו מה-tailwind config בקובץ ששלחת.
2. אפשר להוסיף tooltips מתקדמים עם headlessui או Tippy אם רוצים.
3. כדי להכניס את הסרגל לכל המסכים: טמון אותו ברמת ה-App (או ב-Layout של ה-Router) כך שהוא מוצג בכל דף.
4. עבור נגישות: הוספתי title לכל לינק — שקול להוסיף aria-label ו-keyboard focus styles.
*/
