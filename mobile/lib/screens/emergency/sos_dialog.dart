import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../providers/auth_provider.dart';

import '../../constants/app_colors.dart';
import '../../providers/sos_provider.dart';
import '../../widgets/custom_button.dart';

class SOSDialog extends StatefulWidget {
  final int? tripId;

  const SOSDialog({super.key, this.tripId});

  static void show(BuildContext context, {int? tripId}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SOSDialog(tripId: tripId),
    );
  }

  @override
  State<SOSDialog> createState() => _SOSDialogState();
}

class _SOSDialogState extends State<SOSDialog> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final sos = Provider.of<SOSProvider>(context, listen: false);
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final emergencyContacts = auth.user?.emergencyContacts ?? [];
      if (!sos.isEmergencyActive) {
        sos.startSOSCountdown(tripId: widget.tripId, emergencyContacts: emergencyContacts);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final sos = Provider.of<SOSProvider>(context);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final emergencyContacts = auth.user?.emergencyContacts ?? [];

    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(top: BorderSide(color: AppColors.sosRed, width: 2)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 48,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),

          // Glowing SOS Icon or Countdown Circle
          if (sos.isCountingDown) ...[
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.sosRed.withOpacity(0.2),
                border: Border.all(color: AppColors.sosRed, width: 3),
              ),
              child: Center(
                child: Text(
                  '${sos.countdownSeconds}',
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    color: AppColors.sosRed,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'EMERGENCY SOS ARMED',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              emergencyContacts.isNotEmpty
                  ? 'Distress beacon & live GPS will be sent immediately to ${emergencyContacts.length} emergency contact(s) & police'
                  : 'Distress beacon with live GPS coordinates will broadcast in seconds',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: Colors.white70),
            ),
            const SizedBox(height: 20),
            CustomButton(
              text: '🚨 SEND AUTOMATIC SOS NOW',
              backgroundColor: AppColors.sosRed,
              textColor: Colors.white,
              onPressed: () {
                sos.cancelCountdown();
                sos.triggerEmergency(tripId: widget.tripId, emergencyContacts: emergencyContacts);
              },
            ),
            const SizedBox(height: 10),
            CustomButton(
              text: 'ABORT EMERGENCY (I AM SAFE)',
              backgroundColor: Colors.white24,
              textColor: Colors.white,
              onPressed: () {
                sos.cancelCountdown();
                Navigator.pop(context);
              },
            ),
          ] else ...[
            // Active SOS state
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.sosRed,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.sosGlow,
                    blurRadius: 24,
                    spreadRadius: 6,
                  ),
                ],
              ),
              child: const Center(
                child: Icon(LucideIcons.alertTriangle, color: Colors.white, size: 48),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'DISTRESS BEACON BROADCASTING',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: AppColors.sosRed,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              emergencyContacts.isNotEmpty
                  ? 'Alert SMS with live GPS link dispatched to: ${emergencyContacts.map((c) => "${c.name} (${c.phone})").join(", ")}'
                  : 'Police dispatch, transit security, and central dispatch notified with your live coordinates.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: Colors.white70),
            ),
            if (emergencyContacts.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.sosRed.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.sosRed.withOpacity(0.4)),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(LucideIcons.checkCircle2, color: AppColors.success, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          '${emergencyContacts.length} Contact(s) SMS & Voice Call Dispatched',
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => sos.callEmergencyServices(emergencyContacts.first.phone),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(LucideIcons.phone, size: 14),
                            label: Text(
                              'Call ${emergencyContacts.first.name.split(" ")[0]}',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () async {
                              final phone = emergencyContacts.first.phone;
                              final lat = sos.activeSOSData?['latitude'] ?? 3.8480;
                              final lng = sos.activeSOSData?['longitude'] ?? 11.5021;
                              final msg = '🚨 EMERGENCY SOS ALERT! I need immediate help. My live location: https://maps.google.com/?q=$lat,$lng';
                              final Uri uri = Uri(scheme: 'sms', path: phone, queryParameters: {'body': msg});
                              if (await canLaunchUrl(uri)) await launchUrl(uri);
                            },
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.white38),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(LucideIcons.messageSquare, size: 14),
                            label: const Text(
                              'Direct SMS',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),



            // Emergency Call Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => sos.callEmergencyServices('911'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.sosRed,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(LucideIcons.phoneCall, size: 18),
                    label: const Text('Call 911 / Police', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => sos.callEmergencyServices('112'),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white38),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(LucideIcons.shieldAlert, size: 18),
                    label: const Text('Call Transit Sec.', style: TextStyle(fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () {
                sos.cancelEmergency();
                Navigator.pop(context);
              },
              child: const Text('Dismiss / Mark as Safe', style: TextStyle(color: Colors.white60)),
            ),
          ],
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}
