import 'package:flutter/material.dart';
import '../models/network_models.dart';
import '../state/phantom_controller.dart';
import '../theme/phantom_theme.dart';

class DevicesScreen extends StatefulWidget {
  final PhantomController controller;

  const DevicesScreen({super.key, required this.controller});

  @override
  State<DevicesScreen> createState() => _DevicesScreenState();
}

class _DevicesScreenState extends State<DevicesScreen> {
  String _search = '';
  DeviceTrustStatus? _filterStatus;

  @override
  void didUpdateWidget(covariant DevicesScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller.showOnlyUnknownDevices &&
        _filterStatus != DeviceTrustStatus.unknown) {
      _filterStatus = DeviceTrustStatus.unknown;
    }
  }

  @override
  Widget build(BuildContext context) {
    final effectiveFilter = widget.controller.showOnlyUnknownDevices
        ? DeviceTrustStatus.unknown
        : _filterStatus;

    final filtered = widget.controller.devices.where((d) {
      final matchesFilter = effectiveFilter == null ||
          (effectiveFilter == DeviceTrustStatus.unknown
              ? (d.trustStatus == DeviceTrustStatus.unknown ||
                  d.trustStatus == DeviceTrustStatus.suspicious)
              : d.trustStatus == effectiveFilter);
      final q = _search.trim().toLowerCase();
      final matchesSearch = q.isEmpty ||
          d.hostname.toLowerCase().contains(q) ||
          d.ipAddress.contains(q) ||
          d.vendor.toLowerCase().contains(q) ||
          d.macAddress.toLowerCase().contains(q);
      return matchesFilter && matchesSearch;
    }).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      children: [
        TextField(
          onChanged: (v) => setState(() => _search = v),
          decoration: const InputDecoration(
            hintText: 'Search hostname, IP, MAC, or vendor...',
            prefixIcon: Icon(Icons.search_rounded),
          ),
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _filterChip('All (${widget.controller.devices.length})', null),
              const SizedBox(width: 8),
              _filterChip(
                'Unknown & Suspicious (${widget.controller.unknownDevicesCount})',
                DeviceTrustStatus.unknown,
              ),
              const SizedBox(width: 8),
              _filterChip('Trusted', DeviceTrustStatus.trusted),
              const SizedBox(width: 8),
              _filterChip('Quarantined', DeviceTrustStatus.quarantined),
            ],
          ),
        ),
        const SizedBox(height: 14),
        if (filtered.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(28),
              child: Center(
                child: Text('No devices match your current filter.'),
              ),
            ),
          )
        else
          ...filtered.map(
            (device) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Card(
                child: InkWell(
                  borderRadius: BorderRadius.circular(18),
                  onTap: () => _openInspector(context, device),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: _trustColor(device.trustStatus)
                                  .withValues(alpha: 0.16),
                              child: Icon(
                                _deviceIcon(device.category),
                                color: _trustColor(device.trustStatus),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    device.hostname,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 15,
                                    ),
                                  ),
                                  Text(
                                    '${device.ipAddress} · ${device.vendor}',
                                    style: Theme.of(context).textTheme.bodySmall,
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 5,
                              ),
                              decoration: BoxDecoration(
                                color: _trustColor(device.trustStatus)
                                    .withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                device.trustStatus.name.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w700,
                                  color: _trustColor(device.trustStatus),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              device.vlan,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Text(
                              'Ports: ${device.openPorts.join(', ')}',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            Text(
                              'Risk ${device.riskScore}/100',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: device.riskScore >= 70
                                    ? PhantomColors.rose
                                    : PhantomColors.emerald,
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

  Widget _filterChip(String label, DeviceTrustStatus? status) {
    final active = (widget.controller.showOnlyUnknownDevices
            ? DeviceTrustStatus.unknown
            : _filterStatus) ==
        status;
    return ChoiceChip(
      label: Text(label),
      selected: active,
      onSelected: (_) {
        widget.controller.setTab(1, unknownOnly: false);
        setState(() => _filterStatus = status);
      },
    );
  }

  void _openInspector(BuildContext context, NetworkDevice device) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(device.hostname, style: Theme.of(ctx).textTheme.titleLarge),
            const SizedBox(height: 4),
            Text(
              '${device.ipAddress} · ${device.macAddress}',
              style: Theme.of(ctx).textTheme.bodySmall,
            ),
            const SizedBox(height: 14),
            _metaRow('Vendor', device.vendor),
            _metaRow('OS Fingerprint',
                '${device.osGuess} (${device.fingerprintConfidence}%)'),
            _metaRow('VLAN Segment', device.vlan),
            _metaRow('Bandwidth',
                '↑ ${device.bandwidthUpMbps} Mbps  ↓ ${device.bandwidthDownMbps} Mbps'),
            _metaRow('Open Ports', device.openPorts.join(', ')),
            if (device.anomalySummary != null) ...[
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: PhantomColors.rose.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  device.anomalySummary!,
                  style: const TextStyle(fontSize: 13),
                ),
              ),
            ],
            const SizedBox(height: 18),
            Row(
              children: [
                Expanded(
                  child: FilledButton.tonal(
                    onPressed: () {
                      widget.controller.setDeviceTrust(
                        device.id,
                        DeviceTrustStatus.trusted,
                      );
                      Navigator.pop(ctx);
                    },
                    child: const Text('Mark Trusted'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: PhantomColors.rose,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () {
                      widget.controller.setDeviceTrust(
                        device.id,
                        DeviceTrustStatus.quarantined,
                      );
                      Navigator.pop(ctx);
                    },
                    child: const Text('Quarantine'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _metaRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  IconData _deviceIcon(String category) {
    switch (category.toLowerCase()) {
      case 'router':
        return Icons.router_rounded;
      case 'workstation':
        return Icons.laptop_mac_rounded;
      default:
        return Icons.device_unknown_rounded;
    }
  }

  Color _trustColor(DeviceTrustStatus status) {
    switch (status) {
      case DeviceTrustStatus.trusted:
        return PhantomColors.emerald;
      case DeviceTrustStatus.unknown:
        return PhantomColors.amber;
      case DeviceTrustStatus.suspicious:
        return PhantomColors.rose;
      case DeviceTrustStatus.quarantined:
        return PhantomColors.accent;
    }
  }
}
