import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../models/network_models.dart';
import '../theme/phantom_theme.dart';

class TrafficChart extends StatelessWidget {
  final List<TrafficPoint> series;
  final double height;

  const TrafficChart({
    super.key,
    required this.series,
    this.height = 175,
  });

  @override
  Widget build(BuildContext context) {
    if (series.isEmpty) {
      return SizedBox(height: height);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: height,
          width: double.infinity,
          child: CustomPaint(
            painter: _TrafficSeriesPainter(
              series: series,
              gridColor: Theme.of(context).dividerColor.withValues(alpha: 0.2),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: series
              .map(
                (p) => Text(
                  p.timeLabel,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontSize: 10,
                        color: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.color
                            ?.withValues(alpha: 0.65),
                      ),
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 10),
        const Wrap(
          spacing: 16,
          runSpacing: 6,
          children: [
            _LegendDot(color: PhantomColors.accent, label: 'Inbound Mbps'),
            _LegendDot(color: PhantomColors.emerald, label: 'Outbound Mbps'),
            _LegendDot(color: PhantomColors.rose, label: 'Anomalous'),
          ],
        ),
      ],
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendDot({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 9,
          height: 9,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 11.5)),
      ],
    );
  }
}

class _TrafficSeriesPainter extends CustomPainter {
  final List<TrafficPoint> series;
  final Color gridColor;

  const _TrafficSeriesPainter({
    required this.series,
    required this.gridColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    double maxVal = 100;
    for (final point in series) {
      maxVal = math.max(
        maxVal,
        math.max(point.inboundMbps, math.max(point.outboundMbps, point.anomalousMbps)),
      );
    }

    final gridPaint = Paint()
      ..color = gridColor
      ..strokeWidth = 1;
    for (int i = 1; i <= 3; i++) {
      final y = size.height * (i / 4);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    _drawLine(
      canvas,
      size,
      series.map((e) => e.inboundMbps).toList(),
      maxVal,
      PhantomColors.accent,
      fillArea: true,
    );
    _drawLine(
      canvas,
      size,
      series.map((e) => e.outboundMbps).toList(),
      maxVal,
      PhantomColors.emerald,
    );
    _drawLine(
      canvas,
      size,
      series.map((e) => e.anomalousMbps).toList(),
      maxVal,
      PhantomColors.rose,
    );
  }

  void _drawLine(
    Canvas canvas,
    Size size,
    List<double> values,
    double maxVal,
    Color color, {
    bool fillArea = false,
  }) {
    if (values.length < 2) return;
    final path = Path();
    final stepX = size.width / (values.length - 1);

    for (int i = 0; i < values.length; i++) {
      final x = i * stepX;
      final y = size.height - ((values[i] / maxVal) * (size.height - 12)) - 6;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    if (fillArea) {
      final areaPath = Path.from(path)
        ..lineTo(size.width, size.height)
        ..lineTo(0, size.height)
        ..close();
      canvas.drawPath(
        areaPath,
        Paint()
          ..shader = LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              color.withValues(alpha: 0.25),
              color.withValues(alpha: 0.0),
            ],
          ).createShader(Rect.fromLTWH(0, 0, size.width, size.height)),
      );
    }

    canvas.drawPath(
      path,
      Paint()
        ..color = color
        ..strokeWidth = 2.4
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(_TrafficSeriesPainter oldDelegate) =>
      oldDelegate.series != series;
}
