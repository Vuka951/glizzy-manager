'use client';

import { useState } from 'react';
import TournamentBracket from '@/components/games/tournament/TournamentBracket';
import TournamentPodium from '@/components/games/tournament/TournamentPodium';
import CareerTable from '@/components/games/career/CareerTable';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import { PRIZE_MONEY } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachTagMap, RoomView } from '@/lib/types/careerMp';
import { seasonThemeIndex } from '@/lib/utils/cupSeason';
import { fmt, ordinal, plural } from '@/lib/utils/format';
import { cupStandings } from '@/lib/utils/tournamentSim';

const SE = GAMES_UI.careerMp.seasonEnd;
const CAREER = GAMES_UI.career;

type Step = 'bracket' | 'podium' | 'recap' | 'standings';

// The season's last screens at the coach's own pace: the finished bracket
// with the champion lit, the podium, the morning-after paper, the table
export default function SeasonEndFlow({
  view,
  characterBySlug,
  coaches,
  onOpenDossier,
  onDone,
}: {
  view: RoomView;
  characterBySlug: Map<string, DuelCharacter>;
  coaches: CoachTagMap;
  onOpenDossier: (slug: string) => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState<Step>('bracket');
  const career = view.career;
  if (!career?.cup) return null;
  const cup = career.cup;
  const standings = cupStandings(cup.rounds);
  const mySlug = career.playerSlug;
  const me = characterBySlug.get(mySlug);
  const myPlace = standings.find((s) => s.slug === mySlug)?.place ?? 0;
  const prize = myPlace >= 1 && myPlace <= PRIZE_MONEY.length ? PRIZE_MONEY[myPlace - 1] : 0;
  const theme = seasonThemeIndex(career.season);
  const nextButton = (label: string, next: Step) => (
    <button
      onClick={() => setStep(next)}
      className="rounded-xl border border-red-500/40 bg-red-500/15 px-6 py-2.5 text-sm font-semibold text-red-200 transition hover:border-red-500/60 hover:bg-red-500/25 hover:text-white"
    >
      {label}
    </button>
  );

  if (step === 'bracket') {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200">
          {SE.bracket}
        </span>
        <div className="flex w-full overflow-x-auto [justify-content:safe_center]">
          <TournamentBracket
            rounds={cup.rounds}
            characterBySlug={characterBySlug}
            betSlug={mySlug}
            currentRound={cup.currentRound}
            matchBets={cup.matchBets}
            coaches={coaches}
          />
        </div>
        {nextButton(SE.toPodium, 'podium')}
      </div>
    );
  }
  if (step === 'podium') {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <p className="text-lg font-bold">
          {standings[0]?.slug === mySlug ? (
            <span className="text-green-400">
              {fmt(SE.champion, { name: me?.name ?? '' })}
            </span>
          ) : (
            <span className="text-red-400">
              {fmt(SE.playerPlace, {
                name: me?.name ?? '',
                place: ordinal(myPlace),
              })}
            </span>
          )}
        </p>
        {prize > 0 && (
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300">
            {plural(SE.prize, prize, { amount: prize })}
          </span>
        )}
        <TournamentPodium
          standings={standings}
          characterBySlug={characterBySlug}
          betSlug={mySlug}
          theme={theme}
        />
        {nextButton(SE.toRecap, 'recap')}
      </div>
    );
  }
  if (step === 'recap') {
    return (
      <NewspaperSpread
        news={career.cupRecap ?? []}
        season={career.season}
        year={career.year}
        characterBySlug={characterBySlug}
        cta={SE.toStandings}
        onDone={() => setStep('standings')}
        coaches={coaches}
      />
    );
  }
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <span className="rounded-full border border-sky-200/20 bg-slate-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-200 backdrop-blur-sm">
        {CAREER.table.finalTitle}
      </span>
      <div className="w-full max-w-2xl rounded-2xl bg-slate-950/60 backdrop-blur-sm">
        <CareerTable
          characters={career.characters}
          characterBySlug={characterBySlug}
          playerSlug={mySlug}
          lastCupRanks={career.lastCupRanks}
          rivalSlug={career.rivalSlug}
          onSelect={onOpenDossier}
          coaches={coaches}
        />
      </div>
      <button
        onClick={onDone}
        className="rounded-xl border border-red-500/40 bg-red-500/15 px-6 py-2.5 text-sm font-semibold text-red-200 transition hover:border-red-500/60 hover:bg-red-500/25 hover:text-white"
      >
        {SE.done}
      </button>
    </div>
  );
}
