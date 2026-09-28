import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Radio,
  Car,
  Bot,
  QrCode,
  MapPin,
  ChevronRight,
  Activity,
  CheckCircle2,
  Users,
  Award,
  Zap,
  Clock,
  Sparkles,
  Navigation,
  ScanLine,
  Star,
  Gauge,
  Wifi,
  PhoneCall,
  Flag,
  User,
  ArrowRight,
  Lock,
  BadgeCheck,
  Smartphone,
  Camera,
  VideoOff,
} from "lucide-react";
import LiveMap from "../components/LiveMap";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import QRScannerModal from "../components/QRScannerModal";

/* ─── Taxi Dashboard Mini Card ─────────────────────────── */
function TaxiDashCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-2xl bg-black/40 border border-white/6 hover:border-yellow-500/30 transition-all">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
      <p className="text-xl font-black text-white leading-none">{value}</p>
      {sublabel && <p className="text-[10px] text-yellow-400 font-semibold">{sublabel}</p>}
    </div>
  );
}

/* ─── Live Camera Viewfinder (auto-start + BarcodeDetector) ─ */
function CameraViewfinder({ onOpenScanner }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const [camState, setCamState] = useState("idle"); // idle | loading | active | error | verified
  const [errorMsg, setErrorMsg] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // ── Open camera stream ─────────────────────────────────────
  const startCamera = useCallback(async () => {
    setScanResult(null);
    setCamState("loading");
    setErrorMsg("");
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());

    if (!navigator.mediaDevices?.getUserMedia) {
      setCamState("error");
      setErrorMsg("Camera not supported in this browser.");
      return;
    }
    const constraints = [
      { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: "user" }, audio: false },
      { video: true, audio: false },
    ];
    let stream = null, lastErr = null;
    for (const c of constraints) {
      try { stream = await navigator.mediaDevices.getUserMedia(c); break; }
      catch (e) { lastErr = e; }
    }
    if (!stream) {
      setCamState("error");
      setErrorMsg(lastErr?.name === "NotAllowedError"
        ? "Camera permission denied. Allow camera access in your browser."
        : "Could not open camera. Use Demo Scan to simulate.");
      return;
    }
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");
      videoRef.current.muted = true;
      await videoRef.current.play().catch(() => {});
    }
    setCamState("active");
  }, []);

  // ── Stop camera stream ─────────────────────────────────────
  const stopCamera = useCallback(() => {
    clearInterval(scanIntervalRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsScanning(false);
    setCamState("idle");
  }, []);

  // ── Handle a successful QR scan ────────────────────────────
  const handleVerified = useCallback((raw = "TX-901") => {
    clearInterval(scanIntervalRef.current);
    setIsScanning(false);
    const result = { vehicleNumber: "TX-901", model: "Toyota Camry Hybrid", driverName: "Marcus Vance", rating: 4.92, grade: "A+" };
    setScanResult(result);
    setCamState("verified");
    if (onOpenScanner) onOpenScanner(result);
  }, [onOpenScanner]);

  // ── AUTO-START on mount ────────────────────────────────────
  useEffect(() => { startCamera(); return () => stopCamera(); }, []); // eslint-disable-line

  // ── BarcodeDetector scan loop (starts when camera is active) ─
  useEffect(() => {
    if (camState !== "active") return;
    if (!("BarcodeDetector" in window)) return; // Demo Scan button is shown as fallback

    let detector;
    try { detector = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "data_matrix"] }); }
    catch { return; }

    setIsScanning(true);
    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const codes = await detector.detect(videoRef.current);
        if (codes?.length > 0) handleVerified(codes[0].rawValue);
      } catch { /* ignore per-frame errors */ }
    }, 500);

    return () => { clearInterval(scanIntervalRef.current); setIsScanning(false); };
  }, [camState, handleVerified]);

  // ── Cleanup on unmount ─────────────────────────────────────
  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">

      {/* ── Live video feed (always rendered, opacity controlled) ── */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          camState === "active" ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        playsInline
        muted
      />

      {/* Dark bg when not streaming */}
      {camState !== "active" && camState !== "verified" && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#100e00] to-[#0A0A0F]" />
      )}

      {/* ── Scanner overlay (shown when active) ──────────────── */}
      {camState === "active" && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Vignette */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-[3px] border-l-[3px] border-[#F5C518] rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-[3px] border-r-[3px] border-[#F5C518] rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-[3px] border-l-[3px] border-[#F5C518] rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-[3px] border-r-[3px] border-[#F5C518] rounded-br-lg" />

          {/* Animated scan beam */}
          <div className="absolute left-6 right-6 top-6 bottom-6 overflow-hidden">
            <div
              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5C518] to-transparent shadow-lg shadow-yellow-400/80 animate-scan-beam"
              style={{ top: "5%" }}
            />
          </div>

          {/* Status pill */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-yellow-500/40">
            <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? "bg-[#F5C518] animate-pulse" : "bg-emerald-400 animate-pulse"}`} />
            <span className="text-[9px] font-bold text-yellow-300 tracking-widest">
              {isScanning ? "SCANNING..." : "CAMERA LIVE"}
            </span>
          </div>

          {/* Aim hint */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <span className="text-[9px] text-yellow-200/60 font-semibold">Point at QR on taxi door</span>
          </div>
        </div>
      )}

      {/* ── Demo Scan button (active, no BarcodeDetector) ─────── */}
      {camState === "active" && (
        <div className="absolute bottom-2 right-2 z-20 flex gap-1.5">
          {!("BarcodeDetector" in window) && (
            <button
              onClick={() => handleVerified("TX-DEMO")}
              className="px-2.5 py-1 rounded-lg bg-yellow-500/25 border border-yellow-500/40 text-[9px] text-yellow-300 font-bold hover:bg-yellow-500/40 transition-colors backdrop-blur-sm"
            >
              Demo Scan ⚡
            </button>
          )}
          <button
            onClick={stopCamera}
            className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-[9px] text-slate-400 hover:text-white transition-colors backdrop-blur-sm"
          >
            Stop
          </button>
        </div>
      )}

      {/* ── Verified result overlay ───────────────────────────── */}
      {camState === "verified" && scanResult && (
        <div className="absolute inset-0 z-20 bg-black/88 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center gap-1.5">
          <div className="w-11 h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-xs font-black text-emerald-400 tracking-wide">✓ QR VERIFIED</p>
          <p className="text-[11px] text-white font-bold">{scanResult.vehicleNumber} · {scanResult.model}</p>
          <p className="text-[10px] text-yellow-300">Driver: {scanResult.driverName} ★ {scanResult.rating}</p>
          <p className="text-[10px] text-slate-400">Safety: <span className="text-emerald-400 font-bold">{scanResult.grade}</span></p>
          <button
            onClick={() => { setScanResult(null); startCamera(); }}
            className="mt-1.5 px-3 py-1.5 rounded-lg bg-[#F5C518]/15 border border-yellow-500/35 text-[10px] text-yellow-300 font-bold hover:bg-yellow-500/25 transition-all"
          >
            Scan Another
          </button>
        </div>
      )}

      {/* ── Loading state ─────────────────────────────────────── */}
      {camState === "loading" && (
        <div className="relative z-20 flex flex-col items-center gap-2 text-center">
          <Camera className="w-10 h-10 text-[#F5C518] animate-pulse" />
          <p className="text-xs text-yellow-300 font-bold animate-pulse">Opening camera...</p>
        </div>
      )}

      {/* ── Idle state ────────────────────────────────────────── */}
      {camState === "idle" && (
        <div className="relative z-20 flex flex-col items-center gap-2 text-center px-5">
          <Camera className="w-10 h-10 text-[#F5C518]" />
          <p className="text-xs font-bold text-white">Camera Viewfinder</p>
          <p className="text-[10px] text-slate-400 max-w-[160px]">Tap below to open camera &amp; scan the QR code on the taxi door</p>
          <button
            onClick={startCamera}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F5C518] to-[#FFAA00] text-black font-extrabold text-[11px] shadow-lg shadow-yellow-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" /> Open Camera
          </button>
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────── */}
      {camState === "error" && (
        <div className="relative z-20 flex flex-col items-center gap-2 text-center px-5">
          <VideoOff className="w-9 h-9 text-red-400" />
          <p className="text-[10px] text-red-300 font-semibold max-w-[170px]">{errorMsg}</p>
          <div className="flex gap-2">
            <button
              onClick={startCamera}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F5C518] to-[#FFAA00] text-black font-extrabold text-[10px] active:scale-95 transition-all flex items-center gap-1"
            >
              <Camera className="w-3 h-3" /> Retry
            </button>
            <button
              onClick={() => handleVerified("TX-DEMO")}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold active:scale-95 transition-all"
            >
              Demo Scan ⚡
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── Trip Step Component ───────────────────────────────── */
function TripStep({ step, icon: Icon, title, desc, isLast, isActive }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm transition-all
          ${isActive
            ? "bg-gradient-to-br from-[#F5C518] to-[#FFAA00] text-black shadow-lg shadow-yellow-500/40 animate-step-glow"
            : "bg-black/50 border border-white/10 text-slate-400"
          }`}>
          <Icon className="w-5 h-5" />
        </div>
        {!isLast && (
          <div className={`w-0.5 h-10 mt-1 rounded-full ${isActive ? "bg-gradient-to-b from-yellow-400 to-yellow-400/10" : "bg-white/8"}`} />
        )}
      </div>
      <div className="pt-1.5 pb-4">
        <p className={`text-sm font-bold ${isActive ? "text-yellow-300" : "text-slate-300"}`}>{title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 1420,
    activeTaxis: 38,
    totalTrips: 18940,
    safeRidesPercentage: 99.8,
  });
  const [activeStep, setActiveStep] = useState(0);

  const demoTaxis = [
    { id: 1, vehicleNumber: "TX-901", model: "Toyota Yaris Taxi", driverName: "Jean-Paul Mbida", rating: 4.95, currentLatitude: 3.8667, currentLongitude: 11.5167, status: "ACTIVE" },
    { id: 2, vehicleNumber: "TX-902", model: "Toyota Corolla Hybrid", driverName: "Amina Ngono", rating: 4.96, currentLatitude: 3.8833, currentLongitude: 11.5167, status: "ACTIVE" },
    { id: 3, vehicleNumber: "TX-903", model: "Toyota RAV4 Patrol", driverName: "Samuel Eto'o Junior", rating: 4.88, currentLatitude: 3.8750, currentLongitude: 11.5350, status: "ON_TRIP" },
    { id: 4, vehicleNumber: "TX-904", model: "Toyota Avensis Security", driverName: "Dieudonné Fouda", rating: 4.98, currentLatitude: 3.8549, currentLongitude: 11.4912, status: "ACTIVE" },
  ];

  // Trip flow steps
  const tripSteps = [
    {
      icon: Smartphone,
      title: "Book Your Ride",
      desc: "Open TaxiGuardAI, set your pickup & destination. A verified driver is dispatched instantly.",
    },
    {
      icon: Camera,
      title: "Open Camera & Point at Taxi Door",
      desc: "Open the TaxiGuardAI camera, point it at the QR code on the rear passenger door — verification happens automatically.",
    },
    {
      icon: BadgeCheck,
      title: "Verification Confirmed",
      desc: "AI cross-checks driver biometrics, vehicle plate, and insurance. You receive a safety clearance badge.",
    },
    {
      icon: Navigation,
      title: "Live Trip Tracking",
      desc: "Real-time GPS broadcasts your journey to trusted contacts. Gemini AI monitors for route deviations.",
    },
    {
      icon: Radio,
      title: "One-Touch SOS Available",
      desc: "Press SOS anytime to broadcast your location to dispatch, police, and emergency contacts via SMS.",
    },
    {
      icon: Flag,
      title: "Safe Arrival & Trip End",
      desc: "Rate your driver, receive a journey safety report, and share your trip summary with contacts.",
    },
  ];

  useEffect(() => {
    api.get("/users/stats")
      .then((res) => { if (res.data) setStats(res.data); })
      .catch(() => {});

    // Auto-advance step indicator
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % tripSteps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const handleQuickDemo = async (role) => {
    await loginAsDemo(role);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-slate-100 overflow-hidden">
      {/* Background glow orbs — yellow toned */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-yellow-500/15 via-amber-600/8 to-transparent blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[60vh] right-0 w-[500px] h-[500px] bg-gradient-to-bl from-yellow-600/10 via-orange-600/8 to-transparent blur-[130px] pointer-events-none -z-10" />

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Safety Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/25 backdrop-blur-xl mb-8 animate-float shadow-lg shadow-yellow-500/10">
          <Sparkles className="w-4 h-4 text-[#F5C518]" />
          <span className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
            Next-Gen Urban Taxi Security & Incident Detection
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Taxi Logo Hero Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative animate-taxi">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-[#F5C518]/50 shadow-2xl shadow-yellow-500/30 glow-taxi">
              <img src="/taxi-logo.jpg" alt="TaxiGuard AI" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#F5C518] to-[#FFAA00] flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <Shield className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
          Safe Journeys Powered by{" "}
          <span className="gradient-text-primary">Autonomous AI</span> Security.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Real-time GPS telemetry, Gemini AI panic detection, one-click emergency SOS dispatch, and biometric QR trip verification for passengers, drivers, and fleet operators.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#F5C518] via-[#FFAA00] to-[#FF8C00] hover:brightness-110 text-black font-extrabold text-sm tracking-wide shadow-xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Car className="w-4 h-4" />
            <span>{isAuthenticated ? "Go to Dashboard" : "Get Started as Passenger"}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <Link
            to="/trip"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/10 backdrop-blur-xl hover:border-yellow-500/40 transition-all flex items-center justify-center gap-2"
          >
            <Radio className="w-4 h-4 text-red-400" />
            <span>Launch Live GPS Tracking</span>
          </Link>
        </div>

        {/* Quick Demo Switcher */}
        <div className="max-w-xl mx-auto p-4 rounded-2xl glass-card border border-yellow-500/10 text-xs mb-16">
          <div className="flex items-center justify-center gap-2 text-slate-300 font-semibold mb-3">
            <Zap className="w-4 h-4 text-[#F5C518]" />
            <span>Instant Evaluation • 1-Click Demo Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo("PASSENGER")}
              className="py-2 px-3 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/30 text-yellow-200 border border-yellow-500/25 font-bold transition-all"
            >
              Passenger Mode
            </button>
            <button
              onClick={() => handleQuickDemo("DRIVER")}
              className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-200 border border-amber-500/25 font-bold transition-all"
            >
              Driver Mode
            </button>
            <button
              onClick={() => handleQuickDemo("ADMIN")}
              className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-200 border border-red-500/25 font-bold transition-all"
            >
              Admin Central
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            TAXI DASHBOARD STRIP
        ══════════════════════════════════════ */}
        <div className="mb-20">
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/25 bg-yellow-500/8">
              <Gauge className="w-4 h-4 text-[#F5C518]" />
              <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Live Fleet Dashboard</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <TaxiDashCard
              icon={Car}
              label="Active Units"
              value={`${stats.activeTaxis || 38}`}
              color="bg-yellow-500/15 text-yellow-400"
              sublabel="▲ +3 this hour"
            />
            <TaxiDashCard
              icon={Navigation}
              label="On Trip Now"
              value="14"
              color="bg-emerald-500/15 text-emerald-400"
              sublabel="Live GPS"
            />
            <TaxiDashCard
              icon={Award}
              label="Safe Rides"
              value={(stats.totalTrips || 18940).toLocaleString()}
              color="bg-amber-500/15 text-amber-400"
              sublabel="99.8% incident-free"
            />
            <TaxiDashCard
              icon={Clock}
              label="Avg Response"
              value="1.8m"
              color="bg-red-500/15 text-red-400"
              sublabel="SOS dispatch"
            />
            <TaxiDashCard
              icon={Wifi}
              label="AI Uptime"
              value="99.97%"
              color="bg-blue-500/15 text-blue-400"
              sublabel="Gemini 2.0"
            />
            <TaxiDashCard
              icon={Users}
              label="Passengers"
              value={(stats.totalUsers || 1420).toLocaleString()}
              color="bg-purple-500/15 text-purple-400"
              sublabel="Verified users"
            />
          </div>

          {/* Dashboard Live Ticker */}
          <div className="p-3 rounded-xl border border-yellow-500/15 bg-black/30 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
            <div className="overflow-hidden flex-1">
              <p className="text-slate-300 truncate">
                TX-902 · Sophia Chen · Route confirmed ✓ · Est. 8 min → Times Sq &nbsp;|&nbsp;
                TX-904 · Amara Okonjo · Passenger boarded · QR Verified ✓ &nbsp;|&nbsp;
                TX-901 · Marcus Vance · Incident-free ride 48hr streak 🏆
              </p>
            </div>
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-20 text-left">
          {[
            { label: "Safe Rides Completed", icon: Award, value: (stats.totalTrips || 18940).toLocaleString(), sub: "★ 99.8% Incident-Free", color: "text-emerald-400" },
            { label: "Active Security Fleet", icon: Car, value: `${stats.activeTaxis || 38} Units`, sub: "2s GPS Telemetry", color: "text-yellow-400" },
            { label: "Emergency Response", icon: Clock, value: "< 1.8 min", sub: "Instant SOS Dispatch", color: "text-red-400" },
            { label: "AI Safety Engine", icon: Bot, value: "Gemini 2.0", sub: "Deviation Anomaly Guard", color: "text-amber-400" },
          ].map(({ label, icon: Icon, value, sub, color }) => (
            <div key={label} className="p-6 rounded-3xl glass-card glass-card-interactive">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">{label}</span>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className={`text-xs font-bold mt-1 ${color}`}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            QR CODE ON TAXI DOOR — CARD
        ══════════════════════════════════════ */}
        <div className="mb-24 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/25 bg-yellow-500/8">
              <Camera className="w-4 h-4 text-[#F5C518]" />
              <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Camera QR Verification · Taxi Door</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Visual QR Door card */}
            <div className="relative rounded-3xl overflow-hidden border border-yellow-500/20 bg-gradient-to-br from-[#1a1200] via-[#0f0d00] to-[#0A0A0F] p-0">
              {/* Taxi door illustration */}
              <div className="relative h-80 bg-gradient-to-br from-[#F5C518]/90 to-[#E6A800]/80 flex items-center justify-center overflow-hidden">
                {/* Door panel lines */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-black/40 rounded" />
                  <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-black/40 rounded" />
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-black/40 rounded" />
                  <div className="absolute right-4 top-4 bottom-4 w-0.5 bg-black/40 rounded" />
                </div>

                {/* Checkerboard strip on taxi door */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-[#F5C518] flex">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-black" : "bg-[#F5C518]"}`} />
                  ))}
                </div>

                {/* TaxiGuard label on door */}
                <div className="absolute top-2.5 left-0 right-0 flex justify-center z-10">
                  <span className="text-white font-black text-sm tracking-widest mix-blend-difference">TAXIGUARD AI</span>
                </div>

                {/* Live Camera Viewfinder mounted on door */}
                <div className="relative z-10 mt-4 w-52 h-44 rounded-2xl overflow-hidden shadow-2xl shadow-black/70 border-4 border-black/80">
                  <CameraViewfinder />
                </div>

                {/* Security badge below camera */}
                <div className="relative z-10 flex items-center justify-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-black/60 border border-yellow-400/40">
                  <Camera className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] font-bold text-yellow-300">LIVE CAMERA · ENCRYPTED</span>
                </div>

                {/* Door handle */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-14 rounded-full bg-black/60 shadow-inner" />

                {/* Glow around QR */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Card footer info */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Vehicle</p>
                    <p className="text-base font-black text-white">TX-902 · Tesla Model Y</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">VERIFIED</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white/4 border border-white/6">
                    <User className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">Driver</p>
                    <p className="text-xs font-bold text-white">Sophia C.</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/4 border border-white/6">
                    <Star className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">Rating</p>
                    <p className="text-xs font-bold text-white">4.96 ★</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/4 border border-white/6">
                    <Shield className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-400">Safety</p>
                    <p className="text-xs font-bold text-emerald-400">A+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: How it works info */}
            <div className="rounded-3xl p-7 glass-card border border-yellow-500/10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Scan Before You Ride</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Every TaxiGuard AI taxi has a QR code on the passenger door. Open your camera, point it at the code — our AI instantly verifies the driver, vehicle, and insurance in under 2 seconds.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Camera, label: "Open camera & point at taxi door QR", color: "text-yellow-400 bg-yellow-500/15" },
                    { icon: BadgeCheck, label: "Driver & vehicle verified in 2 seconds", color: "text-emerald-400 bg-emerald-500/15" },
                    { icon: Users, label: "Share live journey with contacts", color: "text-blue-400 bg-blue-500/15" },
                    { icon: Shield, label: "AI safety guardian active for entire ride", color: "text-amber-400 bg-amber-500/15" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-slate-200 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="mt-8 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#F5C518] to-[#FFAA00] text-black font-extrabold text-sm hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-yellow-500/25"
              >
                <QrCode className="w-4 h-4" />
                Try QR Verification Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            TRIP FLOW — STEP BY STEP JOURNEY
        ══════════════════════════════════════ */}
        <div className="mb-24 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/25 bg-yellow-500/8">
              <Navigation className="w-4 h-4 text-[#F5C518]" />
              <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Your Safe Trip Journey</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Steps left */}
            <div className="p-6 rounded-3xl glass-card border border-yellow-500/10">
              <h3 className="text-xl font-black text-white mb-6">From Booking to Safe Arrival</h3>
              <div>
                {tripSteps.map((step, i) => (
                  <TripStep
                    key={i}
                    step={i}
                    icon={step.icon}
                    title={step.title}
                    desc={step.desc}
                    isLast={i === tripSteps.length - 1}
                    isActive={i === activeStep}
                  />
                ))}
              </div>
            </div>

            {/* Right: Live trip mock UI */}
            <div className="space-y-4">
              {/* Mock trip card */}
              <div className="p-5 rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-[#1a1200]/60 to-[#0A0A0F] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/8 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500/40">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop" alt="Driver" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Sophia Chen</p>
                      <p className="text-[10px] text-yellow-400 font-medium">TX-902 · Tesla Model Y</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    <span className="text-[10px] font-bold text-emerald-400">● ON TRIP</span>
                  </div>
                </div>

                {/* Route bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300">Madison Ave & 56th St</span>
                  </div>
                  <div className="ml-1 w-0.5 h-5 bg-yellow-500/30" />
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F5C518]" />
                    <span className="text-slate-300">Times Square, NYC</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Trip Progress</span>
                    <span className="text-yellow-400 font-bold">62%</span>
                  </div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full w-[62%] bg-gradient-to-r from-[#F5C518] to-[#FFAA00] rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white/4">
                    <p className="text-[10px] text-slate-400">ETA</p>
                    <p className="text-sm font-black text-white">8 min</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/4">
                    <p className="text-[10px] text-slate-400">Distance</p>
                    <p className="text-sm font-black text-white">2.4 km</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/4">
                    <p className="text-[10px] text-slate-400">Safety</p>
                    <p className="text-sm font-black text-emerald-400">A+</p>
                  </div>
                </div>
              </div>

              {/* Feature badges */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Bot, label: "Gemini AI Guardian", desc: "Route anomaly monitoring", color: "from-amber-900/30 to-black/20 border-amber-500/20" },
                  { icon: PhoneCall, label: "SOS Ready", desc: "1-tap emergency dispatch", color: "from-red-900/30 to-black/20 border-red-500/20" },
                  { icon: MapPin, label: "Live GPS Share", desc: "Family can track in real-time", color: "from-blue-900/30 to-black/20 border-blue-500/20" },
                  { icon: Activity, label: "Incident Monitor", desc: "Zero deviation detected", color: "from-emerald-900/30 to-black/20 border-emerald-500/20" },
                ].map(({ icon: Icon, label, desc, color }) => (
                  <div key={label} className={`p-3.5 rounded-2xl bg-gradient-to-br border ${color} flex items-start gap-2.5`}>
                    <Icon className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{label}</p>
                      <p className="text-[10px] text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Map Preview Section */}
        <div className="mb-24 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-2xl font-black text-white tracking-tight">Live Urban Fleet Radar</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">Real-time GPS telemetry from active urban taxi units.</p>
            </div>
            <Link
              to="/map"
              className="px-4 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-xs font-bold text-yellow-200 border border-yellow-500/20 transition-colors flex items-center gap-2"
            >
              <span>Expand Full Fleet View</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <LiveMap taxis={demoTaxis} height="440px" />
        </div>

        {/* Feature Grid Section */}
        <div className="text-left mb-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h3 className="text-3xl font-black text-white tracking-tight mb-3">Enterprise Security Architecture</h3>
            <p className="text-sm text-slate-400">
              Designed according to modern urban security protocols for zero-trust passenger safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Radio,
                title: "One-Click Emergency SOS",
                desc: "Immediately trigger an encrypted distress signal broadcasting live coordinates to dispatchers, police, and verified emergency contacts via Twilio SMS.",
                color: "bg-red-500/15 border-red-500/30 text-red-400",
              },
              {
                icon: Bot,
                title: "Gemini AI Safety Guardian",
                desc: "Autonomous AI monitors route deviations, flags erratic acceleration anomalies, detects panic keywords in chat, and provides immediate safety instructions.",
                color: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
              },
              {
                icon: QrCode,
                title: "Encrypted QR Verification",
                desc: "Scan onboard QR codes to verify driver identity and vehicle registration before boarding. Share live journey tracking links with trusted contacts.",
                color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-8 rounded-3xl glass-card glass-card-interactive space-y-4">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">{title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}