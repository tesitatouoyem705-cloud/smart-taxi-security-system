const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");

// Public plans and webhook
router.get("/plans", paymentController.getPlans);
router.post("/webhook", paymentController.webhook);

// Authenticated payment actions
router.post("/initiate", authenticate, paymentController.initiatePayment);
router.post("/verify", authenticate, paymentController.verifyPayment);
router.get("/status", authenticate, paymentController.getPaymentStatus);

module.exports = router;
