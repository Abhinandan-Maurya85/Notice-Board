import { useState, useEffect, useRef } from "react";
import ChatBot from "./ChatBot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div ref={chatRef}>
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
    </div>
  );
}