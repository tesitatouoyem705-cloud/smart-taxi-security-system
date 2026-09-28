const { sequelize } = require("./database");
const User = require("../models/User");
const Taxi = require("../models/Taxi");
const { hashPassword } = require("../services/authService");

const driversData = [
  { name: "Jean-Paul Mbida", email: "driver1@smarttaxi.io", phone: "+237 671 00 00 01", model: "Toyota Corolla E120", plate: "LT-842-CE", color: "Yellow Fleet", code: "TX-901", lat: 3.8148, lng: 11.5565 },
  { name: "Samuel Eto'o Bikélé", email: "driver2@smarttaxi.io", phone: "+237 671 00 00 02", model: "Toyota Avensis Security", plate: "CE-431-BA", color: "Yellow Fleet", code: "TX-902", lat: 3.8125, lng: 11.5592 },
  { name: "Dieudonné Ndongo", email: "driver3@smarttaxi.io", phone: "+237 671 00 00 03", model: "Toyota Carina E Safety", plate: "LT-882-NW", color: "Yellow Fleet", code: "TX-903", lat: 3.8162, lng: 11.5540 },
  { name: "Alphonse Fotso", email: "driver4@smarttaxi.io", phone: "+237 671 00 00 04", model: "Toyota Yaris Sedan Patrol", plate: "CE-556-YA", color: "Yellow Fleet", code: "TX-904", lat: 3.8105, lng: 11.5608 },
  { name: "Amadou Bello", email: "driver5@smarttaxi.io", phone: "+237 671 00 00 05", model: "Toyota Rav4 Shield Edition", plate: "NO-310-AD", color: "Yellow Fleet", code: "TX-905", lat: 3.8175, lng: 11.5615 },
  { name: "Joseph Kamga", email: "driver6@smarttaxi.io", phone: "+237 671 00 00 06", model: "Hyundai Elantra Hybrid", plate: "OU-774-LT", color: "Yellow Fleet", code: "TX-906", lat: 3.8200, lng: 11.5510 },
  { name: "Brice Tientcheu", email: "driver7@smarttaxi.io", phone: "+237 671 00 00 07", model: "Nissan Sunny Armor Ed.", plate: "CE-662-EN", color: "Yellow Fleet", code: "TX-907", lat: 3.8667, lng: 11.5167 },
  { name: "Michel Ondoua", email: "driver8@smarttaxi.io", phone: "+237 671 00 00 08", model: "Peugeot 301 Security", plate: "CE-908-AB", color: "Yellow Fleet", code: "TX-908", lat: 3.8820, lng: 11.5210 },
  { name: "Fabrice Atangana", email: "driver9@smarttaxi.io", phone: "+237 671 00 00 09", model: "Toyota Camry Security", plate: "LT-194-CE", color: "Yellow Fleet", code: "TX-909", lat: 3.8910, lng: 11.5130 },
  { name: "Célestin Nguemo", email: "driver10@smarttaxi.io", phone: "+237 671 00 00 10", model: "Renault Duster Patrol", plate: "CE-825-KL", color: "Yellow Fleet", code: "TX-910", lat: 3.8780, lng: 11.5360 },
];

const passengersData = [
  { name: "Elena Rostova", email: "passenger1@smarttaxi.io", phone: "+1 (555) 022-0001" },
  { name: "Michael Brown", email: "passenger2@smarttaxi.io", phone: "+1 (555) 022-0002" },
  { name: "Sarah Jenkins", email: "passenger3@smarttaxi.io", phone: "+1 (555) 022-0003" },
  { name: "Daniel Lee", email: "passenger4@smarttaxi.io", phone: "+1 (555) 022-0004" },
  { name: "Chloe Dupont", email: "passenger5@smarttaxi.io", phone: "+1 (555) 022-0005" },
  { name: "Tariq Sterling", email: "passenger6@smarttaxi.io", phone: "+1 (555) 022-0006" },
  { name: "Olivia Garcia", email: "passenger7@smarttaxi.io", phone: "+1 (555) 022-0007" },
  { name: "Noah Campbell", email: "passenger8@smarttaxi.io", phone: "+1 (555) 022-0008" },
  { name: "Emily Zhang", email: "passenger9@smarttaxi.io", phone: "+1 (555) 022-0009" },
  { name: "Lucas Ferreira", email: "passenger10@smarttaxi.io", phone: "+1 (555) 022-0010" },
];

async function seed10And10Accounts() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database. Seeding 10 Cameroon drivers and 10 passengers...");

    const commonPasswordHash = await hashPassword("password123");

    // Seed 10 Drivers
    for (const d of driversData) {
      let [user, created] = await User.findOrCreate({
        where: { email: d.email },
        defaults: {
          name: d.name,
          email: d.email,
          phone: d.phone,
          password: commonPasswordHash,
          role: "DRIVER",
          status: "ACTIVE",
          safetyScore: 98,
          isOnline: true,
          vehicleInfo: JSON.stringify({
            model: d.model,
            plateNumber: d.plate,
            color: d.color,
            rating: 4.95,
            totalTrips: 850
          })
        }
      });

      if (!created) {
        await user.update({
          name: d.name,
          phone: d.phone,
          password: commonPasswordHash,
          status: "ACTIVE",
          vehicleInfo: JSON.stringify({
            model: d.model,
            plateNumber: d.plate,
            color: d.color,
            rating: 4.95,
            totalTrips: 850
          })
        });
      }

      // Link or create taxi in US (New York City)
      const lat = d.lat || 40.7580;
      const lng = d.lng || -73.9855;

      const [taxi, taxiCreated] = await Taxi.findOrCreate({
        where: { vehicleNumber: d.code },
        defaults: {
          vehicleNumber: d.code,
          registrationNumber: d.plate,
          model: d.model,
          color: d.color,
          qrCode: `QR_SECURE_${d.code}`,
          driverId: user.id,
          driverName: d.name,
          driverPhone: d.phone,
          rating: 4.95,
          currentLatitude: lat,
          currentLongitude: lng,
          status: "ACTIVE",
          safetyEquipped: true,
          lastInspection: "2026-09-01"
        }
      });

      if (!taxiCreated) {
        await taxi.update({
          registrationNumber: d.plate,
          model: d.model,
          color: d.color,
          driverName: d.name,
          driverPhone: d.phone,
          currentLatitude: lat,
          currentLongitude: lng
        });
      }
      console.log(`✓ Driver: ${d.email} (${d.name}) - NYC (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }

    // Seed 10 Passengers
    for (const p of passengersData) {
      let [user, created] = await User.findOrCreate({
        where: { email: p.email },
        defaults: {
          name: p.name,
          email: p.email,
          phone: p.phone,
          password: commonPasswordHash,
          role: "PASSENGER",
          status: "ACTIVE",
          safetyScore: 100,
          emergencyContacts: JSON.stringify([
            { name: "Emergency Contact 1", phone: "+1 (555) 911-0001", relation: "Family" },
            { name: "Emergency Contact 2", phone: "+1 (555) 911-0002", relation: "Friend" }
          ])
        }
      });

      if (!created) {
        await user.update({ password: commonPasswordHash, status: "ACTIVE" });
      }
      console.log(`✓ Passenger: ${p.email} (${p.name})`);
    }

    console.log("🎉 All 10 Driver and 10 Passenger accounts seeded successfully with password 'password123'!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
}

seed10And10Accounts();
