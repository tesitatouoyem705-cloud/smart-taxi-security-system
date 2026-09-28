import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Share2, ShieldCheck, Lock, ExternalLink } from "lucide-react";
import { useToast } from "../context/ToastContext";

export default function QRGeneratorModal({ trip, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  if (!isOpen || !trip) return null;

  const publicUrl = `${window.location.origin}/trip/shared/${trip.shareToken || "demo-token"}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    success("Encrypted live trip link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-purple-500/30 shadow-2xl shadow-purple-500/20 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto mb-3 text-purple-400">
          <Share2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-extrabold text-white tracking-tight">Share Encrypted Live Trip</h3>
        <p className="text-xs text-slate-400 mb-6">
          Anyone with this QR code or link can track your live GPS telemetry, driver credentials, and safety status.
        </p>

        {/* QR Code Container */}
        <div className="p-5 rounded-2xl bg-white mx-auto inline-block shadow-xl mb-6">
          <QRCodeSVG
            value={publicUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Trip Info Pill */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left text-xs mb-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Assigned Driver:</span>
            <span className="text-white font-semibold">{trip.driverName || "Marcus Vance"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Route:</span>
            <span className="text-[#00D4FF] font-medium truncate max-w-[200px]">{trip.pickupAddress} → {trip.dropoffAddress}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Security Encryption:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Telemetry
            </span>
          </div>
        </div>

        {/* Copy Link Button */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Link Copied!" : "Copy Share Link"}</span>
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center justify-center"
            title="Preview Public Tracking"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
