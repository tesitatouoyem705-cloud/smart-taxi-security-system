const User = require("../models/User");
const Taxi = require("../models/Taxi");
const Trip = require("../models/Trip");
const Incident = require("../models/Incident");
const { hashPassword } = require("../services/authService");

async function seedInitialData() {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      console.log("🌱 Seeding initial demo users and fleet...");

      const defaultPassword = await hashPassword("password123");

      // 1. Create Passenger
      const passenger = await User.create({
        name: "Elena Rostova",
        email: "passenger@smarttaxi.io",
        phone: "+1 (555) 234-5678",
        password: defaultPassword,
        role: "PASSENGER",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        safetyScore: 99,
        emergencyContacts: JSON.stringify([
          { name: "David Rostova (Brother)", phone: "+1 (555) 998-1122", relation: "Sibling" },
          { name: "Sarah Jenkins (Colleague)", phone: "+1 (555) 334-8899", relation: "Emergency Contact" }
        ])
      });

      // 2. Create Driver
      const driver = await User.create({
        name: "Marcus Vance",
        email: "driver@smarttaxi.io",
        phone: "+1 (555) 876-5432",
        password: defaultPassword,
        role: "DRIVER",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        safetyScore: 98,
        isOnline: true,
        vehicleInfo: JSON.stringify({
          model: "Toyota Camry Hybrid 2024",
          plateNumber: "NYC-7842-TX",
          color: "Midnight Blue",
          rating: 4.92,
          totalTrips: 1420
        })
      });

      // 3. Create Admin
      const admin = await User.create({
        name: "Commander Alex Reynolds",
        email: "admin@smarttaxi.io",
        phone: "+1 (555) 100-9999",
        password: defaultPassword,
        role: "ADMIN",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        safetyScore: 100
      });

      // 4. Create Fleet of Taxis in Cameroon (Yaoundé)
      const taxi1 = await Taxi.create({
        vehicleNumber: "TX-901",
        registrationNumber: "CE-842-LT",
        model: "Toyota Yaris Yellow Taxi",
        color: "Cameroon Taxi Yellow",
        qrCode: "QR_TAXI_901_SECURE_AUTH",
        driverId: driver.id,
        driverName: "Jean-Paul Mbida",
        rating: 4.95,
        currentLatitude: 3.8667,
        currentLongitude: 11.5167,
        status: "ACTIVE",
        safetyEquipped: true,
        lastInspection: "2026-08-15"
      });

      await Taxi.create({
        vehicleNumber: "TX-902",
        registrationNumber: "CE-319-NW",
        model: "Toyota Corolla Hybrid Security Edition",
        color: "Cameroon Taxi Yellow",
        qrCode: "QR_TAXI_902_SECURE_AUTH",
        driverName: "Amina Ngono",
        rating: 4.96,
        currentLatitude: 3.8833,
        currentLongitude: 11.5167,
        status: "ACTIVE",
        safetyEquipped: true,
        lastInspection: "2026-08-20"
      });

      await Taxi.create({
        vehicleNumber: "TX-903",
        registrationNumber: "LT-882-OU",
        model: "Toyota RAV4 Rapid Response Police Interceptor",
        color: "Security Navy & Yellow",
        qrCode: "QR_TAXI_903_SECURE_AUTH",
        driverName: "Samuel Eto'o Junior",
        rating: 4.88,
        currentLatitude: 3.8750,
        currentLongitude: 11.5350,
        status: "ON_TRIP",
        safetyEquipped: true,
        lastInspection: "2026-08-10"
      });

      // 5. Create Active Trip in Yaoundé, Cameroon
      const activeTrip = await Trip.create({
        passengerId: passenger.id,
        passengerName: "Elena Rostova",
        driverId: driver.id,
        driverName: "Jean-Paul Mbida",
        taxiId: taxi1.id,
        pickupAddress: "Rond-Point Nlongkak, Yaoundé",
        dropoffAddress: "Carrefour Bastos, Yaoundé",
        startLatitude: 3.8820,
        startLongitude: 11.5210,
        dropoffLatitude: 3.8910,
        dropoffLongitude: 11.5130,
        currentLatitude: 3.8750,
        currentLongitude: 11.5190,
        fare: 2500,
        distanceKm: 3.8,
        durationMin: 14,
        sharingEnabled: true,
        shareToken: "demo-live-share-token-2026",
        status: "IN_TRANSIT"
      });

      // 6. Create Demo Incidents
      await Incident.create({
        incidentCode: "INC-2026-0801",
        reporterId: passenger.id,
        reporterName: "Elena Rostova",
        reporterRole: "PASSENGER",
        passengerId: passenger.id,
        driverId: driver.id,
        taxiId: taxi1.id,
        tripId: activeTrip.id,
        type: "ROUTE_DEVIATION",
        severity: "MEDIUM",
        description: "Driver took an unauthorized side alley avoiding the GPS recommended expressway. AI safety guardian detected a 1.2km route deviation anomaly.",
        locationAddress: "Avenue Kennedy & Boulevard du 20 Mai, Yaoundé",
        latitude: 3.8680,
        longitude: 11.5170,
        status: "UNDER_REVIEW"
      });

      await Incident.create({
        incidentCode: "INC-2026-0789",
        reporterId: passenger.id,
        reporterName: "Elena Rostova",
        reporterRole: "PASSENGER",
        type: "LOST_ITEM",
        severity: "LOW",
        description: "Left silver iPhone 16 Pro on back seat after 11 PM trip.",
        locationAddress: "Poste Centrale Entrance, Yaoundé",
        latitude: 3.8665,
        longitude: 11.5160,
        status: "RESOLVED",
        resolutionNotes: "Item retrieved by dispatch office and returned safely to passenger."
      });

      console.log("✅ Seeding completed! Demo accounts ready: passenger@smarttaxi.io / driver@smarttaxi.io / admin@smarttaxi.io (pass: password123)");
    }

    // Always ensure existing fleet taxis and trips are updated to US (New York City) coordinates
    await Taxi.update(
      {
        currentLatitude: 40.7580,
        currentLongitude: -73.9855,
        registrationNumber: "NYC-7842-TX",
        driverName: "Marcus Vance",
        model: "Toyota Camry Hybrid Security Ed."
      },
      { where: { vehicleNumber: "TX-901" } }
    );
    await Taxi.update(
      {
        currentLatitude: 40.7648,
        currentLongitude: -73.9735,
        registrationNumber: "NYC-4319-TX",
        driverName: "Sophia Chen",
        model: "Tesla Model Y Security Edition"
      },
      { where: { vehicleNumber: "TX-902" } }
    );
    await Taxi.update(
      {
        currentLatitude: 40.7527,
        currentLongitude: -73.9772,
        registrationNumber: "NYC-8821-TX",
        driverName: "Carlos Mendez",
        model: "Ford Explorer Interceptor"
      },
      { where: { vehicleNumber: "TX-903" } }
    );
    await Trip.update(
      {
        pickupAddress: "Times Square, Broadway & 42nd St, NY",
        dropoffAddress: "Grand Central Terminal, Park Ave, NY",
        startLatitude: 40.7580,
        startLongitude: -73.9855,
        currentLatitude: 40.7558,
        currentLongitude: -73.9818,
        dropoffLatitude: 40.7527,
        dropoffLongitude: -73.9772
      },
      { where: { status: "IN_TRANSIT" } }
    );
    console.log("🇺🇸 [SafeRide Fleet] Coordinates & City mapped to United States (New York City)!");
  } catch (err) {
    console.warn("Seeding notice:", err.message);
  }
}

module.exports = { seedInitialData };

