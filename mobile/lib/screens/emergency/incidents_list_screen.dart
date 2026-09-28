import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/incident_provider.dart';
import '../../widgets/custom_badge.dart';
import 'report_incident_screen.dart';

class IncidentsListScreen extends StatefulWidget {
  const IncidentsListScreen({super.key});

  @override
  State<IncidentsListScreen> createState() => _IncidentsListScreenState();
}

class _IncidentsListScreenState extends State<IncidentsListScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      Provider.of<IncidentProvider>(context, listen: false).fetchIncidents();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final incidentProvider = Provider.of<IncidentProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Safety & Incident Reports'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plusCircle),
            tooltip: 'Report Incident',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const ReportIncidentScreen()),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => incidentProvider.fetchIncidents(),
        child: incidentProvider.incidents.isEmpty
            ? Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.shieldCheck, size: 54, color: AppColors.success.withOpacity(0.6)),
                    const SizedBox(height: 16),
                    Text(
                      'No Active Incident Reports',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: textPrimary),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'All your rides and safety logs are clean.',
                      style: TextStyle(fontSize: 13, color: textSecondary),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const ReportIncidentScreen()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.sosRed,
                        foregroundColor: Colors.white,
                      ),
                      icon: const Icon(LucideIcons.alertTriangle, size: 16),
                      label: const Text('Report New Incident'),
                    ),
                  ],
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: incidentProvider.incidents.length,
                itemBuilder: (context, index) {
                  final incident = incidentProvider.incidents[index];

                  Color statusColor;
                  switch (incident.status) {
                    case 'RESOLVED':
                      statusColor = AppColors.success;
                      break;
                    case 'UNDER_INVESTIGATION':
                      statusColor = AppColors.taxiYellow;
                      break;
                    default:
                      statusColor = AppColors.sosRed;
                  }

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            CustomBadge(
                              text: incident.category.replaceAll('_', ' '),
                              color: AppColors.sosRed,
                            ),
                            CustomBadge(
                              text: incident.status.replaceAll('_', ' '),
                              color: statusColor,
                              isFilled: true,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          incident.title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: textPrimary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          incident.description,
                          style: TextStyle(fontSize: 13, color: textSecondary),
                        ),
                        const SizedBox(height: 12),
                        Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight, height: 1),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              incident.taxiPlate != null ? 'Taxi: ${incident.taxiPlate}' : 'General Report',
                              style: TextStyle(fontSize: 12, color: textSecondary, fontWeight: FontWeight.w600),
                            ),
                            Text(
                              DateFormat('MMM d, yyyy • h:mm a').format(incident.createdAt),
                              style: TextStyle(fontSize: 11, color: textSecondary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
