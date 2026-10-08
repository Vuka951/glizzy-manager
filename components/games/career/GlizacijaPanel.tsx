'use client';

import { useState } from 'react';
import GlizacijaChart from '@/components/games/career/GlizacijaChart';
import GlizacijaInfoPanel from '@/components/games/career/GlizacijaInfoPanel';
import InfoButton from '@/components/games/career/InfoButton';
import SponsorModal from '@/components/games/career/SponsorModal';
import { SEASON_COUNT } from '@/data/games/careerSeasons';
import { GAMES_UI } from '@/data/games/locale';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';
import { gliziPricePct } from '@/lib/utils/careerSeasonPrices';
import { fmt, signedPct } from '@/lib/utils/format';

const G = GAMES_UI.career.offseason.glizacija;

type Range = 'y1' | 'y2' | 'y5' | 'all';
const RANGE_WINDOWS: Record<Range, number> = {
  y1: SEASON_COUNT,
  y2: SEASON_COUNT * 2,
  y5: SEASON_COUNT * 5,
  all: Number.POSITIVE_INFINITY,
};
const RANGES: Range[] = ['y1', 'y2', 'y5', 'all'];

function lastStep(history: number[]): number | null {
  for (let i = history.length - 1; i > 0; i--) {
    if (history[i] !== history[i - 1]) {
      return Math.round((history[i] / history[i - 1] - 1) * 100);
    }
  }
  return null;
}

function toneClass(value: number): string {
  return value > 0
    ? 'text-red-300'
    : value < 0
      ? 'text-emerald-300'
      : 'text-slate-300';
}

// The market desk: the index against the opening price in big type, the
// range picker, the chart over that range and the numbers a trader would
// want under it. Up is red here because up means everything costs more
export default function GlizacijaPanel({
  career,
  sponsorId = null,
}: {
  career: SavedCareer;
  sponsorId?: SponsorId | null;
}) {
  const [range, setRange] = useState<Range>('y2');
  const [infoOpen, setInfoOpen] = useState(false);
  const history = career.gliziPriceHistory ?? [];
  const full = history.length > 0 ? history : [1];
  const windows = RANGE_WINDOWS[range];
  const start = Math.max(0, full.length - windows);
  const shown = full.slice(start);
  const pct = gliziPricePct(career);
  const first = shown[0];
  const last = shown[shown.length - 1];
  const rangePct = Math.round((last / first - 1) * 100);
  const high = Math.round((Math.max(...shown) - 1) * 100);
  const low = Math.round((Math.min(...shown) - 1) * 100);
  // The last window that printed a story, however many quiet ones followed
  const lastMove = lastStep(full);

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col">
          <span
            className={`font-mono text-3xl font-black leading-none tabular-nums ${toneClass(pct)}`}
          >
            {signedPct(pct)}
          </span>
          <span className="mt-1 text-[10px] text-slate-500">{G.vsStart}</span>
        </div>
        <span className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
              rangePct > 0
                ? 'border-red-400/40 bg-red-500/10 text-red-300'
                : rangePct < 0
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 text-slate-400'
            }`}
          >
            {fmt(G.rangeChange, { pct: signedPct(rangePct) })}
          </span>
          <InfoButton label={G.infoTitle} onClick={() => setInfoOpen(true)} />
        </span>
      </div>
      {infoOpen && (
        <SponsorModal
          sponsorId={sponsorId}
          title={G.infoTitle}
          onClose={() => setInfoOpen(false)}
        >
          <GlizacijaInfoPanel career={career} />
        </SponsorModal>
      )}
      <div
        role="tablist"
        className="grid grid-cols-4 gap-0.5 rounded-full border border-sky-200/10 bg-slate-900/60 p-0.5"
      >
        {RANGES.map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={range === id}
            onClick={() => setRange(id)}
            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest transition ${
              range === id
                ? 'bg-sky-200/15 text-sky-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {G.ranges[id]}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-sky-200/10 bg-slate-900/40 p-2">
        <GlizacijaChart history={shown} startWindow={start} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: G.high, value: signedPct(high), tone: toneClass(high) },
          { label: G.low, value: signedPct(low), tone: toneClass(low) },
          {
            label: G.lastMove,
            value: lastMove ? signedPct(lastMove) : '-',
            tone: lastMove ? toneClass(lastMove) : 'text-slate-500',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-0.5 rounded-xl border border-sky-200/10 bg-slate-900/40 px-3 py-2"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {stat.label}
            </span>
            <span
              className={`mt-auto font-mono text-sm font-black tabular-nums ${stat.tone}`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
