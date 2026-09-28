const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const { authenticateToken } = require("../middleware/auth");

// Public trip tracking (for shared link recipients)
router.get("/public/:token", tripController.getPublicTrip);

// Authenticated trip routes
router.use(authenticateToken);

router.get("/active", tripController.getActiveTrip);
router.get("/", tripController.getTrips);
router.get("/:id", tripController.getTripById);
router.post("/", tripController.createTrip);
router.put("/:id/accept", tripController.acceptTrip);
router.put("/:id/start", tripController.startTrip);
router.put("/:id/location", tripController.updateLocation);
router.post("/:id/sos", tripController.triggerSOS);
router.post("/:id/share", tripController.shareTrip);
router.put("/:id/end", tripController.endTrip);
router.put("/:id/cancel", tripController.cancelTrip);
router.post("/:id/rate", tripController.rateDriver);

module.exports = router;