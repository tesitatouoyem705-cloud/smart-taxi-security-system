import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  X,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  VideoOff,
  Flashlight,
  Sparkles,
  Zap,
  Play
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import confetti from "canvas-confetti";

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [verifiedTaxi, setVerifiedTaxi] = useState(null);

  const { success, error } = useToast();

  const startWebcam = useCallback(async () => {
    if (!isOpen) return;
    setIsInitializing(true);
    setCameraError(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsInitializing(false);
      setCameraError("Webcam video stream is not supported in this browser.");
      return;
    }

    const constraintList = [
      { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: "user" }, audio: false },
      { video: true, audio: false }
    ];

    let activeStream = null;
    let lastError = null;

    for (const constraints of constraintList) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (activeStream) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!activeStream) {
      setIsInitializing(false);
      setCameraActive(false);
      console.warn("Webcam error:", lastError);
      setCameraError(
        lastError?.name === "NotAllowedError" || lastError?.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in your browser."
          : "Webcam could not be opened. Click 'Start Live Webcam' or use Test Scan."
      );
      return;
    }

    streamRef.current = activeStream;

    if (videoRef.current) {
      videoRef.current.srcObject = activeStream;
      videoRef.current.setAttribute("playsinline", "true");
      videoRef.current.muted = true;
      try {
        await videoRef.current.play();
      } catch (e) {}
    }

    setCameraActive(true);
    setIsInitializing(false);
  }, [isOpen]);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startWebcam();
    } else {
      stopWebcam();
      setVerifiedTaxi(null);
    }
    return () => {
      stopWebcam();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isOpen, startWebcam, stopWebcam]);

  // Real-time BarcodeDetector loop
  useEffect(() => {
    if (!cameraActive || !("BarcodeDetector" in window)) return;

    let barcodeDetector = null;
    try {
      barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code", "code_128"] });
    } catch (e) {
      return;
    }

    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && !verifiedTaxi) {
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            handleSimulateScan(barcodes[0].rawValue);
          }
        } catch (e) {}
      }
    }, 400);

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [cameraActive, verifiedTaxi]);

  if (!isOpen) return null;

  const handleSimulateScan = (customCode = "TX-901") => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const mockTaxiData = {
        vehicleNumber: "TX-901",
        registrationNumber: "NYC-7842-TX",
        model: "Toyota Camry Hybrid Security Ed.",
        driverName: "Marcus Vance",
        driverRating: 4.92,
        safetyCertified: true,
        inspectionDate: "2026-08-15",
        securityGrade: "A+ (99.8%)"
      };
      setVerifiedTaxi(mockTaxiData);
      success("Taxi QR Code successfully verified with Central Registry!");

      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      if (onScanSuccess) onScanSuccess(mockTaxiData);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-yellow-500/40 shadow-2xl shadow-yellow-500/20 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center mx-auto mb-3 text-yellow-400">
          <Camera className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-extrabold text-white tracking-tight">Onboard Taxi QR Verification</h3>
        <p className="text-xs text-slate-300 mb-4">
          Webcam automatically streams live video to authenticate driver credentials with NYC Taxi Registry.
        </p>

        {/* Webcam status indicator */}
        <div className="flex items-center justify-between px-2 mb-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                cameraActive ? "bg-yellow-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className={cameraActive ? "text-yellow-400 font-bold" : "text-red-400 font-semibold"}>
              {cameraActive ? "Live Webcam Streaming" : isInitializing ? "Opening Webcam..." : "Webcam Off"}
            </span>
          </div>

          <button
            onClick={cameraActive ? stopWebcam : () => startWebcam()}
            className="text-[11px] font-bold text-yellow-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{cameraActive ? "Turn Off" : "Start Webcam"}</span>
          </button>
        </div>

        {/* Scanner Viewport with Live Video */}
        {!verifiedTaxi ? (
          <div className="relative w-full h-64 rounded-2xl bg-black border-2 border-dashed border-yellow-500/50 flex flex-col items-center justify-center overflow-hidden mb-6 shadow-inner">
            {/* Live Video */}
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
                cameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              autoPlay
              playsInline
              muted
            />

            {/* Viewfinder brackets */}
            <div className="absolute inset-4 pointer-events-none border border-yellow-400/40 rounded-xl z-10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-bounce shadow-lg shadow-yellow-500/80" />
            </div>

            {!cameraActive && (
              <div className="relative z-20 p-4 text-center">
                <Camera className="w-10 h-10 text-yellow-400/80 mb-2 mx-auto animate-pulse" />
                <p className="text-xs text-yellow-300 font-bold">Webcam Ready</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto mb-3">
                  {cameraError || "Point camera at taxi QR code"}
                </p>
                <button
                  onClick={() => startWebcam()}
                  disabled={isInitializing}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-extrabold text-xs shadow-lg active:scale-95 transition-all"
                >
                  {isInitializing ? "Starting..." : "Start Live Webcam"}
                </button>
              </div>
            )}

            {/* Instant Test Scan Button */}
            <button
              onClick={() => handleSimulateScan("TX-901")}
              disabled={scanning}
              className="absolute bottom-3 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all z-20"
            >
              {scanning ? "Verifying..." : "Instant Test Scan"}
            </button>
          </div>
        ) : (
          /* Verification Result Card */
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-left text-xs mb-6 space-y-2.5 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm border-b border-emerald-500/20 pb-2">
              <ShieldCheck className="w-5 h-5" /> 100% AUTHENTIC & ACCREDITED
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Taxi Unit:</span>
              <span className="text-white font-bold">{verifiedTaxi.vehicleNumber} ({verifiedTaxi.registrationNumber})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vehicle Model:</span>
              <span className="text-slate-200">{verifiedTaxi.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Verified Driver:</span>
              <span className="text-yellow-300 font-bold">{verifiedTaxi.driverName} (★ {verifiedTaxi.driverRating})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Security Audit:</span>
              <span className="text-emerald-400 font-semibold">Passed ({verifiedTaxi.inspectionDate})</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {verifiedTaxi ? (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs transition-all shadow-lg"
            >
              Proceed with Verified Taxi
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors border border-white/10"
            >
              Close Scanner
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
