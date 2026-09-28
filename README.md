# SafeRide — Smart Taxi Security System

A smart security and telemetry monitoring system with real-time GPS tracking, QR taxi verification, emergency SOS beacons, and cross-platform mobile frontend.

- **Mobile App**: Flutter (iOS, Android, Web, Windows) in [`mobile/`](./mobile)
- **Web App**: React + Vite in [`frontend/`](./frontend)
- **Backend API & WebSockets**: Node.js + Express + Sequelize (PostgreSQL) + Socket.io in [`backend/`](./backend)

---

## 🔑 Test Accounts (Password for all: `password123`)

All 20 accounts are pre-seeded in the database with active roles and security credentials.

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

| # | Name | Email | Password | Role | Phone | Safety Score |
|---|------|-------|----------|------|-------|--------------|
| 1 | Elena Rostova | `passenger1@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0001 | 100 |
| 2 | Michael Brown | `passenger2@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0002 | 100 |
| 3 | Sarah Jenkins | `passenger3@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0003 | 100 |
| 4 | Daniel Lee | `passenger4@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0004 | 100 |
| 5 | Chloe Dupont | `passenger5@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0005 | 100 |
| 6 | Tariq Sterling | `passenger6@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0006 | 100 |
| 7 | Olivia Garcia | `passenger7@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0007 | 100 |
| 8 | Noah Campbell | `passenger8@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0008 | 100 |
| 9 | Emily Zhang | `passenger9@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0009 | 100 |
| 10 | Lucas Ferreira | `passenger10@smarttaxi.io` | `password123` | PASSENGER | +1 (555) 022-0010 | 100 |

---

## 🛡️ Admin Account
- **Email**: `admin@smarttaxi.io`
- **Password**: `password123`
- **Role**: ADMIN

---

## 🚀 Running the Project

### 1. Backend Server
```powershell
cd backend
npm.cmd run dev
```

### 2. Flutter Mobile App
```powershell
cd mobile
flutter run -d chrome
# or
flutter run -d edge
# or
flutter run -d windows
```
