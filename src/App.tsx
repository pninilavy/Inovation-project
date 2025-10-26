import { Outlet } from "react-router-dom";
import SidebarToolbar from "./components/SidebarToolbar";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <UserProvider>
      <main className="min-h-screen bg-gray-50 flex flex-row-reverse rtl">
        <SidebarToolbar />
        <div className="flex-1 p-6 pr-28 md:pr-32 lg:pr-40">
          <section className="bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,.08)] p-6">
            <Outlet />
          </section>
        </div>
      </main>
    </UserProvider>
  );
}
