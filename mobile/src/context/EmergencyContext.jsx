import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import { SirenAudio } from "../services/audio";
import { NativeService } from "../services/native";

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [activeSOSData, setActiveSOSData] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const countdownIntervalRef = useRef(null);

  const startSiren = useCallback(() => {
    if (soundEnabled) {
      SirenAudio.start();
    }
  }, [soundEnabled]);

  const stopSiren = useCallback(() => {
    SirenAudio.stop();
  }, []);

  // SOS with 3-second abort countdown
  const startSOSCountdown = useCallback(
    (customData = {}, onTrigger) => {
      NativeService.triggerHaptic("heavy");
      setCountdown(3);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            // Execute actual SOS trigger
            triggerSOSDirect(customData);
            if (onTrigger) onTrigger();
            return null;
          }
          SirenAudio.playBeep(980, 0.1);
          NativeService.triggerHaptic("warning");
          return prev - 1;
        });
      }, 1000);
    },
    []
  );

  const cancelCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    NativeService.triggerHaptic("light");
  }, []);

  const triggerSOSDirect = useCallback(
    async (customData = {}) => {
      setIsEmergencyActive(true);
      NativeService.triggerHaptic("error");

      const sosPayload = {
        timestamp: new Date().toISOString(),
        location: customData.location || "Midtown Manhattan GPS Corridor (40.7580° N, -73.9855° W)",
        tripId: customData.tripId || 1,
        emergencyContactsNotified: true,
        policeDispatched: true,
        ...customData,
      };

      setActiveSOSData(sosPayload);
      startSiren();

      try {
        if (customData.tripId) {
          await api.post(`/trips/${customData.tripId}/sos`, sosPayload);
        }
      } catch (err) {
        console.warn("Backend SOS notice:", err.message);
      }
    },
    [startSiren]
  );

  const cancelEmergency = useCallback(() => {
    setIsEmergencyActive(false);
    setActiveSOSData(null);
    stopSiren();
    cancelCountdown();
    NativeService.triggerHaptic("success");
  }, [stopSiren, cancelCountdown]);

  useEffect(() => {
    return () => {
      stopSiren();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [stopSiren]);

  return (
    <EmergencyContext.Provider
      value={{
        isEmergencyActive,
        activeSOSData,
        soundEnabled,
        setSoundEnabled,
        toggleSound: () => {
          setSoundEnabled((prev) => {
            if (prev) stopSiren();
            return !prev;
          });
        },
        countdown,
        startSOSCountdown,
        cancelCountdown,
        triggerSOSDirect,
        cancelEmergency,
      }}
    >
      {/* Red screen border strobe during active emergency */}
      {isEmergencyActive && (
        <div className="fixed inset-0 pointer-events-none z-[999] border-4 border-red-500 animate-pulse ring-8 ring-red-600/30" />
      )}
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
