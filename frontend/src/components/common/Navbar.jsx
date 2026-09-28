import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Radio, AlertOctagon, Bell, LogOut, Car, Activity, Menu, X, Navigation } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEmergency } from "../../context/EmergencyContext";

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { isEmergencyActive, triggerSOS, cancelEmergency } = useEmergency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/", public: true },
    { name: "Dashboard", path: "/dashboard", auth: true },
    { name: "Live Trip", path: "/trip", auth: true },
    { name: "Report Incident", path: "/incidents", auth: true },
    { name: "Fleet Map", path: "/map", auth: true },
  ];

  const filteredLinks = navLinks.filter((link) => {
    if (link.public) return true;
    if (link.auth && !isAuthenticated) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-[#0A0A0F]/85 backdrop-blur-2xl transition-all">
      {/* Taxi checkerboard accent stripe */}
      <div className="taxi-stripe w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Taxi Logo Image */}
          <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-[#F5C518]/40 shadow-lg shadow-yellow-500/20 group-hover:scale-105 group-hover:border-[#F5C518]/70 transition-all glow-taxi">
            <img
              src="/taxi-logo.jpg"
              alt="TaxiGuard Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight">
                <span className="text-[#F5C518]">Taxi</span>
                <span className="text-white">Guard</span>
                <span className="text-[#FFAA00]">AI</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Smart Taxi Security</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {filteredLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 shadow-sm"
                    : "text-slate-300 hover:text-yellow-300 hover:bg-yellow-500/8"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-3">
          {/* Emergency SOS Button */}
          {isEmergencyActive ? (
            <button
              onClick={cancelEmergency}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-wider animate-pulse hover:bg-red-700 transition-colors shadow-lg shadow-red-500/50"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Cancel SOS</span>
            </button>
          ) : (
            <button
              onClick={() => triggerSOS({ location: "Navbar Quick SOS Trigger" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-red-600/30"
              title="One-click Emergency SOS"
            >
              <Radio className="w-3.5 h-3.5 animate-ping" />
              <span>SOS</span>
            </button>
          )}

          {/* Notifications dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-300 hover:text-yellow-300 hover:bg-yellow-500/8 border border-white/5 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F5C518] animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-yellow-500/15 bg-[#0F0F18]/95 backdrop-blur-2xl p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-white/8 mb-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#F5C518]" /> Security Telemetry
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live
                  </span>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  <div className="p-2.5 rounded-xl bg-yellow-950/30 border border-yellow-500/20 text-xs">
                    <p className="text-yellow-200 font-medium">GPS Perimeter Active</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Route deviation threshold set to 500m.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs">
                    <p className="text-emerald-200 font-medium">Driver Verified ✓</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Marcus Vance has completed safety certification.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-yellow-900/20 border border-yellow-500/20 text-xs">
                    <p className="text-yellow-200 font-medium">AI Guardian Active</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Trip risk rating: Low (99.4% Safe zone).</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User profile / Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-yellow-500/40 transition-all group"
              >
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-yellow-400/40 group-hover:scale-105 transition-transform"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-none truncate max-w-[90px]">{user?.name?.split(" ")[0] || "User"}</p>
                  <span className="text-[9px] font-bold text-[#F5C518] uppercase tracking-wider">{role}</span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-[#F5C518] to-[#FFAA00] hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-yellow-300 hover:bg-yellow-500/8"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/8 bg-[#0A0A0F]/95 backdrop-blur-2xl px-4 py-4 space-y-2">
          {filteredLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-yellow-300 hover:bg-yellow-500/8"
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-yellow-300 hover:bg-yellow-500/8"
            >
              My Profile ({role})
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
