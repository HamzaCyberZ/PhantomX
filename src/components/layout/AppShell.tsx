import React, { useState } from 'react';
import {
  Activity,
  BellRing,
  BrainCircuit,
  FileBarChart2,
  Gauge,
  LayoutDashboard,
  Menu,
  Radar,
  RefreshCw,
  Server,
  Settings,
  ShieldQuestion,
  X,
} from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types/network';
import { SafeImage } from '../ui/SafeImage';
import { UserAvatar } from '../ui/UserAvatar';

interface NavItem {
  id: NavigationTab;
  label: string;
  shortLabel: string;
  group: 'Monitor' | 'Investigate' | 'Govern';
  Icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', group: 'Monitor', Icon: LayoutDashboard },
  { id: 'devices', label: 'Connected Devices', shortLabel: 'Devices', group: 'Monitor', Icon: Server },
  { id: 'unknown-devices', label: 'Unknown Devices', shortLabel: 'Unknown', group: 'Monitor', Icon: ShieldQuestion },
  { id: 'traffic', label: 'Suspicious Traffic', shortLabel: 'Traffic', group: 'Investigate', Icon: Activity },
  { id: 'port-scans', label: 'Port Scans', shortLabel: 'Ports', group: 'Investigate', Icon: Radar },
  { id: 'threat-intel', label: 'AI Threat Intel', shortLabel: 'Threat AI', group: 'Investigate', Icon: BrainCircuit },
  { id: 'alerts', label: 'Security Alerts', shortLabel: 'Alerts', group: 'Investigate', Icon: BellRing },
  { id: 'risk-assessment', label: 'Risk Assessment', shortLabel: 'Risk', group: 'Govern', Icon: Gauge },
  { id: 'reports', label: 'Reports & History', shortLabel: 'Reports', group: 'Govern', Icon: FileBarChart2 },
  { id: 'settings', label: 'Profile & Settings', shortLabel: 'Profile', group: 'Govern', Icon: Settings },
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    alerts,
    devices,
    profile,
    isSimulatingScan,
    runSimulatedScan,
    toasts,
    dismissToast,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openAlertsCount = alerts.filter(
    (a) => a.status === 'open' || a.status === 'investigating',
  ).length;
  const unknownDevicesCount = devices.filter(
    (d) => d.trustStatus === 'unknown' || d.trustStatus === 'suspicious',
  ).length;

  const currentNav = NAV_ITEMS.find((n) => n.id === activeTab) ?? NAV_ITEMS[0];

  const getBadgeCount = (id: NavigationTab): number | null => {
    if (id === 'alerts' && openAlertsCount > 0) return openAlertsCount;
    if (id === 'unknown-devices' && unknownDevicesCount > 0) return unknownDevicesCount;
    return null;
  };

  const groups: ('Monitor' | 'Investigate' | 'Govern')[] = ['Monitor', 'Investigate', 'Govern'];
  const mobilePrimaryTabs: NavigationTab[] = ['dashboard', 'devices', 'alerts', 'threat-intel'];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[var(--np-canvas)] text-[var(--np-text-primary)] flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[var(--np-surface)] border-r border-[var(--np-border)] z-30">
          {/* Brand */}
          <div className="px-5 h-16 flex items-center gap-3 border-b border-[var(--np-border-subtle)] shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--np-border)] shrink-0">
              <SafeImage
                src="/src/assets/images/netphantom_emblem_1794683835065.jpg"
                alt="PhantomX"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-[var(--np-text-primary)] whitespace-nowrap">
              PhantomX
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Primary Navigation">
            {groups.map((groupName) => (
              <div key={groupName}>
                <p className="px-3 mb-2 text-[11px] font-semibold text-[var(--np-text-muted)]">
                  {groupName}
                </p>
                <div className="space-y-0.5">
                  {NAV_ITEMS.filter((item) => item.group === groupName).map((item) => {
                    const Icon = item.Icon;
                    const active = activeTab === item.id;
                    const count = getBadgeCount(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full min-h-[42px] px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-sm font-medium transition-all duration-150 cursor-pointer ${
                          active
                            ? 'bg-[var(--np-accent-soft)] text-[var(--np-accent)]'
                            : 'text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)] hover:bg-[var(--np-surface-elevated)]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {count !== null && (
                          <span className="text-xs font-mono tabular-nums text-[var(--np-text-primary)]">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar User Card */}
          <div className="p-3 border-t border-[var(--np-border-subtle)]">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="w-full p-2.5 rounded-xl hover:bg-[var(--np-surface-elevated)] flex items-center gap-3 transition-colors text-left cursor-pointer"
            >
              <UserAvatar
                src={profile.avatarUrl}
                name={profile.fullName}
                sizeClass="w-9 h-9"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--np-text-primary)] truncate">
                  {profile.fullName}
                </p>
                <p className="text-[11px] text-[var(--np-text-muted)] truncate">
                  {profile.networkName}
                </p>
              </div>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Desktop 3-Zone Top Header */}
          <header className="hidden lg:flex items-center justify-between gap-8 h-16 px-8 bg-[var(--np-surface)]/90 backdrop-blur-md border-b border-[var(--np-border)] sticky top-0 z-20">
            {/* Zone 1: Breadcrumb */}
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-[var(--np-text-muted)] whitespace-nowrap shrink-0">
                PhantomX
              </span>
              <span className="text-[var(--np-text-muted)]">/</span>
              <span className="font-semibold text-[var(--np-text-primary)] truncate">
                {currentNav.label}
              </span>
            </div>

            {/* Zone 2: Clean quick view links */}
            <nav className="flex items-center gap-6 text-xs font-medium text-[var(--np-text-secondary)]">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`whitespace-nowrap shrink-0 hover:text-[var(--np-text-primary)] transition-colors cursor-pointer ${
                  activeTab === 'dashboard' ? 'text-[var(--np-text-primary)] underline underline-offset-8' : ''
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unknown-devices')}
                className={`whitespace-nowrap shrink-0 hover:text-[var(--np-text-primary)] transition-colors cursor-pointer ${
                  activeTab === 'unknown-devices' ? 'text-[var(--np-text-primary)] underline underline-offset-8' : ''
                }`}
              >
                Unknown Nodes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('alerts')}
                className={`whitespace-nowrap shrink-0 hover:text-[var(--np-text-primary)] transition-colors cursor-pointer ${
                  activeTab === 'alerts' ? 'text-[var(--np-text-primary)] underline underline-offset-8' : ''
                }`}
              >
                Alerts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`whitespace-nowrap shrink-0 hover:text-[var(--np-text-primary)] transition-colors cursor-pointer ${
                  activeTab === 'reports' ? 'text-[var(--np-text-primary)] underline underline-offset-8' : ''
                }`}
              >
                Reports
              </button>
            </nav>

            {/* Zone 3: Primary Action + Header Profile Picture */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={runSimulatedScan}
                disabled={isSimulatingScan}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-70 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingScan ? 'animate-spin' : ''}`} />
                <span>{isSimulatingScan ? 'Scanning...' : 'Run Scan'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                aria-label="Open profile and settings"
                title={`${profile.fullName} · Profile & Settings`}
                className="min-w-[40px] min-h-[40px] rounded-full hover:ring-2 hover:ring-sky-500/40 transition-all cursor-pointer"
              >
                <UserAvatar
                  src={profile.avatarUrl}
                  name={profile.fullName}
                  sizeClass="w-9 h-9"
                />
              </button>
            </div>
          </header>

          {/* Mobile Compact Top App Bar (52px height) */}
          <header className="lg:hidden sticky top-0 z-20 h-[52px] px-4 bg-[var(--np-surface)]/95 backdrop-blur-md border-b border-[var(--np-border)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-[var(--np-border)] shrink-0">
                <SafeImage
                  src="/src/assets/images/netphantom_emblem_1794683835065.jpg"
                  alt="PhantomX"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-display font-semibold text-sm text-[var(--np-text-primary)] truncate">
                {activeTab === 'dashboard' ? 'PhantomX' : currentNav.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={runSimulatedScan}
                disabled={isSimulatingScan}
                aria-label="Run Scan"
                className="min-h-[44px] px-2.5 rounded-xl text-xs font-semibold text-[var(--np-accent)] inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isSimulatingScan ? 'animate-spin' : ''}`} />
                <span>{isSimulatingScan ? 'Scanning' : 'Scan'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                aria-label="Open profile"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              >
                <UserAvatar
                  src={profile.avatarUrl}
                  name={profile.fullName}
                  sizeClass="w-8 h-8"
                  textClass="text-[11px]"
                />
              </button>
            </div>
          </header>

          {/* Main Viewport with smooth transitions */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 lg:pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Fixed Bottom Thumb Navigation (64px height) */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--np-surface)]/95 backdrop-blur-md border-t border-[var(--np-border)] pb-safe"
          aria-label="Mobile Navigation"
        >
          <div className="grid grid-cols-5 h-16 items-center">
            {mobilePrimaryTabs.map((tabId) => {
              const item = NAV_ITEMS.find((n) => n.id === tabId)!;
              const Icon = item.Icon;
              const active = activeTab === item.id;
              const badge = getBadgeCount(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`min-h-[44px] flex flex-col items-center justify-center gap-1 relative cursor-pointer transition-colors ${
                    active ? 'text-[var(--np-accent)]' : 'text-[var(--np-text-secondary)]'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {badge !== null && (
                      <span className="absolute -top-1.5 -right-2.5 text-[10px] font-mono font-bold text-rose-500">
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium tracking-tight">
                    {item.shortLabel}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                mobileMenuOpen || !mobilePrimaryTabs.includes(activeTab)
                  ? 'text-[var(--np-accent)]'
                  : 'text-[var(--np-text-secondary)]'
              }`}
            >
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-tight">More</span>
            </button>
          </div>
        </nav>

        {/* Mobile Secondary Navigation Bottom Sheet */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-end"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ y: 36, opacity: 0.8 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 36, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="w-full bg-[var(--np-surface)] border-t border-[var(--np-border)] rounded-t-3xl p-5 pb-safe max-h-[78vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1.5 rounded-full bg-slate-400/40 mx-auto mb-4" />
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
                    PhantomX Modules
                  </h2>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close modules menu"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--np-text-secondary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.Icon;
                    const active = activeTab === item.id;
                    const count = getBadgeCount(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`min-h-[52px] p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[var(--np-accent-soft)] border-sky-500/40 text-[var(--np-accent)]'
                            : 'bg-[var(--np-surface-elevated)] border-[var(--np-border-subtle)] text-[var(--np-text-primary)]'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-medium truncate">{item.label}</span>
                        </span>
                        {count !== null && (
                          <span className="text-xs font-mono tabular-nums text-rose-500 shrink-0">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Stack */}
        {toasts.length > 0 && (
          <div
            className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none"
            aria-live="polite"
          >
            <AnimatePresence>
              {toasts.map((toast) => (
                <motion.div
                  key={toast.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] shadow-xl text-xs text-[var(--np-text-primary)]"
                >
                  <span>{toast.message}</span>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    aria-label="Dismiss notification"
                    className="text-[var(--np-text-muted)] hover:text-[var(--np-text-primary)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </MotionConfig>
  );
};
