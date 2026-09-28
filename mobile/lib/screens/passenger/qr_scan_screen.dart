import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:smart_taxi_security/constants/app_icons.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/taxi_provider.dart';
import 'taxi_verification_sheet.dart';

class QRScanScreen extends StatefulWidget {
  const QRScanScreen({super.key});

  @override
  State<QRScanScreen> createState() => _QRScanScreenState();
}

class _QRScanScreenState extends State<QRScanScreen> {
  late final MobileScannerController _scannerController;
  bool _hasScanned = false;
  final TextEditingController _manualCodeController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _scannerController = MobileScannerController(
      facing: kIsWeb ? CameraFacing.front : CameraFacing.back,
      detectionSpeed: DetectionSpeed.normal,
      torchEnabled: false,
    );
  }

  @override
  void dispose() {
    _scannerController.dispose();
    _manualCodeController.dispose();
    super.dispose();
  }


  void _onDetect(BarcodeCapture capture) async {
    if (_hasScanned) return;
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isNotEmpty && barcodes.first.rawValue != null) {
      setState(() => _hasScanned = true);
      final String code = barcodes.first.rawValue!;
      await _processCode(code);
    }
  }

  Future<void> _processCode(String code) async {
    final taxiProvider = Provider.of<TaxiProvider>(context, listen: false);
    final taxi = await taxiProvider.verifyQRCode(code);

    if (taxi != null && mounted) {
      TaxiVerificationSheet.show(context, taxi);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(taxiProvider.errorMessage ?? 'Taxi QR not found. Please verify code.'),
          backgroundColor: AppColors.sosRed,
        ),
      );
      setState(() => _hasScanned = false);
    }
  }

  void _showManualEntryDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardDark,
        title: const Text('Enter Taxi QR Code / ID', style: TextStyle(color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Type vehicle plate/fleet code or select a demo taxi:',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ActionChip(
                  label: const Text('TX-901', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  backgroundColor: AppColors.taxiYellow.withOpacity(0.2),
                  side: const BorderSide(color: AppColors.taxiYellow),
                  onPressed: () {
                    Navigator.pop(context);
                    _processCode('TX-901');
                  },
                ),
                ActionChip(
                  label: const Text('TX-902', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  backgroundColor: AppColors.primary.withOpacity(0.2),
                  side: const BorderSide(color: AppColors.primary),
                  onPressed: () {
                    Navigator.pop(context);
                    _processCode('TX-902');
                  },
                ),
                ActionChip(
                  label: const Text('TX-903', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  backgroundColor: AppColors.success.withOpacity(0.2),
                  side: const BorderSide(color: AppColors.success),
                  onPressed: () {
                    Navigator.pop(context);
                    _processCode('TX-903');
                  },
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _manualCodeController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                hintText: 'e.g. TX-901 or 1',
                hintStyle: TextStyle(color: Colors.white38),
                filled: true,
                fillColor: AppColors.surfaceDark,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final code = _manualCodeController.text.trim();
              Navigator.pop(context);
              if (code.isNotEmpty) {
                _processCode(code);
              }
            },
            child: const Text('Verify'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final taxiProvider = Provider.of<TaxiProvider>(context);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'Scan Taxi Security QR',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.switch_camera, color: Colors.white),
            tooltip: 'Switch Camera (Front/Back)',
            onPressed: () => _scannerController.switchCamera(),
          ),

          IconButton(
            icon: const Icon(LucideIcons.flashlight, color: Colors.white),
            tooltip: 'Toggle Torch / Flashlight',
            onPressed: () => _scannerController.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(LucideIcons.keyboard, color: Colors.white),
            tooltip: 'Enter code manually / Demo',
            onPressed: _showManualEntryDialog,
          ),
        ],

      ),
      body: Stack(
        children: [
          // Camera Scanner
          MobileScanner(
            controller: _scannerController,
            onDetect: _onDetect,
            errorBuilder: (context, error, child) {
              return Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.taxiYellow.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.qr_code_scanner, color: AppColors.taxiYellow, size: 54),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Taxi Security Verification',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Camera permission needed or stream inactive. On PC, ensure camera access is allowed in browser settings.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          ElevatedButton.icon(
                            onPressed: () async {
                              try {
                                await _scannerController.stop();
                                await _scannerController.start();
                              } catch (_) {
                                await _scannerController.switchCamera();
                              }
                            },
                            icon: const Icon(Icons.videocam, size: 16),
                            label: const Text('Retry / Switch Camera', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Quick 1-Tap Taxi Verification Cards
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.cardDark,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.borderDark),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'SELECT DEMO TAXI TO VERIFY:',
                              style: TextStyle(color: AppColors.taxiYellow, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                            ),
                            const SizedBox(height: 10),
                            InkWell(
                              onTap: () => _processCode('TX-901'),
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                margin: const EdgeInsets.only(bottom: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white10,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.white24),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(LucideIcons.car, color: AppColors.taxiYellow, size: 18),
                                    SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('TX-901 • Marcus Vance', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                          Text('Toyota Camry Hybrid (NYC-7842-TX)', style: TextStyle(color: Colors.white70, fontSize: 10)),
                                        ],
                                      ),
                                    ),
                                    Icon(Icons.chevron_right, color: Colors.white54, size: 18),
                                  ],
                                ),
                              ),
                            ),
                            InkWell(
                              onTap: () => _processCode('TX-902'),
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                margin: const EdgeInsets.only(bottom: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white10,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.white24),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(LucideIcons.car, color: AppColors.primary, size: 18),
                                    SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('TX-902 • Sophia Chen', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                          Text('Tesla Model Y Security (NYC-4319-TX)', style: TextStyle(color: Colors.white70, fontSize: 10)),
                                        ],
                                      ),
                                    ),
                                    Icon(Icons.chevron_right, color: Colors.white54, size: 18),
                                  ],
                                ),
                              ),
                            ),
                            InkWell(
                              onTap: () => _processCode('TX-903'),
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: Colors.white10,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.white24),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(LucideIcons.car, color: AppColors.success, size: 18),
                                    SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('TX-903 • Derrick Hayes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                          Text('Ford Explorer Interceptor (NYC-8821-TX)', style: TextStyle(color: Colors.white70, fontSize: 10)),
                                        ],
                                      ),
                                    ),
                                    Icon(Icons.chevron_right, color: Colors.white54, size: 18),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _manualCodeController,
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                              decoration: InputDecoration(
                                hintText: 'Enter Plate / Fleet Code...',
                                hintStyle: const TextStyle(color: Colors.white38, fontSize: 12),
                                filled: true,
                                fillColor: AppColors.cardDark,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: () {
                              final code = _manualCodeController.text.trim();
                              if (code.isNotEmpty) _processCode(code);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.taxiYellow,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Verify', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },

          ),

          // Targeting Scanner Overlay Box
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.taxiYellow, width: 3),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.taxiYellow.withOpacity(0.25),
                    blurRadius: 16,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      'ALIGN TAXI QR IN FRAME',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1,
                        backgroundColor: Colors.black54,
                      ),
                    ),
                  ),
                  Icon(LucideIcons.qrCode, color: Colors.white38, size: 60),
                  Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Text(
                      'Located on passenger door or dash',
                      style: TextStyle(color: Colors.white70, fontSize: 11, backgroundColor: Colors.black54),
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (taxiProvider.isLoading)
            Container(
              color: Colors.black54,
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(valueColor: AlwaysStoppedAnimation<Color>(AppColors.taxiYellow)),
                    SizedBox(height: 16),
                    Text(
                      'Verifying Taxi Security Credentials...',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ),

          // Bottom instruction card
          Positioned(
            left: 20,
            right: 20,
            bottom: 30,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardDark.withOpacity(0.92),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderDark),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.shieldCheck, color: AppColors.success, size: 24),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Never board an unverified taxi. Scanning verifies official licensing & links live GPS safety.',
                      style: TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                  TextButton(
                    onPressed: _showManualEntryDialog,
                    child: const Text('Type Code', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
