import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { networkService } from '../services/networkService';
import {
  AiThreatBriefing,
  AlertStatus,
  AppSettings,
  DeviceTrustStatus,
  IntegrationStatus,
  NavigationTab,
  NetworkDevice,
  PortScanEvent,
  ProtocolShare,
  RiskFactor,
  SecurityAlert,
  SecurityReport,
  SuspiciousFlow,
  ThreatVector,
  TrafficPoint,
  UserProfile,
} from '../types/network';

export type AppStage = 'splash-onboarding' | 'auth' | 'app';

export interface ToastNotice {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning';
}

interface AppContextValue {
  stage: AppStage;
  setStage: (stage: AppStage) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  dataMode: 'supabase' | 'demo';
  integrationStatus: IntegrationStatus;
  devices: NetworkDevice[];
  alerts: SecurityAlert[];
  trafficSeries: TrafficPoint[];
  protocolDistribution: ProtocolShare[];
  suspiciousFlows: SuspiciousFlow[];
  portScans: PortScanEvent[];
  threatVectors: ThreatVector[];
  riskFactors: RiskFactor[];
  reports: SecurityReport[];
  scoreTrend7d: { day: string; score: number }[];
  profile: UserProfile;
  settings: AppSettings;
  securityScore: number;
  selectedDevice: NetworkDevice | null;
  setSelectedDevice: (device: NetworkDevice | null) => void;
  selectedAlert: SecurityAlert | null;
  setSelectedAlert: (alert: SecurityAlert | null) => void;
  isSimulatingScan: boolean;
  isRunningAiAnalysis: boolean;
  aiThreatBriefing: AiThreatBriefing | null;
  lastScanTimestamp: string;
  toasts: ToastNotice[];
  pushToast: (message: string, tone?: ToastNotice['tone']) => void;
  dismissToast: (id: string) => void;
  updateDeviceTrust: (deviceId: string, trustStatus: DeviceTrustStatus) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  toggleFlowMitigation: (flowId: string) => void;
  togglePortScanBlock: (scanId: string) => void;
  toggleRiskFactorRemediation: (factorId: string) => void;
  runSimulatedScan: () => void;
  runAiThreatAnalysis: () => Promise<void>;
  injectSimulatedThreat: () => void;
  createSnapshotReport: () => SecurityReport;
  resetDemoState: () => void;
  seedSupabaseData: () => Promise<void>;
  refreshSupabaseSnapshot: () => Promise<void>;
  updateProfile: (partial: Partial<UserProfile>) => void;
  updateAvatar: (avatarUrl: string) => void;
  removeAvatar: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  loginDemoUser: (email?: string, fullName?: string) => void;
  logoutToAuth: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const PROFILE_STORAGE_KEY = 'phantomx_profile_v1';
const SETTINGS_STORAGE_KEY = 'phantomx_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  alertThreshold: 'all',
  autoQuarantineUnknown: false,
  portScanSensitivity: 'balanced',
  pushNotifications: true,
  weeklyDigest: true,
};

const DEFAULT_INTEGRATION_STATUS: IntegrationStatus = {
  supabaseConfigured: false,
  supabaseUrl: 'https://ufamecgfayoarbnodqul.supabase.co',
  tablesReady: false,
  hasData: false,
  geminiConfigured: false,
};

function loadStoredProfile(fallback: UserProfile): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function loadStoredSettings(fallback: AppSettings): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => networkService.getInitialSnapshot(), []);

  const [stage, setStage] = useState<AppStage>('splash-onboarding');
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [dataMode, setDataMode] = useState<'supabase' | 'demo'>('demo');
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>(
    DEFAULT_INTEGRATION_STATUS,
  );

  const [devices, setDevices] = useState<NetworkDevice[]>(initial.devices);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(initial.alerts);
  const [trafficSeries] = useState<TrafficPoint[]>(initial.trafficSeries);
  const [protocolDistribution] = useState<ProtocolShare[]>(initial.protocolDistribution);
  const [suspiciousFlows, setSuspiciousFlows] = useState<SuspiciousFlow[]>(
    initial.suspiciousFlows,
  );
  const [portScans, setPortScans] = useState<PortScanEvent[]>(initial.portScans);
  const [threatVectors] = useState<ThreatVector[]>(initial.threatVectors);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>(initial.riskFactors);
  const [reports, setReports] = useState<SecurityReport[]>(initial.reports);
  const [scoreTrend7d] = useState(initial.scoreTrend7d);
  const [profile, setProfile] = useState<UserProfile>(() =>
    loadStoredProfile(initial.profile),
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadStoredSettings(DEFAULT_SETTINGS),
  );

  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [isRunningAiAnalysis, setIsRunningAiAnalysis] = useState(false);
  const [aiThreatBriefing, setAiThreatBriefing] = useState<AiThreatBriefing | null>(null);
  const [lastScanTimestamp, setLastScanTimestamp] = useState('Today · 11:15');
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }, [profile]);

  const pushToast = (message: string, tone: ToastNotice['tone'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshSupabaseSnapshot = async () => {
    try {
      const status = await networkService.getIntegrationStatus();
      setIntegrationStatus(status);

      if (status.supabaseConfigured && status.tablesReady) {
        const snap = await networkService.fetchSupabaseSnapshot();
        if (snap.connected && !snap.empty) {
          if (snap.devices) setDevices(snap.devices);
          if (snap.alerts) setAlerts(snap.alerts);
          if (snap.suspiciousFlows) setSuspiciousFlows(snap.suspiciousFlows);
          if (snap.portScans) setPortScans(snap.portScans);
          if (snap.riskFactors) setRiskFactors(snap.riskFactors);
          if (snap.reports) setReports(snap.reports);
          setDataMode('supabase');
          return;
        }
      }
      setDataMode('demo');
    } catch {
      setDataMode('demo');
    }
  };

  useEffect(() => {
    refreshSupabaseSnapshot();
  }, []);

  const securityScore = useMemo(
    () => networkService.computeNetworkSecurityScore(devices, alerts, riskFactors),
    [devices, alerts, riskFactors],
  );

  const seedSupabaseData = async () => {
    try {
      const res = await networkService.seedSupabase();
      pushToast(res.message, 'success');
      await refreshSupabaseSnapshot();
    } catch (err: any) {
      pushToast(err?.message || 'Unable to seed Supabase tables.', 'warning');
    }
  };

  const updateDeviceTrust = (deviceId: string, trustStatus: DeviceTrustStatus) => {
    let persistPayload: {
      trustStatus: DeviceTrustStatus;
      riskScore: number;
      vlan: string;
      bandwidthUpMbps: number;
      bandwidthDownMbps: number;
    } | null = null;

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const nextRisk =
          trustStatus === 'trusted'
            ? 14
            : trustStatus === 'quarantined'
              ? 28
              : trustStatus === 'suspicious'
                ? 78
                : 82;
        const nextVlan =
          trustStatus === 'quarantined' ? 'VLAN 99 · Quarantine' : d.vlan;
        const nextUp = trustStatus === 'quarantined' ? 0 : d.bandwidthUpMbps;
        const nextDown = trustStatus === 'quarantined' ? 0 : d.bandwidthDownMbps;

        persistPayload = {
          trustStatus,
          riskScore: nextRisk,
          vlan: nextVlan,
          bandwidthUpMbps: nextUp,
          bandwidthDownMbps: nextDown,
        };

        const updated: NetworkDevice = {
          ...d,
          ...persistPayload,
        };
        if (selectedDevice?.id === deviceId) {
          setSelectedDevice(updated);
        }
        return updated;
      }),
    );

    if (dataMode === 'supabase' && persistPayload) {
      networkService.persistDeviceTrust(deviceId, persistPayload).catch(() => {
        pushToast('Updated locally; Supabase sync failed.', 'warning');
      });
    }

    const label =
      trustStatus === 'trusted'
        ? 'marked as Trusted'
        : trustStatus === 'quarantined'
          ? 'moved to Quarantine'
          : 'flagged as Suspicious';
    pushToast(
      `Device ${label}${dataMode === 'supabase' ? ' & saved to Supabase' : ''}.`,
      trustStatus === 'trusted' ? 'success' : 'warning',
    );
  };

  const updateAlertStatus = (alertId: string, status: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id !== alertId) return a;
        const updated = { ...a, status };
        if (selectedAlert?.id === alertId) {
          setSelectedAlert(updated);
        }
        return updated;
      }),
    );

    if (dataMode === 'supabase') {
      networkService.persistAlertStatus(alertId, status).catch(() => {
        pushToast('Alert updated locally; Supabase sync failed.', 'warning');
      });
    }

    pushToast(
      `Alert status updated to ${status}.`,
      status === 'resolved' ? 'success' : 'info',
    );
  };

  const toggleFlowMitigation = (flowId: string) => {
    let nextVal = false;
    setSuspiciousFlows((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;
        nextVal = !f.mitigated;
        return { ...f, mitigated: nextVal };
      }),
    );
    if (dataMode === 'supabase') {
      networkService.persistFlowMitigation(flowId, nextVal).catch(() => {});
    }
    pushToast('Flow mitigation rule updated.', 'success');
  };

  const togglePortScanBlock = (scanId: string) => {
    let nextVal = false;
    setPortScans((prev) =>
      prev.map((s) => {
        if (s.id !== scanId) return s;
        nextVal = !s.blocked;
        return { ...s, blocked: nextVal };
      }),
    );
    if (dataMode === 'supabase') {
      networkService.persistPortScanBlock(scanId, nextVal).catch(() => {});
    }
    pushToast('Source scanner block policy toggled.', 'success');
  };

  const toggleRiskFactorRemediation = (factorId: string) => {
    let nextVal = false;
    setRiskFactors((prev) =>
      prev.map((rf) => {
        if (rf.id !== factorId) return rf;
        nextVal = !rf.remediated;
        return { ...rf, remediated: nextVal };
      }),
    );
    if (dataMode === 'supabase') {
      networkService.persistRiskFactorToggle(factorId, nextVal).catch(() => {});
    }
  };

  const runAiThreatAnalysis = async () => {
    if (isRunningAiAnalysis) return;
    setIsRunningAiAnalysis(true);
    try {
      const result = await networkService.runAiThreatAnalysis({
        devices,
        alerts,
        suspiciousFlows,
        portScans,
        securityScore,
      });
      setAiThreatBriefing(result);
      const timeNow = new Date().toTimeString().slice(0, 5);
      setLastScanTimestamp(`Today · ${timeNow}`);
      pushToast('PhantomX AI threat analysis complete.', 'success');
    } catch (err: any) {
      pushToast(err?.message || 'AI threat analysis unavailable.', 'warning');
    } finally {
      setIsRunningAiAnalysis(false);
    }
  };

  const runSimulatedScan = () => {
    if (isSimulatingScan) return;
    if (integrationStatus.geminiConfigured) {
      setIsSimulatingScan(true);
      runAiThreatAnalysis().finally(() => setIsSimulatingScan(false));
      return;
    }

    setIsSimulatingScan(true);
    window.setTimeout(() => {
      setIsSimulatingScan(false);
      const timeNow = new Date().toTimeString().slice(0, 5);
      setLastScanTimestamp(`Today · ${timeNow}`);
      pushToast('Behavioural scan completed across monitored endpoints.', 'success');
    }, 1000);
  };

  const injectSimulatedThreat = () => {
    const payload = networkService.generateSimulatedThreatEvent();
    setDevices((prev) => [payload.device, ...prev]);
    setAlerts((prev) => [payload.alert, ...prev]);
    setPortScans((prev) => [payload.portScan, ...prev]);
    setSuspiciousFlows((prev) => [payload.flow, ...prev]);
    if (dataMode === 'supabase') {
      networkService.persistSimulatedEvent(payload).catch(() => {});
    }
    pushToast(
      `Threat event recorded: ${payload.device.hostname} (${payload.device.ipAddress}).`,
      'warning',
    );
  };

  const createSnapshotReport = () => {
    const snap = networkService.createReportSnapshot(securityScore, devices, alerts);
    setReports((prev) => [snap, ...prev]);
    if (dataMode === 'supabase') {
      networkService.persistReport(snap).catch(() => {});
    }
    pushToast('New security posture report snapshot created.', 'success');
    return snap;
  };

  const resetDemoState = () => {
    const fresh = networkService.getInitialSnapshot();
    setDevices(fresh.devices);
    setAlerts(fresh.alerts);
    setSuspiciousFlows(fresh.suspiciousFlows);
    setPortScans(fresh.portScans);
    setRiskFactors(fresh.riskFactors);
    setReports(fresh.reports);
    setAiThreatBriefing(null);
    setSelectedDevice(null);
    setSelectedAlert(null);
    pushToast('Telemetry restored to baseline snapshot.', 'info');
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
    pushToast('Profile details saved.', 'success');
  };

  const updateAvatar = (avatarUrl: string) => {
    setProfile((prev) => ({ ...prev, avatarUrl }));
    pushToast('Profile photo updated.', 'success');
  };

  const removeAvatar = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: '' }));
    pushToast('Profile photo removed.', 'info');
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const loginDemoUser = (email?: string, fullName?: string) => {
    if (email || fullName) {
      setProfile((prev) => ({
        ...prev,
        email: email || prev.email,
        fullName: fullName || prev.fullName,
      }));
    }
    setStage('app');
    setActiveTab('dashboard');
    pushToast('Welcome to PhantomX Security Workspace.', 'info');
  };

  const logoutToAuth = () => {
    setSelectedDevice(null);
    setSelectedAlert(null);
    setStage('auth');
  };

  return (
    <AppContext.Provider
      value={{
        stage,
        setStage,
        activeTab,
        setActiveTab,
        dataMode,
        integrationStatus,
        devices,
        alerts,
        trafficSeries,
        protocolDistribution,
        suspiciousFlows,
        portScans,
        threatVectors,
        riskFactors,
        reports,
        scoreTrend7d,
        profile,
        settings,
        securityScore,
        selectedDevice,
        setSelectedDevice,
        selectedAlert,
        setSelectedAlert,
        isSimulatingScan,
        isRunningAiAnalysis,
        aiThreatBriefing,
        lastScanTimestamp,
        toasts,
        pushToast,
        dismissToast,
        updateDeviceTrust,
        updateAlertStatus,
        toggleFlowMitigation,
        togglePortScanBlock,
        toggleRiskFactorRemediation,
        runSimulatedScan,
        runAiThreatAnalysis,
        injectSimulatedThreat,
        createSnapshotReport,
        resetDemoState,
        seedSupabaseData,
        refreshSupabaseSnapshot,
        updateProfile,
        updateAvatar,
        removeAvatar,
        updateSettings,
        loginDemoUser,
        logoutToAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
