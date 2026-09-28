import React from "react";
import { AlertOctagon, PhoneCall, ShieldAlert, Volume2, VolumeX, X } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

export default function EmergencyBanner() {
  const { isEmergencyActive, cancelEmergency, activeSOSData, soundEnabled, toggleSound } = useEmergency();

  if (!isEmergencyActive) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-2.5 shadow-2xl relative z-40 border-b border-red-400/50 animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-lg">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide uppercase">🚨 EMERGENCY SOS BROADCAST ACTIVE</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">HIGH PRIORITY</span>
            </div>
            <p className="text-xs text-red-100 font-medium">
              Live GPS Telemetry and panic distress signal transmitted to Central Security & Emergency Contacts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute/Unmute Siren */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            title={soundEnabled ? "Mute Siren" : "Unmute Siren"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-200" />}
            <span className="hidden sm:inline">{soundEnabled ? "Mute Siren" : "Unmute"}</span>
          </button>

          {/* Quick Call 911 */}
          <a
            href="tel:911"
            className="px-3 py-1.5 rounded-lg bg-white text-red-700 text-xs font-extrabold flex items-center gap-1.5 shadow hover:bg-red-50 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Call 911
          </a>

          {/* Cancel SOS */}
          <button
            onClick={cancelEmergency}
            className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white text-xs font-bold transition-colors border border-white/20"
          >
            Cancel Alert
          </button>
        </div>
      </div>
    </div>
  );
}
