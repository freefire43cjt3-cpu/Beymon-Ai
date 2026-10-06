import MessageList from "./components/MessageList";
import "./ChatWindow.css";

export default function ChatWindow({
  messages,
  isLoading,
  onRegenerate,
  onFeedback,
}) {
  return (
    <div className="chat-window">
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onRegenerate={onRegenerate}
        onFeedback={onFeedback}
      />
    </div>
  );
}