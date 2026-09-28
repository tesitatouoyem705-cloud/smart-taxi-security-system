const express = require("express");
const cors = require("cors");

const app = express();

// Configure CORS to handle local dev origins, preflight requests, and custom frontends
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => res.json({
  service: "SafeRide Smart Taxi Security API",
  status: "UP",
  message: "Server is running. Please append specific endpoints to /api/",
  availableEndpoints: {
    health: "GET /status",
    login: "POST /api/auth/login",
    register: "POST /api/auth/register",
    taxis: "GET /api/taxis",
    sos: "POST /api/incidents/sos",
    stats: "GET /api/users/stats",
    qrScan: "POST /api/qr/scan"
  }
}));

app.get("/api", (req, res) => res.json({
  message: "SafeRide API Base Path",
  availableEndpoints: {
    login: "POST /api/auth/login",
    register: "POST /api/auth/register",
    taxis: "GET /api/taxis",
    sos: "POST /api/incidents/sos",
    stats: "GET /api/users/stats",
    qrScan: "POST /api/qr/scan"
  }
}));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/taxis", require("./routes/taxiRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/incidents", require("./routes/incidentRoutes"));
app.use("/api/qr", require("./routes/qrRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

app.use((req, res) => res.status(404).json({
  message: `Route '${req.method} ${req.originalUrl}' not found. Please check HTTP method and URL path.`
}));
app.use(require("./middleware/errorHandler").errorHandler);

module.exports = app;
