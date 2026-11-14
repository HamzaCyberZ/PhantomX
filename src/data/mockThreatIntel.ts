import { ThreatVector } from '../types/network';

export const THREAT_VECTORS: ThreatVector[] = [
  {
    id: 'tv-01',
    name: 'East-West SMB / RDP Lateral Enumeration',
    tactic: 'Discovery · TA0007',
    baselineDeviationPct: 340,
    confidence: 95,
    affectedDevices: 1,
    severity: 'critical',
    description:
      'Elevated half-open TCP SYN connection velocity targeting administrative ports across VLAN 10.',
    simulatedInsight:
      'Simulated AI correlation links ws-build-runner SYN bursts directly to high-entropy DNS queries within a 50-minute window.',
  },
  {
    id: 'tv-02',
    name: 'Unauthorized Embedded Hardware C2 Beaconing',
    tactic: 'Command & Control · TA0011',
    baselineDeviationPct: 215,
    confidence: 92,
    affectedDevices: 1,
    severity: 'critical',
    description:
      'Consistent 60-second interval TLS payload bursts to uncategorized external ASN from an unregistered Espressif MAC.',
    simulatedInsight:
      'Packet inter-arrival jitter is under 40ms, strongly characteristic of automated heartbeat polling rather than human browsing.',
  },
  {
    id: 'tv-03',
    name: 'Covert DNS TXT Payload Tunneling',
    tactic: 'Exfiltration · TA0010',
    baselineDeviationPct: 168,
    confidence: 88,
    affectedDevices: 1,
    severity: 'high',
    description:
      'Encoded subdomain queries directed outside the authorized internal Pi-hole / gateway DNS forwarder.',
    simulatedInsight:
      'Enforcing outbound port 53 blocking at gw-core-unifi eliminates 100% of unauthorized resolver paths.',
  },
  {
    id: 'tv-04',
    name: 'IoT VLAN Media Stream Relay',
    tactic: 'Collection · TA0009',
    baselineDeviationPct: 124,
    confidence: 84,
    affectedDevices: 1,
    severity: 'high',
    description:
      'Locally administered MAC address initiating persistent outbound RTSP session to external VPS infrastructure.',
    simulatedInsight:
      'VLAN 20 egress ACLs currently permit outbound TCP 554; restricting IoT egress to local NVR will contain this vector.',
  },
];

export const BEHAVIOUR_BASELINE_COMPARISON = [
  { metric: 'SYN Packets / min', baseline: 18, observed: 274, unit: 'pkt/m' },
  { metric: 'External DNS Resolvers', baseline: 1, observed: 4, unit: 'hosts' },
  { metric: 'Unregistered Endpoints', baseline: 0, observed: 2, unit: 'nodes' },
  { metric: 'Off-Hours Outbound Egress', baseline: 1.4, observed: 4.8, unit: 'GB' },
];
