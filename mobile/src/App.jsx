import React, { useState } from "react";
import DeviceFrame from "./components/common/DeviceFrame";
import MobileHeader from "./components/common/MobileHeader";
import MobileNavBar from "./components/common/MobileNavBar";
import RoleDrawer from "./components/common/RoleDrawer";
import EmergencySOSModal from "./components/common/EmergencySOSModal";

// Screens
import HomeScreen from "./pages/HomeScreen";
import LiveTripScreen from "./pages/LiveTripScreen";
import QRScanScreen from "./pages/QRScanScreen";
import IncidentsScreen from "./pages/IncidentsScreen";
import AIAdvisorScreen from "./pages/AIAdvisorScreen";
import ProfileScreen from "./pages/ProfileScreen";
import DriverModeScreen from "./pages/DriverModeScreen";
import AdminFleetScreen from "./pages/AdminFleetScreen";
import LoginScreen from "./pages/LoginScreen";
import RegisterScreen from "./pages/RegisterScreen";

import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated, role } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [specialScreen, setSpecialScreen] = useState(null); // "driver_console" | "admin_fleet" | "auth_login" | "auth_register"
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

  // Screen routing resolution
  const renderCurrentScreen = () => {
    if (specialScreen === "auth_login") {
      return (
        <LoginScreen
          onNavigateRegister={() => setSpecialScreen("auth_register")}
          onLoginSuccess={() => setSpecialScreen(null)}
        />
      );
    }
    if (specialScreen === "auth_register") {
      return (
        <RegisterScreen
          onNavigateLogin={() => setSpecialScreen("auth_login")}
          onRegisterSuccess={() => setSpecialScreen(null)}
        />
      );
    }
    if (specialScreen === "driver_console") {
      return (
        <DriverModeScreen
          onBack={() => setSpecialScreen(null)}
          onSelectTab={(tab) => {
            setSpecialScreen(null);
            setActiveTab(tab);
          }}
        />
      );
    }
    if (specialScreen === "admin_fleet") {
      return <AdminFleetScreen onBack={() => setSpecialScreen(null)} />;
    }

    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            onSelectTab={setActiveTab}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            onOpenRoleDrawer={() => setIsRoleDrawerOpen(true)}
          />
        );
      case "trip":
        return <LiveTripScreen onOpenSOSModal={() => setIsSOSModalOpen(true)} />;
      case "qr":
        return <QRScanScreen onSelectTab={setActiveTab} />;
      case "incidents":
        return <IncidentsScreen />;
      case "ai":
        return <AIAdvisorScreen />;
      case "profile":
        return (
          <ProfileScreen
            onOpenRoleDrawer={() => setIsRoleDrawerOpen(true)}
            onNavigateToSpecial={(screen) => setSpecialScreen(screen)}
          />
        );
      default:
        return (
          <HomeScreen
            onSelectTab={setActiveTab}
            onOpenSOSModal={() => setIsSOSModalOpen(true)}
            onOpenRoleDrawer={() => setIsRoleDrawerOpen(true)}
          />
        );
    }
  };

  return (
    <DeviceFrame>
      <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden bg-[#070714] select-none">
        {/* Mobile Status Bar & Action Header */}
        <MobileHeader
          onOpenRoleDrawer={() => setIsRoleDrawerOpen(true)}
          onOpenSOSModal={() => setIsSOSModalOpen(true)}
        />

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {renderCurrentScreen()}
        </main>

        {/* Bottom Mobile Tab Bar (Hidden during full auth/special screens) */}
        {!specialScreen && (
          <MobileNavBar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setSpecialScreen(null);
              setActiveTab(tab);
            }}
          />
        )}

        {/* Global Slide-up Persona Switcher */}
        <RoleDrawer
          isOpen={isRoleDrawerOpen}
          onClose={() => setIsRoleDrawerOpen(false)}
          onNavigateTab={(tab) => {
            setSpecialScreen(null);
            setActiveTab(tab);
          }}
        />

        {/* Global Emergency SOS Alarm Modal */}
        <EmergencySOSModal
          isOpen={isSOSModalOpen}
          onClose={() => setIsSOSModalOpen(false)}
        />
      </div>
    </DeviceFrame>
  );
}
