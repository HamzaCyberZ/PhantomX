import 'package:flutter/material.dart';
import '../models/network_models.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';
import '../widgets/security_score_gauge.dart';
import '../widgets/traffic_chart.dart';
import '../widgets/user_avatar.dart';

class DashboardScreen extends StatelessWidget {
  final PhantomController controller;
  final VoidCallback onOpenProfile;

  const DashboardScreen({
    super.key,
    required this.controller,
    required this.onOpenProfile,
  });

  @override
  Widget build(BuildContext context) {
    final flaggedDevices = controller.devices
        .where((d) => d.trustStatus != DeviceTrustStatus.trusted)
        .toList();

    return RefreshIndicator(
      onRefresh: controller.initializeTelemetry,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Row(
                children: [
                  UserAvatar(
                    fullName: controller.profile.fullName,
                    avatarBytes: controller.avatarBytes,
                    size: 56,
                    showOnlineBadge: true,
                    onTap: onOpenProfile,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome back, ${controller.profile.fullName.split(' ').first}',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${controller.profile.networkName} · ${controller.profile.subnetCidr}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                  IconButton.filledTonal(
                    onPressed: onOpenProfile,
                    icon: const Icon(Icons.manage_accounts_outlined),
                    tooltip: 'Profile & Photo',
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Row(
                children: [
                  SecurityScoreGauge(score: controller.securityScore, size: 132),
                  const SizedBox(width: 18),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Network Security Score',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Real-time posture calculated across device trust, port exposure, and anomaly alerts.',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(height: 12),
                        FilledButton.tonalIcon(
                          onPressed: () => controller.setTab(3),
                          icon: const Icon(Icons.auto_awesome, size: 18),
                          label: const Text('Run AI Briefing'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.55,
            children: [
              _KpiCard(
                label: 'Connected Devices',
                value: '${controller.devices.length}',
                icon: Icons.devices_rounded,
                color: PhantomColors.accent,
                onTap: () => controller.setTab(1),
              ),
              _KpiCard(
                label: 'Unknown Devices',
                value: '${controller.unknownDevicesCount}',
                icon: Icons.help_outline_rounded,
                color: PhantomColors.amber,
                onTap: () => controller.setTab(1, unknownOnly: true),
              ),
              _KpiCard(
                label: 'Suspicious Flows',
                value: '${controller.activeSuspiciousCount}',
                icon: Icons.waves_rounded,
                color: PhantomColors.rose,
                onTap: () => controller.setTab(3),
              ),
              _KpiCard(
                label: 'Critical Threats',
                value: '${controller.criticalAlertsCount}',
                icon: Icons.warning_amber_rounded,
                color: PhantomColors.rose,
                onTap: () => controller.setTab(2),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Network Traffic Activity',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      Text(
                        'Last 12h',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  TrafficChart(series: controller.trafficSeries),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.auto_awesome_rounded,
                        color: PhantomColors.accent,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'AI Security Summary',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const Spacer(),
                      Text(
                        '${controller.aiBriefing.confidenceScore}% conf.',
                        style: const TextStyle(
                          fontSize: 12,
                          color: PhantomColors.accent,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    controller.aiBriefing.executiveSummary,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: PhantomColors.accent.withValues(alpha: 0.1),
                    ),
                    child: Text(
                      'Priority: ${controller.aiBriefing.topPriority}',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Recent Security Alerts',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      TextButton(
                        onPressed: () => controller.setTab(2),
                        child: const Text('View All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ...controller.alerts.take(3).map(
                        (alert) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: CircleAvatar(
                            backgroundColor: _severityColor(alert.severity)
                                .withValues(alpha: 0.16),
                            child: Icon(
                              Icons.shield_outlined,
                              color: _severityColor(alert.severity),
                              size: 20,
                            ),
                          ),
                          title: Text(
                            alert.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          subtitle: Text(
                            '${alert.deviceName} · ${alert.sourceIp}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          trailing: Text(
                            alert.status.name.toUpperCase(),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: _severityColor(alert.severity),
                            ),
                          ),
                          onTap: () => controller.setTab(2),
                        ),
                      ),
                ],
              ),
            ),
          ),
          if (flaggedDevices.isNotEmpty) ...[
            const SizedBox(height: 14),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Flagged & Unrecognized Nodes',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: 8),
                    ...flaggedDevices.map(
                      (device) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(
                          Icons.router_outlined,
                          color: PhantomColors.amber,
                        ),
                        title: Text(device.hostname),
                        subtitle: Text('${device.ipAddress} · ${device.vendor}'),
                        trailing: Text(
                          'Risk ${device.riskScore}',
                          style: const TextStyle(
                            color: PhantomColors.rose,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        onTap: () => controller.setTab(1, unknownOnly: true),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Color _severityColor(AlertSeverity severity) {
    switch (severity) {
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

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _KpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(icon, color: color, size: 22),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 13,
                    color: Colors.grey.withValues(alpha: 0.6),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
