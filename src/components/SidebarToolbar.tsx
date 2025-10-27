import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Sun,
  Edit3,
  Eye,
  Printer,
  PieChart,
  MessageCircle,
  ChevronLeft,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const ICON_SIZE = 20;

const items = [
  { key: "define", to: "/step-1", icon: FileText, title: "הגדרת האתגר" },
  { key: "ideas", to: "/step-2", icon: MessageCircle, title: "מקורות ותובנות" },
  { key: "insights", to: "/step-3", icon: PieChart, title: "תובנות" },
  { key: "light", to: "/settings/theme", icon: Sun, title: "עיצוב/תצוגה" },
  { key: "edit", to: "/editor", icon: Edit3, title: "עריכה" },
  { key: "preview", to: "/preview", icon: Eye, title: "תצוגה מקדימה" },
  { key: "print", to: "/print", icon: Printer, title: "הדפסה" },
];

export default function SidebarToolbar() {
  const location = useLocation();
  const { user } = useUser();

  const userName = user?.name || "משתמשת חדשה";
  const groupLabel =
    user?.groupId
      ? `קבוצה  (${user.groupId})`
      : "לא שובצה קבוצה";

  return (
    <aside className="fixed top-0 bottom-0 right-0 w-16 md:w-20 lg:w-24 rounded-2xl bg-brand-900 text-white flex flex-col items-center p-3 gap-4 z-40 shadow-card">
      {/* כפתור חזרה עליון */}
      <div className="w-full flex justify-center">
        <Link
          to="/"
          className="bg-[#00D67A] rounded-full w-11 h-11 flex items-center justify-center shadow-[0_6px_14px_rgba(0,0,0,0.12)]"
        >
          <ChevronLeft size={20} />
        </Link>
      </div>

      {/* אייקונים */}
      <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-auto mt-2 md:mt-4">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = location.pathname === it.to;
          return (
            <Link
              key={it.key}
              to={it.to}
              title={it.title}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 relative group ${
                isActive
                  ? "bg-white/20 ring-2 ring-white/30 scale-105"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <Icon size={ICON_SIZE} className="pointer-events-none" />
              {isActive && (
                <span className="absolute -left-2 w-2 h-2 rounded-full bg-[#00D67A]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* אזור משתמש */}
      <div className="w-full flex flex-col items-center gap-1 pb-2">
        <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center overflow-hidden border border-white/10">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-sm font-semibold text-brand-900">
              {userName[0] || "מ"}
            </div>
          )}
        </div>
        <div className="text-xs text-white text-center leading-tight">
          {userName}
        </div>
        <div className="text-[10px] text-white/60 text-center">
          {groupLabel}
        </div>
      </div>
    </aside>
  );
}
