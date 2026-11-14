import React, { useMemo, useState } from 'react';
import {
  ChevronRight,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeviceTrustStatus } from '../../types/network';
import { DemoNoticeBanner } from '../ui/DemoNoticeBanner';
import { MiniSparkline } from '../ui/NetworkCharts';
import { DeviceTrustLabel } from '../ui/SemanticLabels';

export const DevicesView: React.FC<{ initialFilter?: 'all' | 'unknown' }> = ({
  initialFilter = 'all',
}) => {
  const {
    devices,
    setSelectedDevice,
    updateDeviceTrust,
    activeTab,
  } = useApp();

  const effectiveDefault: 'all' | DeviceTrustStatus =
    activeTab === 'unknown-devices' || initialFilter === 'unknown' ? 'unknown' : 'all';

  const [statusFilter, setStatusFilter] = useState<'all' | DeviceTrustStatus>(effectiveDefault);
  const [vlanFilter, setVlanFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Keep filter synced when switching between Devices and Unknown Devices sidebar items
  React.useEffect(() => {
    setStatusFilter(activeTab === 'unknown-devices' ? 'unknown' : 'all');
  }, [activeTab]);

  const vlans = useMemo(
    () => ['all', ...Array.from(new Set(devices.map((d) => d.vlan)))],
    [devices],
  );

  const filteredDevices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devices.filter((d) => {
      if (statusFilter !== 'all' && d.trustStatus !== statusFilter) return false;
      if (vlanFilter !== 'all' && d.vlan !== vlanFilter) return false;
      if (!q) return true;
      return (
        d.hostname.toLowerCase().includes(q) ||
        d.ipAddress.toLowerCase().includes(q) ||
        d.macAddress.toLowerCase().includes(q) ||
        d.vendor.toLowerCase().includes(q)
      );
    });
  }, [devices, statusFilter, vlanFilter, search]);

  const counts = useMemo(
    () => ({
      all: devices.length,
      trusted: devices.filter((d) => d.trustStatus === 'trusted').length,
      unknown: devices.filter((d) => d.trustStatus === 'unknown').length,
      suspicious: devices.filter((d) => d.trustStatus === 'suspicious').length,
      quarantined: devices.filter((d) => d.trustStatus === 'quarantined').length,
    }),
    [devices],
  );

  const isUnknownMode = activeTab === 'unknown-devices' || statusFilter === 'unknown';

  return (
    <div className="space-y-6">
      <DemoNoticeBanner compact />

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--np-text-primary)]">
            {isUnknownMode ? 'Unknown Device Detection' : 'Connected Network Devices'}
          </h1>
          <p className="text-sm text-[var(--np-text-secondary)] mt-1">
            {isUnknownMode
              ? 'Inspect unrecognized MAC fingerprints, verify legitimate hardware, or isolate rogue endpoints.'
              : 'Monitor active endpoints, bandwidth rhythm, open service ports, and trust posture.'}
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-[var(--np-text-secondary)]">
          Showing {filteredDevices.length} of {devices.length} endpoints
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--np-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hostname, IP address, MAC, or vendor..."
              aria-label="Search network devices"
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] placeholder:text-[var(--np-text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          <select
            value={vlanFilter}
            onChange={(e) => setVlanFilter(e.target.value)}
            aria-label="Filter by VLAN segment"
            className="min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          >
            {vlans.map((v) => (
              <option key={v} value={v}>
                {v === 'all' ? 'All Network Segments' : v}
              </option>
            ))}
          </select>
        </div>

        {/* Segmented Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { id: 'all', label: `All (${counts.all})` },
              { id: 'unknown', label: `Unknown (${counts.unknown})` },
              { id: 'suspicious', label: `Suspicious (${counts.suspicious})` },
              { id: 'trusted', label: `Trusted (${counts.trusted})` },
              { id: 'quarantined', label: `Quarantined (${counts.quarantined})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-[var(--np-surface-elevated)] text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredDevices.length === 0 ? (
        <div className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-10 text-center space-y-3">
          <ShieldQuestion className="w-8 h-8 text-[var(--np-accent)] mx-auto" />
          <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
            No Matching Endpoints Found
          </h2>
          <p className="text-xs text-[var(--np-text-secondary)] max-w-md mx-auto">
            {statusFilter === 'unknown'
              ? 'No unverified endpoints are currently active in this filter. All discovered hardware has been verified or quarantined.'
              : 'Try clearing your search query or switching VLAN filters.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setVlanFilter('all');
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-primary)] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Device List */
        <div className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl divide-y divide-[var(--np-border-subtle)] overflow-hidden">
          {filteredDevices.map((device) => (
            <div
              key={device.id}
              className="p-4 sm:px-6 sm:py-4 hover:bg-[var(--np-surface-elevated)]/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <button
                type="button"
                onClick={() => setSelectedDevice(device)}
                className="flex-1 min-w-0 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--np-text-primary)] truncate">
                      {device.hostname}
                    </span>
                    <span className="text-[var(--np-text-muted)]">·</span>
                    <DeviceTrustLabel status={device.trustStatus} />
                  </div>
                  <p className="text-xs font-mono tabular-nums text-[var(--np-text-secondary)] truncate">
                    {device.ipAddress} · {device.macAddress} · {device.vendor}
                  </p>
                  <p className="text-xs text-[var(--np-text-muted)]">
                    {device.category} · {device.vlan} · Fingerprint {device.fingerprintConfidence}% · Last seen {device.lastSeen}
                  </p>
                  {device.anomalySummary && (
                    <p className="text-xs text-amber-500 pt-1 line-clamp-2">
                      {device.anomalySummary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <div className="hidden sm:block">
                    <MiniSparkline
                      values={device.trafficSeries24h}
                      tone={
                        device.riskScore >= 70
                          ? 'danger'
                          : device.riskScore >= 40
                            ? 'warning'
                            : 'accent'
                      }
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono tabular-nums font-semibold text-[var(--np-text-primary)]">
                      Risk {device.riskScore}/100
                    </p>
                    <p className="text-[11px] font-mono tabular-nums text-[var(--np-text-muted)]">
                      ↑{device.bandwidthUpMbps} ↓{device.bandwidthDownMbps} Mbps
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--np-text-muted)]" />
                </div>
              </button>

              {/* Quick Trust / Quarantine Controls for Unknown & Suspicious devices */}
              {(device.trustStatus === 'unknown' || device.trustStatus === 'suspicious') && (
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--np-border-subtle)]">
                  <button
                    type="button"
                    onClick={() => updateDeviceTrust(device.id, 'trusted')}
                    className="min-h-[40px] flex-1 lg:flex-initial px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify &amp; Trust</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateDeviceTrust(device.id, 'quarantined')}
                    className="min-h-[40px] flex-1 lg:flex-initial px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Quarantine</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
