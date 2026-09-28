import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Radio,
  MapPin,
  Camera,
  Upload,
  ShieldAlert,
  Car,
  Clock,
  CheckCircle2,
  FileText,
  UserX,
  Compass,
  Zap,
  PhoneCall,
  Send,
  X,
  Search
} from "lucide-react";
import LiveMap from "../components/LiveMap";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

export default function IncidentsPage() {
  const { user, isAuthenticated } = useAuth();
  const { success, error: toastError, emergency: toastEmergency } = useToast();

  const [incidentType, setIncidentType] = useState("ROUTE_DEVIATION");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [locationAddress, setLocationAddress] = useState("8th Ave & 39th St, Midtown Manhattan");
  const [selectedCoords, setSelectedCoords] = useState({ lat: 40.7549, lng: -73.9912 });
  const [mediaUrl, setMediaUrl] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [successReport, setSuccessReport] = useState(null);

  const incidentTypes = [
    { key: "ROUTE_DEVIATION", label: "Route Deviation", icon: Compass, desc: "Driver diverted from navigation path" },
    { key: "HARASSMENT", label: "Harassment / Threat", icon: UserX, desc: "Inappropriate behavior or verbal threats" },
    { key: "OVERSPEEDING", label: "Erratic Driving / Speeding", icon: Zap, desc: "Dangerous speed or reckless maneuvers" },
    { key: "ACCIDENT", label: "Traffic Collision / Accident", icon: AlertTriangle, desc: "Physical vehicle accident or breakdown" },
    { key: "LOST_ITEM", label: "Lost Property", icon: FileText, desc: "Belongings left in vehicle" },
    { key: "OTHER", label: "Other Security Concern", icon: ShieldAlert, desc: "Suspicious activity or safety violation" }
  ];

  // Fetch past incidents
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/incidents")
      .then((res) => {
        if (res.data) setRecentIncidents(res.data);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toastError("Please provide a description of the incident.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: incidentType,
        severity: isEmergency ? "CRITICAL" : severity,
        description,
        locationAddress,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
        mediaUrl: mediaUrl || "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80",
        isEmergency
      };

      const res = await api.post("/incidents", payload);
      setSuccessReport(res.data);
      setRecentIncidents((prev) => [res.data, ...prev]);

      if (isEmergency) {
        toastEmergency(`🚨 EMERGENCY INCIDENT #${res.data.incidentCode} DISPATCHED TO OPERATIONS!`);
      } else {
        success(`Incident report #${res.data.incidentCode} submitted successfully.`);
      }

      // Reset form
      setDescription("");
      setIsEmergency(false);
    } catch (err) {
      toastError("Failed to submit incident report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulatePhotoUpload = () => {
    setMediaUrl("https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600&auto=format&fit=crop&q=80");
    success("Photo evidence attached successfully.");
  };

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span>Security & Compliance</span>
          <span>/</span>
          <span className="text-slate-200 font-semibold">Incident Operations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-400" />
          Incident & Anomaly Reporting Center
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Report safety violations, route deviations, accidents, or harassment. High-severity and emergency reports instantly dispatch GPS coordinates to Central Security & local authorities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Report Filing Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Success Notification Banner if just reported */}
          {successReport && (
            <div className="p-6 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 shadow-xl space-y-3 animate-fade-in relative">
              <button
                onClick={() => setSuccessReport(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-emerald-800/40 text-emerald-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">Report Filed: {successReport.incidentCode}</h4>
                  <p className="text-xs text-emerald-300">Case assigned to Central Security Dispatch unit.</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Emergency High Priority Switch */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isEmergency
                  ? "bg-red-950/80 border-red-500 shadow-xl shadow-red-500/25 animate-pulse"
                  : "bg-white/5 border-white/10"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Emergency Immediate Response Mode</h4>
                      <p className="text-xs text-slate-300">Trigger immediate SMS broadcast & priority police dispatch</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEmergency}
                      onChange={(e) => setIsEmergency(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600" />
                  </label>
                </div>
              </div>

              {/* 1. Incident Category Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  1. Select Incident Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {incidentTypes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = incidentType === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setIncidentType(t.key)}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                            : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-[#00D4FF]" : "text-slate-400"}`} />
                          <span className="text-xs font-bold text-white">{t.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{t.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Severity Level */}
              {!isEmergency && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    2. Severity Assessment
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          severity === sev
                            ? sev === "CRITICAL"
                              ? "bg-red-600/30 border-red-500 text-red-300"
                              : sev === "HIGH"
                              ? "bg-orange-600/30 border-orange-500 text-orange-300"
                              : "bg-purple-600/30 border-purple-500 text-purple-300"
                            : "bg-white/5 border-white/5 text-slate-400"
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Interactive Map Pinning */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    3. Pin Incident GPS Location
                  </label>
                  <span className="text-[11px] text-purple-400 font-mono">
                    Lat: {selectedCoords.lat.toFixed(4)}, Lng: {selectedCoords.lng.toFixed(4)}
                  </span>
                </div>
                <LiveMap
                  interactivePin={true}
                  selectedLocation={selectedCoords}
                  onLocationSelect={(coords) => setSelectedCoords(coords)}
                  height="260px"
                />
              </div>

              {/* 4. Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  4. Incident Description & Evidence
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise details of what happened, landmarks, driver behavior, or involved license plates..."
                  rows={4}
                  className="w-full p-3.5 rounded-2xl glass-input text-xs resize-none"
                  required
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Minimum 10 characters</span>
                  <span>{description.length} characters</span>
                </div>
              </div>

              {/* Photo Upload Attachment */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-[#00D4FF]" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Attach Photo / Dashcam Screenshot</h5>
                    <p className="text-[11px] text-slate-400">JPEG, PNG, MP4 up to 25MB</p>
                  </div>
                </div>

                {mediaUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Evidence Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setMediaUrl("")}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulatePhotoUpload}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Attach Media
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-2xl font-black text-xs tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isEmergency
                    ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-red-500/40 hover:brightness-110"
                    : "bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white shadow-purple-500/30 hover:brightness-110"
                }`}
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isEmergency ? "SUBMIT EMERGENCY SOS INCIDENT" : "FILE OFFICIAL INCIDENT REPORT"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Past Incident Reports History */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> Recent Incident Reports
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {recentIncidents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No incident reports filed yet.
                </div>
              ) : (
                recentIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">{inc.incidentCode}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          inc.status === "RESOLVED"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : inc.status === "UNDER_REVIEW"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-purple-500/20 text-purple-300"
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>

                    <p className="font-bold text-purple-300">{inc.type}</p>
                    <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">{inc.description}</p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(inc.createdAt || Date.now()).toLocaleDateString()}</span>
                      <span className="text-[#00D4FF] font-semibold">{inc.severity} Priority</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}