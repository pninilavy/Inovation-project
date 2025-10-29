import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    async function fetchMembers() {
      try {
        // כרגע מדמה שליפה אמיתית
        // const data: Member[] = [
        //   { id: 1, name: "פלונית אלמונית", avatar: "/images/profile1.png" },
        //   { id: 2, name: "פלונית אלמונית", avatar: "/images/profile2.png" },
        //   { id: 3, name: "פלונית אלמונית", avatar: "/images/profile3.png" },
        //   { id: 4, name: "פלונית אלמונית", avatar: "/images/profile4.png" },
        // ];

        // setMembers(data);
        // שליפה אמיתית מהשרת לפי groupId של המשתמש
        const res = await fetch(
          `http://localhost:8080/api/groups/${user?.groupId}/members`
        );
        if (!res.ok) {
          throw new Error("שגיאה בשליפת חברות הקבוצה מהשרת");
        }
        const data = await res.json();
        const formattedData = data.map((student: any) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          avatar: student.avatarUrl || "/images/default-profile.png", // אם אין תמונה
        }));
        console.log("📦 נתונים שהתקבלו מהשרת:", formattedData); // ← פה תראי בדיוק מה חזר

        setMembers(formattedData);
        // setMembers(data);
      } catch (err) {
        console.error("שגיאה בשליפת נתונים", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [user?.groupId]);

  if (loading) return <div className="text-center mt-20">טוען נתונים...</div>;

  return (
    <div className="min-h-[93vh] bg-white flex flex-col items-center justify-center relative overflow-hidden rtl text-gray-800 rounded-3xl shadow-lg">
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
        <p className="text-lg mt-2">שובצת בקבוצה מס' {user?.groupId}</p>
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
        className="mt-6 px-10 py-3 bg-[#1f1f75] text-white rounded-full text-xl font-semibold hover:bg-[#2a2aa2] transition flex items-center gap-2"
      >
        כניסה לחדר
        <ChevronLeft size={22} className="text-white" />
      </button>
    </div>
  );
}
