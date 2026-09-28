import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import '../../constants/app_colors.dart';
import '../../widgets/custom_badge.dart';
import '../../widgets/custom_button.dart';
import 'qr_scan_screen.dart';
import '../emergency/sos_dialog.dart';
import '../emergency/report_incident_screen.dart';

class CourseItem {
  final String id;
  final String title;
  final String subtitle;
  final String duration;
  final IconData icon;
  final String level;
  final List<String> steps;
  final String safetyTip;
  final String? actionText;
  final VoidCallback? onAction;
  bool isCompleted;

  CourseItem({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.duration,
    required this.icon,
    required this.level,
    required this.steps,
    required this.safetyTip,
    this.actionText,
    this.onAction,
    this.isCompleted = false,
  });
}

class PassengerCoursesScreen extends StatefulWidget {
  const PassengerCoursesScreen({super.key});

  @override
  State<PassengerCoursesScreen> createState() => _PassengerCoursesScreenState();
}

class _PassengerCoursesScreenState extends State<PassengerCoursesScreen> {
  late List<CourseItem> _courses;

  @override
  void initState() {
    super.initState();
    _initCourses();
  }

  void _initCourses() {
    _courses = [
      CourseItem(
        id: '1',
        title: 'How to Verify a Taxi Before Boarding',
        subtitle: 'Scan the official door QR code on Yaoundé yellow taxis',
        duration: '3 min read',
        icon: Icons.qr_code_scanner,
        level: 'ESSENTIAL',
        isCompleted: true,
        steps: [
          'Locate the official yellow SafeRide QR code sticker on the front or rear passenger door.',
          'Open your SafeRide app and tap "Scan Taxi QR Before Entering".',
          'Align your phone camera with the door sticker. The app automatically verifies the driver identity, vehicle plate, and safety rating.',
          'Cross-check the license plate shown on your screen (e.g. CM 643 AA) with the actual vehicle plate before stepping inside.',
          'Never board an unverified vehicle or a taxi with a damaged or missing QR security sticker.'
        ],
        safetyTip: 'In Yaoundé, legitimate registered fleet taxis always display their official registration numbers and verified QR stickers on the passenger side.',
        actionText: 'Launch QR Scanner',
        onAction: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const QRScanScreen()),
          );
        },
      ),
      CourseItem(
        id: '2',
        title: 'Live GPS Tracking & Family Ride Sharing',
        subtitle: 'Let family and friends watch your journey in real time',
        duration: '4 min read',
        icon: Icons.share_location,
        level: 'CRITICAL',
        isCompleted: true,
        steps: [
          'Once your trip starts, tap the "Share Ride" button on your active trip screen.',
          'A secure web tracking link is copied or shared directly to WhatsApp, SMS, or Telegram.',
          'Your family members can view your live vehicle location, speed, and ETA on any smartphone browser without installing the app.',
          'If your vehicle veers off normal city routes, your contacts will see the deviation immediately.'
        ],
        safetyTip: 'Always share your ride link whenever traveling across Yaoundé at night (e.g. traveling to Mokolo, Biyem-Assi, or Nsam).',
      ),
      CourseItem(
        id: '3',
        title: 'Using the Emergency SOS & Distress Beacon',
        subtitle: 'Instant panic alarm, police alert, and contact dispatch',
        duration: '3 min read',
        icon: Icons.warning_amber_rounded,
        level: 'EMERGENCY',
        steps: [
          'Tap the pulsating red SOS button floating on your screen if you feel threatened or in danger.',
          'A 3-second armed countdown begins with audible feedback. You can tap "Abort" if clicked by mistake.',
          'Once triggered, your live GPS coordinates, vehicle registration, and driver details are beamed to Transit Security and your emergency contacts.',
          'Use the 1-tap "Call 911 / Police" button to speak directly with emergency dispatch officers.'
        ],
        safetyTip: 'The SOS feature works even with low cellular reception by transmitting encrypted GPS distress packets.',
        actionText: 'Practice Safe SOS Drill',
        onAction: () => SOSDialog.show(context),
      ),
      CourseItem(
        id: '4',
        title: 'Reporting Incidents & Fare Extortion',
        subtitle: 'File complaints against reckless driving or overcharging',
        duration: '3 min read',
        icon: Icons.shield_outlined,
        level: 'COMMUNITY',
        steps: [
          'Go to the "Incidents" tab and tap "Report New Incident".',
          'Choose the incident category: Suspicious Route, Driver Harassment, Fare Extortion, or Reckless Driving.',
          'The app automatically locks in your current GPS coordinates and timestamps the report.',
          'Transit security administrators review reports, audit driver behavior, and suspend non-compliant taxis from the platform.'
        ],
        safetyTip: 'Always report suspicious behavior to safeguard other passengers in the Yaoundé transit network.',
        actionText: 'Open Incident Center',
        onAction: () {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const ReportIncidentScreen()),
          );
        },
      ),
      CourseItem(
        id: '5',
        title: 'Yaoundé Taxi Street Safety & "Ramassage" Rules',
        subtitle: 'Navigating shared rides, pick-up points, and night precautions',
        duration: '5 min read',
        icon: Icons.local_taxi,
        level: 'PRO TIPS',
        steps: [
          'Understand the difference between "Ramassage" (shared taxi) and "Dépôt" (chartered private trip). In both, verify the driver first.',
          'Check the child locks on the rear doors before closing them so you can exit freely at any time.',
          'Avoid entering taxis with multiple unfamiliar passengers already in the back seat at late hours.',
          'Keep your phone charged and ensure your trusted emergency contacts are listed in your profile.'
        ],
        safetyTip: 'When taking late night rides from Bastos or Omnisport, choose well-lit verification zones.',
      ),
    ];
  }

  void _openCourseModal(CourseItem course) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          final cardBg = isDark ? AppColors.cardDark : Colors.white;
          final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

          return Container(
            height: MediaQuery.of(context).size.height * 0.85,
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Badge & Level
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CustomBadge(
                      text: course.level,
                      color: AppColors.primary,
                      isFilled: true,
                    ),
                    Text(
                      course.duration,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryDark),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                Text(
                  course.title,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  course.subtitle,
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryDark),
                ),
                const SizedBox(height: 16),
                Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                const SizedBox(height: 12),

                // Steps list
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Step-by-Step Instructions',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: textPrimary),
                        ),
                        const SizedBox(height: 12),
                        ...List.generate(course.steps.length, (index) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 14),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 26,
                                  height: 26,
                                  decoration: const BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${index + 1}',
                                      style: const TextStyle(
                                        color: Color(0xFF0F172A),
                                        fontWeight: FontWeight.w900,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    course.steps[index],
                                    style: TextStyle(fontSize: 14, color: textPrimary, height: 1.4),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                        const SizedBox(height: 14),

                        // Safety Tip Callout
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.primary, width: 1.5),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.lightbulb, color: AppColors.primary, size: 24),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'YAOUNDÉ SAFETY ADVISORY',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      course.safetyTip,
                                      style: TextStyle(fontSize: 13, color: textPrimary),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),

                // Action Buttons
                Row(
                  children: [
                    if (course.actionText != null && course.onAction != null) ...[
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            Navigator.pop(context);
                            course.onAction!();
                          },
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.primary, width: 1.5),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Text(
                            course.actionText!,
                            style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    Expanded(
                      child: CustomButton(
                        text: course.isCompleted ? 'Completed ✓' : 'Mark Completed',
                        backgroundColor: course.isCompleted ? AppColors.success : AppColors.primary,
                        onPressed: () {
                          setState(() {
                            course.isCompleted = !course.isCompleted;
                          });
                          setModalState(() {});
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    final int completedCount = _courses.where((c) => c.isCompleted).length;
    final double progress = completedCount / _courses.length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Passenger Safety Academy'),
        backgroundColor: isDark ? AppColors.bgDark : AppColors.bgLight,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Image Card: Cameroon Yaoundé Taxi & Passenger Scanning Door QR
            Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Stack(
                  children: [
                    Image.asset(
                      'assets/images/yaounde_taxi_scan.jpg',
                      width: double.infinity,
                      height: 210,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        height: 210,
                        color: AppColors.primary.withOpacity(0.2),
                        child: const Center(
                          child: Icon(Icons.local_taxi, size: 60, color: AppColors.primary),
                        ),
                      ),
                    ),
                    // Gradient overlay
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              Colors.transparent,
                              Colors.black.withOpacity(0.85),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ),
                    // Caption
                    Positioned(
                      left: 16,
                      right: 16,
                      bottom: 16,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'YAOUNDÉ CITY SAFETY STANDARD',
                              style: TextStyle(
                                color: Color(0xFF0F172A),
                                fontWeight: FontWeight.w900,
                                fontSize: 10,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Scan the Passenger Door QR Code Before Entering Any Yellow Taxi',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Progress Overview Card
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
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
                      Text(
                        'Your Passenger Safety Score',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: textPrimary),
                      ),
                      Text(
                        '${(progress * 100).toInt()}% Certified',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 8,
                      backgroundColor: isDark ? AppColors.surfaceDark : Colors.black12,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '$completedCount of ${_courses.length} courses completed. Complete all to earn Verified Safe Commuter status.',
                    style: TextStyle(fontSize: 12, color: textSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Courses List Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Safety Learning Modules',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: textPrimary),
                  ),
                  Text(
                    '${_courses.length} Modules',
                    style: TextStyle(fontSize: 12, color: textSecondary, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Courses Cards
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _courses.length,
              itemBuilder: (context, index) {
                final course = _courses[index];

                return InkWell(
                  onTap: () => _openCourseModal(course),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardBg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: course.isCompleted ? AppColors.primary.withOpacity(0.5) : (isDark ? AppColors.borderDark : AppColors.borderLight),
                        width: course.isCompleted ? 1.5 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: course.isCompleted ? AppColors.primary : AppColors.primary.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            course.icon,
                            color: course.isCompleted ? const Color(0xFF0F172A) : AppColors.primary,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CustomBadge(
                                    text: course.level,
                                    color: course.level == 'EMERGENCY' ? AppColors.sosRed : AppColors.primary,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    course.duration,
                                    style: TextStyle(fontSize: 11, color: textSecondary),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                course.title,
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                  color: textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                course.subtitle,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 12, color: textSecondary),
                              ),
                            ],
                          ),
                        ),
                        Icon(
                          course.isCompleted ? Icons.check_circle : Icons.chevron_right,
                          color: course.isCompleted ? AppColors.primary : textSecondary,
                          size: 22,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}
