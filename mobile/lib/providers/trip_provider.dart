import 'dart:async';
import 'package:flutter/material.dart';
import '../constants/api_endpoints.dart';
import '../models/trip_model.dart';
import '../models/taxi_model.dart';
import '../models/chat_message_model.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

class TripProvider extends ChangeNotifier {
  TripModel? _currentTrip;
  TaxiModel? _currentTaxi;
  List<TripModel> _tripsHistory = [];
  List<ChatMessageModel> _chatMessages = [];
  bool _isLoading = false;
  String? _errorMessage;

  StreamSubscription? _locationSubscription;
  StreamSubscription? _tripStatusSubscription;
  StreamSubscription? _chatSubscription;
  StreamSubscription? _sosSubscription;

  TripModel? get currentTrip => _currentTrip;
  TaxiModel? get currentTaxi => _currentTaxi;
  List<TripModel> get tripsHistory => _tripsHistory;
  List<ChatMessageModel> get chatMessages => _chatMessages;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get hasActiveTrip => _currentTrip != null && _currentTrip!.isActive;

  TripProvider() {
    _listenToSocketEvents();
  }

  void _listenToSocketEvents() {
    _locationSubscription = SocketService.locationStream.listen((data) {
      if (_currentTrip != null && data['tripId'] == _currentTrip!.id) {
        final double lat = (data['latitude'] != null ? double.tryParse(data['latitude'].toString()) : null) ?? _currentTrip!.currentLatitude;
        final double lng = (data['longitude'] != null ? double.tryParse(data['longitude'].toString()) : null) ?? _currentTrip!.currentLongitude;

        _currentTrip = _currentTrip!.copyWith(
          currentLatitude: lat,
          currentLongitude: lng,
        );
        notifyListeners();
      }
    });

    _tripStatusSubscription = SocketService.tripStatusStream.listen((data) {
      if (_currentTrip != null && data['tripId'] == _currentTrip!.id) {
        final newStatus = data['status']?.toString() ?? _currentTrip!.status;
        _currentTrip = _currentTrip!.copyWith(status: newStatus);
        notifyListeners();
      }
    });

    _chatSubscription = SocketService.chatStream.listen((data) {
      if (_currentTrip != null && data['tripId'] == _currentTrip!.id) {
        final message = ChatMessageModel.fromJson(data, _currentTrip!.passengerId);
        _chatMessages.add(message);
        notifyListeners();
      }
    });

    _sosSubscription = SocketService.sosStream.listen((data) {
      if (_currentTrip != null && data['tripId'] == _currentTrip!.id) {
        _currentTrip = _currentTrip!.copyWith(
          isSosActive: true,
          status: 'EMERGENCY_SOS',
        );
        notifyListeners();
      }
    });
  }

  Future<void> fetchActiveTrip() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiEndpoints.activeTrip);
      if (response.success && response.data != null) {
        final data = response.data;
        if (data is Map && data['trip'] != null) {
          _currentTrip = TripModel.fromJson(data['trip']);
          if (data['taxi'] != null && data['taxi'] is Map<String, dynamic>) {
            _currentTaxi = TaxiModel.fromJson(data['taxi']);
          }
          SocketService.joinTripRoom(_currentTrip!.id);
        } else {
          _currentTrip = null;
        }
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchTripsHistory() async {
    try {
      final response = await ApiService.get(ApiEndpoints.trips);
      if (response.success && response.data != null) {
        dynamic rawList;
        if (response.data is List) {
          rawList = response.data;
        } else if (response.data is Map && response.data['trips'] != null) {
          rawList = response.data['trips'];
        } else {
          rawList = response.data;
        }
        if (rawList is List) {
          _tripsHistory = rawList.map((e) => TripModel.fromJson(e is Map<String, dynamic> ? e : {})).toList();
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('[TripProvider] Fetch history error: $e');
    }
  }

  Future<bool> requestTrip({
    required int passengerId,
    required String passengerName,
    required String pickupAddress,
    required String dropoffAddress,
    required double startLatitude,
    required double startLongitude,
    required double dropoffLatitude,
    required double dropoffLongitude,
    int? taxiId,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post(ApiEndpoints.trips, {
        'passengerId': passengerId,
        'passengerName': passengerName,
        'pickupAddress': pickupAddress,
        'dropoffAddress': dropoffAddress,
        'startLatitude': startLatitude,
        'startLongitude': startLongitude,
        'dropoffLatitude': dropoffLatitude,
        'dropoffLongitude': dropoffLongitude,
        'taxiId': taxiId,
      });

      if (response.success && response.data != null) {
        final data = response.data;
        _currentTrip = TripModel.fromJson(data['trip'] ?? data);
        if (data['taxi'] != null) {
          _currentTaxi = TaxiModel.fromJson(data['taxi']);
        }
        SocketService.joinTripRoom(_currentTrip!.id);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = response.message ?? 'Failed to request ride';
      }
    } catch (e) {
      _errorMessage = e.toString();
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> startTrip() async {
    if (_currentTrip == null) return false;
    try {
      final response = await ApiService.put(ApiEndpoints.startTrip(_currentTrip!.id), {});
      if (response.success) {
        _currentTrip = _currentTrip!.copyWith(status: 'IN_TRANSIT');
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('[TripProvider] Start trip error: $e');
    }
    return false;
  }

  Future<bool> endTrip() async {
    if (_currentTrip == null) return false;
    try {
      final response = await ApiService.put(ApiEndpoints.endTrip(_currentTrip!.id), {});
      if (response.success) {
        _currentTrip = _currentTrip!.copyWith(status: 'COMPLETED');
        SocketService.leaveTripRoom(_currentTrip!.id);
        fetchTripsHistory();
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('[TripProvider] End trip error: $e');
    }
    return false;
  }

  Future<bool> cancelTrip() async {
    if (_currentTrip == null) return false;
    try {
      final response = await ApiService.put(ApiEndpoints.cancelTrip(_currentTrip!.id), {});
      if (response.success) {
        SocketService.leaveTripRoom(_currentTrip!.id);
        _currentTrip = null;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('[TripProvider] Cancel trip error: $e');
    }
    return false;
  }

  Future<bool> rateDriver(int rating, String review) async {
    if (_currentTrip == null) return false;
    try {
      final response = await ApiService.post(ApiEndpoints.rateDriver(_currentTrip!.id), {
        'rating': rating,
        'review': review,
      });
      return response.success;
    } catch (e) {
      debugPrint('[TripProvider] Rate driver error: $e');
      return false;
    }
  }

  void updateLocationManually(double lat, double lng) {
    if (_currentTrip != null) {
      _currentTrip = _currentTrip!.copyWith(
        currentLatitude: lat,
        currentLongitude: lng,
      );
      SocketService.broadcastLocation(
        tripId: _currentTrip!.id,
        latitude: lat,
        longitude: lng,
      );
      notifyListeners();
    }
  }

  void sendMessage(int senderId, String senderName, String senderRole, String text) {
    if (_currentTrip == null || text.trim().isEmpty) return;
    
    final message = ChatMessageModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      tripId: _currentTrip!.id,
      senderId: senderId,
      senderName: senderName,
      senderRole: senderRole,
      message: text.trim(),
      timestamp: DateTime.now(),
      isMe: true,
    );

    _chatMessages.add(message);
    SocketService.sendChatMessage(
      tripId: _currentTrip!.id,
      senderId: senderId,
      senderName: senderName,
      senderRole: senderRole,
      message: text.trim(),
    );
    notifyListeners();
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    _tripStatusSubscription?.cancel();
    _chatSubscription?.cancel();
    _sosSubscription?.cancel();
    super.dispose();
  }
}
