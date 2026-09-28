import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../constants/api_endpoints.dart';
import '../../constants/app_icons.dart';
import '../../services/api_service.dart';
import '../../providers/auth_provider.dart';
import '../../providers/trip_provider.dart';
import '../emergency/sos_dialog.dart';

class AiChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final bool isEmergency;
  final List<String> suggestedActions;

  AiChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.isEmergency = false,
    this.suggestedActions = const [],
  });
}

class AiSafetyChatScreen extends StatefulWidget {
  const AiSafetyChatScreen({super.key});

  @override
  State<AiSafetyChatScreen> createState() => _AiSafetyChatScreenState();
}

class _AiSafetyChatScreenState extends State<AiSafetyChatScreen> {
  final List<AiChatMessage> _messages = [];
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Welcome message
    _messages.add(
      AiChatMessage(
        text: "Hello! I am your **Smart Taxi AI Safety Guardian** powered by Gemini AI. I'm here 24/7 to help you with ride verification, route security advice, emergency instructions in Yaoundé, and passenger safety.",
        isUser: false,
        timestamp: DateTime.now(),
        suggestedActions: [
          "How to verify taxi QR?",
          "I feel unsafe right now",
          "Yaoundé night safety tips",
          "How does SOS alert work?",
        ],
      ),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage([String? presetText]) async {
    final text = (presetText ?? _textController.text).trim();
    if (text.isEmpty || _isLoading) return;

    _textController.clear();
    setState(() {
      _messages.add(
        AiChatMessage(
          text: text,
          isUser: true,
          timestamp: DateTime.now(),
        ),
      );
      _isLoading = true;
    });
    _scrollToBottom();

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final trip = Provider.of<TripProvider>(context, listen: false);

    try {
      final res = await ApiService.post(ApiEndpoints.chat, {
        'message': text,
        'context': {
          'userRole': auth.user?.role ?? 'PASSENGER',
          'userName': auth.user?.name ?? 'User',
          'hasActiveTrip': trip.hasActiveTrip,
          'currentTripId': trip.currentTrip?.id,
          'taxiNumber': trip.currentTrip?.vehicleNumber,
          'city': 'Yaoundé, Cameroon',
        }
      });

      if (res.success && res.data != null) {
        final reply = res.data['reply']?.toString() ?? "I've noted that. Stay alert and keep your emergency contacts updated.";
        final isEmergency = res.data['isEmergency'] == true;
        List<String> actions = [];
        if (res.data['suggestedActions'] is List) {
          actions = (res.data['suggestedActions'] as List).map((e) => e.toString()).toList();
        }

        setState(() {
          _messages.add(
            AiChatMessage(
              text: reply,
              isUser: false,
              timestamp: DateTime.now(),
              isEmergency: isEmergency,
              suggestedActions: actions,
            ),
          );
        });
      } else {
        setState(() {
          _messages.add(
            AiChatMessage(
              text: "⚠️ Safety AI Service temporarily busy. For immediate danger, please press the RED SOS BUTTON or call 117 / 112 directly.",
              isUser: false,
              timestamp: DateTime.now(),
              isEmergency: true,
            ),
          );
        });
      }
    } catch (_) {
      setState(() {
        _messages.add(
          AiChatMessage(
            text: "Connection error. If you are in danger, please use the Red SOS Button.",
            isUser: false,
            timestamp: DateTime.now(),
            isEmergency: true,
          ),
        );
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  void _handleSuggestedAction(String action) {
    if (action == "TRIGGER_SOS" || action.toLowerCase().contains("sos") || action.toLowerCase().contains("danger")) {
      SOSDialog.show(context);
      return;
    }
    _sendMessage(action);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.bgDark : AppColors.bgLight;
    final cardBg = isDark ? AppColors.cardDark : AppColors.cardLight;
    final textPrimary = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.bot, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Gemini Safety AI',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  '24/7 Security Assistant',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.success,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.alertTriangle, color: AppColors.sosRed),
            tooltip: 'Emergency SOS',
            onPressed: () => SOSDialog.show(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: AppColors.primary.withValues(alpha: 0.12),
            child: Row(
              children: [
                const Icon(LucideIcons.shieldCheck, color: AppColors.primary, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'AI analyzes conversations in real time to detect hazards & trigger emergency protocols.',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.white70 : Colors.black87,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageBubble(msg, isDark, cardBg, textPrimary);
              },
            ),
          ),

          if (_isLoading)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Gemini Safety AI is analyzing...',
                    style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
                  ),
                ],
              ),
            ),

          // Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: cardBg,
              border: Border(top: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      onSubmitted: (_) => _sendMessage(),
                      style: TextStyle(color: textPrimary, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Ask safety questions or report distress...',
                        hintStyle: TextStyle(
                          fontSize: 13,
                          color: isDark ? Colors.white38 : Colors.black38,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        filled: true,
                        fillColor: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: const BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(LucideIcons.send, color: Colors.black, size: 18),
                      onPressed: () => _sendMessage(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(AiChatMessage msg, bool isDark, Color cardBg, Color textPrimary) {
    if (msg.isUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12, left: 40),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
              bottomLeft: Radius.circular(16),
              bottomRight: Radius.circular(4),
            ),
          ),
          child: Text(
            msg.text,
            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w600, fontSize: 14),
          ),
        ),
      );
    }

    // AI Message
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12, right: 30),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: msg.isEmergency ? AppColors.sosRed.withValues(alpha: 0.12) : cardBg,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(4),
            topRight: Radius.circular(16),
            bottomLeft: Radius.circular(16),
            bottomRight: Radius.circular(16),
          ),
          border: Border.all(
            color: msg.isEmergency
                ? AppColors.sosRed
                : (isDark ? AppColors.borderDark : AppColors.borderLight),
            width: msg.isEmergency ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  msg.isEmergency ? LucideIcons.alertTriangle : LucideIcons.bot,
                  size: 16,
                  color: msg.isEmergency ? AppColors.sosRed : AppColors.primary,
                ),
                const SizedBox(width: 6),
                Text(
                  msg.isEmergency ? 'EMERGENCY ALERT' : 'Gemini Safety AI',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: msg.isEmergency ? AppColors.sosRed : AppColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              msg.text,
              style: TextStyle(
                color: textPrimary,
                fontSize: 13.5,
                height: 1.4,
              ),
            ),
            if (msg.suggestedActions.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: msg.suggestedActions.map((action) {
                  final isSos = action.contains('SOS') || action.contains('danger');
                  return ActionChip(
                    backgroundColor: isSos
                        ? AppColors.sosRed
                        : (isDark ? AppColors.surfaceDark : AppColors.surfaceLight),
                    label: Text(
                      action,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isSos ? Colors.white : (isDark ? Colors.white70 : Colors.black87),
                      ),
                    ),
                    onPressed: () => _handleSuggestedAction(action),
                  );
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
