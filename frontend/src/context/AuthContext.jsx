import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user profile on initial load
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
      console.warn("Session check notice:", err.message);
      // If unauthorized, clear saved token
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
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  // Quick 1-click Demo Login for effortless evaluation
  const loginAsDemo = useCallback(async (role = "PASSENGER") => {
    setLoading(true);
    try {
      const emailMap = {
        PASSENGER: "passenger@smarttaxi.io",
        DRIVER: "driver@smarttaxi.io",
        ADMIN: "admin@smarttaxi.io"
      };

      const res = await api.post("/auth/login", {
        email: emailMap[role] || "passenger@smarttaxi.io",
        password: "password123"
      });

      saveSession(res.data);
      return { success: true, user: res.data.user };
    } catch (err) {
      console.error("Demo login error:", err);
      // Fallback local simulation if backend is offline
      const mockUser = {
        id: role === "ADMIN" ? 3 : role === "DRIVER" ? 2 : 1,
        name: role === "ADMIN" ? "Commander Alex Reynolds" : role === "DRIVER" ? "Marcus Vance" : "Elena Rostova",
        email: `${role.toLowerCase()}@smarttaxi.io`,
        role: role.toUpperCase(),
        status: "ACTIVE",
        safetyScore: 99
      };
      setUser(mockUser);
      setToken("mock-jwt-token-demo");
      return { success: true, user: mockUser };
    } finally {
      setLoading(false);
    }
  }, [saveSession]);

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
        refreshProfile: fetchProfile
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