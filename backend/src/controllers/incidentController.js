const crypto = require("crypto");
const Incident = require("../models/Incident");
const User = require("../models/User");
const { getIO } = require("../config/socket");
const { sendIncidentAlert, notifyEmergencyContacts } = require("../services/alertService");

async function triggerStandaloneSOS(req, res, next) {
  try {
    const {
      latitude = 3.8480,
      longitude = 11.5021,
      message = "EMERGENCY SOS ALERT: Immediate assistance required!",
      tripId,
      locationAddress
    } = req.body;

    const user = await User.findByPk(req.user.id);
    const incidentCode = `SOS-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const incident = await Incident.create({
      incidentCode,
      reporterId: user ? user.id : req.user.id,
      reporterName: user ? user.name : req.user.name,
      reporterRole: user ? user.role : req.user.role,
      passengerId: req.user.role === "PASSENGER" ? req.user.id : null,
      driverId: req.user.role === "DRIVER" ? req.user.id : null,
      tripId: tripId || null,
      type: "SOS_PANIC",
      severity: "CRITICAL",
      description: message,
      locationAddress: locationAddress || "GPS Coordinates Pin",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      emergencyAlertSent: true,
      status: "REPORTED"
    });

    // Notify registered Emergency Contacts
    const contactsNotified = await notifyEmergencyContacts(user, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      message
    });

    const sosPayload = {
      incidentId: incident.id,
      incidentCode: incident.incidentCode,
      passengerId: user ? user.id : req.user.id,
      passengerName: user ? user.name : req.user.name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      message,
      contactsNotifiedCount: contactsNotified.length,
      contactsNotified,
      timestamp: new Date().toISOString()
    };

    try {
      getIO().emit("emergency:sos-alert", sosPayload);
      getIO().emit("sos_alert", sosPayload);
      getIO().emit("incident:new", incident);
      if (tripId) {
        getIO().to(`trip:${tripId}`).emit("emergency:sos-alert", sosPayload);
        getIO().to(`trip:${tripId}`).emit("sos_alert", sosPayload);
      }
    } catch (_) {}

    sendIncidentAlert(`🚨 HIGH PRIORITY SOS [${incidentCode}] from ${req.user.name} at GPS (${latitude}, ${longitude}). Emergency Contacts Notified: ${contactsNotified.length}`);

    res.status(201).json({
      message: "Emergency SOS broadcasted successfully to emergency contacts & central dispatch",
      incident,
      sos: sosPayload,
      contactsNotified
    });
  } catch (e) {
    next(e);
  }
}

async function createIncident(req, res, next) {
  try {
    const {
      type,
      severity = "MEDIUM",
      description,
      locationAddress,
      latitude,
      longitude,
      mediaUrl,
      tripId,
      taxiId,
      isEmergency = false
    } = req.body;

    const user = await User.findByPk(req.user.id);
    const incidentCode = `INC-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const incident = await Incident.create({
      incidentCode,
      reporterId: req.user.id,
      reporterName: req.user.name,
      reporterRole: req.user.role,
      passengerId: req.user.role === "PASSENGER" ? req.user.id : null,
      driverId: req.user.role === "DRIVER" ? req.user.id : null,
      tripId: tripId || null,
      taxiId: taxiId || null,
      type: type || "OTHER",
      severity: isEmergency ? "CRITICAL" : (severity || "MEDIUM"),
      description: description || "No detailed description provided.",
      locationAddress: locationAddress || "GPS Coordinates Pin",
      latitude: parseFloat(latitude) || 3.8480,
      longitude: parseFloat(longitude) || 11.5021,
      mediaUrl: mediaUrl || null,
      emergencyAlertSent: !!isEmergency,
      status: "REPORTED"
    });

    let contactsNotified = [];
    if (isEmergency || type === "SOS_PANIC") {
      contactsNotified = await notifyEmergencyContacts(user, {
        latitude: incident.latitude,
        longitude: incident.longitude,
        message: incident.description
      });
    }

    try {
      getIO().emit("incident:new", incident);
      if (isEmergency || type === "SOS_PANIC") {
        const sosPayload = {
          incidentId: incident.id,
          incidentCode: incident.incidentCode,
          type: incident.type,
          severity: "CRITICAL",
          reporterName: req.user.name,
          latitude: incident.latitude,
          longitude: incident.longitude,
          contactsNotified,
          timestamp: new Date().toISOString()
        };
        getIO().emit("emergency:sos-alert", sosPayload);
        getIO().emit("sos_alert", sosPayload);
      }
    } catch (_) {}

    if (isEmergency || type === "SOS_PANIC") {
      sendIncidentAlert(`🚨 HIGH PRIORITY INCIDENT [${incident.incidentCode}] reported by ${req.user.name}: ${incident.type} - ${incident.description.substring(0, 100)}`);
    }

    res.status(201).json({
      ...incident.toJSON(),
      contactsNotified
    });
  } catch (e) {
    next(e);
  }
}


async function getIncidents(req, res, next) {
  try {
    const where = {};
    // If not admin, only show user's own reports
    if (req.user.role !== "ADMIN") {
      where.reporterId = req.user.id;
    }

    const incidents = await Incident.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: 100
    });

    res.json(incidents);
  } catch (e) {
    next(e);
  }
}

async function getIncidentById(req, res, next) {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });
    res.json(incident);
  } catch (e) {
    next(e);
  }
}

async function updateIncidentStatus(req, res, next) {
  try {
    const { status, resolutionNotes } = req.body;
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) return res.status(404).json({ message: "Incident not found" });

    await incident.update({
      status: status || incident.status,
      resolutionNotes: resolutionNotes || incident.resolutionNotes
    });

    try {
      getIO().emit("incident:updated", incident);
    } catch (_) {}

    res.json(incident);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createIncident,
  triggerStandaloneSOS,
  getIncidents,
  getIncidentById,
  updateIncidentStatus
};

