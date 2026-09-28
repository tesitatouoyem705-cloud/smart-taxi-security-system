import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Car,
  User,
  Radio,
  QrCode,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  PhoneCall,
  Search,
  Filter,
  Plus,
  Send,
  Camera,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Share2,
  Heart,
  Phone,
  Navigation,
  X,
  Save
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useEmergency } from "../context/EmergencyContext";
import LiveMap from "../components/LiveMap";
import QRGeneratorModal from "../components/QRGeneratorModal";
import QRScannerModal from "../components/QRScannerModal";
import EmergencyButton from "../components/common/EmergencyButton";
import api from "../services/api";

export default function DashboardPage() {
  const { user, role, isAuthenticated } = useAuth();
  const { success, error: toastError, warning } = useToast();
  const { triggerSOS } = useEmergency();
  const navigate = useNavigate();

  // Common State
  const [activeTrip, setActiveTrip] = useState(null);
  const [taxis, setTaxis] = useState([]);
  const [tripsHistory, setTripsHistory] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [systemStats, setSystemStats] = useState(null);

  // Modals
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [qrGenModalOpen, setQrGenModalOpen] = useState(false);
  const [qrScanModalOpen, setQrScanModalOpen] = useState(false);

  // Booking Form State
  const [pickup, setPickup] = useState("Times Square 42nd St");
  const [dropoff, setDropoff] = useState("Grand Central Terminal");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Driver State
  const [isDriverOnline, setIsDriverOnline] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // Admin State
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  // ── Emergency Contacts State ──────────────────────────────
  const [emergencyContacts, setEmergencyContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("taxiguard_emergency_contacts") || "[]"); }
    catch { return []; }
  });
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null); // null = new, object = editing
  const [contactForm, setContactForm] = useState({ name: "", phone: "", relationship: "Family", notify: true });

  // Fetch initial data
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Fetch active trip
    api.get("/trips/active")
      .then((res) => {
        if (res.data?.trip) setActiveTrip(res.data.trip);
      })
      .catch(() => {});

    // 2. Fetch fleet taxis
    api.get("/taxis")
      .then((res) => {
        if (res.data) setTaxis(res.data);
      })
      .catch(() => {});

    // 3. Fetch user's trip history
    api.get("/trips")
      .then((res) => {
        if (res.data) setTripsHistory(res.data);
      })
      .catch(() => {});

    // 4. Fetch incidents
    api.get("/incidents")
      .then((res) => {
        if (res.data) setIncidents(res.data);
      })
      .catch(() => {});

    // 5. If Admin, fetch all users & stats
    if (role === "ADMIN") {
      api.get("/users").then((res) => setAllUsers(res.data || [])).catch(() => {});
      api.get("/users/stats").then((res) => setSystemStats(res.data)).catch(() => {});
    }
  }, [isAuthenticated, role]);

  // Handle Book Ride (Passenger)
  const handleBookRide = async (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) return;

    setBookingLoading(true);
    try {
      const res = await api.post("/trips", {
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        startLatitude: 3.8820,
        startLongitude: 11.5210,
        dropoffLatitude: 3.8910,
        dropoffLongitude: 11.5130
      });

      setActiveTrip(res.data);
      setBookModalOpen(false);
      success("Ride requested successfully! Assigned Security Unit TX-901.");
      navigate("/trip");
    } catch (err) {
      toastError("Failed to request ride. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle Driver Status Toggle
  const handleToggleDriverStatus = () => {
    const newState = !isDriverOnline;
    setIsDriverOnline(newState);
    if (newState) {
      success("You are now ONLINE and ready to receive ride requests.");
    } else {
      warning("You are now OFFLINE.");
    }
    api.put("/users/profile", { isOnline: newState }).catch(() => {});
  };

  // Handle Driver Accept Ride
  const handleAcceptRide = async (tripId) => {
    try {
      const res = await api.put(`/trips/${tripId}/accept`);
      setActiveTrip(res.data);
      setIncomingRequests((prev) => prev.filter((r) => r.id !== tripId));
      success("Ride accepted! Navigating to passenger pickup location.");
      navigate("/trip");
    } catch (err) {
      toastError("Could not accept ride.");
    }
  };

  // Admin User Moderation
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const res = await api.put(`/users/${userId}/status`, { status: newStatus });
      setAllUsers((prev) => prev.map((u) => (u.id === userId ? res.data : u)));
      success(`User status updated to ${newStatus}`);
    } catch (err) {
      toastError("Failed to update user status.");
    }
  };

  // Admin Incident Resolution
  const handleResolveIncident = async (incidentId, newStatus) => {
    try {
      const res = await api.put(`/incidents/${incidentId}/status`, {
        status: newStatus,
        resolutionNotes: "Resolved by Central Admin Operations."
      });
      setIncidents((prev) => prev.map((inc) => (inc.id === incidentId ? res.data : inc)));
      success(`Incident #${incidentId} marked as ${newStatus}`);
    } catch (err) {
      toastError("Failed to update incident.");
    }
  };

  // Admin Send Broadcast
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    success(`System-wide Security Alert Broadcasted: "${broadcastMessage}"`);
    setBroadcastMessage("");
    setBroadcastModalOpen(false);
  };

  // ── Emergency Contact Handlers ────────────────────────────
  const saveContacts = (updated) => {
    setEmergencyContacts(updated);
    localStorage.setItem("taxiguard_emergency_contacts", JSON.stringify(updated));
  };

  const openAddContact = () => {
    setEditingContact(null);
    setContactForm({ name: "", phone: "", relationship: "Family", notify: true });
    setContactModalOpen(true);
  };

  const openEditContact = (contact) => {
    setEditingContact(contact);
    setContactForm({ name: contact.name, phone: contact.phone, relationship: contact.relationship, notify: contact.notify });
    setContactModalOpen(true);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      toastError("Please fill in name and phone number.");
      return;
    }
    if (editingContact) {
      const updated = emergencyContacts.map((c) =>
        c.id === editingContact.id ? { ...c, ...contactForm } : c
      );
      saveContacts(updated);
      success(`Emergency contact "${contactForm.name}" updated.`);
    } else {
      if (emergencyContacts.length >= 5) {
        toastError("Maximum 5 emergency contacts allowed.");
        return;
      }
      const newContact = { id: Date.now(), ...contactForm };
      saveContacts([...emergencyContacts, newContact]);
      success(`"${contactForm.name}" added as emergency contact.`);
    }
    setContactModalOpen(false);
  };

  const handleDeleteContact = (id) => {
    const updated = emergencyContacts.filter((c) => c.id !== id);
    saveContacts(updated);
    success("Emergency contact removed.");
  };

  const handleShareLocation = (contact) => {
    const mockLink = `https://taxiguard.ai/live/${user?.id || "demo"}?shared=true`;
    // Try Web Share API, fall back to SMS link
    if (navigator.share) {
      navigator.share({
        title: "TaxiGuard AI — Live Location Share",
        text: `${user?.name || "A passenger"} is sharing their live taxi location with you. Stay updated in real-time.`,
        url: mockLink,
      }).catch(() => {});
    } else {
      window.open(`sms:${contact.phone}?body=${encodeURIComponent(`TaxiGuard AI: ${user?.name || "Passenger"} is sharing live location: ${mockLink}`)}`);
    }
    success(`Live location shared with ${contact.name}!`);
  };

  const handleCallContact = (contact) => {
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {role === "ADMIN" ? "Central Security Command" : role === "DRIVER" ? "Driver Operations Terminal" : "Passenger Safety Dashboard"}
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <strong className="text-white">{user?.name || "User"}</strong> • Telemetry encrypted with 256-bit protocol
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {role === "PASSENGER" && (
            <>
              <button
                onClick={() => setBookModalOpen(true)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Book Secure Ride
              </button>
              <button
                onClick={() => setQrScanModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-2"
                title="Scan Onboard Taxi QR"
              >
                <QrCode className="w-4 h-4 text-[#00D4FF]" /> Scan QR
              </button>
            </>
          )}

          {role === "DRIVER" && (
            <button
              onClick={handleToggleDriverStatus}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
                isDriverOnline
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40"
                  : "bg-red-600/30 text-red-300 border border-red-500/50 hover:bg-red-600/40"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDriverOnline ? "bg-emerald-400 animate-ping" : "bg-red-400"}`} />
              <span>{isDriverOnline ? "Online & Ready" : "Offline (Resting)"}</span>
            </button>
          )}

          {role === "ADMIN" && (
            <button
              onClick={() => setBroadcastModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-red-500/30 transition-all flex items-center gap-2"
            >
              <Radio className="w-4 h-4 animate-pulse" /> Broadcast Alert
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PASSENGER VIEW */}
      {/* ========================================================================= */}
      {role === "PASSENGER" && (
        <div className="space-y-8">
          {/* Quick Action Banner Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => setBookModalOpen(true)}
              className="p-5 rounded-3xl glass-card glass-card-interactive text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Book Ride</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Instant secure taxi dispatch</p>
            </button>

            <Link
              to="/trip"
              className="p-5 rounded-3xl glass-card glass-card-interactive text-left group block"
            >
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-[#00D4FF] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Live Tracking</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time GPS telemetry</p>
            </Link>

            <button
              onClick={() => setQrScanModalOpen(true)}
              className="p-5 rounded-3xl glass-card glass-card-interactive text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Scan Taxi QR</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Verify vehicle & driver</p>
            </button>

            <Link
              to="/incidents"
              className="p-5 rounded-3xl glass-card glass-card-interactive text-left group block"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Report Issue</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">File an incident report</p>
            </Link>
          </div>

          {/* Active Trip Card */}
          {activeTrip && (
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/40 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] flex items-center justify-center shadow-lg text-white font-bold">
                    <Car className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                        {activeTrip.status}
                      </span>
                      <span className="text-xs text-slate-400">Trip #{activeTrip.id}</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white mt-1">
                      {activeTrip.pickupAddress} → {activeTrip.dropoffAddress}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Driver: <strong className="text-purple-300">{activeTrip.driverName || "Marcus Vance"}</strong> (★ 4.92) • Est. Fare: ${activeTrip.fare || "18.50"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => setQrGenModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4 text-purple-400" /> Share Trip QR
                  </button>
                  <Link
                    to="/trip"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2"
                  >
                    <span>Full Tracking View</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Active Trip Telemetry Strip */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Estimated Arrival</span>
                  <div className="text-base font-bold text-white mt-0.5">~ 8 Minutes</div>
                </div>
                <div>
                  <span className="text-slate-400">Remaining Distance</span>
                  <div className="text-base font-bold text-[#00D4FF] mt-0.5">{activeTrip.distanceKm || "2.4"} km</div>
                </div>
                <div>
                  <span className="text-slate-400">Telemetry Status</span>
                  <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Normal Corridor
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Security Escort</span>
                  <div className="text-base font-bold text-purple-300 mt-0.5">AI Guardian Active</div>
                </div>
              </div>
            </div>
          )}

          {/* Map & Safety Score Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-400" /> Nearby Accredited Fleet Units
                </h3>
                <span className="text-xs text-slate-400">4 Active Taxis in your zone</span>
              </div>
              <LiveMap taxis={taxis} height="360px" />
            </div>

            {/* Safety Score Card */}
            <div className="p-6 rounded-3xl glass-card flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-yellow-400" /> Passenger Safety Score
                  </h4>
                  <span className="text-xs font-bold text-emerald-400">Tier 1 Elite</span>
                </div>

                <div className="text-center py-4">
                  <div className="w-24 h-24 rounded-full border-4 border-yellow-500 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-yellow-500/20">
                    <span className="text-3xl font-black text-white">{user?.safetyScore || 99}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">Maximum Safety Rating</p>
                  <p className="text-[11px] text-slate-500 mt-1">2FA Verified • Emergency Contacts Synchronized</p>
                </div>
              </div>

              {/* Safety Badges */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Award className="w-4 h-4 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Identity Verified</p>
                    <p className="text-[10px] text-slate-400">Government ID & Mobile OTP active</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <PhoneCall className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Instant SOS Linked</p>
                    <p className="text-[10px] text-slate-400">{emergencyContacts.length} Emergency Contact{emergencyContacts.length !== 1 ? "s" : ""} saved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
               EMERGENCY CONTACTS PANEL
          ══════════════════════════════════════════════════════ */}
          <div className="p-6 sm:p-8 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-[#0f0a00]/60 to-[#0A0A0F] relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Emergency Contacts</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Saved contacts receive your live location and SOS alerts instantly</p>
                </div>
              </div>
              <button
                onClick={openAddContact}
                disabled={emergencyContacts.length >= 5}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F5C518] to-[#FFAA00] text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                Add Contact
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">{emergencyContacts.length}/5</span>
              </button>
            </div>

            {/* Empty State */}
            {emergencyContacts.length === 0 && (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-sm font-bold text-white mb-1">No emergency contacts yet</p>
                <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">Add trusted contacts who will be notified with your live location in case of an emergency.</p>
                <button
                  onClick={openAddContact}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F5C518] to-[#FFAA00] text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition-all"
                >
                  + Add Your First Contact
                </button>
              </div>
            )}

            {/* Contact Cards */}
            {emergencyContacts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {emergencyContacts.map((contact, idx) => (
                  <div
                    key={contact.id}
                    className="relative p-5 rounded-2xl bg-black/40 border border-white/8 hover:border-yellow-500/25 transition-all group"
                  >
                    {/* Priority badge */}
                    {idx === 0 && (
                      <div className="absolute -top-2 -left-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#F5C518] to-[#FFAA00] text-black text-[9px] font-black uppercase tracking-wider">
                        Primary
                      </div>
                    )}

                    {/* Avatar + info */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                        <span className="text-base font-black text-yellow-300">{contact.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{contact.name}</p>
                        <p className="text-[11px] text-slate-400">{contact.phone}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-1.5 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-bold text-yellow-300 uppercase">{contact.relationship}</span>
                          {contact.notify && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400">SOS Notified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleShareLocation(contact)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 transition-all"
                        title="Share live location"
                      >
                        <Navigation className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[9px] font-bold text-yellow-300">Location</span>
                      </button>
                      <button
                        onClick={() => handleCallContact(contact)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                        title="Call contact"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[9px] font-bold text-emerald-300">Call</span>
                      </button>
                      <button
                        onClick={() => openEditContact(contact)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 transition-all"
                        title="Edit contact"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400">Edit</span>
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SOS info strip */}
            <div className="mt-5 p-3 rounded-xl border border-red-500/15 bg-red-950/20 flex items-center gap-3 text-xs">
              <Radio className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
              <p className="text-slate-300">
                <strong className="text-red-300">In an emergency:</strong> pressing the SOS button will instantly send your live GPS location to all {emergencyContacts.length > 0 ? emergencyContacts.length : "saved"} contact{emergencyContacts.length !== 1 ? "s" : ""} via SMS and trigger a police dispatch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
           ADD / EDIT EMERGENCY CONTACT MODAL
      ══════════════════════════════════════════════════════ */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-yellow-500/25 bg-[#0F0F18]/95 backdrop-blur-2xl p-6 shadow-2xl shadow-yellow-500/10">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{editingContact ? "Edit Contact" : "Add Emergency Contact"}</h3>
                  <p className="text-[10px] text-slate-400">Will be notified during SOS & location share</p>
                </div>
              </div>
              <button onClick={() => setContactModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 555 000 1234"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm focus:outline-none"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Relationship</label>
                <select
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm focus:outline-none appearance-none cursor-pointer"
                >
                  {["Family", "Spouse/Partner", "Friend", "Colleague", "Guardian", "Other"].map((r) => (
                    <option key={r} value={r} className="bg-[#0F0F18]">{r}</option>
                  ))}
                </select>
              </div>

              {/* SOS Notify toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/4 border border-white/8">
                <div>
                  <p className="text-xs font-bold text-white">Notify on SOS Trigger</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Send SMS alert when you press the emergency button</p>
                </div>
                <button
                  type="button"
                  onClick={() => setContactForm({ ...contactForm, notify: !contactForm.notify })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    contactForm.notify ? "bg-gradient-to-r from-[#F5C518] to-[#FFAA00]" : "bg-white/10"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    contactForm.notify ? "left-[22px]" : "left-0.5"
                  }`} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold border border-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#F5C518] to-[#FFAA00] text-black text-sm font-extrabold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingContact ? "Save Changes" : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DRIVER VIEW */}
      {/* ========================================================================= */}
      {role === "DRIVER" && (
        <div className="space-y-8">
          {/* Driver KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl glass-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Today's Earnings</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">$142.80</div>
              <span className="text-[10px] text-emerald-400 font-bold">+18% vs Yesterday</span>
            </div>

            <div className="p-5 rounded-3xl glass-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Trips Completed</span>
                <Car className="w-4 h-4 text-[#00D4FF]" />
              </div>
              <div className="text-2xl font-black text-white">8 Rides</div>
              <span className="text-[10px] text-cyan-400 font-bold">100% 5-Star Reviews</span>
            </div>

            <div className="p-5 rounded-3xl glass-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Driver Safety Index</span>
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">98 / 100</div>
              <span className="text-[10px] text-purple-300 font-bold">Zero Speed Violations</span>
            </div>

            <div className="p-5 rounded-3xl glass-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Vehicle Security</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">Audited</div>
              <span className="text-[10px] text-slate-400">Inspection: Aug 2026</span>
            </div>
          </div>

          {/* Active Job or Incoming Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00D4FF]" /> Incoming Ride Requests Queue
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-[#00D4FF] font-bold">
                    {isDriverOnline ? "Live Queue Active" : "Offline"}
                  </span>
                </div>

                {isDriverOnline ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">NEW REQUEST</span>
                        <span className="text-xs font-bold text-white">Passenger: Elena Rostova (★ 4.98)</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-200 mt-1">
                        Times Square 42nd St → Grand Central Terminal
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Est. 2.4 km • Fare: $18.50 • Payment: Auto-Pay</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleAcceptRide(1)}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                      >
                        Accept Ride ($18.50)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    You are currently offline. Toggle status to Online above to receive passenger requests.
                  </div>
                )}
              </div>

              {/* Driver Navigation Map */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Zone Patrol Telemetry</h3>
                <LiveMap height="360px" />
              </div>
            </div>

            {/* Vehicle & Shift Summary */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl glass-card space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#00D4FF]" /> Assigned Vehicle Telemetry
                </h4>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Unit ID:</span>
                    <span className="text-white font-bold">TX-901</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model:</span>
                    <span className="text-slate-200">Toyota Camry Hybrid Security Ed.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plate Number:</span>
                    <span className="text-purple-300 font-mono font-bold">NYC-7842-TX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Onboard QR:</span>
                    <span className="text-emerald-400 font-bold">Active & Verified</span>
                  </div>
                </div>

                <EmergencyButton size="small" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ADMIN VIEW */}
      {/* ========================================================================= */}
      {role === "ADMIN" && (
        <div className="space-y-8">
          {/* Admin KPI Header Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl glass-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Total Registered Users</span>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">{allUsers.length || 1420}</div>
              <span className="text-xs text-purple-300 font-bold mt-1">Passengers & Drivers</span>
            </div>

            <div className="p-6 rounded-3xl glass-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Active Urban Fleet</span>
                <Car className="w-5 h-5 text-[#00D4FF]" />
              </div>
              <div className="text-3xl font-black text-white">{taxis.length || 38} Units</div>
              <span className="text-xs text-cyan-300 font-bold mt-1">Live Telemetry Synchronized</span>
            </div>

            <div className="p-6 rounded-3xl glass-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Open Incident Reports</span>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {incidents.filter((i) => i.status !== "RESOLVED").length || 2}
              </div>
              <span className="text-xs text-red-400 font-bold mt-1">Requires Operations Review</span>
            </div>

            <div className="p-6 rounded-3xl glass-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Platform Security Health</span>
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">99.8%</div>
              <span className="text-xs text-emerald-400 font-bold mt-1">Zero Security Breaches</span>
            </div>
          </div>

          {/* Central Fleet Monitoring Map */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-400 animate-pulse" /> Central Fleet Live GPS Radar
                </h3>
                <p className="text-xs text-slate-400">Real-time GPS coordinates of all urban units and active trips.</p>
              </div>
              <Link
                to="/map"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition-all"
              >
                Fullscreen Tactical Map
              </Link>
            </div>

            <LiveMap taxis={taxis} height="420px" />
          </div>

          {/* Incidents Management Table */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Incident Review & Dispatch Center
              </h3>
              <span className="text-xs text-slate-400">{incidents.length} Total Incidents Logged</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-slate-400 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-3">Incident Code</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Reporter</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-white">{inc.incidentCode}</td>
                      <td className="p-3 font-semibold text-purple-300">{inc.type}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inc.severity === "CRITICAL"
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : inc.severity === "HIGH"
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200">{inc.reporterName || "Anonymous"}</td>
                      <td className="p-3 text-slate-400 truncate max-w-[160px]">{inc.locationAddress || "GPS Pin"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white">
                          {inc.status}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        {inc.status !== "RESOLVED" && (
                          <button
                            onClick={() => handleResolveIncident(inc.id, "RESOLVED")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => alert(`Incident Details:\n\nCode: ${inc.incidentCode}\nDescription: ${inc.description}\nLocation: ${inc.locationAddress}`)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Management Table */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00D4FF]" /> User Accounts & Access Control
              </h3>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="py-1.5 pl-8 pr-3 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-slate-400 uppercase bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Safety Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allUsers
                    .filter((u) => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase()))
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </td>
                        <td className="p-3 font-semibold text-purple-300">{u.role}</td>
                        <td className="p-3 text-slate-400">{u.phone || "Not set"}</td>
                        <td className="p-3 font-bold text-emerald-400">{u.safetyScore || 98} / 100</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === "ACTIVE"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : u.status === "SUSPENDED"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3 flex items-center gap-1.5">
                          {u.status !== "ACTIVE" && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, "ACTIVE")}
                              className="px-2 py-1 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 text-[10px] font-bold"
                            >
                              Activate
                            </button>
                          )}
                          {u.status === "ACTIVE" && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, "SUSPENDED")}
                              className="px-2 py-1 rounded bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/50 text-[10px] font-bold"
                            >
                              Suspend
                            </button>
                          )}
                          {u.status !== "BLOCKED" && (
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, "BLOCKED")}
                              className="px-2 py-1 rounded bg-red-600/30 text-red-300 border border-red-500/40 hover:bg-red-600/50 text-[10px] font-bold"
                            >
                              Block
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Book Ride Modal */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-purple-500/30 shadow-2xl relative">
            <h3 className="text-lg font-extrabold text-white mb-1">Book Smart Taxi Ride</h3>
            <p className="text-xs text-slate-400 mb-6">AI Guardian will monitor your telemetry and route continuously.</p>

            <form onSubmit={handleBookRide} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pickup Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between text-xs">
                <span className="text-slate-400">Estimated Fare:</span>
                <span className="text-emerald-400 font-bold text-sm">$18.50 (Fixed Security Rate)</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {bookingLoading ? "Dispatching..." : "Confirm & Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Generator Modal */}
      <QRGeneratorModal trip={activeTrip} isOpen={qrGenModalOpen} onClose={() => setQrGenModalOpen(false)} />

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={qrScanModalOpen} onClose={() => setQrScanModalOpen(false)} />

      {/* Admin Broadcast Alert Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-red-500/40 shadow-2xl relative">
            <h3 className="text-lg font-extrabold text-white mb-1 flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-400" /> Send System Broadcast Alert
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              This message will be instantly sent to all connected drivers, passengers, and emergency contacts.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="e.g. Severe weather alert: Midtown expressway experiencing route delays. Drive with extreme caution."
                rows={4}
                className="w-full p-3 rounded-xl glass-input text-xs resize-none"
                required
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}