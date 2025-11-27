// src/pages/step4/Step4Page2.tsx
import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useChat } from "../../hooks/useChat";

interface Idea {
  user: string;
  text: string;
  avatar?: string;
}

const STEP4_PREFIX = "[step4-response]";

export default function Step4Page2() {
  const { user } = useUser();
  const navigate = useNavigate();

  const username = user?.name || "משתמשת";
  const groupId = user?.groupId || 1;
  const room = `group-${groupId}`;

  const { messages } = useChat(room, username);

  const [members, setMembers] = useState<
    { id: number; name: string; avatar: string }[]
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/groups/${groupId}/members`
        );
        const data = await res.json();
        const formatted = data.map((s: any) => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          avatar: s.avatarUrl || "/images/default-profile.png",
        }));
        setMembers(formatted);
      } catch (err) {
        console.error("שגיאה בשליפת חברות הקבוצה:", err);
      } finally {
        setLoadingMembers(false);
      }
    }
    fetchMembers();
  }, [groupId]);

  useEffect(() => {
    if (!messages?.length) return;

    const stepIdeas: Idea[] = messages
      .filter((m) => m.content.startsWith(STEP4_PREFIX))
      .map((m) => {
        const jsonStr = m.content.replace(STEP4_PREFIX, "").trim();
        try {
          const obj = JSON.parse(jsonStr);
          return {
            user: obj.user || m.username,
            text: obj.text || "",
            avatar: obj.avatar || "/images/default-profile.png",
          } as Idea;
        } catch {
          return {
            user: m.username,
            text: jsonStr,
            avatar: "/images/default-profile.png",
          } as Idea;
        }
      });

    setIdeas((prev) => {
      const merged = [...prev];
      stepIdeas.forEach((idea) => {
        const idx = merged.findIndex((i) => i.user === idea.user);
        if (idx === -1) merged.push(idea);
        else merged[idx] = idea;
      });
      return merged;
    });
  }, [messages]);

  const allShared =
    !loadingMembers &&
    members.length > 0 &&
    members.every((m) => ideas.find((i) => i.user === m.name));

  const handleNext = () => {
    if (!allShared) return;
    navigate("/step4Page3");
  };

  if (loadingMembers) {
    return (
      <div className="text-center text-[#1f1f75] mt-20">
        טוען את חברות הקבוצה...
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-full bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center justify-between"
    >
      <div className="w-full max-w-5xl">
        <h1 className="text-2xl font-bold text-[#1f1f75] mb-8 text-center">
          רשימת הרעיונות של חברות הקבוצה:
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members
            .filter((member) => ideas.find((i) => i.user === member.name))
            .map((member) => {
              const idea = ideas.find((i) => i.user === member.name)!;
              return (
                <div
                  key={member.id}
                  className="bg-white shadow-md rounded-2xl px-5 py-4 flex flex-col justify-between border border-[#E5E5E5]"
                >
                  <p className="text-[#1f1f75] mb-4 min-h-[60px]">
                    {idea.text}
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[#1f1f75] text-sm font-semibold">
                      {member.name}
                    </span>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full border border-[#DADADA] object-cover"
                    />
                  </div>
                </div>
              );
            })}
        </div>

        {!allShared && (
          <p className="mt-6 text-center text-[#1f1f75] text-lg">
            ⏳ מחכים עדיין לרעיונות של{" "}
            {members
              .filter((m) => !ideas.find((i) => i.user === m.name))
              .map((m) => m.name)
              .join(", ") || "—"}
          </p>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!allShared}
        className={`mt-8 px-10 py-3 rounded-full text-xl font-semibold flex items-center gap-2 transition ${
          allShared
            ? "bg-[#1f1f75] text-white hover:bg-[#14125f]"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        לשלב הבא
        <ChevronLeft size={22} />
      </button>
    </div>
  );
}
