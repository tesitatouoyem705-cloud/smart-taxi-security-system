const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/smart_taxi_security", { dialect: "postgres", logging: false });
async function connectDatabase() { await sequelize.authenticate(); console.log("PostgreSQL connected"); }
module.exports = { sequelize, connectDatabase };
