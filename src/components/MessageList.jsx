import { memo, useCallback, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import Message from "./Message";
import "./MessageList.css";

const NEAR_BOTTOM_PX = 120;

const MessageItem = memo(function MessageItem({ message, onRegenerate, onFeedback }) {
  const isUser = message.role === "user";

  const handleRegenerate = useCallback(
    () => onRegenerate?.(message.id),
    [onRegenerate, message.id]
  );
  const handleFeedback = useCallback(
    (value) => onFeedback?.(message.id, value),
    [onFeedback, message.id]
  );

  return (
    <Message
      role={message.role}
      content={message.content ?? message.text ?? ""}
      onRegenerate={!isUser && onRegenerate ? handleRegenerate : undefined}
      onFeedback={!isUser && onFeedback ? handleFeedback : undefined}
    />
  );
});

function TypingIndicator() {
  return (
    <div className="message-list__typing" role="status" aria-label="Beymon is thinking">
      <svg className="message-list__typing-avatar" viewBox="0 0 80 80" aria-hidden="true">
        <rect width="80" height="80" rx="20" fill="#4F46E5" />
        <path d="M28 20 V58" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        <path d="M28 20 H42 a9 9 0 0 1 0 18 H28" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 38 H46 a9 9 0 0 1 0 18 H28" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="64" cy="16" r="5" fill="#2DD4BF" />
      </svg>
      <div className="message-list__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function MessageList({
  messages = [],
  isLoading = false,
  onRegenerate,
  onFeedback,
}) {
  const containerRef = useRef(null);
  const stickToBottomRef = useRef(true);
  const isFirstRenderRef = useRef(true);

  const lastMessage = messages[messages.length - 1];
  const lastRole = lastMessage?.role;
  const lastLength = (lastMessage?.content ?? lastMessage?.text ?? "").length;

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distance < NEAR_BOTTOM_PX;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const isFirst = isFirstRenderRef.current;
    isFirstRenderRef.current = false;

    if (isFirst || stickToBottomRef.current || lastRole === "user") {
      stickToBottomRef.current = true;
      el.scrollTo({ top: el.scrollHeight, behavior: isFirst ? "auto" : "smooth" });
    }
  }, [messages.length, lastRole, lastLength, isLoading]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <section
      className="message-list"
      ref={containerRef}
      onScroll={handleScroll}
      aria-label="Conversation"
    >
      <div
        className="message-list__inner"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {isEmpty && (
          <div className="message-list__empty">
            <span className="message-list__empty-icon" aria-hidden="true">
              <MessageSquare size={22} />
            </span>
            <h2 className="message-list__empty-title">Start a conversation with Beymon</h2>
            <p className="message-list__empty-text">
              Ask a question, share an idea, or paste some code.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageItem
            key={message.id ?? `${message.role}-${index}`}
            message={message}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
          />
        ))}

        {isLoading && <TypingIndicator />}
      </div>
    </section>
  );
}