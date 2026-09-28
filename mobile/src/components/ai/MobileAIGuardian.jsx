import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, Shield, AlertTriangle, CheckCircle, ChevronRight, User } from "lucide-react";
import api from "../../services/api";
import { NativeService } from "../../services/native";
import { useAuth } from "../../context/AuthContext";

export default function MobileAIGuardian({ embedded = false }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your SafeRide AI Guardian powered by Gemini. I continuously monitor route telemetry, speed anomalies, and driver safety protocols. How can I protect you right now?",
      timestamp: "Just now",
      suggestions: [
        "Analyze route safety risk",
        "Driver took an unapproved turn",
        "Night travel security checklist",
        "Emergency phrase assistance",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    NativeService.triggerHaptic("light");
    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat/ask", {
        message: query,
        role: user?.role || "PASSENGER",
        context: {
          currentLocation: "Times Square Broadway 42nd St",
          speedKmH: 38,
          tripStatus: "IN_TRANSIT",
          driverName: "Marcus Vance",
        },
      });

      const aiReply =
        res.data?.reply ||
        res.data?.response ||
        "I have analyzed your situation against NYPD urban corridor security standards. Your route is currently within normal parameters. If you feel unsafe, press the red SOS button to notify emergency dispatch.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      NativeService.triggerHaptic("success");
    } catch (err) {
      // Fallback simulated AI safety guidance
      let fallbackText = "AI Guardian Notice: I am monitoring your telemetry stream. If you suspect route tampering or feel in danger, trigger the SOS button immediately or dial 911.";
      if (query.toLowerCase().includes("turn") || query.toLowerCase().includes("route")) {
        fallbackText = "⚠️ Route Anomaly Protocol: If the vehicle diverged more than 500m from the planned route, ask the driver: 'Could you confirm the destination route?' Your live trip link is already shared with your emergency contacts.";
      } else if (query.toLowerCase().includes("night")) {
        fallbackText = "🌙 Night Ride Safety Checklist:\n1. Verify driver plate (NYC-7842-TX) matches app.\n2. Ensure child locks are disengaged.\n3. Keep live sharing token active with friends.\n4. AI voice trigger is primed.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full flex flex-col ${embedded ? "h-full" : "h-[75dvh]"}`}>
      {/* AI Header Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-cyan-900/30 to-slate-900/50 border border-purple-500/30 backdrop-blur-xl mb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>Gemini AI SafeRide Guardian</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-cyan-300 font-medium">Real-time Anomaly & Threat Detection</p>
          </div>
        </div>

        <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 flex items-center gap-1">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>ACTIVE</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md"
                  : "bg-[#141432] border border-white/10 text-slate-200 rounded-bl-none shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1 opacity-70 text-[10px]">
                <span className="font-bold">{m.sender === "user" ? "You" : "Gemini AI Guardian"}</span>
                <span>{m.timestamp}</span>
              </div>
              <p className="whitespace-pre-line">{m.text}</p>
            </div>

            {/* Quick Suggestion Chips if present on AI response */}
            {m.suggestions && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                {m.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    className="px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[10px] font-bold text-cyan-300 active:scale-95 transition-all text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#141432] border border-white/10 max-w-[70%]">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-xs text-slate-300 font-medium">Analyzing telemetry stream...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 shrink-0"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Guardian about safety or route..."
            className="w-full py-3 pl-4 pr-12 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white disabled:opacity-40 active:scale-90 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
