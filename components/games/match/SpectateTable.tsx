'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import PortraitHead from '@/components/games/PortraitHead';
import SponsorActorGear from '@/components/games/career/SponsorActorGear';
import MatchAudience from '@/components/games/match/MatchAudience';
import MatchTablePlace from '@/components/games/match/MatchTablePlace';
import MatchTableSpot from '@/components/games/match/MatchTableSpot';
import MatchTableSurface from '@/components/games/match/MatchTableSurface';
import SeatTag from '@/components/games/rooms/SeatTag';
import CrowdPot from '@/components/games/career-mp/CrowdPot';
import CrowdTokenEffect from '@/components/games/career-mp/CrowdTokenEffect';
import type { CoachTagMap, CoachTokens } from '@/lib/types/careerMp';
import MoodBubble from '@/components/games/career/MoodBubble';
import SniffCue from '@/components/games/match/SniffCue';
import TurnRoleCue, { type TurnRole } from '@/components/games/TurnRoleCue';
import {
  useVictoryAnimation,
  type VictoryBeat,
} from '@/components/games/useVictoryAnimation';
import {
  HIDING_SPOTS,
  type DuelCharacter,
  type HidingSpotId,
} from '@/data/games/glizzyDuel';
import type { CharacterCareerState, SponsorId } from '@/lib/utils/careerSave';

// The hop runs twice inside VICTORY_HOP_MS, then the cheer loops
const WINNER_MOTION: Record<VictoryBeat, string> = {
  hop: 'animate-[fanjump_0.95s_ease-in-out_infinite] motion-reduce:animate-none',
  cheer:
    'animate-[fancheer_0.7s_ease-in-out_infinite] motion-reduce:animate-none',
};

const RAISED_ARMS = ['left-0 -rotate-[24deg]', 'right-0 rotate-[24deg]'];

export type SpectatePhase =
  | { kind: 'idle' }
  | { kind: 'place'; hider: 'top' | 'bottom'; glizzies?: 1 | 2 }
  | { kind: 'think'; seeker: 'top' | 'bottom' }
  | {
      kind: 'reveal';
      seeker: 'top' | 'bottom';
      spot: HidingSpotId;
      hit: boolean;
    };

export default function SpectateTable({
  top,
  bottom,
  topLives,
  bottomLives,
  topCap,
  bottomCap,
  topSponsor = null,
  bottomSponsor = null,
  topMood = null,
  bottomMood = null,
  topFame,
  bottomFame,
  spotVariants,
  glizzyVariant,
  phase,
  outcome,
  exit = null,
  celebrate = true,
  sick = null,
  sniff = null,
  sniffSpot = null,
  betSlug,
  theme = 0,
  topStats = null,
  bottomStats = null,
  topDelta = null,
  bottomDelta = null,
  topCoach = null,
  bottomCoach = null,
  coachTokens = null,
}: {
  top: DuelCharacter;
  bottom: DuelCharacter;
  topLives: number;
  bottomLives: number;
  topCap?: number;
  bottomCap?: number;
  topSponsor?: SponsorId | null;
  bottomSponsor?: SponsorId | null;
  topMood?: CharacterCareerState | null;
  bottomMood?: CharacterCareerState | null;
  topFame?: number;
  bottomFame?: number;
  spotVariants: Record<HidingSpotId, number>;
  glizzyVariant: number;
  phase: SpectatePhase;
  outcome: 'top' | 'bottom' | null;
  exit?: 'top' | 'bottom' | null;
  // Off when the loser is escorted off stage: nobody cheers over that
  celebrate?: boolean;
  sick?: 'top' | 'bottom' | null;
  sniff?: 'top' | 'bottom' | null;
  sniffSpot?: HidingSpotId | null;
  betSlug: string | null;
  theme?: number;
  // The career layer's read on each fighter, docked beside their name
  topStats?: React.ReactNode;
  bottomStats?: React.ReactNode;
  // What the last reveal did to the seat's meters, shown beside the portrait
  topDelta?: React.ReactNode;
  bottomDelta?: React.ReactNode;
  // A shared league: the coach behind each seat, and the coaches in the stands
  topCoach?: CoachTagMap[string] | null;
  bottomCoach?: CoachTagMap[string] | null;
  coachTokens?: CoachTokens | null;
}) {
  const street = useCareerFrames() === 'street';
  const victoryBeat = useVictoryAnimation({
    active: outcome !== null && celebrate,
  });

  const seat = (side: 'top' | 'bottom') => {
    const character = side === 'top' ? top : bottom;
    const mood = side === 'top' ? topMood : bottomMood;
    const role: TurnRole | null =
      phase.kind === 'place' && phase.hider === side
        ? 'placing'
        : phase.kind === 'think' && phase.seeker === side
          ? 'guessing'
          : null;
    const isWinner = outcome === side;
    const stats = side === 'top' ? topStats : bottomStats;
    const delta = side === 'top' ? topDelta : bottomDelta;
    const sponsor = side === 'top' ? topSponsor : bottomSponsor;
    const coach = side === 'top' ? topCoach : bottomCoach;
    // The name hangs off the bottom of the portrait like a ribbon, which
    // leaves the space above the head to the mood bubble
    const nameplate = street ? (
      <span
        className={`absolute left-1/2 top-full z-30 -mt-2.5 flex -translate-x-1/2 whitespace-nowrap transition-opacity duration-500 ${
          outcome ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <BrassPlate>
          {character.name}
          {coach && <SeatTag name={coach.name} color={coach.color} connected={coach.connected} />}
        </BrassPlate>
      </span>
    ) : (
      <span
        className={`absolute left-1/2 top-full z-30 -mt-2.5 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border border-sky-200/15 bg-slate-950/85 px-2 py-px text-[11px] font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.5)] transition-opacity duration-500 ${
          outcome ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {character.name}
        {coach && <SeatTag name={coach.name} color={coach.color} connected={coach.connected} />}
      </span>
    );
    return (
      <div
        className={`relative z-30 flex flex-col items-center gap-3 transition-opacity duration-700 ${
          exit === side ? 'opacity-0' : ''
        } ${side === 'top' ? 'pt-5' : ''}`}
      >
        <div className="relative z-20">
          <div
            className={`relative transition-all duration-500 ${
              isWinner ? 'z-30' : 'z-20'
            } ${victoryBeat && isWinner ? WINNER_MOTION[victoryBeat] : ''} ${
              victoryBeat && !isWinner
                ? 'translate-y-1 rotate-6 opacity-50 grayscale'
                : ''
            }`}
          >
            {victoryBeat &&
              isWinner &&
              RAISED_ARMS.map((arm) => (
                <span
                  key={arm}
                  className={`absolute bottom-1/2 h-9 w-1.5 origin-bottom rounded-full border border-slate-950/40 bg-amber-200 ${arm}`}
                />
              ))}
            <PortraitHead
              character={character}
              className={`h-11 w-11 transition-all duration-500 sm:h-12 sm:w-12 ${
                betSlug === character.slug
                  ? street
                    ? 'ring-2 ring-[#fcd34d]'
                    : 'ring-2 ring-sky-300'
                  : ''
              } ${sick === side ? '[filter:sepia(1)_hue-rotate(55deg)_saturate(2.6)]' : ''}`}
            />
            {sponsor && <SponsorActorGear sponsorId={sponsor} variant="seat" />}
            {sick === side && (
              <svg
                viewBox="0 0 30 20"
                className="absolute -bottom-3 left-1/2 z-10 h-5 w-8 -translate-x-1/4 animate-[bubblein_0.3s_ease-out]"
                aria-hidden="true"
              >
                <path
                  d="M4 0 q 4 8 14 11 -9 2 -16 -3 z"
                  className="fill-lime-400"
                />
                <ellipse
                  cx="16"
                  cy="17"
                  rx="10"
                  ry="2.6"
                  className="fill-lime-500/80"
                />
                <circle cx="7" cy="14" r="1.2" className="fill-lime-300" />
                <circle cx="24" cy="15" r="1" className="fill-lime-300" />
              </svg>
            )}
            {role && (
              <TurnRoleCue
                role={role}
                glizzyVariant={glizzyVariant}
                glizzies={phase.kind === 'place' ? (phase.glizzies ?? 1) : 1}
                compact
                tailSide={side === 'top' ? 'right' : 'left'}
                className={`absolute top-1 ${side === 'top' ? '-left-9' : '-right-9'}`}
              />
            )}
            {sniff === side && (
              <SniffCue
                tailSide={side === 'top' ? 'left' : 'right'}
                className={`absolute top-1 ${side === 'top' ? '-right-10' : '-left-10'}`}
              />
            )}
            {mood && <MoodBubble ch={mood} small />}
            {delta && (
              <span className="absolute right-full top-1 z-30 mr-1.5">
                {delta}
              </span>
            )}
            {victoryBeat === 'cheer' && isWinner && (
              <CrowdTokenEffect outcome="won" variant={1} />
            )}
          </div>
          {nameplate}
        </div>
        {stats && (
          <span
            className={`relative z-30 transition-opacity duration-500 ${
              outcome ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {stats}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="relative isolate flex w-full max-w-xs flex-col items-center group-fullscreen:max-w-sm">
      <MatchAudience
        top={top}
        bottom={bottom}
        topSponsor={topSponsor}
        bottomSponsor={bottomSponsor}
        signSeed={glizzyVariant}
        topFame={topFame}
        bottomFame={bottomFame}
        coachTokens={coachTokens}
      />
      {seat('top')}

      <div className="relative z-10 mt-2 w-full">
        {/* The money on each side, piled at the table's corner away from the
            sponsor board: the top seat's pot top right, the bottom seat's
            bottom left */}
        {(coachTokens?.topPot ?? 0) > 0 && (
          <span className="absolute -right-1 -top-8 z-30 sm:-right-10">
            <CrowdPot amount={coachTokens?.topPot ?? 0} />
          </span>
        )}
        {(coachTokens?.bottomPot ?? 0) > 0 && (
          <span className="absolute -bottom-10 -left-1 z-30 sm:-left-10">
            <CrowdPot amount={coachTokens?.bottomPot ?? 0} />
          </span>
        )}
        <MatchTableSurface
          theme={theme}
          top={
            <MatchTablePlace
              lives={topLives}
              cap={topCap}
              theme={theme}
              side="top"
              hidden={outcome !== null}
            />
          }
          bottom={
            <MatchTablePlace
              lives={bottomLives}
              cap={bottomCap}
              theme={theme}
              side="bottom"
              hidden={outcome !== null}
            />
          }
        >
          {HIDING_SPOTS.map((spot) => {
            const isReveal = phase.kind === 'reveal' && phase.spot === spot.id;
            return (
              <MatchTableSpot
                key={spot.id}
                spot={spot}
                variant={spotVariants[spot.id]}
                glizzyVariant={glizzyVariant}
                theme={theme}
                reveal={
                  isReveal && phase.kind === 'reveal'
                    ? phase.hit
                      ? 'hit'
                      : 'miss'
                    : null
                }
                sensedFrom={!isReveal && sniffSpot === spot.id ? sniff : null}
                busy={phase.kind === 'think' || phase.kind === 'place'}
              />
            );
          })}
        </MatchTableSurface>
      </div>

      <div className="relative z-30 -mt-4">{seat('bottom')}</div>
    </div>
  );
}
