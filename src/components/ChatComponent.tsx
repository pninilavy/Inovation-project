import React, { useState } from "react";
import { useChat } from "../hooks/useChat";

export default function ChatComponent({ room, username }: { room: string; username: string }) {
  const { messages, sendMessage } = useChat(room, username);
  const [input, setInput] = useState("");

  const onSend = () => {
    const content = input.trim();
    if (!content) return;
    sendMessage(content);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-24 w-80 bg-white rounded-lg shadow-lg p-4 flex flex-col gap-2 z-50">
      <div className="flex-1 overflow-auto h-64 border-b border-gray-200 pb-2">
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">
            <strong>{msg.username}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="כתוב הודעה..."
        />
        <button
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={onSend}
        >
          שלח
        </button>
      </div>
    </div>
  );
}
