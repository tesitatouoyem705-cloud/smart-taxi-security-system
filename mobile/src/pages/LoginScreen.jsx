import React, { useState } from "react";
import { Shield, Lock, Mail, ChevronRight, User, Car, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { NativeService } from "../services/native";
import api from "../services/api";

export default function LoginScreen({ onNavigateRegister, onLoginSuccess }) {
  const { loginAsDemo, saveSession } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    NativeService.triggerHaptic("medium");

    try {
      const res = await api.post("/auth/login", { email, password });
      saveSession(res.data);
      NativeService.triggerHaptic("success");
      addToast(`Welcome back, ${res.data.user.name}!`, "success");
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      addToast(err.response?.data?.message || "Invalid credentials. Try 1-Click Demo.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    NativeService.triggerHaptic("success");
    await loginAsDemo(role);
    addToast(`Signed in as demo ${role}`, "success");
    setLoading(false);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
      {/* Top Brand Banner */}
      <div className="text-center pt-4 flex flex-col items-center">
        <img
          src="/saferide_logo.png"
          alt="SafeRide"
          className="w-20 h-20 rounded-[28px] object-cover border-2 border-yellow-400 shadow-2xl shadow-yellow-500/40 mb-3"
        />
        <h2 className="text-2xl font-black text-white tracking-tight">SafeRide Mobile</h2>
        <p className="text-xs text-yellow-200/80 mt-1">Autonomous Urban Taxi & Ride Security Grid</p>
      </div>

      {/* 1-Click Demo Accounts (Top Priority for instant mobile evaluation) */}
      <div className="my-6 p-4 rounded-3xl bg-[#161309] border border-yellow-500/30 shadow-xl space-y-2.5">
        <span className="text-[10px] font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Instant 1-Click Demo Login</span>
        </span>

        <div className="space-y-2">
          <button
            onClick={() => handleDemo("PASSENGER")}
            disabled={loading}
            className="w-full p-3 rounded-2xl bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/40 text-left flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-yellow-400" />
              <div>
                <span className="text-xs font-bold text-white block">Passenger (Elena Rostova)</span>
                <span className="text-[10px] text-slate-400">GPS tracking, QR scanner & SOS panic</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-yellow-400" />
          </button>

          <button
            onClick={() => handleDemo("DRIVER")}
            disabled={loading}
            className="w-full p-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-left flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Car className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">Driver (Marcus Vance)</span>
                <span className="text-[10px] text-slate-400">Taxi TX-901 telemetry transmitter</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => handleDemo("ADMIN")}
            disabled={loading}
            className="w-full p-3 rounded-2xl bg-yellow-600/15 hover:bg-yellow-600/25 border border-yellow-600/40 text-left flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-yellow-500" />
              <div>
                <span className="text-xs font-bold text-white block">Fleet Commander (Alex Reynolds)</span>
                <span className="text-[10px] text-slate-400">Global taxi radar & SOS dispatch</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-yellow-500" />
          </button>
        </div>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full py-3 pl-10 pr-4 rounded-2xl bg-white/5 border border-yellow-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full py-3 pl-10 pr-4 rounded-2xl bg-white/5 border border-yellow-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-black font-black text-xs shadow-xl active:scale-95 transition-all disabled:opacity-40"
        >
          {loading ? "Authenticating..." : "Sign In with Credentials"}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="text-center pt-4">
        <button
          onClick={onNavigateRegister}
          className="text-xs text-slate-400 hover:text-white"
        >
          Don't have an account? <span className="text-yellow-400 font-bold">Create Account</span>
        </button>
      </div>
    </div>
  );
}
