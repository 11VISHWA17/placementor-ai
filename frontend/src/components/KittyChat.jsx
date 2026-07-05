import { useState, useRef, useEffect } from "react";
import { api } from "../api.js";

export default function KittyChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hii! I'm Kitty 🐱 — ask me anything about coding, interviews, or how to use this app!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await api.chatWithKitty(text, nextMessages);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: `Oops, I glitched: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="kitty-panel neon-card">
      <div className="kitty-header">
        <span className="kitty-avatar">🐱</span>
        <div>
          <div className="kitty-name">Kitty</div>
          <div className="kitty-status">● online</div>
        </div>
      </div>

      <div className="kitty-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`kitty-bubble ${m.role === "user" ? "kitty-bubble-user" : "kitty-bubble-bot"}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="kitty-bubble kitty-bubble-bot kitty-typing">Kitty is typing…</div>}
      </div>

      <form className="kitty-input-row" onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Kitty something..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>➤</button>
      </form>
    </aside>
  );
}
