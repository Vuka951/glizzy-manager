'use client';

import { useState } from 'react';
import CrownIcon from '@/components/icons/CrownIcon';
import PortraitHead from '@/components/games/PortraitHead';
import CampaignLineChart, {
  type LineTone,
} from '@/components/games/career/CampaignLineChart';
import PaperSection from '@/components/games/career/PaperSection';
import { OVERLORD_POINTS } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fmt, ordinal } from '@/lib/utils/format';
import {
  hasRecordedTables,
  placeSeries,
  pointsSeries,
  ticksBetween,
  yearLabels,
  type ChartSeries,
} from '@/lib/utils/reportCharts';

const R = GAMES_UI.career.report;

type ChartMode = 'place' | 'points';
// Eight seats on the chart, each with its own color; a seat keeps its color
// for as long as the same character sits in it
const SEAT_TONES: LineTone[] = [
  'emerald',
  'amber',
  'sky',
  'violet',
  'rose',
  'orange',
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
  teal: 'border-teal-700 bg-teal-600/15',
  fuchsia: 'border-fuchsia-700 bg-fuchsia-600/15',
};
const MODES: ChartMode[] = ['place', 'points'];

// The campaign cup by cup: the table place or the points race, for up to
// eight picked characters, printed on the paper. While the paper is being
// saved both charts print, one under the other
export default function CampaignChart({
  career,
  characterBySlug,
  order,
  overlordSlug,
  seeded,
  exporting = false,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  // The table order the picker lists
  order: string[];
  overlordSlug: string;
  // Who sits on the chart at first: the reader, the champion, the room
  seeded: string[];
  exporting?: boolean;
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
  const xLabels = yearLabels(history, (year) => fmt(R.yearShort, { year }));
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
  const maxPoints = Math.max(
    OVERLORD_POINTS,
    ...history.flatMap((h) => Object.values(h.points ?? {})),
  );
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
        paper
      />
    ) : (
      <CampaignLineChart
        key="points"
        series={pointsSeries(history, order, nameOf)}
        xLabels={xLabels}
        yMin={Math.min(
          0,
          ...history.flatMap((h) => Object.values(h.points ?? {})),
        )}
        yMax={maxPoints}
        yTicks={ticksBetween(0, maxPoints, 6)}
        goal={OVERLORD_POINTS}
        tones={tones}
        caption={pointsCaption}
        paper
      />
    );
  return (
    <PaperSection
      title={R.chartTitle}
      icon="bolt"
      aside={
        exporting ? undefined : (
          <span className="flex items-center gap-4 text-[11px] font-bold">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`border-b-2 pb-0.5 transition ${
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
      <div className="flex w-full flex-col gap-3 rounded-sm border border-slate-900/20 bg-white/40 p-3 sm:p-4">
        {!charted ? (
          <p className="text-[10px] italic text-slate-600">{R.noCharts}</p>
        ) : exporting ? (
          MODES.map((m) => (
            <div key={m} className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-red-700">{R.modes[m]}</span>
              {chartFor(m)}
            </div>
          ))
        ) : (
          chartFor(mode)
        )}
        <div className="flex flex-col gap-2 border-t border-dotted border-slate-900/40 pt-3">
          <span className="text-[10px] italic text-slate-600">
            {fmt(R.pickHint, { max: SEAT_TONES.length })}
          </span>
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
                  className={`flex items-center gap-1.5 rounded-sm border py-0.5 pl-0.5 pr-2 text-[10px] font-semibold transition ${
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
  );
}
