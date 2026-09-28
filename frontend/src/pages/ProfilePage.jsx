import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Phone,
  Mail,
  Car,
  Heart,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  Award,
  Radio,
  Camera,
  Save,
  Key
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

export default function ProfilePage() {
  const { user, role, updateUserData, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [saving, setSaving] = useState(false);

  // New emergency contact input
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("Family Member");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");
      setTwoFactorEnabled(user.twoFactorEnabled || false);

      try {
        if (typeof user.emergencyContacts === "string") {
          setEmergencyContacts(JSON.parse(user.emergencyContacts || "[]"));
        } else if (Array.isArray(user.emergencyContacts)) {
          setEmergencyContacts(user.emergencyContacts);
        }
      } catch (_) {
        setEmergencyContacts([]);
      }
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        phone,
        avatar,
        twoFactorEnabled,
        emergencyContacts: JSON.stringify(emergencyContacts)
      };

      const res = await api.put("/users/profile", payload);
      updateUserData(res.data);
      success("Profile & security settings updated successfully!");
    } catch (err) {
      toastError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmergencyContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) {
      toastError("Please provide name and phone number for emergency contact.");
      return;
    }

    const newContact = {
      id: Date.now(),
      name: newContactName,
      phone: newContactPhone,
      relation: newContactRelation
    };

    setEmergencyContacts((prev) => [...prev, newContact]);
    setNewContactName("");
    setNewContactPhone("");
    success(`Added ${newContact.name} to Emergency Contacts list.`);
  };

  const handleRemoveEmergencyContact = (indexToRemove) => {
    setEmergencyContacts((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    success("Emergency contact removed.");
  };

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-400" />
          Security Profile & Credentials
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your verified identity, emergency contact network, and cryptographic security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Avatar & Badges */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-card text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <img
                src={avatar}
                alt="Profile Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/40 shadow-xl"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0A0A1A] flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-white">{name || "User"}</h3>
              <p className="text-xs text-[#00D4FF] font-bold uppercase tracking-wider">{role} ACCOUNT</p>
            </div>

            {/* Safety Score Meter */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 text-center">
              <span className="text-[11px] text-slate-400 font-semibold">Safety Trust Score</span>
              <div className="text-2xl font-black text-emerald-400">{user?.safetyScore || 99} / 100</div>
              <p className="text-[10px] text-slate-500">Tier-1 Verified Passenger</p>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="p-6 rounded-3xl glass-card space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" /> Safety Badges Earned
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-3">
                <Shield className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-white font-bold">256-Bit Telemetry Verified</p>
                  <p className="text-[10px] text-slate-400">Continuous GPS sync enabled</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-white font-bold">QR Verification Pass</p>
                  <p className="text-[10px] text-slate-400">Completed 10+ validated rides</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Profile Form & Emergency Contacts */}
        <div className="md:col-span-2 space-y-8">
          {/* Personal Information Form */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <User className="w-5 h-5 text-[#00D4FF]" /> Verified Personal Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone (for SMS SOS)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-xl glass-input text-xs"
                />
              </div>

              {/* 2FA Security Switch */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-purple-400" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</h5>
                    <p className="text-[11px] text-slate-400">Receive SMS verification code before ride boarding</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save Profile & Security Settings"}</span>
              </button>
            </form>
          </div>

          {/* Emergency Contacts Manager */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" /> Emergency SOS Contacts Network
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  These trusted contacts will instantly receive your live GPS tracking link when SOS is triggered.
                </p>
              </div>
            </div>

            {/* List of contacts */}
            <div className="space-y-3">
              {emergencyContacts.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No emergency contacts added yet. Add trusted contacts below.
                </div>
              ) : (
                emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-white">{contact.name}</h5>
                      <p className="text-purple-300 font-mono mt-0.5">{contact.phone} • <span className="text-slate-400">{contact.relation}</span></p>
                    </div>

                    <button
                      onClick={() => handleRemoveEmergencyContact(idx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Contact Form */}
            <form onSubmit={handleAddEmergencyContact} className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
              <h5 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add New Emergency Contact
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contact Name"
                  className="py-2 px-3 rounded-lg glass-input text-xs"
                  required
                />
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="py-2 px-3 rounded-lg glass-input text-xs"
                  required
                />
                <select
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="py-2 px-3 rounded-lg glass-input text-xs"
                >
                  <option value="Family Member">Family Member</option>
                  <option value="Spouse / Partner">Spouse / Partner</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add to Emergency Network
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}