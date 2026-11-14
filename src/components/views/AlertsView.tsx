import React, { useMemo, useState } from 'react';
import { BellRing, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AlertSeverity, AlertStatus } from '../../types/network';
import { DemoNoticeBanner } from '../ui/DemoNoticeBanner';
import { AlertStatusLabel, SeverityLabel } from '../ui/SemanticLabels';

export const AlertsView: React.FC = () => {
  const { alerts, updateAlertStatus, setSelectedAlert, pushToast } = useApp();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all');

  const filteredAlerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter((a) => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.sourceIp.toLowerCase().includes(q) ||
        a.deviceName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });
  }, [alerts, severityFilter, statusFilter, search]);

  const openCount = alerts.filter((a) => a.status === 'open').length;

  const resolveLowAndMedium = () => {
    let changed = 0;
    alerts.forEach((a) => {
      if (
        (a.severity === 'low' || a.severity === 'medium') &&
        (a.status === 'open' || a.status === 'investigating')
      ) {
        updateAlertStatus(a.id, 'resolved');
        changed += 1;
      }
    });
    if (changed === 0) {
      pushToast('No open Low or Medium alerts to resolve.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <DemoNoticeBanner compact />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--np-text-primary)]">
            Security Alerts Management
          </h1>
          <p className="text-sm text-[var(--np-text-secondary)] mt-1">
            Triage, investigate, and resolve network behaviour anomalies across all monitored VLANs.
          </p>
        </div>

        <button
          type="button"
          onClick={resolveLowAndMedium}
          className="min-h-[42px] px-4 py-2 rounded-xl border border-[var(--np-border)] bg-[var(--np-surface)] hover:bg-[var(--np-surface-elevated)] text-xs font-semibold text-[var(--np-text-primary)] inline-flex items-center gap-2 whitespace-nowrap self-start cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Resolve Low/Medium</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--np-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts by title, IP, device, or tactic..."
              aria-label="Search security alerts"
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] placeholder:text-[var(--np-text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | AlertStatus)}
            aria-label="Filter by alert status"
            className="min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          >
            <option value="all">All Statuses ({alerts.length})</option>
            <option value="open">Open ({openCount})</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                severityFilter === sev
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-[var(--np-surface-elevated)] text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)]'
              }`}
            >
              {sev === 'all' ? 'All Severities' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-10 text-center space-y-3">
          <BellRing className="w-8 h-8 text-[var(--np-accent)] mx-auto" />
          <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
            No Alerts Match Current Filters
          </h2>
          <p className="text-xs text-[var(--np-text-secondary)]">
            Clear your search or select All Severities to inspect every recorded incident.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSeverityFilter('all');
              setStatusFilter('all');
            }}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-primary)] cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl divide-y divide-[var(--np-border-subtle)] overflow-hidden">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 sm:px-6 sm:py-5 hover:bg-[var(--np-surface-elevated)]/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <button
                type="button"
                onClick={() => setSelectedAlert(alert)}
                className="flex-1 min-w-0 text-left space-y-1.5 cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <SeverityLabel severity={alert.severity} />
                  <span className="text-[var(--np-text-muted)]">·</span>
                  <AlertStatusLabel status={alert.status} />
                  <span className="text-[var(--np-text-muted)]">·</span>
                  <span className="text-[var(--np-text-secondary)]">{alert.category}</span>
                  <span className="text-[var(--np-text-muted)]">·</span>
                  <span className="font-mono tabular-nums text-[var(--np-text-muted)]">
                    {alert.timestamp}
                  </span>
                </div>

                <h2 className="text-sm sm:text-base font-semibold text-[var(--np-text-primary)]">
                  {alert.title}
                </h2>
                <p className="text-xs text-[var(--np-text-secondary)] leading-relaxed">
                  {alert.summary}
                </p>
                <p className="text-xs font-mono tabular-nums text-[var(--np-text-muted)]">
                  Source: {alert.deviceName} ({alert.sourceIp}) · Confidence {alert.confidence}%
                </p>
              </button>

              <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--np-border-subtle)]">
                {alert.status !== 'investigating' && alert.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => updateAlertStatus(alert.id, 'investigating')}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Investigate
                  </button>
                )}
                {alert.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => updateAlertStatus(alert.id, 'resolved')}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Resolve
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedAlert(alert)}
                  aria-label="Inspect alert details"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[var(--np-text-muted)] hover:text-[var(--np-text-primary)] hover:bg-[var(--np-surface-elevated)] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
