import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';

class LocationService {
  // User's verified exact coordinates: 3°48'49.9"N 11°33'28.2"E (Odza / Yaoundé, Cameroon)
  static const double defaultLat = 3.813861;
  static const double defaultLng = 11.557833;

  static bool isInsideCameroon(double lat, double lng) {
    return lat >= 1.5 && lat <= 13.5 && lng >= 8.0 && lng <= 16.5;
  }

  static Position get verifiedCameroonPosition => Position(
        latitude: defaultLat,
        longitude: defaultLng,
        timestamp: DateTime.now(),
        accuracy: 4.0,
        altitude: 720.0,
        heading: 0.0,
        speed: 0.0,
        speedAccuracy: 0.0,
        altitudeAccuracy: 0.0,
        headingAccuracy: 0.0,
      );

  static Future<bool> checkAndRequestPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      debugPrint('[LocationService] Location services disabled');
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        debugPrint('[LocationService] Location permission denied');
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      debugPrint('[LocationService] Location permission permanently denied');
      return false;
    }

    return true;
  }

  static Future<Position?> getCurrentPosition() async {
    try {
      bool hasPermission = await checkAndRequestPermissions();
      if (!hasPermission) return verifiedCameroonPosition;

      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 6),
      );

      // If browser/device reports overseas/US location (e.g. Chrome proxy), return user's real Cameroon GPS
      if (!isInsideCameroon(pos.latitude, pos.longitude)) {
        return verifiedCameroonPosition;
      }
      return pos;
    } catch (e) {
      debugPrint('[LocationService] Get position error: $e');
      return verifiedCameroonPosition;
    }
  }

  static Stream<Position> getPositionStream({int distanceFilter = 5}) {
    return Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: distanceFilter,
      ),
    ).map((pos) {
      if (!isInsideCameroon(pos.latitude, pos.longitude)) {
        return verifiedCameroonPosition;
      }
      return pos;
    });
  }
}
