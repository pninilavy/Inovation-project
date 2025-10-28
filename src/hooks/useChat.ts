
// import { useEffect, useState, useRef } from "react";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// interface Message {
//   username: string;
//   content: string;
//   room: string;
// }

// export function useChat(room: string, username: string) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [connected, setConnected] = useState(false);
//   const clientRef = useRef<Client | null>(null);

//   useEffect(() => {
//     if (!room || !username) return;

//     // ✅ טעינת הודעות מלוקאלסטורג׳
//     const saved = localStorage.getItem(`messages_${room}`);
//     if (saved) setMessages(JSON.parse(saved));

//     const baseUrl =
//       window.location.hostname === "localhost"
//         ? "http://localhost:8080/chat"
//         : `${window.location.origin}/chat`;

//     const socket = new SockJS(baseUrl);
//     const client = new Client({
//       webSocketFactory: () => socket,
//       reconnectDelay: 5000,
//       debug: (msg) => console.log("🛰️ STOMP:", msg),

//       onConnect: () => {
//         console.log("✅ Connected to WebSocket room:", room);
//         setConnected(true);

//         client.subscribe(`/topic/${room}`, (msg) => {
//           try {
//             const body: Message = JSON.parse(msg.body);
//             setMessages((prev) => {
//               const updated = [...prev, body];
//               localStorage.setItem(`messages_${room}`, JSON.stringify(updated));
//               return updated;
//             });
//           } catch (err) {
//             console.error("❌ Failed to parse message:", msg.body);
//           }
//         });
//       },

//       onDisconnect: () => {
//         console.log("❌ Disconnected from WebSocket");
//         setConnected(false);
//       },
//     });

//     client.activate();
//     clientRef.current = client;

//     return () => {
//       console.log("🔌 Cleaning up WebSocket");
//       client.deactivate();
//       setConnected(false);
//     };
//   }, [room, username]);

//   // ✅ שליחת הודעה
//   const sendMessage = (content: string) => {
//     if (!clientRef.current || !connected) {
//       console.warn("⚠️ Can't send: not connected yet");
//       return;
//     }
//     const message: Message = { username, content, room };
//     clientRef.current.publish({
//       destination: `/app/send/${room}`,
//       body: JSON.stringify(message),
//     });
//   };

//   // ✅ ניקוי מלא של הצ׳אט
//   const resetChat = () => {
//     console.log("🧹 Resetting chat:", room);

//     try {
//       // מחיקה מלוקאלסטורג׳
//       localStorage.removeItem(`messages_${room}`);

//       // ניתוק ה־WebSocket
//       if (clientRef.current) {
//         clientRef.current.deactivate();
//         clientRef.current = null;
//       }

//       setMessages([]);
//       setConnected(false);
//       console.log("✅ Chat cleared successfully");
//     } catch (err) {
//       console.error("❌ Error resetting chat:", err);
//     }
//   };

//   return { messages, sendMessage, connected, resetChat };
// }
import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface Message {
  username: string;
  content: string;
  room: string;
}

export function useChat(room: string, username: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!room || !username) return;

    // ✅ טען הודעות מה־localStorage
    const saved = localStorage.getItem(`messages_${room}`);
    if (saved) setMessages(JSON.parse(saved));

    // ✅ יצירת חיבור חדש
    const baseUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:8080/chat"
        : `${window.location.origin}/chat`;

    const socket = new SockJS(baseUrl);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (msg) => console.log("🛰️ STOMP:", msg),

      onConnect: () => {
        console.log("✅ Connected to WebSocket room:", room);
        setConnected(true);

        client.subscribe(`/topic/${room}`, (msg) => {
          try {
            const body: Message = JSON.parse(msg.body);
            setMessages((prev) => {
              const updated = [...prev, body];
              localStorage.setItem(`messages_${room}`, JSON.stringify(updated));
              return updated;
            });
          } catch (err) {
            console.error("❌ Failed to parse message:", msg.body);
          }
        });
      },

      onDisconnect: () => {
        console.log("❌ Disconnected from WebSocket");
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log("🔌 Cleaning up WebSocket");
      client.deactivate();
      setConnected(false);
    };
  }, [room, username]);

  // ✅ שליחת הודעה
  const sendMessage = (content: string) => {
    if (!clientRef.current || !connected) {
      console.warn("⚠️ Can't send: not connected yet");
      return;
    }
    const message: Message = { username, content, room };
    clientRef.current.publish({
      destination: `/app/send/${room}`,
      body: JSON.stringify(message),
    });
  };

  // ✅ איפוס מלא של הצ'אט
  const resetChat = () => {
    console.log("🧹 Resetting chat and WebSocket completely");

    try {
      localStorage.removeItem(`messages_${room}`);

      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }

      setMessages([]);
      setConnected(false);

      // ניקוי מוחלט
      if ((window as any).SockJS) delete (window as any).SockJS;
      console.log("✅ Chat + WebSocket cleared");
    } catch (err) {
      console.error("❌ Error resetting chat:", err);
    }
  };

  return { messages, sendMessage, connected, resetChat };
}
