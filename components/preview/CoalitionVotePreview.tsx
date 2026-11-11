'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import CoalitionBallotDialog from '@/components/games/career/CoalitionBallotDialog';
import CoalitionCountScene from '@/components/games/career/CoalitionCountScene';
import ElectionNightCutscene from '@/components/games/career/ElectionNightCutscene';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import { sampleCareer } from '@/components/preview/sampleCareer';
import type { ElectionResult } from '@/data/games/careerElections';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import {
  closeCoalitionBallot,
  coalitionGovernment,
  type CoalitionBallot,
  electionNews,
  openCoalitionBallot,
  settleElection,
  voteCoalition,
} from '@/lib/utils/careerCoalition';
import { electionResult } from '@/lib/utils/careerElections';
import { electionPremier } from '@/lib/utils/careerPremier';
import { redactBallots } from '@/lib/utils/careerParliamentVote';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';

type Mode = 'player' | 'watch' | 'room';

const VOTES: Record<SponsorId, number> = {
  red: 34,
  yellow: 26,
  blue: 24,
  green: 16,
};
// When the sample room's other humans vote, counted from the start of the
// broadcast, and its countdown
const ROOM_FIRST_VOTE_MS = 12000;
const ROOM_VOTE_EVERY_MS = 4000;
const ROOM_COUNT_MS = 9000;
const ROOM_SECONDS = 30;

const noSubscribe = () => () => undefined;

const MODES: { id: Mode; label: string }[] = [
  { id: 'player', label: 'Player votes' },
  { id: 'watch', label: 'Player watches' },
  { id: 'room', label: 'Room, three coaches' },
];

// A league three years in where the Red Party wins without a majority and has
// six coaches on its list; in the room sample three of them are human
function coalitionCareer(characters: DuelCharacter[], mode: Mode): SavedCareer {
  const player = characters[0].slug;
  const base = sampleCareer({
    slugs: characters.map((c) => c.slug),
    playerSlug: player,
    pendingElection: true,
  });
  const free = Object.keys(base.characters).filter(
    (slug) => slug !== player && !base.characters[slug].sponsor,
  );
  const extra = free.slice(0, 3);
  const signed = { ...base.characters };
  extra.forEach((slug) => {
    signed[slug] = {
      ...signed[slug],
      sponsor: { sponsorId: 'red' },
    };
  });
  if (mode === 'watch') {
    signed[player] = {
      ...signed[player],
      sponsor: { sponsorId: 'yellow' },
    };
  }
  return {
    ...base,
    characters: signed,
    ...(mode === 'room' ? { humanSlugs: [player, extra[0], extra[1]] } : {}),
  };
}

function startResult(career: SavedCareer, mode: Mode): ElectionResult {
  const count = electionResult(VOTES);
  const ballot = openCoalitionBallot(career, count.seats);
  if (!ballot) return count;
  const open = { ...count, coalition: ballot };
  return mode === 'watch' ? settleElection(career, open) : open;
}

// The partner vote on a click: the player's own ballot, a count the player
// only watches, and a shared room where the other coaches vote on a clock
export default function CoalitionVotePreview({
  characterBySlug,
}: {
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const characters = useMemo(
    () => [...characterBySlug.values()],
    [characterBySlug],
  );
  const player = characters[0].slug;
  const [mode, setMode] = useState<Mode>('player');
  const [playing, setPlaying] = useState(0);
  const [showBallot, setShowBallot] = useState(false);
  const [countRun, setCountRun] = useState(0);
  const [countSample, setCountSample] = useState<{
    ballot: CoalitionBallot;
    seats: Record<SponsorId, number>;
  } | null>(null);
  const career = useMemo(
    () => coalitionCareer(characters, mode),
    [characters, mode],
  );
  const [result, setResult] = useState<ElectionResult | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  // The AI votes are random, so the sample is drawn after mount only
  const mounted = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

  const start = () => {
    setResult(startResult(career, mode));
    setStartedAt(Date.now());
    setPlaying((k) => k + 1);
  };
  // Only the ballot box: the vote closed on the spot, the humans spread
  // over the options after the first so the list is split
  const playCount = () => {
    const count = electionResult(VOTES);
    const open = openCoalitionBallot(career, count.seats);
    if (!open) return;
    const voted = open.ballots
      .filter((b) => b.human)
      .reduce(
        (ballot, b, i) =>
          voteCoalition(
            ballot,
            b.slug,
            open.options[(i + 1) % open.options.length],
          ),
        open,
      );
    setCountSample({
      ballot: closeCoalitionBallot(career, voted, count.seats),
      seats: count.seats,
    });
    setCountRun((k) => k + 1);
  };
  const deadline =
    mode === 'room' && startedAt > 0
      ? startedAt + ROOM_COUNT_MS + ROOM_SECONDS * 1000
      : null;

  // The sample room: the other humans vote one by one, and the clock closes
  // the ballot for anyone still silent
  const roomOpen =
    mode === 'room' && result?.coalition?.winner === null && playing > 0;
  useEffect(() => {
    if (!roomOpen || deadline === null) return;
    const tick = window.setInterval(() => {
      setResult((current) => {
        const ballot = current?.coalition;
        if (!current || !ballot || ballot.winner !== null) return current;
        const due = Math.floor(
          (Date.now() - startedAt - ROOM_FIRST_VOTE_MS) / ROOM_VOTE_EVERY_MS,
        );
        const othersIn = ballot.ballots.filter(
          (b) => b.human && b.slug !== player && b.choice !== null,
        ).length;
        const silent =
          due >= othersIn
            ? ballot.ballots.find(
                (b) => b.human && b.slug !== player && b.choice === null,
              )
            : undefined;
        const everyoneIn = !ballot.ballots.some(
          (b) => b.human && b.choice === null,
        );
        if (everyoneIn || Date.now() >= deadline) {
          return settleElection(career, current);
        }
        if (!silent) return current;
        return {
          ...current,
          coalition: voteCoalition(ballot, silent.slug, ballot.options[1]),
        };
      });
    }, 500);
    return () => window.clearInterval(tick);
  }, [roomOpen, deadline, startedAt, career, player]);

  const vote = (key: string) => {
    if (!result?.coalition) return;
    const voted = {
      ...result,
      coalition: voteCoalition(result.coalition, player, key),
    };
    setResult(mode === 'room' ? voted : settleElection(career, voted));
  };

  // What the viewer's screen gets from the room: an open vote shows only
  // who has voted
  const shown =
    result && mode === 'room' && result.coalition?.winner === null
      ? {
          ...result,
          coalition: {
            ...result.coalition,
            ballots: redactBallots(result.coalition.ballots, player),
          },
        }
      : result;

  const sample = useMemo(() => {
    if (!mounted) return null;
    const count = electionResult(VOTES);
    const ballot = openCoalitionBallot(career, count.seats);
    if (!ballot) return null;
    const closed = closeCoalitionBallot(career, ballot, count.seats);
    const formed = {
      ...count,
      coalition: closed,
      government: coalitionGovernment(closed),
    };
    return {
      ballot,
      seats: count.seats,
      news: electionNews(formed, player, electionPremier(career, formed)),
    };
  }, [career, mounted, player]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {MODES.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setMode(entry.id)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              mode === entry.id
                ? 'border-amber-300/60 bg-amber-400/15 text-amber-100'
                : 'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:text-white'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={start}
          className="rounded-xl border border-red-400/50 bg-red-500/15 px-5 py-2 text-xs font-black uppercase tracking-[0.3em] text-red-200 transition hover:border-red-300 hover:bg-red-500/25 hover:text-white"
        >
          Play broadcast
        </button>
        <button
          onClick={() => setShowBallot(true)}
          className="rounded-xl border border-sky-200/30 bg-slate-800/60 px-5 py-2 text-xs font-black uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-200/60 hover:text-white"
        >
          Ballot only
        </button>
        <button
          onClick={playCount}
          className="rounded-xl border border-amber-300/40 bg-slate-800/60 px-5 py-2 text-xs font-black uppercase tracking-[0.3em] text-amber-200 transition hover:border-amber-300/70 hover:text-white"
        >
          Count only
        </button>
      </div>
      {countRun > 0 && countSample && (
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-frost-border/40 bg-slate-950 p-3 sm:p-5">
          <CoalitionCountScene
            key={countRun}
            ballot={countSample.ballot}
            seats={countSample.seats}
            characterBySlug={characterBySlug}
            viewerSlug={player}
            onSettled={() => undefined}
          />
        </div>
      )}
      {sample && (
        <div className="flex justify-center">
          <NewspaperSpread
            news={[sample.news]}
            season={0}
            year={3}
            characterBySlug={characterBySlug}
            onDone={() => undefined}
          />
        </div>
      )}
      {playing > 0 && shown && (
        <ElectionNightCutscene
          key={playing}
          result={shown}
          premier={electionPremier(career, shown)}
          playerSponsor={career.characters[player]?.sponsor?.sponsorId ?? null}
          playerSlug={player}
          characterBySlug={characterBySlug}
          onVote={vote}
          deadline={deadline}
          onClose={() => setPlaying(0)}
        />
      )}
      {showBallot && sample && (
        <CoalitionBallotDialog
          ballot={sample.ballot}
          seats={sample.seats}
          weight={5}
          onVote={() => setShowBallot(false)}
        />
      )}
    </div>
  );
}
