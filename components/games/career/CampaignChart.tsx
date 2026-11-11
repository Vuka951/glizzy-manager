'use client';

import { useState } from 'react';
import CrownIcon from '@/components/icons/CrownIcon';
import PortraitHead from '@/components/games/PortraitHead';
import CampaignLineChart, {
  type LineTone,
} from '@/components/games/career/CampaignLineChart';
import PaperSection from '@/components/games/career/PaperSection';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { NEWSPRINT_PAINT } from '@/lib/utils/careerNewsprint';
import { overlordGoal } from '@/lib/utils/careerPoints';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fmt, ordinal } from '@/lib/utils/format';
import {
  hasRecordedTables,
  placeSeries,
  pointsSeries,
  roundTicks,
  ticksBetween,
  yearLabels,
  type ChartSeries,
} from '@/lib/utils/reportCharts';

const R = GAMES_UI.career.report;

type ChartMode = 'place' | 'points';
// Eight seats on the chart, each with its own color; a seat keeps its color
// for as long as the same character sits in it. The order keeps the reds apart
// and passes the colorblind check on the paper
const SEAT_TONES: LineTone[] = [
  'emerald',
  'amber',
  'violet',
  'orange',
  'sky',
  'rose',
  'teal',
  'fuchsia',
];
const PICK_RING: Record<LineTone, string> = {
  emerald: 'border-emerald-700 bg-emerald-600/15',
  amber: 'border-amber-600 bg-amber-500/20',
  sky: 'border-sky-700 bg-sky-600/15',
  violet: 'border-violet-700 bg-violet-600/15',
  rose: 'border-rose-700 bg-rose-600/15',
  orange: 'border-orange-700 bg-orange-600/15',
  teal: 'border-teal-600 bg-teal-600/15',
  fuchsia: 'border-fuchsia-700 bg-fuchsia-600/15',
};
const MODES: ChartMode[] = ['place', 'points'];
const LIVE_MAX_YEAR_LABELS = 6;

// The campaign cup by cup: the table place or the points race, for up to
// eight picked characters, printed on the paper. While the paper is being
// saved both charts print, one under the other. A live campaign can be far
// from the crown, so its points scale to the race
export default function CampaignChart({
  career,
  characterBySlug,
  order,
  overlordSlug,
  seeded,
  exporting = false,
  live = false,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  // The table order the picker lists
  order: string[];
  overlordSlug: string;
  // Who sits on the chart at first: the reader, the champion, the room
  seeded: string[];
  exporting?: boolean;
  live?: boolean;
}) {
  const [mode, setMode] = useState<ChartMode>('place');
  const [seats, setSeats] = useState<(string | null)[]>(() => {
    const first = seeded.filter((slug, i, all) => all.indexOf(slug) === i);
    return SEAT_TONES.map((_, i) => first[i] ?? null);
  });
  const history = career.standingsHistory;
  const playerSlug = career.playerSlug;
  const nameOf = (slug: string) => characterBySlug.get(slug)?.name ?? slug;
  const charted = hasRecordedTables(history);
  const xLabels = yearLabels(
    history,
    (year) => fmt(R.yearShort, { year }),
    live ? LIVE_MAX_YEAR_LABELS : undefined,
  );
  const tones: Record<string, LineTone> = {};
  seats.forEach((slug, i) => {
    if (slug) tones[slug] = SEAT_TONES[i];
  });
  const toggleSeat = (slug: string) => {
    setSeats((current) => {
      const at = current.indexOf(slug);
      if (at >= 0) return current.map((s, i) => (i === at ? null : s));
      const free = current.indexOf(null);
      if (free >= 0) return current.map((s, i) => (i === free ? slug : s));
      // Every seat taken: the newcomer takes the last one
      return current.map((s, i) => (i === current.length - 1 ? slug : s));
    });
  };
  const placeCaption = (line: ChartSeries) => {
    const places = line.values.filter((v): v is number => v !== null);
    return fmt(R.hoverPlace, {
      name: line.name,
      best: ordinal(Math.min(...places)),
      worst: ordinal(Math.max(...places)),
      last: ordinal(places[places.length - 1]),
    });
  };
  const pointsCaption = (line: ChartSeries) => {
    const values = line.values.filter((v): v is number => v !== null);
    let gain = 0;
    for (let i = 1; i < values.length; i++) {
      gain = Math.max(gain, values[i] - values[i - 1]);
    }
    return fmt(R.hoverPoints, {
      name: line.name,
      last: values[values.length - 1],
      gain,
    });
  };
  const goal = overlordGoal(career);
  const allPoints = history.flatMap((h) => Object.values(h.points ?? {}));
  const topPoints = Math.max(1, ...allPoints);
  const pointTicks = live
    ? roundTicks(topPoints, 5)
    : ticksBetween(0, Math.max(goal, ...allPoints), 6);
  const maxPoints = pointTicks[pointTicks.length - 1];
  const chartFor = (m: ChartMode) =>
    m === 'place' ? (
      <CampaignLineChart
        key="place"
        series={placeSeries(history, order, nameOf, playerSlug)}
        xLabels={xLabels}
        yMin={1}
        yMax={Math.max(2, order.length)}
        yTicks={ticksBetween(1, Math.max(2, order.length), 5)}
        invert
        tones={tones}
        caption={placeCaption}
        compact={live}
      />
    ) : (
      <CampaignLineChart
        key="points"
        series={pointsSeries(history, order, nameOf)}
        xLabels={xLabels}
        yMin={Math.min(0, ...allPoints)}
        yMax={maxPoints}
        yTicks={pointTicks}
        goal={goal}
        tones={tones}
        caption={pointsCaption}
        compact={live}
      />
    );
  return (
    <div className={`w-full ${NEWSPRINT_PAINT}`}>
    <PaperSection
      title={R.chartTitle}
      icon="bolt"
      aside={
        exporting ? undefined : (
          <span className="flex items-center gap-4 font-sign text-[15px] font-bold uppercase tracking-[0.05em]">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`min-h-11 border-b-2 px-1 transition focus-visible:outline-2 focus-visible:outline-red-700 sm:min-h-8 ${
                mode === m
                  ? 'border-red-700 text-red-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {R.modes[m]}
            </button>
          ))}
        </span>
        )
      }
    >
      <div className="flex w-full flex-col gap-3 rounded-[2px] border border-slate-900/25 bg-white/40 p-3 sm:p-4">
        {!charted ? (
          <p className="font-serif text-[12px] italic text-slate-600">{R.noCharts}</p>
        ) : exporting ? (
          MODES.map((m) => (
            <div key={m} className="flex flex-col gap-2">
              <span className="font-sign text-[15px] font-bold uppercase tracking-[0.05em] text-red-700">{R.modes[m]}</span>
              {chartFor(m)}
            </div>
          ))
        ) : (
          chartFor(mode)
        )}
        <div className="border-t border-dotted border-slate-900/40 pt-3">
          <div className="flex flex-wrap gap-1.5">
            {order.map((slug) => {
              const character = characterBySlug.get(slug);
              if (!character) return null;
              const tone = tones[slug];
              return (
                <button
                  key={slug}
                  onClick={() => toggleSeat(slug)}
                  aria-pressed={Boolean(tone)}
                  title={character.name}
                  className={`flex min-h-11 items-center gap-1.5 rounded-[2px] border py-0.5 pl-0.5 pr-2 font-serif text-[12px] font-semibold transition focus-visible:outline-2 focus-visible:outline-red-700 sm:min-h-8 ${
                    tone
                      ? `${PICK_RING[tone]} text-slate-900`
                      : 'border-slate-900/25 bg-white/50 text-slate-600 hover:border-slate-900 hover:text-slate-900'
                  }`}
                >
                  <PortraitHead
                    character={character}
                    className={`h-6 w-6 ${tone ? '' : 'grayscale'}`}
                  />
                  <span className="max-w-24 truncate">{character.name}</span>
                  {slug === overlordSlug && (
                    <CrownIcon className="h-3 w-3 shrink-0 text-amber-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PaperSection>
    </div>
  );
}
