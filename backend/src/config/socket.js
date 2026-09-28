const { Server } = require("socket.io");
let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    // Join a specific trip room
    socket.on("join-trip", (tripId) => {
      if (tripId) {
        socket.join(`trip:${tripId}`);
        socket.emit("joined-trip", { tripId });
      }
    });

    // In-trip messaging between passenger and driver
    socket.on("trip:message", (data) => {
      if (data?.tripId) {
        const messagePayload = {
          id: Date.now(),
          tripId: data.tripId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderRole: data.senderRole,
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        io.to(`trip:${data.tripId}`).emit("trip:message", messagePayload);
      }
    });

    // Real-time trip GPS tracking
    socket.on("trip-location", (data) => {
      if (data?.tripId) {
        io.to(`trip:${data.tripId}`).emit("trip-location", {
          tripId: data.tripId,
          latitude: data.latitude,
          longitude: data.longitude,
          heading: data.heading || 0,
          speed: data.speed || 38,
          timestamp: Date.now()
        });
      }
    });

    // Emergency SOS Trigger
    socket.on("emergency:sos", (data) => {
      io.emit("emergency:sos-alert", {
        ...data,
        timestamp: new Date().toISOString()
      });
      if (data?.tripId) {
        io.to(`trip:${data.tripId}`).emit("emergency:sos-alert", data);
      }
    });

    // Driver availability toggle
    socket.on("driver:status-change", (data) => {
      io.emit("driver:status-updated", data);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIO };
