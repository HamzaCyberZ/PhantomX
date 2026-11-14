import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Info,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from 'lucide-react';
import { AlertSeverity, AlertStatus, DeviceTrustStatus } from '../../types/network';

export const SeverityLabel: React.FC<{ severity: AlertSeverity }> = ({ severity }) => {
  const config: Record<
    AlertSeverity,
    { label: string; colorClass: string; Icon: React.FC<{ className?: string }> }
  > = {
    critical: {
      label: 'Critical',
      colorClass: 'text-rose-500 dark:text-rose-400',
      Icon: AlertOctagon,
    },
    high: {
      label: 'High',
      colorClass: 'text-amber-600 dark:text-amber-400',
      Icon: AlertTriangle,
    },
    medium: {
      label: 'Medium',
      colorClass: 'text-sky-600 dark:text-sky-400',
      Icon: Info,
    },
    low: {
      label: 'Low',
      colorClass: 'text-slate-500 dark:text-slate-400',
      Icon: Info,
    },
  };

  const { label, colorClass, Icon } = config[severity];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${colorClass}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export const DeviceTrustLabel: React.FC<{ status: DeviceTrustStatus }> = ({ status }) => {
  const config: Record<
    DeviceTrustStatus,
    { label: string; colorClass: string; Icon: React.FC<{ className?: string }> }
  > = {
    trusted: {
      label: 'Trusted',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      Icon: ShieldCheck,
    },
    unknown: {
      label: 'Unknown',
      colorClass: 'text-amber-600 dark:text-amber-400',
      Icon: ShieldQuestion,
    },
    suspicious: {
      label: 'Suspicious',
      colorClass: 'text-rose-500 dark:text-rose-400',
      Icon: ShieldAlert,
    },
    quarantined: {
      label: 'Quarantined',
      colorClass: 'text-slate-500 dark:text-slate-400',
      Icon: Lock,
    },
  };

  const { label, colorClass, Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${colorClass}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};

export const AlertStatusLabel: React.FC<{ status: AlertStatus }> = ({ status }) => {
  const config: Record<
    AlertStatus,
    { label: string; colorClass: string; Icon: React.FC<{ className?: string }> }
  > = {
    open: {
      label: 'Open',
      colorClass: 'text-rose-500 dark:text-rose-400',
      Icon: AlertOctagon,
    },
    investigating: {
      label: 'Investigating',
      colorClass: 'text-amber-600 dark:text-amber-400',
      Icon: Eye,
    },
    resolved: {
      label: 'Resolved',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      Icon: CheckCircle2,
    },
    dismissed: {
      label: 'Dismissed',
      colorClass: 'text-slate-500 dark:text-slate-400',
      Icon: Info,
    },
  };

  const { label, colorClass, Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${colorClass}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
