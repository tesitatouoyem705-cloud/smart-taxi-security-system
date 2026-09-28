import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

    const newSocket = io(socketUrl, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const joinTripRoom = (tripId) => {
    if (socketRef.current && tripId) {
      socketRef.current.emit("join-trip", tripId);
    }
  };

  const sendTripMessage = (tripId, text) => {
    if (socketRef.current && tripId && text) {
      socketRef.current.emit("trip:message", {
        tripId,
        text,
        senderId: user?.id,
        senderName: user?.name,
        senderRole: user?.role
      });
    }
  };

  const broadcastLocation = (tripId, latitude, longitude) => {
    if (socketRef.current && tripId) {
      socketRef.current.emit("trip-location", {
        tripId,
        latitude,
        longitude
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinTripRoom,
        sendTripMessage,
        broadcastLocation
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
