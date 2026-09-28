class TripModel {
  final int id;
  final int passengerId;
  final String? passengerName;
  final String? passengerPhone;
  final int? driverId;
  final String? driverName;
  final String? driverPhone;
  final int? taxiId;
  final String? vehicleNumber;
  final String? vehicleModel;
  final String pickupAddress;
  final String dropoffAddress;
  final double startLatitude;
  final double startLongitude;
  final double dropoffLatitude;
  final double dropoffLongitude;
  final double currentLatitude;
  final double currentLongitude;
  final double fare;
  final double distanceKm;
  final int durationMin;
  final String status; // 'REQUESTED', 'ACCEPTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'EMERGENCY_SOS'
  final String? shareToken;
  final DateTime createdAt;
  final bool isSosActive;

  TripModel({
    required this.id,
    required this.passengerId,
    this.passengerName,
    this.passengerPhone,
    this.driverId,
    this.driverName,
    this.driverPhone,
    this.taxiId,
    this.vehicleNumber,
    this.vehicleModel,
    required this.pickupAddress,
    required this.dropoffAddress,
    required this.startLatitude,
    required this.startLongitude,
    required this.dropoffLatitude,
    required this.dropoffLongitude,
    required this.currentLatitude,
    required this.currentLongitude,
    this.fare = 0.0,
    this.distanceKm = 0.0,
    this.durationMin = 0,
    this.status = 'REQUESTED',
    this.shareToken,
    DateTime? createdAt,
    this.isSosActive = false,
  }) : createdAt = createdAt ?? DateTime.now();

  bool get isActive => status == 'REQUESTED' || status == 'ACCEPTED' || status == 'IN_TRANSIT' || status == 'EMERGENCY_SOS';
  bool get isInTransit => status == 'IN_TRANSIT' || status == 'EMERGENCY_SOS';
  bool get isCompleted => status == 'COMPLETED';

  factory TripModel.fromJson(Map<String, dynamic> json) {
    return TripModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      passengerId: json['passengerId'] is int ? json['passengerId'] : int.tryParse(json['passengerId']?.toString() ?? '0') ?? 0,
      passengerName: json['passengerName'] ?? json['passenger']?['name'],
      passengerPhone: json['passengerPhone'] ?? json['passenger']?['phone'],
      driverId: json['driverId'] != null ? int.tryParse(json['driverId'].toString()) : null,
      driverName: json['driverName'] ?? json['driver']?['name'],
      driverPhone: json['driverPhone'] ?? json['driver']?['phone'],
      taxiId: json['taxiId'] != null ? int.tryParse(json['taxiId'].toString()) : null,
      vehicleNumber: json['vehicleNumber'] ?? json['taxi']?['vehicleNumber'],
      vehicleModel: json['vehicleModel'] ?? json['taxi']?['model'],
      pickupAddress: json['pickupAddress'] ?? 'Pickup Location',
      dropoffAddress: json['dropoffAddress'] ?? 'Destination Location',
      startLatitude: (json['startLatitude'] != null ? double.tryParse(json['startLatitude'].toString()) : null) ?? 3.8820,
      startLongitude: (json['startLongitude'] != null ? double.tryParse(json['startLongitude'].toString()) : null) ?? 11.5210,
      dropoffLatitude: (json['dropoffLatitude'] != null ? double.tryParse(json['dropoffLatitude'].toString()) : null) ?? 3.8910,
      dropoffLongitude: (json['dropoffLongitude'] != null ? double.tryParse(json['dropoffLongitude'].toString()) : null) ?? 11.5130,
      currentLatitude: (json['currentLatitude'] != null ? double.tryParse(json['currentLatitude'].toString()) : null) ?? 3.8750,
      currentLongitude: (json['currentLongitude'] != null ? double.tryParse(json['currentLongitude'].toString()) : null) ?? 11.5190,
      fare: (json['fare'] != null ? double.tryParse(json['fare'].toString()) : null) ?? 15.0,
      distanceKm: (json['distanceKm'] != null ? double.tryParse(json['distanceKm'].toString()) : null) ?? 3.2,
      durationMin: (json['durationMin'] != null ? int.tryParse(json['durationMin'].toString()) : null) ?? 12,
      status: json['status'] ?? 'REQUESTED',
      shareToken: json['shareToken'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
      isSosActive: json['isSosActive'] == true || json['status'] == 'EMERGENCY_SOS',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'passengerId': passengerId,
      'passengerName': passengerName,
      'passengerPhone': passengerPhone,
      'driverId': driverId,
      'driverName': driverName,
      'driverPhone': driverPhone,
      'taxiId': taxiId,
      'vehicleNumber': vehicleNumber,
      'vehicleModel': vehicleModel,
      'pickupAddress': pickupAddress,
      'dropoffAddress': dropoffAddress,
      'startLatitude': startLatitude,
      'startLongitude': startLongitude,
      'dropoffLatitude': dropoffLatitude,
      'dropoffLongitude': dropoffLongitude,
      'currentLatitude': currentLatitude,
      'currentLongitude': currentLongitude,
      'fare': fare,
      'distanceKm': distanceKm,
      'durationMin': durationMin,
      'status': status,
      'shareToken': shareToken,
      'createdAt': createdAt.toIso8601String(),
      'isSosActive': isSosActive,
    };
  }

  TripModel copyWith({
    int? id,
    int? passengerId,
    String? passengerName,
    String? passengerPhone,
    int? driverId,
    String? driverName,
    String? driverPhone,
    int? taxiId,
    String? vehicleNumber,
    String? vehicleModel,
    String? pickupAddress,
    String? dropoffAddress,
    double? startLatitude,
    double? startLongitude,
    double? dropoffLatitude,
    double? dropoffLongitude,
    double? currentLatitude,
    double? currentLongitude,
    double? fare,
    double? distanceKm,
    int? durationMin,
    String? status,
    String? shareToken,
    DateTime? createdAt,
    bool? isSosActive,
  }) {
    return TripModel(
      id: id ?? this.id,
      passengerId: passengerId ?? this.passengerId,
      passengerName: passengerName ?? this.passengerName,
      passengerPhone: passengerPhone ?? this.passengerPhone,
      driverId: driverId ?? this.driverId,
      driverName: driverName ?? this.driverName,
      driverPhone: driverPhone ?? this.driverPhone,
      taxiId: taxiId ?? this.taxiId,
      vehicleNumber: vehicleNumber ?? this.vehicleNumber,
      vehicleModel: vehicleModel ?? this.vehicleModel,
      pickupAddress: pickupAddress ?? this.pickupAddress,
      dropoffAddress: dropoffAddress ?? this.dropoffAddress,
      startLatitude: startLatitude ?? this.startLatitude,
      startLongitude: startLongitude ?? this.startLongitude,
      dropoffLatitude: dropoffLatitude ?? this.dropoffLatitude,
      dropoffLongitude: dropoffLongitude ?? this.dropoffLongitude,
      currentLatitude: currentLatitude ?? this.currentLatitude,
      currentLongitude: currentLongitude ?? this.currentLongitude,
      fare: fare ?? this.fare,
      distanceKm: distanceKm ?? this.distanceKm,
      durationMin: durationMin ?? this.durationMin,
      status: status ?? this.status,
      shareToken: shareToken ?? this.shareToken,
      createdAt: createdAt ?? this.createdAt,
      isSosActive: isSosActive ?? this.isSosActive,
    );
  }
}
