class IncidentModel {
  final int id;
  final int? tripId;
  final int reportedBy;
  final String? reporterName;
  final int? taxiId;
  final String? taxiPlate;
  final String title;
  final String description;
  final String category; // 'HARASSMENT', 'ROUTE_DEVIATION', 'OVERCHARGING', 'RECKLESS_DRIVING', 'VEHICLE_DEFECT', 'SOS_EMERGENCY', 'OTHER'
  final String status; // 'OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'
  final String? location;
  final double? latitude;
  final double? longitude;
  final DateTime createdAt;

  IncidentModel({
    required this.id,
    this.tripId,
    required this.reportedBy,
    this.reporterName,
    this.taxiId,
    this.taxiPlate,
    required this.title,
    required this.description,
    required this.category,
    this.status = 'OPEN',
    this.location,
    this.latitude,
    this.longitude,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  factory IncidentModel.fromJson(Map<String, dynamic> json) {
    return IncidentModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      tripId: json['tripId'] != null ? int.tryParse(json['tripId'].toString()) : null,
      reportedBy: json['reportedBy'] is int ? json['reportedBy'] : int.tryParse(json['reportedBy']?.toString() ?? '0') ?? 0,
      reporterName: json['reporterName'] ?? json['user']?['name'],
      taxiId: json['taxiId'] != null ? int.tryParse(json['taxiId'].toString()) : null,
      taxiPlate: json['taxiPlate'] ?? json['taxi']?['vehicleNumber'],
      title: json['title'] ?? 'Security Incident',
      description: json['description'] ?? '',
      category: json['category'] ?? 'OTHER',
      status: json['status'] ?? 'OPEN',
      location: json['location'],
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tripId': tripId,
      'reportedBy': reportedBy,
      'title': title,
      'description': description,
      'category': category,
      'status': status,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
