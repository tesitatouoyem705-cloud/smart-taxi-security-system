import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/trip_provider.dart';
import '../../widgets/trip_card.dart';

class TripHistoryScreen extends StatefulWidget {
  const TripHistoryScreen({super.key});

  @override
  State<TripHistoryScreen> createState() => _TripHistoryScreenState();
}

class _TripHistoryScreenState extends State<TripHistoryScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      Provider.of<TripProvider>(context, listen: false).fetchTripsHistory();
    });
  }

  @override
  Widget build(BuildContext context) {
    final tripProvider = Provider.of<TripProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Trip History & Safety Audits'),
      ),
      body: RefreshIndicator(
        onRefresh: () => tripProvider.fetchTripsHistory(),
        child: tripProvider.tripsHistory.isEmpty
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      LucideIcons.history,
                      size: 48,
                      color: AppColors.textSecondaryDark.withOpacity(0.5),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'No Past Trips Recorded',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'All your verified taxi rides will appear here',
                      style: TextStyle(fontSize: 13, color: AppColors.textSecondaryDark),
                    ),
                  ],
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: tripProvider.tripsHistory.length,
                itemBuilder: (context, index) {
                  final trip = tripProvider.tripsHistory[index];
                  return TripCard(trip: trip);
                },
              ),
      ),
    );
  }
}
