import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../providers/trip_provider.dart';
import '../../providers/taxi_provider.dart';
import '../../providers/sos_provider.dart';
import '../../services/location_service.dart';
import '../../widgets/app_logo.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/map_widget.dart';
import '../../widgets/sos_active_banner.dart';
import '../../widgets/sos_button.dart';
import '../../widgets/taxi_card.dart';
import '../emergency/sos_dialog.dart';
import '../trip/live_trip_screen.dart';
import 'qr_scan_screen.dart';
import 'taxi_verification_sheet.dart';
import 'passenger_courses_screen.dart';
import '../notifications/notifications_screen.dart';
import '../payment/payment_gate_screen.dart';

class PassengerHomeScreen extends StatefulWidget {
  const PassengerHomeScreen({super.key});

  @override
  State<PassengerHomeScreen> createState() => _PassengerHomeScreenState();
}

class _PassengerHomeScreenState extends State<PassengerHomeScreen> {
  // User's verified exact location: 3°48'49.9"N 11°33'28.2"E (Odza, Yaoundé, Cameroon)
  final LatLng _defaultCenter = const LatLng(3.813861, 11.557833);
  LatLng? _userRealLocation = const LatLng(3.813861, 11.557833);
  StreamSubscription<Position>? _positionStreamSub;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      if (mounted) {
        final auth = Provider.of<AuthProvider>(context, listen: false);
        if (auth.isPassenger && !auth.isPaid) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const PaymentGateScreen()),
          );
          return;
        }

        Provider.of<TripProvider>(context, listen: false).fetchActiveTrip();
        Provider.of<TaxiProvider>(context, listen: false).fetchAvailableTaxis();
        _fetchRealPosition();
      }
    });
  }

  Future<void> _fetchRealPosition() async {
    try {
      final pos = await LocationService.getCurrentPosition();
      if (pos != null && mounted) {
        setState(() {
          _userRealLocation = LatLng(pos.latitude, pos.longitude);
        });
      }

      _positionStreamSub?.cancel();
      _positionStreamSub = LocationService.getPositionStream(distanceFilter: 3).listen((pos) {
        if (mounted) {
          setState(() {
            _userRealLocation = LatLng(pos.latitude, pos.longitude);
          });
        }
      });
    } catch (e) {
      debugPrint('[PassengerHomeScreen] Location fetch error: $e');
    }
  }

  @override
  void dispose() {
    _positionStreamSub?.cancel();
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
    final taxiProvider = Provider.of<TaxiProvider>(context);
    final sos = Provider.of<SOSProvider>(context);

    final bool isUserInCameroon = _userRealLocation != null &&
        _userRealLocation!.latitude >= 1.5 && _userRealLocation!.latitude <= 13.5 &&
        _userRealLocation!.longitude >= 8.0 && _userRealLocation!.longitude <= 16.5;

    final LatLng mapCenter = (isUserInCameroon ? _userRealLocation : null) ??
        (taxiProvider.taxis.isNotEmpty
            ? LatLng(taxiProvider.taxis.first.currentLatitude, taxiProvider.taxis.first.currentLongitude)
            : _defaultCenter);

    return Scaffold(
      body: Stack(
        children: [
          // 1. Live Background Map with nearby verified taxis (God's Eye Active)
          Positioned.fill(
            child: MapWidget(
              center: mapCenter,
              zoom: 14.8,
              userLocation: _userRealLocation,
              nearbyTaxis: taxiProvider.taxis,
              isSosActive: sos.isEmergencyActive,
              topPadding: 95,
              bottomPadding: 290,
            ),
          ),

          // 2. Top Header & Safety Aura
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
                          BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 8),
                        ],
                      ),
                      child: Row(
                        children: [
                          const AppLogo(size: 40, borderRadius: 12, withShield: false),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Hello, ${auth.user?.name ?? "Passenger"}',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: textPrimary,
                                  ),
                                ),
                                Text(
                                  _userRealLocation != null
                                      ? '📍 GPS: 3°48\'50"N 11°33\'28"E (${_userRealLocation!.latitude.toStringAsFixed(4)}, ${_userRealLocation!.longitude.toStringAsFixed(4)})'
                                      : 'Fleet GPS Protection Active (Odza, Yaoundé)',
                                  style: const TextStyle(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.w600),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: Icon(
                              _userRealLocation != null ? Icons.my_location : Icons.location_searching,
                              color: _userRealLocation != null ? const Color(0xFF00D4FF) : textSecondary,
                              size: 20,
                            ),
                            tooltip: 'Locate My Real Position',
                            onPressed: () async {
                              final messenger = ScaffoldMessenger.of(context);
                              await _fetchRealPosition();
                              if (!mounted || _userRealLocation == null) return;
                              messenger.showSnackBar(
                                SnackBar(
                                  content: Text(
                                    isUserInCameroon
                                        ? "📍 Live Cameroon GPS active: ${_userRealLocation!.latitude.toStringAsFixed(4)}, ${_userRealLocation!.longitude.toStringAsFixed(4)}"
                                        : "📍 Yaoundé Position Active (Device GPS: ${_userRealLocation!.latitude.toStringAsFixed(2)}, ${_userRealLocation!.longitude.toStringAsFixed(2)})",
                                  ),
                                  backgroundColor: const Color(0xFF10B981),
                                  behavior: SnackBarBehavior.floating,
                                ),
                              );
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.school, color: AppColors.primary, size: 22),
                            tooltip: 'Safety Courses',
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const PassengerCoursesScreen()),
                              );
                            },
                          ),
                          IconButton(
                            icon: const Badge(
                              label: Text('3', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                              backgroundColor: AppColors.primary,
                              textColor: Colors.black,
                              child: Icon(LucideIcons.bell, size: 20),
                            ),
                            tooltip: 'Notifications',
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                              );
                            },
                          ),
                          IconButton(
                            icon: const Icon(LucideIcons.qrCode, color: AppColors.primary, size: 22),
                            tooltip: 'Scan Taxi QR',
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const QRScanScreen()),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Active Trip Alert Card (if any)
                  if (tripProvider.hasActiveTrip)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: GestureDetector(
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const LiveTripScreen()),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(color: AppColors.primary.withOpacity(0.4), blurRadius: 10, offset: const Offset(0, 4)),
                            ],
                          ),
                          child: const Row(
                            children: [
                              Icon(LucideIcons.navigation, color: Colors.white, size: 20),
                              SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'TRIP IN PROGRESS',
                                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900),
                                    ),
                                    Text(
                                      'Tap to view live security tracking & telemetry',
                                      style: TextStyle(color: Colors.white70, fontSize: 12),
                                    ),
                                  ],
                                ),
                              ),
                              Icon(LucideIcons.chevronRight, color: Colors.white, size: 20),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // 3. Floating SOS Panic Button
          Positioned(
            right: 20,
            bottom: 220,
            child: SOSButton(
              onTap: () => SOSDialog.show(context, tripId: tripProvider.currentTrip?.id),
            ),
          ),

          // 4. Bottom Quick Action & Nearby Taxis Sheet
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
                  BoxShadow(color: Colors.black.withOpacity(0.25), blurRadius: 16, offset: const Offset(0, -4)),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4,
                      decoration: BoxDecoration(
                        color: textSecondary.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Large "Scan Taxi QR Before Entering" Action Button
                  CustomButton(
                    text: 'Scan Taxi QR Before Entering',
                    icon: LucideIcons.qrCode,
                    backgroundColor: AppColors.taxiYellow,
                    textColor: Colors.black87,
                    height: 54,
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const QRScanScreen()),
                      );
                    },
                  ),
                  const SizedBox(height: 12),

                  // Passenger Safety Academy Card (with Yaounde Taxi image)
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const PassengerCoursesScreen()),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: AppColors.primary.withOpacity(0.4),
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.asset(
                              'assets/images/yaounde_taxi_scan.jpg',
                              width: 52,
                              height: 44,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Container(
                                width: 52,
                                height: 44,
                                color: AppColors.primary.withOpacity(0.2),
                                child: const Icon(Icons.school, color: AppColors.primary, size: 24),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Text(
                                      'PASSENGER ACADEMY',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 11,
                                        color: AppColors.primary,
                                        letterSpacing: 0.6,
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text(
                                        '5 Courses',
                                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.primary),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Learn how to verify Yaoundé taxis & use SOS',
                                  style: TextStyle(fontSize: 12, color: textPrimary, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                          Icon(Icons.arrow_forward_ios, size: 14, color: textSecondary),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Nearby Verified Taxis Section Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Nearby Verified Taxis',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: textPrimary,
                        ),
                      ),
                      Text(
                        '${taxiProvider.taxis.length} Active in area',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.success,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Horizontal or compact list of available taxis
                  if (taxiProvider.taxis.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Center(
                        child: Text(
                          'No taxis nearby. Use QR scan on vehicle window.',
                          style: TextStyle(color: textSecondary, fontSize: 13),
                        ),
                      ),
                    )
                  else
                    SizedBox(
                      height: 130,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: taxiProvider.taxis.length,
                        itemBuilder: (context, index) {
                          final taxi = taxiProvider.taxis[index];
                          return Container(
                            width: 260,
                            margin: const EdgeInsets.only(right: 12),
                            child: TaxiCard(
                              taxi: taxi,
                              onTap: () => TaxiVerificationSheet.show(context, taxi),
                            ),
                          );
                        },
                      ),
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
