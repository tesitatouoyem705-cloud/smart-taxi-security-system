import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../models/taxi_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/trip_provider.dart';
import '../../widgets/custom_button.dart';
import '../trip/live_trip_screen.dart';

class TaxiVerificationSheet extends StatelessWidget {
  final TaxiModel taxi;

  const TaxiVerificationSheet({super.key, required this.taxi});

  static void show(BuildContext context, TaxiModel taxi) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => TaxiVerificationSheet(taxi: taxi),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final tripProvider = Provider.of<TripProvider>(context);

    return Container(
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
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
          const SizedBox(height: 20),

          // Verified Header Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.successLight.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.success, width: 1.2),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(LucideIcons.shieldCheck, color: AppColors.success, size: 18),
                SizedBox(width: 6),
                Text(
                  'GOVERNMENT / FLEET VERIFIED TAXI',
                  style: TextStyle(
                    color: AppColors.success,
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Vehicle Plate Number Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              color: isDark ? AppColors.bgDark : AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.taxiYellow, width: 2),
            ),
            child: Column(
              children: [
                const Text(
                  'OFFICIAL LICENSE PLATE',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.taxiGold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  taxi.registrationNumber,
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: textPrimary,
                    letterSpacing: 2.0,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Driver & Vehicle Details Card
          Row(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: AppColors.primary.withOpacity(0.15),
                child: const Icon(LucideIcons.user, color: AppColors.primary, size: 30),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      taxi.driverName ?? 'Verified Security Driver',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${taxi.model} • ${taxi.color}',
                      style: TextStyle(fontSize: 13, color: textSecondary),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      const Icon(LucideIcons.star, color: AppColors.taxiYellow, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        taxi.rating.toStringAsFixed(2),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text('Safety Score', style: TextStyle(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Security Features Checklist
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.bgDark : AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Column(
              children: [
                Row(
                  children: [
                    Icon(LucideIcons.checkCircle2, color: AppColors.success, size: 16),
                    SizedBox(width: 8),
                    Text('Real-time GPS Tracking Active', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
                SizedBox(height: 8),
                Row(
                  children: [
                    Icon(LucideIcons.checkCircle2, color: AppColors.success, size: 16),
                    SizedBox(width: 8),
                    Text('Auto Emergency SOS Telemetry Linked', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
                SizedBox(height: 8),
                Row(
                  children: [
                    Icon(LucideIcons.checkCircle2, color: AppColors.success, size: 16),
                    SizedBox(width: 8),
                    Text('Driver Background Security Cleared', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Board & Start Ride Button
          CustomButton(
            text: 'Board Taxi & Start Safe Trip',
            icon: LucideIcons.shieldAlert,
            isLoading: tripProvider.isLoading,
            onPressed: () async {
              Navigator.pop(context);
              final success = await tripProvider.requestTrip(
                passengerId: auth.user?.id ?? 1,
                passengerName: auth.user?.name ?? 'Passenger',
                pickupAddress: 'Current GPS Location',
                dropoffAddress: 'Grand Central Station',
                startLatitude: taxi.currentLatitude,
                startLongitude: taxi.currentLongitude,
                dropoffLatitude: 40.7527,
                dropoffLongitude: -73.9772,
                taxiId: taxi.id,
              );

              if (success && context.mounted) {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const LiveTripScreen()),
                );
              }
            },
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
