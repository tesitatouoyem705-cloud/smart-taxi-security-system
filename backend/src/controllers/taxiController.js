const Taxi = require("../models/Taxi");

async function getTaxis(req, res, next) {
  try {
    const taxis = await Taxi.findAll({ order: [["createdAt", "DESC"]] });
    res.json(taxis);
  } catch (e) {
    next(e);
  }
}

async function getTaxiById(req, res, next) {
  try {
    const taxi = await Taxi.findByPk(req.params.id);
    if (!taxi) return res.status(404).json({ message: "Taxi not found" });
    res.json(taxi);
  } catch (e) {
    next(e);
  }
}

async function updateTaxiLocation(req, res, next) {
  try {
    const { latitude, longitude, status } = req.body;
    const taxi = await Taxi.findByPk(req.params.id);
    if (!taxi) return res.status(404).json({ message: "Taxi not found" });

    await taxi.update({
      currentLatitude: latitude !== undefined ? latitude : taxi.currentLatitude,
      currentLongitude: longitude !== undefined ? longitude : taxi.currentLongitude,
      status: status || taxi.status
    });

    res.json(taxi);
  } catch (e) {
    next(e);
  }
}

module.exports = { getTaxis, getTaxiById, updateTaxiLocation };