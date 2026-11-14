export type DeviceTrustStatus = 'trusted' | 'unknown' | 'suspicious' | 'quarantined';

export type DeviceCategory =
  | 'Workstation'
  | 'Mobile'
  | 'Server'
  | 'IoT'
  | 'Router'
  | 'Unidentified';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export type NavigationTab =
  | 'dashboard'
  | 'devices'
  | 'unknown-devices'
  | 'traffic'
  | 'port-scans'
  | 'threat-intel'
  | 'alerts'
  | 'risk-assessment'
  | 'reports'
  | 'settings';

export interface NetworkDevice {
  id: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  vendor: string;
  category: DeviceCategory;
  trustStatus: DeviceTrustStatus;
  riskScore: number; // 0-100
  firstSeen: string;
  lastSeen: string;
  vlan: string;
  bandwidthUpMbps: number;
  bandwidthDownMbps: number;
  openPorts: number[];
  osGuess: string;
  fingerprintConfidence: number; // 0-100
  anomalySummary?: string;
  trafficSeries24h: number[];
}

export interface SecurityAlert {
  id: string;
  title: string;
  summary: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category:
    | 'Unknown Device'
    | 'Port Scan'
    | 'Traffic Anomaly'
    | 'DNS Tunneling'
    | 'Lateral Movement'
    | 'Brute Force';
  sourceIp: string;
  destinationIp?: string;
  deviceId?: string;
  deviceName: string;
  timestamp: string;
  detectedPorts?: number[];
  confidence: number;
  aiExplanation: string;
  recommendedAction: string;
}

export interface TrafficPoint {
  timeLabel: string;
  inboundMbps: number;
  outboundMbps: number;
  anomalousMbps: number;
  packetCount: number;
}

export interface SuspiciousFlow {
  id: string;
  sourceDevice: string;
  sourceIp: string;
  destinationIp: string;
  destinationGeo: string;
  protocol: 'TCP' | 'UDP' | 'DNS' | 'TLS' | 'ICMP';
  port: number;
  bytesTransferredMB: number;
  durationSec: number;
  riskLevel: AlertSeverity;
  anomalyReason: string;
  timestamp: string;
  mitigated: boolean;
}

export interface ProtocolShare {
  protocol: string;
  percentage: number;
  volumeGB: number;
}

export interface PortScanEvent {
  id: string;
  sourceIp: string;
  sourceDevice: string;
  targetRange: string;
  scanType: 'TCP SYN Stealth' | 'Sequential Sweep' | 'UDP Service Probe' | 'XMAS Tree Scan';
  portsScanned: number[];
  totalProbes: number;
  durationMs: number;
  timestamp: string;
  severity: AlertSeverity;
  blocked: boolean;
}

export interface ThreatVector {
  id: string;
  name: string;
  tactic: string;
  baselineDeviationPct: number;
  confidence: number;
  affectedDevices: number;
  severity: AlertSeverity;
  description: string;
  simulatedInsight: string;
}

export interface RiskFactor {
  id: string;
  category: string;
  title: string;
  description: string;
  currentScore: number; // 0-100 (higher is safer)
  weight: number;
  remediated: boolean;
  impactPoints: number;
  remediationStep: string;
}

export interface SecurityReport {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  securityScore: number;
  totalDevices: number;
  threatsMitigated: number;
  criticalFindings: number;
  summary: string;
  formatReady: ('JSON' | 'CSV' | 'Markdown')[];
}

export interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  department: string;
  organization: string;
  phone: string;
  location: string;
  bio: string;
  networkName: string;
  subnetCidr: string;
  avatarUrl: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  alertThreshold: 'all' | 'medium-up' | 'high-critical';
  autoQuarantineUnknown: boolean;
  portScanSensitivity: 'balanced' | 'strict' | 'permissive';
  pushNotifications: boolean;
  weeklyDigest: boolean;
}

export interface IntegrationStatus {
  supabaseConfigured: boolean;
  supabaseUrl: string;
  tablesReady: boolean;
  hasData: boolean;
  schemaError?: string | null;
  geminiConfigured: boolean;
}

export interface AiThreatBriefing {
  executiveSummary: string;
  topPriority: string;
  attackChain: string;
  immediateActions: string[];
  confidenceScore: number;
  generatedAt: string;
}

export interface AiAlertAnalysis {
  rootCause: string;
  blastRadius: string;
  firewallRuleSuggestion: string;
  triageSteps: string[];
}

export interface AiDeviceAudit {
  postureAssessment: string;
  portRiskNotes: string;
  recommendation: string;
}

