import React, { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  Sparkles,
  Camera,
  CheckCircle2,
  Maximize2,
  X,
  ExternalLink,
  Smartphone,
  Car
} from "lucide-react";
import MobileQRScanner from "../components/qr/MobileQRScanner";
import MobileQRGenerator from "../components/qr/MobileQRGenerator";
import { NativeService } from "../services/native";

export default function QRScanScreen({ onSelectTab }) {
  const [tabMode, setTabMode] = useState("SCAN"); // "SCAN" | "GENERATE"
  const [previewImage, setPreviewImage] = useState(null);

  const photoGuides = [
    {
      id: "door",
      title: "Passenger Door QR Sticker (Cameroun)",
      subtitle: "Scan outside before opening the yellow taxi door",
      image: "/passenger_scan_door_qr.jpg",
      badge: "Pre-Boarding Douala / Yaoundé",
      caption: "Cameroonian passenger in Douala scanning the official laminated SafeRide QR verification sticker on the yellow taxi door window (Ville de Douala N° 9934 / LT 4832 C).",
      demoCode: "SAFERIDE:CM-DLA-9934:LT-4832-C:MINTRANS-REG-VERIFIED",
    },
    {
      id: "dashboard",
      title: "Taxi Dashboard Console (Marché Deïdo)",
      subtitle: "Scan inside driver cabin during transit",
      image: "/taxi_dashboard_qr.jpg",
      badge: "In-Transit Verification",
      caption: "Official SafeRide Cameroon encrypted QR badge mounted on the front dashboard console of a Douala taxi en route past Marché Deïdo.",
      demoCode: "SAFERIDE:CM-DLA-8821:LT-901-CM:AUTH-LIVE-GPS",
    },
  ];

  return (
    <div className="flex-1 p-4 pb-20 overflow-y-auto space-y-4">
      {/* Top Header & Mode Toggle */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[11px] font-black uppercase tracking-wide mb-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Biometric Boarding & Verification Grid</span>
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">
          {tabMode === "SCAN" ? "Scan Taxi Jaune QR Code" : "Generate Security QR Code"}
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
          {tabMode === "SCAN"
            ? "Connects your live webcam to scan the encrypted taxi door sticker or dashboard badge."
            : "Create verified security QR codes for taxis, trip tracking, and emergency passes."}
        </p>
      </div>

      {/* Mode Switcher Pills (Scan with Webcam vs Generate QR) */}
      <div className="flex items-center gap-2 p-1 bg-[#16130A] rounded-2xl border border-yellow-500/20">
        <button
          onClick={() => {
            NativeService.triggerHaptic("light");
            setTabMode("SCAN");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            tabMode === "SCAN"
              ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/20 font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Scan with Webcam</span>
        </button>

        <button
          onClick={() => {
            NativeService.triggerHaptic("light");
            setTabMode("GENERATE");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            tabMode === "GENERATE"
              ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/20 font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Create QR Code</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#141006] border border-yellow-500/25 rounded-3xl p-4 shadow-xl">
        {tabMode === "SCAN" ? (
          <MobileQRScanner onScanSuccess={() => {}} />
        ) : (
          <MobileQRGenerator />
        )}
      </div>

      {/* 2 Real World Photo Guides: Door QR Sticker & Taxi Dashboard Interior Badge */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Smartphone className="w-4 h-4 text-yellow-400" />
            <span>Where to Find the Taxi QR (Cameroun)</span>
          </h3>
          <span className="text-[10px] text-yellow-400/80 font-bold">Douala / Yaoundé</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {photoGuides.map((guide) => (
            <div
              key={guide.id}
              className="overflow-hidden rounded-2xl bg-[#161309] border border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg group"
            >
              {/* Photo Thumbnail */}
              <div className="relative h-44 overflow-hidden bg-black">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Badge Tag */}
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-yellow-500/90 text-black text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md">
                  {guide.badge}
                </span>

                {/* Fullscreen Expand Button */}
                <button
                  onClick={() => setPreviewImage(guide)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/60 text-white hover:bg-yellow-500 hover:text-black transition-colors"
                  title="View full photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-2.5 left-3 right-3">
                  <h4 className="text-xs font-black text-white leading-tight drop-shadow-md">
                    {guide.title}
                  </h4>
                  <p className="text-[10px] text-yellow-300 font-medium line-clamp-1 mt-0.5">
                    {guide.subtitle}
                  </p>
                </div>
              </div>

              {/* Photo details & Quick Scan Simulation */}
              <div className="p-3 space-y-2">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {guide.caption}
                </p>
                <div className="pt-1 flex items-center justify-between border-t border-yellow-500/15 text-[10px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> MinTrans / CUD Certifié
                  </span>
                  <button
                    onClick={() => {
                      NativeService.triggerHaptic("heavy");
                      // Scroll to top and simulate scan result
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-yellow-400 hover:text-yellow-300 font-bold flex items-center gap-1"
                  >
                    <span>Tap to point webcam</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Accreditation Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-yellow-950/40 via-[#1C170A] to-amber-950/40 border border-yellow-500/20 flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-yellow-500/20 text-yellow-400 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xs font-black text-white">256-Bit Cryptographic Anti-Tamper</h4>
          <p className="text-[11px] text-yellow-100/70">
            Encrypted QR codes are verified in real-time against Ministère des Transports du Cameroun (MINT) & Communauté Urbaine de Douala / Yaoundé registries to eradicate unregistered clandestine "clando" taxis.
          </p>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex flex-col justify-center items-center animate-fade-in">
          <div className="relative max-w-lg w-full bg-[#161309] border border-yellow-500/30 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-yellow-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={previewImage.image}
              alt={previewImage.title}
              className="w-full max-h-[60vh] object-contain bg-black"
            />

            <div className="p-4 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] font-black uppercase">
                {previewImage.badge}
              </span>
              <h3 className="text-sm font-black text-white">{previewImage.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{previewImage.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
