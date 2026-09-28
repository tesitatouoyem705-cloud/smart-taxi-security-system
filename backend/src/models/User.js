const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

module.exports = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    phone: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("PASSENGER", "DRIVER", "ADMIN"),
      defaultValue: "PASSENGER"
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED", "BLOCKED"),
      defaultValue: "ACTIVE"
    },
    avatar: { type: DataTypes.STRING },
    safetyScore: { type: DataTypes.INTEGER, defaultValue: 98 },
    isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
    twoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    emergencyContacts: { type: DataTypes.TEXT, defaultValue: "[]" }, // JSON stringified array
    vehicleInfo: { type: DataTypes.TEXT, defaultValue: "{}" }, // JSON stringified object for drivers
    isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
    paymentPlan: { type: DataTypes.STRING, defaultValue: null },
    subscriptionExpiresAt: { type: DataTypes.DATE, defaultValue: null },
    lastTransactionId: { type: DataTypes.STRING, defaultValue: null }
  },
  { tableName: "users", timestamps: true }
);
