import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Car,
  User,
  Shield,
  Radio,
  Share2,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Navigation,
  MapPin,
  QrCode,
  Sparkles,
  Award,
  Star,
  Play,
  Pause,
  PhoneCall,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import LiveMap from "../components/LiveMap";
import EmergencyButton from "../components/common/EmergencyButton";
import QRGeneratorModal from "../components/QRGeneratorModal";
import TripChatModal from "../components/TripChatModal";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

export default function LiveTripPage() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const { socket, joinTripRoom, broadcastLocation } = useSocket();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();

  // Trip State
  const [trip, setTrip] = useState({
    id: 1,
    passengerId: 1,
    passengerName: "Elena Rostova",
    driverId: 1,
    driverName: "Jean-Paul Mbida",
    taxiId: 1,
    pickupAddress: "Rond-Point Nlongkak, Yaoundé",
    dropoffAddress: "Carrefour Bastos, Yaoundé",
    startLatitude: 3.8820,
    startLongitude: 11.5210,
    dropoffLatitude: 3.8910,
    dropoffLongitude: 11.5130,
    currentLatitude: 3.8750,
    currentLongitude: 11.5190,
    fare: 2500,
    distanceKm: 3.8,
    durationMin: 14,
    status: "IN_TRANSIT",
    shareToken: "demo-live-share-token-2026"
  });

  const [taxi, setTaxi] = useState({
    vehicleNumber: "TX-901",
    registrationNumber: "NYC-7842-TX",
    model: "Toyota Camry Hybrid Security Ed.",
    color: "Midnight Blue",
    rating: 4.92,
    safetyEquipped: true
  });

  // UI Modals
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Simulated GPS Telemetry Progress
  const [isSimulating, setIsSimulating] = useState(true);
  const [simProgress, setSimProgress] = useState(0.45); // 0 to 1

  // Fetch active trip from backend or use demo trip
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = id ? await api.get(`/trips/${id}`) : await api.get("/trips/active");
        if (res.data?.trip) {
          setTrip(res.data.trip);
          if (res.data.taxi) setTaxi(res.data.taxi);
        }
      } catch (err) {
        console.warn("Using demo trip state:", err.message);
      }
    };
    fetchTrip();
  }, [id]);

  // Join Socket Room for real-time telemetry
  useEffect(() => {
    if (trip?.id) {
      joinTripRoom(trip.id);
    }

    if (!socket) return;

    const handleLocationUpdate = (data) => {
      if (data.tripId === trip?.id) {
        setTrip((prev) => ({
          ...prev,
          currentLatitude: data.latitude,
          currentLongitude: data.longitude
        }));
      }
    };

    const handleStatusUpdate = (data) => {
      if (data.tripId === trip?.id) {
        setTrip((prev) => ({ ...prev, status: data.status }));
        if (data.status === "COMPLETED") {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setRatingModalOpen(true);
        }
      }
    };

    socket.on("trip-location", handleLocationUpdate);
    socket.on("trip:status-change", handleStatusUpdate);

    return () => {
      socket.off("trip-location", handleLocationUpdate);
      socket.off("trip:status-change", handleStatusUpdate);
    };
  }, [socket, trip?.id]);

  // Live GPS simulation loop
  useEffect(() => {
    if (!isSimulating || trip.status !== "IN_TRANSIT") return;

    const interval = setInterval(() => {
      setSimProgress((prev) => {
        const next = prev + 0.02;
        if (next >= 1) {
          // Trip reached destination
          setIsSimulating(false);
          setTrip((t) => ({
            ...t,
            status: "COMPLETED",
            currentLatitude: t.dropoffLatitude,
            currentLongitude: t.dropoffLongitude
          }));
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          setRatingModalOpen(true);
          return 1;
        }

        // Interpolate coordinates
        const startLat = trip.startLatitude || 3.8820;
        const startLng = trip.startLongitude || 11.5210;
        const endLat = trip.dropoffLatitude || 3.8910;
        const endLng = trip.dropoffLongitude || 11.5130;

        const newLat = startLat + (endLat - startLat) * next;
        const newLng = startLng + (endLng - startLng) * next;

        setTrip((t) => ({
          ...t,
          currentLatitude: parseFloat(newLat.toFixed(6)),
          currentLongitude: parseFloat(newLng.toFixed(6))
        }));

        broadcastLocation(trip.id, newLat, newLng);
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, trip.status]);

  // Handle Complete Trip action (for Driver)
  const handleCompleteTrip = async () => {
    try {
      await api.put(`/trips/${trip.id}/end`);
      setTrip((t) => ({ ...t, status: "COMPLETED" }));
      confetti({ particleCount: 120, spread: 80 });
      success("Trip completed successfully! Payment processed.");
      setRatingModalOpen(true);
    } catch (err) {
      toastError("Failed to complete trip.");
    }
  };

  // Submit Driver Rating
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/trips/${trip.id}/rate`, {
        rating: selectedRating,
        review: reviewText
      });
      success("Thank you for submitting your driver safety rating!");
      setRatingModalOpen(false);
      navigate("/dashboard");
    } catch (err) {
      setRatingModalOpen(false);
      navigate("/dashboard");
    }
  };

  // Progress Steps array
  const steps = [
    { key: "REQUESTED", label: "Requested" },
    { key: "ACCEPTED", label: "Driver Dispatched" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "COMPLETED", label: "Arrived Safely" }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === trip.status);

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-6">
      {/* Top Breadcrumb & Live Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">Live Trip #{trip.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Live Journey Guardian</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {trip.status}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* GPS Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isSimulating
                ? "bg-purple-600/30 text-purple-300 border-purple-500/40 hover:bg-purple-600/40"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
            }`}
            title="Toggle simulated GPS car movement"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? "Simulating GPS" : "Paused Sim"}</span>
          </button>

          <button
            onClick={() => setQrModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-[#00D4FF]" /> Share Trip
          </button>

          <button
            onClick={() => setChatModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <MessageSquare className="w-4 h-4" /> In-Trip Chat
          </button>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="p-4 sm:p-6 rounded-3xl glass-card mb-6">
        <div className="flex items-center justify-between relative">
          {/* Connecting Track Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-white/10 -z-0" />
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500 -z-0"
            style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                    isCompleted
                      ? "bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-purple-500/30"
                      : "bg-[#16162e] border border-white/15 text-slate-400"
                  } ${isCurrent ? "ring-4 ring-purple-500/30 scale-110" : ""}`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[11px] mt-2 font-semibold tracking-wide ${isCompleted ? "text-white" : "text-slate-500"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Map & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Map */}
        <div className="lg:col-span-2 space-y-6">
          <LiveMap activeTrip={trip} height="480px" />

          {/* Route Details Card */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Active Secure Corridor</span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {trip.pickupAddress} → {trip.dropoffAddress}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Fixed Fare</span>
                <div className="text-xl font-black text-emerald-400">${trip.fare || "18.50"}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400">ETA Countdown</span>
                <div className="text-base font-black text-white mt-1">
                  {trip.status === "COMPLETED" ? "0 Min (Arrived)" : `~ ${Math.max(1, Math.round((1 - simProgress) * (trip.durationMin || 9)))} Mins`}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400">Distance Remaining</span>
                <div className="text-base font-black text-[#00D4FF] mt-1">
                  {trip.status === "COMPLETED" ? "0.0 km" : `${Math.max(0.1, ((1 - simProgress) * (trip.distanceKm || 2.4)).toFixed(1))} km`}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-slate-400">AI Telemetry</span>
                <div className="text-base font-black text-emerald-400 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 99.8% Safe
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Driver Details & Emergency Trigger */}
        <div className="space-y-6">
          {/* Prominent Emergency SOS Button */}
          <EmergencyButton tripId={trip.id} size="large" />

          {/* Driver Credentials Card */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" /> Security Driver Dossier
              </h4>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ID Verified
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt="Driver Photo"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40 shadow-md"
              />
              <div>
                <h3 className="text-base font-extrabold text-white">{trip.driverName || "Marcus Vance"}</h3>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{taxi.rating || "4.92"} (1,420 Completed Rides)</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Certified Urban Security Escort</p>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Vehicle:</span>
                <span className="text-white font-bold">{taxi.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License Plate:</span>
                <span className="text-purple-300 font-mono font-bold">{taxi.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Unit ID:</span>
                <span className="text-[#00D4FF] font-bold">{taxi.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Telemetry Hardware:</span>
                <span className="text-emerald-400 font-semibold">Active PostGIS GPS</span>
              </div>
            </div>

            {/* Driver Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:5558765432"
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> Call Driver
              </a>

              <button
                onClick={() => setChatModalOpen(true)}
                className="py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Open Chat
              </button>
            </div>

            {/* Complete trip button if driver */}
            {role === "DRIVER" && trip.status !== "COMPLETED" && (
              <button
                onClick={handleCompleteTrip}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all mt-2"
              >
                End & Complete Trip
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share QR Modal */}
      <QRGeneratorModal trip={trip} isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />

      {/* In-Trip Chat Modal */}
      <TripChatModal trip={trip} isOpen={chatModalOpen} onClose={() => setChatModalOpen(false)} />

      {/* Rate Driver Modal */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-emerald-500/30 shadow-2xl text-center relative">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-white">Ride Completed Safely!</h3>
            <p className="text-xs text-slate-300 mb-6">
              Thank you for riding with SafeRide AI. How was your safety experience with {trip.driverName}?
            </p>

            {/* Star Picker */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= selectedRating ? "fill-amber-400 text-amber-400" : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Leave feedback on driving safety, route compliance, or vehicle cleanliness..."
                rows={3}
                className="w-full p-3 rounded-xl glass-input text-xs resize-none"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-purple-600 to-cyan-500 hover:brightness-110 text-white font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-purple-500/25 transition-all"
              >
                Submit Safety Rating
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
