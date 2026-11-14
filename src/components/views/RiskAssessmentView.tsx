import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DemoNoticeBanner } from '../ui/DemoNoticeBanner';
import { SecurityScoreArc } from '../ui/NetworkCharts';

export const RiskAssessmentView: React.FC = () => {
  const {
    riskFactors,
    toggleRiskFactorRemediation,
    securityScore,
    devices,
    alerts,
  } = useApp();

  const remediatedCount = riskFactors.filter((r) => r.remediated).length;
  const potentialGain = riskFactors
    .filter((r) => !r.remediated)
    .reduce((acc, r) => acc + Math.round(r.impactPoints * 0.55), 0);

  return (
    <div className="space-y-6">
      <DemoNoticeBanner compact />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--np-text-primary)]">
          Network Risk Assessment
        </h1>
        <p className="text-sm text-[var(--np-text-secondary)] mt-1">
          Evaluate posture across five security domains and toggle simulated remediations to model score improvements.
        </p>
      </div>

      {/* Top Split: Live Score + Domain Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <section className="lg:col-span-4 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-6 flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
              Projected Security Score
            </h2>
            <p className="text-xs text-[var(--np-text-muted)] mt-0.5">
              Updates live as controls are applied
            </p>
          </div>

          <SecurityScoreArc score={securityScore} size={168} />

          <div className="pt-4 border-t border-[var(--np-border-subtle)] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--np-text-secondary)]">Controls Remediated</span>
              <span className="font-mono tabular-nums font-semibold text-[var(--np-text-primary)]">
                {remediatedCount} / {riskFactors.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--np-text-secondary)]">Remaining Gain Available</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-500">
                +{potentialGain} pts
              </span>
            </div>
          </div>
        </section>

        {/* Category Score Bars */}
        <section className="lg:col-span-8 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
                Domain Risk Posture
              </h2>
              <p className="text-xs text-[var(--np-text-muted)] mt-0.5">
                Weighted assessment across {devices.length} endpoints and {alerts.length} recorded events
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {riskFactors.map((factor) => {
              const effectiveScore = factor.remediated
                ? Math.min(98, factor.currentScore + factor.impactPoints * 2)
                : factor.currentScore;
              const barColor =
                effectiveScore >= 85
                  ? 'bg-emerald-500'
                  : effectiveScore >= 65
                    ? 'bg-sky-500'
                    : 'bg-amber-500';
              return (
                <div key={factor.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--np-text-primary)]">
                      {factor.category}
                      <span className="text-[var(--np-text-muted)] font-normal ml-2">
                        Weight {Math.round(factor.weight * 100)}%
                      </span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[var(--np-text-primary)]">
                      {effectiveScore}/100
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-500/15 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${effectiveScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Interactive What-If Remediation Checklist */}
      <section className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--np-border-subtle)]">
          <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
            Interactive Remediation Checklist
          </h2>
          <p className="text-xs text-[var(--np-text-muted)] mt-0.5">
            Toggle items below to simulate policy hardening impact
          </p>
        </div>

        <div className="divide-y divide-[var(--np-border-subtle)]">
          {riskFactors.map((factor) => (
            <button
              key={factor.id}
              type="button"
              onClick={() => toggleRiskFactorRemediation(factor.id)}
              className="w-full p-5 sm:px-6 text-left hover:bg-[var(--np-surface-elevated)]/60 transition-colors flex items-start gap-4 cursor-pointer"
            >
              <div className="pt-0.5 shrink-0">
                {factor.remediated ? (
                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Square className="w-5 h-5 text-[var(--np-text-muted)]" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      factor.remediated
                        ? 'line-through text-[var(--np-text-muted)]'
                        : 'text-[var(--np-text-primary)]'
                    }`}
                  >
                    {factor.title}
                  </span>
                  <span className="text-xs font-mono tabular-nums font-semibold text-emerald-500">
                    {factor.remediated ? 'Applied' : `+${Math.round(factor.impactPoints * 0.55)} pts`}
                  </span>
                </div>
                <p className="text-xs text-[var(--np-text-secondary)]">
                  {factor.description}
                </p>
                <p className="text-xs text-[var(--np-accent)] pt-0.5">
                  Action: {factor.remediationStep}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
