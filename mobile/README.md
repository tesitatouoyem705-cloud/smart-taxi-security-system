# Smart Taxi Security System - Flutter Mobile App

A cross-platform **Flutter mobile application** (iOS & Android) for passenger & driver safety, verified taxi boarding, real-time GPS telemetry tracking, and one-touch SOS emergency broadcasting.

---

## Architecture & Code Structure

```
mobile/
├── pubspec.yaml                  # Flutter package dependencies
├── android/                      # Android native configuration & permissions
├── ios/                          # iOS native configuration & permissions
├── lib/
│   ├── main.dart                 # Application entry point with MultiProvider & Theme routing
│   ├── constants/
│   │   ├── api_endpoints.dart    # Configurable backend REST API endpoints & Socket.IO URL
│   │   └── app_colors.dart       # Sleek dark and light theme palettes
│   ├── models/
│   │   ├── user_model.dart       # Passenger, Driver, Admin profile & Emergency contacts
│   │   ├── taxi_model.dart       # Taxi credentials, plate numbers, driver ratings & safety equipment
│   │   ├── trip_model.dart       # Active trip state, GPS coordinates, fares & status
│   │   ├── incident_model.dart   # Security reports & police investigation status
│   │   └── chat_message_model.dart # In-trip live chat messages
│   ├── services/
│   │   ├── api_service.dart      # HTTP REST client with Bearer token authentication
│   │   ├── socket_service.dart   # WebSockets for live GPS telemetry & SOS broadcast
│   │   ├── location_service.dart # Real-time device GPS position & permission handling
│   │   └── storage_service.dart  # Secure token and user profile local persistence
│   ├── providers/
│   │   ├── auth_provider.dart    # Authentication, role switching (Passenger/Driver), auto-login
│   │   ├── trip_provider.dart    # Trip state, simulated/live GPS telemetry, rating & chat
│   │   ├── taxi_provider.dart    # Nearby verified taxis & QR verification logic
│   │   ├── incident_provider.dart# Incident submission & history
│   │   ├── sos_provider.dart     # 3-second countdown panic trigger & emergency dialing
│   │   └── theme_provider.dart   # Dynamic dark/light mode toggle
│   ├── screens/
│   │   ├── splash_screen.dart    # Launch screen with auto-login check
│   │   ├── main_navigation_screen.dart # Bottom navigation bar
│   │   ├── auth/
│   │   │   ├── login_screen.dart # Login with demo accounts & server IP configurator
│   │   │   └── register_screen.dart # Passenger / Driver signup with emergency contacts
│   │   ├── passenger/
│   │   │   ├── passenger_home_screen.dart # Map with nearby verified taxis & quick scan
│   │   │   ├── qr_scan_screen.dart   # Camera QR scanner for taxi window badges
│   │   │   └── taxi_verification_sheet.dart # Verified driver credentials modal
│   │   ├── trip/
│   │   │   ├── live_trip_screen.dart # Real-time trip map, shareable link & SOS trigger
│   │   │   ├── trip_history_screen.dart # Historical trips & driver ratings
│   │   │   └── trip_chat_modal.dart  # In-trip chat between passenger & driver
│   │   ├── driver/
│   │   │   └── driver_dashboard_screen.dart # Driver online/offline toggle, ride requests & GPS broadcast
│   │   ├── emergency/
│   │   │   ├── sos_dialog.dart       # Armed SOS panic modal with countdown abort
│   │   │   ├── report_incident_screen.dart # Security complaint submission
│   │   │   └── incidents_list_screen.dart # Incident tracking
│   │   └── profile/
│   │       ├── profile_screen.dart   # Profile settings, dark mode & server host settings
│   │       └── emergency_contacts_screen.dart # Trusted contacts management
│   └── widgets/
│       ├── custom_button.dart
│       ├── custom_text_field.dart
│       ├── sos_button.dart       # Pulsating glowing panic button
│       ├── sos_active_banner.dart# Persistent emergency broadcast warning banner
│       ├── taxi_card.dart
│       ├── trip_card.dart
│       ├── custom_badge.dart
│       └── map_widget.dart       # Leaflet/OpenStreetMap interactive map widget
```

---

## Getting Started

### 1. Prerequisites
- **Flutter SDK** (>= 3.0.0)
- **Node.js Backend** running on port 5000 (`npm run dev` in the `backend` folder)

### 2. Install Dependencies
```bash
cd mobile
flutter pub get
```

### 3. Backend Host Configuration
The app automatically routes to:
- **Android Emulator**: `http://10.0.2.2:5000`
- **iOS Simulator / Web / Desktop**: `http://localhost:5000`
- **Physical Device**: You can tap the **Settings** icon on the Login screen or in Profile to change the host to your computer's local Wi-Fi IP (e.g. `http://192.168.1.15:5000`).

### 4. Run the Mobile App
```bash
# To run on connected device or emulator
flutter run

# To run in Chrome for quick web preview
flutter run -d chrome
```

---

## 🔑 Test Accounts (Password for all: `password123`)

### 🚖 Driver Accounts (10 Accounts)

| # | Name | Email | Password | Role | Vehicle Model | Plate Number | Fleet Code |
|---|------|-------|----------|------|---------------|--------------|------------|
| 1 | Marcus Vance | `driver1@smarttaxi.io` | `password123` | DRIVER | Toyota Camry Hybrid | NYC-7842-TX | TX-901 |
| 2 | Sophia Chen | `driver2@smarttaxi.io` | `password123` | DRIVER | Tesla Model Y Security | NYC-4319-TX | TX-902 |
| 3 | Carlos Mendez | `driver3@smarttaxi.io` | `password123` | DRIVER | Ford Explorer Interceptor | NYC-8821-TX | TX-903 |
| 4 | Liam O'Connor | `driver4@smarttaxi.io` | `password123` | DRIVER | Hyundai Ioniq 5 Safety Ed. | NYC-5563-TX | TX-904 |
| 5 | Amara Okafor | `driver5@smarttaxi.io` | `password123` | DRIVER | Chevrolet Suburban Armor | NYC-3104-TX | TX-905 |
| 6 | Viktor Novak | `driver6@smarttaxi.io` | `password123` | DRIVER | Honda Accord Hybrid | NYC-7749-TX | TX-906 |
| 7 | Fatima Al-Mansoor | `driver7@smarttaxi.io` | `password123` | DRIVER | Nissan Ariya Security | NYC-6628-TX | TX-907 |
| 8 | David Kim | `driver8@smarttaxi.io` | `password123` | DRIVER | Toyota RAV4 Hybrid | NYC-9081-TX | TX-908 |
| 9 | Isabella Santos | `driver9@smarttaxi.io` | `password123` | DRIVER | Subaru Outback Patrol | NYC-1943-TX | TX-909 |
| 10 | James Wilson | `driver10@smarttaxi.io` | `password123` | DRIVER | Ford Escape Hybrid | NYC-8255-TX | TX-910 |

---

### 👤 Passenger Accounts (10 Accounts)

| # | Name | Email | Password | Role | Phone |
|---|------|-------|----------|------|-------|
| 1 | Elena Rostova | `passenger1@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0001 |
| 2 | Michael Brown | `passenger2@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0002 |
| 3 | Sarah Jenkins | `passenger3@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0003 |
| 4 | Daniel Lee | `passenger4@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0004 |
| 5 | Chloe Dupont | `passenger5@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0005 |
| 6 | Tariq Sterling | `passenger6@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0006 |
| 7 | Olivia Garcia | `passenger7@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0007 |
| 8 | Noah Campbell | `passenger8@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0008 |
| 9 | Emily Zhang | `passenger9@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0009 |
| 10 | Lucas Ferreira | `passenger10@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0010 |

