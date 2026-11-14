import 'package:flutter/material.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';
import '../widgets/traffic_chart.dart';

class TrafficPortsScreen extends StatefulWidget {
  final PhantomController controller;

  const TrafficPortsScreen({super.key, required this.controller});

  @override
  State<TrafficPortsScreen> createState() => _TrafficPortsScreenState();
}

class _TrafficPortsScreenState extends State<TrafficPortsScreen> {
  int _segment = 0;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        SegmentedButton<int>(
          segments: const [
            ButtonSegment(value: 0, label: Text('Suspicious Traffic')),
            ButtonSegment(value: 1, label: Text('Port Scan Detection')),
          ],
          selected: {_segment},
          onSelectionChanged: (v) => setState(() => _segment = v.first),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Live Bandwidth Telemetry',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
                const SizedBox(height: 12),
                TrafficChart(series: widget.controller.trafficSeries, height: 150),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        if (_segment == 0)
          ...widget.controller.suspiciousFlows.map(
            (flow) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.swap_horiz_rounded,
                            color: flow.mitigated
                                ? PhantomColors.emerald
                                : PhantomColors.rose,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${flow.sourceDevice} -> ${flow.destinationIp}:${flow.port}',
                              style: const TextStyle(fontWeight: FontWeight.w700),
                            ),
                          ),
                          Text(
                            flow.mitigated ? 'BLOCKED' : 'ACTIVE',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: flow.mitigated
                                  ? PhantomColors.emerald
                                  : PhantomColors.rose,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(flow.anomalyReason),
                      const SizedBox(height: 6),
                      Text(
                        '${flow.protocol} · ${flow.bytesTransferredMB} MB · ${flow.destinationGeo}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerRight,
                        child: FilledButton.tonal(
                          onPressed: () =>
                              widget.controller.toggleFlowMitigated(flow.id),
                          child: Text(
                            flow.mitigated ? 'Restore Flow' : 'Block Egress Flow',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
        else
          ...widget.controller.portScans.map(
            (scan) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.track_changes_rounded,
                            color: scan.blocked
                                ? PhantomColors.emerald
                                : PhantomColors.amber,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${scan.sourceDevice} · ${scan.scanType}',
                              style: const TextStyle(fontWeight: FontWeight.w700),
                            ),
                          ),
                          Text(
                            scan.blocked ? 'BLOCKED' : 'DETECTED',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: scan.blocked
                                  ? PhantomColors.emerald
                                  : PhantomColors.amber,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Target: ${scan.targetRange} (${scan.totalProbes} probes in ${scan.durationMs}ms)',
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Ports Probed: ${scan.portsScanned.join(', ')}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerRight,
                        child: FilledButton.tonal(
                          onPressed: () =>
                              widget.controller.togglePortScanBlocked(scan.id),
                          child: Text(
                            scan.blocked ? 'Unblock Scanner' : 'Block Scanner IP',
                          ),
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
