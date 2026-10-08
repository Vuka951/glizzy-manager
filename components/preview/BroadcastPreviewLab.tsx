'use client';

import { useMemo, useState, type ReactNode } from 'react';
import BroadcastOpenPanel from '@/components/games/career/BroadcastOpenPanel';
import MatchViewer from '@/components/games/match/MatchViewer';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { SEASON_COUNT } from '@/data/games/careerSeasons';
import { FULL_REVEAL } from '@/lib/utils/careerScouting';
import { seasonName } from '@/lib/utils/localeNames';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { newCharacterState } from '@/lib/utils/careerMeters';
import { planCommentary, type PlannedLine } from '@/lib/utils/matchCommentary';
import { buildMatchTape } from '@/lib/utils/matchTape';
import type { CupMatchResult, CupTurn } from '@/lib/utils/tournamentSim';

// Every broadcast unlock stage on one page, with the same mock career, so the
// whole rollout can be checked without playing four cups

function turn(
  matchRound: number,
  seeker: 'a' | 'b',
  picked: CupTurn['picked'],
  hidden: CupTurn['hidden'],
): CupTurn {
  return { matchRound, seeker, picked, hidden, hit: picked === hidden };
}

function snapshot(
  stressA: number,
  appetiteA: number,
  stressB: number,
  appetiteB: number,
) {
  return { stressA, appetiteA, stressB, appetiteB };
}

const PREVIEW_RESULT: CupMatchResult = {
  turns: [
    turn(1, 'a', 'hat', 'sock'),
    turn(1, 'b', 'box', 'hat'),
    turn(2, 'a', 'sock', 'box'),
    turn(2, 'b', 'hat', 'sock'),
    turn(3, 'a', 'box', 'box'),
    turn(3, 'b', 'sock', 'sock'),
    turn(4, 'a', 'hat', 'hat'),
  ],
  events: [
    { afterTurn: 1, side: 'b', kind: 'sniff-dodge' },
    { afterTurn: 6, side: 'a', kind: 'binge-grab' },
  ],
  livesA: 1,
  livesB: 2,
  winner: 'b',
  reason: null,
  livesCapA: 3,
  livesCapB: 3,
  meters: [
    ...Array.from({ length: 5 }, () => snapshot(62, 48, 40, 70)),
    snapshot(68, 40, 40, 70),
    snapshot(68, 40, 46, 62),
    snapshot(74, 32, 46, 62),
  ],
};

// Pairings that show both tells: Vuka sweats across from the inspector who
// bounces, Dax and Vuka both bounce
const PAIRS = [
  { label: 'Vuka i Poreznik: loš, dobar', a: 'vuka', b: 'tax-inspector' },
  { label: 'Dax i Vuka: dobar, dobar', a: 'dax', b: 'vuka' },
];

function mockCareer(characters: DuelCharacter[]): SavedCareer {
  const slugs = characters.map((c) => c.slug);
  const states = Object.fromEntries(
    characters.map((c, i) => [
      c.slug,
      {
        ...newCharacterState(c.slug, true),
        livesCap: { level: i % 3, progress: 0 },
        njuh: { level: (i + 1) % 4 === 0 ? 3 : i % 2, progress: 0 },
        nutrition: { level: (i + 2) % 3, progress: 0 },
        fanSkill: { level: i % 2, progress: 0 },
        wins: 3 + ((i * 7) % 12),
        losses: 2 + ((i * 5) % 9),
        titles: i % 6 === 0 ? 2 : i % 4 === 0 ? 1 : 0,
        titleStreak: i % 6 === 0 ? 1 : 0,
        meltdowns: (i * 3) % 5,
        punishments: i % 4,
        forfeits: i % 3,
        withdrawals: i % 2,
        fame: 25 + ((i * 13) % 70),
        eaten: 5 + ((i * 11) % 30),
        recentResults: Array.from({ length: 5 }, (_, k) =>
          (i + k) % 3 === 0 ? ('l' as const) : ('w' as const),
        ),
        editionRecord: { 1: [i % 4, (i + 1) % 3] as [number, number] },
        turnsPlayed: 40 + i * 9,
        tiebreaks: i % 3,
      },
    ]),
  );
  return {
    version: 1,
    playerSlug: slugs[0],
    year: 3,
    season: 1,
    phase: 'cup',
    slotsUsed: 0,
    slotLog: [],
    balance: 5000,
    characters: states,
    pendingSabotages: [],
    newsQueue: [],
    mail: [],
    cup: null,
    standingsHistory: [
      { year: 1, season: 3, champion: slugs[5 % slugs.length], playerPlace: 7 },
      { year: 2, season: 1, champion: slugs[3 % slugs.length], playerPlace: 5 },
      { year: 2, season: 3, champion: slugs[1], playerPlace: 4 },
    ],
    rivalSlug: slugs[1],
    cupStartRanks: slugs,
    h2h: { [[slugs[0], slugs[1]].sort().join('|')]: [3, 1] },
  };
}

const STAGES = [
  { cups: 0, label: 'Kup 1: bez prenosa' },
  { cups: 1, label: 'Kup 2: komentator' },
  { cups: 2, label: 'Kup 3: tale of the tape' },
  { cups: 3, label: 'Kup 4: studio uvod' },
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-center text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
      {children}
    </h2>
  );
}

export default function BroadcastPreviewLab({
  characters,
}: {
  characters: DuelCharacter[];
}) {
  const career = useMemo(() => mockCareer(characters), [characters]);
  const [pairIndex, setPairIndex] = useState(0);
  const pair = PAIRS[pairIndex];
  const a = characters.find((c) => c.slug === pair.a) ?? characters[0];
  const b = characters.find((c) => c.slug === pair.b) ?? characters[1];
  const [stage, setStage] = useState(2);
  const [matchKey, setMatchKey] = useState(0);
  const [openKey, setOpenKey] = useState(0);
  const [showOpen, setShowOpen] = useState(false);
  const [openSeason, setOpenSeason] = useState(1);
  const [openYear, setOpenYear] = useState(3);

  const plan: PlannedLine[] | null = useMemo(() => {
    if (stage < 1) return null;
    return planCommentary(PREVIEW_RESULT, a, b, {
      states: career.characters,
      leaderSlug: career.cupStartRanks?.[0] ?? null,
      rival: true,
      featured: true,
      playerSlug: career.playerSlug,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, matchKey, a, b, career]);
  const tape = useMemo(
    () => (stage < 2 ? null : buildMatchTape(career, a.slug, b.slug)),
    [stage, career, a.slug, b.slug],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-3">
        <SectionTitle>Meč po fazama prenosa</SectionTitle>
        <div className="flex flex-wrap justify-center gap-2">
          {STAGES.map((s, i) => (
            <button
              key={s.cups}
              onClick={() => {
                setStage(i);
                setMatchKey((k) => k + 1);
              }}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition ${
                stage === i
                  ? 'border-sky-200/60 bg-sky-200/10 text-sky-200'
                  : 'border-sky-200/15 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setMatchKey((k) => k + 1)}
            className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-300 transition hover:text-red-200"
          >
            Pusti ponovo
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {PAIRS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => {
                setPairIndex(i);
                setMatchKey((k) => k + 1);
              }}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition ${
                pairIndex === i
                  ? 'border-amber-300/60 bg-amber-300/10 text-amber-200'
                  : 'border-sky-200/15 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="w-full max-w-xl">
          <MatchViewer
            key={`${pairIndex}-${stage}-${matchKey}`}
            a={a}
            b={b}
            result={PREVIEW_RESULT}
            betSlug={a.slug}
            supportedSlug={a.slug}
            moodA={career.characters[a.slug]}
            moodB={career.characters[b.slug]}
            revealA={FULL_REVEAL}
            revealB={FULL_REVEAL}
            commentary={plan}
            tape={tape}
            onDone={() => setMatchKey((k) => k + 1)}
          />
        </div>
      </section>

      <section className="flex flex-col items-center gap-3">
        <SectionTitle>Studio uvod pred turnir</SectionTitle>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: SEASON_COUNT }, (_, season) => (
            <button
              key={season}
              onClick={() => setOpenSeason(season)}
              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition ${
                openSeason === season
                  ? 'border-amber-300/60 bg-amber-300/10 text-amber-200'
                  : 'border-sky-200/15 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {seasonName(season)}
            </button>
          ))}
          <button
            onClick={() => setOpenYear((y) => y + 1)}
            className="rounded-full border border-sky-200/15 bg-slate-900/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-slate-200"
          >
            Godina {openYear}: nova prognoza
          </button>
        </div>
        <button
          onClick={() => {
            setOpenKey((k) => k + 1);
            setShowOpen(true);
          }}
          className="rounded-xl border border-sky-200/25 bg-slate-800/70 px-5 py-2 text-xs font-semibold text-sky-200 transition hover:border-sky-200/50 hover:text-white"
        >
          Prikaži studio uvod
        </button>
        {showOpen && (
          <BroadcastOpenPanel
            key={openKey}
            career={{ ...career, season: openSeason, year: openYear }}
            characterBySlug={new Map(characters.map((c) => [c.slug, c]))}
            preview
          />
        )}
      </section>
    </div>
  );
}
