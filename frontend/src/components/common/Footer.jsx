import React from "react";
import { Shield, Radio, Phone, Mail, Globe, Heart, Cpu, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#070714] text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#00D4FF] flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                SafeRide<span className="text-[#00D4FF]">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous Smart Urban Taxi Security & Anomaly Detection system. Real-time telemetry, AI guardian monitoring, and rapid emergency intervention.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>All Security Systems Operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform Features</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/trip" className="hover:text-purple-400 transition-colors">Real-time GPS Tracking</Link></li>
              <li><Link to="/incidents" className="hover:text-purple-400 transition-colors">Incident Reporting</Link></li>
              <li><Link to="/map" className="hover:text-purple-400 transition-colors">Urban Fleet Monitoring</Link></li>
              <li><Link to="/dashboard" className="hover:text-purple-400 transition-colors">Role Dashboards</Link></li>
            </ul>
          </div>

          {/* Security Protocols */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Safety Protocols</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> One-Click Emergency SOS</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Gemini AI Route Deviation Alerts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Encrypted QR Trip Sharing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Biometric Driver Verification</li>
            </ul>
          </div>

          {/* Emergency 24/7 Hotline */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" /> 24/7 Emergency Dispatch
            </h4>
            <p className="text-xs text-slate-300">Direct link to Central Security Operations Center:</p>
            <div className="flex flex-col gap-2">
              <a href="tel:911" className="flex items-center gap-2 text-xs font-bold text-white hover:text-red-400 transition-colors">
                <Phone className="w-3.5 h-3.5 text-red-500" /> Emergency Hotline: 911 / (800) SAFE-TAXI
              </a>
              <a href="mailto:security@smarttaxi.io" className="flex items-center gap-2 text-xs text-slate-400 hover:text-purple-300 transition-colors">
                <Mail className="w-3.5 h-3.5 text-purple-400" /> security@smarttaxi.io
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SafeRide AI Security Systems. Built with React 19, Tailwind CSS, Node.js & PostgreSQL.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#00D4FF]" /> AI Engine Online
            </span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
