-- NetPhantom AI — Supabase PostgreSQL Schema
-- Run this script in your Supabase Dashboard -> SQL Editor

create table if not exists public.devices (
  id text primary key,
  hostname text not null,
  ip_address text not null,
  mac_address text not null,
  vendor text not null,
  category text not null,
  trust_status text not null check (trust_status in ('trusted', 'unknown', 'suspicious', 'quarantined')),
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
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
  status text not null check (status in ('open', 'investigating', 'resolved', 'dismissed')),
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
  risk_level text not null check (risk_level in ('critical', 'high', 'medium', 'low')),
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
  severity text not null check (severity in ('critical', 'high', 'medium', 'low')),
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
);
