import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  Flashlight,
  FlashlightOff,
  ShieldCheck,
  CheckCircle2,
  Car,
  Sparkles,
  AlertCircle,
  Camera,
  RefreshCw,
  VideoOff,
  Radio,
  Zap,
  Check,
  Play,
  Settings
} from "lucide-react";
import { NativeService } from "../../services/native";
import { SirenAudio } from "../../services/audio";
import { useToast } from "../../context/ToastContext";
import confetti from "canvas-confetti";

export default function MobileQRScanner({ onScanSuccess }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [verifiedTaxi, setVerifiedTaxi] = useState(null);
  const [manualCode, setManualCode] = useState("");

  const { addToast } = useToast();

  // Enumerate all connected webcam video devices
  const loadVideoDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }
    } catch (e) {
      console.warn("Could not enumerate devices:", e);
    }
  };

  // Robust multi-fallback Webcam starter
  const startWebcam = useCallback(async (deviceIdToUse = selectedDeviceId) => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing stream if active
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsInitializing(false);
      setCameraError("Camera/Webcam access is not supported by this browser environment.");
      return;
    }

    // Constraint strategies: try specific device -> ideal environment -> simple video: true
    const constraintList = [];

    if (deviceIdToUse) {
      constraintList.push({
        video: { deviceId: { exact: deviceIdToUse }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    }

    constraintList.push({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });

    constraintList.push({
      video: { facingMode: "user" },
      audio: false,
    });

    constraintList.push({
      video: true,
      audio: false,
    });

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
      console.warn("Webcam start failed:", lastError);
      setCameraError(
        lastError?.name === "NotAllowedError" || lastError?.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera permissions in your browser URL bar."
          : "Webcam could not be opened. Click 'Open Webcam' or test with simulated scan below."
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
      } catch (playErr) {
        console.warn("Video play error:", playErr);
      }
    }

    setCameraActive(true);
    setIsInitializing(false);
    NativeService.triggerHaptic("success");
    addToast("Webcam connected! Live video stream active.", "success");
    loadVideoDevices();
  }, [selectedDeviceId, addToast]);

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

  // Auto-attempt to open webcam on mount
  useEffect(() => {
    startWebcam();
    loadVideoDevices();
    return () => {
      stopWebcam();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  // Continuous Barcode & QR Code detection loop
  useEffect(() => {
    if (!cameraActive) return;

    let barcodeDetector = null;
    if ("BarcodeDetector" in window) {
      try {
        barcodeDetector = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "data_matrix"] });
      } catch (e) {}
    }

    scanIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && !verifiedTaxi) {
        // Method A: Native BarcodeDetector API
        if (barcodeDetector) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              handleDetectedCode(barcodes[0].rawValue);
              return;
            }
          } catch (e) {}
        }
      }
    }, 400);

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [cameraActive, verifiedTaxi]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.getCapabilities && track.getCapabilities().torch) {
      try {
        const next = !torchOn;
        await track.applyConstraints({ advanced: [{ torch: next }] });
        setTorchOn(next);
        NativeService.triggerHaptic("light");
      } catch (e) {}
    } else {
      setTorchOn((prev) => !prev);
      NativeService.triggerHaptic("light");
    }
  };

  // Switch to specific camera device
  const handleDeviceChange = (deviceId) => {
    setSelectedDeviceId(deviceId);
    startWebcam(deviceId);
  };

  // Process Scanned QR code
  const handleDetectedCode = (codeString) => {
    if (scanning || verifiedTaxi) return;
    setScanning(true);
    NativeService.triggerHaptic("heavy");
    SirenAudio.playBeep(1200, 0.15);

    let parsedData = null;
    try {
      parsedData = JSON.parse(codeString);
    } catch (e) {}

    const isTaxi902 = codeString.includes("902") || parsedData?.vehicleNumber === "TX-902";

    const taxiResult = {
      code: codeString,
      vehicleNumber: parsedData?.vehicleNumber || (isTaxi902 ? "TX-902" : "TX-901"),
      plate: parsedData?.registrationNumber || (isTaxi902 ? "NYC-4319-TX" : "NYC-7842-TX"),
      driverName: parsedData?.driverName || (isTaxi902 ? "Sophia Chen" : "Marcus Vance"),
      rating: parsedData?.safetyRating || (isTaxi902 ? 4.96 : 4.92),
      model: isTaxi902 ? "Tesla Model Y Security Edition" : "Toyota Camry Hybrid 2024",
      safetyInspected: "Today, 08:30 AM",
      securityGrade: "A+ (99.8%)",
    };

    setTimeout(() => {
      setScanning(false);
      setVerifiedTaxi(taxiResult);
      NativeService.triggerHaptic("success");
      addToast(`QR Verified: ${taxiResult.vehicleNumber} (${taxiResult.driverName}) Authorized!`, "success");

      try {
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      if (onScanSuccess) onScanSuccess(taxiResult);
    }, 600);
  };

  const handleSimulatedScan = (sampleCode = "QR_TAXI_901_SECURE_AUTH") => {
    handleDetectedCode(sampleCode);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDetectedCode(manualCode.trim());
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. Live Webcam Status Bar & Controls */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                cameraActive ? "bg-yellow-400" : "bg-red-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                cameraActive ? "bg-yellow-400" : "bg-red-500"
              }`}
            />
          </span>
          <div>
            <span className="text-xs font-black uppercase tracking-wide text-white block">
              {cameraActive ? "Webcam Streaming" : isInitializing ? "Opening Webcam..." : "Webcam Off"}
            </span>
            <span className="text-[9px] text-yellow-300/80 font-bold">
              {cameraActive ? "Auto-detecting QR codes" : "Click Open Webcam"}
            </span>
          </div>
        </div>

        {/* Action Toggle Button */}
        <div className="flex items-center gap-1.5">
          {cameraActive ? (
            <button
              onClick={stopWebcam}
              className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all"
            >
              <VideoOff className="w-3 h-3" />
              <span>Close</span>
            </button>
          ) : (
            <button
              onClick={() => startWebcam()}
              disabled={isInitializing}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 text-black font-black text-xs flex items-center gap-1 shadow-lg shadow-yellow-500/25 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isInitializing ? "Opening..." : "Open Webcam"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Camera Device Selector (if multiple cameras exist) */}
      {videoDevices.length > 1 && (
        <div className="w-full mb-3 px-1">
          <select
            value={selectedDeviceId}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="w-full py-1.5 px-3 rounded-xl bg-white/5 border border-yellow-500/20 text-[11px] text-yellow-200 focus:outline-none focus:border-yellow-400"
          >
            {videoDevices.map((d, index) => (
              <option key={d.deviceId || index} value={d.deviceId} className="bg-[#121008] text-white">
                📹 {d.label || `Camera Device ${index + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. Main Live Video Viewport Container */}
      <div className="relative w-full aspect-square max-w-[340px] rounded-[32px] overflow-hidden bg-black border-2 border-yellow-500/50 shadow-2xl flex items-center justify-center mb-4">
        {/* Live Video Element */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          autoPlay
          playsInline
          muted
        />

        {/* When Webcam is Off / Not Started */}
        {!cameraActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#241C0A] via-[#141108] to-[#0A0904] flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center mb-3 text-yellow-400">
              <Camera className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-white mb-1">Webcam Scanner</h4>
            <p className="text-[11px] text-yellow-100/80 max-w-[220px] mb-4 leading-relaxed">
              {cameraError || "Tap below to connect your camera feed and scan taxi QR codes."}
            </p>
            <button
              onClick={() => startWebcam()}
              disabled={isInitializing}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 hover:brightness-110 text-black font-black text-xs flex items-center gap-2 shadow-xl shadow-yellow-500/30 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4 text-black" />
              <span>{isInitializing ? "Starting Webcam..." : "START LIVE WEBCAM"}</span>
            </button>
          </div>
        )}

        {/* High-Tech Yellow Cyber Viewfinder Overlays */}
        <div className="absolute inset-6 pointer-events-none z-20">
          {/* Top-left */}
          <div className="absolute top-0 left-0 w-9 h-9 border-t-4 border-l-4 border-yellow-400 rounded-tl-2xl shadow-[0_0_15px_#FBBF24]" />
          {/* Top-right */}
          <div className="absolute top-0 right-0 w-9 h-9 border-t-4 border-r-4 border-yellow-400 rounded-tr-2xl shadow-[0_0_15px_#FBBF24]" />
          {/* Bottom-left */}
          <div className="absolute bottom-0 left-0 w-9 h-9 border-b-4 border-l-4 border-yellow-400 rounded-bl-2xl shadow-[0_0_15px_#FBBF24]" />
          {/* Bottom-right */}
          <div className="absolute bottom-0 right-0 w-9 h-9 border-b-4 border-r-4 border-yellow-400 rounded-br-2xl shadow-[0_0_15px_#FBBF24]" />

          {/* Animated Laser Scanning Line */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_25px_#FBBF24] animate-bounce top-1/2 -translate-y-1/2" />
        </div>

        {/* Torch Button Overlay */}
        {cameraActive && (
          <button
            onClick={toggleTorch}
            className="absolute bottom-3 right-3 z-30 p-2.5 rounded-2xl bg-black/70 border border-yellow-500/30 text-white backdrop-blur-md hover:bg-black/90 active:scale-90 transition-all shadow-lg"
            title="Toggle Flashlight / Torch"
          >
            {torchOn ? <Flashlight className="w-4 h-4 text-yellow-400" /> : <FlashlightOff className="w-4 h-4 text-slate-400" />}
          </button>
        )}

        {/* Scan Status Pill */}
        <div className="absolute bottom-3 left-3 z-30 px-3 py-1 rounded-full bg-black/70 border border-yellow-500/30 text-[10px] font-black text-yellow-300 backdrop-blur-md flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          <span>{scanning ? "Authenticating..." : cameraActive ? "Point at Taxi QR Code" : "Webcam Ready"}</span>
        </div>
      </div>

      {/* 3. Verified Taxi Result Card */}
      {verifiedTaxi && (
        <div className="w-full bg-emerald-950/60 border-2 border-emerald-500/60 rounded-3xl p-4 mb-4 backdrop-blur-xl animate-in zoom-in-95 duration-200 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">{verifiedTaxi.vehicleNumber} • 100% ACCREDITED</h4>
                <p className="text-[10px] text-emerald-300 font-bold">{verifiedTaxi.securityGrade} Safety Score</p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black uppercase">
              VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-3 rounded-2xl border border-white/5 mb-3">
            <div>
              <span className="text-slate-400 text-[10px]">Driver:</span>
              <p className="font-extrabold text-white">{verifiedTaxi.driverName} (★ {verifiedTaxi.rating})</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Registration Plate:</span>
              <p className="font-extrabold text-yellow-300 font-mono">{verifiedTaxi.plate}</p>
            </div>
            <div className="col-span-2 pt-1 border-t border-white/5">
              <span className="text-slate-400 text-[10px]">Vehicle Model:</span>
              <p className="font-medium text-slate-200">{verifiedTaxi.model}</p>
            </div>
          </div>

          <button
            onClick={() => setVerifiedTaxi(null)}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            Scan Another Vehicle
          </button>
        </div>
      )}

      {/* 4. Instant 1-Tap Simulated Quick Scans */}
      <div className="w-full space-y-2 mb-4">
        <span className="text-[11px] font-extrabold text-yellow-300/80 text-left flex items-center gap-1.5 px-1">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span>Quick 1-Tap Test Scans:</span>
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSimulatedScan("QR_TAXI_901_SECURE_AUTH")}
            disabled={scanning}
            className="p-3 rounded-2xl bg-[#141208] hover:bg-[#201C0E] border border-yellow-500/25 text-left active:scale-95 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-white">Taxi TX-901</span>
              <Car className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <p className="text-[10px] text-slate-400">Marcus Vance • Camry Hybrid</p>
          </button>

          <button
            onClick={() => handleSimulatedScan("QR_TAXI_902_SECURE_AUTH")}
            disabled={scanning}
            className="p-3 rounded-2xl bg-[#141208] hover:bg-[#201C0E] border border-yellow-500/25 text-left active:scale-95 transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-white">Taxi TX-902</span>
              <Car className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400">Sophia Chen • Model Y</p>
          </button>
        </div>
      </div>

      {/* 5. Manual Code Input Fallback */}
      <form onSubmit={handleManualSubmit} className="w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Or enter Taxi PIN / Plate (e.g. TX-901)"
            className="w-full py-3 pl-4 pr-24 rounded-2xl bg-[#141208] border border-yellow-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 text-black text-[11px] font-black shadow-md active:scale-95 transition-all"
          >
            Verify PIN
          </button>
        </div>
      </form>
    </div>
  );
}
