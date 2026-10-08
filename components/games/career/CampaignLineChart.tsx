'use client';

import { useState } from 'react';
import { GAMES_UI } from '@/data/games/locale';
import { linePath, type ChartSeries } from '@/lib/utils/reportCharts';

const R = GAMES_UI.career.report;

const WIDTH = 820;
const HEIGHT = 340;
const PAD = { top: 14, right: 120, bottom: 30, left: 40 };
const LABEL_GAP = 13;

export type LineTone =
  | 'emerald'
  | 'amber'
  | 'sky'
  | 'violet'
  | 'rose'
  | 'orange'
  | 'teal'
  | 'fuchsia';

const STROKE: Record<LineTone, string> = {
  emerald: 'stroke-emerald-600',
  amber: 'stroke-amber-600',
  sky: 'stroke-sky-600',
  violet: 'stroke-violet-600',
  rose: 'stroke-rose-600',
  orange: 'stroke-orange-600',
  teal: 'stroke-teal-600',
  fuchsia: 'stroke-fuchsia-600',
};
const FILL: Record<LineTone, string> = {
  emerald: 'fill-emerald-600',
  amber: 'fill-amber-600',
  sky: 'fill-sky-600',
  violet: 'fill-violet-600',
  rose: 'fill-rose-600',
  orange: 'fill-orange-600',
  teal: 'fill-teal-600',
  fuchsia: 'fill-fuchsia-600',
};
// The same chart printed on newspaper stock: ink on paper instead of light
// on the dark card
const PAPER_STROKE: Record<LineTone, string> = {
  emerald: 'stroke-emerald-700',
  amber: 'stroke-amber-600',
  sky: 'stroke-sky-700',
  violet: 'stroke-violet-700',
  rose: 'stroke-rose-700',
  orange: 'stroke-orange-700',
  teal: 'stroke-teal-700',
  fuchsia: 'stroke-fuchsia-700',
};
const PAPER_FILL: Record<LineTone, string> = {
  emerald: 'fill-emerald-700',
  amber: 'fill-amber-600',
  sky: 'fill-sky-700',
  violet: 'fill-violet-700',
  rose: 'fill-rose-700',
  orange: 'fill-orange-700',
  teal: 'fill-teal-700',
  fuchsia: 'fill-fuchsia-700',
};

// One line per character. The picked ones wear their color and their name,
// the rest stay as gray context, and hovering or tapping any gray line
// lifts it out in white and names it under the chart
export default function CampaignLineChart({
  series,
  xLabels,
  yMin,
  yMax,
  yTicks,
  invert = false,
  goal,
  tones,
  caption,
  paper = false,
}: {
  series: ChartSeries[];
  xLabels: string[];
  yMin: number;
  yMax: number;
  yTicks: number[];
  invert?: boolean;
  goal?: number;
  tones: Record<string, LineTone>;
  caption: (line: ChartSeries) => string;
  paper?: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hovered ?? pinned;

  const count = Math.max(1, xLabels.length);
  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (count === 1 ? innerWidth / 2 : (i / (count - 1)) * innerWidth);
  const y = (value: number) => {
    const t = (value - yMin) / Math.max(1, yMax - yMin);
    return PAD.top + (invert ? t : 1 - t) * innerHeight;
  };

  const isLit = (slug: string) => slug === active || slug in tones;
  const strokeOf = (slug: string) =>
    slug === active && !(slug in tones)
      ? paper
        ? 'stroke-slate-900'
        : 'stroke-slate-200'
      : slug in tones
        ? (paper ? PAPER_STROKE : STROKE)[tones[slug]]
        : paper
          ? 'stroke-slate-400'
          : 'stroke-slate-600';
  const fillOf = (slug: string) =>
    slug in tones
      ? (paper ? PAPER_FILL : FILL)[tones[slug]]
      : paper
        ? 'fill-slate-900'
        : 'fill-slate-200';
  const ink = {
    grid: paper ? 'stroke-slate-300' : 'stroke-slate-700',
    tick: paper ? 'fill-slate-600' : 'fill-slate-500',
    goalLine: paper ? 'stroke-red-700' : 'stroke-amber-600',
    goalText: paper ? 'fill-red-800' : 'fill-amber-500',
    point: paper ? 'stroke-amber-50' : 'stroke-slate-900',
    name: paper ? 'fill-slate-900' : 'fill-slate-200',
    caption: paper ? 'text-slate-600' : 'text-slate-300',
  };
  const ordered = [
    ...series.filter((s) => !isLit(s.slug)),
    ...series.filter((s) => isLit(s.slug) && s.slug !== active),
    ...series.filter((s) => s.slug === active),
  ];
  const activeLine = series.find((s) => s.slug === active) ?? null;
  const lastIndex = (line: ChartSeries) => {
    for (let i = line.values.length - 1; i >= 0; i--) {
      if (line.values[i] !== null) return i;
    }
    return -1;
  };
  // Lit lines that finish close together get their names nudged apart
  const labelY = new Map<string, number>();
  const litEnds = ordered
    .filter((line) => isLit(line.slug) && lastIndex(line) >= 0)
    .map((line) => ({
      slug: line.slug,
      y: y(line.values[lastIndex(line)] as number),
    }))
    .sort((a, b) => a.y - b.y);
  litEnds.forEach((end, i) => {
    const prev =
      i > 0 ? (labelY.get(litEnds[i - 1].slug) as number) : -Infinity;
    labelY.set(end.slug, Math.max(end.y, prev + LABEL_GAP));
  });

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[36rem]">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-auto w-full"
            role="img"
          >
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y(tick)}
                  y2={y(tick)}
                  className={ink.grid}
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y(tick) + 3}
                  textAnchor="end"
                  className={`${ink.tick} font-mono text-[10px]`}
                >
                  {tick}
                </text>
              </g>
            ))}
            {goal !== undefined && goal >= yMin && goal <= yMax && (
              <g>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={y(goal)}
                  y2={y(goal)}
                  className={ink.goalLine}
                  strokeWidth={1}
                />
                <text
                  x={WIDTH - PAD.right + 6}
                  y={y(goal) + 3}
                  className={`${ink.goalText} text-[10px] font-bold uppercase tracking-widest`}
                >
                  {R.legend.goal}
                </text>
              </g>
            )}
            {xLabels.map((label, i) =>
              label ? (
                <text
                  key={i}
                  x={x(i)}
                  y={HEIGHT - 10}
                  textAnchor={i === 0 ? 'start' : 'middle'}
                  className={`${ink.tick} text-[10px] font-semibold uppercase tracking-widest`}
                >
                  {label}
                </text>
              ) : null,
            )}
            {ordered.map((line) => {
              const d = linePath(line.values, x, y);
              if (!d) return null;
              const lit = isLit(line.slug);
              const end = lastIndex(line);
              return (
                <g key={line.slug}>
                  <path
                    d={d}
                    fill="none"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className={`${strokeOf(line.slug)} ${lit ? '' : 'opacity-40'}`}
                  />
                  {lit &&
                    line.values.map((value, i) =>
                      value === null ? null : (
                        <circle
                          key={i}
                          cx={x(i)}
                          cy={y(value)}
                          r={4}
                          strokeWidth={2}
                          className={`${fillOf(line.slug)} ${ink.point}`}
                        />
                      ),
                    )}
                  {lit && end >= 0 && (
                    <text
                      x={x(end) + 9}
                      y={
                        (labelY.get(line.slug) ??
                          y(line.values[end] as number)) + 3.5
                      }
                      className={`${ink.name} text-[10px] font-bold`}
                    >
                      {line.name}
                    </text>
                  )}
                  <path
                    d={d}
                    fill="none"
                    strokeWidth={16}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="cursor-pointer stroke-transparent"
                    onMouseEnter={() => setHovered(line.slug)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() =>
                      setPinned((p) => (p === line.slug ? null : line.slug))
                    }
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <p className={`text-right text-[10px] font-semibold ${ink.caption}`}>
        {activeLine ? caption(activeLine) : R.hoverHint}
      </p>
    </div>
  );
}
