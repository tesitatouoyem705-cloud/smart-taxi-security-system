import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import EmergencyBanner from "./components/common/EmergencyBanner";
import AIAssistantWidget from "./components/AIAssistantWidget";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import LiveTripPage from "./pages/LiveTripPage";
import SharedTripPage from "./pages/SharedTripPage";
import IncidentsPage from "./pages/IncidentsPage";
import ProfilePage from "./pages/ProfilePage";
import MapPage from "./pages/MapPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-slate-100 selection:bg-yellow-500 selection:text-black relative">
      {/* Global Emergency Alert Banner */}
      <EmergencyBanner />

      {/* Main Navbar */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trip" element={<LiveTripPage />} />
          <Route path="/trip/:id" element={<LiveTripPage />} />
          <Route path="/trip/shared/:token" element={<SharedTripPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating Gemini AI Safety Guardian Widget on all pages */}
      <AIAssistantWidget />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}