import { useState } from "react";
import Header from "./components/Header";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput.jsx";
import "./App.css";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(text) {
    // Add user's message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setLoading(true);

    // Temporary AI response
    await new Promise((r) => setTimeout(r, 900));

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Hello from Beymon! You said: "${text}"`,
      },
    ]);

    setLoading(false);
  }

  function handleNewChat() {
    setMessages([]);
    setLoading(false);
  }

  return (
    <div className="app">

      <Header
        title={
          messages.length
            ? messages[0].content
            : "New conversation"
        }
        onNewChat={handleNewChat}
        onMenuClick={() => console.log("open sidebar")}
      />

      <ChatWindow
        messages={messages}
        isLoading={loading}
      />

      <ChatInput
        onSend={handleSend}
        disabled={loading}
      />

    </div>
  );
}