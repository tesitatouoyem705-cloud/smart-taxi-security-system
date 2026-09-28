import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../constants/api_endpoints.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../services/location_service.dart';

class SOSProvider extends ChangeNotifier {
  bool _isEmergencyActive = false;
  Map<String, dynamic>? _activeSOSData;
  Timer? _countdownTimer;
  int _countdownSeconds = 3;
  bool _isCountingDown = false;

  bool get isEmergencyActive => _isEmergencyActive;
  Map<String, dynamic>? get activeSOSData => _activeSOSData;
  int get countdownSeconds => _countdownSeconds;
  bool get isCountingDown => _isCountingDown;

  void startSOSCountdown({
    int? tripId,
    VoidCallback? onTriggered,
    List<dynamic>? emergencyContacts,
  }) {
    _countdownSeconds = 3;
    _isCountingDown = true;
    notifyListeners();

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      if (_countdownSeconds > 1) {
        _countdownSeconds--;
        notifyListeners();
      } else {
        timer.cancel();
        _isCountingDown = false;
        await triggerEmergency(tripId: tripId, emergencyContacts: emergencyContacts);
        if (onTriggered != null) onTriggered();
      }
    });
  }

  void cancelCountdown() {
    _countdownTimer?.cancel();
    _isCountingDown = false;
    _countdownSeconds = 3;
    notifyListeners();
  }

  Future<void> triggerEmergency({
    int? tripId,
    String? customMessage,
    List<dynamic>? emergencyContacts,
  }) async {
    _isEmergencyActive = true;
    _isCountingDown = false;

    // Fetch current GPS position
    final position = await LocationService.getCurrentPosition();
    final double lat = position?.latitude ?? LocationService.defaultLat;
    final double lng = position?.longitude ?? LocationService.defaultLng;
    final String mapsUrl = 'https://maps.google.com/?q=$lat,$lng';

    _activeSOSData = {
      'timestamp': DateTime.now().toIso8601String(),
      'tripId': tripId,
      'latitude': lat,
      'longitude': lng,
      'message': customMessage ?? 'EMERGENCY SOS ALERT: Immediate assistance required!',
    };
    notifyListeners();

    // Broadcast via Socket.IO
    SocketService.sendSOSAlert(
      tripId: tripId,
      latitude: lat,
      longitude: lng,
      message: customMessage,
    );

    // Trigger backend SOS endpoint & emergency contact SMS dispatch
    try {
      if (tripId != null) {
        final res = await ApiService.post(ApiEndpoints.tripSos(tripId), {
          'latitude': lat,
          'longitude': lng,
          'timestamp': DateTime.now().toIso8601String(),
        });
        if (res.success && res.data is Map && (res.data as Map).containsKey('contactsNotified')) {
          _activeSOSData!['contactsNotified'] = res.data['contactsNotified'];
        }
      } else {
        final res = await ApiService.post(ApiEndpoints.sos, {
          'latitude': lat,
          'longitude': lng,
          'message': customMessage ?? 'EMERGENCY SOS ALERT: Immediate assistance required!',
          'timestamp': DateTime.now().toIso8601String(),
        });
        if (res.success && res.data is Map && (res.data as Map).containsKey('contactsNotified')) {
          _activeSOSData!['contactsNotified'] = res.data['contactsNotified'];
        }
      }
    } catch (e) {
      debugPrint('[SOSProvider] Backend SOS notice: $e');
    }

    // Automatically trigger mobile device SMS prompt if emergency contact phone exists
    if (emergencyContacts != null && emergencyContacts.isNotEmpty) {
      try {
        final dynamic firstContact = emergencyContacts.first;
        final String? phone = firstContact is Map ? firstContact['phone'] : firstContact.phone;
        if (phone != null && phone.trim().isNotEmpty) {
          final smsMsg = '🚨 EMERGENCY SOS ALERT! I am in distress and need immediate help. My live GPS location: $mapsUrl';
          final Uri uri = Uri(
            scheme: 'sms',
            path: phone.trim(),
            queryParameters: {'body': smsMsg},
          );
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri);
          }
        }
      } catch (e) {
        debugPrint('[SOSProvider] Mobile auto-SMS launch exception: $e');
      }
    }
  }

  void cancelEmergency() {
    _isEmergencyActive = false;
    _activeSOSData = null;
    _isCountingDown = false;
    notifyListeners();
  }

  Future<void> callEmergencyServices(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }
}
