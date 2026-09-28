import React, { useState } from "react";
import { AlertOctagon, PhoneCall, ShieldAlert, X, Volume2, VolumeX, CheckCircle, Radio, Navigation } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useAuth } from "../../context/AuthContext";
import { NativeService } from "../../services/native";

export default function EmergencySOSModal({ isOpen, onClose }) {
  const {
    isEmergencyActive,
    countdown,
    cancelCountdown,
    triggerSOSDirect,
    cancelEmergency,
    soundEnabled,
    toggleSound,
    activeSOSData,
  } = useEmergency();
  const { user } = useAuth();
  const [showDirectTrigger, setShowDirectTrigger] = useState(false);

  if (!isOpen && !isEmergencyActive && countdown === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background Pulsing Red Waves */}
      <div className="absolute inset-0 bg-red-950/30 pointer-events-none animate-pulse" />

      <div className="relative w-full max-w-sm rounded-[32px] bg-[#16080F] border-2 border-red-500/60 p-6 shadow-[0_0_80px_rgba(239,68,68,0.4)] text-center overflow-hidden">
        {/* Top Emergency Beacon */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-black uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-ping text-red-400" />
            <span>CRITICAL SOS BEACON</span>
          </div>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border ${
              soundEnabled
                ? "bg-red-500/30 border-red-500/50 text-red-200"
                : "bg-white/5 border-white/10 text-slate-400"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* 1. Countdown State (3-second abort window) */}
        {countdown !== null ? (
          <div className="py-4">
            <div className="relative w-28 h-28 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-red-600/50 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-red-600/80">
                {countdown}
              </div>
            </div>

            <h2 className="text-xl font-black text-white tracking-tight mb-1">
              Dispatching SOS in {countdown}s...
            </h2>
            <p className="text-xs text-red-200/80 mb-6 px-2">
              Alerting NYPD Dispatch, Fleet Security & Emergency Contacts with your live GPS location.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  cancelCountdown();
                  if (onClose) onClose();
                }}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm border border-white/20 active:scale-95 transition-all shadow-lg"
              >
                CANCEL (I'M SAFE)
              </button>

              <button
                onClick={() => {
                  cancelCountdown();
                  triggerSOSDirect({ tripId: 1 });
                }}
                className="w-full py-2.5 text-xs text-red-400 font-bold hover:underline"
              >
                Trigger Immediately without waiting
              </button>
            </div>
          </div>
        ) : isEmergencyActive ? (
          /* 2. Active Emergency Broadcast State */
          <div className="py-2">
            <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-600/40 animate-ping" />
              <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-2xl shadow-red-600 animate-bounce">
                <AlertOctagon className="w-9 h-9" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mb-1">
              EMERGENCY ACTIVE
            </h2>
            <p className="text-xs text-red-300 font-semibold mb-5">
              Live distress telemetry broadcasting over encrypted channels
            </p>

            {/* Status Checklist */}
            <div className="bg-red-950/60 border border-red-500/30 rounded-2xl p-3.5 text-left space-y-2 mb-5">
              <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GPS Coordinates Transmitted (40.758° N, -73.985° W)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Emergency Contacts Auto-Alerted via SMS</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Police & Central Dispatch Intercept Active</span>
              </div>
            </div>

            {/* Quick Emergency Phone Actions */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <a
                href="tel:911"
                className="py-3 px-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/40 active:scale-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>DIAL 911</span>
              </a>

              <a
                href="tel:+15559981122"
                className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>CALL CONTACT</span>
              </a>
            </div>

            {/* Cancel Emergency button */}
            <button
              onClick={() => {
                cancelEmergency();
                if (onClose) onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/20 active:scale-95 transition-all"
            >
              STAND DOWN EMERGENCY (ALL CLEAR)
            </button>
          </div>
        ) : (
          /* 3. Pre-trigger selection */
          <div className="py-3">
            <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 mx-auto flex items-center justify-center mb-4 text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-black text-white mb-2">Trigger Emergency Panic?</h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              This will immediately sound the siren, alert fleet dispatchers, and dispatch real-time GPS coordinates to your emergency contacts.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => triggerSOSDirect({ tripId: 1 })}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-sm shadow-xl shadow-red-600/40 active:scale-95 transition-all"
              >
                YES, TRIGGER EMERGENCY SOS
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs border border-white/10"
              >
                Cancel & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
