const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidentController");
const { authenticateToken } = require("../middleware/auth");

router.use(authenticateToken);

router.get("/", incidentController.getIncidents);
router.post("/sos", incidentController.triggerStandaloneSOS);
router.get("/:id", incidentController.getIncidentById);
router.post("/", incidentController.createIncident);
router.put("/:id/status", incidentController.updateIncidentStatus);


module.exports = router;