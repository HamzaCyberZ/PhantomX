import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../data/mock_telemetry.dart';
import '../models/network_models.dart';
import '../services/phantom_service.dart';

enum AppStage { splash, auth, home }

class PhantomController extends ChangeNotifier {
  final PhantomService _service = PhantomService();

  AppStage stage = AppStage.splash;
  ThemeMode themeMode = ThemeMode.dark;
  int currentTabIndex = 0;
  bool showOnlyUnknownDevices = false;

  UserProfile profile = MockTelemetry.defaultProfile;
  Uint8List? avatarBytes;

  List<NetworkDevice> devices = List.of(MockTelemetry.devices);
  List<SecurityAlert> alerts = List.of(MockTelemetry.alerts);
  List<TrafficPoint> trafficSeries = List.of(MockTelemetry.trafficSeries);
  List<SuspiciousFlow> suspiciousFlows = List.of(MockTelemetry.suspiciousFlows);
  List<PortScanEvent> portScans = List.of(MockTelemetry.portScans);
  List<RiskFactor> riskFactors = List.of(MockTelemetry.riskFactors);
  List<SecurityReport> reports = List.of(MockTelemetry.reports);

  bool isSyncing = false;
  bool isAnalyzingAi = false;
  bool liveSupabaseConnected = false;

  AiThreatBriefing aiBriefing = const AiThreatBriefing(
    executiveSummary:
        'Behavioural telemetry detected lateral SMB/RDP SYN probing from ws-build-runner alongside unregistered IoT TLS beaconing on VLAN 10.',
    topPriority:
        'Quarantine unrecognized-esp-9f2 and block direct outbound DNS TXT egress.',
    attackChain:
        'Unverified Join -> Telnet Expose -> SMB/RDP Sweep -> Base32 DNS Tunnel',
    immediateActions: [
      'Quarantine MAC 4C:11:AE:0D:9F:22 to VLAN 99',
      'Enforce internal DNS sinkhole on UDP/TCP 53',
      'Isolate ws-build-runner from VLAN 10 switch trunk',
    ],
    confidenceScore: 95,
  );

  int get unknownDevicesCount => devices
      .where(
        (d) =>
            d.trustStatus == DeviceTrustStatus.unknown ||
            d.trustStatus == DeviceTrustStatus.suspicious,
      )
      .length;

  int get criticalAlertsCount => alerts
      .where(
        (a) =>
            a.severity == AlertSeverity.critical &&
            a.status != AlertStatus.resolved &&
            a.status != AlertStatus.dismissed,
      )
      .length;

  int get activeSuspiciousCount =>
      suspiciousFlows.where((f) => !f.mitigated).length +
      portScans.where((p) => !p.blocked).length;

  int get securityScore {
    int base = 71;
    for (final factor in riskFactors) {
      if (factor.remediated) base += factor.impactPoints;
    }
    final quarantinedBonus =
        devices.where((d) => d.trustStatus == DeviceTrustStatus.quarantined).length * 2;
    return (base + quarantinedBonus).clamp(0, 99);
  }

  Future<void> initializeTelemetry() async {
    isSyncing = true;
    notifyListeners();
    final snapshot = await _service.fetchTelemetrySnapshot();
    devices = List.of(snapshot.devices);
    alerts = List.of(snapshot.alerts);
    suspiciousFlows = List.of(snapshot.flows);
    portScans = List.of(snapshot.portScans);
    riskFactors = List.of(snapshot.riskFactors);
    reports = List.of(snapshot.reports);
    liveSupabaseConnected = snapshot.liveSupabaseConnected;
    isSyncing = false;
    notifyListeners();
  }

  void setStage(AppStage next) {
    stage = next;
    notifyListeners();
  }

  void setTab(int index, {bool unknownOnly = false}) {
    currentTabIndex = index;
    showOnlyUnknownDevices = unknownOnly;
    notifyListeners();
  }

  void toggleThemeMode() {
    themeMode = themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }

  Future<String?> authenticate({
    required bool isSignUp,
    required String email,
    required String password,
    String? fullName,
  }) async {
    if (isSignUp) {
      await _service.signUpWithSupabase(
        email: email,
        password: password,
        fullName: fullName ?? profile.fullName,
      );
      profile = profile.copyWith(
        email: email,
        fullName: (fullName != null && fullName.trim().isNotEmpty)
            ? fullName.trim()
            : profile.fullName,
      );
    } else {
      await _service.signInWithSupabase(email: email, password: password);
      profile = profile.copyWith(email: email);
    }
    stage = AppStage.home;
    notifyListeners();
    initializeTelemetry();
    return null;
  }

  Future<void> signOut() async {
    await _service.signOut();
    stage = AppStage.auth;
    currentTabIndex = 0;
    notifyListeners();
  }

  void updateProfile(UserProfile updated) {
    profile = updated;
    notifyListeners();
  }

  void updateAvatar({
    required Uint8List bytes,
    String? path,
  }) {
    avatarBytes = bytes;
    profile = profile.copyWith(avatarPath: path ?? 'memory://avatar');
    notifyListeners();
  }

  void removeAvatar() {
    avatarBytes = null;
    profile = profile.copyWith(clearAvatar: true);
    notifyListeners();
  }

  Future<void> setDeviceTrust(String deviceId, DeviceTrustStatus status) async {
    devices = devices
        .map((d) => d.id == deviceId
            ? d.copyWith(
                trustStatus: status,
                riskScore: status == DeviceTrustStatus.trusted
                    ? 14
                    : status == DeviceTrustStatus.quarantined
                        ? 22
                        : d.riskScore,
                vlan: status == DeviceTrustStatus.quarantined
                    ? 'VLAN 99 · Quarantine'
                    : d.vlan,
              )
            : d)
        .toList();
    notifyListeners();
    await _service.updateDeviceTrust(deviceId, status);
  }

  Future<void> setAlertStatus(String alertId, AlertStatus status) async {
    alerts = alerts
        .map((a) => a.id == alertId ? a.copyWith(status: status) : a)
        .toList();
    notifyListeners();
    await _service.updateAlertStatus(alertId, status);
  }

  void toggleFlowMitigated(String flowId) {
    suspiciousFlows = suspiciousFlows
        .map((f) => f.id == flowId ? f.copyWith(mitigated: !f.mitigated) : f)
        .toList();
    notifyListeners();
  }

  void togglePortScanBlocked(String scanId) {
    portScans = portScans
        .map((p) => p.id == scanId ? p.copyWith(blocked: !p.blocked) : p)
        .toList();
    notifyListeners();
  }

  void toggleRiskRemediation(String factorId) {
    riskFactors = riskFactors
        .map((r) => r.id == factorId ? r.copyWith(remediated: !r.remediated) : r)
        .toList();
    notifyListeners();
  }

  void generateNewReport() {
    final now = DateTime.now();
    final stamped =
        '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')} ${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    final report = SecurityReport(
      id: 'rep-${now.millisecondsSinceEpoch}',
      title: 'On-Demand Posture Snapshot',
      period: 'Snapshot · $stamped',
      generatedAt: stamped,
      securityScore: securityScore,
      totalDevices: devices.length,
      threatsMitigated: suspiciousFlows.where((f) => f.mitigated).length +
          portScans.where((p) => p.blocked).length +
          alerts.where((a) => a.status == AlertStatus.resolved).length,
      criticalFindings: criticalAlertsCount,
      summary:
          'Automated audit across ${profile.networkName} (${profile.subnetCidr}). Current security posture measured at $securityScore/100.',
    );
    reports = [report, ...reports];
    notifyListeners();
  }

  Future<void> runAiAnalysis() async {
    isAnalyzingAi = true;
    notifyListeners();
    aiBriefing = await _service.runThreatAnalysis(
      securityScore: securityScore,
      unknownCount: unknownDevicesCount,
      criticalCount: criticalAlertsCount,
    );
    isAnalyzingAi = false;
    notifyListeners();
  }

  Future<String> askThreatAssistant(String question) {
    return _service.askThreatAssistant(question);
  }
}
