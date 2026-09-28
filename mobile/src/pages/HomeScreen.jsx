import React, { useState, useEffect } from "react";
import {
  Shield,
  Navigation,
  QrCode,
  AlertOctagon,
  Radio,
  Car,
  ChevronRight,
  PhoneCall,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Bot,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEmergency } from "../context/EmergencyContext";
import PanicButton from "../components/sos/PanicButton";
import api from "../services/api";

export default function HomeScreen({ onSelectTab, onOpenSOSModal, onOpenRoleDrawer }) {
  const { user, role } = useAuth();
  const { isEmergencyActive } = useEmergency();
  const [stats, setStats] = useState({
    activeTaxis: 38,
    safetyScore: 99.8,
    tripsCompleted: 18940,
  });

  const demoNearbyTaxis = [
    { id: 1, number: "LT-9934", model: "Toyota Corolla Jaune Douala", dist: "0.2 km (Akwa)", eta: "2 min", rating: 4.95 },
    { id: 2, number: "LT-4832", model: "Toyota Carina E Deïdo", dist: "0.5 km (Bonanjo)", eta: "4 min", rating: 4.98 },
    { id: 3, number: "CE-1420", model: "Toyota Yaris Bastos", dist: "0.9 km (Yaoundé)", eta: "7 min", rating: 4.92 },
  ];

  return (
    <div className="flex-1 p-4 pb-20 space-y-4 overflow-y-auto">
      {/* 1. Top Radar Security Status Card (Yellow Taxi Cyber Gradient) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241C0A] via-[#161206] to-[#0D0B05] p-5 border border-yellow-500/35 shadow-2xl">
        {/* Yellow Glow orb */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-yellow-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-yellow-300">
              RADAR TAXIS DU CAMEROUN ACTIF
            </span>
          </div>

          <button
            onClick={onOpenRoleDrawer}
            className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[10px] font-bold text-yellow-200 hover:text-white flex items-center gap-1"
          >
            <span>Role: {role}</span>
            <ChevronRight className="w-3 h-3 text-yellow-400" />
          </button>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight leading-snug mb-1">
          Bienvenue, <span className="text-gradient-primary">{user?.name?.split(" ")[0] || "Passager"}</span>
        </h2>
        <p className="text-xs text-yellow-100/80 mb-4">
          Protection des trajets urbains à Douala & Yaoundé par télémétrie GPS et IA de sécurité.
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-yellow-500/20">
          <div className="bg-black/40 p-2 rounded-2xl border border-yellow-500/10 text-center">
            <span className="text-xs font-black text-emerald-400">99.9%</span>
            <p className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">Taux Sécurité</p>
          </div>
          <div className="bg-black/40 p-2 rounded-2xl border border-yellow-500/10 text-center">
            <span className="text-xs font-black text-yellow-400">38 Taxis</span>
            <p className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">Flotte Active</p>
          </div>
          <div className="bg-black/40 p-2 rounded-2xl border border-yellow-500/10 text-center">
            <span className="text-xs font-black text-amber-300">0.02s</span>
            <p className="text-[9px] text-slate-400 uppercase font-semibold mt-0.5">Latence SOS</p>
          </div>
        </div>
      </div>

      {/* 2. Active Trip Quick Banner (Jump directly to live tracking) */}
      <div
        onClick={() => onSelectTab("trip")}
        className="cursor-pointer group relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/60 via-yellow-950/40 to-black p-4 border border-yellow-500/40 shadow-xl backdrop-blur-xl active:scale-[0.98] transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-yellow-500/20 text-yellow-400 animate-pulse">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-white">Trajet en Cours (LT-9934)</span>
              <p className="text-[10px] text-yellow-300 font-medium">Akwa Boulevard ➔ Rond-Point Deïdo (Douala)</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-[10px] font-black text-yellow-300 uppercase">
            GPS DIRECT
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
          <span>Vitesse: 38 km/h • ETA: 5 mins</span>
          <span className="text-yellow-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Afficher HUD <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 3. Big Tactile SOS Panic Trigger */}
      <div className="bg-[#160A0A] border border-red-500/30 rounded-3xl p-4 shadow-xl text-center">
        <PanicButton size="large" onOpenModal={onOpenSOSModal} />
      </div>

      {/* 4. Quick Action Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* QR Scan Action */}
        <button
          onClick={() => onSelectTab("qr")}
          className="p-4 rounded-3xl bg-[#16130A] border border-yellow-500/25 hover:border-yellow-500/50 text-left active:scale-95 transition-all shadow-lg flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center mb-3">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">Scanner QR Taxi</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Vérifier le chauffeur avant d'embarquer</p>
          </div>
        </button>

        {/* AI Guardian Action */}
        <button
          onClick={() => onSelectTab("ai")}
          className="p-4 rounded-3xl bg-[#18140B] border border-amber-500/25 hover:border-amber-500/50 text-left active:scale-95 transition-all shadow-lg flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">IA Gardienne SafeRide</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Conseiller sécurité routière Gemini</p>
          </div>
        </button>
      </div>

      {/* Real World Taxi Verification Showcase (Door QR & Dashboard Interior) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Vérification Taxi au Cameroun</span>
          </h3>
          <button
            onClick={() => onSelectTab("qr")}
            className="text-[10px] text-yellow-400 font-bold hover:underline"
          >
            Ouvrir Scanner &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Door Scan */}
          <div
            onClick={() => onSelectTab("qr")}
            className="cursor-pointer group relative overflow-hidden rounded-2xl bg-[#141108] border border-yellow-500/20 hover:border-yellow-500/45 transition-all"
          >
            <div className="h-28 overflow-hidden relative">
              <img
                src="/passenger_scan_door_qr.jpg"
                alt="Passagère camerounaise scannant le QR code sur la portière du taxi"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-yellow-500 text-black text-[9px] font-black uppercase">
                Étape 1: Portière
              </span>
            </div>
            <div className="p-2.5">
              <h4 className="text-[11px] font-bold text-white group-hover:text-yellow-300 transition-colors">
                Portière Taxi (Douala)
              </h4>
              <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">
                Scanner le badge QR sur la vitre avant de monter à bord.
              </p>
            </div>
          </div>

          {/* Card 2: Dashboard Interior */}
          <div
            onClick={() => onSelectTab("qr")}
            className="cursor-pointer group relative overflow-hidden rounded-2xl bg-[#141108] border border-yellow-500/20 hover:border-yellow-500/45 transition-all"
          >
            <div className="h-28 overflow-hidden relative">
              <img
                src="/taxi_dashboard_qr.jpg"
                alt="Badge de sécurité sur le tableau de bord du taxi camerounais"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase">
                Étape 2: Habitacle
              </span>
            </div>
            <div className="p-2.5">
              <h4 className="text-[11px] font-bold text-white group-hover:text-yellow-300 transition-colors">
                Tableau de Bord
              </h4>
              <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-2">
                Badge officiel SafeRide Cameroun validé par le Ministère des Transports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Nearest Verified Security Taxis */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
            <Car className="w-4 h-4 text-yellow-400" />
            <span>Nearest Verified Taxis</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">GPS Telemetry Synced</span>
        </div>

        <div className="space-y-2">
          {demoNearbyTaxis.map((t) => (
            <div
              key={t.id}
              onClick={() => onSelectTab("trip")}
              className="cursor-pointer p-3 rounded-2xl bg-[#131109] hover:bg-[#1C180E] border border-yellow-500/15 flex items-center justify-between active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 border border-white/10 flex items-center justify-center text-black font-black text-xs">
                  {t.number.split("-")[1]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{t.number}</span>
                    <span className="text-[10px] text-yellow-400 font-extrabold">★ {t.rating}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{t.model}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-yellow-400">{t.eta}</span>
                <p className="text-[10px] text-slate-400">{t.dist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Emergency Hotline Quick Dialers (Cameroun: 117 Police, 118 Pompiers, 1500 Gendarmerie) */}
      <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/20 space-y-2">
        <span className="text-[10px] font-black text-red-300 uppercase tracking-wider flex items-center gap-1">
          <PhoneCall className="w-3 h-3 text-red-400" />
          <span>Numéros d'Urgence Cameroun</span>
        </span>
        <div className="grid grid-cols-3 gap-2">
          <a
            href="tel:117"
            className="p-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-center active:scale-95 transition-all"
          >
            <span className="text-xs font-black text-red-200 block">117</span>
            <span className="text-[9px] text-red-300/80">Police Secours</span>
          </a>
          <a
            href="tel:118"
            className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 text-center active:scale-95 transition-all"
          >
            <span className="text-xs font-black text-amber-200 block">118</span>
            <span className="text-[9px] text-amber-300/80">Sapeurs Pompiers</span>
          </a>
          <a
            href="tel:1500"
            className="p-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-center active:scale-95 transition-all"
          >
            <span className="text-xs font-black text-yellow-300 block">1500</span>
            <span className="text-[9px] text-slate-400">Gendarmerie SOS</span>
          </a>
        </div>
      </div>
    </div>
  );
}
