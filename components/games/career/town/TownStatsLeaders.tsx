'use client';

import { useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import { MIN_MATCHES_FOR_RATE, winRate } from '@/components/games/career/CampaignAwards';
import PaperBar from '@/components/games/career/PaperBar';
import PaperSection from '@/components/games/career/PaperSection';
import SeatTag from '@/components/games/rooms/SeatTag';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachTagMap } from '@/lib/types/careerMp';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { longestTitleStreak } from '@/lib/utils/reportCharts';

const R = GAMES_UI.career.report;
const S = GAMES_UI.career.town.stats;
const ROWS = 9;

type Metric = keyof typeof S.metrics;
const METRICS: Metric[] = [
  'titles',
  'streak',
  'winRate',
  'eaten',
  'fame',
  'money',
  'punished',
  'meltdowns',
  'forfeits',
];

// Who leads at what, as ranked bars with one measure open at a time. The list
// always holds the same number of rows, and the reader keeps the last one when
// they fall outside the leaders, so switching measures moves nothing below it.
// Another coach's balance stays out of a shared room
export default function TownStatsLeaders({
  career,
  characterBySlug,
  order,
  coaches,
  shared,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  order: string[];
  coaches?: CoachTagMap;
  shared: boolean;
}) {
  const [metric, setMetric] = useState<Metric>('titles');
  const playerSlug = career.playerSlug;
  const score = (slug: string): number => {
    const ch = career.characters[slug];
    switch (metric) {
      case 'titles':
        return ch.titles;
      case 'streak':
        return longestTitleStreak(career.standingsHistory, slug, ch.titleStreak);
      case 'winRate':
        return ch.wins + ch.losses >= MIN_MATCHES_FOR_RATE
          ? Math.round(winRate(ch) * 100)
          : 0;
      case 'eaten':
        return ch.eaten ?? 0;
      case 'fame':
        return Math.round(ch.fame);
      case 'money':
        return Math.max(0, slug === playerSlug ? career.balance : (ch.money ?? 0));
      case 'punished':
        return ch.punishments ?? 0;
      case 'meltdowns':
        return ch.meltdowns;
      case 'forfeits':
        return ch.forfeits + ch.withdrawals;
    }
  };
  const ranked = [...order].sort((a, b) => score(b) - score(a));
  const rows = ranked.slice(0, ROWS);
  if (ranked.includes(playerSlug) && !rows.includes(playerSlug)) {
    rows[rows.length - 1] = playerSlug;
  }
  const max = Math.max(1, ...ranked.map(score));
  const metrics = shared ? METRICS.filter((m) => m !== 'money') : METRICS;
  return (
    <PaperSection title={R.awardsTitle} icon="star">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {metrics.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={metric === id}
            onClick={() => setMetric(id)}
            className={`border-b-2 px-0.5 font-sign text-[14px] font-bold uppercase tracking-[0.05em] transition pointer-coarse:min-h-11 focus-visible:outline-2 focus-visible:outline-red-700 ${
              metric === id
                ? 'border-red-800 text-red-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {S.metrics[id]}
          </button>
        ))}
      </div>
      <div className="flex flex-col">
        {rows.map((slug) => {
          const character = characterBySlug.get(slug);
          if (!character) return null;
          const mine = slug === playerSlug;
          const coach = coaches?.[slug];
          const value = score(slug);
          return (
            <div
              key={slug}
              className={`grid h-10 grid-cols-[1.5rem_1.75rem_minmax(0,6.5rem)_minmax(0,1fr)_2.75rem] items-center gap-1.5 border-b border-dotted border-slate-900/30 px-0.5 sm:grid-cols-[1.5rem_1.75rem_minmax(0,10rem)_minmax(0,1fr)_3rem] ${
                mine ? 'bg-[#fde047]/45' : ''
              }`}
            >
              <span className="text-right font-sign text-[13px] font-semibold tabular-nums text-slate-600">
                {ranked.indexOf(slug) + 1}.
              </span>
              <PortraitHead character={character} className="h-7 w-7" />
              <span className="flex min-w-0 items-center gap-1">
                <span
                  title={character.name}
                  className="line-clamp-2 min-w-0 font-serif text-[12px] font-bold leading-[1.15] text-slate-900 [overflow-wrap:anywhere] sm:text-[13px]"
                >
                  {character.name}
                </span>
                {coach && <SeatTag name={coach.name} color={coach.color} onPaper />}
              </span>
              <PaperBar
                value={value}
                max={max}
                className={mine ? 'fill-[#b91c1c]' : 'fill-slate-700'}
              />
              <span className="text-right font-sign text-[15px] font-bold tabular-nums text-slate-900">
                {metric === 'winRate' ? `${value}%` : value}
              </span>
            </div>
          );
        })}
      </div>
    </PaperSection>
  );
}
