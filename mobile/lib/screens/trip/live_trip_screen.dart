import 'dart:async';
import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../constants/app_colors.dart';
import '../../constants/api_endpoints.dart';
import '../../providers/trip_provider.dart';
import '../../providers/sos_provider.dart';
import '../../widgets/custom_badge.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/map_widget.dart';
import '../../widgets/sos_active_banner.dart';
import '../../widgets/sos_button.dart';
import '../emergency/sos_dialog.dart';
import 'trip_chat_modal.dart';

class LiveTripScreen extends StatefulWidget {
  const LiveTripScreen({super.key});

  @override
  State<LiveTripScreen> createState() => _LiveTripScreenState();
}

class _LiveTripScreenState extends State<LiveTripScreen> {
  Timer? _gpsSimulationTimer;
  double _simT = 0.0;

  @override
  void initState() {
    super.initState();
    _startGpsSimulation();
  }

  // Smoothly simulates realistic vehicle movement along route for demonstration
  void _startGpsSimulation() {
    _gpsSimulationTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      final tripProvider = Provider.of<TripProvider>(context, listen: false);
      final trip = tripProvider.currentTrip;
      if (trip != null && trip.isInTransit) {
        _simT += 0.05;
        if (_simT > 1.0) _simT = 0.0;

        final double lat = trip.startLatitude + (trip.dropoffLatitude - trip.startLatitude) * _simT;
        final double lng = trip.startLongitude + (trip.dropoffLongitude - trip.startLongitude) * _simT;

        tripProvider.updateLocationManually(lat, lng);
      }
    });
  }

  @override
  void dispose() {
    _gpsSimulationTimer?.cancel();
    super.dispose();
  }

  void _shareLiveTrip(String shareToken) {
    final trackingUrl = '${ApiEndpoints.socketUrl}/trips/public/$shareToken';
    Share.share(
      '🚨 Follow my safe taxi trip in real time via SafeRide:\n$trackingUrl\nMy ride is live-monitored by transit security.',
      subject: 'My Live Taxi Tracking Link',
    );
  }

  void _showRatingDialog() {
    int rating = 5;
    final reviewController = TextEditingController();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppColors.cardDark,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Rate Your Ride & Safety', style: TextStyle(color: Colors.white, fontSize: 18)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'How safe did you feel with this driver?',
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  return IconButton(
                    icon: Icon(
                      index < rating ? LucideIcons.star : LucideIcons.star,
                      color: index < rating ? AppColors.taxiYellow : Colors.white24,
                      size: 32,
                    ),
                    onPressed: () => setDialogState(() => rating = index + 1),
                  );
                }),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: reviewController,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Comments or safety feedback (optional)...',
                  hintStyle: TextStyle(color: Colors.white38, fontSize: 13),
                  filled: true,
                  fillColor: AppColors.surfaceDark,
                ),
                maxLines: 2,
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () async {
                final tripProvider = Provider.of<TripProvider>(context, listen: false);
                await tripProvider.rateDriver(rating, reviewController.text);
                if (context.mounted) {
                  Navigator.pop(context);
                  Navigator.pop(context); // Return to home
                }
              },
              child: const Text('Submit Feedback'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final tripProvider = Provider.of<TripProvider>(context);
    final sos = Provider.of<SOSProvider>(context);
    final trip = tripProvider.currentTrip;

    if (trip == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Live Trip')),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(LucideIcons.navigation, size: 48, color: AppColors.textSecondaryDark),
              const SizedBox(height: 16),
              const Text('No Active Trip Found', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Return to Home')),
            ],
          ),
        ),
      );
    }

    final vehicleLatLng = LatLng(trip.currentLatitude, trip.currentLongitude);
    final pickupLatLng = LatLng(trip.startLatitude, trip.startLongitude);
    final dropoffLatLng = LatLng(trip.dropoffLatitude, trip.dropoffLongitude);

    return Scaffold(
      body: Stack(
        children: [
          // 1. Background Interactive Map
          Positioned.fill(
            child: MapWidget(
              center: vehicleLatLng,
              zoom: 15.0,
              pickupLocation: pickupLatLng,
              dropoffLocation: dropoffLatLng,
              vehicleLocation: vehicleLatLng,
              isSosActive: sos.isEmergencyActive || trip.isSosActive,
              topPadding: 95,
              bottomPadding: 310,
            ),
          ),

          // 2. Top App Bar & Safety Aura
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
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        CircleAvatar(
                          backgroundColor: cardBg.withOpacity(0.95),
                          child: IconButton(
                            icon: Icon(LucideIcons.arrowLeft, color: textPrimary, size: 20),
                            onPressed: () => Navigator.pop(context),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: cardBg.withOpacity(0.95),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.success, width: 1.5),
                          ),
                          child: const Row(
                            children: [
                              Icon(LucideIcons.shieldCheck, color: AppColors.success, size: 16),
                              SizedBox(width: 6),
                              Text(
                                'LIVE SECURITY TRACKING ACTIVE',
                                style: TextStyle(
                                  color: AppColors.success,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                        CircleAvatar(
                          backgroundColor: cardBg.withOpacity(0.95),
                          child: IconButton(
                            icon: Icon(LucideIcons.share2, color: textPrimary, size: 20),
                            onPressed: () => _shareLiveTrip(trip.shareToken ?? 'demo-token'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // 3. Floating SOS Button
          Positioned(
            right: 20,
            bottom: 250,
            child: SOSButton(
              onTap: () => SOSDialog.show(context, tripId: trip.id),
            ),
          ),

          // 4. Bottom Trip Control Card
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: textSecondary.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Driver Details Row
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: AppColors.primary.withOpacity(0.15),
                        child: const Icon(LucideIcons.user, color: AppColors.primary, size: 26),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  trip.driverName ?? 'Security Driver',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                    color: textPrimary,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                const CustomBadge(
                                  text: 'CLEARED',
                                  color: AppColors.success,
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${trip.vehicleModel ?? "Toyota Camry"} • ${trip.vehicleNumber ?? "TX-901"}',
                              style: TextStyle(fontSize: 12, color: textSecondary),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: () => TripChatModal.show(context),
                        style: IconButton.styleFrom(
                          backgroundColor: AppColors.primary.withOpacity(0.15),
                          foregroundColor: AppColors.primary,
                        ),
                        icon: const Icon(LucideIcons.messageSquare, size: 20),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Pickup & Dropoff Address Summary
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.bgDark : AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(LucideIcons.circleDot, size: 14, color: AppColors.primary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                trip.pickupAddress,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 12, color: textPrimary, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(LucideIcons.mapPin, size: 14, color: AppColors.sosRed),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                trip.dropoffAddress,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 12, color: textPrimary, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Trip Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _shareLiveTrip(trip.shareToken ?? 'token'),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          icon: const Icon(LucideIcons.share2, size: 16),
                          label: const Text('Share Ride', style: TextStyle(fontWeight: FontWeight.w700)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: CustomButton(
                          text: 'End Trip & Rate',
                          backgroundColor: AppColors.success,
                          icon: LucideIcons.checkCircle2,
                          onPressed: () async {
                            final success = await tripProvider.endTrip();
                            if (success && mounted) {
                              _showRatingDialog();
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
