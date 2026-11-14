import { INITIAL_ALERTS } from '../data/mockAlerts';
import { INITIAL_DEVICES } from '../data/mockDevices';
import { INITIAL_PORT_SCANS } from '../data/mockPortScans';
import {
  DEFAULT_USER_PROFILE,
  INITIAL_REPORTS,
  INITIAL_RISK_FACTORS,
  SCORE_TREND_7D,
} from '../data/mockRiskAndReports';
import {
  BEHAVIOUR_BASELINE_COMPARISON,
  THREAT_VECTORS,
} from '../data/mockThreatIntel';
import {
  INITIAL_SUSPICIOUS_FLOWS,
  PROTOCOL_DISTRIBUTION,
  TRAFFIC_SERIES_24H,
} from '../data/mockTraffic';
import {
  AiAlertAnalysis,
  AiDeviceAudit,
  AiThreatBriefing,
  AlertStatus,
  DeviceTrustStatus,
  IntegrationStatus,
  NetworkDevice,
  PortScanEvent,
  RiskFactor,
  SecurityAlert,
  SecurityReport,
  SuspiciousFlow,
} from '../types/network';

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

/**
 * Unified data & AI service for NetPhantom AI.
 * Connects to Express server endpoints backed by Supabase and Gemini AI,
 * with graceful fallback to local sample data when running in Demo Mode.
 */
export const networkService = {
  getInitialSnapshot() {
    return {
      devices: INITIAL_DEVICES,
      alerts: INITIAL_ALERTS,
      trafficSeries: TRAFFIC_SERIES_24H,
      protocolDistribution: PROTOCOL_DISTRIBUTION,
      suspiciousFlows: INITIAL_SUSPICIOUS_FLOWS,
      portScans: INITIAL_PORT_SCANS,
      threatVectors: THREAT_VECTORS,
      baselineComparison: BEHAVIOUR_BASELINE_COMPARISON,
      riskFactors: INITIAL_RISK_FACTORS,
      reports: INITIAL_REPORTS,
      scoreTrend7d: SCORE_TREND_7D,
      profile: DEFAULT_USER_PROFILE,
    };
  },

  async getIntegrationStatus(): Promise<IntegrationStatus> {
    return apiJson<IntegrationStatus>('/api/status');
  },

  async fetchSupabaseSnapshot(): Promise<{
    connected: boolean;
    tablesReady?: boolean;
    empty?: boolean;
    reason?: string;
    devices?: NetworkDevice[];
    alerts?: SecurityAlert[];
    suspiciousFlows?: SuspiciousFlow[];
    portScans?: PortScanEvent[];
    riskFactors?: RiskFactor[];
    reports?: SecurityReport[];
  }> {
    return apiJson('/api/supabase/snapshot');
  },

  async seedSupabase(): Promise<{ ok: boolean; message: string }> {
    return apiJson('/api/supabase/seed', { method: 'POST' });
  },

  async authLogin(email: string, password: string) {
    return apiJson<{
      mode: 'supabase' | 'demo';
      user: { id?: string; email: string; fullName: string };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async authSignup(email: string, password: string, fullName: string) {
    return apiJson<{
      mode: 'supabase' | 'demo';
      requiresEmailConfirm?: boolean;
      user: { id?: string; email: string; fullName: string };
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  },

  async persistDeviceTrust(
    id: string,
    payload: {
      trustStatus: DeviceTrustStatus;
      riskScore: number;
      vlan: string;
      bandwidthUpMbps: number;
      bandwidthDownMbps: number;
    },
  ) {
    return apiJson(`/api/supabase/devices/${encodeURIComponent(id)}/trust`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async persistAlertStatus(id: string, status: AlertStatus) {
    return apiJson(`/api/supabase/alerts/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async persistFlowMitigation(id: string, mitigated: boolean) {
    return apiJson(`/api/supabase/flows/${encodeURIComponent(id)}/mitigate`, {
      method: 'PATCH',
      body: JSON.stringify({ mitigated }),
    });
  },

  async persistPortScanBlock(id: string, blocked: boolean) {
    return apiJson(`/api/supabase/port-scans/${encodeURIComponent(id)}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ blocked }),
    });
  },

  async persistRiskFactorToggle(id: string, remediated: boolean) {
    return apiJson(`/api/supabase/risk-factors/${encodeURIComponent(id)}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ remediated }),
    });
  },

  async persistReport(report: SecurityReport) {
    return apiJson('/api/supabase/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  async persistSimulatedEvent(payload: {
    device: NetworkDevice;
    alert: SecurityAlert;
    portScan: PortScanEvent;
    flow: SuspiciousFlow;
  }) {
    return apiJson('/api/supabase/inject-event', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async runAiThreatAnalysis(payload: {
    devices: NetworkDevice[];
    alerts: SecurityAlert[];
    suspiciousFlows: SuspiciousFlow[];
    portScans: PortScanEvent[];
    securityScore: number;
  }): Promise<AiThreatBriefing> {
    const res = await apiJson<Omit<AiThreatBriefing, 'generatedAt'>>(
      '/api/ai/threat-analysis',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    return {
      ...res,
      generatedAt: new Date().toTimeString().slice(0, 5),
    };
  },

  async analyzeAlertWithAi(
    alert: SecurityAlert,
    device?: NetworkDevice,
  ): Promise<AiAlertAnalysis> {
    return apiJson<AiAlertAnalysis>('/api/ai/analyze-alert', {
      method: 'POST',
      body: JSON.stringify({ alert, device }),
    });
  },

  async analyzeDeviceWithAi(
    device: NetworkDevice,
    relatedAlerts: SecurityAlert[],
  ): Promise<AiDeviceAudit> {
    return apiJson<AiDeviceAudit>('/api/ai/analyze-device', {
      method: 'POST',
      body: JSON.stringify({ device, relatedAlerts }),
    });
  },

  async investigateWithAi(
    question: string,
    contextSummary: unknown,
  ): Promise<{ answer: string }> {
    return apiJson<{ answer: string }>('/api/ai/investigate', {
      method: 'POST',
      body: JSON.stringify({ question, contextSummary }),
    });
  },

  computeNetworkSecurityScore(
    devices: NetworkDevice[],
    alerts: SecurityAlert[],
    riskFactors: RiskFactor[],
  ): number {
    const unknownCount = devices.filter((d) => d.trustStatus === 'unknown').length;
    const suspiciousCount = devices.filter((d) => d.trustStatus === 'suspicious').length;
    const openCritical = alerts.filter(
      (a) => a.status === 'open' && a.severity === 'critical',
    ).length;
    const openHigh = alerts.filter(
      (a) => a.status === 'open' && a.severity === 'high',
    ).length;
    const remediatedBonus = riskFactors
      .filter((rf) => rf.remediated)
      .reduce((acc, rf) => acc + Math.round(rf.impactPoints * 0.55), 0);

    const raw =
      94 -
      unknownCount * 5 -
      suspiciousCount * 6 -
      openCritical * 6 -
      openHigh * 3 +
      remediatedBonus;

    return Math.max(22, Math.min(99, raw));
  },

  generateSimulatedThreatEvent(): {
    device: NetworkDevice;
    alert: SecurityAlert;
    portScan: PortScanEvent;
    flow: SuspiciousFlow;
  } {
    const suffix = Math.floor(100 + Math.random() * 899);
    const octet = Math.floor(150 + Math.random() * 90);
    const ip = `192.168.10.${octet}`;
    const macHex = suffix.toString(16).toUpperCase().padStart(2, '0');
    const nowTime = new Date().toTimeString().slice(0, 8);

    const device: NetworkDevice = {
      id: `dev-sim-${suffix}`,
      hostname: `phantom-probe-${suffix}`,
      ipAddress: ip,
      macAddress: `DE:AD:BE:EF:${macHex}:41`,
      vendor: 'Unregistered NIC Vendor',
      category: 'Unidentified',
      trustStatus: 'unknown',
      riskScore: 87,
      firstSeen: `Today ${nowTime.slice(0, 5)}`,
      lastSeen: 'Just now',
      vlan: 'VLAN 10 · Corp',
      bandwidthUpMbps: 24.4,
      bandwidthDownMbps: 6.2,
      openPorts: [22, 445, 4444],
      osGuess: 'Linux Embedded',
      fingerprintConfidence: 58,
      anomalySummary:
        'Injected unverified node attempting rapid SMB/SSH discovery.',
      trafficSeries24h: [0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 19, 31],
    };

    const alert: SecurityAlert = {
      id: `alrt-sim-${suffix}`,
      title: `Unknown Probe Detected (${ip})`,
      summary: `Unrecognized device ${device.hostname} initiated outbound beacon and scanned internal SMB ports.`,
      severity: 'critical',
      status: 'open',
      category: 'Unknown Device',
      sourceIp: ip,
      destinationIp: '192.168.10.12',
      deviceId: device.id,
      deviceName: device.hostname,
      timestamp: `2026-11-14 ${nowTime}`,
      detectedPorts: [22, 445, 4444],
      confidence: 94,
      aiExplanation:
        'Anomaly heuristics flagged unauthorized MAC address paired with rapid TCP SYN fan-out.',
      recommendedAction:
        'Quarantine endpoint from Devices view or run AI Root-Cause Analysis.',
    };

    const portScan: PortScanEvent = {
      id: `ps-sim-${suffix}`,
      sourceIp: ip,
      sourceDevice: device.hostname,
      targetRange: '192.168.10.1 – 192.168.10.32',
      scanType: 'TCP SYN Stealth',
      portsScanned: [22, 445, 3389, 4444],
      totalProbes: 128,
      durationMs: 1480,
      timestamp: `2026-11-14 ${nowTime}`,
      severity: 'high',
      blocked: false,
    };

    const flow: SuspiciousFlow = {
      id: `flow-sim-${suffix}`,
      sourceDevice: device.hostname,
      sourceIp: ip,
      destinationIp: '198.51.100.77',
      destinationGeo: 'External ASN · Flagged',
      protocol: 'TCP',
      port: 4444,
      bytesTransferredMB: 48.2,
      durationSec: 210,
      riskLevel: 'critical',
      anomalyReason: 'Reverse-shell listener pattern on non-standard TCP port 4444',
      timestamp: nowTime,
      mitigated: false,
    };

    return { device, alert, portScan, flow };
  },

  createReportSnapshot(
    score: number,
    devices: NetworkDevice[],
    alerts: SecurityAlert[],
  ): SecurityReport {
    const resolved = alerts.filter((a) => a.status === 'resolved').length;
    const critical = alerts.filter(
      (a) => a.severity === 'critical' && a.status !== 'resolved',
    ).length;
    const now = new Date();
    const stamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

    return {
      id: `rep-snap-${Date.now()}`,
      title: 'On-Demand Security Posture Snapshot',
      period: `Snapshot · ${stamp}`,
      generatedAt: stamp,
      securityScore: score,
      totalDevices: devices.length,
      threatsMitigated: resolved,
      criticalFindings: critical,
      summary: `Generated across ${devices.length} monitored endpoints with ${critical} unresolved critical findings.`,
      formatReady: ['JSON', 'CSV', 'Markdown'],
    };
  },
};
