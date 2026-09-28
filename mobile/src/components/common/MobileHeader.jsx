import React, { useState, useEffect } from "react";
import { Shield, Wifi, Battery, Radio, AlertOctagon, User, Sparkles, Volume2, VolumeX, Car } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEmergency } from "../../context/EmergencyContext";
import { useSocket } from "../../context/SocketContext";
import { NativeService } from "../../services/native";
import SafeRideLogo from "./SafeRideLogo";

export default function MobileHeader({ onOpenRoleDrawer, onOpenSOSModal }) {
  const { user, isAuthenticated, role } = useAuth();
  const { isEmergencyActive, soundEnabled, toggleSound } = useEmergency();
  const { connected } = useSocket();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full shrink-0 z-40 bg-[#0E0C07]/95 border-b border-yellow-500/20 backdrop-blur-2xl sticky top-0">
      {/* 1. Status Bar (Time, Connectivity, Battery) */}
      <div className="pt-2 px-4 pb-1 flex items-center justify-between text-[11px] font-medium text-slate-400 select-none">
        <span className="font-bold text-yellow-100 tracking-tight">{timeStr || "09:41"}</span>

        <div className="flex items-center gap-2">
          {/* Real-time Socket Indicator */}
          <div
            className="flex items-center gap-1 text-[10px]"
            title={connected ? "Socket.io Connected" : "Connecting..."}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-yellow-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className={connected ? "text-yellow-400 font-black" : "text-amber-400"}>
              {connected ? "GPS LIVE" : "GPS SYNC"}
            </span>
          </div>

          <Wifi className="w-3.5 h-3.5 text-yellow-200/70" />
          <div className="flex items-center gap-1 text-yellow-200/80">
            <span>98%</span>
            <Battery className="w-3.5 h-3.5 text-yellow-400 rotate-90" />
          </div>
        </div>
      </div>

      {/* 2. Main Mobile Action Header */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* SafeRide Brand Logo */}
        <SafeRideLogo size="sm" subtitle="SECURITY" />

        {/* Right Actions: Siren mute, Role switcher & SOS Panic trigger */}
        <div className="flex items-center gap-2">
          {/* Siren sound toggle */}
          <button
            onClick={() => {
              NativeService.triggerHaptic("light");
              toggleSound();
            }}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-300"
                : "bg-white/5 border-white/10 text-slate-400"
            }`}
            title="Toggle SOS Siren Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Role badge switcher */}
          <button
            onClick={() => {
              NativeService.triggerHaptic("light");
              onOpenRoleDrawer();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-xs font-semibold text-yellow-200 active:scale-95 transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-[11px] uppercase tracking-wide font-black">
              {role === "ADMIN" ? "Admin" : role === "DRIVER" ? "Driver" : "Passenger"}
            </span>
          </button>

          {/* Quick SOS Trigger Button */}
          <button
            onClick={() => {
              NativeService.triggerHaptic("heavy");
              onOpenSOSModal();
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs tracking-wider flex items-center gap-1.5 shadow-lg active:scale-90 transition-all ${
              isEmergencyActive
                ? "bg-red-600 text-white animate-sos-strobe shadow-red-600/50"
                : "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-red-600/30 border border-red-500/50 hover:brightness-110"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}
