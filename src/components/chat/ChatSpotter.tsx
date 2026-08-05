"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { MessageCircle, X, Send, Bot, User as UserIcon } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string };

export function ChatSpotter() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages update or loading state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const currentMessages = [...messages, userMessage];

    try {
      const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, "");
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          messages: currentMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      setIsLoading(false);
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      const aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: aiMessageId, role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === aiMessageId ? { ...msg, content: msg.content + chunk } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-3.5 sm:p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 active:scale-95 transition-all z-50 flex items-center justify-center"
          aria-label="Open AI Spotter"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 max-h-[calc(100vh-2rem)] sm:max-h-[540px] h-[500px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-zinc-800/90 backdrop-blur border-b border-zinc-700 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Bot className="text-blue-400" size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-zinc-100 leading-none">AI Spotter</h3>
                <span className="text-[10px] text-emerald-400 font-medium">Online • Context Aware</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-700/50 transition-colors"
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col gap-3.5 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 text-xs sm:text-sm my-auto px-4">
                <Bot className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p className="font-medium text-zinc-400 mb-1">Your Contextual AI Spotter</p>
                <p className="text-[11px] sm:text-xs">Ask anything about your workout, swap exercises, or get instant form cues!</p>
              </div>
            )}
            
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === "user" ? "bg-blue-600" : "bg-zinc-800 border border-zinc-700"
                  }`}
                >
                  {m.role === "user" ? (
                    <UserIcon size={14} className="text-white" />
                  ) : (
                    <Bot size={14} className="text-blue-400" />
                  )}
                </div>
                <div
                  className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl max-w-[82%] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                      : "bg-zinc-800/90 text-zinc-200 border border-zinc-700/80 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2.5 flex-row">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-blue-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            
            {/* Anchor to scroll to bottom */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="p-2.5 sm:p-3 bg-zinc-800/90 backdrop-blur border-t border-zinc-700 flex gap-2 shrink-0"
          >
            <input
              className="flex-1 bg-zinc-900/90 border border-zinc-700 text-zinc-100 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-zinc-500"
              value={input}
              placeholder="Ask about your workout..."
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white p-2 sm:p-2.5 rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
