const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "Taxi",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    vehicleNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    registrationNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    model: { type: DataTypes.STRING, defaultValue: "Toyota Camry Hybrid" },
    color: { type: DataTypes.STRING, defaultValue: "Midnight Blue" },
    qrCode: { type: DataTypes.STRING, unique: true, allowNull: false },
    driverId: { type: DataTypes.INTEGER },
    driverName: { type: DataTypes.STRING, defaultValue: "Marcus Vance" },
    rating: { type: DataTypes.FLOAT, defaultValue: 4.9 },
    currentLatitude: { type: DataTypes.DECIMAL(10, 7), defaultValue: 3.8480 },
    currentLongitude: { type: DataTypes.DECIMAL(10, 7), defaultValue: 11.5021 },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "ON_TRIP", "MAINTENANCE"),
      defaultValue: "ACTIVE"
    },
    safetyEquipped: { type: DataTypes.BOOLEAN, defaultValue: true },
    lastInspection: { type: DataTypes.STRING, defaultValue: "2026-08-01" }
  },
  { tableName: "taxis", timestamps: true }
);
