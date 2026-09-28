import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../constants/api_endpoints.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/custom_badge.dart';
import '../auth/login_screen.dart';
import 'emergency_contacts_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _showServerHostDialog(BuildContext context) {
    final hostController = TextEditingController(text: ApiEndpoints.socketUrl);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Backend API Host URL', style: TextStyle(color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Change the server address for emulator or physical device testing:',
              style: TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: hostController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                filled: true,
                fillColor: AppColors.surfaceDark,
                hintText: 'e.g. http://10.0.2.2:5000',
                hintStyle: TextStyle(color: Colors.white38),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            onPressed: () {
              ApiEndpoints.setCustomHost(hostController.text.trim());
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Server endpoint updated to: ${ApiEndpoints.baseUrl}')),
              );
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final auth = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Security & Profile'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // User Profile Avatar & Role
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: AppColors.primary.withOpacity(0.15),
                      child: const Icon(LucideIcons.userCheck, color: AppColors.primary, size: 40),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      user?.name ?? 'Verified User',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.email ?? 'user@example.com',
                      style: TextStyle(fontSize: 13, color: textSecondary),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CustomBadge(
                          text: user?.role ?? 'PASSENGER',
                          color: AppColors.primary,
                          isFilled: true,
                        ),
                        const SizedBox(width: 8),
                        const CustomBadge(
                          text: 'ID VERIFIED',
                          icon: LucideIcons.shieldCheck,
                          color: AppColors.success,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Settings Items List
              Container(
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                ),
                child: Column(
                  children: [
                    // Emergency Contacts
                    ListTile(
                      leading: const Icon(LucideIcons.heartHandshake, color: AppColors.sosRed),
                      title: Text('Trusted Emergency Contacts', style: TextStyle(color: textPrimary, fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: Text('Manage auto-notified contacts on SOS', style: TextStyle(color: textSecondary, fontSize: 12)),
                      trailing: const Icon(LucideIcons.chevronRight, size: 18),
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const EmergencyContactsScreen()),
                        );
                      },
                    ),
                    Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight, height: 1),

                    // Dark Mode Toggle
                    ListTile(
                      leading: Icon(isDark ? LucideIcons.moon : LucideIcons.sun, color: AppColors.taxiYellow),
                      title: Text('Dark Theme Mode', style: TextStyle(color: textPrimary, fontWeight: FontWeight.w600, fontSize: 14)),
                      trailing: Switch(
                        value: themeProvider.isDarkMode,
                        activeThumbColor: AppColors.primary,
                        onChanged: (_) => themeProvider.toggleTheme(),
                      ),
                    ),
                    Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight, height: 1),

                    // Server Configuration
                    ListTile(
                      leading: const Icon(LucideIcons.server, color: AppColors.primary),
                      title: Text('Backend API Server Config', style: TextStyle(color: textPrimary, fontWeight: FontWeight.w600, fontSize: 14)),
                      subtitle: Text(ApiEndpoints.baseUrl, style: TextStyle(color: textSecondary, fontSize: 11)),
                      trailing: const Icon(LucideIcons.chevronRight, size: 18),
                      onTap: () => _showServerHostDialog(context),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Logout Button
              OutlinedButton.icon(
                onPressed: () async {
                  await auth.logout();
                  if (context.mounted) {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  }
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.sosRed),
                  foregroundColor: AppColors.sosRed,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(LucideIcons.logOut, size: 18),
                label: const Text('Sign Out from Device', style: TextStyle(fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
