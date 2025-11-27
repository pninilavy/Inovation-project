import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

interface Member {
  id: number;
  name: string;
  avatar: string;
}

export default function GroupAssignment() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.groupId || !user?.name) return;

    // 🔹 שלב 1: שליפת רשימה ראשונית מהשרת
    async function fetchMembers() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${user.groupId}/members`
        );
        const data = await res.json();
        const formattedData = data.map((student: any) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          avatar: student.avatarUrl || "/images/default-profile.png",
        }));
        setMembers(formattedData);
      } catch (err) {
        console.error("❌ שגיאה בשליפת חברות הקבוצה", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();

    // 🔹 שלב 2: חיבור ל־WebSocket
    const socket = new SockJS("http://localhost:8080/chat");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("✅ WebSocket התחבר בהצלחה");

      const room = `group-${user.groupId}`;

      // הרשמה לערוץ של הקבוצה
      client.subscribe(`/topic/${room}`, (msg) => {
        const body = JSON.parse(msg.body);

        if (body.type === "JOIN") {
          console.log("👋 בת חדשה הצטרפה:", body.username);
          setMembers((prev) => {
            // אם היא כבר ברשימה — לא מוסיפים שוב
            if (prev.some((m) => m.name === body.username)) return prev;
            return [
              ...prev,
              {
                id: Date.now(), name: body.username, avatar: body.avatar || "/images/default-profile.png",
              },
            ];
          });
        }
      });

      // 🔹 שליחת הודעת JOIN לשרת
      client.publish({
        destination: `/app/join/${room}`,
        body: JSON.stringify({
          username: user.name,
          avatar: user.avatar, // ⬅️ תוספת חשובה!
          room,
          type: "JOIN",
        }),
      });
    };

    client.activate();

    // 🔹 ניקוי בעת עזיבה
    return () => {
      console.log("🔌 מתנתקת מה-WebSocket");
      client.deactivate();
    };
  }, [user?.groupId, user?.name]);

  if (loading) return <div className="text-center mt-20">טוען נתונים...</div>;

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-center relative overflow-hidden rtl text-gray-800 ">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <img
            src={user?.avatar || "/images/profile1.png"}
            alt="avatar"
            className="w-20 h-20 rounded-full border-4 border-[#3B2DBB]"
          />
        </div>
        <h2 className="text-2xl font-bold text-[#1f1f75]">
          שלום {user?.name?.split(" ")[0]} :)
        </h2>
        <p className="text-lg mt-1"> טוב לראות אותך כאן! </p>
        <p className="text-lg mt-2">הינך משתייכת לקבוצה מס' {user?.groupId}</p>
        <p className="text-lg mt-1">חברות הקבוצה שלך הן:</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {members.map((m) => (
          <div key={m.id} className="flex flex-col items-center text-sm">
            <img
              src={m.avatar}
              alt={m.name}
              className="w-24 h-24 rounded-full border border-gray-200 object-contain"
            />
            <span className="mt-2 text-gray-700">{m.name}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/step1Page3")}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 
             z-50 px-10 py-3 bg-[#1f1f75] text-white rounded-full 
             text-xl font-semibold hover:bg-[#2a2aa2] 
             transition flex items-center gap-2"
      >
        הבא
        <ChevronLeft size={22} className="text-white" />
      </button>
    </div>
  );
}
