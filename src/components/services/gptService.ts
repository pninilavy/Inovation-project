// src/services/gptService.ts
export async function summarizeGroupChat(
  messages: { username: string; content: string }[]
) {
  console.log("API KEY:", import.meta.env.VITE_OPENAI_KEY);

  // 🧩 שלב 1: הפרדה למצוי ורצוי
  const currentMsgs = messages
    .filter((m) => m.content.startsWith("[מצוי]"))
    .map((m) => `${m.username}: ${m.content.replace(/^\[.*?\]\s*/, "")}`)
    .join("\n");

  const desiredMsgs = messages
    .filter((m) => m.content.startsWith("[רצוי]"))
    .map((m) => `${m.username}: ${m.content.replace(/^\[.*?\]\s*/, "")}`)
    .join("\n");

  try {
    // 🧠 שלב 2: שליחה ל-GPT עם בקשה לסיכום כפול
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "את מסכמת שיחות קבוצתיות בעברית בצורה ברורה ונעימה. צרי שני חלקים נפרדים: אחד על 'המצוי' ואחד על 'הרצוי'.",
          },
          {
            role: "user",
            content: `הנה השיחות הקבוצתיות:\n\nהמצוי:\n${currentMsgs}\n\nהרצוי:\n${desiredMsgs}\n\nכתבי סיכום נפרד וברור לכל אחד מהחלקים.`,
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`שגיאה מה־API (${res.status})`);

    const data = await res.json();
    const rawSummary = data.choices?.[0]?.message?.content || "לא התקבל סיכום.";

    // 🧩 שלב 3: ננסה להפריד את הסיכומים לפי סימנים
    // נניח שה-GPT יחזיר מבנה כמו:
    // "מצוי:\n...\n\nרצוי:\n..."
    const currentMatch = rawSummary.match(/מצוי[:\s]*(.*?)\n(?:רצוי|$)/s);
    const desiredMatch = rawSummary.match(/רצוי[:\s]*(.*)/s);

    const currentSummary = currentMatch?.[1]?.trim() || "לא התקבל סיכום למצוי.";
    const desiredSummary = desiredMatch?.[1]?.trim() || "לא התקבל סיכום לרצוי.";

    return { currentSummary, desiredSummary };
  } catch (err) {
    console.error("שגיאה בשליחת סיכום ל־GPT:", err);
    throw err;
  }
}
