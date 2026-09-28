import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../constants/api_endpoints.dart';
import 'storage_service.dart';

class SocketService {
  static IO.Socket? _socket;
  static bool _isConnected = false;

  static bool get isConnected => _isConnected;

  // Streams for real-time events
  static final _locationController = StreamController<Map<String, dynamic>>.broadcast();
  static final _sosController = StreamController<Map<String, dynamic>>.broadcast();
  static final _tripStatusController = StreamController<Map<String, dynamic>>.broadcast();
  static final _chatController = StreamController<Map<String, dynamic>>.broadcast();

  static Stream<Map<String, dynamic>> get locationStream => _locationController.stream;
  static Stream<Map<String, dynamic>> get sosStream => _sosController.stream;
  static Stream<Map<String, dynamic>> get tripStatusStream => _tripStatusController.stream;
  static Stream<Map<String, dynamic>> get chatStream => _chatController.stream;

  static Future<void> initSocket() async {
    if (_socket != null && _socket!.connected) return;

    try {
      final token = await StorageService.getToken();

      _socket = IO.io(
        ApiEndpoints.socketUrl,
        IO.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .disableAutoConnect()
            .setExtraHeaders(token != null ? {'Authorization': 'Bearer $token'} : {})
            .build(),
      );

      _socket!.onConnect((_) {
        _isConnected = true;
        debugPrint('[SocketService] Connected to ${ApiEndpoints.socketUrl}');
      });

      _socket!.onDisconnect((_) {
        _isConnected = false;
        debugPrint('[SocketService] Disconnected');
      });

      _socket!.onConnectError((err) {
        _isConnected = false;
        debugPrint('[SocketService] Connect Error: $err');
      });

      // Listen for trip telemetry location updates
      _socket!.on('trip_location', (data) {
        if (data is Map) {
          _locationController.add(Map<String, dynamic>.from(data));
        }
      });

      // Listen for SOS alerts
      void handleSOSData(dynamic data) {
        if (data is Map) {
          _sosController.add(Map<String, dynamic>.from(data));
        }
      }
      _socket!.on('sos_alert', handleSOSData);
      _socket!.on('emergency:sos-alert', handleSOSData);
      _socket!.on('emergency_sos_alert', handleSOSData);

      // Listen for Trip Status updates
      _socket!.on('trip_status_changed', (data) {
        if (data is Map) {
          _tripStatusController.add(Map<String, dynamic>.from(data));
        }
      });

      // Listen for chat messages
      _socket!.on('receive_message', (data) {
        if (data is Map) {
          _chatController.add(Map<String, dynamic>.from(data));
        }
      });

      _socket!.connect();
    } catch (e) {
      debugPrint('[SocketService] Init error: $e');
    }
  }

  static void joinTripRoom(int tripId) {
    if (_socket != null && _isConnected) {
      _socket!.emit('join_trip', {'tripId': tripId});
      _socket!.emit('join-trip', tripId);
      debugPrint('[SocketService] Joined trip room: $tripId');
    }
  }

  static void leaveTripRoom(int tripId) {
    if (_socket != null && _isConnected) {
      _socket!.emit('leave_trip', {'tripId': tripId});
    }
  }

  static void broadcastLocation({
    required int tripId,
    required double latitude,
    required double longitude,
    double? speed,
    double? heading,
  }) {
    if (_socket != null && _isConnected) {
      _socket!.emit('trip_location', {
        'tripId': tripId,
        'latitude': latitude,
        'longitude': longitude,
        'speed': speed ?? 0.0,
        'heading': heading ?? 0.0,
        'timestamp': DateTime.now().toIso8601String(),
      });
      _socket!.emit('trip-location', {
        'tripId': tripId,
        'latitude': latitude,
        'longitude': longitude,
        'heading': heading ?? 0,
        'speed': speed ?? 38,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });
    }
  }

  static void sendSOSAlert({
    int? tripId,
    required double latitude,
    required double longitude,
    String? message,
  }) {
    if (_socket != null && _isConnected) {
      final payload = {
        'tripId': tripId,
        'latitude': latitude,
        'longitude': longitude,
        'message': message ?? 'EMERGENCY SOS TRIGGERED!',
        'timestamp': DateTime.now().toIso8601String(),
      };
      _socket!.emit('sos_alert', payload);
      _socket!.emit('emergency:sos', payload);
    }
  }


  static void sendChatMessage({
    required int tripId,
    required int senderId,
    required String senderName,
    required String senderRole,
    required String message,
  }) {
    if (_socket != null && _isConnected) {
      _socket!.emit('send_message', {
        'tripId': tripId,
        'senderId': senderId,
        'senderName': senderName,
        'senderRole': senderRole,
        'message': message,
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }
}
