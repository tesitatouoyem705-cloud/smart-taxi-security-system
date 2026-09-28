import React, { useState } from "react";
import { AlertOctagon, ShieldAlert, Radio } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { NativeService } from "../../services/native";

export default function PanicButton({ size = "large", onOpenModal }) {
  const { startSOSCountdown, isEmergencyActive } = useEmergency();
  const [pressing, setPressing] = useState(false);

  const handleSOSClick = () => {
    NativeService.triggerHaptic("heavy");
    if (onOpenModal) {
      onOpenModal();
    } else {
      startSOSCountdown({ tripId: 1 });
    }
  };

  if (size === "small") {
    return (
      <button
        onClick={handleSOSClick}
        className={`px-3 py-1.5 rounded-xl font-black text-xs tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all ${
          isEmergencyActive
            ? "bg-red-600 text-white animate-sos-strobe"
            : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 border border-red-500/40"
        }`}
      >
        <AlertOctagon className="w-3.5 h-3.5" />
        <span>SOS PANIC</span>
      </button>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center my-4">
      {/* Outer pulsing radar ripple rings */}
      <div className="absolute w-44 h-44 rounded-full bg-red-600/15 animate-ping pointer-events-none" />
      <div className="absolute w-36 h-36 rounded-full bg-red-600/25 animate-pulse pointer-events-none" />

      {/* Main Panic Button */}
      <button
        onClick={handleSOSClick}
        onMouseDown={() => setPressing(true)}
        onMouseUp={() => setPressing(false)}
        onTouchStart={() => setPressing(true)}
        onTouchEnd={() => setPressing(false)}
        className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center text-white border-4 border-white/20 shadow-[0_0_50px_rgba(239,68,68,0.7)] active:scale-90 transition-all duration-200 ${
          isEmergencyActive
            ? "bg-red-600 animate-sos-strobe"
            : "bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 hover:brightness-110"
        }`}
      >
        <AlertOctagon className="w-10 h-10 mb-0.5 animate-pulse" />
        <span className="text-xs font-black tracking-widest uppercase">SOS PANIC</span>
      </button>

      <div className="mt-3 text-center">
        <p className="text-[11px] font-black text-red-300 tracking-wider flex items-center justify-center gap-1">
          <Radio className="w-3 h-3 text-red-400 animate-ping" />
          <span>INSTANT EMERGENCY DISPATCH</span>
        </p>
        <p className="text-[10px] text-slate-400">1-Tap transmits GPS & triggers siren</p>
      </div>
    </div>
  );
}
