import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../models/user_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/trip_provider.dart';
import '../../providers/taxi_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../main_navigation_screen.dart';
import '../payment/payment_gate_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _vehicleNumberController = TextEditingController();
  final _licenseNumberController = TextEditingController();
  final _emergencyContactNameController = TextEditingController();
  final _emergencyContactPhoneController = TextEditingController();

  final _formKey = GlobalKey<FormState>();
  String _selectedRole = 'PASSENGER';
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _vehicleNumberController.dispose();
    _licenseNumberController.dispose();
    _emergencyContactNameController.dispose();
    _emergencyContactPhoneController.dispose();
    super.dispose();
  }

  void _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final tripProvider = Provider.of<TripProvider>(context, listen: false);
    final taxiProvider = Provider.of<TaxiProvider>(context, listen: false);

    List<EmergencyContact> emergencyContacts = [];
    if (_emergencyContactNameController.text.isNotEmpty && _emergencyContactPhoneController.text.isNotEmpty) {
      emergencyContacts.add(
        EmergencyContact(
          name: _emergencyContactNameController.text.trim(),
          phone: _emergencyContactPhoneController.text.trim(),
          relationship: 'Primary Contact',
        ),
      );
    }

    final success = await authProvider.register(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      password: _passwordController.text,
      role: _selectedRole,
      phone: _phoneController.text.trim(),
      vehicleNumber: _selectedRole == 'DRIVER' ? _vehicleNumberController.text.trim() : null,
      licenseNumber: _selectedRole == 'DRIVER' ? _licenseNumberController.text.trim() : null,
      emergencyContacts: emergencyContacts,
    );

    if (success && mounted) {
      if (authProvider.isPassenger && !authProvider.isPaid) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const PaymentGateScreen()),
          (route) => false,
        );
        return;
      }

      tripProvider.fetchActiveTrip();
      taxiProvider.fetchAvailableTaxis();
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        (route) => false,
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Registration failed'),
          backgroundColor: AppColors.sosRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Join SafeRide',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Choose your account type to get verified',
                  style: TextStyle(fontSize: 14, color: textSecondary),
                ),
                const SizedBox(height: 20),

                // Role Selector Tabs
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedRole = 'PASSENGER'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _selectedRole == 'PASSENGER' ? AppColors.primary : (isDark ? AppColors.cardDark : AppColors.surfaceLight),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _selectedRole == 'PASSENGER' ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight),
                            ),
                          ),
                          child: Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  LucideIcons.user,
                                  size: 18,
                                  color: _selectedRole == 'PASSENGER' ? Colors.white : textSecondary,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Passenger',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14,
                                    color: _selectedRole == 'PASSENGER' ? Colors.white : textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedRole = 'DRIVER'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: _selectedRole == 'DRIVER' ? AppColors.primary : (isDark ? AppColors.cardDark : AppColors.surfaceLight),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _selectedRole == 'DRIVER' ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight),
                            ),
                          ),
                          child: Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  LucideIcons.car,
                                  size: 18,
                                  color: _selectedRole == 'DRIVER' ? Colors.white : textSecondary,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Driver',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w700,
                                    fontSize: 14,
                                    color: _selectedRole == 'DRIVER' ? Colors.white : textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                CustomTextField(
                  label: 'Full Name',
                  hint: 'John Doe',
                  controller: _nameController,
                  prefixIcon: LucideIcons.user,
                  validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 14),

                CustomTextField(
                  label: 'Email Address',
                  hint: 'john@example.com',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: LucideIcons.mail,
                  validator: (val) => val == null || !val.contains('@') ? 'Enter a valid email' : null,
                ),
                const SizedBox(height: 14),

                CustomTextField(
                  label: 'Phone Number',
                  hint: '+1 (555) 019-2834',
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  prefixIcon: LucideIcons.phone,
                  validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 14),

                CustomTextField(
                  label: 'Password',
                  hint: '••••••••',
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  prefixIcon: LucideIcons.lock,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                      size: 20,
                      color: textSecondary,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  validator: (val) => val == null || val.length < 6 ? 'Min 6 characters' : null,
                ),
                const SizedBox(height: 16),

                // Driver Specific Inputs
                if (_selectedRole == 'DRIVER') ...[
                  CustomTextField(
                    label: 'Vehicle Plate Number',
                    hint: 'NYC-7842-TX',
                    controller: _vehicleNumberController,
                    prefixIcon: LucideIcons.car,
                    validator: (val) => val == null || val.isEmpty ? 'Required for drivers' : null,
                  ),
                  const SizedBox(height: 14),
                  CustomTextField(
                    label: 'Driver License / Badge ID',
                    hint: 'DL-98234-NY',
                    controller: _licenseNumberController,
                    prefixIcon: LucideIcons.award,
                    validator: (val) => val == null || val.isEmpty ? 'Required for drivers' : null,
                  ),
                  const SizedBox(height: 16),
                ],

                // Passenger Emergency Contact Input
                if (_selectedRole == 'PASSENGER') ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.cardDark : AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(LucideIcons.heartHandshake, color: AppColors.sosRed, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'EMERGENCY CONTACT (FOR SOS)',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        CustomTextField(
                          label: 'Trusted Contact Name',
                          hint: 'e.g. Mom / Spouse',
                          controller: _emergencyContactNameController,
                          prefixIcon: LucideIcons.userPlus,
                        ),
                        const SizedBox(height: 10),
                        CustomTextField(
                          label: 'Trusted Contact Phone',
                          hint: '+1 (555) 012-3456',
                          controller: _emergencyContactPhoneController,
                          keyboardType: TextInputType.phone,
                          prefixIcon: LucideIcons.phoneCall,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                CustomButton(
                  text: 'Complete Registration',
                  isLoading: authProvider.isLoading,
                  onPressed: _handleRegister,
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
