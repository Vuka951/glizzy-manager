'use client';

import { useState } from 'react';
import CareerToggle from '@/components/games/career/CareerToggle';
import GlizzflationBetDesk, {
  type GlizzyBetTicket,
} from '@/components/games/career/GlizzflationBetDesk';
import GlizacijaChart from '@/components/games/career/GlizacijaChart';
import TrendIcon from '@/components/icons/TrendIcon';
import { glizzyCallOf } from '@/lib/utils/careerGlizzflationBets';
import GlizacijaInfoPanel from '@/components/games/career/GlizacijaInfoPanel';
import InfoButton from '@/components/games/career/InfoButton';
import SponsorModal from '@/components/games/career/SponsorModal';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import type { GlizzyCall } from '@/data/games/careerGlizzflationBets';
import { SEASON_COUNT } from '@/data/games/careerSeasons';
import { GAMES_UI } from '@/data/games/locale';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';
import { gliziPricePct } from '@/lib/utils/careerSeasonPrices';
import { fmt, signedPct } from '@/lib/utils/format';

const G = GAMES_UI.career.offseason.glizacija;
const BET = GAMES_UI.career.offseason.glizzflationBet;

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
    ? 'text-[#fca5a5]'
    : value < 0
      ? 'text-[#86efac]'
      : 'text-[#f1f5f9]';
}

// The exchange's slate: the index against the opening price chalked big, the
// chart over the picked range and the numbers a trader would want under it, on
// a blackboard with the range keys on its ledge. Under it the bet window's
// slips. Up is red chalk here because up means everything costs more
export default function GlizacijaPanel({
  career,
  sponsorId = null,
  onBet,
  onCancelBet,
  otherBets,
}: {
  career: SavedCareer;
  sponsorId?: SponsorId | null;
  onBet: (call: GlizzyCall, stake: number) => void;
  onCancelBet: () => void;
  otherBets?: GlizzyBetTicket[];
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
      <div
        className="flex flex-col gap-2 rounded-[5px] bg-[#1b2622] bg-[radial-gradient(ellipse_at_30%_20%,rgb(255_255_255/0.07),transparent_60%)] p-3 shadow-[inset_0_2px_6px_rgb(0_0_0/0.75),0_1px_0_rgb(255_255_255/0.07)]"
      >
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span
              className={`flex items-center gap-2 font-sign text-[42px] font-bold leading-none tabular-nums ${toneClass(pct)}`}
            >
              <TrendIcon direction={glizzyCallOf(pct)} className="h-7 w-7" />
              {signedPct(pct)}
            </span>
            <span className="mt-0.5 font-sign text-[13px] font-semibold uppercase tracking-[0.05em] text-[#f1f5f9]/75">
              {G.vsStart}
            </span>
          </div>
          <span className="flex items-center gap-2">
            <span
              className={`-rotate-1 rounded-[3px] border-[1.5px] border-current px-1.5 font-sign text-[15px] font-bold tabular-nums ${toneClass(rangePct)}`}
            >
              {fmt(G.rangeChange, { pct: signedPct(rangePct) })}
            </span>
            <InfoButton label={G.infoTitle} onClick={() => setInfoOpen(true)} />
          </span>
        </div>
        <GlizacijaChart history={shown} startWindow={start} />
        <div className="grid grid-cols-3 divide-x divide-[#f1f5f9]/20 border-t border-[#f1f5f9]/20 pt-2">
          {[
            {
              label: G.high,
              value: signedPct(high),
              tone: toneClass(high),
              trend: high,
            },
            {
              label: G.low,
              value: signedPct(low),
              tone: toneClass(low),
              trend: low,
            },
            {
              label: G.lastMove,
              value: signedPct(lastMove ?? 0),
              tone: lastMove ? toneClass(lastMove) : 'text-[#f1f5f9]/75',
              trend: lastMove,
            },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5 px-2 first:pl-0">
              <span className="font-sign text-[13px] font-semibold uppercase leading-tight tracking-[0.04em] text-[#f1f5f9]/75">
                {stat.label}
              </span>
              <span
                className={`mt-auto flex items-center gap-1 font-sign text-[20px] font-bold leading-none tabular-nums ${stat.tone}`}
              >
                {stat.trend !== null && (
                  <TrendIcon
                    direction={glizzyCallOf(stat.trend)}
                    className="h-3.5 w-3.5 shrink-0"
                  />
                )}
                {stat.value}
              </span>
            </div>
          ))}
        </div>
        <div role="tablist" className="grid grid-cols-4 gap-1 pt-1">
          {RANGES.map((id) => (
            <CareerToggle
              selected={range === id}
              size="sm"
              key={id}
              role="tab"
              aria-selected={range === id}
              onClick={() => setRange(id)}
              className="min-h-11 font-sign text-[14px] uppercase tracking-[0.05em]"
            >
              {G.ranges[id]}
            </CareerToggle>
          ))}
        </div>
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
      <BrassPlate className="self-start">
        <TrendIcon direction="up" className="h-3.5 w-3.5" />
        {BET.title}
      </BrassPlate>
      <GlizzflationBetDesk
        career={career}
        onBet={onBet}
        onCancelBet={onCancelBet}
        otherBets={otherBets}
      />
    </div>
  );
}
