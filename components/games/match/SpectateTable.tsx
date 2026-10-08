import GlizzyIcon from '@/components/icons/GlizzyIcon';
import LivesRow from '@/components/games/LivesRow';
import PortraitHead from '@/components/games/PortraitHead';
import SponsorActorGear from '@/components/games/career/SponsorActorGear';
import SpotIcon from '@/components/icons/SpotIcon';
import { studioAccents } from '@/lib/constants/studioThemes';
import MatchAudience from '@/components/games/match/MatchAudience';
import CoachTag from '@/components/games/career-mp/CoachTag';
import CrowdPot from '@/components/games/career-mp/CrowdPot';
import CrowdTokenEffect from '@/components/games/career-mp/CrowdTokenEffect';
import type { CoachTagMap, CoachTokens } from '@/lib/types/careerMp';
import MoodBubble from '@/components/games/career/MoodBubble';
import SniffCue from '@/components/games/match/SniffCue';
import SniffScent from '@/components/games/match/SniffScent';
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
import { hidingSpotLabel } from '@/lib/utils/localeNames';

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
  const accent = studioAccents(theme);
  const victoryBeat = useVictoryAnimation({
    active: outcome !== null && celebrate,
  });

  const seat = (side: 'top' | 'bottom') => {
    const character = side === 'top' ? top : bottom;
    const lives = side === 'top' ? topLives : bottomLives;
    const cap = side === 'top' ? topCap : bottomCap;
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
    const nameplate = (
      <span
        className={`flex items-center gap-1.5 text-xs font-semibold text-white transition-opacity duration-500 ${
          outcome ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {character.name}
        {coach && <CoachTag name={coach.name} color={coach.color} connected={coach.connected} />}
      </span>
    );
    return (
      <div
        className={`relative z-30 flex flex-col items-center gap-1 transition-opacity duration-700 ${
          exit === side ? 'opacity-0' : ''
        }`}
      >
        {side === 'top' && nameplate}
        {side === 'bottom' && stats && (
          <span
            className={`relative z-30 transition-opacity duration-500 ${
              outcome ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {stats}
          </span>
        )}
        {side === 'bottom' && (
          <div
            className={`transition-opacity duration-500 ${
              outcome ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <LivesRow lives={lives} cap={cap} />
          </div>
        )}
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
                betSlug === character.slug ? 'ring-2 ring-sky-300' : ''
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
        </div>
        {side === 'top' && (
          <div
            className={`transition-opacity duration-500 ${
              outcome ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <LivesRow lives={lives} cap={cap} />
          </div>
        )}
        {side === 'top' && stats && (
          <span
            className={`relative z-30 transition-opacity duration-500 ${
              outcome ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {stats}
          </span>
        )}

        {side === 'bottom' && nameplate}
      </div>
    );
  };

  return (
    <div className="relative isolate flex w-full max-w-xs flex-col items-center group-[:fullscreen]:max-w-sm">
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
          <span className="absolute -right-10 -top-8 z-30">
            <CrowdPot amount={coachTokens?.topPot ?? 0} />
          </span>
        )}
        {(coachTokens?.bottomPot ?? 0) > 0 && (
          <span className="absolute -bottom-10 -left-10 z-30">
            <CrowdPot amount={coachTokens?.bottomPot ?? 0} />
          </span>
        )}
        <div
          className={`relative rounded-xl border-2 ${accent.tableBorder} bg-gradient-to-b ${accent.tableSurface} px-2.5 pb-3 pt-3.5 shadow-xl`}
        >
          <div
            className={`absolute inset-x-2 top-1 h-px rounded-full ${accent.tableEdge}`}
          />
          <div className="grid grid-cols-3 gap-2">
            {HIDING_SPOTS.map((spot) => {
              const isReveal =
                phase.kind === 'reveal' && phase.spot === spot.id;
              const isHit = isReveal && phase.kind === 'reveal' && phase.hit;
              // Where the nose says the glizzy is, while the hand is still
              // deciding somewhere else
              const isSensed = !isReveal && sniffSpot === spot.id;
              return (
                <div
                  key={spot.id}
                  className="relative flex flex-col items-center gap-1"
                >
                  {isSensed && (
                    <SniffScent
                      direction={sniff === 'top' ? 'up' : 'down'}
                      className={`left-1/2 -translate-x-1/2 ${
                        sniff === 'top' ? '-top-4' : '-bottom-4'
                      }`}
                    />
                  )}
                  <div
                    className={`relative flex aspect-square w-full items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                      isReveal
                        ? isHit
                          ? 'border-red-500 bg-red-500/30 ring-2 ring-red-500/25'
                          : 'border-green-400 bg-green-400/15'
                        : isSensed
                          ? 'border-lime-400 bg-lime-400/10 ring-2 ring-lime-300/30'
                          : `${accent.tileBorder} bg-slate-900/80`
                    }`}
                  >
                    <SpotIcon
                      spot={spot.id}
                      variant={spotVariants[spot.id]}
                      className={`h-8 w-8 transition-all duration-500 sm:h-9 sm:w-9 ${
                        isReveal ? '-translate-y-5 rotate-6 opacity-70' : ''
                      } ${phase.kind === 'think' || phase.kind === 'place' ? 'animate-pulse' : ''}`}
                    />
                    <span
                      className={`absolute inset-x-0 bottom-1 flex justify-center transition-all delay-150 duration-500 ${
                        isHit
                          ? 'translate-y-0 scale-100 opacity-100'
                          : 'translate-y-2 scale-50 opacity-0'
                      }`}
                    >
                      <GlizzyIcon variant={glizzyVariant} className="h-5 w-8" />
                    </span>
                  </div>
                  <span
                    className={`text-[8px] font-bold uppercase tracking-widest ${accent.spotLabel}`}
                  >
                    {hidingSpotLabel(spot.id)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between px-6">
          <div
            className={`h-6 w-2.5 rounded-b-md bg-gradient-to-b ${accent.tableLeg}`}
          />
          <div
            className={`h-6 w-2.5 rounded-b-md bg-gradient-to-b ${accent.tableLeg}`}
          />
        </div>
      </div>

      <div className="relative z-30 -mt-4">{seat('bottom')}</div>
    </div>
  );
}
