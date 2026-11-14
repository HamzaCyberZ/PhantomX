import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { networkService } from '../../services/networkService';
import { AiAlertAnalysis, AiDeviceAudit } from '../../types/network';
import { DetailSheet } from './DetailSheet';
import { MiniSparkline } from './NetworkCharts';
import {
  AlertStatusLabel,
  DeviceTrustLabel,
  SeverityLabel,
} from './SemanticLabels';

export const GlobalInspectors: React.FC = () => {
  const {
    selectedDevice,
    setSelectedDevice,
    updateDeviceTrust,
    selectedAlert,
    setSelectedAlert,
    updateAlertStatus,
    devices,
    alerts,
    setActiveTab,
    pushToast,
  } = useApp();

  const [deviceAudit, setDeviceAudit] = useState<AiDeviceAudit | null>(null);
  const [loadingDeviceAudit, setLoadingDeviceAudit] = useState(false);

  const [alertAi, setAlertAi] = useState<AiAlertAnalysis | null>(null);
  const [loadingAlertAi, setLoadingAlertAi] = useState(false);

  useEffect(() => {
    setDeviceAudit(null);
  }, [selectedDevice?.id]);

  useEffect(() => {
    setAlertAi(null);
  }, [selectedAlert?.id]);

  const handleAnalyzeDevice = async () => {
    if (!selectedDevice || loadingDeviceAudit) return;
    setLoadingDeviceAudit(true);
    try {
      const related = alerts.filter((a) => a.deviceId === selectedDevice.id);
      const res = await networkService.analyzeDeviceWithAi(selectedDevice, related);
      setDeviceAudit(res);
    } catch (err: any) {
      pushToast(err?.message || 'Unable to run AI device audit.', 'warning');
    } finally {
      setLoadingDeviceAudit(false);
    }
  };

  const handleAnalyzeAlert = async () => {
    if (!selectedAlert || loadingAlertAi) return;
    setLoadingAlertAi(true);
    try {
      const dev = devices.find((d) => d.id === selectedAlert.deviceId);
      const res = await networkService.analyzeAlertWithAi(selectedAlert, dev);
      setAlertAi(res);
    } catch (err: any) {
      pushToast(err?.message || 'Unable to run AI root-cause analysis.', 'warning');
    } finally {
      setLoadingAlertAi(false);
    }
  };

  return (
    <>
      {/* Device Inspector Drawer / Sheet */}
      <DetailSheet
        open={Boolean(selectedDevice)}
        onClose={() => setSelectedDevice(null)}
        title={selectedDevice?.hostname ?? ''}
        subtitle={
          selectedDevice
            ? `${selectedDevice.ipAddress} · ${selectedDevice.macAddress}`
            : undefined
        }
        footer={
          selectedDevice && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateDeviceTrust(selectedDevice.id, 'trusted')}
                disabled={selectedDevice.trustStatus === 'trusted'}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Trust Device
              </button>
              <button
                type="button"
                onClick={() => updateDeviceTrust(selectedDevice.id, 'suspicious')}
                disabled={selectedDevice.trustStatus === 'suspicious'}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Flag Risk
              </button>
              <button
                type="button"
                onClick={() => updateDeviceTrust(selectedDevice.id, 'quarantined')}
                disabled={selectedDevice.trustStatus === 'quarantined'}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Quarantine
              </button>
            </div>
          )
        }
      >
        {selectedDevice && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--np-border-subtle)]">
              <DeviceTrustLabel status={selectedDevice.trustStatus} />
              <span className="text-xs font-mono tabular-nums text-[var(--np-text-secondary)]">
                Risk Score: <strong className="text-[var(--np-text-primary)]">{selectedDevice.riskScore}/100</strong>
              </span>
            </div>

            {selectedDevice.anomalySummary && (
              <div className="p-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Behavioural Observation</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--np-text-secondary)]">
                  {selectedDevice.anomalySummary}
                </p>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
              <div>
                <dt className="text-[var(--np-text-muted)]">Vendor (OUI)</dt>
                <dd className="text-[var(--np-text-primary)] font-medium mt-0.5">
                  {selectedDevice.vendor}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--np-text-muted)]">Device Category</dt>
                <dd className="text-[var(--np-text-primary)] font-medium mt-0.5">
                  {selectedDevice.category}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--np-text-muted)]">OS Fingerprint</dt>
                <dd className="text-[var(--np-text-primary)] font-medium mt-0.5">
                  {selectedDevice.osGuess} ({selectedDevice.fingerprintConfidence}%)
                </dd>
              </div>
              <div>
                <dt className="text-[var(--np-text-muted)]">Network Segment</dt>
                <dd className="text-[var(--np-text-primary)] font-medium mt-0.5">
                  {selectedDevice.vlan}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--np-text-muted)]">First Seen</dt>
                <dd className="text-[var(--np-text-primary)] font-mono tabular-nums mt-0.5">
                  {selectedDevice.firstSeen}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--np-text-muted)]">Last Seen</dt>
                <dd className="text-[var(--np-text-primary)] font-mono tabular-nums mt-0.5">
                  {selectedDevice.lastSeen}
                </dd>
              </div>
            </dl>

            <div className="pt-4 border-t border-[var(--np-border-subtle)] flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--np-text-muted)]">24h Throughput Rhythm</p>
                <p className="text-sm font-mono tabular-nums text-[var(--np-text-primary)] mt-0.5">
                  ↑ {selectedDevice.bandwidthUpMbps} Mbps · ↓ {selectedDevice.bandwidthDownMbps} Mbps
                </p>
              </div>
              <MiniSparkline
                values={selectedDevice.trafficSeries24h}
                tone={
                  selectedDevice.riskScore >= 70
                    ? 'danger'
                    : selectedDevice.riskScore >= 40
                      ? 'warning'
                      : 'accent'
                }
              />
            </div>

            <div className="pt-4 border-t border-[var(--np-border-subtle)]">
              <div className="flex items-center gap-2 text-xs text-[var(--np-text-muted)] mb-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>Detected Open Ports</span>
              </div>
              {selectedDevice.openPorts.length === 0 ? (
                <p className="text-xs text-[var(--np-text-secondary)]">
                  No listening TCP/UDP service ports observed.
                </p>
              ) : (
                <p className="text-xs font-mono tabular-nums text-[var(--np-text-primary)]">
                  {selectedDevice.openPorts.join(' · ')}
                </p>
              )}
            </div>

            {/* Live Gemini AI Endpoint Audit */}
            <div className="pt-4 border-t border-[var(--np-border-subtle)] space-y-3">
              <button
                type="button"
                onClick={handleAnalyzeDevice}
                disabled={loadingDeviceAudit}
                className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[var(--np-accent-soft)] text-[var(--np-accent)] hover:opacity-90 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-opacity cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {loadingDeviceAudit
                    ? 'Running Gemini AI Endpoint Audit...'
                    : 'Run AI Endpoint Risk Audit'}
                </span>
              </button>

              {deviceAudit && (
                <div className="p-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] space-y-2.5 text-xs">
                  <p className="font-semibold text-[var(--np-text-primary)]">
                    AI Posture Assessment
                  </p>
                  <p className="text-[var(--np-text-secondary)] leading-relaxed">
                    {deviceAudit.postureAssessment}
                  </p>
                  <p className="font-semibold text-[var(--np-text-primary)] pt-1">
                    Port &amp; Exposure Analysis
                  </p>
                  <p className="text-[var(--np-text-secondary)] leading-relaxed">
                    {deviceAudit.portRiskNotes}
                  </p>
                  <p className="font-semibold text-emerald-500 pt-1">
                    Recommended Control: {deviceAudit.recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </DetailSheet>

      {/* Alert Inspector Drawer / Sheet */}
      <DetailSheet
        open={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.title ?? ''}
        subtitle={
          selectedAlert
            ? `${selectedAlert.category} · ${selectedAlert.timestamp}`
            : undefined
        }
        footer={
          selectedAlert && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateAlertStatus(selectedAlert.id, 'investigating')}
                disabled={selectedAlert.status === 'investigating'}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Investigate
              </button>
              <button
                type="button"
                onClick={() => updateAlertStatus(selectedAlert.id, 'resolved')}
                disabled={selectedAlert.status === 'resolved'}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Resolve
              </button>
              <button
                type="button"
                onClick={() => updateAlertStatus(selectedAlert.id, 'dismissed')}
                disabled={selectedAlert.status === 'dismissed'}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-500/15 text-[var(--np-text-secondary)] hover:bg-slate-500/25 disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )
        }
      >
        {selectedAlert && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--np-border-subtle)]">
              <SeverityLabel severity={selectedAlert.severity} />
              <AlertStatusLabel status={selectedAlert.status} />
            </div>

            <p className="text-sm text-[var(--np-text-primary)] leading-relaxed">
              {selectedAlert.summary}
            </p>

            <dl className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <dt className="text-[var(--np-text-muted)]">Source Endpoint</dt>
                <dd className="text-[var(--np-text-primary)] font-medium mt-0.5">
                  {selectedAlert.deviceName}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--np-text-muted)]">Source IP</dt>
                <dd className="text-[var(--np-text-primary)] font-mono tabular-nums mt-0.5">
                  {selectedAlert.sourceIp}
                </dd>
              </div>
              {selectedAlert.destinationIp && (
                <div>
                  <dt className="text-[var(--np-text-muted)]">Target</dt>
                  <dd className="text-[var(--np-text-primary)] font-mono tabular-nums mt-0.5">
                    {selectedAlert.destinationIp}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-[var(--np-text-muted)]">Confidence</dt>
                <dd className="text-[var(--np-text-primary)] font-mono tabular-nums mt-0.5">
                  {selectedAlert.confidence}%
                </dd>
              </div>
            </dl>

            <div className="p-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--np-accent)]">
                <Cpu className="w-4 h-4" />
                <span>Baseline Heuristic Explanation</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--np-text-secondary)]">
                {selectedAlert.aiExplanation}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recommended Remediation</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--np-text-secondary)]">
                {selectedAlert.recommendedAction}
              </p>
            </div>

            {/* Live Gemini AI Root-Cause Deep Dive */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAnalyzeAlert}
                disabled={loadingAlertAi}
                className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[var(--np-accent-soft)] text-[var(--np-accent)] hover:opacity-90 text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {loadingAlertAi
                    ? 'Generating Gemini AI Root-Cause...'
                    : 'Generate Live AI Root-Cause & Rule'}
                </span>
              </button>

              {alertAi && (
                <div className="p-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] space-y-2.5 text-xs">
                  <p className="font-semibold text-[var(--np-text-primary)]">
                    AI Root-Cause Analysis
                  </p>
                  <p className="text-[var(--np-text-secondary)] leading-relaxed">
                    {alertAi.rootCause}
                  </p>
                  <p className="font-semibold text-[var(--np-text-primary)] pt-1">
                    Potential Blast Radius
                  </p>
                  <p className="text-[var(--np-text-secondary)] leading-relaxed">
                    {alertAi.blastRadius}
                  </p>
                  <p className="font-semibold text-[var(--np-text-primary)] pt-1">
                    Suggested Firewall / ACL Rule
                  </p>
                  <pre className="p-2.5 rounded-lg bg-[var(--np-canvas)] border border-[var(--np-border-subtle)] font-mono text-[11px] text-[var(--np-accent)] whitespace-pre-wrap">
                    {alertAi.firewallRuleSuggestion}
                  </pre>
                  <ul className="space-y-1 pt-1 list-disc list-inside text-[var(--np-text-secondary)]">
                    {alertAi.triageSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {selectedAlert.deviceId && (
              <button
                type="button"
                onClick={() => {
                  const found = devices.find((d) => d.id === selectedAlert.deviceId);
                  if (found) {
                    setSelectedAlert(null);
                    setSelectedDevice(found);
                  } else {
                    setSelectedAlert(null);
                    setActiveTab('devices');
                  }
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-primary)] hover:bg-[var(--np-surface-elevated)] flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[var(--np-accent)]" />
                <span>Inspect Associated Device Profile</span>
              </button>
            )}

            {selectedAlert.detectedPorts && selectedAlert.detectedPorts.length > 0 && (
              <div className="pt-2 text-xs text-[var(--np-text-muted)] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Ports observed:</span>
                <span className="font-mono tabular-nums text-[var(--np-text-primary)]">
                  {selectedAlert.detectedPorts.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}
      </DetailSheet>
    </>
  );
};
