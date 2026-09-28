const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    transactionId: { type: DataTypes.STRING, unique: true, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false }, // in XAF
    currency: { type: DataTypes.STRING, defaultValue: "XAF" },
    customerPhone: { type: DataTypes.STRING, allowNull: false },
    operator: {
      type: DataTypes.ENUM("MTN_MOMO", "ORANGE_MONEY", "CARD"),
      defaultValue: "MTN_MOMO"
    },
    plan: {
      type: DataTypes.ENUM("DAILY_PASS", "WEEKLY_PASS", "MONTHLY_VIP"),
      defaultValue: "DAILY_PASS"
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      defaultValue: "pending"
    },
    digiPayRef: { type: DataTypes.STRING },
    message: { type: DataTypes.STRING },
    metadata: { type: DataTypes.TEXT, defaultValue: "{}" }
  },
  { tableName: "payments", timestamps: true }
);

module.exports = Payment;
