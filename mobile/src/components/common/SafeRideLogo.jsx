import React from "react";

export default function SafeRideLogo({
  size = "md", // "sm" | "md" | "lg" | "xl"
  showText = true,
  subtitle = "AI SECURITY",
  className = ""
}) {
  const sizeMap = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-10 h-10 rounded-2xl",
    lg: "w-16 h-16 rounded-3xl",
    xl: "w-24 h-24 rounded-[32px]"
  };

  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-xl",
    xl: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem Icon with Yellow Neon Glow */}
      <div className="relative group">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 opacity-60 blur-sm group-hover:opacity-100 transition duration-300" />
        <img
          src="/saferide_logo.png"
          alt="SafeRide Logo"
          className={`relative ${sizeMap[size] || sizeMap.md} object-cover border border-yellow-400/50 shadow-lg shadow-yellow-500/25`}
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2 border-black animate-pulse" />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black tracking-tight text-white ${textSizeMap[size] || textSizeMap.md}`}>
              Safe<span className="text-yellow-400">Ride</span>
            </span>
            {subtitle && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-yellow-500/15 border border-yellow-500/35 text-yellow-300 font-extrabold uppercase tracking-wider">
                {subtitle}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>Urban Taxi Protection Grid</span>
          </span>
        </div>
      )}
    </div>
  );
}
