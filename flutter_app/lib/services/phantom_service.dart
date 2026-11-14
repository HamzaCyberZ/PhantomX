import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/mock_telemetry.dart';
import '../models/network_models.dart';

class TelemetrySnapshot {
  final List<NetworkDevice> devices;
  final List<SecurityAlert> alerts;
  final List<SuspiciousFlow> flows;
  final List<PortScanEvent> portScans;
  final List<RiskFactor> riskFactors;
  final List<SecurityReport> reports;
  final bool liveSupabaseConnected;

  const TelemetrySnapshot({
    required this.devices,
    required this.alerts,
    required this.flows,
    required this.portScans,
    required this.riskFactors,
    required this.reports,
    required this.liveSupabaseConnected,
  });
}

class PhantomService {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000',
  );

  SupabaseClient? get _supabase {
    try {
      return Supabase.instance.client;
    } catch (_) {
      return null;
    }
  }

  Future<String?> signInWithSupabase({
    required String email,
    required String password,
  }) async {
    final client = _supabase;
    if (client == null) return null;
    try {
      final res = await client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      return res.user?.email;
    } catch (_) {
      return null;
    }
  }

  Future<String?> signUpWithSupabase({
    required String email,
    required String password,
    required String fullName,
  }) async {
    final client = _supabase;
    if (client == null) return null;
    try {
      final res = await client.auth.signUp(
        email: email,
        password: password,
        data: {'full_name': fullName},
      );
      return res.user?.email;
    } catch (_) {
      return null;
    }
  }

  Future<void> signOut() async {
    try {
      await _supabase?.auth.signOut();
    } catch (_) {}
  }

  Future<TelemetrySnapshot> fetchTelemetrySnapshot() async {
    final client = _supabase;
    if (client != null) {
      try {
        final devRows = await client.from('devices').select();
        final alertRows = await client.from('security_alerts').select();
        if (devRows.isNotEmpty) {
          return TelemetrySnapshot(
            devices: devRows
                .map<NetworkDevice>(
                  (row) => NetworkDevice.fromDb(Map<String, dynamic>.from(row)),
                )
                .toList(),
            alerts: alertRows.isNotEmpty
                ? alertRows
                    .map<SecurityAlert>(
                      (row) =>
                          SecurityAlert.fromDb(Map<String, dynamic>.from(row)),
                    )
                    .toList()
                : MockTelemetry.alerts,
            flows: MockTelemetry.suspiciousFlows,
            portScans: MockTelemetry.portScans,
            riskFactors: MockTelemetry.riskFactors,
            reports: MockTelemetry.reports,
            liveSupabaseConnected: true,
          );
        }
      } catch (_) {}
    }

    try {
      final res = await http
          .get(Uri.parse('$apiBaseUrl/api/supabase/snapshot'))
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final jsonMap = jsonDecode(res.body) as Map<String, dynamic>;
        final rawDevices = (jsonMap['devices'] as List<dynamic>? ?? []);
        final rawAlerts = (jsonMap['alerts'] as List<dynamic>? ?? []);
        if (rawDevices.isNotEmpty) {
          return TelemetrySnapshot(
            devices: rawDevices
                .map((e) => NetworkDevice.fromDb(Map<String, dynamic>.from(e)))
                .toList(),
            alerts: rawAlerts.isNotEmpty
                ? rawAlerts
                    .map((e) =>
                        SecurityAlert.fromDb(Map<String, dynamic>.from(e)))
                    .toList()
                : MockTelemetry.alerts,
            flows: MockTelemetry.suspiciousFlows,
            portScans: MockTelemetry.portScans,
            riskFactors: MockTelemetry.riskFactors,
            reports: MockTelemetry.reports,
            liveSupabaseConnected: true,
          );
        }
      }
    } catch (_) {}

    return const TelemetrySnapshot(
      devices: MockTelemetry.devices,
      alerts: MockTelemetry.alerts,
      flows: MockTelemetry.suspiciousFlows,
      portScans: MockTelemetry.portScans,
      riskFactors: MockTelemetry.riskFactors,
      reports: MockTelemetry.reports,
      liveSupabaseConnected: false,
    );
  }

  Future<void> updateDeviceTrust(
    String deviceId,
    DeviceTrustStatus status,
  ) async {
    final client = _supabase;
    if (client != null) {
      try {
        await client
            .from('devices')
            .update({'trust_status': status.name}).eq('id', deviceId);
      } catch (_) {}
    }
    try {
      await http
          .patch(
            Uri.parse('$apiBaseUrl/api/supabase/devices/$deviceId'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'trustStatus': status.name}),
          )
          .timeout(const Duration(seconds: 3));
    } catch (_) {}
  }

  Future<void> updateAlertStatus(
    String alertId,
    AlertStatus status,
  ) async {
    final client = _supabase;
    if (client != null) {
      try {
        await client
            .from('security_alerts')
            .update({'status': status.name}).eq('id', alertId);
      } catch (_) {}
    }
    try {
      await http
          .patch(
            Uri.parse('$apiBaseUrl/api/supabase/alerts/$alertId'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'status': status.name}),
          )
          .timeout(const Duration(seconds: 3));
    } catch (_) {}
  }

  Future<AiThreatBriefing> runThreatAnalysis({
    required int securityScore,
    required int unknownCount,
    required int criticalCount,
  }) async {
    try {
      final res = await http
          .post(
            Uri.parse('$apiBaseUrl/api/ai/threat-analysis'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'securityScore': securityScore,
              'unknownCount': unknownCount,
              'criticalCount': criticalCount,
            }),
          )
          .timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        return AiThreatBriefing(
          executiveSummary: data['executiveSummary'] as String? ??
              'Correlated lateral TCP SYN sweeps with unregistered IoT TLS beaconing.',
          topPriority: data['topPriority'] as String? ??
              'Quarantine MAC 4C:11:AE:0D:9F:22 and isolate ws-build-runner on VLAN 10.',
          attackChain: data['attackChain'] as String? ??
              'Unregistered Join -> Telnet Expose -> SMB/RDP Lateral Probe -> DNS TXT Egress',
          immediateActions: (data['immediateActions'] as List<dynamic>? ?? [])
              .map((e) => e.toString())
              .toList(),
          confidenceScore:
              (data['confidenceScore'] as num?)?.toInt() ?? 95,
        );
      }
    } catch (_) {}

    return AiThreatBriefing(
      executiveSummary:
          'PhantomX behavioural engine correlated $unknownCount unrecognized endpoints and $criticalCount critical alerts into a staged lateral reconnaissance sequence.',
      topPriority:
          'Quarantine unrecognized-esp-9f2 (192.168.10.187) and contain TCP 445/3389 sweeps from ws-build-runner.',
      attackChain:
          'Unverified 802.1X Join -> Outbound TLS Beacon -> Internal SMB/RDP Probe -> Base32 DNS TXT Tunnel',
      immediateActions: const [
        'Move MAC 4C:11:AE:0D:9F:22 to VLAN 99 Quarantine.',
        'Block direct UDP/TCP port 53 egress bypassing internal DNS.',
        'Restrict TCP 445 & 3389 across VLAN 10 workstation subnet.',
      ],
      confidenceScore: 94,
    );
  }

  Future<String> askThreatAssistant(String question) async {
    try {
      final res = await http
          .post(
            Uri.parse('$apiBaseUrl/api/ai/investigate'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'prompt': question}),
          )
          .timeout(const Duration(seconds: 8));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body) as Map<String, dynamic>;
        final answer = data['answer'] as String?;
        if (answer != null && answer.isNotEmpty) return answer;
      }
    } catch (_) {}

    final lower = question.toLowerCase();
    if (lower.contains('port') || lower.contains('scan')) {
      return 'Host ws-build-runner (192.168.10.48) generated 2,032 half-open TCP SYN probes over 4.2s targeting SSH (22), SMB (445), and RDP (3389). Recommend isolating its switch port and auditing cron jobs.';
    }
    if (lower.contains('unknown') || lower.contains('esp') || lower.contains('iot')) {
      return 'unrecognized-esp-9f2 joined VLAN 10 without 802.1X credentials, exposes plaintext Telnet (23), and sends 60s TLS beacons to 185.220.101.44. Quarantine to VLAN 99 immediately.';
    }
    return 'Current network posture reflects 2 active high-risk vectors: lateral SMB/RDP reconnaissance from 192.168.10.48 and unrecognized endpoint beaconing from 192.168.10.187. Applying all 3 risk remediations lifts posture above 95/100.';
  }
}
