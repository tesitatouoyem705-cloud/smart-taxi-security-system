import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';

import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/trip_provider.dart';
import '../../services/location_service.dart';
import '../../widgets/custom_badge.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/map_widget.dart';
import '../../widgets/sos_active_banner.dart';
import '../../widgets/sos_button.dart';
import '../emergency/sos_dialog.dart';
import '../trip/trip_chat_modal.dart';
import '../notifications/notifications_screen.dart';
import '../chat/ai_safety_chat_screen.dart';

class DriverDashboardScreen extends StatefulWidget {
  const DriverDashboardScreen({super.key});

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
  bool _isOnline = true;
  StreamSubscription<Position>? _positionSubscription;
  LatLng _driverPos = const LatLng(3.8480, 11.5021);

  @override
  void initState() {
    super.initState();
    _startLocationUpdates();
  }

  void _startLocationUpdates() {
    _positionSubscription = LocationService.getPositionStream().listen((pos) {
      if (!mounted) return;
      setState(() {
        _driverPos = LatLng(pos.latitude, pos.longitude);
      });

      final tripProvider = Provider.of<TripProvider>(context, listen: false);
      if (tripProvider.hasActiveTrip && _isOnline) {
        tripProvider.updateLocationManually(pos.latitude, pos.longitude);
      }
    });
  }

  void _showDriverQRModal(BuildContext context, UserModel? user) {
    final driverData = {
      'type': 'SAFE_RIDE_TAXI_VERIFICATION',
      'driverId': user?.id ?? 2,
      'driverName': user?.name ?? 'Marcus Vance',
      'phone': user?.phone ?? '+1 (555) 876-5432',
      'vehicleNumber': user?.vehicleNumber ?? 'TX-901',
      'registrationNumber': 'NYC-7842-TX',
      'model': 'Toyota Camry Hybrid 2024',
      'color': 'Midnight Blue',
      'rating': 4.92,
      'safetyScore': 98,
      'licenseNumber': user?.licenseNumber ?? 'LIC-NYC-99882',
      'safetyEquipped': true,
      'lastInspection': '2026-08-15',
    };

    final qrString = jsonEncode(driverData);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Column(
          children: [
            Icon(LucideIcons.qrCode, color: AppColors.taxiYellow, size: 36),
            SizedBox(height: 8),
            Text(
              'Official Taxi & Driver Safety QR',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            Text(
              'Passenger scanning verifies full driver identity & vehicle telemetry',
              style: TextStyle(color: Colors.white60, fontSize: 11),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: AppColors.taxiYellow.withOpacity(0.3), blurRadius: 15),
                ],
              ),
              child: QrImageView(
                data: qrString,
                version: QrVersions.auto,
                size: 200.0,
                backgroundColor: Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(driverData['driverName'].toString(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.success.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                        child: const Text('VERIFIED DRIVER', style: TextStyle(color: AppColors.success, fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Vehicle: ${driverData['vehicleNumber']} (${driverData['registrationNumber']})', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  Text('Model: ${driverData['model']} • ${driverData['color']}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  Text('Phone: ${driverData['phone']} • Rating: ⭐ ${driverData['rating']}', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close', style: TextStyle(color: Colors.white70)),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    super.dispose();
  }


  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final auth = Provider.of<AuthProvider>(context);
    final tripProvider = Provider.of<TripProvider>(context);
    final currentTrip = tripProvider.currentTrip;

    return Scaffold(
      body: Stack(
        children: [
          // 1. Live Map with Driver Position
          Positioned.fill(
            child: MapWidget(
              center: _driverPos,
              zoom: 15.0,
              vehicleLocation: _driverPos,
              pickupLocation: currentTrip != null ? LatLng(currentTrip.startLatitude, currentTrip.startLongitude) : null,
              dropoffLocation: currentTrip != null ? LatLng(currentTrip.dropoffLatitude, currentTrip.dropoffLongitude) : null,
              topPadding: 95,
              bottomPadding: currentTrip != null ? 330 : 160,
            ),
          ),

          // 2. Top Header with Online/Offline Toggle
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Column(
                children: [
                  const SOSActiveBanner(),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: cardBg.withOpacity(0.95),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 10),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _isOnline ? AppColors.success : AppColors.sosRed,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _isOnline ? 'ONLINE • BROADCASTING GPS' : 'OFFLINE',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                    color: _isOnline ? AppColors.success : textSecondary,
                                  ),
                                ),
                                Text(
                                  auth.user?.vehicleNumber ?? 'Plate: NYC-7842-TX',
                                  style: TextStyle(fontSize: 11, color: textSecondary),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(LucideIcons.qrCode, color: AppColors.taxiYellow, size: 20),
                            tooltip: 'Driver Safety QR Code',
                            onPressed: () => _showDriverQRModal(context, auth.user),
                          ),
                          IconButton(
                            icon: const Icon(LucideIcons.bot, color: AppColors.primary, size: 20),
                            tooltip: 'AI Safety Assistant',
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const AiSafetyChatScreen()),
                              );
                            },
                          ),

                          IconButton(
                            icon: const Badge(
                              label: Text('2', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                              backgroundColor: AppColors.primary,
                              textColor: Colors.black,
                              child: Icon(LucideIcons.bell, size: 20),
                            ),
                            tooltip: 'Alerts',
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                              );
                            },
                          ),
                          Switch(
                            value: _isOnline,
                            activeThumbColor: AppColors.success,
                            onChanged: (val) => setState(() => _isOnline = val),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 3. SOS Panic Trigger
          Positioned(
            right: 20,
            bottom: currentTrip != null ? 270 : 100,
            child: SOSButton(
              onTap: () => SOSDialog.show(context, tripId: currentTrip?.id),
            ),
          ),

          // 4. Active Trip / Incoming Request Bottom Sheet
          if (currentTrip != null)
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 16),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(LucideIcons.userCheck, color: AppColors.primary, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              currentTrip.passengerName ?? 'Passenger',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: textPrimary),
                            ),
                          ],
                        ),
                        CustomBadge(
                          text: currentTrip.status.replaceAll('_', ' '),
                          color: AppColors.primary,
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Route details
                    Text(
                      'Pickup: ${currentTrip.pickupAddress}',
                      style: TextStyle(fontSize: 13, color: textSecondary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Dropoff: ${currentTrip.dropoffAddress}',
                      style: TextStyle(fontSize: 13, color: textSecondary),
                    ),
                    const SizedBox(height: 18),

                    // Actions: Start / End / Chat
                    Row(
                      children: [
                        IconButton(
                          onPressed: () => TripChatModal.show(context),
                          style: IconButton.styleFrom(
                            backgroundColor: AppColors.primary.withOpacity(0.15),
                            foregroundColor: AppColors.primary,
                          ),
                          icon: const Icon(LucideIcons.messageSquare),
                        ),
                        const SizedBox(width: 12),
                        if (currentTrip.status == 'REQUESTED' || currentTrip.status == 'ACCEPTED')
                          Expanded(
                            child: CustomButton(
                              text: 'Start Trip',
                              icon: LucideIcons.navigation,
                              onPressed: () => tripProvider.startTrip(),
                            ),
                          )
                        else if (currentTrip.isInTransit)
                          Expanded(
                            child: CustomButton(
                              text: 'Complete & Collect Fare',
                              backgroundColor: AppColors.success,
                              icon: LucideIcons.checkCircle2,
                              onPressed: () => tripProvider.endTrip(),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
