import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, User, Mail, Lock, Phone, Car, Heart, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "PASSENGER",
    emergencyContactName: "",
    emergencyContactPhone: "",
    vehicleModel: "",
    plateNumber: "",
    agreeTerms: true
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { saveSession } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setErrorMsg("Please fill out all personal details.");
        return;
      }
      if (formData.password.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
        return;
      }
    }
    if (step === 2) {
      if (!formData.phone) {
        setErrorMsg("Phone number is required for security 2FA and emergency verification.");
        return;
      }
    }
    setErrorMsg("");
    setStep((prev) => prev + 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      setErrorMsg("Please agree to the Safety & Security Terms.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const emergencyContacts = formData.emergencyContactName
        ? [{ name: formData.emergencyContactName, phone: formData.emergencyContactPhone, relation: "Emergency Contact" }]
        : [];

      const vehicleInfo = formData.role === "DRIVER"
        ? { model: formData.vehicleModel || "Standard Security Sedan", plateNumber: formData.plateNumber || "NY-PENDING" }
        : {};

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        emergencyContacts: JSON.stringify(emergencyContacts),
        vehicleInfo: JSON.stringify(vehicleInfo)
      };

      const res = await api.post("/auth/register", payload);
      
      // Auto login after registration
      const loginRes = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });

      saveSession(loginRes.data);
      success("Account created successfully! Welcome to SafeRide AI.");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please check inputs or try another email.";
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/15 blur-[130px] pointer-events-none" />

      <div className="glass-panel max-w-lg w-full rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create Secure Account</h2>
          <p className="text-xs text-slate-400 mt-1">Step {step} of 3 • {step === 1 ? "Personal Info" : step === 2 ? "Role & Contact" : "Safety Verification"}</p>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= s ? "bg-gradient-to-r from-purple-500 to-cyan-400 shadow-sm" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 mb-5">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Personal Details */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Elena Rostova"
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:brightness-110 active:scale-98 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 mt-6"
            >
              <span>Continue to Step 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Role & Contact Details */}
        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "PASSENGER" })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.role === "PASSENGER"
                      ? "bg-purple-600/20 border-purple-500 text-white shadow-md"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <User className="w-5 h-5 text-purple-400 mb-1" />
                  <p className="text-xs font-bold text-white">Passenger</p>
                  <p className="text-[10px] text-slate-400">Request rides & share tracking</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "DRIVER" })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.role === "DRIVER"
                      ? "bg-cyan-600/20 border-cyan-500 text-white shadow-md"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <Car className="w-5 h-5 text-[#00D4FF] mb-1" />
                  <p className="text-xs font-bold text-white">Security Driver</p>
                  <p className="text-[10px] text-slate-400">Drive certified security taxi</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone (for SMS Alerts & 2FA)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl glass-input text-xs"
                  required
                />
              </div>
            </div>

            {formData.role === "DRIVER" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vehicle Model</label>
                  <input
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    placeholder="e.g. Toyota Camry Hybrid 2024"
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">License Plate Number</label>
                  <input
                    type="text"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    placeholder="e.g. NYC-7842-TX"
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-xs uppercase"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] hover:brightness-110 active:scale-98 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Step 3</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Safety & Emergency Verification */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-slate-300 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Heart className="w-4 h-4 text-red-400" /> Primary Emergency Contact (Optional)
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Contact Name & Relation</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="e.g. David Rostova (Brother)"
                  className="w-full py-2 px-3 rounded-lg glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="+1 (555) 998-1122"
                  className="w-full py-2 px-3 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-purple-600 mt-0.5 focus:ring-0"
              />
              <span>
                I agree to the <strong className="text-white">SafeRide AI Security Protocols</strong>, telemetry tracking, and automated emergency SOS dispatch agreement.
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-[#6C63FF] to-[#00D4FF] hover:brightness-110 active:scale-98 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-white/10 text-xs text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-[#00D4FF] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}