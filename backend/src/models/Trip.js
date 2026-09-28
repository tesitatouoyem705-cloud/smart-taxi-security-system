const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "Trip",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    passengerId: { type: DataTypes.INTEGER, allowNull: false },
    passengerName: { type: DataTypes.STRING },
    driverId: { type: DataTypes.INTEGER },
    driverName: { type: DataTypes.STRING },
    taxiId: { type: DataTypes.INTEGER },
    pickupAddress: { type: DataTypes.STRING, defaultValue: "Rond-Point Nlongkak, Yaoundé" },
    dropoffAddress: { type: DataTypes.STRING, defaultValue: "Carrefour Bastos, Yaoundé" },
    startLatitude: { type: DataTypes.DECIMAL(10, 7), defaultValue: 3.8820 },
    startLongitude: { type: DataTypes.DECIMAL(10, 7), defaultValue: 11.5210 },
    dropoffLatitude: { type: DataTypes.DECIMAL(10, 7), defaultValue: 3.8910 },
    dropoffLongitude: { type: DataTypes.DECIMAL(10, 7), defaultValue: 11.5130 },
    currentLatitude: { type: DataTypes.DECIMAL(10, 7), defaultValue: 3.8750 },
    currentLongitude: { type: DataTypes.DECIMAL(10, 7), defaultValue: 11.5190 },
    fare: { type: DataTypes.FLOAT, defaultValue: 24.50 },
    distanceKm: { type: DataTypes.FLOAT, defaultValue: 4.8 },
    durationMin: { type: DataTypes.INTEGER, defaultValue: 15 },
    sharingEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    shareToken: { type: DataTypes.STRING, unique: true },
    sosTriggered: { type: DataTypes.BOOLEAN, defaultValue: false },
    driverRating: { type: DataTypes.INTEGER },
    driverReview: { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM("REQUESTED", "ACCEPTED", "IN_TRANSIT", "COMPLETED", "CANCELLED"),
      defaultValue: "REQUESTED"
    }
  },
  { tableName: "trips", timestamps: true }
);
