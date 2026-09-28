import React, { useState } from "react";
import { Car, Radio, ShieldCheck, Power, Navigation, User, MapPin, CheckCircle2, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { NativeService } from "../services/native";

export default function DriverModeScreen({ onBack, onSelectTab }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [hasIncomingRide, setHasIncomingRide] = useState(true);

  const handleToggleOnline = () => {
    NativeService.triggerHaptic("medium");
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      addToast("You are now ONLINE. Broadcasting GPS telemetry.", "success");
    } else {
      addToast("You are now OFFLINE.", "info");
    }
  };

  const handleAcceptRide = () => {
    NativeService.triggerHaptic("success");
    setHasIncomingRide(false);
    addToast("Ride accepted! Navigating to Times Square pickup.", "success");
    if (onSelectTab) onSelectTab("trip");
  };

  return (
    <div className="flex-1 p-4 pb-20 overflow-y-auto space-y-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white mb-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Passenger Mode</span>
      </button>

      {/* Driver Status Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0F1C36] via-[#0B152A] to-[#070D1B] border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Taxi TX-901 • Driver Console</h3>
              <p className="text-[10px] text-cyan-300">Marcus Vance • NYC-7842-TX</p>
            </div>
          </div>

          <button
            onClick={handleToggleOnline}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all ${
              isOnline
                ? "bg-emerald-500 text-black shadow-emerald-500/40"
                : "bg-white/10 text-slate-400 border border-white/10"
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
          </button>
        </div>

        {/* Telemetry Status Bar */}
        <div className="grid grid-cols-3 gap-2 bg-black/30 p-2.5 rounded-2xl border border-white/5 text-center">
          <div>
            <span className="text-xs font-black text-cyan-300">4.92 ★</span>
            <p className="text-[9px] text-slate-400">Driver Rating</p>
          </div>
          <div className="border-l border-white/10">
            <span className="text-xs font-black text-emerald-400">99.8%</span>
            <p className="text-[9px] text-slate-400">Safety Score</p>
          </div>
          <div className="border-l border-white/10">
            <span className="text-xs font-black text-purple-300">1,420</span>
            <p className="text-[9px] text-slate-400">Total Rides</p>
          </div>
        </div>
      </div>

      {/* Incoming Ride Request Modal Card */}
      {isOnline && hasIncomingRide && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-2 border-purple-500/60 shadow-2xl animate-in zoom-in-95 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-black uppercase">
              <Radio className="w-3 h-3 animate-ping text-purple-400" />
              <span>INCOMING RIDE REQUEST</span>
            </div>
            <span className="text-xs font-black text-emerald-400">$18.50 Est.</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-white font-bold">Passenger: Elena Rostova (4.98 ★)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Pickup: Times Square Broadway 42nd St</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span className="truncate">Dropoff: Grand Central Terminal Park Ave</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setHasIncomingRide(false)}
              className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptRide}
              className="py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-black shadow-lg active:scale-95 transition-all"
            >
              Accept Ride (2 min away)
            </button>
          </div>
        </div>
      )}

      {/* Safety Inspection Checklist */}
      <div className="p-4 rounded-3xl bg-[#11112B] border border-white/10 space-y-2.5">
        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Vehicle Safety Checklist (Passed)</span>
        </h4>
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Emergency SOS Panic Transmitter: Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cabin Dashcam & Biometric QR: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>GPS Route Deviation Tracker: Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
