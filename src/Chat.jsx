import { useState } from "react";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import "./Chat.css";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(text) {
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setMessages((prev) => [
      ...prev,
      { role: "ai", text: `Hello from Beymon! You said: "${text}"` },
    ]);
    setLoading(false);
  }

  function handleNewChat() {
    setMessages([]);
    setLoading(false);
  }

  return (
    <div className="chat">
      <Header
        title={messages.length ? messages[0].text : "New conversation"}
        onNewChat={handleNewChat}
        onMenuClick={() => console.log("open sidebar")}
      />
      <main className="chat__body">
        <MessageList messages={messages} loading={loading} />
        <ChatInput onSend={handleSend} disabled={loading} />
      </main>
    </div>
  );
}