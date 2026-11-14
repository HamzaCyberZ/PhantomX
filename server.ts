import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_DEVICES } from './src/data/mockDevices';
import { INITIAL_ALERTS } from './src/data/mockAlerts';
import { INITIAL_SUSPICIOUS_FLOWS } from './src/data/mockTraffic';
import { INITIAL_PORT_SCANS } from './src/data/mockPortScans';
import { INITIAL_REPORTS, INITIAL_RISK_FACTORS } from './src/data/mockRiskAndReports';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://ufamecgfayoarbnodqul.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Snake_case <-> camelCase mappers for Supabase tables
const toDbDevice = (d: any) => ({
  id: d.id,
  hostname: d.hostname,
  ip_address: d.ipAddress,
  mac_address: d.macAddress,
  vendor: d.vendor,
  category: d.category,
  trust_status: d.trustStatus,
  risk_score: d.riskScore,
  first_seen: d.firstSeen,
  last_seen: d.lastSeen,
  vlan: d.vlan,
  bandwidth_up_mbps: d.bandwidthUpMbps,
  bandwidth_down_mbps: d.bandwidthDownMbps,
  open_ports: d.openPorts,
  os_guess: d.osGuess,
  fingerprint_confidence: d.fingerprintConfidence,
  anomaly_summary: d.anomalySummary ?? null,
  traffic_series_24h: d.trafficSeries24h,
});

const fromDbDevice = (r: any) => ({
  id: r.id,
  hostname: r.hostname,
  ipAddress: r.ip_address,
  macAddress: r.mac_address,
  vendor: r.vendor,
  category: r.category,
  trustStatus: r.trust_status,
  riskScore: Number(r.risk_score),
  firstSeen: r.first_seen,
  lastSeen: r.last_seen,
  vlan: r.vlan,
  bandwidthUpMbps: Number(r.bandwidth_up_mbps),
  bandwidthDownMbps: Number(r.bandwidth_down_mbps),
  openPorts: r.open_ports ?? [],
  osGuess: r.os_guess,
  fingerprintConfidence: Number(r.fingerprint_confidence),
  anomalySummary: r.anomaly_summary ?? undefined,
  trafficSeries24h: r.traffic_series_24h ?? [],
});

const toDbAlert = (a: any) => ({
  id: a.id,
  title: a.title,
  summary: a.summary,
  severity: a.severity,
  status: a.status,
  category: a.category,
  source_ip: a.sourceIp,
  destination_ip: a.destinationIp ?? null,
  device_id: a.deviceId ?? null,
  device_name: a.deviceName,
  timestamp: a.timestamp,
  detected_ports: a.detectedPorts ?? [],
  confidence: a.confidence,
  ai_explanation: a.aiExplanation,
  recommended_action: a.recommendedAction,
});

const fromDbAlert = (r: any) => ({
  id: r.id,
  title: r.title,
  summary: r.summary,
  severity: r.severity,
  status: r.status,
  category: r.category,
  sourceIp: r.source_ip,
  destinationIp: r.destination_ip ?? undefined,
  deviceId: r.device_id ?? undefined,
  deviceName: r.device_name,
  timestamp: r.timestamp,
  detectedPorts: r.detected_ports ?? [],
  confidence: Number(r.confidence),
  aiExplanation: r.ai_explanation,
  recommendedAction: r.recommended_action,
});

const toDbFlow = (f: any) => ({
  id: f.id,
  source_device: f.sourceDevice,
  source_ip: f.sourceIp,
  destination_ip: f.destinationIp,
  destination_geo: f.destinationGeo,
  protocol: f.protocol,
  port: f.port,
  bytes_transferred_mb: f.bytesTransferredMB,
  duration_sec: f.durationSec,
  risk_level: f.riskLevel,
  anomaly_reason: f.anomalyReason,
  timestamp: f.timestamp,
  mitigated: f.mitigated,
});

const fromDbFlow = (r: any) => ({
  id: r.id,
  sourceDevice: r.source_device,
  sourceIp: r.source_ip,
  destinationIp: r.destination_ip,
  destinationGeo: r.destination_geo,
  protocol: r.protocol,
  port: Number(r.port),
  bytesTransferredMB: Number(r.bytes_transferred_mb),
  durationSec: Number(r.duration_sec),
  riskLevel: r.risk_level,
  anomalyReason: r.anomaly_reason,
  timestamp: r.timestamp,
  mitigated: Boolean(r.mitigated),
});

const toDbScan = (s: any) => ({
  id: s.id,
  source_ip: s.sourceIp,
  source_device: s.sourceDevice,
  target_range: s.targetRange,
  scan_type: s.scanType,
  ports_scanned: s.portsScanned,
  total_probes: s.totalProbes,
  duration_ms: s.durationMs,
  timestamp: s.timestamp,
  severity: s.severity,
  blocked: s.blocked,
});

const fromDbScan = (r: any) => ({
  id: r.id,
  sourceIp: r.source_ip,
  sourceDevice: r.source_device,
  targetRange: r.target_range,
  scanType: r.scan_type,
  portsScanned: r.ports_scanned ?? [],
  totalProbes: Number(r.total_probes),
  durationMs: Number(r.duration_ms),
  timestamp: r.timestamp,
  severity: r.severity,
  blocked: Boolean(r.blocked),
});

const toDbRisk = (rf: any) => ({
  id: rf.id,
  category: rf.category,
  title: rf.title,
  description: rf.description,
  current_score: rf.currentScore,
  weight: rf.weight,
  remediated: rf.remediated,
  impact_points: rf.impactPoints,
  remediation_step: rf.remediationStep,
});

const fromDbRisk = (r: any) => ({
  id: r.id,
  category: r.category,
  title: r.title,
  description: r.description,
  currentScore: Number(r.current_score),
  weight: Number(r.weight),
  remediated: Boolean(r.remediated),
  impactPoints: Number(r.impact_points),
  remediationStep: r.remediation_step,
});

const toDbReport = (rep: any) => ({
  id: rep.id,
  title: rep.title,
  period: rep.period,
  generated_at: rep.generatedAt,
  security_score: rep.securityScore,
  total_devices: rep.totalDevices,
  threats_mitigated: rep.threatsMitigated,
  critical_findings: rep.criticalFindings,
  summary: rep.summary,
  format_ready: rep.formatReady,
});

const fromDbReport = (r: any) => ({
  id: r.id,
  title: r.title,
  period: r.period,
  generatedAt: r.generated_at,
  securityScore: Number(r.security_score),
  totalDevices: Number(r.total_devices),
  threatsMitigated: Number(r.threats_mitigated),
  criticalFindings: Number(r.critical_findings),
  summary: r.summary,
  formatReady: r.format_ready ?? ['JSON', 'CSV', 'Markdown'],
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Integration Status Endpoint
  app.get('/api/status', async (_req, res) => {
    const geminiConfigured = Boolean(getGeminiClient());
    if (!supabase) {
      return res.json({
        supabaseConfigured: false,
        supabaseUrl: SUPABASE_URL,
        tablesReady: false,
        hasData: false,
        geminiConfigured,
      });
    }

    try {
      const { count, error } = await supabase
        .from('devices')
        .select('id', { count: 'exact', head: true });

      return res.json({
        supabaseConfigured: true,
        supabaseUrl: SUPABASE_URL,
        tablesReady: !error,
        hasData: !error && (count ?? 0) > 0,
        schemaError: error ? error.message : null,
        geminiConfigured,
      });
    } catch (err: any) {
      return res.json({
        supabaseConfigured: true,
        supabaseUrl: SUPABASE_URL,
        tablesReady: false,
        hasData: false,
        schemaError: err?.message ?? 'Unable to query Supabase',
        geminiConfigured,
      });
    }
  });

  // Supabase Auth Endpoints (falls back cleanly when key is not yet configured)
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!supabase) {
      return res.json({
        mode: 'demo',
        user: { email, fullName: email.split('@')[0] },
      });
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return res.status(401).json({ error: error.message });
      }
      return res.json({
        mode: 'supabase',
        user: {
          id: data.user?.id,
          email: data.user?.email ?? email,
          fullName:
            (data.user?.user_metadata?.full_name as string | undefined) ||
            email.split('@')[0],
        },
        accessToken: data.session?.access_token,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Supabase auth error.' });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, fullName } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!supabase) {
      return res.json({
        mode: 'demo',
        user: { email, fullName: fullName || email.split('@')[0] },
      });
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName || email.split('@')[0] },
        },
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.json({
        mode: 'supabase',
        requiresEmailConfirm: !data.session,
        user: {
          id: data.user?.id,
          email: data.user?.email ?? email,
          fullName: fullName || email.split('@')[0],
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Supabase signup error.' });
    }
  });

  // Load Snapshot from Supabase
  app.get('/api/supabase/snapshot', async (_req, res) => {
    if (!supabase) {
      return res.json({ connected: false, reason: 'Supabase key not configured in Secrets.' });
    }
    try {
      const [devRes, alrtRes, flowRes, scanRes, riskRes, repRes] = await Promise.all([
        supabase.from('devices').select('*'),
        supabase.from('security_alerts').select('*'),
        supabase.from('suspicious_flows').select('*'),
        supabase.from('port_scans').select('*'),
        supabase.from('risk_factors').select('*'),
        supabase.from('security_reports').select('*'),
      ]);

      const firstError =
        devRes.error ||
        alrtRes.error ||
        flowRes.error ||
        scanRes.error ||
        riskRes.error ||
        repRes.error;

      if (firstError) {
        return res.json({
          connected: false,
          tablesReady: false,
          reason: firstError.message,
        });
      }

      return res.json({
        connected: true,
        tablesReady: true,
        empty: (devRes.data?.length ?? 0) === 0,
        devices: (devRes.data ?? []).map(fromDbDevice),
        alerts: (alrtRes.data ?? []).map(fromDbAlert),
        suspiciousFlows: (flowRes.data ?? []).map(fromDbFlow),
        portScans: (scanRes.data ?? []).map(fromDbScan),
        riskFactors: (riskRes.data ?? []).map(fromDbRisk),
        reports: (repRes.data ?? []).map(fromDbReport),
      });
    } catch (err: any) {
      return res.status(500).json({
        connected: false,
        reason: err?.message ?? 'Failed to fetch Supabase snapshot.',
      });
    }
  });

  // Seed initial baseline telemetry into Supabase
  app.post('/api/supabase/seed', async (_req, res) => {
    if (!supabase) {
      return res.status(400).json({
        error: 'Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in Settings > Secrets first.',
      });
    }
    try {
      const ops = await Promise.all([
        supabase.from('devices').upsert(INITIAL_DEVICES.map(toDbDevice)),
        supabase.from('security_alerts').upsert(INITIAL_ALERTS.map(toDbAlert)),
        supabase.from('suspicious_flows').upsert(INITIAL_SUSPICIOUS_FLOWS.map(toDbFlow)),
        supabase.from('port_scans').upsert(INITIAL_PORT_SCANS.map(toDbScan)),
        supabase.from('risk_factors').upsert(INITIAL_RISK_FACTORS.map(toDbRisk)),
        supabase.from('security_reports').upsert(INITIAL_REPORTS.map(toDbReport)),
      ]);
      const err = ops.find((o) => o.error)?.error;
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return res.json({ ok: true, message: 'Baseline telemetry seeded to Supabase.' });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message ?? 'Failed seeding Supabase.' });
    }
  });

  // Supabase Mutations
  app.patch('/api/supabase/devices/:id/trust', async (req, res) => {
    if (!supabase) return res.json({ ok: true, mode: 'demo' });
    const { id } = req.params;
    const { trustStatus, riskScore, vlan, bandwidthUpMbps, bandwidthDownMbps } = req.body;
    const { error } = await supabase
      .from('devices')
      .update({
        trust_status: trustStatus,
        risk_score: riskScore,
        vlan,
        bandwidth_up_mbps: bandwidthUpMbps,
        bandwidth_down_mbps: bandwidthDownMbps,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true, mode: 'supabase' });
  });

  app.patch('/api/supabase/alerts/:id/status', async (req, res) => {
    if (!supabase) return res.json({ ok: true, mode: 'demo' });
    const { id } = req.params;
    const { status } = req.body;
    const { error } = await supabase
      .from('security_alerts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true, mode: 'supabase' });
  });

  app.patch('/api/supabase/flows/:id/mitigate', async (req, res) => {
    if (!supabase) return res.json({ ok: true, mode: 'demo' });
    const { id } = req.params;
    const { mitigated } = req.body;
    const { error } = await supabase
      .from('suspicious_flows')
      .update({ mitigated })
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true, mode: 'supabase' });
  });

  app.patch('/api/supabase/port-scans/:id/block', async (req, res) => {
    if (!supabase) return res.json({ ok: true, mode: 'demo' });
    const { id } = req.params;
    const { blocked } = req.body;
    const { error } = await supabase
      .from('port_scans')
      .update({ blocked })
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true, mode: 'supabase' });
  });

  app.patch('/api/supabase/risk-factors/:id/toggle', async (req, res) => {
    if (!supabase) return res.json({ ok: true, mode: 'demo' });
    const { id } = req.params;
    const { remediated } = req.body;
    const { error } = await supabase
      .from('risk_factors')
      .update({ remediated })
      .eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true, mode: 'supabase' });
  });

  app.post('/api/supabase/reports', async (req, res) => {
    if (!supabase) return res.json({ ok: true, mode: 'demo' });
    const report = req.body;
    const { error } = await supabase.from('security_reports').upsert(toDbReport(report));
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true, mode: 'supabase' });
  });

  app.post('/api/supabase/inject-event', async (req, res) => {
    if (!supabase) return res.json({ ok: true, mode: 'demo' });
    const { device, alert, portScan, flow } = req.body;
    const ops = await Promise.all([
      supabase.from('devices').upsert(toDbDevice(device)),
      supabase.from('security_alerts').upsert(toDbAlert(alert)),
      supabase.from('port_scans').upsert(toDbScan(portScan)),
      supabase.from('suspicious_flows').upsert(toDbFlow(flow)),
    ]);
    const err = ops.find((o) => o.error)?.error;
    if (err) return res.status(400).json({ error: err.message });
    return res.json({ ok: true, mode: 'supabase' });
  });

  // ==========================================================
  // Gemini AI Cybersecurity Analysis Endpoints (Server-Side)
  // ==========================================================

  app.post('/api/ai/threat-analysis', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.',
      });
    }

    try {
      const { devices = [], alerts = [], suspiciousFlows = [], portScans = [], securityScore = 70 } =
        req.body ?? {};

      const compactContext = {
        securityScore,
        flaggedDevices: devices
          .filter((d: any) => d.trustStatus !== 'trusted')
          .map((d: any) => ({
            hostname: d.hostname,
            ip: d.ipAddress,
            vendor: d.vendor,
            trustStatus: d.trustStatus,
            riskScore: d.riskScore,
            openPorts: d.openPorts,
            anomaly: d.anomalySummary,
          })),
        openAlerts: alerts
          .filter((a: any) => a.status === 'open' || a.status === 'investigating')
          .map((a: any) => ({
            title: a.title,
            severity: a.severity,
            category: a.category,
            sourceIp: a.sourceIp,
            device: a.deviceName,
          })),
        activeFlows: suspiciousFlows
          .filter((f: any) => !f.mitigated)
          .map((f: any) => ({
            src: f.sourceDevice,
            dst: `${f.destinationIp}:${f.port}`,
            protocol: f.protocol,
            reason: f.anomalyReason,
          })),
        unblockedScans: portScans
          .filter((s: any) => !s.blocked)
          .map((s: any) => ({
            src: s.sourceDevice,
            type: s.scanType,
            ports: s.portsScanned,
          })),
      };

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Analyze this PhantomX network telemetry snapshot and produce a concise, actionable cybersecurity posture assessment:\n${JSON.stringify(
          compactContext,
        )}`,
        config: {
          systemInstruction:
            'You are PhantomX, a senior network security analyst. Be precise, grounded strictly in the provided telemetry, and concise.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: '2-3 sentence executive synthesis of the current security posture.',
              },
              topPriority: {
                type: Type.STRING,
                description: 'Single most urgent threat or host to address first.',
              },
              attackChain: {
                type: Type.STRING,
                description: 'How observed events correlate into a potential attack sequence.',
              },
              immediateActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 concrete technical containment actions.',
              },
              confidenceScore: {
                type: Type.INTEGER,
                description: 'Analyst confidence percentage 1-100.',
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message ?? 'Failed to execute AI threat analysis.',
      });
    }
  });

  app.post('/api/ai/analyze-alert', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Check Settings > Secrets.',
      });
    }

    try {
      const { alert, device } = req.body ?? {};
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Perform root-cause analysis and remediation planning for this security alert:\nAlert: ${JSON.stringify(
          alert,
        )}\nAssociated Device: ${JSON.stringify(device ?? null)}`,
        config: {
          systemInstruction:
            'You are a network incident responder. Provide specific, practical root-cause analysis and firewall/containment guidance.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rootCause: { type: Type.STRING },
              blastRadius: { type: Type.STRING },
              firewallRuleSuggestion: { type: Type.STRING },
              triageSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message ?? 'Failed to analyze alert with Gemini AI.',
      });
    }
  });

  app.post('/api/ai/analyze-device', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Check Settings > Secrets.',
      });
    }

    try {
      const { device, relatedAlerts = [] } = req.body ?? {};
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Assess behavioural risk for this network endpoint:\nDevice: ${JSON.stringify(
          device,
        )}\nRelated Alerts: ${JSON.stringify(relatedAlerts)}`,
        config: {
          systemInstruction:
            'You are a network security engineer evaluating endpoint risk posture, open ports, and OUI trust.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              postureAssessment: { type: Type.STRING },
              portRiskNotes: { type: Type.STRING },
              recommendation: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message ?? 'Failed to analyze device with Gemini AI.',
      });
    }
  });

  app.post('/api/ai/investigate', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Check Settings > Secrets.',
      });
    }

    try {
      const { question, contextSummary } = req.body ?? {};
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required.' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Network Telemetry Context:\n${JSON.stringify(
          contextSummary,
        )}\n\nAnalyst Question: ${question}`,
        config: {
          systemInstruction:
            'You are PhantomX Threat Analyst. Answer clearly and concisely using only the provided network telemetry context. Include specific hostnames, IPs, ports, and actionable steps where relevant. Keep responses under 180 words.',
        },
      });

      return res.json({ answer: response.text ?? 'No analysis returned.' });
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message ?? 'Failed to run AI investigation query.',
      });
    }
  });

  // Vite Middleware (dev) or Static Dist (prod)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PhantomX server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
