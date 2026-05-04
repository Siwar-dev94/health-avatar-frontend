
import { useRef, useEffect } from "react";

export function ChatPanel({ messages, input, setInput, onSend, isLoading }) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(input);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="header-dot" />
        <span className="header-title">Health Assistant</span>
        <span className="header-sub">AI-Powered • Always available</span>
      </div>

      <div className="messages-list">
        {messages.map((msg, i) => (
          <div key={i} className={`msg msg-${msg.role}`}>
            {msg.role === "assistant" && <div className="msg-icon">H</div>}
            <div className="bubble">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="msg msg-assistant">
            <div className="msg-icon">H</div>
            <div className="bubble bubble-loading">
              <div className="dot-anim" />
              <div className="dot-anim" />
              <div className="dot-anim" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-row">
        <input
          className="text-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Or type your question here..."
          disabled={isLoading}
        />
        <button
          className="send-btn"
          onClick={() => onSend(input)}
          disabled={isLoading || !input.trim()}
        >
          ➤
        </button>
      </div>
      <p className="disclaimer">For informational purposes only. Always consult a qualified doctor.</p>
    </div>
  );
}
