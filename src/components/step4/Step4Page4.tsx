// Step4Page4.tsx
import React, { useEffect, useMemo, useState } from "react";
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
const TIMER_SECONDS = 120; // 2 דקות

export default function Step4Page4() {
    const { user } = useUser();
    const navigate = useNavigate();

    const username = user?.name || "משתמשת";
    const groupId = user?.groupId || 1;
    const room = `group-${groupId}`;

    const { messages, sendMessage } = useChat(room, username);

    const [leaderName, setLeaderName] = useState<string | null>(null);
    const [isLeader, setIsLeader] = useState(false);
    const [loading, setLoading] = useState(true);

    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
    const [isRunning, setIsRunning] = useState(true);
    const [timeUp, setTimeUp] = useState(false);

    const [showPopup, setShowPopup] = useState(true); // כברירת מחדל רואים את ההודעה

    const processId = 4;

    const safeJsonParse = (str: string) => {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    };

    // מי המנהלת
    useEffect(() => {
        async function fetchLeader() {
            if (!user?.groupId) return;

            try {
                const res = await fetch(
                    `http://localhost:8080/api/groups/${user.groupId}/editor?processId=${processId}`
                );
                const data = await res.json();

                if (data.message === "טרם נבחרה עורכת לשלב זה") {
                    const res2 = await fetch(
                        `http://localhost:8080/api/groups/${user.groupId}/choose-editor?processId=${processId}`,
                        { method: "POST" }
                    );
                    const chosen = await res2.json();
                    setLeaderName(chosen.editorName);
                    setIsLeader(chosen.editorName === user.name);
                } else {
                    setLeaderName(data.editorName);
                    setIsLeader(data.editorName === user.name);
                }
            } catch (err) {
                console.error("❌ שגיאה בשליפת מנהלת הסבב:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchLeader();
    }, [user?.groupId, user?.name]);

    // רשימת רעיונות מהצ'אט
    useEffect(() => {
        if (!messages?.length) return;

        const last = safeJsonParse(messages[messages.length - 1].content);

        // ⬅️ זה החלק החדש — אם התקבלה הוראה מהמנהלת לעבור לדירוג
        if (last?.type === "STEP4_GO_TO_RATING") {
            navigate("/step4Page5");
            return; // שלא ימשיך לעבד הודעות אחרות
        }

        const seen = new Set<string>();
        const collected: Idea[] = [];

        messages.forEach((m) => {
            if (!m.content.startsWith(STEP4_PREFIX)) return;

            const jsonStr = m.content.replace(STEP4_PREFIX, "").trim();
            let idea: Idea;

            try {
                const obj = JSON.parse(jsonStr);
                idea = {
                    user: obj.user || m.username,
                    text: obj.text || "",
                    avatar: obj.avatar || "/images/default-profile.png",
                };
            } catch {
                idea = {
                    user: m.username,
                    text: jsonStr,
                    avatar: "/images/default-profile.png",
                };
            }

            if (!seen.has(idea.user)) {
                seen.add(idea.user);
                collected.push(idea);
            }
        });

        setIdeas(collected);

        // סנכרון אינדקס
        const stateEvents = messages
            .map((m) => safeJsonParse(m.content))
            .filter((d) => d && d.type === "STEP4_SET_INDEX");

        if (stateEvents.length > 0) {
            const last = stateEvents[stateEvents.length - 1];
            if (typeof last.index === "number" && last.index >= 0) {
                setCurrentIndex(last.index);
                setSecondsLeft(TIMER_SECONDS);
                setIsRunning(true);
                setTimeUp(false);
            }
        }
    }, [messages]);

    // מאזין בזמן אמת ל־STEP4_SET_INDEX
    useEffect(() => {
        if (!messages?.length) return;

        const lastData = safeJsonParse(messages[messages.length - 1].content);
        if (!lastData) return;

        if (lastData.type === "STEP4_SET_INDEX") {
            const idx = lastData.index ?? 0;
            setCurrentIndex(idx);
            setSecondsLeft(TIMER_SECONDS);
            setIsRunning(true);
            setTimeUp(false);
        }
    }, [messages]);

    // טיימר
    useEffect(() => {
        if (!isRunning) return;

        const id = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    setIsRunning(false);
                    setTimeUp(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [isRunning, currentIndex]);

    const currentIdea = useMemo(
        () => (ideas.length > 0 ? ideas[currentIndex] : null),
        [ideas, currentIndex]
    );

    const formattedTime = useMemo(() => {
        const m = Math.floor(secondsLeft / 60)
            .toString()
            .padStart(2, "0");
        const s = (secondsLeft % 60).toString().padStart(2, "0");
        return { minutes: m, seconds: s };
    }, [secondsLeft]);

    const firstName = currentIdea?.user?.split(" ")[0] || "המשתתפת";

    const handleNextIdea = () => {
        if (!isLeader || ideas.length === 0) return;

        const nextIndex = currentIndex + 1;

        if (nextIndex >= ideas.length) {
            // שולחים לכולן מעבר לשלב הדירוג
            sendMessage(JSON.stringify({
                type: "STEP4_GO_TO_RATING",
                step: 4
            }));

            navigate("/step4Page5"); // גם העורכת עצמה
            return;
        }


        setCurrentIndex(nextIndex);
        setSecondsLeft(TIMER_SECONDS);
        setIsRunning(true);
        setTimeUp(false);

        sendMessage(
            JSON.stringify({
                type: "STEP4_SET_INDEX",
                index: nextIndex,
            })
        );
    };

    const handleThanks = () => {
        setTimeUp(true);
        setIsRunning(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[90vh] text-[#1f1f75]">
                טוען נתוני קבוצה...
            </div>
        );
    }

    return (
        <div className="min-h-[93vh] bg-white rounded-3xl shadow-lg flex flex-col items-center justify-between px-10 py-8 relative">
            {/* פופאפ לכולן */}
            {leaderName && showPopup && (
                <div className="fixed top-8 right-8 bg-white shadow-xl border border-[#3B2DBB] rounded-2xl p-4 text-right z-50 max-w-sm">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-[#1f1f75] font-bold">הודעה לקבוצה</p>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="text-gray-400 hover:text-[#1f1f75] text-xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {leaderName} נבחרה לנהל את סבב הצגת הרעיונות.
                        <br />
                        רק היא אחראית ללחוץ על כפתור{" "}
                        <span className="font-semibold">"להצגת הרעיון הבא"</span>.
                    </p>
                </div>
            )}

            {/* תוכן מרכזי */}
            <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="bg-white border border-[#E5E5E5] shadow-md rounded-2xl px-8 py-5 max-w-3xl w-full flex items-center gap-4 mb-8">
                    <div className="flex-1 text-right">
                        <h2 className="text-xl font-bold text-[#1f1f75] mb-2">
                            {currentIdea
                                ? `הרעיון של ${currentIdea.user}`
                                : "עדיין לא התקבלו רעיונות"}
                        </h2>
                        <p className="text-[#404040] text-sm leading-relaxed whitespace-pre-line">
                            {currentIdea?.text ||
                                "ברגע שהרעיונות יישלחו – הם יופיעו כאן אחד אחד."}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-[#E4F6FF] flex items-center justify-center overflow-hidden border border-[#DADADA]">
                            {currentIdea?.avatar ? (
                                <img
                                    src={currentIdea.avatar}
                                    alt={currentIdea.user}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl text-[#1f1f75]">👩</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* טיימר */}
                <div
                    className="flex items-center justify-center gap-4 mb-6"
                    dir="ltr"   // 👈 מונע היפוך בסידור הקופסאות
                >
                    {/* שמאל: דקות */}
                    <TimeBox value={formattedTime.minutes} />
                    {/* אמצע: שניות */}
                    <TimeBox value={formattedTime.seconds} />
                    {/* ימין: קופסה שלישית קבועה */}
                    <TimeBox value="00" />
                </div>


                {timeUp && currentIdea && (
                    <button
                        onClick={handleThanks}
                        className="mt-2 px-6 py-2 rounded-full bg-[#E6FFF1] border border-[#9DE2BC] text-[#137B40] font-semibold flex items-center gap-2 shadow-sm"
                    >
                        {firstName} תודה על השיתוף 💚
                    </button>
                )}
            </div>

            <button
                onClick={handleNextIdea}
                disabled={!isLeader || ideas.length === 0}
                className={`mb-2 px-10 py-3 rounded-full text-lg font-semibold flex items-center gap-2 min-w-[320px] justify-center transition ${isLeader && ideas.length > 0
                    ? "bg-[#1f1f75] text-white hover:bg-[#14125f]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
            >
                להצגת הרעיון הבא
                <ChevronLeft size={22} />
            </button>
        </div>
    );
}

function TimeBox({ value }: { value: string }) {
    return (
        <div className="w-20 h-24 bg-[#FF5CF4] rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-4xl font-extrabold">{value}</span>
        </div>
    );
}
