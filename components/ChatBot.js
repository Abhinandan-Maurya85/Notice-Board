import { useState } from "react";

export default function ChatBot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });

    const data = await res.json();

    setReply(data.reply);
    setMessage("");
  };

  return (
    <div style={{ padding: "15px" }}>
      <h3>🎓 University Assistant</h3>

      <input
        type="text"
        placeholder="Ask about notices..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          border: "none",
          borderRadius: "8px",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        Send
      </button>

      {reply && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#f1f5f9",
            borderRadius: "8px",
          }}
        >
          <strong>Bot:</strong>
          <p>{reply}</p>
        </div>
      )}
    </div>
  );
}