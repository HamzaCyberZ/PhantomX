import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Radar, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SafeImage } from '../ui/SafeImage';

const ONBOARDING_SLIDES = [
  {
    index: '01',
    title: 'Continuous Behavioural Visibility',
    description:
      'Monitor every connected endpoint, baseline traffic rhythm, and bandwidth shift across corporate and IoT subnets from a single unified guardian.',
    highlights: [
      'Real-time device fingerprinting and OUI vendor lookup',
      'Outbound vs inbound telemetry anomaly detection',
      'Clean separation of trusted, unknown, and quarantined nodes',
    ],
    Icon: Radar,
  },
  {
    index: '02',
    title: 'Instant Port Scan & Unknown Node Defence',
    description:
      'Surface unrecognized hardware joining your VLAN and flag stealth TCP SYN sweeps, DNS tunneling, and lateral SMB probes before escalation.',
    highlights: [
      'Dedicated Unknown Device verification queue',
      'Port-by-port sweep detection with one-tap mitigation',
      'AI-powered root-cause explanations for rapid triage',
    ],
    Icon: ShieldAlert,
  },
  {
    index: '03',
    title: 'Actionable Risk Scoring & Audit Exports',
    description:
      'Model remediation impact on your Network Security Score in real time and export structured JSON, CSV, or Markdown compliance reports.',
    highlights: [
      'Interactive remediation checklist with live posture recalculation',
      'AI Threat Investigation Console grounded in live telemetry',
      'Persistent workspace backed by Supabase',
    ],
    Icon: ShieldCheck,
  },
];

export const SplashOnboarding: React.FC = () => {
  const { setStage, loginDemoUser } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  const current = ONBOARDING_SLIDES[step];
  const SlideIcon = current.Icon;

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[var(--np-canvas)] flex flex-col items-center justify-center px-6 py-12">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[var(--np-border)] shadow-xl mb-6">
            <SafeImage
              src="/src/assets/images/netphantom_emblem_1794683835065.jpg"
              alt="PhantomX Emblem"
              className="w-full h-full object-cover"
              fallbackLabel="PhantomX"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--np-text-primary)]">
            PhantomX
          </h1>
          <p className="text-sm text-[var(--np-text-secondary)] mt-2">
            Intelligent Network Behaviour Guardian
          </p>
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSplash(false)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--np-canvas)] flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-10">
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-[var(--np-border)] shrink-0">
            <SafeImage
              src="/src/assets/images/netphantom_emblem_1794683835065.jpg"
              alt="PhantomX"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-[var(--np-text-primary)] whitespace-nowrap">
            PhantomX
          </span>
        </div>

        <button
          type="button"
          onClick={() => setStage('auth')}
          className="min-h-[44px] px-3 text-sm font-medium text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)] transition-colors whitespace-nowrap cursor-pointer"
        >
          Skip to Sign In
        </button>
      </header>

      <main className="max-w-5xl w-full mx-auto my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-6 sm:p-10">
          <div className="lg:col-span-5 flex flex-col justify-between gap-6 pb-6 lg:pb-0 lg:pr-8 border-b lg:border-b-0 lg:border-r border-[var(--np-border-subtle)]">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[var(--np-border)]">
                <SafeImage
                  src="/src/assets/images/netphantom_emblem_1794683835065.jpg"
                  alt="PhantomX Shield Lattice"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--np-accent)]">
                  Behavioural Defence Suite
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--np-text-primary)] mt-1">
                  Intelligent Network Behaviour Guardian
                </h2>
              </div>
              <p className="text-sm text-[var(--np-text-secondary)] leading-relaxed">
                Unify device inventory, port scan detection, AI threat correlation, and posture audits in one responsive console.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {ONBOARDING_SLIDES.map((s, idx) => (
                <button
                  key={s.index}
                  type="button"
                  onClick={() => setStep(idx)}
                  aria-label={`Onboarding step ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === step
                      ? 'w-8 bg-sky-500'
                      : 'w-2.5 bg-slate-500/30 hover:bg-slate-500/50'
                  }`}
                />
              ))}
              <span className="ml-auto text-xs font-mono tabular-nums text-[var(--np-text-muted)]">
                {step + 1} / {ONBOARDING_SLIDES.length}
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--np-accent-soft)] flex items-center justify-center text-[var(--np-accent)]">
                  <SlideIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono tabular-nums text-[var(--np-text-muted)]">
                  Step {current.index}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-[var(--np-text-primary)] leading-tight">
                {current.title}
              </h3>

              <p className="text-sm sm:text-base text-[var(--np-text-secondary)] leading-relaxed">
                {current.description}
              </p>

              <ul className="space-y-3 pt-2">
                {current.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-[var(--np-text-primary)]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[var(--np-border-subtle)]">
              <button
                type="button"
                onClick={() => loginDemoUser()}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[var(--np-border)] text-sm font-medium text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)] hover:bg-[var(--np-surface-elevated)] transition-colors whitespace-nowrap cursor-pointer"
              >
                Enter Dashboard
              </button>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)] transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}

                {step < ONBOARDING_SLIDES.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStage('auth')}
                    className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-[var(--np-text-muted)]">
        PhantomX · Intelligent Network Behaviour Guardian
      </footer>
    </div>
  );
};
