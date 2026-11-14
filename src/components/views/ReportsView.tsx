import React, { useState } from 'react';
import { Download, Eye, FileText, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportService } from '../../services/exportService';
import { SecurityReport } from '../../types/network';
import { DemoNoticeBanner } from '../ui/DemoNoticeBanner';
import { DetailSheet } from '../ui/DetailSheet';
import { ScoreTrendChart } from '../ui/NetworkCharts';

export const ReportsView: React.FC = () => {
  const {
    reports,
    scoreTrend7d,
    devices,
    alerts,
    portScans,
    createSnapshotReport,
    pushToast,
  } = useApp();

  const [previewReport, setPreviewReport] = useState<SecurityReport | null>(null);

  const handleExport = (
    report: SecurityReport,
    format: 'JSON' | 'CSV' | 'Markdown',
  ) => {
    const payload = { report, devices, alerts, portScans };
    if (format === 'JSON') exportService.exportJSON(payload);
    if (format === 'CSV') exportService.exportCSV(payload);
    if (format === 'Markdown') exportService.exportMarkdown(payload);
    pushToast(`Exported ${report.title} as ${format}.`, 'success');
  };

  return (
    <div className="space-y-6">
      <DemoNoticeBanner compact />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--np-text-primary)]">
            Security Reports &amp; History
          </h1>
          <p className="text-sm text-[var(--np-text-secondary)] mt-1">
            Review 7-day security posture history, generate on-demand snapshots, and export audit files.
          </p>
        </div>

        <button
          type="button"
          onClick={createSnapshotReport}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Snapshot Report</span>
        </button>
      </div>

      {/* 7-Day Posture Trend */}
      <section className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
              7-Day Security Posture Trend
            </h2>
            <p className="text-xs text-[var(--np-text-muted)]">
              Historical daily security posture scores
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-[var(--np-text-secondary)]">
            Peak 92 · Latest {scoreTrend7d[scoreTrend7d.length - 1]?.score}
          </span>
        </div>

        <ScoreTrendChart data={scoreTrend7d} />
      </section>

      {/* Report Archive */}
      <section className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl divide-y divide-[var(--np-border-subtle)] overflow-hidden">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--np-text-muted)]">
                <FileText className="w-3.5 h-3.5 text-[var(--np-accent)]" />
                <span className="font-mono tabular-nums">{rep.period}</span>
                <span>·</span>
                <span className="font-mono tabular-nums text-[var(--np-text-primary)] font-semibold">
                  Score {rep.securityScore}/100
                </span>
                <span>·</span>
                <span className="font-mono tabular-nums">
                  {rep.criticalFindings} critical findings
                </span>
              </div>

              <h3 className="text-base font-semibold text-[var(--np-text-primary)]">
                {rep.title}
              </h3>
              <p className="text-xs text-[var(--np-text-secondary)] leading-relaxed max-w-2xl">
                {rep.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewReport(rep)}
                className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-primary)] hover:bg-[var(--np-surface-elevated)] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              {rep.formatReady.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleExport(rep, fmt)}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[var(--np-accent-soft)] text-[var(--np-accent)] hover:opacity-85 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{fmt}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Report Preview Sheet */}
      <DetailSheet
        open={Boolean(previewReport)}
        onClose={() => setPreviewReport(null)}
        title={previewReport?.title ?? 'Report Preview'}
        subtitle={previewReport?.period}
        footer={
          previewReport && (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleExport(previewReport, 'JSON')}
                className="min-h-[44px] rounded-xl bg-sky-500 text-slate-950 font-semibold text-xs cursor-pointer"
              >
                Download JSON
              </button>
              <button
                type="button"
                onClick={() => handleExport(previewReport, 'CSV')}
                className="min-h-[44px] rounded-xl border border-[var(--np-border)] text-[var(--np-text-primary)] font-semibold text-xs cursor-pointer"
              >
                Download CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport(previewReport, 'Markdown')}
                className="min-h-[44px] rounded-xl border border-[var(--np-border)] text-[var(--np-text-primary)] font-semibold text-xs cursor-pointer"
              >
                Download MD
              </button>
            </div>
          )
        }
      >
        {previewReport && (
          <pre className="p-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-xs font-mono text-[var(--np-text-secondary)] whitespace-pre-wrap leading-relaxed">
            {exportService.buildMarkdownContent({
              report: previewReport,
              devices,
              alerts,
              portScans,
            })}
          </pre>
        )}
      </DetailSheet>
    </div>
  );
};
