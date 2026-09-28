class TaxiModel {
  final int id;
  final String vehicleNumber;
  final String registrationNumber;
  final String model;
  final String color;
  final int? driverId;
  final String? driverName;
  final String? driverPhone;
  final String? driverPhoto;
  final double rating;
  final String status; // 'AVAILABLE', 'ON_TRIP', 'OFFLINE'
  final double currentLatitude;
  final double currentLongitude;
  final bool safetyEquipped;
  final String? qrCode;

  TaxiModel({
    required this.id,
    required this.vehicleNumber,
    required this.registrationNumber,
    required this.model,
    required this.color,
    this.driverId,
    this.driverName,
    this.driverPhone,
    this.driverPhoto,
    this.rating = 4.9,
    this.status = 'AVAILABLE',
    this.currentLatitude = 3.8480,
    this.currentLongitude = 11.5021,
    this.safetyEquipped = true,
    this.qrCode,
  });

  factory TaxiModel.fromJson(Map<String, dynamic> json) {
    return TaxiModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      vehicleNumber: json['vehicleNumber'] ?? json['plateNumber'] ?? 'TX-${json['id'] ?? '101'}',
      registrationNumber: json['registrationNumber'] ?? 'NYC-${json['id'] ?? '101'}-TX',
      model: json['model'] ?? 'Toyota Camry Security Edition',
      color: json['color'] ?? 'Yellow',
      driverId: json['driverId'] != null ? int.tryParse(json['driverId'].toString()) : null,
      driverName: json['driverName'] ?? json['driver']?['name'] ?? 'Verified Security Driver',
      driverPhone: json['driverPhone'] ?? json['driver']?['phone'] ?? '+1 (555) 019-2834',
      driverPhoto: json['driverPhoto'] ?? json['driver']?['avatar'],
      rating: (json['rating'] != null ? double.tryParse(json['rating'].toString()) : null) ?? 4.9,
      status: json['status'] ?? 'AVAILABLE',
      currentLatitude: (json['currentLatitude'] != null ? double.tryParse(json['currentLatitude'].toString()) : null) ?? 3.8480,
      currentLongitude: (json['currentLongitude'] != null ? double.tryParse(json['currentLongitude'].toString()) : null) ?? 11.5021,
      safetyEquipped: json['safetyEquipped'] ?? true,
      qrCode: json['qrCode'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'vehicleNumber': vehicleNumber,
      'registrationNumber': registrationNumber,
      'model': model,
      'color': color,
      'driverId': driverId,
      'driverName': driverName,
      'driverPhone': driverPhone,
      'driverPhoto': driverPhoto,
      'rating': rating,
      'status': status,
      'currentLatitude': currentLatitude,
      'currentLongitude': currentLongitude,
      'safetyEquipped': safetyEquipped,
      'qrCode': qrCode,
    };
  }
}
