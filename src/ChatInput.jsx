import { useState } from "react";
import "./ChatInput.css";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const message = text.trim();

    if (!message || disabled) return;

    onSend(message);
    setText("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="chat-input-container">
      <form className="chat-input-box" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Beymon..."
          disabled={disabled}
          rows="1"
        />

        <button
          type="submit"
          className="send-button"
          disabled={!text.trim() || disabled}
        >
          ↑
        </button>
      </form>

      <p className="input-disclaimer">
        Beymon can make mistakes. Check important information.
      </p>
    </div>
  );
}