import 'package:flutter/material.dart';
import '../constants/api_endpoints.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../services/storage_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _token != null && _user != null;

  String get role => _user?.role ?? 'PASSENGER';
  bool get isPassenger => _user?.isPassenger ?? true;
  bool get isDriver => _user?.isDriver ?? false;
  bool get isAdmin => _user?.isAdmin ?? false;
  bool get isPaid => _user?.isPaid ?? false;
  String? get paymentPlan => _user?.paymentPlan;
  String? get subscriptionExpiresAt => _user?.subscriptionExpiresAt;

  Future<void> tryAutoLogin() async {
    _isLoading = true;
    notifyListeners();

    try {
      final savedToken = await StorageService.getToken();
      final savedUser = await StorageService.getUser();

      if (savedToken != null && savedUser != null) {
        _token = savedToken;
        _user = savedUser;
        await SocketService.initSocket();

        // Refresh profile from server in background
        _refreshProfile();
      }
    } catch (e) {
      debugPrint('[AuthProvider] Auto login error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post(ApiEndpoints.login, {
        'email': email.trim(),
        'password': password,
      });

      if (response.success && response.data != null) {
        final data = response.data;
        _token = data['token'];
        if (data['user'] != null) {
          _user = UserModel.fromJson(data['user']);
        } else {
          // Fallback user object
          _user = UserModel(
            id: data['id'] ?? 1,
            name: data['name'] ?? email.split('@')[0],
            email: email,
            role: (data['role'] ?? 'PASSENGER').toString().toUpperCase(),
          );
        }

        await StorageService.saveToken(_token!);
        await StorageService.saveUser(_user!);
        await SocketService.initSocket();

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = response.message ?? 'Invalid credentials';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String role,
    String? phone,
    String? vehicleNumber,
    String? licenseNumber,
    List<EmergencyContact>? emergencyContacts,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final body = <String, dynamic>{
        'name': name.trim(),
        'email': email.trim(),
        'password': password,
        'role': role.toUpperCase(),
        'phone': phone,
        if (vehicleNumber != null && vehicleNumber.isNotEmpty) 'vehicleNumber': vehicleNumber,
        if (licenseNumber != null && licenseNumber.isNotEmpty) 'licenseNumber': licenseNumber,
        if (emergencyContacts != null && emergencyContacts.isNotEmpty)
          'emergencyContacts': emergencyContacts.map((e) => e.toJson()).toList(),
      };

      final response = await ApiService.post(ApiEndpoints.register, body);

      if (response.success && response.data != null) {
        final data = response.data;
        _token = data['token'];
        if (data['user'] != null) {
          _user = UserModel.fromJson(data['user']);
        } else {
          _user = UserModel(
            id: data['id'] ?? 1,
            name: name,
            email: email,
            role: role.toUpperCase(),
            phone: phone,
          );
        }

        if (_token != null) {
          await StorageService.saveToken(_token!);
          await StorageService.saveUser(_user!);
          await SocketService.initSocket();
        }

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = response.message ?? 'Registration failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> _refreshProfile() async {
    try {
      final response = await ApiService.get(ApiEndpoints.profile);
      if (response.success && response.data != null) {
        final userData = (response.data is Map && response.data['user'] != null)
            ? response.data['user']
            : response.data;
        if (userData is Map<String, dynamic>) {
          _user = UserModel.fromJson(userData);
          await StorageService.saveUser(_user!);
          notifyListeners();
        }
      }
    } catch (_) {}
  }

  Future<bool> updateEmergencyContacts(List<EmergencyContact> contacts) async {
    if (_user == null) return false;
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.put(ApiEndpoints.profile, {
        'emergencyContacts': contacts.map((e) => e.toJson()).toList(),
      });

      if (response.success) {
        _user = UserModel(
          id: _user!.id,
          name: _user!.name,
          email: _user!.email,
          role: _user!.role,
          phone: _user!.phone,
          avatar: _user!.avatar,
          isVerified: _user!.isVerified,
          emergencyContacts: contacts,
          vehicleNumber: _user!.vehicleNumber,
          licenseNumber: _user!.licenseNumber,
        );
        await StorageService.saveUser(_user!);
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('[AuthProvider] Update contacts error: $e');
    }
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<Map<String, dynamic>?> initiateDigiPayPayment({
    required String plan,
    required String phone,
    required String operator,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post(ApiEndpoints.paymentInitiate, {
        'plan': plan,
        'phone': phone,
        'operator': operator,
      });

      _isLoading = false;
      notifyListeners();

      if (response.success && response.data != null) {
        return Map<String, dynamic>.from(response.data);
      } else {
        _errorMessage = response.message ?? 'Payment initiation failed';
        return null;
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<bool> verifyDigiPayPayment({required String transactionId}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post(ApiEndpoints.paymentVerify, {
        'transactionId': transactionId,
      });

      _isLoading = false;

      if (response.success && response.data != null) {
        final data = response.data;
        if (data['user'] != null) {
          _user = UserModel.fromJson(data['user']);
        } else if (_user != null) {
          _user = _user!.copyWith(isPaid: true, paymentPlan: data['plan']?['id'] ?? 'DAILY_PASS');
        }
        if (_user != null) {
          await StorageService.saveUser(_user!);
        }
        notifyListeners();
        return true;
      } else {
        _errorMessage = response.message ?? 'Payment verification failed';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> checkPaymentStatus() async {
    try {
      final response = await ApiService.get(ApiEndpoints.paymentStatus);
      if (response.success && response.data != null) {
        final data = response.data;
        final bool serverIsPaid = data['isPaid'] == true;
        if (_user != null && _user!.isPaid != serverIsPaid) {
          _user = _user!.copyWith(
            isPaid: serverIsPaid,
            paymentPlan: data['paymentPlan'],
            subscriptionExpiresAt: data['subscriptionExpiresAt']?.toString(),
          );
          await StorageService.saveUser(_user!);
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('[AuthProvider] Check payment status error: $e');
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    await StorageService.clearAll();
    SocketService.disconnect();
    notifyListeners();
  }
}
