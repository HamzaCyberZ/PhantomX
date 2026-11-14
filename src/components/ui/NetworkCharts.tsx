import React, { useState } from 'react';
import { TrafficPoint } from '../../types/network';

export const SecurityScoreArc: React.FC<{ score: number; size?: number }> = ({
  score,
  size = 152,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.75; // 270 degree gauge
  const totalArc = circumference * arcFraction;
  const filledArc = totalArc * (Math.max(0, Math.min(100, score)) / 100);

  const toneColor =
    score >= 85
      ? '#10B981'
      : score >= 68
        ? '#0EA5E9'
        : score >= 50
          ? '#F59E0B'
          : '#EF4444';

  const statusText =
    score >= 85
      ? 'Strong Posture'
      : score >= 68
        ? 'Guarded · Attention Needed'
        : 'Elevated Risk';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          role="img"
          aria-label={`Network Security Score ${score} out of 100`}
        >
          <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-slate-300/30 dark:text-slate-700/50"
              strokeWidth={strokeWidth}
              strokeDasharray={`${totalArc} ${circumference}`}
              strokeLinecap="round"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={toneColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${filledArc} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-3xl font-bold font-display tabular-nums text-[var(--np-text-primary)] leading-none">
            {score}
          </span>
          <span className="text-[11px] font-medium text-[var(--np-text-muted)] mt-1 tabular-nums">
            of 100 score
          </span>
        </div>
      </div>
      <span
        className="text-xs font-semibold -mt-2"
        style={{ color: toneColor }}
      >
        {statusText}
      </span>
    </div>
  );
};

export const TrafficActivityChart: React.FC<{
  data: TrafficPoint[];
  height?: number;
}> = ({ data, height = 210 }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 640;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 28;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const maxVal = Math.max(
    400,
    ...data.map((d) => Math.max(d.inboundMbps, d.outboundMbps, d.anomalousMbps)),
  );

  const getX = (idx: number) =>
    padLeft + (idx / Math.max(1, data.length - 1)) * innerW;
  const getY = (val: number) =>
    padTop + innerH - (val / maxVal) * innerH;

  const buildPath = (accessor: (d: TrafficPoint) => number) =>
    data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(accessor(d)).toFixed(1)}`)
      .join(' ');

  const inboundPath = buildPath((d) => d.inboundMbps);
  const outboundPath = buildPath((d) => d.outboundMbps);
  const anomalyPath = buildPath((d) => d.anomalousMbps);

  const inboundArea = `${inboundPath} L ${getX(data.length - 1).toFixed(1)} ${(
    padTop + innerH
  ).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  const yTicks = [0, Math.round(maxVal / 2), maxVal];
  const activePoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="w-full">
      {/* Legend + Active Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex items-center gap-4 text-[var(--np-text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-sky-400 inline-block" />
            <span>Inbound Mbps</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
            <span>Outbound Mbps</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-400 inline-block" />
            <span>Anomalous</span>
          </span>
        </div>

        <div className="font-mono text-[11px] tabular-nums text-[var(--np-text-secondary)]">
          {activePoint ? (
            <span>
              {activePoint.timeLabel} · In {activePoint.inboundMbps} · Out{' '}
              {activePoint.outboundMbps} · Anomaly {activePoint.anomalousMbps} Mbps
            </span>
          ) : (
            <span>Hover or tap chart points to inspect telemetry</span>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label="Network traffic activity chart over time"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="npInboundFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-400/15 dark:text-slate-600/30"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[var(--np-text-muted)] text-[10px] font-mono tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Area & Lines */}
          <path d={inboundArea} fill="url(#npInboundFill)" />
          <path
            d={inboundPath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d={outboundPath}
            fill="none"
            stroke="#10B981"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d={anomalyPath}
            fill="none"
            stroke="#F43F5E"
            strokeWidth="1.75"
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />

          {/* X Axis Labels + Interactive Columns */}
          {data.map((d, i) => {
            const x = getX(i);
            const isActive = hoverIndex === i;
            return (
              <g key={d.timeLabel}>
                {isActive && (
                  <>
                    <line
                      x1={x}
                      y1={padTop}
                      x2={x}
                      y2={padTop + innerH}
                      stroke="currentColor"
                      className="text-slate-400/50"
                      strokeWidth="1"
                    />
                    <circle cx={x} cy={getY(d.inboundMbps)} r="4" fill="#38BDF8" />
                    <circle cx={x} cy={getY(d.outboundMbps)} r="3.5" fill="#10B981" />
                    <circle cx={x} cy={getY(d.anomalousMbps)} r="3.5" fill="#F43F5E" />
                  </>
                )}
                <text
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-[var(--np-text-muted)] text-[10px] font-mono tabular-nums"
                >
                  {d.timeLabel}
                </text>
                <rect
                  x={x - innerW / (data.length * 2)}
                  y={padTop}
                  width={innerW / data.length}
                  height={innerH}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(i)}
                  onClick={() => setHoverIndex(i)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export const MiniSparkline: React.FC<{
  values: number[];
  tone?: 'accent' | 'warning' | 'danger';
}> = ({ values, tone = 'accent' }) => {
  const width = 104;
  const height = 28;
  const max = Math.max(10, ...values);
  const stroke =
    tone === 'danger' ? '#F43F5E' : tone === 'warning' ? '#F59E0B' : '#38BDF8';

  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * width;
      const y = height - 3 - (v / max) * (height - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const ScoreTrendChart: React.FC<{
  data: { day: string; score: number }[];
}> = ({ data }) => {
  const width = 520;
  const height = 160;
  const padX = 30;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const getX = (i: number) => padX + (i / Math.max(1, data.length - 1)) * innerW;
  const getY = (score: number) => padY + innerH - ((score - 40) / 60) * innerH;

  const line = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.score).toFixed(1)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="7-day security posture score trend">
      {[50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={padX}
            y1={getY(v)}
            x2={width - padX}
            y2={getY(v)}
            stroke="currentColor"
            className="text-slate-400/15 dark:text-slate-600/30"
            strokeDasharray="3 3"
          />
          <text
            x={padX - 6}
            y={getY(v) + 3}
            textAnchor="end"
            className="fill-[var(--np-text-muted)] text-[10px] font-mono tabular-nums"
          >
            {v}
          </text>
        </g>
      ))}
      <path d={line} fill="none" stroke="#38BDF8" strokeWidth="2.2" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={d.day}>
          <circle cx={getX(i)} cy={getY(d.score)} r="3.5" fill="#38BDF8" />
          <text
            x={getX(i)}
            y={height - 4}
            textAnchor="middle"
            className="fill-[var(--np-text-muted)] text-[10px] font-mono"
          >
            {d.day}
          </text>
        </g>
      ))}
    </svg>
  );
};
