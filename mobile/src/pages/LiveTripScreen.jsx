import React, { useState, useEffect } from "react";
import {
  Navigation,
  Shield,
  PhoneCall,
  Share2,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  AlertOctagon,
  Copy,
  Check,
  Send,
  X,
  Radio
} from "lucide-react";
import MobileLiveMap from "../components/map/MobileLiveMap";
import PanicButton from "../components/sos/PanicButton";
import { useEmergency } from "../context/EmergencyContext";
import { useToast } from "../context/ToastContext";
import { NativeService } from "../services/native";

export default function LiveTripScreen({ onOpenSOSModal }) {
  const { startSOSCountdown, isEmergencyActive } = useEmergency();
  const { addToast } = useToast();

  const [hasDeviation, setHasDeviation] = useState(false);
  const [speed, setSpeed] = useState(38);
  const [etaMin, setEtaMin] = useState(6);
  const [distanceKm, setDistanceKm] = useState(1.4);
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "driver", text: "Hello! Taking the express lane via Broadway to Grand Central.", time: "12:02" },
    { sender: "system", text: "SafeRide AI Guardian is actively monitoring telemetry.", time: "12:03" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);

  // Live coordinates state
  const [carCoords, setCarCoords] = useState([40.7558, -73.9818]);

  // Simulate smooth GPS telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCarCoords((prev) => {
        const dLat = (Math.random() - 0.5) * 0.0004;
        const dLng = (Math.random() - 0.5) * 0.0004;
        return [prev[0] + dLat, prev[1] + dLng];
      });
      setSpeed((s) => Math.min(55, Math.max(25, s + (Math.random() > 0.5 ? 2 : -2))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDeviation = () => {
    NativeService.triggerHaptic("warning");
    const nextState = !hasDeviation;
    setHasDeviation(nextState);
    if (nextState) {
      addToast("⚠️ AI Guardian: Route deviation detected! Vehicle off safe corridor.", "warning");
    } else {
      addToast("Route deviation cleared. Vehicle on recommended path.", "success");
    }
  };

  const handleShareTrip = async () => {
    NativeService.triggerHaptic("light");
    const shareUrl = `${window.location.origin}/trip/shared/demo-live-share-token-2026`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Track my Live Trip - SafeRide",
          text: "I am riding in Taxi TX-901 (Marcus Vance). Track my live GPS location here:",
          url: shareUrl,
        });
      } catch (e) {
        setIsSharingModalOpen(true);
      }
    } else {
      setIsSharingModalOpen(true);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/trip/shared/demo-live-share-token-2026`;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    NativeService.triggerHaptic("success");
    addToast("Live trip tracking link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    NativeService.triggerHaptic("light");
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="flex-1 flex flex-col pb-20 overflow-y-auto">
      {/* 1. Full-Featured Interactive Leaflet Map Container */}
      <div className="relative w-full h-[290px] shrink-0">
        <MobileLiveMap
          currentLocation={carCoords}
          hasDeviation={hasDeviation}
          height="100%"
        />

        {/* Floating Top GPS Badge */}
        <div className="absolute top-3 left-3 z-[400] px-3 py-1 rounded-full bg-[#0A0A1F]/90 border border-white/20 backdrop-blur-xl flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-black text-white">TX-901 • IN TRANSIT</span>
        </div>

        {/* Anomaly Simulation Toggle on Map */}
        <button
          onClick={handleToggleDeviation}
          className={`absolute top-3 right-3 z-[400] px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase border backdrop-blur-xl shadow-lg transition-all active:scale-95 ${
            hasDeviation
              ? "bg-red-600 text-white border-red-400 animate-pulse"
              : "bg-black/60 text-amber-300 border-amber-500/40 hover:bg-black/80"
          }`}
        >
          {hasDeviation ? "Deviation ON" : "Simulate Anomaly"}
        </button>
      </div>

      {/* 2. Telemetry HUD Dashboard Cards */}
      <div className="p-4 space-y-4">
        {/* Real-time Telemetry Bar */}
        <div className="grid grid-cols-4 gap-2 bg-[#10102B] p-3 rounded-2xl border border-white/10 shadow-lg">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Speed</span>
            <span className="text-sm font-black text-cyan-300">{speed} <span className="text-[10px]">km/h</span></span>
          </div>
          <div className="text-center border-l border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">ETA</span>
            <span className="text-sm font-black text-emerald-400">{etaMin} <span className="text-[10px]">min</span></span>
          </div>
          <div className="text-center border-l border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Distance</span>
            <span className="text-sm font-black text-purple-300">{distanceKm} <span className="text-[10px]">km</span></span>
          </div>
          <div className="text-center border-l border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Security</span>
            <span className="text-sm font-black text-emerald-300">99.8%</span>
          </div>
        </div>

        {/* SOS Emergency Button inside Ride HUD */}
        <div className="bg-[#180A12] border border-red-500/30 rounded-3xl p-3 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-red-500/20 text-red-400">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Emergency Panic Alert</h4>
              <p className="text-[10px] text-red-300">1-Tap transmits GPS & alerts Police</p>
            </div>
          </div>

          <button
            onClick={() => {
              NativeService.triggerHaptic("heavy");
              if (onOpenSOSModal) onOpenSOSModal();
              else startSOSCountdown({ tripId: 1 });
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xs shadow-lg shadow-red-600/40 active:scale-95 transition-all"
          >
            PANIC SOS
          </button>
        </div>

        {/* 3. Driver & Vehicle Profile Card */}
        <div className="p-4 rounded-3xl bg-[#11112A] border border-purple-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt="Marcus Vance"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-white">Marcus Vance</h4>
                  <span className="text-[10px] text-emerald-400 font-extrabold">★ 4.92</span>
                </div>
                <p className="text-xs text-slate-300">Toyota Camry Hybrid • <span className="font-mono text-cyan-300">NYC-7842-TX</span></p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href="tel:+15558765432"
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 active:scale-95 transition-all"
                title="Call Driver"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsChatOpen(true)}
                className="p-2.5 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 active:scale-95 transition-all"
                title="In-Ride Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Route details */}
          <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-slate-300 truncate"><span className="text-slate-500 text-[10px] uppercase font-bold">From:</span> Times Square Broadway 42nd St</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
              <span className="text-slate-300 truncate"><span className="text-slate-500 text-[10px] uppercase font-bold">To:</span> Grand Central Terminal Park Ave</span>
            </div>
          </div>
        </div>

        {/* 4. Live Share Trip Link Button */}
        <button
          onClick={handleShareTrip}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Live GPS Tracking Link (WhatsApp / SMS)</span>
        </button>
      </div>

      {/* Share Link Modal */}
      {isSharingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#12122C] border border-white/15 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share Live Trip</span>
              </h3>
              <button onClick={() => setIsSharingModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Anyone with this encrypted link can watch your taxi move on live GPS in real-time.
            </p>

            <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-cyan-300 truncate mr-2">
                .../trip/shared/demo-live-share-token-2026
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <button
              onClick={() => setIsSharingModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* In-Ride Chat Drawer */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#101028] border-t border-white/15 rounded-t-[32px] p-4 h-[70dvh] flex flex-col shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-black text-white">Trip Chat • Driver Marcus Vance</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">● Online</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                      m.sender === "user"
                        ? "bg-purple-600 text-white rounded-br-none"
                        : m.sender === "system"
                        ? "bg-cyan-950/60 border border-cyan-500/30 text-cyan-200"
                        : "bg-white/10 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="text-[9px] opacity-60 block text-right mt-1">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Send form */}
            <form onSubmit={handleSendChatMessage} className="pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message driver..."
                  className="w-full py-3 pl-4 pr-12 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 p-2 rounded-xl bg-purple-600 text-white active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
