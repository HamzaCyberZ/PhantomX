import type { SecurityAlert } from '../types/network.ts';

export const INITIAL_ALERTS: SecurityAlert[] = [
  {
    id: 'alrt-101',
    title: 'Lateral TCP SYN Port Sweep Detected',
    summary:
      'Workstation ws-build-runner probed 14 internal hosts across SMB (445) and RDP (3389) within 4.2 seconds.',
    severity: 'critical',
    status: 'open',
    category: 'Port Scan',
    sourceIp: '192.168.10.48',
    destinationIp: '192.168.10.0/24',
    deviceId: 'dev-05',
    deviceName: 'ws-build-runner',
    timestamp: '2026-11-14 11:09:12',
    detectedPorts: [22, 135, 445, 3389, 5985],
    confidence: 96,
    aiExplanation:
      'Simulated behavioural model observed a 1,420% spike in half-open SYN packets per second from ws-build-runner compared to its 30-day CI/CD build baseline.',
    recommendedAction:
      'Isolate host interface from VLAN 10 and inspect active SSH/cron processes for unauthorized enumeration scripts.',
  },
  {
    id: 'alrt-102',
    title: 'Unrecognized Embedded Endpoint Joined Corporate VLAN',
    summary:
      'Espressif device unrecognized-esp-9f2 bypassed NAC profile and opened outbound TLS sessions to 185.220.101.44.',
    severity: 'critical',
    status: 'open',
    category: 'Unknown Device',
    sourceIp: '192.168.10.187',
    destinationIp: '185.220.101.44',
    deviceId: 'dev-04',
    deviceName: 'unrecognized-esp-9f2',
    timestamp: '2026-11-14 10:42:39',
    detectedPorts: [23, 80, 1883, 8080],
    confidence: 93,
    aiExplanation:
      'OUI fingerprint matches an unregistered microcontroller broadcasting plaintext Telnet (23) and MQTT (1883) alongside regular 60-second outbound keepalive beacons.',
    recommendedAction:
      'Quarantine MAC 4C:11:AE:0D:9F:22 immediately or verify hardware asset ownership with Facilities.',
  },
  {
    id: 'alrt-103',
    title: 'High-Entropy DNS TXT Query Burst',
    summary:
      'Sustained base32-encoded DNS TXT lookups targeting *.tunn.edge-telemetry.net suggesting possible DNS exfiltration.',
    severity: 'high',
    status: 'investigating',
    category: 'DNS Tunneling',
    sourceIp: '192.168.10.48',
    destinationIp: '94.140.14.14',
    deviceId: 'dev-05',
    deviceName: 'ws-build-runner',
    timestamp: '2026-11-14 10:18:04',
    detectedPorts: [53],
    confidence: 89,
    aiExplanation:
      'Shannon entropy of subdomain labels averaged 4.41 bits/char (normal corporate baseline 2.74), with 312 consecutive TXT responses exceeding 220 bytes.',
    recommendedAction:
      'Enforce DNS sinkhole rule for edge-telemetry.net and capture host resolver logs.',
  },
  {
    id: 'alrt-104',
    title: 'Randomized MAC Endpoint Streaming RTSP on IoT VLAN',
    summary:
      'New unknown node 192.168.20.142 appeared with locally administered MAC and active port 554 listener.',
    severity: 'high',
    status: 'open',
    category: 'Unknown Device',
    sourceIp: '192.168.20.142',
    deviceId: 'dev-07',
    deviceName: 'unknown-node-b4c',
    timestamp: '2026-11-14 09:19:51',
    detectedPorts: [554, 8554],
    confidence: 85,
    aiExplanation:
      'IoT VLAN baseline allows only pre-registered Axis and HID MAC ranges. Device shows unauthorized camera stream signature.',
    recommendedAction:
      'Block port 554 egress on switch port and validate physical camera inventory.',
  },
  {
    id: 'alrt-105',
    title: 'Off-Hours Large Outbound Archive Transfer',
    summary:
      'nas-vault-01 transmitted 4.8 GB over port 443 to unverified cloud storage endpoint during 03:00 window.',
    severity: 'medium',
    status: 'investigating',
    category: 'Traffic Anomaly',
    sourceIp: '192.168.10.12',
    destinationIp: '104.26.11.98',
    deviceId: 'dev-03',
    deviceName: 'nas-vault-01',
    timestamp: '2026-11-14 03:14:27',
    detectedPorts: [443],
    confidence: 78,
    aiExplanation:
      'Nightly backup window normally completes at 02:15 to primary S3 bucket; this session targeted an unfamiliar CDN IP.',
    recommendedAction:
      'Confirm scheduled replication job ID with Infrastructure Ops before closing.',
  },
  {
    id: 'alrt-106',
    title: 'ARP Spoofing & Tor Listener Blocked',
    summary:
      'rogue-bridge-77a attempted gratuitous ARP spoofing targeting default gateway 192.168.10.1.',
    severity: 'critical',
    status: 'resolved',
    category: 'Lateral Movement',
    sourceIp: '192.168.10.209',
    destinationIp: '192.168.10.1',
    deviceId: 'dev-10',
    deviceName: 'rogue-bridge-77a',
    timestamp: '2026-11-13 22:14:08',
    detectedPorts: [22, 9050],
    confidence: 98,
    aiExplanation:
      'Dynamic ARP Inspection flagged conflicting MAC claims for gateway IP; device was moved to VLAN 99 Quarantine.',
    recommendedAction:
      'Physically locate Raspberry Pi hardware on switch port Gi0/14 and decommission.',
  },
  {
    id: 'alrt-107',
    title: 'Repeated SSH Authentication Failures',
    summary:
      '18 failed SSH login attempts observed from internal test subnet toward nas-vault-01.',
    severity: 'low',
    status: 'resolved',
    category: 'Brute Force',
    sourceIp: '192.168.10.48',
    destinationIp: '192.168.10.12',
    deviceId: 'dev-03',
    deviceName: 'nas-vault-01',
    timestamp: '2026-11-13 17:45:00',
    detectedPorts: [22],
    confidence: 82,
    aiExplanation:
      'Misconfigured deployment key rotated at 17:42 caused repeated auth rejections before key update.',
    recommendedAction:
      'No further action required; key fingerprint verified.',
  },
];
