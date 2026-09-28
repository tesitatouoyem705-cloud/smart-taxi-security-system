import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class EmergencyContactsScreen extends StatefulWidget {
  const EmergencyContactsScreen({super.key});

  @override
  State<EmergencyContactsScreen> createState() => _EmergencyContactsScreenState();
}

class _EmergencyContactsScreenState extends State<EmergencyContactsScreen> {
  late List<EmergencyContact> _contacts;

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    _contacts = List.from(auth.user?.emergencyContacts ?? []);
  }

  void _showAddContactDialog() {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final relationController = TextEditingController(text: 'Family');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Add Trusted Emergency Contact', style: TextStyle(color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomTextField(
              label: 'Full Name',
              hint: 'e.g. Sarah Connor',
              controller: nameController,
              prefixIcon: LucideIcons.user,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              label: 'Phone Number',
              hint: '+1 (555) 234-5678',
              controller: phoneController,
              keyboardType: TextInputType.phone,
              prefixIcon: LucideIcons.phone,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              label: 'Relationship',
              hint: 'Family / Friend / Spouse',
              controller: relationController,
              prefixIcon: LucideIcons.heartHandshake,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty && phoneController.text.isNotEmpty) {
                final newContact = EmergencyContact(
                  name: nameController.text.trim(),
                  phone: phoneController.text.trim(),
                  relationship: relationController.text.trim(),
                );

                setState(() => _contacts.add(newContact));
                final auth = Provider.of<AuthProvider>(context, listen: false);
                final nav = Navigator.of(context);
                await auth.updateEmergencyContacts(_contacts);
                if (mounted) nav.pop();

              }
            },
            child: const Text('Save Contact'),
          ),
        ],
      ),
    );
  }

  void _removeContact(int index) async {
    setState(() => _contacts.removeAt(index));
    final auth = Provider.of<AuthProvider>(context, listen: false);
    await auth.updateEmergencyContacts(_contacts);
  }

  void _testCall(String phone) async {
    final Uri uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Emergency Trusted Contacts'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Explanatory Banner
            Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.sosRed.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.sosRed.withOpacity(0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(LucideIcons.heartHandshake, color: AppColors.sosRed, size: 28),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Whenever you trigger SOS or ride in a taxi, your live GPS location beacon is automatically dispatched to these contacts.',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Contacts List
            Expanded(
              child: _contacts.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(LucideIcons.users, size: 48, color: textSecondary.withOpacity(0.5)),
                          const SizedBox(height: 12),
                          Text('No Emergency Contacts Added Yet', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimary)),
                          const SizedBox(height: 6),
                          Text('Add trusted people to receive instant safety alerts', style: TextStyle(fontSize: 13, color: textSecondary)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _contacts.length,
                      itemBuilder: (context, index) {
                        final contact = _contacts[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: AppColors.primary.withOpacity(0.15),
                                child: const Icon(LucideIcons.user, color: AppColors.primary, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      contact.name,
                                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: textPrimary),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      '${contact.phone} • ${contact.relationship}',
                                      style: TextStyle(fontSize: 12, color: textSecondary),
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(LucideIcons.phone, color: AppColors.success, size: 20),
                                tooltip: 'Test Call',
                                onPressed: () => _testCall(contact.phone),
                              ),
                              IconButton(
                                icon: const Icon(LucideIcons.trash2, color: AppColors.sosRed, size: 20),
                                tooltip: 'Remove',
                                onPressed: () => _removeContact(index),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),

            // Add Button
            Padding(
              padding: const EdgeInsets.all(16),
              child: CustomButton(
                text: 'Add Emergency Contact',
                icon: LucideIcons.userPlus,
                onPressed: _showAddContactDialog,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
