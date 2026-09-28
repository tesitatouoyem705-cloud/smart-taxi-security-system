class ChatMessageModel {
  final String id;
  final int tripId;
  final int senderId;
  final String senderName;
  final String senderRole; // 'PASSENGER', 'DRIVER'
  final String message;
  final DateTime timestamp;
  final bool isMe;

  ChatMessageModel({
    required this.id,
    required this.tripId,
    required this.senderId,
    required this.senderName,
    required this.senderRole,
    required this.message,
    required this.timestamp,
    this.isMe = false,
  });

  factory ChatMessageModel.fromJson(Map<String, dynamic> json, int currentUserId) {
    int sId = json['senderId'] is int ? json['senderId'] : int.tryParse(json['senderId']?.toString() ?? '0') ?? 0;
    return ChatMessageModel(
      id: json['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
      tripId: json['tripId'] is int ? json['tripId'] : int.tryParse(json['tripId']?.toString() ?? '0') ?? 0,
      senderId: sId,
      senderName: json['senderName'] ?? (sId == currentUserId ? 'You' : 'User'),
      senderRole: json['senderRole'] ?? 'PASSENGER',
      message: json['message'] ?? '',
      timestamp: json['timestamp'] != null ? DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now() : DateTime.now(),
      isMe: sId == currentUserId,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tripId': tripId,
      'senderId': senderId,
      'senderName': senderName,
      'senderRole': senderRole,
      'message': message,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
