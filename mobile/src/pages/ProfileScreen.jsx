import React, { useState } from "react";
import {
  User,
  Shield,
  Phone,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  LogOut,
  Car,
  Bell,
  Lock,
  Smartphone,
  Send
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { NativeService } from "../services/native";

export default function ProfileScreen({ onOpenRoleDrawer, onNavigateToSpecial }) {
  const { user, role, logout } = useAuth();
  const { addToast } = useToast();

  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: "David Rostova (Brother)", phone: "+1 (555) 998-1122", relation: "Sibling" },
    { id: 2, name: "Sarah Jenkins (Colleague)", phone: "+1 (555) 334-8899", relation: "Work Contact" },
  ]);

  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    NativeService.triggerHaptic("success");
    setEmergencyContacts([
      ...emergencyContacts,
      {
        id: Date.now(),
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relation: "Emergency Contact",
      },
    ]);

    setNewContactName("");
    setNewContactPhone("");
    setIsAddModalOpen(false);
    addToast("Emergency Contact added & synced with SOS dispatch!", "success");
  };

  const handleDeleteContact = (id) => {
    NativeService.triggerHaptic("warning");
    setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
    addToast("Contact removed from emergency broadcast", "info");
  };

  const handleTestSMS = (contact) => {
    NativeService.triggerHaptic("light");
    addToast(`Test SOS SMS sent to ${contact.name} (${contact.phone})`, "success");
  };

  return (
    <div className="flex-1 p-4 pb-20 overflow-y-auto space-y-4">
      {/* 1. User Profile Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1A1338] via-[#0F0F28] to-[#0A0A1C] border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="relative">
            <img
              src={
                user?.avatar ||
                (role === "ADMIN"
                  ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                  : role === "DRIVER"
                  ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
              }
              alt="Avatar"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-400 shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0A0A1C] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-base font-black text-white">{user?.name || "Elena Rostova"}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/40">
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user?.email || "passenger@smarttaxi.io"}</p>
          </div>
        </div>

        {/* Safety Score Meter */}
        <div className="bg-black/30 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white">Trust & Safety Rating</span>
              <p className="text-[10px] text-emerald-400 font-bold">Grade A+ • Biometric Verified</p>
            </div>
          </div>
          <span className="text-base font-black text-emerald-300">99.8%</span>
        </div>
      </div>

      {/* Role-Specific Workflows (Driver Console / Admin Fleet Console) */}
      {role === "DRIVER" && (
        <button
          onClick={() => onNavigateToSpecial("driver_console")}
          className="w-full p-4 rounded-3xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 text-left active:scale-[0.98] transition-all flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Open Driver Telemetry Console</h4>
              <p className="text-[10px] text-slate-300">Go Online/Offline, incoming ride requests & GPS</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        </button>
      )}

      {role === "ADMIN" && (
        <button
          onClick={() => onNavigateToSpecial("admin_fleet")}
          className="w-full p-4 rounded-3xl bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-amber-500/40 text-left active:scale-[0.98] transition-all flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Open Fleet Command Center</h4>
              <p className="text-[10px] text-slate-300">Live taxi radar, global SOS alerts & dispatch</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400" />
        </button>
      )}

      {/* 2. Emergency Contacts Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>SOS Emergency Contacts ({emergencyContacts.length})</span>
            </h3>
            <p className="text-[10px] text-slate-400">Auto-dispatched with live GPS link upon SOS panic</p>
          </div>

          <button
            onClick={() => {
              NativeService.triggerHaptic("light");
              setIsAddModalOpen(true);
            }}
            className="p-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Contacts list */}
        <div className="space-y-2">
          {emergencyContacts.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-2xl bg-[#12122B] border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-xs">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{c.name}</h4>
                  <p className="text-[10px] text-cyan-300 font-mono">{c.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTestSMS(c)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-bold"
                  title="Test SMS Alert"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteContact(c.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  title="Remove Contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Account Actions & Persona Switcher */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onOpenRoleDrawer}
          className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left flex items-center justify-between text-xs font-bold text-slate-200"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Switch Demo Persona (Passenger / Driver / Admin)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={() => {
            logout();
            addToast("Signed out", "info");
          }}
          className="w-full p-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#12122C] border border-white/15 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-1">Add Emergency Contact</h3>
            <p className="text-xs text-slate-400 mb-4">Will receive SMS with GPS link upon SOS panic trigger</p>

            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Contact Name & Relation</label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. John Doe (Brother)"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Phone Number (with country code)</label>
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-xs font-bold shadow-md active:scale-95"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
