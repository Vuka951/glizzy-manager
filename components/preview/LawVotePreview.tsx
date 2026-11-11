'use client';

import { useMemo, useState } from 'react';
import CareerMailbox from '@/components/games/career/CareerMailbox';
import LawBallotDialog from '@/components/games/career/LawBallotDialog';
import LawsInForceList from '@/components/games/career/LawsInForceList';
import LawVoteCutscene from '@/components/games/career/LawVoteCutscene';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import { previewRoster } from '@/components/preview/previewRoster';
import { sampleCareer, sampleLawMail } from '@/components/preview/sampleCareer';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import {
  closeLawBallot,
  isConstitutionCard,
  lawCarried,
  lawLetterFor,
  lawNews,
  lawsInForce,
  pickLawCard,
  pickedCard,
  voteLaw,
  type LawBallot,
  type LawCard,
  type LawInForce,
  type LawOutcome,
  type LawVote,
} from '@/lib/utils/careerLaws';
import { redactBallots } from '@/lib/utils/careerParliamentVote';
import type { MailItem, NewsItem, SavedCareer } from '@/lib/utils/careerSave';

const PLAYER = previewRoster()[0].slug;
const OTHER_COACH = previewRoster()[1].slug;
const YEAR = 5;
const ROOM_SECONDS = 30;
const steady = () => 0.5;

const LAWS: LawInForce[] = [
  {
    id: 'amnesty',
    year: 3,
    season: 0,
    government: ['green', 'yellow'],
  },
  {
    id: 'training-subsidy',
    year: 3,
    season: 0,
    government: ['green', 'yellow'],
  },
  { id: 'holiday', year: 1, season: 0, government: ['red', 'blue'] },
  { id: 'tourist-tax', year: 3, season: 0, government: ['green', 'yellow'] },
];

const PICK_CARDS: LawCard[] = [
  { action: 'pass', law: 'wealth-tax' },
  { action: 'pass', law: 'public-order' },
  { action: 'repeal', law: 'amnesty' },
];

const CONSTITUTION: LawCard = { action: 'constitution', party: 'red' };

type Ballot = 'pick' | 'watch' | 'room' | 'constitution';
type Scene =
  | 'passed'
  | 'failed'
  | 'blocked'
  | 'repealed'
  | 'conflict'
  | 'room'
  | 'constitution-passed'
  | 'constitution-failed';

const BALLOTS: { id: Ballot; label: string }[] = [
  { id: 'pick', label: 'You pick the bill' },
  { id: 'watch', label: 'Someone else picks' },
  { id: 'room', label: 'Room, two people and a clock' },
  { id: 'constitution', label: 'Government alone, constitution' },
];

// Partners only: the chamber carries it, the junior partners' bar sinks it
const SCENES: {
  id: Scene;
  label: string;
  card: LawCard;
  outcome: LawOutcome;
  partnersOnly?: boolean;
  solo?: boolean;
}[] = [
    {
      id: 'passed',
      label: 'Passed',
      card: { action: 'pass', law: 'wealth-tax' },
      outcome: 'passed',
    },
    {
      id: 'failed',
      label: 'Rejected',
      card: { action: 'pass', law: 'curfew' },
      outcome: 'failed',
    },
    {
      id: 'blocked',
      label: 'Rejected, partner against',
      card: { action: 'pass', law: 'lottery' },
      outcome: 'failed',
      partnersOnly: true,
    },
    {
      id: 'repealed',
      label: 'Repealed',
      card: { action: 'repeal', law: 'amnesty' },
      outcome: 'passed',
    },
    {
      id: 'conflict',
      label: 'Passed, repeals another',
      card: { action: 'pass', law: 'public-order' },
      outcome: 'passed',
    },
    {
      id: 'room',
      label: 'Room, two people',
      card: { action: 'pass', law: 'fencing' },
      outcome: 'failed',
    },
    {
      id: 'constitution-passed',
      label: 'New constitution',
      card: CONSTITUTION,
      outcome: 'passed',
      solo: true,
    },
    {
      id: 'constitution-failed',
      label: 'Constitution fails',
      card: CONSTITUTION,
      outcome: 'failed',
      solo: true,
    },
  ];

// A league in its fifth year under the Red Party and the Blue Party, with four more
// coaches signed to the government so the chamber has a crowd, the books
// holding four laws of the last government. The room sample makes the
// second seed a second human
function lawCareer(characters: DuelCharacter[], room: boolean): SavedCareer {
  const base = sampleCareer({
    slugs: characters.map((c) => c.slug),
    playerSlug: PLAYER,
    year: YEAR,
    laws: LAWS,
  });
  const free = Object.keys(base.characters).filter(
    (slug) => slug !== PLAYER && !base.characters[slug].sponsor,
  );
  const signed = { ...base.characters };
  free.slice(0, 4).forEach((slug, i) => {
    signed[slug] = {
      ...signed[slug],
      sponsor: { sponsorId: i < 2 ? 'red' : 'blue' },
      partyStatus: i < 2 ? 'leader' : 'partner',
    };
  });
  return {
    ...base,
    characters: signed,
    ...(room ? { humanSlugs: [PLAYER, OTHER_COACH] } : {}),
  };
}

// The same league with the Red Party governing alone on a majority, its three
// laws on the books and every government coach on its list, so the
// constitution card is on the ballot
function soloCareer(career: SavedCareer): SavedCareer {
  const parliament = career.parliament;
  if (!parliament) return career;
  const characters = { ...career.characters };
  Object.entries(characters).forEach(([slug, ch]) => {
    if (ch.sponsor?.sponsorId === 'blue') {
      characters[slug] = { ...ch, sponsor: { sponsorId: 'red' } };
    }
  });
  return {
    ...career,
    characters,
    parliament: {
      ...parliament,
      government: ['red'],
      seats: { red: 70, yellow: 14, blue: 9, green: 7 },
      laws: [
        { id: 'holiday', year: 1, season: 0, government: ['red'] },
        { id: 'credit-law', year: 3, season: 0, government: ['red'] },
        { id: 'lottery', year: 5, season: 0, government: ['red'] },
      ],
    },
  };
}

function openBallot(career: SavedCareer, picker: string): LawBallot {
  return {
    year: YEAR,
    season: 0,
    government: career.parliament?.government ?? ['red'],
    cards: PICK_CARDS,
    picker,
    pick: null,
    ballots: [],
    outcome: null,
  };
}

// A closed vote on the card with the outcome asked for, as tight as it
// gets: the humans vote for the outcome, then the AI turns against the card
// voice by voice from the bottom of the roll, as far as a pass still holds
// or until it fails. Partners only turns just the junior partners
function closedBallot(
  career: SavedCareer,
  card: LawCard,
  outcome: LawOutcome,
  partnersOnly = false,
): LawBallot {
  const want: LawVote = outcome === 'passed' ? 'yes' : 'no';
  const picked = pickLawCard(
    career,
    { ...openBallot(career, PLAYER), cards: [card] },
    0,
    steady,
  );
  const partners = new Set(picked.partners ?? []);
  let ballots = picked.ballots.map((b) => ({
    ...b,
    choice: (b.human && !partnersOnly ? want : 'yes') as LawVote,
  }));
  const turnable = picked.ballots
    .filter((b) => !b.human && (!partnersOnly || partners.has(b.slug)))
    .map((b) => b.slug)
    .reverse();
  for (const slug of turnable) {
    const next = ballots.map((b) =>
      b.slug === slug ? { ...b, choice: 'no' as LawVote } : b,
    );
    const carried = lawCarried({ ...picked, ballots: next });
    if (outcome === 'passed' && !carried) continue;
    ballots = next;
    if (outcome === 'failed' && !carried) break;
  }
  return closeLawBallot(career, { ...picked, ballots }, steady);
}

// The laws on the ballot and in the chamber on a click: the pop-up in each
// of its states, the vote read out for every verdict, the books, the post
// and the paper
export default function LawVotePreview({
  characterBySlug,
}: {
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const characters = useMemo(
    () => [...characterBySlug.values()],
    [characterBySlug],
  );
  const career = useMemo(() => lawCareer(characters, false), [characters]);
  const room = useMemo(() => lawCareer(characters, true), [characters]);
  const solo = useMemo(() => soloCareer(career), [career]);
  const [ballot, setBallot] = useState<{
    mode: Ballot;
    ballot: LawBallot;
    deadline: number | null;
  } | null>(null);
  const [scene, setScene] = useState<{ key: number; ballot: LawBallot } | null>(
    null,
  );

  const stateFor = (mode: Ballot) =>
    mode === 'room' ? room : mode === 'constitution' ? solo : career;
  const startBallot = (mode: Ballot, now: number) => {
    const state = stateFor(mode);
    const base = openBallot(state, mode === 'watch' ? OTHER_COACH : PLAYER);
    const open =
      mode === 'constitution'
        ? { ...base, government: ['red' as const], cards: [CONSTITUTION, ...PICK_CARDS] }
        : base;
    setBallot({
      mode,
      ballot: mode === 'room' ? pickLawCard(state, open, 0, steady) : open,
      deadline: mode === 'room' ? now + ROOM_SECONDS * 1000 : null,
    });
  };
  const playScene = (id: Scene) => {
    const entry = SCENES.find((s) => s.id === id);
    if (!entry) return;
    setBallot(null);
    setScene({
      key: (scene?.key ?? 0) + 1,
      ballot: closedBallot(
        id === 'room' ? room : entry.solo ? solo : career,
        entry.card,
        entry.outcome,
        entry.partnersOnly,
      ),
    });
  };

  const ballotState = ballot ? stateFor(ballot.mode) : career;
  const shownBallot =
    ballot && ballot.mode === 'room'
      ? { ...ballot.ballot, ballots: redactBallots(ballot.ballot.ballots, PLAYER) }
      : ballot?.ballot;
  const pick = (index: number) => {
    if (!ballot) return;
    setBallot({
      ...ballot,
      ballot: pickLawCard(ballotState, ballot.ballot, index, steady),
    });
  };
  const vote = (choice: LawVote) => {
    if (!ballot) return;
    const voted = voteLaw(ballot.ballot, PLAYER, choice);
    if (ballot.mode === 'room') {
      setBallot({ ...ballot, ballot: voted });
      return;
    }
    setBallot(null);
    setScene({
      key: (scene?.key ?? 0) + 1,
      ballot: closeLawBallot(ballotState, voted, steady),
    });
  };

  const news = useMemo(
    () =>
      SCENES.filter((entry) => entry.id !== 'blocked' && entry.id !== 'room')
        .map((entry) =>
          lawNews(
            closedBallot(entry.solo ? solo : career, entry.card, entry.outcome),
          ),
        )
        .filter((item): item is NewsItem => item !== null)
        .map((item) => ({ ...item, slugs: [PLAYER] })),
    [career, solo],
  );
  const mail = useMemo(
    () => [
      ...SCENES.filter((entry) => entry.solo)
        .map((entry) =>
          lawLetterFor(closedBallot(solo, entry.card, entry.outcome)),
        )
        .filter((item): item is MailItem => item !== null),
      ...sampleLawMail(),
    ],
    [solo],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          Ballot
        </span>
        <div className="flex flex-wrap gap-2">
          {BALLOTS.map((entry) => (
            <button
              key={entry.id}
              onClick={() => startBallot(entry.id, Date.now())}
              className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-sky-200/45 hover:text-white"
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          Assembly vote
        </span>
        <div className="flex flex-wrap gap-2">
          {SCENES.map((entry) => (
            <button
              key={entry.id}
              onClick={() => playScene(entry.id)}
              className="rounded-xl border border-red-400/50 bg-red-500/15 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-200 transition hover:border-red-300 hover:bg-red-500/25 hover:text-white"
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-frost-border/30 bg-slate-950/80 p-4">
          <LawsInForceList laws={lawsInForce(career.parliament)} />
        </div>
        <div className="rounded-3xl border border-frost-border/30 bg-slate-950/80 p-4">
          <LawsInForceList laws={[]} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="mx-auto w-full max-w-md">
          <CareerMailbox
            mail={mail}
            canAcceptSponsor={false}
            canDonate={() => false}
            balance={0}
            onDonate={() => undefined}
            onMarkRead={() => undefined}
            onMarkAllRead={() => undefined}
            onAcceptSponsor={() => undefined}
          />
        </div>
        <div className="flex justify-center">
          <NewspaperSpread
            news={news}
            season={0}
            year={YEAR}
            characterBySlug={characterBySlug}
            onDone={() => undefined}
          />
        </div>
      </div>

      {ballot && shownBallot && (
        <LawBallotDialog
          key={`${ballot.mode}-${ballot.ballot.pick ?? 'open'}`}
          ballot={shownBallot}
          playerSlug={PLAYER}
          characterBySlug={characterBySlug}
          laws={lawsInForce(ballotState.parliament)}
          deadline={ballot.deadline}
          onPick={pick}
          onVote={vote}
        />
      )}
      {ballot && (
        <button
          onClick={() => setBallot(null)}
          className="fixed bottom-3 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-sky-200/30 bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-sky-200"
        >
          Close
        </button>
      )}
      {scene && (
        <LawVoteCutscene
          key={scene.key}
          ballot={scene.ballot}
          seats={
            (isConstitutionCard(pickedCard(scene.ballot)) ? solo : career)
              .parliament?.seats ?? {
              red: 0,
              yellow: 0,
              blue: 0,
              green: 0,
            }
          }
          characterBySlug={characterBySlug}
          viewerSlug={PLAYER}
          onClose={() => setScene(null)}
        />
      )}
    </div>
  );
}
