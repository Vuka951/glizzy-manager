'use client';

import { useState } from 'react';
import { GAMES_UI } from '@/data/games/locale';
import CrownIcon from '@/components/icons/CrownIcon';
import { linePath, type ChartSeries } from '@/lib/utils/reportCharts';

const R = GAMES_UI.career.report;

const FULL_SIZE = { width: 820, height: 340 };
const COMPACT_SIZE = { width: 576, height: 300 };
const PAD = { top: 14, right: 130, bottom: 30, left: 40 };
const LABEL_GAP = 15;

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
  emerald: 'stroke-emerald-700',
  amber: 'stroke-amber-600',
  sky: 'stroke-sky-700',
  violet: 'stroke-violet-700',
  rose: 'stroke-rose-700',
  orange: 'stroke-orange-700',
  teal: 'stroke-teal-600',
  fuchsia: 'stroke-fuchsia-700',
};
const FILL: Record<LineTone, string> = {
  emerald: 'fill-emerald-700',
  amber: 'fill-amber-600',
  sky: 'fill-sky-700',
  violet: 'fill-violet-700',
  rose: 'fill-rose-700',
  orange: 'fill-orange-700',
  teal: 'fill-teal-600',
  fuchsia: 'fill-fuchsia-700',
};

// One line per character, printed on the paper. The picked ones wear their
// color and their name, the rest stay as gray context, and hovering or tapping
// any gray line lifts it out in black and names it under the chart
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
  compact = false,
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
  // Drawn close to its real size in a narrow sheet, so its type stays readable
  compact?: boolean;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hovered ?? pinned;

  const { width: WIDTH, height: HEIGHT } = compact ? COMPACT_SIZE : FULL_SIZE;
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
      ? 'stroke-slate-900'
      : slug in tones
        ? STROKE[tones[slug]]
        : 'stroke-slate-400';
  const fillOf = (slug: string) =>
    slug in tones ? FILL[tones[slug]] : 'fill-slate-900';
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
                  className="stroke-slate-300"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y(tick) + 3}
                  textAnchor="end"
                  className="fill-slate-600 font-sign text-[13px] font-semibold"
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
                  className="stroke-red-700"
                  strokeWidth={1}
                />
                <svg
                  x={PAD.left + 4}
                  y={y(goal) - 15}
                  width={14}
                  height={14}
                  className="text-red-700"
                >
                  <title>{R.legend.goal}</title>
                  <CrownIcon className="h-full w-full" />
                </svg>
              </g>
            )}
            {xLabels.map((label, i) =>
              label ? (
                <text
                  key={i}
                  x={x(i)}
                  y={HEIGHT - 10}
                  textAnchor={i === 0 ? 'start' : 'middle'}
                  className="fill-slate-600 font-sign text-[13px] font-semibold uppercase tracking-[0.06em]"
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
                          className={`${fillOf(line.slug)} stroke-[#f1e8d3]`}
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
                      className="fill-slate-900 font-sign text-[14px] font-bold"
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
      <p className="min-h-4 text-right font-serif text-[12px] italic text-slate-600">
        {activeLine && caption(activeLine)}
      </p>
    </div>
  );
}
