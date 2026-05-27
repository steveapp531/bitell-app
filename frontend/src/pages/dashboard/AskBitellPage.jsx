import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { sendChatMessage } from "../../utils/api.js";

const SUGGESTIONS = [
  "How much did I make this month?",
  "What did I spend most on?",
  "Can I afford new inventory?",
  "Who owes me money?",
];

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Hi {name} 👋 I'm Bitell, your business financial assistant. Ask me anything about your money.",
};

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5" style={{ backgroundColor: "#EBF7F2" }}>
          <span style={{ color: "#0C2218", fontWeight: 700 }}>B</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "text-white rounded-tr-sm"
            : "bg-white text-gray-800 shadow-sm rounded-tl-sm"
        }`}
        style={isUser ? { backgroundColor: "#0C2218" } : {}}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function AskBitellPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bitell_conversations") || "[]");
    } catch { return []; }
  });
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list"); // "list" | "chat"
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewConversation = () => {
    const welcome = {
      ...WELCOME_MESSAGE,
      content: WELCOME_MESSAGE.content.replace("{name}", user?.name?.split(" ")[0] || "there"),
    };
    setMessages([welcome]);
    setActiveConvId(null);
    setView("chat");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const openConversation = (conv) => {
    setMessages(conv.messages);
    setActiveConvId(conv.id);
    setView("chat");
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { role: "user", content };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const history = messages.filter((m) => m.role !== "assistant" || messages.indexOf(m) > 0);
      const { reply } = await sendChatMessage(content, history);
      const assistantMsg = { role: "assistant", content: reply };
      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);

      // Save conversation
      const convId = activeConvId || `conv-${Date.now()}`;
      const title = content.slice(0, 50);
      const updated = conversations.filter((c) => c.id !== convId);
      const newConv = { id: convId, title, messages: finalMessages, updatedAt: Date.now() };
      const newList = [newConv, ...updated];
      setConversations(newList);
      setActiveConvId(convId);
      localStorage.setItem("bitell_conversations", JSON.stringify(newList.slice(0, 20)));
    } catch (err) {
      const serverMsg = err?.response?.data?.error || err?.message || "Sorry, I couldn't reach the server. Check your connection and try again.";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: serverMsg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = (id, e) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem("bitell_conversations", JSON.stringify(updated));
  };

  // ── List view ────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Ask Bitell</h1>
          <button
            onClick={startNewConversation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "#0C2218" }}
          >
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            New
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Your conversational financial assistant.</p>

        {conversations.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className="bg-white rounded-2xl p-4 shadow-sm text-left flex items-center justify-between group hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#EBF7F2" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0C2218" strokeWidth="1.8">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{conv.title}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {conv.messages?.slice(-1)[0]?.content?.slice(0, 60)}…
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="ml-2 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </button>
            ))}
          </div>
        )}

        {/* Suggestions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Try asking</p>
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  startNewConversation();
                  setTimeout(() => sendMessage(s), 300);
                }}
                className="text-left text-sm text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                • "{s}"
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Chat view ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <button
          onClick={() => setView("list")}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-gray-900">Ask Bitell</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0" style={{ backgroundColor: "#0C2218" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Ask about your money…"
          className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0C2218]/20 border border-gray-200"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40"
          style={{ backgroundColor: "#0C2218" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
