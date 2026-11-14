enum DeviceTrustStatus { trusted, unknown, suspicious, quarantined }

enum AlertSeverity { critical, high, medium, low }

enum AlertStatus { open, investigating, resolved, dismissed }

class NetworkDevice {
  final String id;
  final String hostname;
  final String ipAddress;
  final String macAddress;
  final String vendor;
  final String category;
  final DeviceTrustStatus trustStatus;
  final int riskScore;
  final String firstSeen;
  final String lastSeen;
  final String vlan;
  final double bandwidthUpMbps;
  final double bandwidthDownMbps;
  final List<int> openPorts;
  final String osGuess;
  final int fingerprintConfidence;
  final String? anomalySummary;
  final List<int> trafficSeries24h;

  const NetworkDevice({
    required this.id,
    required this.hostname,
    required this.ipAddress,
    required this.macAddress,
    required this.vendor,
    required this.category,
    required this.trustStatus,
    required this.riskScore,
    required this.firstSeen,
    required this.lastSeen,
    required this.vlan,
    required this.bandwidthUpMbps,
    required this.bandwidthDownMbps,
    required this.openPorts,
    required this.osGuess,
    required this.fingerprintConfidence,
    this.anomalySummary,
    required this.trafficSeries24h,
  });

  NetworkDevice copyWith({
    DeviceTrustStatus? trustStatus,
    int? riskScore,
    String? vlan,
    double? bandwidthUpMbps,
    double? bandwidthDownMbps,
  }) {
    return NetworkDevice(
      id: id,
      hostname: hostname,
      ipAddress: ipAddress,
      macAddress: macAddress,
      vendor: vendor,
      category: category,
      trustStatus: trustStatus ?? this.trustStatus,
      riskScore: riskScore ?? this.riskScore,
      firstSeen: firstSeen,
      lastSeen: lastSeen,
      vlan: vlan ?? this.vlan,
      bandwidthUpMbps: bandwidthUpMbps ?? this.bandwidthUpMbps,
      bandwidthDownMbps: bandwidthDownMbps ?? this.bandwidthDownMbps,
      openPorts: openPorts,
      osGuess: osGuess,
      fingerprintConfidence: fingerprintConfidence,
      anomalySummary: anomalySummary,
      trafficSeries24h: trafficSeries24h,
    );
  }

  factory NetworkDevice.fromDb(Map<String, dynamic> map) {
    return NetworkDevice(
      id: map['id'] as String,
      hostname: map['hostname'] as String,
      ipAddress: map['ip_address'] as String,
      macAddress: map['mac_address'] as String,
      vendor: map['vendor'] as String,
      category: map['category'] as String,
      trustStatus: DeviceTrustStatus.values.firstWhere(
        (e) => e.name == map['trust_status'],
        orElse: () => DeviceTrustStatus.unknown,
      ),
      riskScore: (map['risk_score'] as num).toInt(),
      firstSeen: map['first_seen'] as String,
      lastSeen: map['last_seen'] as String,
      vlan: map['vlan'] as String,
      bandwidthUpMbps: (map['bandwidth_up_mbps'] as num).toDouble(),
      bandwidthDownMbps: (map['bandwidth_down_mbps'] as num).toDouble(),
      openPorts: (map['open_ports'] as List<dynamic>? ?? [])
          .map((e) => (e as num).toInt())
          .toList(),
      osGuess: map['os_guess'] as String? ?? 'Unknown',
      fingerprintConfidence:
          (map['fingerprint_confidence'] as num?)?.toInt() ?? 50,
      anomalySummary: map['anomaly_summary'] as String?,
      trafficSeries24h: (map['traffic_series_24h'] as List<dynamic>? ?? [])
          .map((e) => (e as num).toInt())
          .toList(),
    );
  }
}

class SecurityAlert {
  final String id;
  final String title;
  final String summary;
  final AlertSeverity severity;
  final AlertStatus status;
  final String category;
  final String sourceIp;
  final String? destinationIp;
  final String? deviceId;
  final String deviceName;
  final String timestamp;
  final List<int> detectedPorts;
  final int confidence;
  final String aiExplanation;
  final String recommendedAction;

  const SecurityAlert({
    required this.id,
    required this.title,
    required this.summary,
    required this.severity,
    required this.status,
    required this.category,
    required this.sourceIp,
    this.destinationIp,
    this.deviceId,
    required this.deviceName,
    required this.timestamp,
    required this.detectedPorts,
    required this.confidence,
    required this.aiExplanation,
    required this.recommendedAction,
  });

  SecurityAlert copyWith({AlertStatus? status}) {
    return SecurityAlert(
      id: id,
      title: title,
      summary: summary,
      severity: severity,
      status: status ?? this.status,
      category: category,
      sourceIp: sourceIp,
      destinationIp: destinationIp,
      deviceId: deviceId,
      deviceName: deviceName,
      timestamp: timestamp,
      detectedPorts: detectedPorts,
      confidence: confidence,
      aiExplanation: aiExplanation,
      recommendedAction: recommendedAction,
    );
  }

  factory SecurityAlert.fromDb(Map<String, dynamic> map) {
    return SecurityAlert(
      id: map['id'] as String,
      title: map['title'] as String,
      summary: map['summary'] as String,
      severity: AlertSeverity.values.firstWhere(
        (e) => e.name == map['severity'],
        orElse: () => AlertSeverity.medium,
      ),
      status: AlertStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => AlertStatus.open,
      ),
      category: map['category'] as String,
      sourceIp: map['source_ip'] as String,
      destinationIp: map['destination_ip'] as String?,
      deviceId: map['device_id'] as String?,
      deviceName: map['device_name'] as String,
      timestamp: map['timestamp'] as String,
      detectedPorts: (map['detected_ports'] as List<dynamic>? ?? [])
          .map((e) => (e as num).toInt())
          .toList(),
      confidence: (map['confidence'] as num?)?.toInt() ?? 80,
      aiExplanation: map['ai_explanation'] as String,
      recommendedAction: map['recommended_action'] as String,
    );
  }
}

class TrafficPoint {
  final String timeLabel;
  final double inboundMbps;
  final double outboundMbps;
  final double anomalousMbps;

  const TrafficPoint({
    required this.timeLabel,
    required this.inboundMbps,
    required this.outboundMbps,
    required this.anomalousMbps,
  });
}

class SuspiciousFlow {
  final String id;
  final String sourceDevice;
  final String sourceIp;
  final String destinationIp;
  final String destinationGeo;
  final String protocol;
  final int port;
  final double bytesTransferredMB;
  final int durationSec;
  final AlertSeverity riskLevel;
  final String anomalyReason;
  final String timestamp;
  final bool mitigated;

  const SuspiciousFlow({
    required this.id,
    required this.sourceDevice,
    required this.sourceIp,
    required this.destinationIp,
    required this.destinationGeo,
    required this.protocol,
    required this.port,
    required this.bytesTransferredMB,
    required this.durationSec,
    required this.riskLevel,
    required this.anomalyReason,
    required this.timestamp,
    required this.mitigated,
  });

  SuspiciousFlow copyWith({bool? mitigated}) {
    return SuspiciousFlow(
      id: id,
      sourceDevice: sourceDevice,
      sourceIp: sourceIp,
      destinationIp: destinationIp,
      destinationGeo: destinationGeo,
      protocol: protocol,
      port: port,
      bytesTransferredMB: bytesTransferredMB,
      durationSec: durationSec,
      riskLevel: riskLevel,
      anomalyReason: anomalyReason,
      timestamp: timestamp,
      mitigated: mitigated ?? this.mitigated,
    );
  }
}

class PortScanEvent {
  final String id;
  final String sourceIp;
  final String sourceDevice;
  final String targetRange;
  final String scanType;
  final List<int> portsScanned;
  final int totalProbes;
  final int durationMs;
  final String timestamp;
  final AlertSeverity severity;
  final bool blocked;

  const PortScanEvent({
    required this.id,
    required this.sourceIp,
    required this.sourceDevice,
    required this.targetRange,
    required this.scanType,
    required this.portsScanned,
    required this.totalProbes,
    required this.durationMs,
    required this.timestamp,
    required this.severity,
    required this.blocked,
  });

  PortScanEvent copyWith({bool? blocked}) {
    return PortScanEvent(
      id: id,
      sourceIp: sourceIp,
      sourceDevice: sourceDevice,
      targetRange: targetRange,
      scanType: scanType,
      portsScanned: portsScanned,
      totalProbes: totalProbes,
      durationMs: durationMs,
      timestamp: timestamp,
      severity: severity,
      blocked: blocked ?? this.blocked,
    );
  }
}

class RiskFactor {
  final String id;
  final String category;
  final String title;
  final String description;
  final int currentScore;
  final double weight;
  final bool remediated;
  final int impactPoints;
  final String remediationStep;

  const RiskFactor({
    required this.id,
    required this.category,
    required this.title,
    required this.description,
    required this.currentScore,
    required this.weight,
    required this.remediated,
    required this.impactPoints,
    required this.remediationStep,
  });

  RiskFactor copyWith({bool? remediated}) {
    return RiskFactor(
      id: id,
      category: category,
      title: title,
      description: description,
      currentScore: currentScore,
      weight: weight,
      remediated: remediated ?? this.remediated,
      impactPoints: impactPoints,
      remediationStep: remediationStep,
    );
  }
}

class SecurityReport {
  final String id;
  final String title;
  final String period;
  final String generatedAt;
  final int securityScore;
  final int totalDevices;
  final int threatsMitigated;
  final int criticalFindings;
  final String summary;

  const SecurityReport({
    required this.id,
    required this.title,
    required this.period,
    required this.generatedAt,
    required this.securityScore,
    required this.totalDevices,
    required this.threatsMitigated,
    required this.criticalFindings,
    required this.summary,
  });
}

class UserProfile {
  final String fullName;
  final String email;
  final String phone;
  final String location;
  final String role;
  final String department;
  final String organization;
  final String bio;
  final String networkName;
  final String subnetCidr;
  final String? avatarPath;

  const UserProfile({
    required this.fullName,
    required this.email,
    required this.phone,
    required this.location,
    required this.role,
    required this.department,
    required this.organization,
    required this.bio,
    required this.networkName,
    required this.subnetCidr,
    this.avatarPath,
  });

  UserProfile copyWith({
    String? fullName,
    String? email,
    String? phone,
    String? location,
    String? role,
    String? department,
    String? organization,
    String? bio,
    String? networkName,
    String? subnetCidr,
    String? avatarPath,
    bool clearAvatar = false,
  }) {
    return UserProfile(
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      location: location ?? this.location,
      role: role ?? this.role,
      department: department ?? this.department,
      organization: organization ?? this.organization,
      bio: bio ?? this.bio,
      networkName: networkName ?? this.networkName,
      subnetCidr: subnetCidr ?? this.subnetCidr,
      avatarPath: clearAvatar ? null : (avatarPath ?? this.avatarPath),
    );
  }
}

class AiThreatBriefing {
  final String executiveSummary;
  final String topPriority;
  final String attackChain;
  final List<String> immediateActions;
  final int confidenceScore;

  const AiThreatBriefing({
    required this.executiveSummary,
    required this.topPriority,
    required this.attackChain,
    required this.immediateActions,
    required this.confidenceScore,
  });
}
