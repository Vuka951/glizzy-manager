'use client';

import { useMemo, useState } from 'react';
import QuoteCutscene from '@/components/games/career/QuoteCutscene';
import BroadcastFrame from '@/components/games/career/quotes/BroadcastFrame';
import QuoteSceneStage from '@/components/games/career/quotes/QuoteSceneStage';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { previewRoster } from '@/components/preview/previewRoster';
import { sampleCareer } from '@/components/preview/sampleCareer';
import type { ElectionResult } from '@/data/games/careerElections';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import { GAMES_UI } from '@/data/games/locale';
import {
  COALITION_SCENES,
  ELECTION_LOSS_SCENES,
  ELECTION_WIN_SCENES,
  GOVERNMENT_VARIANT_SEPARATOR,
  type ElectionSceneId,
} from '@/lib/constants/electionCutscenes';
import {
  electionScenes,
  partyTopPerson,
} from '@/lib/utils/careerElectionScenes';
import type { SponsorId } from '@/lib/utils/careerSave';
import type { QuotePlayback } from '@/lib/utils/quoteCutsceneTriggers';
import { quoteHeadline } from '@/lib/utils/quoteSceneText';

const BUTTON = 'rounded-lg border px-3 py-1.5 text-xs font-semibold transition';
const IDLE =
  'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white';

const GROUPS: { label: string; scenes: readonly ElectionSceneId[] }[] = [
  { label: 'Win', scenes: ELECTION_WIN_SCENES },
  { label: 'Loss', scenes: ELECTION_LOSS_SCENES },
  { label: 'Coalition', scenes: COALITION_SCENES },
];

const SCENE_LABELS: Record<ElectionSceneId, string> = {
  'election-fridge': 'Fridge',
  'election-glizzy-rally': 'Glizzy rally',
  'election-all-channels': 'All channels',
  'election-flag-sob': 'Flag',
  'coalition-small-chair': 'Small chair',
  'coalition-reconciliation': 'Historic reconciliation',
  'coalition-three-way': 'Three-way',
};

// The election night stories one at a time, on any party and anyone, or
// the night's whole run for the result picked above
export default function ElectionScenesPreview({
  result,
}: {
  result: ElectionResult;
}) {
  const roster = useMemo(() => previewRoster(), []);
  const characterBySlug = useMemo(
    () => new Map(roster.map((character) => [character.slug, character])),
    [roster],
  );
  const career = useMemo(
    () =>
      sampleCareer({ slugs: roster.slice(0, 11).map((c) => c.slug), year: 4 }),
    [roster],
  );
  const [scene, setScene] = useState<ElectionSceneId>('election-fridge');
  const [parties, setParties] = useState<SponsorId[]>([
    'red',
    'blue',
    'yellow',
  ]);
  const [cast, setCast] = useState<Partial<Record<number, string>>>({});
  const [replay, setReplay] = useState(0);
  const [queue, setQueue] = useState<QuotePlayback[] | null>(null);

  const coalition = (COALITION_SCENES as readonly string[]).includes(scene);
  const loss = (ELECTION_LOSS_SCENES as readonly string[]).includes(scene);
  // A loss scene names the night's winner too, who never comes on stage
  const seats = scene === 'coalition-three-way' ? 3 : coalition || loss ? 2 : 1;
  const shown = parties.slice(0, seats);
  const actors = shown
    .slice(0, loss ? 1 : seats)
    .map((party, i) => cast[i] ?? partyTopPerson(career, party));
  const play: QuotePlayback = {
    id: scene,
    speaker: actors[0],
    ...(actors[1] ? { other: actors[1] } : {}),
    ...(actors[2] ? { third: actors[2] } : {}),
    variant: shown.join(GOVERNMENT_VARIANT_SEPARATOR),
    lineRoll: 0,
  };
  const nameOf = (slug: string) => characterBySlug.get(slug)?.name ?? slug;

  const setParty = (seat: number, party: SponsorId) => {
    const next = parties.filter((id) => id !== party);
    next.splice(seat, 0, party);
    setParties(next);
    setCast({});
    setReplay(replay + 1);
  };

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-frost-border/40 bg-slate-900/70 p-4 sm:p-5">
      <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-200">
        Election scenes
      </h2>
      {GROUPS.map((group) => (
        <div key={group.label} className="flex flex-wrap items-center gap-2">
          <span className="w-20 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {group.label}
          </span>
          {group.scenes.map((id) => (
            <button
              key={id}
              onClick={() => {
                setScene(id);
                setCast({});
                setReplay(replay + 1);
              }}
              className={`${BUTTON} ${
                scene === id
                  ? 'border-red-500/60 bg-red-500/20 text-red-200'
                  : IDLE
              }`}
            >
              {SCENE_LABELS[id]}
            </button>
          ))}
        </div>
      ))}
      {shown.map((party, seat) => (
        <div key={seat} className="flex flex-wrap items-center gap-2">
          <span className="flex w-20 gap-1">
            {SPONSOR_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setParty(seat, id)}
                aria-label={id}
                className={`rounded-md border p-1 transition ${
                  party === id
                    ? 'border-amber-300/60 bg-amber-400/15'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <SponsorEmblem sponsorId={id} className="h-4 w-4" />
              </button>
            ))}
          </span>
          {seat < actors.length ? (
            <select
              value={actors[seat]}
              onChange={(event) => {
                setCast({ ...cast, [seat]: event.target.value });
                setReplay(replay + 1);
              }}
              className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-2 py-1.5 text-xs text-slate-200"
            >
              {roster.map((character) => (
                <option key={character.slug} value={character.slug}>
                  {character.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Winner
            </span>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setReplay(replay + 1)}
          className={`${BUTTON} ${IDLE}`}
        >
          Replay
        </button>
        <button
          onClick={() => setQueue([play])}
          className={`${BUTTON} ${IDLE}`}
        >
          Full window with sound
        </button>
        <button
          onClick={() => setQueue(electionScenes(career, result))}
          className={`${BUTTON} ${IDLE}`}
        >
          Random for this result
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-sky-200/10">
        <BroadcastFrame
          key={`${scene}-${play.variant}-${actors.join('-')}-${replay}`}
          ticker={GAMES_UI.career.quoteCutscene.electionTicker}
          headline={quoteHeadline(scene, play.variant, {
            name: nameOf(actors[0]),
            other: actors[1] ? nameOf(actors[1]) : undefined,
          })}
        >
          <QuoteSceneStage
            scene={scene}
            speaker={play.speaker ?? ''}
            other={play.other}
            third={play.third}
            variant={play.variant}
          />
        </BroadcastFrame>
      </div>
      {queue && (
        <QuoteCutscene
          queue={queue}
          characterBySlug={characterBySlug}
          onDone={() => setQueue(null)}
        />
      )}
    </section>
  );
}
