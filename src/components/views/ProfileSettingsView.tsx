import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Copy,
  Database,
  LogOut,
  MapPin,
  Moon,
  Phone,
  RefreshCw,
  RotateCcw,
  Save,
  Sun,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AvatarCaptureModal } from '../profile/AvatarCaptureModal';
import { UserAvatar } from '../ui/UserAvatar';

const SQL_SCHEMA_SNIPPET = `-- Run in Supabase SQL Editor (https://ufamecgfayoarbnodqul.supabase.co)
create table if not exists public.devices (
  id text primary key,
  hostname text not null,
  ip_address text not null,
  mac_address text not null,
  vendor text not null,
  category text not null,
  trust_status text not null,
  risk_score integer not null default 0,
  first_seen text not null,
  last_seen text not null,
  vlan text not null,
  bandwidth_up_mbps numeric not null default 0,
  bandwidth_down_mbps numeric not null default 0,
  open_ports integer[] not null default '{}',
  os_guess text not null default 'Unknown',
  fingerprint_confidence integer not null default 50,
  anomaly_summary text,
  traffic_series_24h integer[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.security_alerts (
  id text primary key,
  title text not null,
  summary text not null,
  severity text not null,
  status text not null,
  category text not null,
  source_ip text not null,
  destination_ip text,
  device_id text,
  device_name text not null,
  timestamp text not null,
  detected_ports integer[] default '{}',
  confidence integer not null default 80,
  ai_explanation text not null,
  recommended_action text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.suspicious_flows (
  id text primary key,
  source_device text not null,
  source_ip text not null,
  destination_ip text not null,
  destination_geo text not null,
  protocol text not null,
  port integer not null,
  bytes_transferred_mb numeric not null default 0,
  duration_sec integer not null default 0,
  risk_level text not null,
  anomaly_reason text not null,
  timestamp text not null,
  mitigated boolean not null default false
);

create table if not exists public.port_scans (
  id text primary key,
  source_ip text not null,
  source_device text not null,
  target_range text not null,
  scan_type text not null,
  ports_scanned integer[] not null default '{}',
  total_probes integer not null default 0,
  duration_ms integer not null default 0,
  timestamp text not null,
  severity text not null,
  blocked boolean not null default false
);

create table if not exists public.risk_factors (
  id text primary key,
  category text not null,
  title text not null,
  description text not null,
  current_score integer not null,
  weight numeric not null,
  remediated boolean not null default false,
  impact_points integer not null,
  remediation_step text not null
);

create table if not exists public.security_reports (
  id text primary key,
  title text not null,
  period text not null,
  generated_at text not null,
  security_score integer not null,
  total_devices integer not null,
  threats_mitigated integer not null,
  critical_findings integer not null,
  summary text not null,
  format_ready text[] not null default '{"JSON","CSV","Markdown"}'
);`;

export const ProfileSettingsView: React.FC = () => {
  const {
    profile,
    updateProfile,
    updateAvatar,
    removeAvatar,
    settings,
    updateSettings,
    dataMode,
    integrationStatus,
    seedSupabaseData,
    refreshSupabaseSnapshot,
    injectSimulatedThreat,
    resetDemoState,
    setStage,
    logoutToAuth,
    pushToast,
  } = useApp();

  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [location, setLocation] = useState(profile.location);
  const [role, setRole] = useState(profile.role);
  const [department, setDepartment] = useState(profile.department);
  const [organization, setOrganization] = useState(profile.organization);
  const [bio, setBio] = useState(profile.bio);
  const [networkName, setNetworkName] = useState(profile.networkName);
  const [subnetCidr, setSubnetCidr] = useState(profile.subnetCidr);

  const [profileError, setProfileError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setProfileError('Enter a valid email address.');
      return;
    }
    if (!/^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/.test(subnetCidr.trim())) {
      setProfileError('Enter a valid CIDR subnet (for example 192.168.10.0/24).');
      return;
    }
    setProfileError('');
    updateProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      role: role.trim() || 'Security Analyst',
      department: department.trim(),
      organization: organization.trim(),
      bio: bio.trim(),
      networkName: networkName.trim() || 'HQ-Core',
      subnetCidr: subnetCidr.trim(),
    });
  };

  const handleCopySchema = async () => {
    try {
      await navigator.clipboard.writeText(SQL_SCHEMA_SNIPPET);
      pushToast('Supabase SQL schema copied to clipboard.', 'success');
    } catch {
      pushToast('See supabase/schema.sql in project files to copy.', 'info');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    await seedSupabaseData();
    setSeeding(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Hero Banner */}
      <section className="px-hero-surface border border-[var(--np-border)] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative self-start">
            <UserAvatar
              src={profile.avatarUrl}
              name={profile.fullName}
              sizeClass="w-24 h-24"
              textClass="text-2xl"
              roundedClass="rounded-3xl"
            />
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              aria-label="Update profile picture"
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 min-w-0">
            <h1 className="text-2xl font-bold text-[var(--np-text-primary)] truncate">
              {profile.fullName}
            </h1>
            <p className="text-sm text-[var(--np-text-secondary)]">
              {profile.role} · {profile.organization}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--np-text-muted)] pt-1">
              <span className="font-mono">{profile.email}</span>
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.location}</span>
                </span>
              )}
              {profile.phone && (
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{profile.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setAvatarModalOpen(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{profile.avatarUrl ? 'Change Photo' : 'Add Photo'}</span>
          </button>

          {profile.avatarUrl && (
            <button
              type="button"
              onClick={removeAvatar}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[var(--np-border)] hover:border-rose-500/40 text-xs font-semibold text-rose-500 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editable Personal & Workspace Information */}
        <section className="lg:col-span-7 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
              Personal &amp; Analyst Information
            </h2>
            <p className="text-xs text-[var(--np-text-muted)] mt-0.5">
              Update your profile details, contact information, and primary monitored subnet
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="set-name"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="set-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label
                  htmlFor="set-email"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="set-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label
                  htmlFor="set-phone"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Phone Number
                </label>
                <input
                  id="set-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm font-mono text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label
                  htmlFor="set-location"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Location
                </label>
                <input
                  id="set-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label
                  htmlFor="set-role"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Job Role
                </label>
                <input
                  id="set-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label
                  htmlFor="set-dept"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Department
                </label>
                <input
                  id="set-dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label
                  htmlFor="set-org"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Organization
                </label>
                <input
                  id="set-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label
                  htmlFor="set-network"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Monitored Network Label
                </label>
                <input
                  id="set-network"
                  type="text"
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="set-cidr"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Primary Subnet CIDR
                </label>
                <input
                  id="set-cidr"
                  type="text"
                  value={subnetCidr}
                  onChange={(e) => setSubnetCidr(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm font-mono text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="set-bio"
                  className="block text-xs font-medium text-[var(--np-text-secondary)] mb-1.5"
                >
                  Analyst Bio &amp; Focus
                </label>
                <textarea
                  id="set-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-sm text-[var(--np-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500/40 resize-none"
                />
              </div>
            </div>

            {profileError && (
              <p className="text-xs text-rose-500">{profileError}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>

              <button
                type="button"
                onClick={logoutToAuth}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[var(--np-border)] text-xs font-semibold text-rose-500 hover:bg-rose-500/10 inline-flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </form>
        </section>

        {/* Preferences + Supabase Integration */}
        <div className="lg:col-span-5 space-y-5">
          {/* Guardian Preferences */}
          <section className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
              Guardian Preferences
            </h2>

            <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--np-border-subtle)]">
              <div>
                <p className="text-sm font-medium text-[var(--np-text-primary)]">
                  Interface Theme
                </p>
                <p className="text-xs text-[var(--np-text-muted)]">
                  Switch between Obsidian Dark and Daylight Slate
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateSettings({
                    theme: settings.theme === 'dark' ? 'light' : 'dark',
                  })
                }
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[var(--np-border)] bg-[var(--np-surface-elevated)] text-xs font-semibold text-[var(--np-text-primary)] inline-flex items-center gap-2 cursor-pointer"
              >
                {settings.theme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4 text-sky-400" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--np-border-subtle)]">
              <div>
                <p className="text-sm font-medium text-[var(--np-text-primary)]">
                  Port Scan Sensitivity
                </p>
                <p className="text-xs text-[var(--np-text-muted)]">
                  Heuristic threshold for sweep alerts
                </p>
              </div>
              <select
                value={settings.portScanSensitivity}
                onChange={(e) =>
                  updateSettings({
                    portScanSensitivity: e.target.value as 'balanced' | 'strict' | 'permissive',
                  })
                }
                aria-label="Port scan sensitivity"
                className="min-h-[40px] px-3 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-xs font-medium text-[var(--np-text-primary)]"
              >
                <option value="strict">Strict</option>
                <option value="balanced">Balanced</option>
                <option value="permissive">Permissive</option>
              </select>
            </div>

            <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[var(--np-text-primary)]">
                  Auto-Quarantine Unknown Nodes
                </p>
                <p className="text-xs text-[var(--np-text-muted)]">
                  Move unverified MACs to VLAN 99 automatically
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoQuarantineUnknown}
                onChange={(e) =>
                  updateSettings({ autoQuarantineUnknown: e.target.checked })
                }
                className="w-5 h-5 accent-sky-500 cursor-pointer"
              />
            </label>
          </section>

          {/* Supabase Integration & Simulation Controls */}
          <section className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[var(--np-accent)]" />
                <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
                  Supabase Integration
                </h2>
              </div>
              <span
                className={`text-xs font-semibold ${
                  dataMode === 'supabase' ? 'text-emerald-500' : 'text-[var(--np-accent)]'
                }`}
              >
                {dataMode === 'supabase' ? 'Live Sync Active' : 'Local Workspace'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border-subtle)] space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[var(--np-text-muted)]">Project URL</span>
                <span className="font-mono text-[var(--np-text-primary)] truncate">
                  {integrationStatus.supabaseUrl}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[var(--np-text-muted)]">Database Connection</span>
                <span className="inline-flex items-center gap-1 font-medium text-[var(--np-text-primary)]">
                  {integrationStatus.supabaseConfigured ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <span>Pending Key</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[var(--np-text-muted)]">Schema Tables</span>
                <span className="font-medium text-[var(--np-text-primary)]">
                  {integrationStatus.tablesReady
                    ? integrationStatus.hasData
                      ? 'Ready & Seeded'
                      : 'Ready (Empty)'
                    : 'Pending SQL Setup'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleCopySchema}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-primary)] inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL</span>
              </button>

              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{seeding ? 'Seeding...' : 'Seed Data'}</span>
              </button>

              <button
                type="button"
                onClick={refreshSupabaseSnapshot}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-primary)] inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync</span>
              </button>
            </div>

            <div className="pt-3 border-t border-[var(--np-border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={injectSimulatedThreat}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-primary)] hover:border-sky-500/40 cursor-pointer"
              >
                Simulate Threat Event
              </button>
              <button
                type="button"
                onClick={resetDemoState}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-primary)] inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Baseline</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStage('splash-onboarding')}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-[var(--np-border)] text-xs font-medium text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)] cursor-pointer"
            >
              Replay Splash &amp; Onboarding Flow
            </button>
          </section>
        </div>
      </div>

      {/* Profile Picture Capture / Gallery / Preview / Remove Modal */}
      <AvatarCaptureModal
        open={avatarModalOpen}
        currentAvatar={profile.avatarUrl}
        userName={profile.fullName}
        onSave={updateAvatar}
        onRemove={removeAvatar}
        onClose={() => setAvatarModalOpen(false)}
      />
    </div>
  );
};
