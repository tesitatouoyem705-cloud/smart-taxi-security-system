import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_colors.dart';
import '../widgets/app_logo.dart';
import '../providers/auth_provider.dart';
import '../providers/trip_provider.dart';
import '../providers/taxi_provider.dart';
import 'visitor/visitor_landing_screen.dart';
import 'main_navigation_screen.dart';
import 'payment/payment_gate_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _bootstrap();
    });
  }


  Future<void> _bootstrap() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final tripProvider = Provider.of<TripProvider>(context, listen: false);
    final taxiProvider = Provider.of<TaxiProvider>(context, listen: false);

    // Initial auth restoration
    await authProvider.tryAutoLogin();

    if (mounted) {
      if (authProvider.isAuthenticated) {
        // Mandatory Payment Gate Check for Passengers
        if (authProvider.isPassenger && !authProvider.isPaid) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const PaymentGateScreen()),
          );
          return;
        }

        tripProvider.fetchActiveTrip();
        taxiProvider.fetchAvailableTaxis();
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const VisitorLandingScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgDark,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const AppLogo(size: 96, borderRadius: 26),
            const SizedBox(height: 24),
            const Text(
              'SAFERIDE',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 2.0,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Real-Time Passenger & Fleet Protection',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondaryDark,
              ),
            ),
            const SizedBox(height: 48),
            const SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
