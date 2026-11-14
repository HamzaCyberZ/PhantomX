import 'package:flutter/material.dart';
import '../models/network_models.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';

class AlertsScreen extends StatefulWidget {
  final PhantomController controller;

  const AlertsScreen({super.key, required this.controller});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  AlertSeverity? _severityFilter;
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final filtered = widget.controller.alerts.where((a) {
      final matchesSeverity =
          _severityFilter == null || a.severity == _severityFilter;
      final q = _search.trim().toLowerCase();
      final matchesSearch = q.isEmpty ||
          a.title.toLowerCase().contains(q) ||
          a.deviceName.toLowerCase().contains(q) ||
          a.sourceIp.contains(q);
      return matchesSeverity && matchesSearch;
    }).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        TextField(
          onChanged: (v) => setState(() => _search = v),
          decoration: const InputDecoration(
            hintText: 'Search alert title, device, or source IP...',
            prefixIcon: Icon(Icons.search_rounded),
          ),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _chip('All', null),
              const SizedBox(width: 8),
              _chip('Critical', AlertSeverity.critical),
              const SizedBox(width: 8),
              _chip('High', AlertSeverity.high),
              const SizedBox(width: 8),
              _chip('Medium', AlertSeverity.medium),
            ],
          ),
        ),
        const SizedBox(height: 14),
        ...filtered.map(
          (alert) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Card(
              child: InkWell(
                borderRadius: BorderRadius.circular(18),
                onTap: () => _openAlertSheet(context, alert),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: _sevColor(alert.severity)
                                  .withValues(alpha: 0.16),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              alert.severity.name.toUpperCase(),
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                                color: _sevColor(alert.severity),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            alert.category,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const Spacer(),
                          Text(
                            alert.status.name.toUpperCase(),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: alert.status == AlertStatus.resolved
                                  ? PhantomColors.emerald
                                  : PhantomColors.accent,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        alert.title,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(alert.summary),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${alert.deviceName} (${alert.sourceIp})',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          Text(
                            '${alert.confidence}% AI conf.',
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: PhantomColors.accent,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _chip(String label, AlertSeverity? sev) {
    return ChoiceChip(
      label: Text(label),
      selected: _severityFilter == sev,
      onSelected: (_) => setState(() => _severityFilter = sev),
    );
  }

  void _openAlertSheet(BuildContext context, SecurityAlert alert) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(alert.title, style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 6),
            Text(
              '${alert.sourceIp} -> ${alert.destinationIp ?? 'Internal'} · ${alert.timestamp}',
              style: Theme.of(ctx).textTheme.bodySmall,
            ),
            const SizedBox(height: 14),
            Text(
              'AI Explanation',
              style: Theme.of(ctx)
                  .textTheme
                  .titleSmall
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            Text(alert.aiExplanation),
            const SizedBox(height: 12),
            Text(
              'Recommended Action',
              style: Theme.of(ctx)
                  .textTheme
                  .titleSmall
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            Text(alert.recommendedAction),
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: FilledButton.tonal(
                    onPressed: () {
                      widget.controller.setAlertStatus(
                        alert.id,
                        AlertStatus.investigating,
                      );
                      Navigator.pop(ctx);
                    },
                    child: const Text('Investigate'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    onPressed: () {
                      widget.controller.setAlertStatus(
                        alert.id,
                        AlertStatus.resolved,
                      );
                      Navigator.pop(ctx);
                    },
                    child: const Text('Resolve Alert'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _sevColor(AlertSeverity sev) {
    switch (sev) {
      case AlertSeverity.critical:
        return PhantomColors.rose;
      case AlertSeverity.high:
        return PhantomColors.amber;
      case AlertSeverity.medium:
        return PhantomColors.accent;
      case AlertSeverity.low:
        return PhantomColors.emerald;
    }
  }
}
