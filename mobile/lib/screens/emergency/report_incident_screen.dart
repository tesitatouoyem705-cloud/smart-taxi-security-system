import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/incident_provider.dart';
import '../../services/location_service.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class ReportIncidentScreen extends StatefulWidget {
  final int? tripId;
  final int? taxiId;

  const ReportIncidentScreen({super.key, this.tripId, this.taxiId});

  @override
  State<ReportIncidentScreen> createState() => _ReportIncidentScreenState();
}

class _ReportIncidentScreenState extends State<ReportIncidentScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _locationController = TextEditingController(text: 'Current GPS Coordinates Captured');
  final _formKey = GlobalKey<FormState>();

  String _selectedCategory = 'HARASSMENT';

  final List<Map<String, String>> _categories = [
    {'value': 'HARASSMENT', 'label': 'Driver Harassment / Threat'},
    {'value': 'ROUTE_DEVIATION', 'label': 'Suspicious Route Deviation'},
    {'value': 'RECKLESS_DRIVING', 'label': 'Reckless / Dangerous Driving'},
    {'value': 'OVERCHARGING', 'label': 'Fare Extortion / Overcharging'},
    {'value': 'VEHICLE_DEFECT', 'label': 'Vehicle Defect / Unsafe Condition'},
    {'value': 'OTHER', 'label': 'Other Safety Concern'},
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _submitIncident() async {
    if (!_formKey.currentState!.validate()) return;

    final incidentProvider = Provider.of<IncidentProvider>(context, listen: false);
    final pos = await LocationService.getCurrentPosition();

    final success = await incidentProvider.reportIncident(
      tripId: widget.tripId,
      taxiId: widget.taxiId,
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      category: _selectedCategory,
      location: _locationController.text.trim(),
      latitude: pos?.latitude,
      longitude: pos?.longitude,
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Incident submitted to security authorities for investigation.'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(incidentProvider.errorMessage ?? 'Submission failed'),
          backgroundColor: AppColors.sosRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final incidentProvider = Provider.of<IncidentProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Report Security Incident'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Info banner
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.sosRed.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.sosRed.withOpacity(0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(LucideIcons.shieldAlert, color: AppColors.sosRed, size: 24),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Reports are directly routed to Transit Police & Taxi Security Board for immediate review.',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                Text(
                  'Incident Category',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: textPrimary),
                ),
                const SizedBox(height: 8),

                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.cardDark : AppColors.cardLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedCategory,
                      isExpanded: true,
                      dropdownColor: isDark ? AppColors.cardDark : AppColors.cardLight,
                      items: _categories.map((c) {
                        return DropdownMenuItem<String>(
                          value: c['value'],
                          child: Text(c['label']!, style: TextStyle(color: textPrimary, fontSize: 14)),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedCategory = val);
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                CustomTextField(
                  label: 'Subject / Title',
                  hint: 'e.g. Driver refused meter and demanded cash',
                  controller: _titleController,
                  validator: (val) => val == null || val.trim().isEmpty ? 'Please enter a title' : null,
                ),
                const SizedBox(height: 16),

                CustomTextField(
                  label: 'Detailed Description',
                  hint: 'Describe what happened, driver statements, or safety concerns...',
                  controller: _descController,
                  maxLines: 4,
                  validator: (val) => val == null || val.trim().isEmpty ? 'Please provide details' : null,
                ),
                const SizedBox(height: 16),

                CustomTextField(
                  label: 'Location Details',
                  controller: _locationController,
                  prefixIcon: LucideIcons.mapPin,
                  readOnly: true,
                ),
                const SizedBox(height: 28),

                CustomButton(
                  text: 'Submit Official Incident Report',
                  icon: LucideIcons.send,
                  backgroundColor: AppColors.sosRed,
                  isLoading: incidentProvider.isLoading,
                  onPressed: _submitIncident,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
