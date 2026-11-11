'use client';

import { useMemo, useState } from 'react';
import TownHub, { type TownBuildingState } from '@/components/games/career/town/TownHub';
import { previewLead } from '@/components/preview/previewRoster';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { OFFSEASON_SLOTS } from '@/data/games/careerEconomy';
import { SEASON_THEME_INDEX } from '@/data/games/careerSeasons';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  TOWN_ART_SIZE,
  type TownBuildingId,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';

const EDITIONS = [0, 1, 2, 3];

const LAYOUTS: { id: TownLayoutKey; label: string }[] = [
  { id: 'desk', label: 'Desktop' },
  { id: 'phone', label: 'Phone' },
];

// The stage picks its canvas from its own width, so the phone layout is a
// phone-wide box
const BOX: Record<TownLayoutKey, string> = {
  desk: 'w-full',
  phone: 'w-[390px] max-w-full',
};

const noop = () => undefined;

const BUILDINGS = Object.fromEntries(
  (Object.keys(TOWN_ART_SIZE) as TownBuildingId[]).map((id) => [
    id,
    { mode: 'open', disabled: false, sub: null, onOpen: noop },
  ]),
) as Record<TownBuildingId, TownBuildingState>;

function chipClass(on: boolean): string {
  return `rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest transition ${
    on
      ? 'border-red-300/60 bg-red-950/60 text-red-200'
      : 'border-frost-border/40 bg-slate-950/60 text-slate-400 hover:text-sky-200'
  }`;
}

// The real town hub with the league walkers out on the walk graph. Closing
// sends them off to the cup; turning it back off starts a fresh window
export default function TownWalkersPreview({ characters }: { characters: DuelCharacter[] }) {
  const [season, setSeason] = useState(0);
  const [layout, setLayout] = useState<TownLayoutKey>('desk');
  const [closing, setClosing] = useState(false);
  const [take, setTake] = useState(0);
  const lead = previewLead(characters);
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters],
  );
  const base = useMemo(
    () => sampleCareer({ slugs: characters.map((c) => c.slug), playerSlug: lead.slug, year: 3, season }),
    [characters, lead.slug, season],
  );
  const career = useMemo(
    () => (closing ? { ...base, slotsUsed: OFFSEASON_SLOTS, newsSeen: true } : { ...base, slotsUsed: 0 }),
    [base, closing],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {EDITIONS.map((s) => (
          <button key={s} type="button" onClick={() => setSeason(s)} className={chipClass(season === s)}>
            {GAMES_UI.cup.studio.themes[SEASON_THEME_INDEX[s]]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {LAYOUTS.map((l) => (
          <button key={l.id} type="button" onClick={() => setLayout(l.id)} className={chipClass(layout === l.id)}>
            {l.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={closing}
          onClick={() => {
            if (closing) setTake((n) => n + 1);
            setClosing(!closing);
          }}
          className={chipClass(closing)}
        >
          Closing time
        </button>
      </div>
      <div className="flex justify-center">
        <div
          key={`${layout}-${take}`}
          className={`group relative shrink-0 overflow-hidden rounded-3xl ${BOX[layout]}`}
        >
          <TownHub
            career={career}
            characterBySlug={characterBySlug}
            playerCharacter={lead}
            topBar={null}
            hideCupGate={false}
            toast={null}
            onDismissToast={noop}
            buildings={BUILDINGS}
            trip={null}
            sailing={false}
            onArrive={noop}
            onTripEnd={noop}
            pendingElection={false}
            pendingRival={false}
            closing={closing}
            paperFresh={false}
            onOpenElection={noop}
            onOpenRival={noop}
            onOpenDossier={noop}
            onOpenNews={noop}
            onToCup={() => {
              setClosing(false);
              setTake((n) => n + 1);
            }}
          />
        </div>
      </div>
    </div>
  );
}
