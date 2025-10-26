import { Outlet } from "react-router-dom";
import SidebarToolbar from "./components/SidebarToolbar";

// App.tsx — מעטפת ראשית עם עיצוב Tailwind ו־Sidebar קבוע בצד ימין
export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-row-reverse rtl">
      {/* סרגל צד קבוע */}
      <SidebarToolbar />

      {/* תוכן הדפים */}
      <div className="flex-1 p-6 pr-28 md:pr-32 lg:pr-40">
        <section className="bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,.08)] p-6">
          <Outlet />
        </section>
      </div>
    </main>
  );
}
