import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../constants/api_endpoints.dart';
import 'storage_service.dart';

class ApiResponse {
  final bool success;
  final dynamic data;
  final String? message;
  final int statusCode;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    required this.statusCode,
  });
}

class ApiService {
  static final http.Client _client = http.Client();

  static Future<Map<String, String>> _getHeaders() async {
    final token = await StorageService.getToken();
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  static Future<ApiResponse> get(String url) async {
    try {
      final headers = await _getHeaders();
      final response = await _client
          .get(Uri.parse(url), headers: headers)
          .timeout(const Duration(seconds: 12));

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: _getErrorMessage(e),
        statusCode: 0,
      );
    }
  }

  static Future<ApiResponse> post(String url, Map<String, dynamic> body) async {
    try {
      final headers = await _getHeaders();
      final response = await _client
          .post(
            Uri.parse(url),
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 12));

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: _getErrorMessage(e),
        statusCode: 0,
      );
    }
  }

  static Future<ApiResponse> put(String url, Map<String, dynamic> body) async {
    try {
      final headers = await _getHeaders();
      final response = await _client
          .put(
            Uri.parse(url),
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 12));

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: _getErrorMessage(e),
        statusCode: 0,
      );
    }
  }

  static Future<ApiResponse> delete(String url) async {
    try {
      final headers = await _getHeaders();
      final response = await _client
          .delete(Uri.parse(url), headers: headers)
          .timeout(const Duration(seconds: 12));

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: _getErrorMessage(e),
        statusCode: 0,
      );
    }
  }

  static ApiResponse _handleResponse(http.Response response) {
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (_) {
      body = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return ApiResponse(
        success: true,
        data: body,
        message: body is Map ? (body['message'] ?? 'Success') : 'Success',
        statusCode: response.statusCode,
      );
    } else {
      String msg = 'Request failed with status ${response.statusCode}';
      if (body is Map && body['error'] != null) {
        msg = body['error'].toString();
      } else if (body is Map && body['message'] != null) {
        msg = body['message'].toString();
      }
      return ApiResponse(
        success: false,
        data: body,
        message: msg,
        statusCode: response.statusCode,
      );
    }
  }

  static String _getErrorMessage(dynamic e) {
    if (e is SocketException) {
      return 'Network connection error. Check server status at ${ApiEndpoints.baseUrl}';
    }
    return e.toString();
  }
}
