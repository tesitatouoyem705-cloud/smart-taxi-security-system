const express = require("express");
const router = express.Router();
const taxiController = require("../controllers/taxiController");
const { authenticateToken } = require("../middleware/auth");

router.get("/", taxiController.getTaxis);
router.get("/:id", taxiController.getTaxiById);
router.put("/:id/location", authenticateToken, taxiController.updateTaxiLocation);

module.exports = router;