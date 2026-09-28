import 'package:flutter/material.dart';
import '../constants/api_endpoints.dart';
import '../models/taxi_model.dart';
import '../services/api_service.dart';

class TaxiProvider extends ChangeNotifier {
  List<TaxiModel> _taxis = [];
  TaxiModel? _scannedTaxi;
  bool _isLoading = false;
  String? _errorMessage;

  List<TaxiModel> get taxis => _taxis;
  TaxiModel? get scannedTaxi => _scannedTaxi;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchAvailableTaxis() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.get(ApiEndpoints.taxis);
      if (response.success && response.data != null) {
        dynamic rawList;
        if (response.data is List) {
          rawList = response.data;
        } else if (response.data is Map && response.data['taxis'] != null) {
          rawList = response.data['taxis'];
        } else {
          rawList = response.data;
        }
        if (rawList is List) {
          _taxis = rawList.map((e) => TaxiModel.fromJson(e is Map<String, dynamic> ? e : {})).toList();
        }
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<TaxiModel?> verifyQRCode(String qrData) async {
    _isLoading = true;
    _errorMessage = null;
    _scannedTaxi = null;
    notifyListeners();

    try {
      final response = await ApiService.post(ApiEndpoints.scanQr, {
        'qrData': qrData.trim(),
        'qrCode': qrData.trim(),
      });

      if (response.success && response.data != null) {
        final taxiJson = (response.data is Map && response.data['taxi'] != null)
            ? response.data['taxi']
            : response.data;
        if (taxiJson is Map<String, dynamic>) {
          _scannedTaxi = TaxiModel.fromJson(taxiJson);
        }
        _isLoading = false;
        notifyListeners();
        return _scannedTaxi;
      } else {
        // Fallback: If QR contains a taxi ID or plate, search locally or fetch
        int? taxiId = int.tryParse(qrData);
        if (taxiId != null) {
          final singleRes = await ApiService.get(ApiEndpoints.taxiById(taxiId));
          if (singleRes.success && singleRes.data != null) {
            _scannedTaxi = TaxiModel.fromJson(singleRes.data['taxi'] ?? singleRes.data);
            _isLoading = false;
            notifyListeners();
            return _scannedTaxi;
          }
        }
        _errorMessage = response.message ?? 'Invalid or unverified Taxi QR Code';
      }
    } catch (e) {
      _errorMessage = e.toString();
    }

    _isLoading = false;
    notifyListeners();
    return null;
  }

  void clearScannedTaxi() {
    _scannedTaxi = null;
    _errorMessage = null;
    notifyListeners();
  }
}
