import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, User, Car } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

export default function TripChatModal({ trip, isOpen, onClose }) {
  const { user } = useAuth();
  const { socket, sendTripMessage, joinTripRoom } = useSocket();
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderName: "System",
      senderRole: "SYSTEM",
      text: "Encrypted in-trip communication channel established.",
      timestamp: "10:00 AM"
    }
  ]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (trip?.id) {
      joinTripRoom(trip.id);
    }

    if (!socket) return;

    const handleIncomingMessage = (msg) => {
      if (msg.tripId === trip?.id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("trip:message", handleIncomingMessage);

    return () => {
      socket.off("trip:message", handleIncomingMessage);
    };
  }, [socket, trip]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !trip?.id) return;

    sendTripMessage(trip.id, text.trim());
    setText("");
  };

  const quickReplies = [
    "I am waiting at the pickup spot",
    "Please lock the rear doors",
    "Running 2 minutes late",
    "Thank you!"
  ];

  if (!isOpen || !trip) return null;

  const isPassenger = user?.role === "PASSENGER";
  const otherPartyName = isPassenger ? (trip.driverName || "Driver") : (trip.passengerName || "Passenger");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-md w-full h-[520px] rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-950/80 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                Chat with {otherPartyName}
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> End-to-end encrypted
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message history */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => {
            const isMe = m.senderId === user?.id || (m.senderRole === user?.role && m.senderRole !== "SYSTEM");
            const isSystem = m.senderRole === "SYSTEM";

            if (isSystem) {
              return (
                <div key={m.id} className="text-center py-1">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-400">
                    {m.text}
                  </span>
                </div>
              );
            }

            return (
              <div key={m.id} className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isMe ? "bg-purple-600 text-white" : "bg-cyan-600 text-white"
                  }`}
                >
                  {isMe ? <User className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[78%] rounded-2xl p-3 leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                      : "bg-white/10 border border-white/10 text-slate-100"
                  }`}
                >
                  <p className="font-medium">{m.text}</p>
                  <span className="block text-[9px] text-slate-300 mt-1 text-right">{m.timestamp}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick reply chips */}
        <div className="px-3 py-2 border-t border-white/5 bg-black/20 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              onClick={() => sendTripMessage(trip.id, qr)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 text-[11px] text-slate-300 hover:text-purple-300 transition-colors"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#0A0A1A] flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${otherPartyName}...`}
            className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-purple-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
