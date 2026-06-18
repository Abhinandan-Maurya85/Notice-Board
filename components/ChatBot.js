import { useState } from "react";

export default function ChatBot() {
  const [message, setMessage] = useState("");

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
    </div>
  );
}