import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../theme/phantom_theme.dart';

class UserAvatar extends StatelessWidget {
  final String fullName;
  final Uint8List? avatarBytes;
  final double size;
  final bool showOnlineBadge;
  final VoidCallback? onTap;

  const UserAvatar({
    super.key,
    required this.fullName,
    this.avatarBytes,
    this.size = 40,
    this.showOnlineBadge = false,
    this.onTap,
  });

  String get _initials {
    final parts = fullName.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return 'PX';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final avatarCore = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          colors: [PhantomColors.accent, PhantomColors.accentDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: PhantomColors.accent.withValues(alpha: 0.45),
          width: 1.5,
        ),
      ),
      child: ClipOval(
        child: avatarBytes != null
            ? Image.memory(
                avatarBytes!,
                width: size,
                height: size,
                fit: BoxFit.cover,
              )
            : Center(
                child: Text(
                  _initials,
                  style: TextStyle(
                    color: const Color(0xFF04101C),
                    fontWeight: FontWeight.w800,
                    fontSize: size * 0.36,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
      ),
    );

    final widgetWithBadge = Stack(
      clipBehavior: Clip.none,
      children: [
        avatarCore,
        if (showOnlineBadge)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: size * 0.28,
              height: size * 0.28,
              decoration: BoxDecoration(
                color: PhantomColors.emerald,
                shape: BoxShape.circle,
                border: Border.all(
                  color: Theme.of(context).colorScheme.surface,
                  width: 2,
                ),
              ),
            ),
          ),
      ],
    );

    if (onTap == null) return widgetWithBadge;

    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: widgetWithBadge,
    );
  }
}
