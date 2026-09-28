import 'dart:convert';

class EmergencyContact {
  final String name;
  final String phone;
  final String relationship;

  EmergencyContact({
    required this.name,
    required this.phone,
    this.relationship = 'Family',
  });

  factory EmergencyContact.fromJson(Map<String, dynamic> json) {
    return EmergencyContact(
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      relationship: json['relationship'] ?? 'Family',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'relationship': relationship,
    };
  }
}

class UserModel {
  final int id;
  final String name;
  final String email;
  final String role; // 'PASSENGER', 'DRIVER', 'ADMIN', 'SECURITY'
  final String? phone;
  final String? avatar;
  final String status; // 'ACTIVE', 'SUSPENDED', 'BLOCKED'
  final bool isVerified;
  final List<EmergencyContact> emergencyContacts;
  final String? vehicleNumber;
  final String? licenseNumber;
  final bool isPaid;
  final String? paymentPlan;
  final String? subscriptionExpiresAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.avatar,
    this.status = 'ACTIVE',
    this.isVerified = false,
    this.emergencyContacts = const [],
    this.vehicleNumber,
    this.licenseNumber,
    this.isPaid = false,
    this.paymentPlan,
    this.subscriptionExpiresAt,
  });

  bool get isPassenger => role.toUpperCase() == 'PASSENGER';
  bool get isDriver => role.toUpperCase() == 'DRIVER';
  bool get isAdmin => role.toUpperCase() == 'ADMIN';
  bool get isSecurity => role.toUpperCase() == 'SECURITY';

  UserModel copyWith({
    int? id,
    String? name,
    String? email,
    String? role,
    String? phone,
    String? avatar,
    String? status,
    bool? isVerified,
    List<EmergencyContact>? emergencyContacts,
    String? vehicleNumber,
    String? licenseNumber,
    bool? isPaid,
    String? paymentPlan,
    String? subscriptionExpiresAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      status: status ?? this.status,
      isVerified: isVerified ?? this.isVerified,
      emergencyContacts: emergencyContacts ?? this.emergencyContacts,
      vehicleNumber: vehicleNumber ?? this.vehicleNumber,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      isPaid: isPaid ?? this.isPaid,
      paymentPlan: paymentPlan ?? this.paymentPlan,
      subscriptionExpiresAt: subscriptionExpiresAt ?? this.subscriptionExpiresAt,
    );
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    List<EmergencyContact> contacts = [];
    if (json['emergencyContacts'] != null) {
      dynamic rawContacts = json['emergencyContacts'];
      if (rawContacts is String) {
        try {
          rawContacts = jsonDecode(rawContacts);
        } catch (_) {}
      }
      if (rawContacts is List) {
        contacts = rawContacts
            .map((e) => EmergencyContact.fromJson(e is Map<String, dynamic> ? e : {}))
            .toList();
      }
    }

    return UserModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: (json['role'] ?? 'PASSENGER').toString().toUpperCase(),
      phone: json['phone'],
      avatar: json['avatar'],
      status: (json['status'] ?? 'ACTIVE').toString().toUpperCase(),
      isVerified: json['isVerified'] == true || json['status'] == 'ACTIVE',
      emergencyContacts: contacts,
      vehicleNumber: json['vehicleNumber'],
      licenseNumber: json['licenseNumber'],
      isPaid: json['isPaid'] == true,
      paymentPlan: json['paymentPlan'],
      subscriptionExpiresAt: json['subscriptionExpiresAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'phone': phone,
      'avatar': avatar,
      'status': status,
      'isVerified': isVerified,
      'emergencyContacts': emergencyContacts.map((e) => e.toJson()).toList(),
      'vehicleNumber': vehicleNumber,
      'licenseNumber': licenseNumber,
      'isPaid': isPaid,
      'paymentPlan': paymentPlan,
      'subscriptionExpiresAt': subscriptionExpiresAt,
    };
  }
}
