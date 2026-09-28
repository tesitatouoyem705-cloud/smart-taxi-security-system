import 'package:flutter/material.dart';
import '../constants/api_endpoints.dart';
import '../models/incident_model.dart';
import '../services/api_service.dart';

class IncidentProvider extends ChangeNotifier {
  List<IncidentModel> _incidents = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<IncidentModel> get incidents => _incidents;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchIncidents() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiEndpoints.incidents);
      if (response.success && response.data != null) {
        dynamic rawList;
        if (response.data is List) {
          rawList = response.data;
        } else if (response.data is Map && response.data['incidents'] != null) {
          rawList = response.data['incidents'];
        } else {
          rawList = response.data;
        }
        if (rawList is List) {
          _incidents = rawList.map((e) => IncidentModel.fromJson(e is Map<String, dynamic> ? e : {})).toList();
        }
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> reportIncident({
    int? tripId,
    int? taxiId,
    required String title,
    required String description,
    required String category,
    String? location,
    double? latitude,
    double? longitude,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post(ApiEndpoints.incidents, {
        'tripId': tripId,
        'taxiId': taxiId,
        'title': title.trim(),
        'description': description.trim(),
        'category': category,
        'location': location,
        'latitude': latitude,
        'longitude': longitude,
      });

      if (response.success && response.data != null) {
        final incidentJson = (response.data is Map && response.data['incident'] != null)
            ? response.data['incident']
            : response.data;
        if (incidentJson is Map<String, dynamic>) {
          _incidents.insert(0, IncidentModel.fromJson(incidentJson));
        }
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = response.message ?? 'Failed to submit incident report';
      }
    } catch (e) {
      _errorMessage = e.toString();
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }
}
