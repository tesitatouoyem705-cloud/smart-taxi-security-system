import React, { useState } from "react";
import { AlertOctagon, Radio, ShieldAlert, X, PhoneCall } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { useToast } from "../../context/ToastContext";

export default function EmergencyButton({ tripId, size = "large" }) {
  const { isEmergencyActive, triggerSOS, cancelEmergency } = useEmergency();
  const { emergency: toastEmergency, info } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const handleTriggerSOS = () => {
    triggerSOS({ tripId, source: "Live Trip SOS Button" });
    setModalOpen(false);
    toastEmergency("Emergency SOS has been broadcasted! Police & emergency contacts notified with your live GPS.");
  };

  if (isEmergencyActive) {
    return (
      <button
        onClick={cancelEmergency}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-3 shadow-2xl shadow-red-500/60 animate-pulse border border-red-300"
      >
        <AlertOctagon className="w-6 h-6 animate-spin" />
        <span>EMERGENCY SOS BROADCASTING (CLICK TO CANCEL)</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black tracking-wider uppercase flex items-center justify-center gap-3 shadow-xl shadow-red-600/40 hover:shadow-red-600/70 active:scale-98 transition-all border border-red-400/40 group ${
          size === "large" ? "text-base py-4" : "text-xs py-2.5"
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        <span>EMERGENCY SOS DISTRESS SIGNAL</span>
      </button>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-red-500/40 shadow-2xl shadow-red-500/20 text-center relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4 text-red-400">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
            </div>

            <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">Trigger Emergency SOS?</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              This will immediately broadcast your <strong className="text-red-400">live GPS coordinates</strong>, vehicle telemetry, and distress audio alert to Central Security dispatch, local emergency services, and your verified contacts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm transition-colors border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerSOS}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" /> CONFIRM SOS NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
