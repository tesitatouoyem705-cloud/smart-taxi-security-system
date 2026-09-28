import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Configurable base URL
  static String get defaultHost {
    if (kIsWeb) {
      final host = Uri.base.host;
      if (host.isNotEmpty && host != 'localhost' && host != '127.0.0.1') {
        return 'http://$host:5000';
      }
      return 'http://localhost:5000';
    }
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:5000';
    }
    return 'http://localhost:5000';
  }


  static String baseUrl = '$defaultHost/api';
  static String socketUrl = defaultHost;

  static void setCustomHost(String host) {
    String cleanHost = host.replaceAll(RegExp(r'/+$'), '');
    if (!cleanHost.startsWith('http://') && !cleanHost.startsWith('https://')) {
      cleanHost = 'http://$cleanHost';
    }
    socketUrl = cleanHost;
    baseUrl = '$cleanHost/api';
  }

  // Auth
  static String get login => '$baseUrl/auth/login';
  static String get register => '$baseUrl/auth/register';

  // Users & Profile
  static String get profile => '$baseUrl/users/profile';
  static String get stats => '$baseUrl/users/stats';
  static String get users => '$baseUrl/users';

  // Taxis
  static String get taxis => '$baseUrl/taxis';
  static String taxiById(dynamic id) => '$baseUrl/taxis/$id';
  static String taxiLocation(dynamic id) => '$baseUrl/taxis/$id/location';

  // Trips
  static String get trips => '$baseUrl/trips';
  static String get activeTrip => '$baseUrl/trips/active';
  static String tripById(dynamic id) => '$baseUrl/trips/$id';
  static String acceptTrip(dynamic id) => '$baseUrl/trips/$id/accept';
  static String startTrip(dynamic id) => '$baseUrl/trips/$id/start';
  static String updateTripLocation(dynamic id) => '$baseUrl/trips/$id/location';
  static String tripSos(dynamic id) => '$baseUrl/trips/$id/sos';
  static String shareTrip(dynamic id) => '$baseUrl/trips/$id/share';
  static String endTrip(dynamic id) => '$baseUrl/trips/$id/end';
  static String cancelTrip(dynamic id) => '$baseUrl/trips/$id/cancel';
  static String rateDriver(dynamic id) => '$baseUrl/trips/$id/rate';
  static String publicTrip(String token) => '$baseUrl/trips/public/$token';

  // QR Code
  static String get scanQr => '$baseUrl/qr/scan';

  // Incidents
  static String get incidents => '$baseUrl/incidents';
  static String get sos => '$baseUrl/incidents/sos';
  static String incidentById(dynamic id) => '$baseUrl/incidents/$id';
  static String incidentStatus(dynamic id) => '$baseUrl/incidents/$id/status';


  // AI Chat & Gemini Assistant
  static String get chat => '$baseUrl/chat';

  // Admin User Management
  static String userStatus(dynamic id) => '$baseUrl/users/$id/status';

  // DigiPay Payments
  static String get paymentPlans => '$baseUrl/payments/plans';
  static String get paymentInitiate => '$baseUrl/payments/initiate';
  static String get paymentVerify => '$baseUrl/payments/verify';
  static String get paymentStatus => '$baseUrl/payments/status';
}
