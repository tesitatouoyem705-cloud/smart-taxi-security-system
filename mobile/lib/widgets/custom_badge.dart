import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class CustomBadge extends StatelessWidget {
  final String text;
  final IconData? icon;
  final Color? color;
  final Color? textColor;
  final bool isFilled;

  const CustomBadge({
    super.key,
    required this.text,
    this.icon,
    this.color,
    this.textColor,
    this.isFilled = false,
  });

  @override
  Widget build(BuildContext context) {
    final badgeColor = color ?? AppColors.primary;
    final fgColor = textColor ?? (isFilled ? Colors.white : badgeColor);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isFilled ? badgeColor : badgeColor.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isFilled ? Colors.transparent : badgeColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: fgColor),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: TextStyle(
              color: fgColor,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}
