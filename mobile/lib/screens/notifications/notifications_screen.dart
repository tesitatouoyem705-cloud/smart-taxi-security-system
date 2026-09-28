import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../constants/app_icons.dart';

class SystemNotificationItem {
  final String id;
  final String title;
  final String message;
  final String type; // 'SOS', 'VERIFICATION', 'TRIP', 'SYSTEM'
  final DateTime time;
  bool isRead;

  SystemNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.time,
    this.isRead = false,
  });
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _smsAlertsEnabled = true;
  bool _routeDeviationAlerts = true;
  bool _emergencyAudioEnabled = true;

  final List<SystemNotificationItem> _notifications = [
    SystemNotificationItem(
      id: '1',
      title: '🚨 Central Security Alert Broadcast',
      message: 'Twilio SMS emergency gateway online. Patrol units active around Yaoundé Post Central & Ngoa-Ekellé.',
      type: 'SOS',
      time: DateTime.now().subtract(const Duration(minutes: 12)),
    ),
    SystemNotificationItem(
      id: '2',
      title: '✅ Door QR Verification Confirmed',
      message: 'Taxi LT-782-BC driver accredited. Safety score: 98/100.',
      type: 'VERIFICATION',
      time: DateTime.now().subtract(const Duration(hours: 1)),
      isRead: true,
    ),
    SystemNotificationItem(
      id: '3',
      title: '📍 Live Trip GPS Tracking Active',
      message: 'Encrypted tracking link transmitted to 2 emergency contacts.',
      type: 'TRIP',
      time: DateTime.now().subtract(const Duration(hours: 3)),
      isRead: true,
    ),
    SystemNotificationItem(
      id: '4',
      title: '🛡️ Safety Academy Completed',
      message: 'You unlocked the "Yaoundé Urban Taxi Security" verification badge.',
      type: 'SYSTEM',
      time: DateTime.now().subtract(const Duration(days: 1)),
      isRead: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        title: const Text('Notifications & Alerts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.checkCheck, size: 20),
            tooltip: 'Mark all as read',
            onPressed: () {
              setState(() {
                for (var n in _notifications) {
                  n.isRead = true;
                }
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('All notifications marked as read.')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Notification Channels Configuration (Abstract User: Manage Notifications)
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(LucideIcons.bell, color: AppColors.primary, size: 18),
                      SizedBox(width: 8),
                      Text('Alert Channel Preferences', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    activeColor: AppColors.primary,
                    title: const Text('Twilio SMS Emergency Relays', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Send instant SMS to contacts when SOS is pressed', style: TextStyle(fontSize: 11)),
                    value: _smsAlertsEnabled,
                    onChanged: (v) => setState(() => _smsAlertsEnabled = v),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    activeColor: AppColors.primary,
                    title: const Text('GPS Route Deviation Detection', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Trigger notification if vehicle diverges >500m', style: TextStyle(fontSize: 11)),
                    value: _routeDeviationAlerts,
                    onChanged: (v) => setState(() => _routeDeviationAlerts = v),
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    activeColor: AppColors.primary,
                    title: const Text('Emergency Alarm Siren', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    subtitle: const Text('Play high-decibel deterrent siren during SOS', style: TextStyle(fontSize: 11)),
                    value: _emergencyAudioEnabled,
                    onChanged: (v) => setState(() => _emergencyAudioEnabled = v),
                  ),
                ],
              ),
            ),

            // Notifications Feed
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'RECENT SECURITY BROADCASTS',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                  letterSpacing: 1,
                ),
              ),
            ),
            const SizedBox(height: 8),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _notifications.length,
              itemBuilder: (context, index) {
                final item = _notifications[index];
                IconData icon;
                Color color;

                switch (item.type) {
                  case 'SOS':
                    icon = LucideIcons.alertTriangle;
                    color = AppColors.sosRed;
                    break;
                  case 'VERIFICATION':
                    icon = LucideIcons.shieldCheck;
                    color = AppColors.success;
                    break;
                  case 'TRIP':
                    icon = LucideIcons.navigation;
                    color = Colors.blue;
                    break;
                  default:
                    icon = LucideIcons.info;
                    color = AppColors.primary;
                }

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: item.isRead ? cardBg : AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: item.isRead
                          ? (isDark ? AppColors.borderDark : AppColors.borderLight)
                          : AppColors.primary.withValues(alpha: 0.5),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(icon, color: color, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.title,
                              style: TextStyle(
                                fontWeight: item.isRead ? FontWeight.w600 : FontWeight.w800,
                                fontSize: 13.5,
                                color: textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              item.message,
                              style: TextStyle(fontSize: 12, color: isDark ? Colors.white70 : Colors.black87),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              _formatTime(item.time),
                              style: const TextStyle(fontSize: 10.5, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    final diff = DateTime.now().difference(time);
    if (diff.inMinutes < 60) return '${diff.inMinutes} mins ago';
    if (diff.inHours < 24) return '${diff.inHours} hours ago';
    return '${diff.inDays} days ago';
  }
}
