const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "Incident",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    incidentCode: { type: DataTypes.STRING, unique: true, allowNull: false },
    reporterId: { type: DataTypes.INTEGER },
    reporterName: { type: DataTypes.STRING },
    reporterRole: { type: DataTypes.STRING, defaultValue: "PASSENGER" },
    passengerId: { type: DataTypes.INTEGER },
    driverId: { type: DataTypes.INTEGER },
    taxiId: { type: DataTypes.INTEGER },
    tripId: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, allowNull: false }, // "ACCIDENT", "HARASSMENT", "ROUTE_DEVIATION", "OVERSPEEDING", "LOST_ITEM", "OTHER"
    severity: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
      defaultValue: "MEDIUM"
    },
    description: { type: DataTypes.TEXT, allowNull: false },
    locationAddress: { type: DataTypes.STRING },
    latitude: { type: DataTypes.DECIMAL(10, 7) },
    longitude: { type: DataTypes.DECIMAL(10, 7) },
    mediaUrl: { type: DataTypes.TEXT },
    emergencyAlertSent: { type: DataTypes.BOOLEAN, defaultValue: false },
    resolutionNotes: { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM("REPORTED", "UNDER_REVIEW", "INVESTIGATING", "RESOLVED", "REJECTED"),
      defaultValue: "REPORTED"
    }
  },
  { tableName: "incidents", timestamps: true }
);
