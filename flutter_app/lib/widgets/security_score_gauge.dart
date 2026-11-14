import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/phantom_theme.dart';

class SecurityScoreGauge extends StatelessWidget {
  final int score;
  final double size;

  const SecurityScoreGauge({
    super.key,
    required this.score,
    this.size = 152,
  });

  Color get _scoreColor {
    if (score >= 85) return PhantomColors.emerald;
    if (score >= 65) return PhantomColors.accent;
    return PhantomColors.amber;
  }

  String get _statusLabel {
    if (score >= 85) return 'HARDENED';
    if (score >= 65) return 'GUARDED';
    return 'AT RISK';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: score / 100.0),
      duration: const Duration(milliseconds: 650),
      curve: Curves.easeOutCubic,
      builder: (context, progress, _) {
        return SizedBox(
          width: size,
          height: size,
          child: CustomPaint(
            painter: _ScoreArcPainter(
              progress: progress,
              color: _scoreColor,
              trackColor: isDark
                  ? Colors.white.withValues(alpha: 0.08)
                  : Colors.black.withValues(alpha: 0.08),
            ),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${(progress * 100).round()}',
                    style: Theme.of(context).textTheme.displaySmall?.copyWith(
                          fontSize: size * 0.27,
                          height: 1.0,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _statusLabel,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.1,
                      color: _scoreColor,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ScoreArcPainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color trackColor;

  const _ScoreArcPainter({
    required this.progress,
    required this.color,
    required this.trackColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (math.min(size.width, size.height) / 2) - 10;
    const startAngle = math.pi * 0.75;
    const sweepAngle = math.pi * 1.5;

    final trackPaint = Paint()
      ..color = trackColor
      ..strokeWidth = 12
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final activePaint = Paint()
      ..color = color
      ..strokeWidth = 12
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final rect = Rect.fromCircle(center: center, radius: radius);
    canvas.drawArc(rect, startAngle, sweepAngle, false, trackPaint);
    canvas.drawArc(
      rect,
      startAngle,
      sweepAngle * progress.clamp(0.0, 1.0),
      false,
      activePaint,
    );
  }

  @override
  bool shouldRepaint(_ScoreArcPainter oldDelegate) =>
      oldDelegate.progress != progress || oldDelegate.color != color;
}
