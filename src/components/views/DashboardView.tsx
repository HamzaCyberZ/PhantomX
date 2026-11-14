import React from 'react';
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  ChevronRight,
  Radar,
  Server,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SecurityScoreArc, TrafficActivityChart } from '../ui/NetworkCharts';
import {
  AlertStatusLabel,
  DeviceTrustLabel,
  SeverityLabel,
} from '../ui/SemanticLabels';

export const DashboardView: React.FC = () => {
  const {
    devices,
    alerts,
    trafficSeries,
    protocolDistribution,
    suspiciousFlows,
    portScans,
    securityScore,
    lastScanTimestamp,
    profile,
    setActiveTab,
    setSelectedAlert,
    setSelectedDevice,
    runAiThreatAnalysis,
    isRunningAiAnalysis,
    aiThreatBriefing,
  } = useApp();

  const unknownDevices = devices.filter((d) => d.trustStatus === 'unknown');
  const suspiciousDevices = devices.filter((d) => d.trustStatus === 'suspicious');
  const criticalThreats = alerts.filter(
    (a) => a.severity === 'critical' && (a.status === 'open' || a.status === 'investigating'),
  );
  const suspiciousActivityCount =
    suspiciousFlows.filter((f) => !f.mitigated).length +
    portScans.filter((p) => !p.blocked).length;

  const totalInboundMbps = devices.reduce((sum, d) => sum + d.bandwidthDownMbps, 0);
  const totalOutboundMbps = devices.reduce((sum, d) => sum + d.bandwidthUpMbps, 0);

  const recentAlerts = alerts.slice(0, 4);
  const flaggedDevices = devices
    .filter((d) => d.trustStatus !== 'trusted')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Friendly Welcome & Quick Guidance Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[var(--np-accent)]">
            {profile.networkName} · {profile.subnetCidr}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--np-text-primary)] mt-0.5">
            Welcome back, {profile.fullName.split(' ')[0]}
          </h1>
          <p className="text-sm text-[var(--np-text-secondary)] mt-1">
            {criticalThreats.length > 0
              ? `${criticalThreats.length} critical alert${criticalThreats.length > 1 ? 's' : ''} and ${unknownDevices.length} unrecognized endpoint${unknownDevices.length === 1 ? '' : 's'} need your review.`
              : 'Your network perimeter is steady with zero unresolved critical alerts.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('unknown-devices')}
            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[var(--np-border)] bg-[var(--np-surface)] hover:bg-[var(--np-surface-elevated)] text-xs font-semibold text-[var(--np-text-primary)] transition-colors whitespace-nowrap cursor-pointer"
          >
            Review Unknown ({unknownDevices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk-assessment')}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Harden Posture</span>
          </button>
        </div>
      </div>

      {/* Hero Row: Security Score + 4 KPI Tiles + AI Security Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Security Score Card */}
        <section className="lg:col-span-4 px-hero-surface border border-[var(--np-border)] rounded-2xl p-6 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--np-text-primary)]">
                Network Security Score
              </h2>
              <p className="text-xs text-[var(--np-text-muted)] mt-0.5 font-mono">
                Last scan · {lastScanTimestamp}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('risk-assessment')}
              className="text-xs font-medium text-[var(--np-accent)] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Improve</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-2">
            <SecurityScoreArc score={securityScore} />
          </div>

          <div className="pt-3 border-t border-[var(--np-border-subtle)] flex items-center justify-between text-xs text-[var(--np-text-secondary)]">
            <span>Posture Baseline · 100 max</span>
            <span className="font-mono tabular-nums text-[var(--np-text-primary)]">
              {unknownDevices.length + suspiciousDevices.length} nodes flagged
            </span>
          </div>
        </section>

        {/* Right 8 cols: 4 KPIs + AI Security Summary */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* 4-column Interactive KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('devices')}
              className="group bg-[var(--np-surface)] border border-[var(--np-border)] hover:border-sky-500/50 hover:-translate-y-0.5 rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[var(--np-text-muted)]">
                <span className="text-xs font-medium">Connected Devices</span>
                <Server className="w-4 h-4 text-[var(--np-accent)] transition-transform group-hover:scale-110" />
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-[var(--np-text-primary)] mt-2">
                {devices.length}
              </p>
              <p className="text-[11px] text-[var(--np-text-secondary)] mt-1">
                {devices.filter((d) => d.trustStatus === 'trusted').length} verified trusted
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('unknown-devices')}
              className="group bg-[var(--np-surface)] border border-[var(--np-border)] hover:border-amber-500/50 hover:-translate-y-0.5 rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[var(--np-text-muted)]">
                <span className="text-xs font-medium">Unknown Devices</span>
                <ShieldQuestion className="w-4 h-4 text-amber-500 transition-transform group-hover:scale-110" />
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-[var(--np-text-primary)] mt-2">
                {unknownDevices.length}
              </p>
              <p className="text-[11px] text-amber-500 font-medium mt-1">
                {unknownDevices.length > 0 ? 'Requires verification' : 'All nodes verified'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('traffic')}
              className="group bg-[var(--np-surface)] border border-[var(--np-border)] hover:border-sky-500/50 hover:-translate-y-0.5 rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[var(--np-text-muted)]">
                <span className="text-xs font-medium">Suspicious Activity</span>
                <Activity className="w-4 h-4 text-sky-400 transition-transform group-hover:scale-110" />
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-[var(--np-text-primary)] mt-2">
                {suspiciousActivityCount}
              </p>
              <p className="text-[11px] text-[var(--np-text-secondary)] mt-1">
                Flows &amp; port probes
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className="group bg-[var(--np-surface)] border border-[var(--np-border)] hover:border-rose-500/50 hover:-translate-y-0.5 rounded-2xl p-4 text-left transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[var(--np-text-muted)]">
                <span className="text-xs font-medium">Critical Threats</span>
                <ShieldAlert className="w-4 h-4 text-rose-500 transition-transform group-hover:scale-110" />
              </div>
              <p className="text-2xl font-bold font-display tabular-nums text-[var(--np-text-primary)] mt-2">
                {criticalThreats.length}
              </p>
              <p className="text-[11px] text-rose-500 font-medium mt-1">
                {criticalThreats.length > 0 ? 'Active priority' : 'None open'}
              </p>
            </button>
          </div>

          {/* AI Security Summary */}
          <section className="flex-1 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--np-accent-soft)] flex items-center justify-center text-[var(--np-accent)]">
                  <BrainCircuit className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--np-text-primary)]">
                    PhantomX AI Security Briefing
                  </h2>
                  <p className="text-[11px] text-[var(--np-text-muted)]">
                    {aiThreatBriefing
                      ? `Updated ${aiThreatBriefing.generatedAt} · Confidence ${aiThreatBriefing.confidenceScore}%`
                      : 'Click Run AI Analysis for real-time telemetry synthesis'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runAiThreatAnalysis}
                  disabled={isRunningAiAnalysis}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[var(--np-border)] text-xs font-medium text-[var(--np-text-primary)] hover:bg-[var(--np-surface-elevated)] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isRunningAiAnalysis ? 'Analyzing...' : 'Run AI Analysis'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('threat-intel')}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[var(--np-accent-soft)] text-xs font-semibold text-[var(--np-accent)] hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  Open Threat AI
                </button>
              </div>
            </div>

            {aiThreatBriefing ? (
              <div className="space-y-2 text-sm leading-relaxed text-[var(--np-text-secondary)]">
                <p>{aiThreatBriefing.executiveSummary}</p>
                <p className="text-xs text-[var(--np-text-primary)]">
                  <strong>Priority Target:</strong> {aiThreatBriefing.topPriority}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--np-text-secondary)]">
                {criticalThreats.length > 0 ? (
                  <>
                    Current telemetry highlights{' '}
                    <strong className="text-[var(--np-text-primary)]">
                      {criticalThreats.length} critical finding{criticalThreats.length > 1 ? 's' : ''}
                    </strong>{' '}
                    centering on lateral TCP SYN sweeps from{' '}
                    <span className="font-mono text-xs text-[var(--np-text-primary)]">
                      ws-build-runner
                    </span>{' '}
                    and outbound TLS beacons from{' '}
                    <span className="font-mono text-xs text-[var(--np-text-primary)]">
                      {unknownDevices[0]?.hostname ?? 'unrecognized endpoints'}
                    </span>
                    . Run AI Analysis to generate correlated attack-chain reasoning and immediate firewall rules.
                  </>
                ) : (
                  <>
                    All critical alerts have been triaged. Continue monitoring{' '}
                    <span className="font-mono text-xs text-[var(--np-text-primary)]">
                      VLAN 10 &amp; VLAN 20
                    </span>{' '}
                    for newly joining unknown hardware or off-hours bandwidth spikes.
                  </>
                )}
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Network Activity Charts + Traffic Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <section className="lg:col-span-8 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
                Network Activity &amp; Anomaly Timeline
              </h2>
              <p className="text-xs text-[var(--np-text-muted)] mt-0.5">
                24-hour throughput telemetry (Inbound · Outbound · Anomalous Mbps)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('traffic')}
              className="text-xs font-medium text-[var(--np-accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Flows</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <TrafficActivityChart data={trafficSeries} />
        </section>

        {/* Network Traffic Statistics */}
        <section className="lg:col-span-4 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div>
            <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
              Network Traffic Statistics
            </h2>
            <p className="text-xs text-[var(--np-text-muted)] mt-0.5">
              Aggregate throughput &amp; protocol breakdown
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--np-border-subtle)]">
              <div>
                <p className="text-xs text-[var(--np-text-muted)]">Inbound</p>
                <p className="text-lg font-bold font-mono tabular-nums text-[var(--np-text-primary)] mt-0.5">
                  {totalInboundMbps.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-[var(--np-text-muted)]">Mbps</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--np-text-muted)]">Outbound</p>
                <p className="text-lg font-bold font-mono tabular-nums text-[var(--np-text-primary)] mt-0.5">
                  {totalOutboundMbps.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-[var(--np-text-muted)]">Mbps</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[var(--np-border-subtle)]">
            {protocolDistribution.map((item) => (
              <div key={item.protocol} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--np-text-secondary)]">{item.protocol}</span>
                  <span className="font-mono tabular-nums text-[var(--np-text-primary)]">
                    {item.percentage}% · {item.volumeGB} GB
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-500/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Split: Recent Security Alerts + Flagged & Unknown Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-7 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--np-border-subtle)] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
                Recent Security Alerts
              </h2>
              <p className="text-xs text-[var(--np-text-muted)]">
                Tap any incident to inspect AI root-cause &amp; triage actions
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('alerts')}
              className="text-xs font-medium text-[var(--np-accent)] hover:underline inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <span>All Alerts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[var(--np-border-subtle)]">
            {recentAlerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => setSelectedAlert(alert)}
                className="w-full px-5 py-4 text-left hover:bg-[var(--np-surface-elevated)]/60 transition-colors flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <SeverityLabel severity={alert.severity} />
                    <span className="text-[var(--np-text-muted)]">·</span>
                    <span className="text-[var(--np-text-secondary)]">{alert.category}</span>
                    <span className="text-[var(--np-text-muted)]">·</span>
                    <span className="font-mono tabular-nums text-[var(--np-text-muted)]">
                      {alert.timestamp.slice(11)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--np-text-primary)] truncate">
                    {alert.title}
                  </p>
                  <p className="text-xs text-[var(--np-text-secondary)] line-clamp-1">
                    {alert.deviceName} ({alert.sourceIp})
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <AlertStatusLabel status={alert.status} />
                  <ChevronRight className="w-4 h-4 text-[var(--np-text-muted)]" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--np-border-subtle)] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
                Flagged &amp; Unknown Nodes
              </h2>
              <p className="text-xs text-[var(--np-text-muted)]">
                Endpoints needing trust verification
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('port-scans')}
              className="text-xs font-medium text-[var(--np-accent)] hover:underline inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Port Scans ({portScans.length})</span>
            </button>
          </div>

          <div className="divide-y divide-[var(--np-border-subtle)] flex-1">
            {flaggedDevices.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--np-text-secondary)]">
                All discovered devices are currently verified as Trusted.
              </div>
            ) : (
              flaggedDevices.map((device) => (
                <button
                  key={device.id}
                  type="button"
                  onClick={() => setSelectedDevice(device)}
                  className="w-full px-5 py-3.5 text-left hover:bg-[var(--np-surface-elevated)] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-[var(--np-text-primary)] truncate">
                      {device.hostname}
                    </p>
                    <p className="text-xs font-mono tabular-nums text-[var(--np-text-secondary)] truncate">
                      {device.ipAddress} · {device.vendor}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <DeviceTrustLabel status={device.trustStatus} />
                    <ChevronRight className="w-4 h-4 text-[var(--np-text-muted)]" />
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
