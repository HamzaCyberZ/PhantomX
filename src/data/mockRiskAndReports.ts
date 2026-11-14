import type { RiskFactor, SecurityReport, UserProfile } from '../types/network.ts';

export const INITIAL_RISK_FACTORS: RiskFactor[] = [
  {
    id: 'rf-01',
    category: 'Device Hygiene',
    title: 'Quarantine or Verify 2 Unrecognized Network Endpoints',
    description:
      'Two devices (unrecognized-esp-9f2 and unknown-node-b4c) lack 802.1X certificate validation.',
    currentScore: 46,
    weight: 0.25,
    remediated: false,
    impactPoints: 11,
    remediationStep: 'Move unknown MAC addresses to VLAN 99 Quarantine or bind static NAC policy.',
  },
  {
    id: 'rf-02',
    category: 'Perimeter & Ports',
    title: 'Disable Plaintext Telnet (23) & Restrict Internal SMB (445)',
    description:
      'Legacy administrative ports remain reachable across VLAN 10 without host-based firewall rules.',
    currentScore: 62,
    weight: 0.25,
    remediated: false,
    impactPoints: 8,
    remediationStep: 'Apply intra-VLAN micro-segmentation rule blocking TCP 23 and 445 except from Admin Jump Host.',
  },
  {
    id: 'rf-03',
    category: 'DNS Integrity',
    title: 'Block Direct Outbound Port 53 Outside Corporate Resolver',
    description:
      'Workstations can currently bypass the internal DNS filter and query external resolvers directly.',
    currentScore: 68,
    weight: 0.20,
    remediated: false,
    impactPoints: 6,
    remediationStep: 'Enforce gateway NAT redirect for UDP/TCP 53 to 192.168.10.1.',
  },
  {
    id: 'rf-04',
    category: 'Encrypted Traffic',
    title: 'Enforce TLS 1.3 Minimum & JA3 Anomaly Blocking',
    description:
      'One embedded node uses deprecated TLS 1.1 cipher suites when communicating externally.',
    currentScore: 74,
    weight: 0.15,
    remediated: false,
    impactPoints: 4,
    remediationStep: 'Upgrade gateway TLS inspection policy to drop sessions below TLS 1.2.',
  },
  {
    id: 'rf-05',
    category: 'Lateral Movement',
    title: 'Enable Dynamic ARP Inspection Across IoT Subnet',
    description:
      'VLAN 10 already enforces DAI, but VLAN 20 (IoT) lacks ARP spoofing protection.',
    currentScore: 81,
    weight: 0.15,
    remediated: true,
    impactPoints: 3,
    remediationStep: 'DAI enabled on Switch Profile Core-SW-01 for VLAN 10 and VLAN 20.',
  },
];

export const INITIAL_REPORTS: SecurityReport[] = [
  {
    id: 'rep-2026-11-14',
    title: 'Daily Network Behaviour Audit',
    period: 'Nov 14, 2026 · 00:00 – 11:15',
    generatedAt: '2026-11-14 11:15',
    securityScore: 71,
    totalDevices: 10,
    threatsMitigated: 2,
    criticalFindings: 2,
    summary:
      'Elevated lateral port sweep activity and two unverified endpoints lowered overall posture by 12 points compared to yesterday.',
    formatReady: ['JSON', 'CSV', 'Markdown'],
  },
  {
    id: 'rep-2026-11-13',
    title: 'Daily Network Behaviour Audit',
    period: 'Nov 13, 2026 · Full 24h',
    generatedAt: '2026-11-13 23:59',
    securityScore: 83,
    totalDevices: 8,
    threatsMitigated: 3,
    criticalFindings: 1,
    summary:
      'Automated ARP spoofing mitigation quarantined rogue-bridge-77a within 18 seconds of detection.',
    formatReady: ['JSON', 'CSV', 'Markdown'],
  },
  {
    id: 'rep-2026-w45',
    title: 'Weekly Executive Risk & Traffic Posture',
    period: 'Nov 02 – Nov 08, 2026',
    generatedAt: '2026-11-09 08:00',
    securityScore: 91,
    totalDevices: 7,
    threatsMitigated: 5,
    criticalFindings: 0,
    summary:
      'Zero critical lateral movement events. DNS hygiene remained 99.4% compliant across all corporate devices.',
    formatReady: ['JSON', 'CSV', 'Markdown'],
  },
  {
    id: 'rep-2026-10',
    title: 'Monthly Compliance & Anomaly Summary',
    period: 'October 2026',
    generatedAt: '2026-11-01 07:30',
    securityScore: 93,
    totalDevices: 7,
    threatsMitigated: 11,
    criticalFindings: 0,
    summary:
      'Baseline traffic volume averaged 218 GB/week with 100% uptime on gateway intrusion heuristics.',
    formatReady: ['JSON', 'CSV', 'Markdown'],
  },
];

export const SCORE_TREND_7D = [
  { day: 'Nov 08', score: 92 },
  { day: 'Nov 09', score: 91 },
  { day: 'Nov 10', score: 90 },
  { day: 'Nov 11', score: 88 },
  { day: 'Nov 12', score: 86 },
  { day: 'Nov 13', score: 83 },
  { day: 'Nov 14', score: 71 },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  fullName: 'Elena Vance',
  email: 'elena.vance@phantomx.io',
  role: 'Lead Network Security Analyst',
  department: 'Threat Operations & Zero Trust',
  organization: 'Vanguard Lab Infrastructure',
  phone: '+1 (415) 890-4312',
  location: 'San Francisco, CA',
  bio: 'Focused on behavioural anomaly detection, lateral movement containment, and automated VLAN micro-segmentation.',
  networkName: 'HQ-Core-VLAN10',
  subnetCidr: '192.168.10.0/24',
  avatarUrl: '/src/assets/images/analyst_avatar_1794683835559.jpg',
};
