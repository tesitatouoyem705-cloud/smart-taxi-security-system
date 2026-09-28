import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, Bot, User, Mic, ShieldAlert, Radio, HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import { useEmergency } from "../context/EmergencyContext";
import { useToast } from "../context/ToastContext";

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your **Gemini AI Safety Guardian**. I'm actively monitoring your trip telemetry and safety status. How can I assist you?",
      timestamp: "Just now"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const { triggerSOS } = useEmergency();
  const { emergency: toastEmergency } = useToast();

  const quickPrompts = [
    "Is my current route safe?",
    "How do I share my live trip?",
    "I feel unsafe / Panic alert",
    "What is the emergency protocol?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await api.post("/chat", { message: text });
      const aiResponse = res.data;

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: aiResponse.reply || "Safety telemetry synchronized.",
        isEmergency: aiResponse.isEmergency,
        suggestedActions: aiResponse.suggestedActions,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If AI detects emergency keywords in chat
      if (aiResponse.isEmergency) {
        toastEmergency("🚨 AI Guardian detected distress keywords! Prompting emergency SOS assistance.");
      }
    } catch (err) {
      console.warn("AI chat notice:", err.message);
      // Fallback local response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "I am actively monitoring your route. If you ever feel in danger, tap the **Emergency SOS button** immediately to broadcast your coordinates to security dispatch.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    // Simulate voice capture
    setTimeout(() => {
      setIsListening(false);
      setInputText("Check if driver is taking correct route");
    }, 1800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full bg-gradient-to-r from-[#6C63FF] via-[#5B52E8] to-[#00D4FF] text-white font-bold text-sm shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/70 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Sparkles className="w-5 h-5 text-white animate-spin" style={{ animationDuration: "8s" }} />
          </div>
          <span className="tracking-wide">AI Safety Guardian</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Expandable Chat Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] rounded-3xl border border-white/15 bg-[#0C0C22]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-950/80 to-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white">Gemini AI Guardian</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">
                    2.0 LIVE
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Telemetry Monitor
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${isAi ? "" : "flex-row-reverse"}`}>
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isAi
                        ? "bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-sm"
                        : "bg-purple-900 text-purple-200 border border-purple-400/40"
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 leading-relaxed ${
                      isAi
                        ? msg.isEmergency
                          ? "bg-red-950/80 border border-red-500 text-red-100 shadow-lg shadow-red-500/20"
                          : "bg-white/5 border border-white/10 text-slate-200"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* If message offers SOS action button */}
                    {msg.isEmergency && (
                      <button
                        onClick={() => triggerSOS({ location: "AI Assistant Panic Trigger" })}
                        className="mt-2.5 w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all shadow-md"
                      >
                        <Radio className="w-3.5 h-3.5 animate-pulse" /> Trigger SOS Alarm Now
                      </button>
                    )}

                    <span className="block text-[9px] text-slate-400 mt-1 text-right">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>Gemini is analyzing ride safety...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-t border-white/5 bg-black/20 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 text-[11px] text-slate-300 hover:text-purple-300 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-white/10 bg-[#0A0A1A] flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
              title="Voice Input Simulation"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening to audio..." : "Ask safety assistant or report issue..."}
              className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-purple-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
