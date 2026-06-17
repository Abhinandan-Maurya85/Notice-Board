import { useState } from "react";

export default function ChatBot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const sendMessage = async () => {
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
  };

  return (
    <div>
      <h2>University Assistant</h2>

      <input
        type="text"
        placeholder="Type here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <h3>Bot Reply:</h3>
      <p>{reply}</p>
    </div>
  );
}