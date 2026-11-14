import React, { useMemo, useState } from 'react';
import { Activity, CheckCircle2, Lock, Radar, Search, ShieldOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DemoNoticeBanner } from '../ui/DemoNoticeBanner';
import { TrafficActivityChart } from '../ui/NetworkCharts';
import { SeverityLabel } from '../ui/SemanticLabels';

export const TrafficPortView: React.FC<{ defaultSubTab?: 'traffic' | 'port-scans' }> = ({
  defaultSubTab = 'traffic',
}) => {
  const {
    activeTab,
    setActiveTab,
    trafficSeries,
    suspiciousFlows,
    portScans,
    toggleFlowMitigation,
    togglePortScanBlock,
  } = useApp();

  const currentMode: 'traffic' | 'port-scans' =
    activeTab === 'port-scans' ? 'port-scans' : activeTab === 'traffic' ? 'traffic' : defaultSubTab;

  const [flowQuery, setFlowQuery] = useState('');
  const [flowFilter, setFlowFilter] = useState<'all' | 'active' | 'mitigated'>('all');

  const filteredFlows = useMemo(() => {
    const q = flowQuery.trim().toLowerCase();
    return suspiciousFlows.filter((f) => {
      if (flowFilter === 'active' && f.mitigated) return false;
      if (flowFilter === 'mitigated' && !f.mitigated) return false;
      if (!q) return true;
      return (
        f.sourceDevice.toLowerCase().includes(q) ||
        f.sourceIp.toLowerCase().includes(q) ||
        f.destinationIp.toLowerCase().includes(q) ||
        f.protocol.toLowerCase().includes(q) ||
        f.anomalyReason.toLowerCase().includes(q)
      );
    });
  }, [suspiciousFlows, flowFilter, flowQuery]);

  return (
    <div className="space-y-6">
      <DemoNoticeBanner compact />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--np-text-primary)]">
            {currentMode === 'traffic'
              ? 'Suspicious Traffic Analysis'
              : 'Port Scan Detection'}
          </h1>
          <p className="text-sm text-[var(--np-text-secondary)] mt-1">
            {currentMode === 'traffic'
              ? 'Inspect anomalous outbound flows, beacon intervals, and DNS tunneling signatures.'
              : 'Review detected TCP SYN sweeps, UDP probes, and internal subnet enumeration events.'}
          </p>
        </div>

        {/* Mode Switch */}
        <div className="inline-flex p-1 rounded-xl bg-[var(--np-surface)] border border-[var(--np-border)] self-start">
          <button
            type="button"
            onClick={() => setActiveTab('traffic')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              currentMode === 'traffic'
                ? 'bg-sky-500 text-slate-950'
                : 'text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Suspicious Flows</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('port-scans')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              currentMode === 'port-scans'
                ? 'bg-sky-500 text-slate-950'
                : 'text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)]'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Port Scans ({portScans.length})</span>
          </button>
        </div>
      </div>

      {currentMode === 'traffic' ? (
        <>
          <section className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[var(--np-text-primary)] mb-1">
              Traffic Flow Anomaly Window
            </h2>
            <p className="text-xs text-[var(--np-text-muted)] mb-4">
              Spike in anomalous egress observed between 09:00 and 11:00
            </p>
            <TrafficActivityChart data={trafficSeries} height={200} />
          </section>

          <section className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-[var(--np-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[var(--np-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={flowQuery}
                  onChange={(e) => setFlowQuery(e.target.value)}
                  placeholder="Filter by source, destination IP, protocol..."
                  aria-label="Filter suspicious flows"
                  className="w-full min-h-[42px] pl-10 pr-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] placeholder:text-[var(--np-text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(['all', 'active', 'mitigated'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlowFilter(f)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      flowFilter === f
                        ? 'bg-sky-500 text-slate-950'
                        : 'bg-[var(--np-surface-elevated)] text-[var(--np-text-secondary)]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-[var(--np-border-subtle)]">
              {filteredFlows.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--np-text-secondary)]">
                  No suspicious traffic flows match your current filters.
                </div>
              ) : (
                filteredFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className="p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <SeverityLabel severity={flow.riskLevel} />
                        <span className="text-[var(--np-text-muted)]">·</span>
                        <span className="font-mono font-semibold text-[var(--np-text-primary)]">
                          {flow.protocol} / Port {flow.port}
                        </span>
                        <span className="text-[var(--np-text-muted)]">·</span>
                        <span className="font-mono tabular-nums text-[var(--np-text-muted)]">
                          {flow.timestamp}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[var(--np-text-primary)]">
                        {flow.sourceDevice}{' '}
                        <span className="font-mono text-xs text-[var(--np-text-secondary)]">
                          ({flow.sourceIp}) → {flow.destinationIp}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--np-text-secondary)]">
                        {flow.anomalyReason} · {flow.destinationGeo}
                      </p>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
                      <div className="text-left lg:text-right font-mono tabular-nums text-xs">
                        <p className="font-semibold text-[var(--np-text-primary)]">
                          {flow.bytesTransferredMB} MB
                        </p>
                        <p className="text-[var(--np-text-muted)]">{flow.durationSec}s session</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFlowMitigation(flow.id)}
                        className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                          flow.mitigated
                            ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25'
                        }`}
                      >
                        {flow.mitigated ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mitigated</span>
                          </>
                        ) : (
                          <>
                            <ShieldOff className="w-3.5 h-3.5" />
                            <span>Block Flow</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : (
        /* Port Scan Detection View */
        <section className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl divide-y divide-[var(--np-border-subtle)] overflow-hidden">
          {portScans.map((scan) => (
            <div
              key={scan.id}
              className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <SeverityLabel severity={scan.severity} />
                  <span className="text-[var(--np-text-muted)]">·</span>
                  <span className="font-semibold text-[var(--np-text-primary)]">
                    {scan.scanType}
                  </span>
                  <span className="text-[var(--np-text-muted)]">·</span>
                  <span className="font-mono tabular-nums text-[var(--np-text-muted)]">
                    {scan.timestamp}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[var(--np-text-primary)]">
                  Source: {scan.sourceDevice}{' '}
                  <span className="font-mono text-xs font-normal text-[var(--np-text-secondary)]">
                    ({scan.sourceIp}) → {scan.targetRange}
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--np-text-secondary)]">
                  <span>
                    Ports probed:{' '}
                    <span className="font-mono tabular-nums text-[var(--np-text-primary)]">
                      {scan.portsScanned.join(', ')}
                    </span>
                  </span>
                  <span className="font-mono tabular-nums">
                    {scan.totalProbes} probes in {(scan.durationMs / 1000).toFixed(2)}s
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => togglePortScanBlock(scan.id)}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                    scan.blocked
                      ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
                      : 'bg-rose-500/15 text-rose-500 hover:bg-rose-500/25'
                  }`}
                >
                  {scan.blocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Source Blocked</span>
                    </>
                  ) : (
                    <>
                      <ShieldOff className="w-3.5 h-3.5" />
                      <span>Block Scanner</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
