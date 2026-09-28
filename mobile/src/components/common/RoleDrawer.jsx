import React from "react";
import { User, Car, Shield, X, CheckCircle2, ChevronRight, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { NativeService } from "../../services/native";

export default function RoleDrawer({ isOpen, onClose, onNavigateTab }) {
  const { user, role, loginAsDemo, logout } = useAuth();
  const { addToast } = useToast();

  if (!isOpen) return null;

  const roles = [
    {
      id: "PASSENGER",
      title: "Passenger Persona",
      name: "Elena Rostova",
      desc: "Live GPS ride tracking, biometric QR scan, SOS panic trigger & emergency contacts",
      icon: User,
      color: "from-amber-500 to-yellow-500",
      accent: "text-yellow-300 border-yellow-500/40 bg-yellow-500/15",
    },
    {
      id: "DRIVER",
      title: "Driver Persona",
      name: "Marcus Vance (TX-901)",
      desc: "Vehicle telemetry broadcasting, safety rating, passenger verification & trip controls",
      icon: Car,
      color: "from-yellow-500 to-amber-600",
      accent: "text-amber-300 border-amber-500/40 bg-amber-500/15",
    },
    {
      id: "ADMIN",
      title: "Fleet Commander Persona",
      name: "Commander Alex Reynolds",
      desc: "Live fleet GPS radar, real-time SOS incident dispatch & safety logs",
      icon: Shield,
      color: "from-yellow-600 to-orange-600",
      accent: "text-amber-400 border-amber-500/40 bg-amber-500/15",
    },
  ];

  const handleSelectRole = async (targetRole) => {
    NativeService.triggerHaptic("success");
    await loginAsDemo(targetRole);
    addToast(`Switched persona to ${targetRole} mode`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md transition-all animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-up sheet */}
      <div className="relative w-full max-w-md bg-[#12100A] border-t border-yellow-500/30 rounded-t-[32px] p-5 shadow-2xl z-10 animate-in slide-in-from-bottom duration-300">
        {/* Drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-yellow-500/30 mx-auto mb-4" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>Switch Active Persona</span>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </h2>
            <p className="text-xs text-slate-400">1-Tap testing for all mobile system actors</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles list */}
        <div className="space-y-2.5 mb-5">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;

            return (
              <button
                key={r.id}
                onClick={() => handleSelectRole(r.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 active:scale-[0.98] ${
                  isSelected
                    ? "bg-[#201B0E] border-yellow-500/70 shadow-lg shadow-yellow-500/15"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${r.color} flex items-center justify-center shrink-0 shadow-md text-black font-black`}
                >
                  <Icon className="w-5 h-5 text-black" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-white truncate">{r.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-extrabold ${r.accent}`}>
                      {r.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">{r.desc}</p>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-yellow-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Logout or Quick Actions */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              logout();
              addToast("Logged out successfully", "info");
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onNavigateTab) onNavigateTab("profile");
            }}
            className="px-4 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/30"
          >
            Manage Profile
          </button>
        </div>
      </div>
    </div>
  );
}
