'use client';

import { useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import TournamentBracket from '@/components/games/tournament/TournamentBracket';
import TournamentPodium from '@/components/games/tournament/TournamentPodium';
import CareerTable from '@/components/games/career/CareerTable';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import RoomSign from '@/components/games/career-mp/RoomSign';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachTagMap, RoomView } from '@/lib/types/careerMp';
import { cupPrizeFor, primeMinister } from '@/lib/utils/careerLaws';
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
  const prize = cupPrizeFor(myPlace);
  const theme = seasonThemeIndex(career.season);
  const nextButton = (label: string, next: Step) => (
    <CareerButton
      tone="danger"
      size="lg"
      onClick={() => setStep(next)}
    >
      {label}
    </CareerButton>
  );

  if (step === 'bracket') {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <RoomSign>{SE.bracket}</RoomSign>
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
        <PaperSheet className="flex max-w-lg rotate-[-0.5deg] flex-col items-center gap-1.5 px-5 py-2.5 text-center">
          <p className="font-serif text-lg font-bold leading-snug">
            {standings[0]?.slug === mySlug ? (
              <span className="text-emerald-300">
                {fmt(SE.champion, { name: me?.name ?? '' })}
              </span>
            ) : (
              <span className="text-red-300">
                {fmt(SE.playerPlace, {
                  name: me?.name ?? '',
                  place: ordinal(myPlace),
                })}
              </span>
            )}
          </p>
          {prize > 0 && (
            <BrassPlate className="tabular-nums">
              {plural(SE.prize, prize, { amount: prize })}
            </BrassPlate>
          )}
        </PaperSheet>
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
      <RoomSign>{CAREER.table.finalTitle}</RoomSign>
      <div className="w-full max-w-2xl">
        <CareerTable
          characters={career.characters}
          characterBySlug={characterBySlug}
          playerSlug={mySlug}
          lastCupRanks={career.lastCupRanks}
          rivalSlug={career.rivalSlug}
          primeMinisterSlug={primeMinister(career)}
          onSelect={onOpenDossier}
          coaches={coaches}
        />
      </div>
      <CareerButton
        tone="danger"
        size="lg"
        onClick={onDone}
      >
        {SE.done}
      </CareerButton>
    </div>
  );
}
