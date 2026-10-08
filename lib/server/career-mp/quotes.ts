import { sharedCareer } from '@/lib/server/career-mp/lens';
import type { LeagueState, Room } from '@/lib/server/career-mp/room';
import type { PhaseState, Stage } from '@/lib/types/careerMp';
import {
  buildMatchResultEvent,
  matchRoundKind,
  quoteRollSeed,
  quoteScenesFor,
  type QuoteEvent,
  type QuotePlayback,
} from '@/lib/utils/quoteCutsceneTriggers';
import type { CupMatchResult } from '@/lib/utils/tournamentSim';

// Each event puts its scenes on the league news, once per scene per season,
// for whichever character the situation fell on. A match between two
// characters no coach in the room runs rolls at a lower chance, the coaches'
// characters being the league's humanSlugs. The roll happens here on the
// server, so every screen airs the same scene with the same speaker and
// words; the plays wait in the league until the next phase carries them to
// every screen at once
export function cueQuotes(room: Room, events: QuoteEvent[]): Room {
  const l = room.league;
  if (!l || events.length === 0) return room;
  const seed = `${room.createdAt}:${quoteRollSeed(l)}`;
  let fired = l.quoteScenesFired ?? [];
  const plays: QuotePlayback[] = [];
  events.forEach((event) => {
    const cued = quoteScenesFor(event, { fired, seed, coached: l.humanSlugs });
    fired = [...fired, ...cued.map((play) => play.id)];
    plays.push(...cued);
  });
  if (plays.length === 0) return room;
  return {
    ...room,
    league: {
      ...l,
      quoteScenesFired: fired,
      pendingQuotes: [...(l.pendingQuotes ?? []), ...plays],
    },
  };
}

export function cueMatchResult(
  room: Room,
  stage: Stage,
  a: string,
  b: string,
  result: CupMatchResult,
): Room {
  const l = room.league;
  if (!l) return room;
  const round = matchRoundKind(stage.round, l.cup?.rounds.length ?? 1);
  return cueQuotes(room, [
    buildMatchResultEvent(sharedCareer(l, 'cup'), a, b, result, round),
  ]);
}

// The waiting plays move onto the phase every screen is about to enter
export function attachQuotes(room: Room): Room {
  const l = room.league;
  if (!l || room.phase.kind === 'finished') return room;
  const plays = l.pendingQuotes ?? [];
  if (plays.length === 0) return room;
  const seq = (l.quoteSeq ?? 0) + 1;
  const phase: PhaseState = {
    ...room.phase,
    quotes: [...(room.phase.quotes ?? []), { seq, plays }],
  };
  return {
    ...room,
    league: { ...l, pendingQuotes: [], quoteSeq: seq },
    phase,
  };
}

// Cues on a clip that nobody has watched to the result yet go back into the
// league, so the phase that replaces the clip still airs them
export function reclaimPhaseQuotes(room: Room): Room {
  const l = room.league;
  const cues = room.phase.kind === 'finished' ? undefined : room.phase.quotes;
  if (!l || !cues || cues.length === 0) return room;
  return {
    ...room,
    league: {
      ...l,
      pendingQuotes: [
        ...cues.flatMap((cue) => cue.plays),
        ...(l.pendingQuotes ?? []),
      ],
    },
  };
}

export function resetQuotesForSeason(league: LeagueState): LeagueState {
  return { ...league, pendingQuotes: [], quoteScenesFired: [] };
}
