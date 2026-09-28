import React, { createContext, useContext, useEffect, useState } from "react";
import { getSocket } from "../services/socket";
import { useToast } from "./ToastContext";
import { NativeService } from "../services/native";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null);
  const [latestIncident, setLatestIncident] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
    });

    s.on("disconnect", () => {
      setConnected(false);
    });

    // Listen for real-time live telemetry
    s.on("trip_telemetry", (data) => {
      setLatestTelemetry(data);
    });

    // Listen for fleet taxi location updates
    s.on("taxi_location", (data) => {
      setLatestTelemetry((prev) => ({ ...prev, ...data }));
    });

    // Listen for SOS Emergency alarms
    s.on("emergency_sos_alert", (alert) => {
      setActiveSOS(alert);
      NativeService.triggerHaptic("error");
      addToast(
        `🚨 EMERGENCY SOS: ${alert.passengerName || "User"} triggered SOS alarm near ${alert.locationAddress || "vehicle"}!`,
        "emergency",
        8000
      );
    });

    // Listen for new Incidents
    s.on("incident_alert", (incident) => {
      setLatestIncident(incident);
      addToast(
        `⚠️ Incident logged: ${incident.type || "Security anomaly"} (${incident.severity || "MEDIUM"})`,
        "warning",
        5000
      );
    });

    return () => {
      s.off("connect");
      s.off("disconnect");
      s.off("trip_telemetry");
      s.off("taxi_location");
      s.off("emergency_sos_alert");
      s.off("incident_alert");
    };
  }, [addToast]);

  const joinTripRoom = (tripId) => {
    if (socket && tripId) {
      socket.emit("join_trip", { tripId });
    }
  };

  const leaveTripRoom = (tripId) => {
    if (socket && tripId) {
      socket.emit("leave_trip", { tripId });
    }
  };

  const sendTripTelemetry = (telemetryData) => {
    if (socket) {
      socket.emit("trip_telemetry", telemetryData);
    }
  };

  const clearActiveSOS = () => {
    setActiveSOS(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        latestTelemetry,
        activeSOS,
        latestIncident,
        joinTripRoom,
        leaveTripRoom,
        sendTripTelemetry,
        clearActiveSOS,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};

export default SocketContext;
