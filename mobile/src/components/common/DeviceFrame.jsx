import React, { useState } from "react";
import { Smartphone, Monitor, ShieldCheck, Sparkles, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

export default function DeviceFrame({ children }) {
  const [deviceMode, setDeviceMode] = useState("frame"); // "frame" | "fullscreen"
  const [phoneModel, setPhoneModel] = useState("iphone"); // "iphone" | "android"
  const { soundEnabled, toggleSound, isEmergencyActive } = useEmergency();

  return (
    <div className="min-h-screen bg-[#05050c] flex flex-col items-center justify-start lg:justify-center p-0 sm:p-4 md:p-6 select-none relative overflow-x-hidden selection:bg-yellow-400 selection:text-black">
      {/* Background ambient glowing taxi yellow orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-amber-500/20 via-yellow-500/15 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-yellow-600/15 via-amber-500/10 to-transparent blur-[130px] pointer-events-none -z-10" />

      {/* Top Desktop Bar (only visible on larger screens to control view & demo options) */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-md md:max-w-xl mb-4 px-4 py-2.5 rounded-2xl bg-[#12110c]/80 border border-yellow-500/20 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2">
          <img
            src="/saferide_logo.png"
            alt="SafeRide Logo"
            className="w-7 h-7 rounded-lg object-cover border border-yellow-400/60 shadow-md shadow-yellow-500/30"
          />
          <div>
            <h1 className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
              SAFE RIDE <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 font-black">MOBILE</span>
            </h1>
          </div>
        </div>

        {/* Device Mode & Sound Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute Emergency Siren" : "Unmute Emergency Siren"}
            className={`p-1.5 rounded-xl border transition-all ${
              soundEnabled
                ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setPhoneModel((m) => (m === "iphone" ? "android" : "iphone"))}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1"
          >
            <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
            <span>{phoneModel === "iphone" ? "iPhone 16 Pro" : "Galaxy S24"}</span>
          </button>

          <button
            onClick={() => setDeviceMode((d) => (d === "frame" ? "fullscreen" : "frame"))}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            title={deviceMode === "frame" ? "Switch to Fullscreen" : "Switch to Device Frame"}
          >
            <Monitor className="w-4 h-4 text-yellow-400" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceMode === "frame"
            ? `max-w-[412px] h-[100dvh] sm:h-[870px] sm:rounded-[52px] sm:border-[8px] ${
                phoneModel === "iphone" ? "sm:border-[#2d281a]" : "sm:border-[#201d14]"
              } sm:shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.25)] relative overflow-hidden bg-[#070710] flex flex-col`
            : "max-w-md md:max-w-2xl min-h-screen bg-[#070710] flex flex-col sm:border sm:border-yellow-500/20 sm:rounded-3xl"
        }`}
      >
        {/* Dynamic Island / Camera Notch for iPhone frame */}
        {deviceMode === "frame" && (
          <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            {phoneModel === "iphone" ? (
              <div
                className={`h-7 rounded-full bg-black border border-white/10 flex items-center justify-between px-3.5 transition-all duration-300 shadow-lg ${
                  isEmergencyActive ? "w-64 bg-red-950/90 border-red-500/50" : "w-32"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                {isEmergencyActive ? (
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-wider animate-pulse">
                    🚨 SOS ACTIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-yellow-400">CAB SAFE</span>
                )}
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-black border border-white/20 mt-1" />
            )}
          </div>
        )}

        {/* App Viewport */}
        <div className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden">{children}</div>

        {/* Mobile Home Indicator Bar (iOS style) */}
        {deviceMode === "frame" && (
          <div className="hidden sm:flex w-full justify-center pb-2 pt-1 pointer-events-none bg-gradient-to-t from-[#070710] to-transparent shrink-0">
            <div className="w-32 h-1 rounded-full bg-yellow-400/40" />
          </div>
        )}
      </div>
    </div>
  );
}
