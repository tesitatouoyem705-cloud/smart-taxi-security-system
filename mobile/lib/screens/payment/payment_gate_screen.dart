import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:smart_taxi_security/providers/auth_provider.dart';
import 'package:smart_taxi_security/screens/main_navigation_screen.dart';
import 'package:smart_taxi_security/screens/auth/login_screen.dart';

class PaymentGateScreen extends StatefulWidget {
  const PaymentGateScreen({super.key});

  @override
  State<PaymentGateScreen> createState() => _PaymentGateScreenState();
}

class _PaymentGateScreenState extends State<PaymentGateScreen> with SingleTickerProviderStateMixin {
  String _selectedPlan = 'DAILY_PASS';
  String _selectedOperator = 'MTN_MOMO'; // 'MTN_MOMO', 'ORANGE_MONEY', 'CARD'
  late TextEditingController _phoneController;

  bool _isProcessing = false;
  bool _waitingForUssd = false;
  String? _currentTxId;
  int _countdown = 45;
  Timer? _countdownTimer;

  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  final List<Map<String, dynamic>> _plans = [
    {
      'id': 'DAILY_PASS',
      'name': 'Daily Shield Pass',
      'badge': 'STANDARD',
      'price': '500 XAF',
      'amount': 500,
      'duration': '24 Hours Access',
      'features': [
        'Live Taxi Booking & Dispatch',
        'Real-time GPS Fleet Tracking',
        'One-Tap SOS Police Broadcast'
      ],
      'color': const Color(0xFF00D4FF),
      'isPopular': false,
    },
    {
      'id': 'WEEKLY_PASS',
      'name': 'Weekly Armor Pass',
      'badge': 'MOST POPULAR',
      'price': '2,500 XAF',
      'amount': 2500,
      'duration': '7 Days Full Protection',
      'features': [
        'All Daily Shield Features',
        'Continuous God\'s Eye Telemetry',
        'Automatic Family Live Trip Sharing',
        'Priority Verified Taxi Matching'
      ],
      'color': const Color(0xFF10B981),
      'isPopular': true,
    },
    {
      'id': 'MONTHLY_VIP',
      'name': 'Monthly VIP Protector',
      'badge': 'MAX SECURITY',
      'price': '8,000 XAF',
      'amount': 8000,
      'duration': '30 Days Unrestricted Access',
      'features': [
        'Full 4K CCTV God\'s Eye Live Relay',
        'Direct Rapid Security Intercept',
        'Dedicated VIP Protection Escort Link',
        'Zero-Latency High Priority SOS'
      ],
      'color': const Color(0xFFF59E0B),
      'isPopular': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    final auth = Provider.of<AuthProvider>(context, listen: false);
    String initialPhone = auth.user?.phone ?? '671000001';
    if (initialPhone.startsWith('+237')) {
      initialPhone = initialPhone.replaceFirst('+237', '').trim();
    } else if (initialPhone.startsWith('237')) {
      initialPhone = initialPhone.replaceFirst('237', '').trim();
    }
    _phoneController = TextEditingController(text: initialPhone);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _pulseController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
    _countdown = 45;
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (_countdown > 1) {
        setState(() => _countdown--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _handleInitiatePayment() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty || phone.length < 9) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please enter a valid 9-digit Cameroon phone number (e.g. 671000001)."),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
      _waitingForUssd = false;
    });

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final result = await auth.initiateDigiPayPayment(
      plan: _selectedPlan,
      phone: phone,
      operator: _selectedOperator,
    );

    if (!mounted) return;

    if (result != null && result['transactionId'] != null) {
      final txId = result['transactionId'] as String;
      setState(() {
        _isProcessing = false;
        _waitingForUssd = true;
        _currentTxId = txId;
      });
      _startCountdown();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("📲 DigiPay Prompt Sent! Please approve the ${result['amount']} XAF prompt on your phone."),
          backgroundColor: const Color(0xFF10B981),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 5),
        ),
      );
    } else {
      setState(() => _isProcessing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? "Failed to initiate payment. Please try again."),
          backgroundColor: Colors.redAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _handleConfirmPayment() async {
    if (_currentTxId == null) return;

    setState(() => _isProcessing = true);

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final success = await auth.verifyDigiPayPayment(transactionId: _currentTxId!);

    if (!mounted) return;
    setState(() => _isProcessing = false);

    if (success) {
      _countdownTimer?.cancel();
      _showSuccessDialog();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage ?? "Verification pending. Please ensure you approved the prompt."),
          backgroundColor: Colors.orangeAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF090918),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFF10B981), width: 2),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF10B981).withValues(alpha: 0.15),
                border: Border.all(color: const Color(0xFF10B981), width: 2),
              ),
              child: const Icon(Icons.verified_user, color: Color(0xFF10B981), size: 48),
            ),
            const SizedBox(height: 18),
            const Text(
              "ACCESS UNLOCKED!",
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 18,
                letterSpacing: 1.0,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              "Your DigiPay Security Pass has been verified. SafeRide GPS Fleet Tracking & God's Eye Surveillance are now fully ACTIVE.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 22),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
                  );
                },
                icon: const Icon(Icons.arrow_forward, size: 18),
                label: const Text(
                  "ENTER APP NOW",
                  style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.8),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedPlanObj = _plans.firstWhere((p) => p['id'] == _selectedPlan);

    return Scaffold(
      backgroundColor: const Color(0xFF06060F),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar: Exit / Logout & Title
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0x33FF3B30),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFFF3B30), width: 1.2),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.lock, color: Color(0xFFFF3B30), size: 13),
                        SizedBox(width: 5),
                        Text(
                          "MANDATORY ACTIVATION",
                          style: TextStyle(
                            color: Color(0xFFFF3B30),
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () async {
                      final navigator = Navigator.of(context);
                      final auth = Provider.of<AuthProvider>(context, listen: false);
                      await auth.logout();
                      if (!mounted) return;
                      navigator.pushReplacement(
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    },
                    icon: const Icon(Icons.logout, size: 14, color: Colors.white60),
                    label: const Text(
                      "Sign Out",
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Hero Security Shield Header
              Center(
                child: ScaleTransition(
                  scale: _pulseAnimation,
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF00D4FF).withValues(alpha: 0.12),
                      border: Border.all(color: const Color(0xFF00D4FF), width: 2),
                      boxShadow: const [
                        BoxShadow(color: Color(0x5500D4FF), blurRadius: 18),
                      ],
                    ),
                    child: const Icon(Icons.security, color: Color(0xFF00D4FF), size: 40),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              const Center(
                child: Text(
                  "SafeRide Security Access Pass",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.6,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 6),
              const Center(
                child: Text(
                  "Mandatory pass required under Cameroon Transportation Security Regulations for live taxi tracking, God's Eye satellite recon, and emergency SOS dispatch.",
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                ),
              ),
              const SizedBox(height: 24),

              // Step 1: Select Security Pass Plan
              const Text(
                "1. SELECT SECURITY PLAN",
                style: TextStyle(
                  color: Color(0xFF00D4FF),
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 10),

              // Plans List
              ..._plans.map((p) {
                final isSelected = _selectedPlan == p['id'];
                final Color planColor = p['color'] as Color;

                return GestureDetector(
                  onTap: () => setState(() => _selectedPlan = p['id'] as String),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isSelected ? planColor.withValues(alpha: 0.12) : const Color(0xFF0E0E1E),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? planColor : Colors.white12,
                        width: isSelected ? 2.2 : 1.0,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(color: planColor.withValues(alpha: 0.3), blurRadius: 12),
                            ]
                          : [],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                                  color: isSelected ? planColor : Colors.white38,
                                  size: 18,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  p['name'] as String,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: planColor.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: planColor, width: 1),
                              ),
                              child: Text(
                                p['badge'] as String,
                                style: TextStyle(
                                  color: planColor,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              p['duration'] as String,
                              style: const TextStyle(color: Colors.white60, fontSize: 11),
                            ),
                            Text(
                              p['price'] as String,
                              style: TextStyle(
                                color: planColor,
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Divider(color: Colors.white10, height: 1),
                        const SizedBox(height: 8),
                        // Features bullets
                        ...((p['features'] as List<String>).map((f) => Padding(
                              padding: const EdgeInsets.only(bottom: 3),
                              child: Row(
                                children: [
                                  Icon(Icons.check_circle, color: planColor, size: 12),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      f,
                                      style: const TextStyle(color: Colors.white70, fontSize: 11),
                                    ),
                                  ),
                                ],
                              ),
                            ))),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 16),

              // Step 2: Payment Method (MTN / Orange / Card)
              const Text(
                "2. DIGIPAY PAYMENT OPERATOR",
                style: TextStyle(
                  color: Color(0xFF00D4FF),
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 10),

              Row(
                children: [
                  // MTN MoMo
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedOperator = 'MTN_MOMO'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedOperator == 'MTN_MOMO'
                              ? const Color(0xFFFBBF24).withValues(alpha: 0.15)
                              : const Color(0xFF0E0E1E),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _selectedOperator == 'MTN_MOMO' ? const Color(0xFFFBBF24) : Colors.white12,
                            width: _selectedOperator == 'MTN_MOMO' ? 2 : 1,
                          ),
                        ),
                        child: const Column(
                          children: [
                            Icon(Icons.phone_android, color: Color(0xFFFBBF24), size: 22),
                            SizedBox(height: 4),
                            Text(
                              "MTN MoMo",
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800),
                            ),
                            Text("*126#", style: TextStyle(color: Color(0xFFFBBF24), fontSize: 9.5)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Orange Money
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedOperator = 'ORANGE_MONEY'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedOperator == 'ORANGE_MONEY'
                              ? const Color(0xFFFF6600).withValues(alpha: 0.15)
                              : const Color(0xFF0E0E1E),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _selectedOperator == 'ORANGE_MONEY' ? const Color(0xFFFF6600) : Colors.white12,
                            width: _selectedOperator == 'ORANGE_MONEY' ? 2 : 1,
                          ),
                        ),
                        child: const Column(
                          children: [
                            Icon(Icons.account_balance_wallet, color: Color(0xFFFF6600), size: 22),
                            SizedBox(height: 4),
                            Text(
                              "Orange Money",
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800),
                            ),
                            Text("#150#", style: TextStyle(color: Color(0xFFFF6600), fontSize: 9.5)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Bank Card
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedOperator = 'CARD'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: _selectedOperator == 'CARD'
                              ? const Color(0xFF00D4FF).withValues(alpha: 0.15)
                              : const Color(0xFF0E0E1E),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: _selectedOperator == 'CARD' ? const Color(0xFF00D4FF) : Colors.white12,
                            width: _selectedOperator == 'CARD' ? 2 : 1,
                          ),
                        ),
                        child: const Column(
                          children: [
                            Icon(Icons.credit_card, color: Color(0xFF00D4FF), size: 22),
                            SizedBox(height: 4),
                            Text(
                              "Bank Card",
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800),
                            ),
                            Text("Visa/Master", style: TextStyle(color: Color(0xFF00D4FF), fontSize: 9.5)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Step 3: Phone Number Input
              const Text(
                "3. MOBILE MONEY NUMBER",
                style: TextStyle(
                  color: Color(0xFF00D4FF),
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 8),

              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF0E0E1E),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white24),
                ),
                child: Row(
                  children: [
                    const Text("🇨🇲 +237", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                    const SizedBox(width: 10),
                    const Text("|", style: TextStyle(color: Colors.white30, fontSize: 18)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        decoration: const InputDecoration(
                          hintText: "671 00 00 01",
                          hintStyle: TextStyle(color: Colors.white38),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // If waiting for USSD prompt approval
              if (_waitingForUssd) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0x3310B981),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF10B981), width: 1.5),
                  ),
                  child: Column(
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.phonelink_ring, color: Color(0xFF10B981), size: 26),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  "USSD PROMPT SENT!",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 13,
                                  ),
                                ),
                                Text(
                                  "Check your mobile screen now and enter your MoMo/Orange PIN to validate.",
                                  style: TextStyle(color: Colors.white70, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Auto-verifying in $_countdown s...",
                            style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontFamily: 'monospace'),
                          ),
                          ElevatedButton.icon(
                            onPressed: _isProcessing ? null : _handleConfirmPayment,
                            icon: const Icon(Icons.check, size: 14),
                            label: const Text("I Have Approved", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF10B981),
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Primary DigiPay Checkout Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isProcessing ? null : (_waitingForUssd ? _handleConfirmPayment : _handleInitiatePayment),
                  icon: _isProcessing
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.black),
                        )
                      : const Icon(LucideIcons.shieldCheck, size: 18),
                  label: Text(
                    _isProcessing
                        ? "CONNECTING TO DIGIPAY..."
                        : (_waitingForUssd
                            ? "CONFIRM PAYMENT (${selectedPlanObj['price']})"
                            : "PAY ${selectedPlanObj['price']} VIA DIGIPAY"),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00D4FF),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 6,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // DigiPay Security Footer
              Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.lock, color: Colors.white38, size: 12),
                    const SizedBox(width: 4),
                    Text(
                      "Secured by DigiPay Cameroon SDK • 256-bit Bank Grade Encryption",
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 10),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
