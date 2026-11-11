'use client';

import { useState } from 'react';
import PaperSection from '@/components/games/career/PaperSection';
import { GAMES_UI } from '@/data/games/locale';
import { NEWSPRINT_PAINT } from '@/lib/utils/careerNewsprint';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';
import { cupGains } from '@/lib/utils/reportCharts';

const R = GAMES_UI.career.report;
const S = GAMES_UI.career.town.stats;
const LONG_RUN_YEARS = 5;

const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`;

// The points the reader made at each cup, one bar per cup on a shared zero
// line, a lost cup in red below it. Pointing at or tapping a bar reads it out
export default function CampaignCupGains({ career }: { career: SavedCareer }) {
  const [active, setActive] = useState<number | null>(null);
  const gains = cupGains(career.standingsHistory, career.playerSlug);
  const known = gains.flatMap((cup) => (cup.gain === null ? [] : [cup.gain]));
  if (known.length === 0) return null;
  const top = Math.max(1, ...known);
  const bottom = Math.min(0, ...known);
  const y = (value: number) => ((top - value) / (top - bottom)) * 100;
  const years = gains[gains.length - 1].year - gains[0].year + 1;
  const reading = active === null ? null : gains[active];
  return (
    <div className={`w-full ${NEWSPRINT_PAINT}`}>
    <PaperSection title={S.perCupTitle}>
      <div className="flex gap-1.5">
        <div className="flex h-28 w-7 shrink-0 flex-col justify-between text-right font-sign text-[13px] font-semibold leading-none tabular-nums text-slate-600">
          <span>{signed(top)}</span>
          <span>{signed(bottom)}</span>
        </div>
        <div className="flex min-w-0 flex-1" onMouseLeave={() => setActive(null)}>
          {gains.map((cup, i) => {
            const startsYear = i === 0 || gains[i - 1].year !== cup.year;
            const value = cup.gain ?? 0;
            return (
              <div key={`${cup.year}-${cup.season}`} className="relative h-[8.75rem] min-w-0 flex-1">
                <button
                  type="button"
                  title={
                    cup.gain === null
                      ? undefined
                      : fmt(S.perCupValue, {
                          year: cup.year,
                          cup: cup.season + 1,
                          gain: signed(cup.gain),
                        })
                  }
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="block h-28 w-full focus-visible:outline-2 focus-visible:outline-red-700"
                >
                  <svg
                    viewBox="0 0 10 100"
                    preserveAspectRatio="none"
                    className="block h-full w-full"
                    aria-hidden="true"
                  >
                    <rect
                      x={0}
                      y={y(0) - 0.5}
                      width={10}
                      height={1}
                      className="fill-slate-900"
                    />
                    {cup.gain !== null && (
                      <rect
                        x={1.5}
                        y={Math.min(y(value), y(0))}
                        width={7}
                        height={Math.abs(y(value) - y(0))}
                        className={
                          active === i
                            ? 'fill-[#1c1408]'
                            : value < 0
                              ? 'fill-[#b91c1c]'
                              : 'fill-[#1d4ed8]'
                        }
                      />
                    )}
                  </svg>
                </button>
                {startsYear && (
                  <span className="absolute left-0 top-[7.5rem] whitespace-nowrap font-sign text-[13px] font-semibold uppercase leading-none tracking-[0.04em] text-slate-600">
                    {years > LONG_RUN_YEARS
                      ? cup.year
                      : fmt(R.yearShort, { year: cup.year })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="min-h-5 text-right font-sign text-[14px] font-semibold tabular-nums text-slate-700">
        {reading &&
          reading.gain !== null &&
          fmt(S.perCupValue, {
            year: reading.year,
            cup: reading.season + 1,
            gain: signed(reading.gain),
          })}
      </p>
    </PaperSection>
    </div>
  );
}
