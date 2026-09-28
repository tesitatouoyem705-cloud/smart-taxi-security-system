const crypto = require("crypto");
const Trip = require("../models/Trip");
const Taxi = require("../models/Taxi");
const User = require("../models/User");
const { validateCoordinates } = require("../services/gpsService");
const { getIO } = require("../config/socket");
const { sendIncidentAlert, notifyEmergencyContacts } = require("../services/alertService");


// 1. Request a new ride
async function createTrip(req, res, next) {
  try {
    const { pickupAddress, dropoffAddress, startLatitude, startLongitude, dropoffLatitude, dropoffLongitude, taxiId } = req.body;
    
    // Find an available taxi if not specified
    let targetTaxi = null;
    if (taxiId) {
      targetTaxi = await Taxi.findByPk(taxiId);
    } else {
      targetTaxi = await Taxi.findOne({ where: { status: "ACTIVE" } });
    }

    const startLat = parseFloat(startLatitude) || 3.8820;
    const startLng = parseFloat(startLongitude) || 11.5210;
    const endLat = parseFloat(dropoffLatitude) || 3.8910;
    const endLng = parseFloat(dropoffLongitude) || 11.5130;

    // Approximate distance in km
    const distKm = Math.max(1.2, Math.round(Math.sqrt(Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2)) * 111 * 10) / 10);
    const estFare = Math.round((2.50 + distKm * 2.20) * 100) / 100;
    const estMin = Math.max(5, Math.round(distKm * 3.5));

    const trip = await Trip.create({
      passengerId: req.user.id,
      passengerName: req.user.name || "Passenger",
      driverId: targetTaxi?.driverId || null,
      driverName: targetTaxi?.driverName || "Assigned Driver",
      taxiId: targetTaxi?.id || null,
      pickupAddress: pickupAddress || "Current GPS Location",
      dropoffAddress: dropoffAddress || "Destination",
      startLatitude: startLat,
      startLongitude: startLng,
      dropoffLatitude: endLat,
      dropoffLongitude: endLng,
      currentLatitude: startLat,
      currentLongitude: startLng,
      fare: estFare,
      distanceKm: distKm,
      durationMin: estMin,
      shareToken: crypto.randomBytes(16).toString("hex"),
      status: "REQUESTED"
    });

    try {
      getIO().emit("trip:new-request", trip);
    } catch (_) {}

    res.status(201).json(trip);
  } catch (e) {
    next(e);
  }
}

// 2. Accept a ride (Driver)
async function acceptTrip(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await trip.update({
      driverId: req.user.id,
      driverName: req.user.name,
      status: "ACCEPTED"
    });

    try {
      getIO().to(`trip:${trip.id}`).emit("trip:status-change", { tripId: trip.id, status: "ACCEPTED", trip });
      getIO().emit("trip:status-change", { tripId: trip.id, status: "ACCEPTED", trip });
    } catch (_) {}

    res.json(trip);
  } catch (e) {
    next(e);
  }
}

// 3. Start trip (Driver)
async function startTrip(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await trip.update({
      status: "IN_TRANSIT",
      sharingEnabled: true
    });

    try {
      getIO().to(`trip:${trip.id}`).emit("trip:status-change", { tripId: trip.id, status: "IN_TRANSIT", trip });
      getIO().emit("trip:status-change", { tripId: trip.id, status: "IN_TRANSIT", trip });
    } catch (_) {}

    res.json(trip);
  } catch (e) {
    next(e);
  }
}

// 4. Update real-time GPS location
async function updateLocation(req, res, next) {
  try {
    const { latitude, longitude } = req.body;
    if (!validateCoordinates(latitude, longitude)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await trip.update({
      currentLatitude: latitude,
      currentLongitude: longitude
    });

    try {
      getIO().to(`trip:${trip.id}`).emit("trip:location", {
        tripId: trip.id,
        latitude,
        longitude,
        timestamp: Date.now()
      });
    } catch (_) {}

    res.json(trip);
  } catch (e) {
    next(e);
  }
}

// 5. Emergency SOS Trigger
async function triggerSOS(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await trip.update({ sosTriggered: true });

    const passenger = await User.findByPk(trip.passengerId);

    // Notify passenger's registered Emergency Contacts
    const contactsNotified = await notifyEmergencyContacts(passenger, {
      latitude: trip.currentLatitude,
      longitude: trip.currentLongitude,
      message: `Emergency panic triggered during Trip #${trip.id} with driver ${trip.driverName}`
    });

    const sosPayload = {
      tripId: trip.id,
      passengerId: trip.passengerId,
      passengerName: trip.passengerName,
      driverName: trip.driverName,
      latitude: trip.currentLatitude,
      longitude: trip.currentLongitude,
      contactsNotifiedCount: contactsNotified.length,
      contactsNotified,
      timestamp: new Date().toISOString()
    };

    try {
      getIO().emit("emergency:sos-alert", sosPayload);
      getIO().emit("sos_alert", sosPayload);
      getIO().to(`trip:${trip.id}`).emit("emergency:sos-alert", sosPayload);
      getIO().to(`trip:${trip.id}`).emit("sos_alert", sosPayload);
    } catch (_) {}

    // Trigger SMS notification via Twilio service
    sendIncidentAlert(`🚨 EMERGENCY SOS ALERT! Passenger ${trip.passengerName} triggered SOS on Trip #${trip.id} at GPS (${trip.currentLatitude}, ${trip.currentLongitude}). Emergency contacts notified: ${contactsNotified.length}`);

    res.json({
      message: "Emergency SOS broadcasted successfully to emergency contacts & dispatch",
      sos: sosPayload,
      contactsNotified
    });
  } catch (e) {
    next(e);
  }
}


// 6. Share trip link
async function shareTrip(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (!trip.shareToken) {
      await trip.update({
        sharingEnabled: true,
        shareToken: crypto.randomBytes(16).toString("hex")
      });
    } else {
      await trip.update({ sharingEnabled: true });
    }

    res.json({ shareToken: trip.shareToken, trip });
  } catch (e) {
    next(e);
  }
}

// 7. Get public trip details by share token (No auth required)
async function getPublicTrip(req, res, next) {
  try {
    const { token } = req.params;
    const trip = await Trip.findOne({ where: { shareToken: token } });
    if (!trip) return res.status(404).json({ message: "Shared trip link is invalid or expired" });

    let taxi = null;
    if (trip.taxiId) {
      taxi = await Taxi.findByPk(trip.taxiId);
    }

    res.json({ trip, taxi });
  } catch (e) {
    next(e);
  }
}

// 8. Complete trip
async function endTrip(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await trip.update({
      status: "COMPLETED",
      currentLatitude: trip.dropoffLatitude,
      currentLongitude: trip.dropoffLongitude
    });

    try {
      getIO().to(`trip:${trip.id}`).emit("trip:status-change", { tripId: trip.id, status: "COMPLETED", trip });
      getIO().emit("trip:status-change", { tripId: trip.id, status: "COMPLETED", trip });
    } catch (_) {}

    res.json(trip);
  } catch (e) {
    next(e);
  }
}

// 9. Cancel trip
async function cancelTrip(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await trip.update({ status: "CANCELLED" });

    try {
      getIO().to(`trip:${trip.id}`).emit("trip:status-change", { tripId: trip.id, status: "CANCELLED", trip });
    } catch (_) {}

    res.json(trip);
  } catch (e) {
    next(e);
  }
}

// 10. Rate driver
async function rateDriver(req, res, next) {
  try {
    const { rating, review } = req.body;
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    await trip.update({
      driverRating: parseInt(rating) || 5,
      driverReview: review || ""
    });

    res.json({ message: "Rating submitted", trip });
  } catch (e) {
    next(e);
  }
}

// 11. Get current active trip for user
async function getActiveTrip(req, res, next) {
  try {
    const where = {};
    if (req.user.role === "DRIVER") {
      where.driverId = req.user.id;
    } else if (req.user.role === "PASSENGER") {
      where.passengerId = req.user.id;
    }

    const trip = await Trip.findOne({
      where: {
        ...where,
        status: ["REQUESTED", "ACCEPTED", "IN_TRANSIT"]
      },
      order: [["createdAt", "DESC"]]
    });

    let taxi = null;
    if (trip?.taxiId) {
      taxi = await Taxi.findByPk(trip.taxiId);
    }

    res.json({ trip: trip || null, taxi: taxi || null });
  } catch (e) {
    next(e);
  }
}

// 12. List all trips for current user or admin
async function getTrips(req, res, next) {
  try {
    const where = {};
    if (req.user.role === "DRIVER") {
      where.driverId = req.user.id;
    } else if (req.user.role === "PASSENGER") {
      where.passengerId = req.user.id;
    }

    const trips = await Trip.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: 50
    });

    res.json(trips);
  } catch (e) {
    next(e);
  }
}

// 13. Get single trip by ID
async function getTripById(req, res, next) {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    const taxi = trip.taxiId ? await Taxi.findByPk(trip.taxiId) : null;
    res.json({ trip, taxi });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  createTrip,
  acceptTrip,
  startTrip,
  updateLocation,
  triggerSOS,
  shareTrip,
  getPublicTrip,
  endTrip,
  cancelTrip,
  rateDriver,
  getActiveTrip,
  getTrips,
  getTripById
};
