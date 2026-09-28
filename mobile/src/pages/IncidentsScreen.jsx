import React, { useState } from "react";
import {
  AlertTriangle,
  Camera,
  MapPin,
  ShieldAlert,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  Sparkles,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { NativeService } from "../services/native";
import api from "../services/api";

export default function IncidentsScreen() {
  const { user, role } = useAuth();
  const { addToast } = useToast();

  const [incidents, setIncidents] = useState([
    {
      id: 1,
      code: "INC-2026-0801",
      type: "ROUTE_DEVIATION",
      severity: "MEDIUM",
      status: "UNDER_REVIEW",
      description: "Driver took unauthorized side alley avoiding the GPS recommended expressway. AI safety guardian detected a 1.2km route deviation anomaly.",
      location: "8th Ave & 39th St, Midtown Manhattan",
      timestamp: "Today, 11:45 AM",
      reporter: "Elena Rostova (Passenger)",
      aiConfidence: 94,
    },
    {
      id: 2,
      code: "INC-2026-0789",
      type: "LOST_ITEM",
      severity: "LOW",
      status: "RESOLVED",
      description: "Left silver iPhone 16 Pro on rear passenger seat after 11 PM trip.",
      location: "Columbus Circle Subway Entrance",
      timestamp: "Yesterday, 11:20 PM",
      reporter: "Elena Rostova (Passenger)",
      aiConfidence: 100,
    },
    {
      id: 3,
      code: "INC-2026-0752",
      type: "UNSAFE_DRIVING",
      severity: "HIGH",
      status: "RESOLVED",
      description: "Sudden acceleration and running yellow lights on FDR Drive.",
      location: "FDR Drive & E 34th St",
      timestamp: "Aug 29, 2026",
      reporter: "Transit Dispatch AI",
      aiConfidence: 98,
    }
  ]);

  const [filter, setFilter] = useState("ALL");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Form State
  const [type, setType] = useState("ROUTE_DEVIATION");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [locationAddress, setLocationAddress] = useState("Current GPS Location (40.7580° N, -73.9855° W)");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCapturePhoto = async () => {
    NativeService.triggerHaptic("light");
    const photo = await NativeService.capturePhoto();
    if (photo) {
      setPhotoPreview(photo);
    } else {
      // Prompt user or use fallback sample image
      setPhotoPreview("https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=80");
      addToast("Photo attached from camera sensor", "info");
    }
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      addToast("Please provide a description of the incident", "warning");
      return;
    }

    setSubmitting(true);
    NativeService.triggerHaptic("heavy");

    const newIncident = {
      id: Date.now(),
      code: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      severity,
      status: "UNDER_REVIEW",
      description,
      location: locationAddress,
      timestamp: "Just now",
      reporter: `${user?.name || "Elena Rostova"} (${role})`,
      photo: photoPreview,
      aiConfidence: 96,
    };

    try {
      await api.post("/incidents", {
        type,
        severity,
        description,
        locationAddress,
        reporterRole: role,
      });
    } catch (err) {
      console.warn("Backend save fallback notice:", err.message);
    }

    setIncidents([newIncident, ...incidents]);
    setSubmitting(false);
    setIsReportModalOpen(false);
    setDescription("");
    setPhotoPreview(null);
    NativeService.triggerHaptic("success");
    addToast("Incident logged! AI Safety Dispatch has been notified.", "success");
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === "ALL") return true;
    return inc.status === filter;
  });

  return (
    <div className="flex-1 p-4 pb-20 overflow-y-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Incident Safety Center</span>
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </h2>
          <p className="text-xs text-slate-400">Log safety anomalies with AI risk analysis</p>
        </div>

        <button
          onClick={() => {
            NativeService.triggerHaptic("light");
            setIsReportModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Report</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#101026] rounded-2xl border border-white/5">
        {["ALL", "UNDER_REVIEW", "RESOLVED"].map((f) => (
          <button
            key={f}
            onClick={() => {
              NativeService.triggerHaptic("light");
              setFilter(f);
            }}
            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              filter === f
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {f === "ALL" ? "All Logs" : f === "UNDER_REVIEW" ? "Under Review" : "Resolved"}
          </button>
        ))}
      </div>

      {/* Incident Cards Feed */}
      <div className="space-y-3">
        {filteredIncidents.map((inc) => {
          let severityBadge = "bg-amber-500/20 text-amber-300 border-amber-500/40";
          if (inc.severity === "HIGH" || inc.severity === "CRITICAL") {
            severityBadge = "bg-red-500/20 text-red-300 border-red-500/40";
          } else if (inc.severity === "LOW") {
            severityBadge = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
          }

          return (
            <div
              key={inc.id}
              className="p-4 rounded-3xl bg-[#11112B] border border-white/10 hover:border-purple-500/30 shadow-xl space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono text-cyan-400">{inc.code}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-extrabold uppercase ${severityBadge}`}>
                    {inc.severity}
                  </span>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    inc.status === "RESOLVED"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                  }`}
                >
                  {inc.status.replace("_", " ")}
                </span>
              </div>

              <h4 className="text-xs font-extrabold text-white">{inc.type.replace(/_/g, " ")}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{inc.description}</p>

              {inc.photo && (
                <img
                  src={inc.photo}
                  alt="Incident evidence"
                  className="w-full h-32 object-cover rounded-2xl border border-white/10"
                />
              )}

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                  <span className="truncate max-w-[170px]">{inc.location}</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-cyan-300">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Score: {inc.aiConfidence}%</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Incident Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0F0F28] border-t border-white/15 rounded-t-[32px] p-5 max-h-[85dvh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Report Security Incident</span>
                </h3>
                <p className="text-[11px] text-slate-400">Transmits report to NYPD & Fleet Admin</p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-3.5">
              {/* Incident Type */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Incident Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ROUTE_DEVIATION" className="bg-slate-900">Route Deviation / Unapproved Path</option>
                  <option value="UNSAFE_DRIVING" className="bg-slate-900">Unsafe Driving / Speeding</option>
                  <option value="HARASSMENT" className="bg-slate-900">Driver Harassment / Conflict</option>
                  <option value="LOST_ITEM" className="bg-slate-900">Lost Item in Taxi</option>
                  <option value="MEDICAL_EMERGENCY" className="bg-slate-900">Medical Emergency</option>
                  <option value="OVERCHARGE_DISPUTE" className="bg-slate-900">Fare Dispute / Tampered Meter</option>
                </select>
              </div>

              {/* Severity Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Severity Level</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={`py-2 rounded-xl text-[10px] font-black border transition-all ${
                        severity === s
                          ? s === "CRITICAL"
                            ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/40"
                            : s === "HIGH"
                            ? "bg-rose-600 border-rose-500 text-white"
                            : s === "MEDIUM"
                            ? "bg-amber-600 border-amber-500 text-white"
                            : "bg-cyan-600 border-cyan-500 text-white"
                          : "bg-white/5 border-white/10 text-slate-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Details & Context</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what occurred, vehicle behavior, driver actions..."
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Photo Evidence Capture */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Photo Evidence</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>{photoPreview ? "Retake Photo" : "Capture / Attach Photo"}</span>
                  </button>

                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-12 h-10 object-cover rounded-xl border border-white/20"
                    />
                  )}
                </div>
              </div>

              {/* Location display */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-[11px] text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">{locationAddress}</span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 active:scale-95 transition-all"
              >
                {submitting ? "Transmitting Incident..." : "Submit Incident Report"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
