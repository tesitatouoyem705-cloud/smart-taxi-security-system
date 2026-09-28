import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { NativeService } from "../services/native";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile on startup
  const fetchProfile = useCallback(async () => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/users/profile");
      setUser(res.data);
    } catch (err) {
      console.warn("Mobile session check notice:", err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveSession = useCallback((authData) => {
    if (authData?.token) {
      localStorage.setItem("token", authData.token);
      setToken(authData.token);
      setUser(authData.user);
    }
  }, []);

  const logout = useCallback(() => {
    NativeService.triggerHaptic("medium");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  // 1-Click Demo Login
  const loginAsDemo = useCallback(
    async (role = "PASSENGER") => {
      setLoading(true);
      NativeService.triggerHaptic("success");
      try {
        const emailMap = {
          PASSENGER: "passenger@smarttaxi.io",
          DRIVER: "driver@smarttaxi.io",
          ADMIN: "admin@smarttaxi.io",
        };

        const res = await api.post("/auth/login", {
          email: emailMap[role] || "passenger@smarttaxi.io",
          password: "password123",
        });

        saveSession(res.data);
        return { success: true, user: res.data.user };
      } catch (err) {
        console.warn("Backend unavailable, using simulated mobile session:", err.message);
        const mockUser = {
          id: role === "ADMIN" ? 3 : role === "DRIVER" ? 2 : 1,
          name:
            role === "ADMIN"
              ? "Commander Alex Reynolds"
              : role === "DRIVER"
              ? "Marcus Vance"
              : "Elena Rostova",
          email: `${role.toLowerCase()}@smarttaxi.io`,
          phone: "+1 (555) 234-5678",
          role: role.toUpperCase(),
          status: "ACTIVE",
          safetyScore: 99,
          avatar:
            role === "ADMIN"
              ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
              : role === "DRIVER"
              ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          emergencyContacts: [
            { name: "David Rostova (Brother)", phone: "+1 (555) 998-1122", relation: "Sibling" },
            { name: "Sarah Jenkins (Colleague)", phone: "+1 (555) 334-8899", relation: "Emergency Contact" },
          ],
        };
        setUser(mockUser);
        setToken("mock-jwt-mobile-token");
        return { success: true, user: mockUser };
      } finally {
        setLoading(false);
      }
    },
    [saveSession]
  );

  const updateUserData = useCallback((updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user || !!token,
        role: user?.role || "PASSENGER",
        saveSession,
        logout,
        loginAsDemo,
        updateUserData,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export default AuthContext;
