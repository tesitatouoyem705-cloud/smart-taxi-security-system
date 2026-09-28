const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

// Public KPI stats
router.get("/stats", userController.getSystemStats);

// Authenticated user routes
router.use(authenticateToken);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);
router.get("/", userController.getAllUsers);
router.put("/:id/status", userController.updateUserStatus);

module.exports = router;