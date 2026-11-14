import {
  NetworkDevice,
  PortScanEvent,
  SecurityAlert,
  SecurityReport,
} from '../types/network';

export interface ExportPayload {
  report: SecurityReport;
  devices: NetworkDevice[];
  alerts: SecurityAlert[];
  portScans: PortScanEvent[];
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const exportService = {
  buildMarkdownContent(payload: ExportPayload): string {
    const { report, devices, alerts, portScans } = payload;
    const openAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'investigating');
    const unknownDevices = devices.filter((d) => d.trustStatus === 'unknown' || d.trustStatus === 'suspicious');

    return [
      `# PhantomX — Security Audit Report`,
      ``,
      `- **Report Title:** ${report.title}`,
      `- **Period:** ${report.period}`,
      `- **Generated At:** ${report.generatedAt}`,
      `- **Network Security Score:** ${report.securityScore} / 100`,
      `- **Total Monitored Devices:** ${devices.length}`,
      `- **Open / Investigating Alerts:** ${openAlerts.length}`,
      `- **Port Scan Events Recorded:** ${portScans.length}`,
      ``,
      `## Executive Summary`,
      report.summary,
      ``,
      `## Flagged Endpoints (${unknownDevices.length})`,
      ...unknownDevices.map(
        (d) =>
          `- **${d.hostname}** (${d.ipAddress} · \`${d.macAddress}\`) — Status: ${d.trustStatus.toUpperCase()}, Risk Score: ${d.riskScore}/100`,
      ),
      ``,
      `## Active Security Alerts (${openAlerts.length})`,
      ...openAlerts.map(
        (a) =>
          `- **[${a.severity.toUpperCase()}] ${a.title}** (${a.sourceIp}) — ${a.summary}`,
      ),
    ].join('\n');
  },

  exportJSON(payload: ExportPayload) {
    const formatted = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        report: payload.report,
        devices: payload.devices,
        alerts: payload.alerts,
        portScans: payload.portScans,
      },
      null,
      2,
    );
    triggerDownload(
      `phantomx-report-${payload.report.id}.json`,
      formatted,
      'application/json;charset=utf-8',
    );
  },

  exportCSV(payload: ExportPayload) {
    const header = [
      'Alert ID',
      'Severity',
      'Status',
      'Category',
      'Title',
      'Source IP',
      'Device',
      'Timestamp',
      'Confidence',
    ].join(',');
    const rows = payload.alerts.map((a) =>
      [
        a.id,
        a.severity,
        a.status,
        `"${a.category}"`,
        `"${a.title.replace(/"/g, '""')}"`,
        a.sourceIp,
        `"${a.deviceName}"`,
        `"${a.timestamp}"`,
        `${a.confidence}%`,
      ].join(','),
    );
    triggerDownload(
      `phantomx-alerts-${payload.report.id}.csv`,
      [header, ...rows].join('\n'),
      'text/csv;charset=utf-8',
    );
  },

  exportMarkdown(payload: ExportPayload) {
    const md = this.buildMarkdownContent(payload);
    triggerDownload(
      `phantomx-report-${payload.report.id}.md`,
      md,
      'text/markdown;charset=utf-8',
    );
  },
};
