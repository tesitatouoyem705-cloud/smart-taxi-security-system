const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const http = require("http");
const app = require("./app");
const { connectDatabase, sequelize } = require("./config/database");
const { initSocket } = require("./config/socket");

// Ensure all models are registered
require("./models/User");
require("./models/Taxi");
require("./models/Trip");
require("./models/Incident");
require("./models/Payment");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDatabase();
    await sequelize.sync({ alter: true });
    const { seedInitialData } = require("./config/seed");
    await seedInitialData();
    const server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (e) {
    console.error("Server startup error:", e);
    process.exit(1);
  }
})();
