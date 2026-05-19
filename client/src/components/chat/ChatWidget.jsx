import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Trash2, Bot, User, Plus, Sparkles, Loader } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api/allApis";
import { formatDistanceToNow } from "date-fns";

// Quick suggestion prompts for the chatbot
const QUICK_SUGGESTIONS = [
  { icon: "🛏️", text: "Room types & pricing", prompt: "What room types do you have and their pricing?" },
  { icon: "📅", text: "Book a room", prompt: "I'd like to book a room. What are the available dates and special offers?" },
  { icon: "🌟", text: "Special services", prompt: "What special services do you offer (honeymoon, events, etc)?" },
  { icon: "🗺️", text: "Local attractions", prompt: "What attractions and activities are nearby?" },
];

export default function ChatWidget() {
  const [open, setOpen]              = useState(false);
  const [input, setInput]            = useState("");
  const [sessionId, setSessionId]    = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Namaste! 🙏 I'm HamroBot, your personal AI concierge. How may I assist you today?", createdAt: new Date() }
  ]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMutation = useMutation({
    mutationFn: (data) => chatApi.sendMessage(data).then(r => r.data.data),
    onMutate: (vars) => {
      setMessages(prev => [...prev, { role: "user", content: vars.message, createdAt: new Date() }]);
      setShowSuggestions(false);
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: "assistant", content: data.message, createdAt: new Date() }]);
      qc.invalidateQueries(["chat-sessions"]);
    },
    onError: (error) => {
      console.error("Chat send error:", error);
      const serverMessage = error.response?.data?.message || error.message || "Sorry, I encountered an error. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: serverMessage, createdAt: new Date() }]);
    },
  });

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || sendMutation.isPending) return;
    setInput("");
    sendMutation.mutate({ message: msg, sessionId });
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion.prompt);
    setTimeout(() => {
      sendMutation.mutate({ message: suggestion.prompt, sessionId });
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      handleSend(); 
    }
  };

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([{ role: "assistant", content: "Namaste! 🙏 Starting a fresh conversation. How can I help you?", createdAt: new Date() }]);
    setShowSuggestions(true);
    setInput("");
  };

  return (
    <>
      {/* Toggle button */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold-gradient shadow-gold-lg hover:shadow-gold flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse-gold">
        {open ? <X className="w-6 h-6 text-dark-950" /> : <MessageCircle className="w-6 h-6 text-dark-950" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[520px] card border border-gold-500/20 flex flex-col overflow-hidden shadow-gold-lg animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-dark-900 to-dark-800 border-b border-white/5">
            <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-dark-950" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                HamroBot <Sparkles className="w-3 h-3 text-gold-400" />
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-dark-400">AI Concierge • Online</span>
              </div>
            </div>
            <button onClick={handleNewChat} className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-gold-400 transition-colors" title="New chat">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === "assistant" ? "bg-gold-gradient text-dark-950" : "bg-dark-700 text-gold-400 border border-gold-500/30"
                }`}>
                  {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>
                <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-dark-800 text-dark-100 rounded-tl-sm border border-white/5"
                      : "bg-gold-500 text-dark-950 font-medium rounded-tr-sm"
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-dark-500">
                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}

            {/* Quick suggestions - shown only when appropriate */}
            {showSuggestions && messages.length <= 1 && (
              <div className="mt-4 space-y-2 pt-2 border-t border-white/5">
                <p className="text-xs text-dark-400 font-semibold px-2">Quick questions:</p>
                {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestion(suggestion)}
                    disabled={sendMutation.isPending}
                    className="w-full text-left px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-white/5 hover:border-gold-500/30 transition-all text-sm text-dark-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="mr-2">{suggestion.icon}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            {sendMutation.isPending && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-dark-950" />
                </div>
                <div className="bg-dark-800 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1.5 items-center h-4">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-white/5">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about the hotel..."
                rows={1}
                className="flex-1 input py-2.5 text-sm resize-none min-h-[42px] max-h-[100px]"
                style={{ height: "auto" }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
              />
              <button onClick={handleSend} disabled={!input.trim() || sendMutation.isPending}
                className="w-10 h-10 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 flex-shrink-0">
                {sendMutation.isPending ? <Loader className="w-4 h-4 text-dark-950 animate-spin" /> : <Send className="w-4 h-4 text-dark-950" />}
              </button>
            </div>
            <p className="text-[10px] text-dark-500 text-center mt-2">Powered by Groq AI · LLaMA 3</p>
          </div>
        </div>
      )}
    </>
  );
}