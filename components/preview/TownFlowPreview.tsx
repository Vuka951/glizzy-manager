'use client';

import { useMemo, useState } from 'react';
import OffseasonScreen from '@/components/games/career/OffseasonScreen';
import { previewLead } from '@/components/preview/previewRoster';
import TownKioskChooser from '@/components/games/career/town/TownKioskChooser';
import { sampleArticles } from '@/components/preview/sampleArticles';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { GAMES_UI } from '@/data/games/locale';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt } from '@/lib/utils/format';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { SavedCareer } from '@/lib/utils/careerSave';

type FlowState =
  | 'fresh'
  | 'news'
  | 'papers'
  | 'closing'
  | 'early'
  | 'league'
  | 'rival';

const STATES: { id: FlowState; label: string }[] = [
  { id: 'fresh', label: 'New window' },
  { id: 'news', label: 'News at the kiosk' },
  { id: 'papers', label: 'Two papers' },
  { id: 'closing', label: 'Bus and closing time' },
  { id: 'early', label: 'Early career' },
  { id: 'league', label: 'League in town' },
  { id: 'rival', label: 'Rival choice' },
];

const noop = () => undefined;

// Meter sets that give the strollers different moods: sick, ambitious, vain,
// hungry, forgotten and frantic
const LEAGUE_MOODS = [
  { stress: 90, appetite: 10 },
  { ambition: 90, stress: 20 },
  { ego: 95, stress: 20 },
  { appetite: 92, stress: 30 },
  { fame: 5, stress: 30 },
  { stress: 92, appetite: 92 },
];

function careerFor(
  state: FlowState,
  characters: DuelCharacter[],
  playerSlug: string,
): SavedCareer {
  const slugs = characters.map((c) => c.slug);
  if (state === 'early') {
    return sampleCareer({ slugs, playerSlug, year: 1, season: 0, noParliament: true });
  }
  const base = sampleCareer({ slugs, playerSlug, year: 3, season: 1 });
  if (state === 'fresh' || state === 'rival') return base;
  if (state === 'league') {
    const states = Object.fromEntries(
      Object.entries(base.characters).map(([slug, ch], i) => [
        slug,
        slug === playerSlug ? ch : { ...ch, ...LEAGUE_MOODS[i % LEAGUE_MOODS.length] },
      ]),
    );
    return { ...base, characters: states };
  }
  if (state === 'papers') {
    return {
      ...base,
      slotsUsed: 3,
      lastIssue: { news: sampleArticles(characters).slice(0, 4), season: 0, year: 3 },
    };
  }
  return { ...base, slotsUsed: 3, newsSeen: state === 'closing' };
}

// The whole window town in its key moments, at desktop and phone width,
// with every handler a no-op
export default function TownFlowPreview({ characters }: { characters: DuelCharacter[] }) {
  const [state, setState] = useState<FlowState>('fresh');
  const [take, setTake] = useState(0);
  const lead = previewLead(characters);
  const career = useMemo(
    () => careerFor(state, characters, lead.slug),
    [state, characters, lead.slug],
  );

  const town = (
    <OffseasonScreen
      career={career}
      characters={characters}
      topBar={null}
      toast={null}
      cutscene={null}
      onCloseCutscene={noop}
      onOpenTable={noop}
      onOpenDossier={noop}
      pendingElection={false}
      pendingRival={state === 'rival'}
      onOpenElection={noop}
      onOpenRival={noop}
      onTrain={noop}
      onRest={noop}
      onMedia={noop}
      onIsland={noop}
      onGuard={noop}
      onInvest={noop}
      onBorrow={noop}
      onRepay={noop}
      onGlizzyBet={noop}
      onCancelGlizzyBet={noop}
      onSabotage={noop}
      onOpenNews={noop}
      onToCup={() => setTake((n) => n + 1)}
      onDismissToast={noop}
      onMarkMailRead={noop}
      onMarkAllMailRead={noop}
      onAcceptSponsor={noop}
      onDonate={noop}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {STATES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setState(s.id);
              setTake((n) => n + 1);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest transition ${
              state === s.id
                ? 'border-red-300/60 bg-red-950/60 text-red-200'
                : 'border-frost-border/40 bg-slate-950/60 text-slate-400 hover:text-sky-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {state === 'papers' && (
        <div className="mx-auto w-full max-w-md">
          <TownKioskChooser
            papers={[
              { key: 'league', season: 1, unread: true, headline: 'ELECTIONS' },
              { key: 'last', season: 0, unread: false, headline: 'PRICES FALL' },
            ].map((paper) => ({
              key: paper.key,
              title: GAMES_UI.career.select.masthead,
              sub: fmt(GAMES_UI.career.newspaper.issue, {
                theme: seasonName(paper.season),
                year: 3,
              }),
              season: paper.season,
              headline: paper.headline,
              unread: paper.unread,
              onOpen: noop,
            }))}
          />
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        <div key={`desk-${take}`} className="group relative w-full overflow-hidden rounded-3xl">
          {town}
        </div>
        <div key={`phone-${take}`} className="group relative w-[390px] max-w-full shrink-0 overflow-hidden rounded-3xl">
          {town}
        </div>
      </div>
    </div>
  );
}
