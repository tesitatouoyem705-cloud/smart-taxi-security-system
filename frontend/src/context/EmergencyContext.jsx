import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [activeSOSData, setActiveSOSData] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const intervalRef = useRef(null);

  // Play synthesized emergency siren without needing external sound files
  const startSirenAudio = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      let high = false;
      osc.frequency.setValueAtTime(700, ctx.currentTime);

      intervalRef.current = setInterval(() => {
        if (!oscillatorRef.current) return;
        high = !high;
        osc.frequency.setValueAtTime(high ? 960 : 650, ctx.currentTime);
      }, 350);

      osc.start();
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (err) {
      console.warn("Audio siren synthesis note:", err.message);
    }
  }, [soundEnabled]);

  const stopSirenAudio = useCallback(() => {
    try {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } catch (_) {}
  }, []);

  const triggerSOS = useCallback(async (customData = {}) => {
    setIsEmergencyActive(true);
    const sosPayload = {
      timestamp: new Date().toISOString(),
      location: customData.location || "Current GPS Location",
      tripId: customData.tripId || null,
      ...customData
    };
    setActiveSOSData(sosPayload);
    startSirenAudio();

    // Call backend SOS endpoint to notify emergency contacts & dispatch
    try {
      if (customData.tripId) {
        await api.post(`/trips/${customData.tripId}/sos`, sosPayload);
      } else {
        await api.post('/incidents/sos', {
          latitude: customData.latitude || 3.8480,
          longitude: customData.longitude || 11.5021,
          message: customData.message || "EMERGENCY SOS ALERT: Immediate assistance required!",
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("Backend SOS notification notice:", err.message);
    }
  }, [startSirenAudio]);


  const cancelEmergency = useCallback(() => {
    setIsEmergencyActive(false);
    setActiveSOSData(null);
    stopSirenAudio();
  }, [stopSirenAudio]);

  useEffect(() => {
    return () => {
      stopSirenAudio();
    };
  }, [stopSirenAudio]);

  return (
    <EmergencyContext.Provider
      value={{
        isEmergencyActive,
        activeSOSData,
        triggerSOS,
        cancelEmergency,
        soundEnabled,
        setSoundEnabled,
        toggleSound: () => setSoundEnabled((prev) => !prev)
      }}
    >
      {/* Global visual aura when Emergency Mode is active */}
      <div className={`${isEmergencyActive ? "emergency-active ring-4 ring-red-500/80 fixed inset-0 pointer-events-none z-50 transition-all duration-500" : ""}`} />
      {children}
    </EmergencyContext.Provider>
  );
}

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) throw new Error("useEmergency must be used within EmergencyProvider");
  return context;
};

export default EmergencyContext;
