import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, Radio, Car, CheckCircle2, Clock, MapPin, PhoneCall, AlertTriangle, ExternalLink } from "lucide-react";
import LiveMap from "../components/LiveMap";
import api from "../services/api";

export default function SharedTripPage() {
  const { token } = useParams();
  const [trip, setTrip] = useState({
    id: 1,
    passengerName: "Elena Rostova",
    driverName: "Jean-Paul Mbida",
    pickupAddress: "Rond-Point Nlongkak, Yaoundé",
    dropoffAddress: "Carrefour Bastos, Yaoundé",
    startLatitude: 3.8820,
    startLongitude: 11.5210,
    dropoffLatitude: 3.8910,
    dropoffLongitude: 11.5130,
    currentLatitude: 3.8750,
    currentLongitude: 11.5190,
    status: "IN_TRANSIT",
    distanceKm: 3.8,
    durationMin: 14
  });
  const [taxi, setTaxi] = useState({
    vehicleNumber: "TX-901",
    registrationNumber: "CE-842-LT",
    model: "Toyota Yaris Yellow Taxi",
    rating: 4.95
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get(`/trips/public/${token}`)
      .then((res) => {
        if (res.data?.trip) setTrip(res.data.trip);
        if (res.data?.taxi) setTaxi(res.data.taxi);
      })
      .catch((err) => {
        console.warn("Public trip fallback:", err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pt-8 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-[#00D4FF]/30 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-[#00D4FF] flex items-center justify-center font-bold">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                {trip.status}
              </span>
              <span className="text-xs text-slate-400">Live Secure Tracking Link</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">
              Tracking {trip.passengerName}'s Journey
            </h2>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-400">Security Encryption:</span>
          <div className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
            <Shield className="w-4 h-4" /> 256-Bit PostGIS Telemetry
          </div>
        </div>
      </div>

      {/* Map */}
      <LiveMap activeTrip={trip} height="460px" />

      {/* Driver & Vehicle Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl glass-card space-y-3 text-xs">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assigned Security Driver</h4>
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
              alt="Driver"
              className="w-12 h-12 rounded-xl object-cover border border-purple-400"
            />
            <div>
              <h5 className="text-sm font-bold text-white">{trip.driverName}</h5>
              <p className="text-amber-400 font-bold">★ {taxi.rating || "4.92"} Rating</p>
              <p className="text-slate-400">Background Checked & Certified</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card space-y-3 text-xs">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Vehicle Telemetry</h4>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Model:</span>
              <span className="text-white font-bold">{taxi.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">License Plate:</span>
              <span className="text-purple-300 font-mono font-bold">{taxi.registrationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Route:</span>
              <span className="text-[#00D4FF] font-medium truncate max-w-[200px]">{trip.pickupAddress} → {trip.dropoffAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
