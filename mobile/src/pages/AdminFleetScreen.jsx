import React, { useState } from "react";
import { Shield, Radio, Car, AlertOctagon, CheckCircle2, ChevronLeft, MapPin, Sparkles, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { NativeService } from "../services/native";

export default function AdminFleetScreen({ onBack }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [fleet] = useState([
    { id: 1, number: "TX-901", driver: "Marcus Vance", status: "IN_TRANSIT", model: "Toyota Camry Hybrid", speed: "38 km/h", coords: "40.7580, -73.9855" },
    { id: 2, number: "TX-902", driver: "Sophia Chen", status: "AVAILABLE", model: "Tesla Model Y", speed: "0 km/h", coords: "40.7614, -73.9776" },
    { id: 3, number: "TX-903", driver: "Derrick Hayes", status: "ON_TRIP", model: "Ford Explorer Interceptor", speed: "42 km/h", coords: "40.7484, -73.9857" },
  ]);

  const [activeSOSList, setActiveSOSList] = useState([
    {
      id: 1,
      passenger: "Elena Rostova",
      taxiNumber: "TX-901",
      driver: "Marcus Vance",
      location: "8th Ave & 39th St, Midtown Manhattan",
      time: "2 mins ago",
      resolved: false,
    },
  ]);

  const handleResolveSOS = (id) => {
    NativeService.triggerHaptic("success");
    setActiveSOSList(activeSOSList.map((s) => (s.id === id ? { ...s, resolved: true } : s)));
    addToast("Emergency alarm marked as RESOLVED by Fleet Admin.", "success");
  };

  return (
    <div className="flex-1 p-4 pb-20 overflow-y-auto space-y-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white mb-1"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Main Menu</span>
      </button>

      {/* Fleet Command Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#28140B] via-[#1A0E08] to-[#0E0604] border border-amber-500/40 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Central Security Command</h3>
              <p className="text-[10px] text-amber-300">Commander Alex Reynolds</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black text-emerald-300">
            ALL SECTORS ONLINE
          </span>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-2xl border border-white/5 text-center">
          <div>
            <span className="text-xs font-black text-amber-300">38</span>
            <p className="text-[9px] text-slate-400">Total Fleet</p>
          </div>
          <div className="border-l border-white/10">
            <span className="text-xs font-black text-cyan-300">14</span>
            <p className="text-[9px] text-slate-400">Active Trips</p>
          </div>
          <div className="border-l border-white/10">
            <span className="text-xs font-black text-red-400">{activeSOSList.filter((s) => !s.resolved).length}</span>
            <p className="text-[9px] text-slate-400">SOS Alerts</p>
          </div>
        </div>
      </div>

      {/* Active SOS Intercepts */}
      {activeSOSList.some((s) => !s.resolved) && (
        <div className="p-4 rounded-3xl bg-red-950/60 border-2 border-red-500/80 shadow-2xl animate-sos-strobe space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
              <span>ACTIVE SOS DISPATCH INTERCEPT</span>
            </span>
            <span className="text-[10px] text-red-300 font-mono">PRIORITY 1</span>
          </div>

          {activeSOSList
            .filter((s) => !s.resolved)
            .map((sos) => (
              <div key={sos.id} className="bg-black/40 p-3 rounded-2xl border border-red-500/30 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white font-bold">Passenger: {sos.passenger}</span>
                  <span className="text-red-300">{sos.time}</span>
                </div>
                <div className="text-slate-300 text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{sos.location} (Taxi {sos.taxiNumber})</span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <a
                    href="tel:911"
                    className="flex-1 py-2 rounded-xl bg-red-600 text-white font-black text-center text-xs"
                  >
                    Dispatch NYPD Unit
                  </a>
                  <button
                    onClick={() => handleResolveSOS(sos.id)}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 font-bold text-xs"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Fleet Live Radar */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-white flex items-center gap-1.5 px-1">
          <Car className="w-4 h-4 text-cyan-400" />
          <span>Active Fleet Telemetry Tracker</span>
        </h4>

        <div className="space-y-2">
          {fleet.map((t) => (
            <div key={t.id} className="p-3 rounded-2xl bg-[#12122B] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">
                  {t.number.split("-")[1]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{t.number}</span>
                    <span className="text-[10px] text-cyan-300">{t.model}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Driver: {t.driver}</p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  t.status === "IN_TRANSIT" ? "bg-emerald-500/20 text-emerald-300" : "bg-cyan-500/20 text-cyan-300"
                }`}>
                  {t.status.replace("_", " ")}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.speed}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
