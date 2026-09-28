import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Radio,
  Car,
  Shield,
  Activity,
  Satellite,
  Crosshair,
  AlertTriangle,
  Zap,
  RotateCw,
  Search,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Eye
} from "lucide-react";
import LiveMap from "../components/LiveMap";
import api from "../services/api";

export default function MapPage() {
  const [taxis, setTaxis] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaxiId, setSelectedTaxiId] = useState(null);
  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);

  // Fetch initial fleet data
  const fetchTaxis = () => {
    api.get("/taxis")
      .then((res) => {
        if (res.data) setTaxis(res.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTaxis();
    const interval = setInterval(fetchTaxis, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTaxis = taxis.filter((t) => {
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    const matchesSearch =
      (t.vehicleNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.driverName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = taxis.filter((t) => t.status === "ACTIVE" || t.status === "ON_TRIP").length;
  const emergencyCount = taxis.filter((t) => t.status === "EMERGENCY" || t.status === "SOS").length;

  // Simulate an SOS incident on TX-901 for demonstration of God's Eye intercept protocol
  const handleSimulateIncident = () => {
    setEmergencyAlertActive(true);
    setTaxis((prev) =>
      prev.map((t) =>
        t.vehicleNumber === "TX-901" ? { ...t, status: "EMERGENCY" } : t
      )
    );
    setSelectedTaxiId("TX-901");
  };

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-6 space-y-6">
      {/* ══════════════════════════════════════════════════════
          TOP HEADER: GOD'S EYE OMNIPRESENCE COMMAND
          ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-[#00D4FF] font-semibold flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#00D4FF]" /> God's Eye Surveillance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Radio className="w-8 h-8 text-[#00D4FF] animate-pulse" />
            God's Eye Fleet Surveillance Command
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Centralized omnipresence tactical radar & satellite telemetry. Live PostGIS coordinates, target lock-on, dynamic threat vector interception, and automated fleet tracking.
          </p>
        </div>

        {/* Telemetry Status Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-[11px]">
              <div className="text-slate-400 text-[9px] uppercase font-bold">Orbital Sat-Lock</div>
              <div className="text-white font-mono font-bold">18 SATS CONNECTED</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2">
            <Satellite className="w-4 h-4 text-[#00D4FF]" />
            <div className="text-[11px]">
              <div className="text-cyan-300 text-[9px] uppercase font-bold">Fleet Tracked</div>
              <div className="text-white font-mono font-bold">{taxis.length} UNITS ONLINE</div>
            </div>
          </div>

          {emergencyCount > 0 || emergencyAlertActive ? (
            <div className="px-3.5 py-2 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <div className="text-[11px]">
                <div className="text-red-300 text-[9px] uppercase font-bold">Distress Signal</div>
                <div className="text-red-200 font-mono font-black">SOS ACTIVE</div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSimulateIncident}
              className="px-3.5 py-2 rounded-2xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Test Emergency Protocol on TX-901"
            >
              <Zap className="w-3.5 h-3.5 text-red-400" /> Simulate SOS Alert
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN GOD'S EYE INTERACTIVE MAP
          ══════════════════════════════════════════════════════ */}
      <LiveMap
        taxis={filteredTaxis}
        height="600px"
        initialGodsEye={true}
        highlightedTaxiId={selectedTaxiId}
        onTaxiSelect={(taxi) => setSelectedTaxiId(taxi.vehicleNumber)}
      />

      {/* ══════════════════════════════════════════════════════
          BOTTOM FLEET RADAR & QUICK TARGET SELECTOR
          ══════════════════════════════════════════════════════ */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-[#00D4FF]" />
              Tactical Fleet Radar ({filteredTaxis.length} Monitored Units)
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any taxi unit below to immediately engage God's Eye Target Lock-on and live telemetry analysis.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Plate or Driver..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {["ALL", "ACTIVE", "EMERGENCY"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                    filterStatus === st
                      ? "bg-[#00D4FF] text-black shadow-[0_0_10px_rgba(0,212,255,0.4)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Units Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTaxis.map((taxi) => {
            const isSelected = selectedTaxiId === taxi.vehicleNumber || selectedTaxiId === taxi.id;
            const isEmergency = taxi.status === "EMERGENCY" || taxi.status === "SOS";

            return (
              <div
                key={taxi.id}
                onClick={() => setSelectedTaxiId(taxi.vehicleNumber)}
                className={`p-4 rounded-2xl transition-all cursor-pointer space-y-2 text-xs border ${
                  isSelected
                    ? "bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.25)]"
                    : isEmergency
                    ? "bg-red-500/10 border-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    : "bg-white/5 border-white/5 hover:border-purple-500/40 hover:bg-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white font-mono text-sm flex items-center gap-1.5">
                    {isSelected && <Crosshair className="w-3.5 h-3.5 text-[#00D4FF] animate-spin" />}
                    {taxi.vehicleNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      isEmergency
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : taxi.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-cyan-500/20 text-[#00D4FF] border border-cyan-500/30"
                    }`}
                  >
                    {taxi.status}
                  </span>
                </div>

                <p className="text-slate-300 font-semibold">{taxi.model}</p>
                <p className="text-purple-300 text-[11px]">Driver: {taxi.driverName || "Marcus Vance"}</p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>★ {taxi.rating || 4.95}</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Crosshair className="w-3 h-3" /> Lock-On Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}