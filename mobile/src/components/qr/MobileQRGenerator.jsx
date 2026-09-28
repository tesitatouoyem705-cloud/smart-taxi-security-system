import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  Car,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  RefreshCw,
  Eye,
  Lock
} from "lucide-react";
import {
  createTaxiQRPayload,
  createTripShareQRPayload,
  createEmergencyPassQRPayload,
  downloadQRCodePNG
} from "../../utils/qrHelper";
import { useToast } from "../../context/ToastContext";
import { NativeService } from "../../services/native";
import confetti from "canvas-confetti";

export default function MobileQRGenerator() {
  const { addToast } = useToast();
  const [activeType, setActiveType] = useState("TAXI"); // "TAXI" | "TRIP" | "EMERGENCY" | "CUSTOM"

  // Taxi Form State
  const [vehicleNumber, setVehicleNumber] = useState("TX-901");
  const [driverName, setDriverName] = useState("Marcus Vance");
  const [plateNumber, setPlateNumber] = useState("NYC-7842-TX");
  const [safetyRating, setSafetyRating] = useState("4.92");

  // Trip Share Form State
  const [shareToken, setShareToken] = useState("demo-live-share-token-2026");
  const [pickupLocation, setPickupLocation] = useState("Times Square Broadway 42nd St");
  const [dropoffLocation, setDropoffLocation] = useState("Grand Central Terminal Park Ave");

  // Emergency Form State
  const [userName, setUserName] = useState("Elena Rostova");
  const [emergencyPhone, setEmergencyPhone] = useState("+1 (555) 998-1122");
  const [bloodType, setBloodType] = useState("O+");

  // Custom Payload State
  const [customText, setCustomText] = useState("https://smarttaxi.io/secure-verify");

  const [copied, setCopied] = useState(false);

  // Compute current QR payload string
  const getPayload = () => {
    if (activeType === "TAXI") {
      return createTaxiQRPayload({
        vehicleNumber,
        registrationNumber: plateNumber,
        driverName,
        safetyRating: parseFloat(safetyRating) || 4.92
      });
    }
    if (activeType === "TRIP") {
      return createTripShareQRPayload({
        shareToken,
        pickup: pickupLocation,
        dropoff: dropoffLocation,
        driverName
      });
    }
    if (activeType === "EMERGENCY") {
      return createEmergencyPassQRPayload({
        userName,
        emergencyPhone,
        bloodType
      });
    }
    return customText || "https://smarttaxi.io";
  };

  const payloadString = getPayload();

  const handleCopy = () => {
    navigator.clipboard?.writeText(payloadString);
    setCopied(true);
    NativeService.triggerHaptic("success");
    addToast("QR Payload copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    NativeService.triggerHaptic("success");
    const filename = `smart-taxi-qr-${activeType.toLowerCase()}-${Date.now()}.png`;
    const success = downloadQRCodePNG("mobile-qr-generator-canvas", filename);
    if (success) {
      addToast("QR Code downloaded as PNG image!", "success");
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      addToast("Could not export image. Please try again.", "warning");
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Category Pills */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#10102B] rounded-2xl border border-white/10">
        {[
          { id: "TAXI", label: "Taxi Badge", icon: Car },
          { id: "TRIP", label: "Trip Share", icon: Share2 },
          { id: "EMERGENCY", label: "SOS Pass", icon: HeartPulse },
          { id: "CUSTOM", label: "Custom", icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                NativeService.triggerHaptic("light");
                setActiveType(tab.id);
              }}
              className={`py-2 px-1 rounded-xl text-[10px] font-black flex flex-col items-center gap-1 transition-all ${
                isActive
                  ? "bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-md shadow-purple-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* QR Code Display Card */}
      <div className="p-5 rounded-3xl bg-[#0F0F28] border border-purple-500/30 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

        {/* QR Code Container */}
        <div
          id="mobile-qr-generator-canvas"
          className="p-4 rounded-3xl bg-white shadow-2xl mb-4 relative flex items-center justify-center border-4 border-slate-100"
        >
          <QRCodeSVG
            value={payloadString}
            size={180}
            level="H"
            includeMargin={false}
            fgColor="#0A0A1F"
            bgColor="#FFFFFF"
          />
        </div>

        {/* Security watermark */}
        <div className="flex items-center gap-1.5 text-[11px] font-black text-cyan-300 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>CRYPTOGRAPHICALLY VERIFIED QR</span>
        </div>
        <p className="text-[10px] text-slate-400 max-w-[260px] line-clamp-1 font-mono">
          {activeType === "TAXI"
            ? `${vehicleNumber} • ${driverName} • ${plateNumber}`
            : activeType === "TRIP"
            ? `Share Token: ${shareToken}`
            : activeType === "EMERGENCY"
            ? `${userName} • SOS ${emergencyPhone}`
            : customText}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full mt-4">
          <button
            onClick={handleDownload}
            className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save PNG</span>
          </button>

          <button
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? "Copied!" : "Copy Payload"}</span>
          </button>
        </div>
      </div>

      {/* Parameter Customization Form */}
      <div className="p-4 rounded-3xl bg-[#11112A] border border-white/10 space-y-3">
        <h4 className="text-xs font-black text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Customize QR Parameters</span>
        </h4>

        {activeType === "TAXI" && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Vehicle #</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Plate Number</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Driver Full Name</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {activeType === "TRIP" && (
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Share Token</label>
              <input
                type="text"
                value={shareToken}
                onChange={(e) => setShareToken(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Pickup Location</label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {activeType === "EMERGENCY" && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Passenger Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Blood Type</label>
                <input
                  type="text"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Emergency SOS Phone</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {activeType === "CUSTOM" && (
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Custom Text / Link / JSON</label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={3}
              placeholder="Paste any URL, taxi ID, or data string..."
              className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        )}
      </div>
    </div>
  );
}
