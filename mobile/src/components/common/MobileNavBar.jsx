import React from "react";
import { Home, Navigation, QrCode, AlertTriangle, Bot, User, Car, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { NativeService } from "../../services/native";

export default function MobileNavBar({ activeTab, onSelectTab }) {
  const { role } = useAuth();

  const navItems = [
    { id: "home", label: "Explore", icon: Home },
    { id: "trip", label: "Live Ride", icon: Navigation, badge: "GPS" },
    { id: "qr", label: "QR Verify", icon: QrCode },
    { id: "incidents", label: "Safety", icon: AlertTriangle },
    { id: "ai", label: "AI Shield", icon: Bot, highlight: true },
    {
      id: "profile",
      label: role === "DRIVER" ? "Driver" : role === "ADMIN" ? "Admin" : "Profile",
      icon: role === "DRIVER" ? Car : role === "ADMIN" ? Shield : User,
    },
  ];

  return (
    <nav className="w-full shrink-0 bg-[#0C0A06]/95 border-t border-yellow-500/20 backdrop-blur-2xl px-2 py-1.5 z-40 sticky bottom-0 safe-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                NativeService.triggerHaptic("light");
                onSelectTab(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? "text-yellow-400 font-bold"
                  : "text-slate-400 hover:text-slate-200 font-medium"
              }`}
            >
              {/* Active Yellow glow pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-7 h-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
              )}

              <div className="relative p-1">
                <Icon
                  className={`w-5 h-5 transition-all ${
                    isActive
                      ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                      : item.highlight
                      ? "text-amber-400/80"
                      : "text-slate-400"
                  }`}
                />

                {/* Mini badge */}
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight ${
                  isActive ? "text-yellow-300 scale-105 font-black" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
