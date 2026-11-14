import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';
import '../widgets/security_score_gauge.dart';

class RiskReportsScreen extends StatelessWidget {
  final PhantomController controller;

  const RiskReportsScreen({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                SecurityScoreGauge(score: controller.securityScore, size: 118),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Network Risk Assessment',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Toggle remediation actions below to simulate posture improvements in real time.',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        ...controller.riskFactors.map(
          (factor) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Card(
              child: CheckboxListTile(
                value: factor.remediated,
                onChanged: (_) => controller.toggleRiskRemediation(factor.id),
                title: Text(
                  factor.title,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                subtitle: Text(
                  '${factor.category} · +${factor.impactPoints} pts · ${factor.remediationStep}',
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Security Reports & History',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            FilledButton.tonalIcon(
              onPressed: controller.generateNewReport,
              icon: const Icon(Icons.add_chart_rounded, size: 18),
              label: const Text('New Snapshot'),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ...controller.reports.map(
          (report) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            report.title,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                            ),
                          ),
                        ),
                        Text(
                          '${report.securityScore}/100',
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            color: PhantomColors.accent,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      report.period,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 8),
                    Text(report.summary),
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerRight,
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Share.share(
                            'PhantomX Security Report (${report.period})\nScore: ${report.securityScore}/100\nDevices: ${report.totalDevices} | Mitigated: ${report.threatsMitigated}\nSummary: ${report.summary}',
                            subject: 'PhantomX Security Report',
                          );
                        },
                        icon: const Icon(Icons.ios_share_rounded, size: 16),
                        label: const Text('Export Report'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
