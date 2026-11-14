import React, { useState } from 'react';
import { BrainCircuit, CheckCircle2, Play, Send, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BEHAVIOUR_BASELINE_COMPARISON } from '../../data/mockThreatIntel';
import { networkService } from '../../services/networkService';
import { DemoNoticeBanner } from '../ui/DemoNoticeBanner';
import { SeverityLabel } from '../ui/SemanticLabels';

const QUICK_PROMPTS = [
  'Which device poses the highest lateral movement risk right now?',
  'Summarize firewall rules to isolate unknown endpoints on VLAN 10 and 20.',
  'How do the active port scans relate to the DNS TXT tunnel alert?',
];

export const ThreatIntelView: React.FC = () => {
  const {
    threatVectors,
    devices,
    alerts,
    suspiciousFlows,
    portScans,
    securityScore,
    aiThreatBriefing,
    isRunningAiAnalysis,
    runAiThreatAnalysis,
    setActiveTab,
    pushToast,
  } = useApp();

  const [question, setQuestion] = useState('');
  const [askingAi, setAskingAi] = useState(false);
  const [qaHistory, setQaHistory] = useState<
    { question: string; answer: string }[]
  >([]);

  const handleInvestigate = async (promptText?: string) => {
    const query = (promptText ?? question).trim();
    if (!query || askingAi) return;
    setAskingAi(true);
    if (!promptText) setQuestion('');

    try {
      const contextSummary = {
        securityScore,
        devices: devices.map((d) => ({
          hostname: d.hostname,
          ip: d.ipAddress,
          vlan: d.vlan,
          trustStatus: d.trustStatus,
          riskScore: d.riskScore,
          openPorts: d.openPorts,
          anomaly: d.anomalySummary,
        })),
        openAlerts: alerts
          .filter((a) => a.status !== 'resolved' && a.status !== 'dismissed')
          .map((a) => ({
            title: a.title,
            severity: a.severity,
            category: a.category,
            sourceIp: a.sourceIp,
            deviceName: a.deviceName,
          })),
        portScans: portScans.map((s) => ({
          sourceDevice: s.sourceDevice,
          sourceIp: s.sourceIp,
          scanType: s.scanType,
          portsScanned: s.portsScanned,
          blocked: s.blocked,
        })),
        suspiciousFlows: suspiciousFlows.map((f) => ({
          sourceDevice: f.sourceDevice,
          destinationIp: f.destinationIp,
          port: f.port,
          protocol: f.protocol,
          mitigated: f.mitigated,
          reason: f.anomalyReason,
        })),
      };

      const res = await networkService.investigateWithAi(query, contextSummary);
      setQaHistory((prev) => [{ question: query, answer: res.answer }, ...prev]);
    } catch (err: any) {
      pushToast(err?.message || 'Unable to run AI investigation query.', 'warning');
    } finally {
      setAskingAi(false);
    }
  };

  const openCount = alerts.filter((a) => a.status === 'open').length;
  const flaggedNodes = devices.filter((d) => d.trustStatus !== 'trusted').length;

  return (
    <div className="space-y-6">
      <DemoNoticeBanner compact />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--np-text-primary)]">
            AI Threat Intelligence Dashboard
          </h1>
          <p className="text-sm text-[var(--np-text-secondary)] mt-1">
            Live Gemini AI behavioural correlation, attack-chain synthesis, and interactive threat investigation.
          </p>
        </div>

        <button
          type="button"
          onClick={runAiThreatAnalysis}
          disabled={isRunningAiAnalysis}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-70 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
          <span>
            {isRunningAiAnalysis
              ? 'Running Gemini AI Analysis...'
              : 'Run AI Deep Analysis'}
          </span>
        </button>
      </div>

      {/* Live AI Briefing + Interactive Investigation Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <section className="lg:col-span-6 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--np-accent-soft)] flex items-center justify-center text-[var(--np-accent)]">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
                    Gemini AI Threat Synthesis
                  </h2>
                  <p className="text-xs text-[var(--np-text-muted)]">
                    {aiThreatBriefing
                      ? `Updated ${aiThreatBriefing.generatedAt} · Confidence ${aiThreatBriefing.confidenceScore}%`
                      : 'Server-side @google/genai · gemini-4-hydrogen'}
                  </p>
                </div>
              </div>
            </div>

            {aiThreatBriefing ? (
              <div className="space-y-3 text-xs leading-relaxed">
                <p className="text-sm text-[var(--np-text-primary)]">
                  {aiThreatBriefing.executiveSummary}
                </p>
                <div className="p-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border-subtle)] space-y-1.5">
                  <p className="font-semibold text-amber-500">
                    Top Priority: {aiThreatBriefing.topPriority}
                  </p>
                  <p className="text-[var(--np-text-secondary)]">
                    <strong className="text-[var(--np-text-primary)]">Attack Chain:</strong>{' '}
                    {aiThreatBriefing.attackChain}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-[var(--np-text-primary)]">
                    Immediate Containment Steps
                  </p>
                  {aiThreatBriefing.immediateActions.map((act) => (
                    <div key={act} className="flex items-start gap-2 text-[var(--np-text-secondary)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--np-text-secondary)]">
                Current telemetry tracks{' '}
                <strong className="text-[var(--np-text-primary)]">
                  {flaggedNodes} non-trusted endpoint{flaggedNodes === 1 ? '' : 's'}
                </strong>{' '}
                and{' '}
                <strong className="text-[var(--np-text-primary)]">
                  {openCount} open alert{openCount === 1 ? '' : 's'}
                </strong>
                . Click <strong>Run AI Deep Analysis</strong> above to correlate active port sweeps, DNS anomalies, and unknown hardware via Gemini AI.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--np-border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[var(--np-text-muted)]">
              Grounded in live device &amp; alert state
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('risk-assessment')}
              className="text-xs font-semibold text-[var(--np-accent)] hover:underline whitespace-nowrap cursor-pointer"
            >
              Open Risk Remediation Plan
            </button>
          </div>
        </section>

        {/* Interactive AI Investigation Console */}
        <section className="lg:col-span-6 bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--np-accent)]" />
              <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
                AI Threat Investigation Console
              </h2>
            </div>
            <p className="text-xs text-[var(--np-text-secondary)]">
              Ask questions about active hosts, suspicious ports, or mitigation rules grounded in your current telemetry.
            </p>

            {/* Quick investigation prompts */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => handleInvestigate(qp)}
                  disabled={askingAi}
                  className="text-left px-3 py-1.5 rounded-lg bg-[var(--np-surface-elevated)] border border-[var(--np-border-subtle)] hover:border-sky-500/40 text-[11px] text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)] transition-colors cursor-pointer"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Q&A Output */}
          <div className="flex-1 min-h-[140px] max-h-[240px] overflow-y-auto space-y-3 pr-1">
            {qaHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-xs text-[var(--np-text-muted)] py-6">
                Select a prompt above or enter a custom security question below.
              </div>
            ) : (
              qaHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border-subtle)] space-y-1.5 text-xs"
                >
                  <p className="font-semibold text-[var(--np-accent)]">
                    Q: {item.question}
                  </p>
                  <p className="text-[var(--np-text-secondary)] whitespace-pre-wrap leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInvestigate();
            }}
            className="flex items-center gap-2 pt-2 border-t border-[var(--np-border-subtle)]"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about an IP, port scan, or containment step..."
              aria-label="Ask AI threat analyst"
              className="flex-1 min-h-[42px] px-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] text-xs text-[var(--np-text-primary)] placeholder:text-[var(--np-text-muted)] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
            <button
              type="submit"
              disabled={askingAi || !question.trim()}
              aria-label="Send investigation question"
              className="min-h-[42px] px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{askingAi ? 'Thinking...' : 'Ask'}</span>
            </button>
          </form>
        </section>
      </div>

      {/* Baseline vs Observed Deviation */}
      <section className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
            30-Day Baseline vs Observed Behaviour
          </h2>
          <p className="text-xs text-[var(--np-text-muted)] mt-0.5">
            Key behavioural indicators deviating from established network norms
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BEHAVIOUR_BASELINE_COMPARISON.map((row) => {
            const ratio = row.baseline > 0 ? (row.observed / row.baseline).toFixed(1) : 'New';
            return (
              <div
                key={row.metric}
                className="p-4 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border-subtle)] space-y-2"
              >
                <p className="text-xs font-medium text-[var(--np-text-secondary)]">
                  {row.metric}
                </p>
                <p className="text-2xl font-bold font-mono tabular-nums text-[var(--np-text-primary)]">
                  {row.observed}{' '}
                  <span className="text-xs font-normal text-[var(--np-text-muted)]">
                    {row.unit}
                  </span>
                </p>
                <p className="text-[11px] font-mono tabular-nums text-amber-500">
                  Baseline {row.baseline} {row.unit} · {ratio === 'New' ? 'Unauthorized' : `${ratio}x`}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Threat Vectors */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
          Identified Threat Vectors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {threatVectors.map((vec) => (
            <article
              key={vec.id}
              className="bg-[var(--np-surface)] border border-[var(--np-border)] rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <SeverityLabel severity={vec.severity} />
                <span className="font-mono text-[var(--np-text-muted)]">{vec.tactic}</span>
              </div>

              <h3 className="text-base font-semibold text-[var(--np-text-primary)]">
                {vec.name}
              </h3>

              <p className="text-xs leading-relaxed text-[var(--np-text-secondary)]">
                {vec.description}
              </p>

              <div className="p-3.5 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border-subtle)] space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--np-accent)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Correlation Note</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--np-text-secondary)]">
                  {vec.simulatedInsight}
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs font-mono tabular-nums text-[var(--np-text-muted)]">
                <span>Confidence: {vec.confidence}%</span>
                <span>+{vec.baselineDeviationPct}% vs baseline</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
