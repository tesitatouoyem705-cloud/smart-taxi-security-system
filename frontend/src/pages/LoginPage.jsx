import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, User, ArrowRight, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

export default function LoginPage() {
  const [role, setRole] = useState("PASSENGER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { saveSession, loginAsDemo } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/auth/login", { email, password });
      saveSession(res.data);
      success(`Welcome back, ${res.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password. You can also use the 1-Click Demo accounts below.";
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (selectedRole) => {
    setRole(selectedRole);
    setLoading(true);
    try {
      await loginAsDemo(selectedRole);
      success(`Logged in as Demo ${selectedRole}!`);
      navigate("/dashboard");
    } catch (err) {
      toastError("Could not log in as demo user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 blur-[120px] pointer-events-none" />

      <div className="glass-panel max-w-md w-full rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Sign In to SafeRide AI</h2>
          <p className="text-xs text-slate-400 mt-1">Smart Urban Taxi Security & Incident Management</p>
        </div>

        {/* 1-Click Demo Accounts Quick-Select */}
        <div className="mb-6 p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 text-center">
          <p className="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00D4FF]" /> 1-Click Instant Demo Login:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("PASSENGER")}
              className="py-1.5 px-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 text-[11px] font-bold border border-purple-500/40 transition-all"
            >
              Passenger
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("DRIVER")}
              className="py-1.5 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-200 text-[11px] font-bold border border-cyan-500/40 transition-all"
            >
              Driver
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin("ADMIN")}
              className="py-1.5 px-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-200 text-[11px] font-bold border border-red-500/40 transition-all"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/5 border border-white/5 mb-6 text-xs font-semibold">
          {["PASSENGER", "DRIVER", "ADMIN"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2 rounded-lg transition-all ${
                role === r
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-start gap-2 mb-5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "ADMIN" ? "admin@smarttaxi.io" : role === "DRIVER" ? "driver@smarttaxi.io" : "passenger@smarttaxi.io"}
                className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-purple-600 focus:ring-0"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => alert("Password reset link sent to registered email.")}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:brightness-110 active:scale-98 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In as {role}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center mt-6 pt-6 border-t border-white/10 text-xs text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#00D4FF] font-bold hover:underline">
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}