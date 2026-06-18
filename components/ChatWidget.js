import { useState } from "react";
import ChatBot from "./ChatBot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="chat-icon"
        onClick={() => setOpen(!open)}
      >
        💬
      </button>

      {open && (
        <div className="chat-popup">
          <ChatBot />
        </div>
      )}
    </>
  );
}