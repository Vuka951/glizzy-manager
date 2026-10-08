import type { SponsorId } from '@/lib/utils/careerSave';
import {
  DEFAULT_AI_PROFILE,
  DUEL_AI_PROFILES,
  HIDING_SPOTS,
  STARTING_LIVES,
  type DuelAiProfile,
  type HidingSpotId,
} from '@/data/games/glizzyDuel';
import { weightedPick } from '@/lib/utils/weightedPick';

export type { HidingSpotId } from '@/data/games/glizzyDuel';

export const CUP_BRACKET_SIZE = 16;

const MAX_TIEBREAK_ROUNDS = 8;
const STRESS_RED_ZONE = 80;
const STRESS_LIMIT = 100;
const STRESS_EAT_GAIN = 6;
const STRESS_TIEBREAK_GAIN = 2;
const STRESS_MISS_RELIEF = 1;
const RED_ZONE_MELTDOWN_SCALE = 200;
const OVERFULL_RISK_SCALE = 200;
const APPETITE_BINGE_ZONE = 80;
const APPETITE_FULL_FORFEIT = 20;
const APPETITE_CRITICAL_FORFEIT = 10;
const DEFAULT_FULLNESS_DROP = 8;

// Matches the historical fixed cap of 10 seeks at the default 3 lives
function maxSeekTurns(livesA: number, livesB: number): number {
  return 4 + 2 * Math.max(livesA, livesB);
}

// Turns past the seek cap can only come from the sudden-death tiebreaker:
// the index of the first such turn, or -1 when regulation settled it
export function tiebreakStartTurn(result: CupMatchResult): number {
  const cap = maxSeekTurns(result.livesCapA ?? 3, result.livesCapB ?? 3);
  return result.turns.length > cap ? cap : -1;
}

export function resultHadTiebreak(result: CupMatchResult): boolean {
  return tiebreakStartTurn(result) >= 0;
}

export type CupTurn = {
  matchRound: number;
  seeker: 'a' | 'b';
  picked: HidingSpotId;
  hidden: HidingSpotId;
  // Sudden death puts a second glizzy on the table; absent in regulation and
  // on tapes recorded before it
  secondHidden?: HidingSpotId;
  hit: boolean;
};

export type MatchEventKind =
  | 'police'
  | 'removed'
  | 'meltdown'
  | 'overfull-forfeit'
  | 'binge-grab'
  | 'random-pick'
  | 'sniff-dodge'
  // Never stored on a result: the frame builder reads sudden death off the
  // turn count and stages the whistle before its first seek
  | 'tiebreak';

// The kinds that end a match; everything else only decorates the turn it
// happened on
export const FORFEIT_EVENT_KINDS = new Set<MatchEventKind>([
  'police',
  'removed',
  'meltdown',
  'overfull-forfeit',
]);

// afterTurn is an index into turns; -1 means before the first turn
export type MatchEvent = {
  afterTurn: number;
  side: 'a' | 'b';
  kind: MatchEventKind;
};

export type MatchMeterSnapshot = {
  stressA: number;
  stressB: number;
  appetiteA: number;
  appetiteB: number;
};

export type MatchForfeitReason =
  'meltdown' | 'overfull-forfeit' | 'police' | 'withdrawn' | 'removed';

export type MatchParticipant = {
  profile: DuelAiProfile;
  lives?: number;
  stress?: number;
  stressGainScale?: number;
  appetite?: number;
  fullnessDrop?: number;
  seekAvoidance?: number;
  scriptedForfeit?: 'police' | 'withdrawn' | 'removed' | null;
};

export type CupMatchResult = {
  turns: CupTurn[];
  livesA: number;
  livesB: number;
  winner: 'a' | 'b';
  reason?: MatchForfeitReason | null;
  // The party whose people walked the loser out, on a removal
  removedBy?: SponsorId;
  events?: MatchEvent[];
  livesCapA?: number;
  livesCapB?: number;
  exit?: {
    stressA: number;
    stressB: number;
    appetiteA: number;
    appetiteB: number;
  };
  // Both sides' cholesterol and appetite before the first turn and after each
  // turn since, so the viewer can move the meters as the match plays out
  meters?: MatchMeterSnapshot[];
};

export type CupMatch = {
  round: number;
  index: number;
  a: string | null;
  b: string | null;
  result: CupMatchResult | null;
};

export type CupStanding = { slug: string; place: number };

export type CupMatchBet = {
  side: 'a' | 'b';
  stake: number;
  // Odds locked in when the bet is placed; absent on flat-multiplier bets
  odds?: number;
  won?: boolean;
  payout?: number;
};

export function cupBetKey(round: number, index: number): string {
  return `${round}-${index}`;
}

export function profileFor(slug: string): DuelAiProfile {
  return DUEL_AI_PROFILES[slug] ?? DEFAULT_AI_PROFILE;
}

type SideState = {
  profile: DuelAiProfile;
  cap: number;
  eaten: number;
  stress: number | null;
  stressGainScale: number;
  appetite: number | null;
  fullnessDrop: number;
  seekAvoidance: number | null;
};

function sideState(p: MatchParticipant): SideState {
  return {
    profile: p.profile,
    cap: p.lives ?? STARTING_LIVES,
    eaten: 0,
    stress: p.stress ?? null,
    stressGainScale: p.stressGainScale ?? 1,
    appetite: p.appetite ?? null,
    fullnessDrop: p.fullnessDrop ?? DEFAULT_FULLNESS_DROP,
    seekAvoidance: p.seekAvoidance ?? null,
  };
}

// Characters alternate seeking until someone eats their last glizzy, capped by
// maxSeekTurns; from there it is sudden death, first life lost loses. Optional
// participant layers (stress, appetite, scripted forfeits) can end it early.
export function simulateMatch(
  pa: MatchParticipant,
  pb: MatchParticipant,
): CupMatchResult {
  const turns: CupTurn[] = [];
  const events: MatchEvent[] = [];
  const state: Record<'a' | 'b', SideState> = {
    a: sideState(pa),
    b: sideState(pb),
  };
  const layered =
    state.a.stress !== null ||
    state.b.stress !== null ||
    state.a.appetite !== null ||
    state.b.appetite !== null;

  const meters: MatchMeterSnapshot[] = [];
  const snapshot = () => {
    if (!layered) return;
    meters.push({
      stressA: Math.round(state.a.stress ?? 0),
      stressB: Math.round(state.b.stress ?? 0),
      appetiteA: Math.round(state.a.appetite ?? 0),
      appetiteB: Math.round(state.b.appetite ?? 0),
    });
  };
  snapshot();

  let loser: 'a' | 'b' | null = null;
  let reason: MatchForfeitReason | null = null;

  const scripted = (side: 'a' | 'b') =>
    (side === 'a' ? pa.scriptedForfeit : pb.scriptedForfeit) ?? null;
  for (const side of ['a', 'b'] as const) {
    // Morale so low he never shows up, or the party's people at the door:
    // a pre-match walkover either way
    const script = scripted(side);
    if (script === 'withdrawn' || script === 'removed') {
      loser = side;
      reason = script;
      // The escort gets its own interlude before the empty table
      if (script === 'removed') {
        events.push({ afterTurn: -1, side, kind: 'removed' });
      }
      break;
    }
  }
  // Two warrants at one table: the officers take one of them, the other
  // keeps his date with them for the next round
  const policeSides = loser
    ? []
    : (['a', 'b'] as const).filter((side) => scripted(side) === 'police');
  const policeSide =
    policeSides.length > 0
      ? policeSides[Math.floor(Math.random() * policeSides.length)]
      : null;
  const policeAt = policeSide ? 2 + Math.floor(Math.random() * 3) : null;

  const bumpStress = (side: 'a' | 'b', amount: number) => {
    const s = state[side];
    if (s.stress === null) return;
    s.stress = Math.min(STRESS_LIMIT, s.stress + amount * s.stressGainScale);
  };
  // An empty hand is a breath: the relief is flat, form does not scale it
  const relieveStress = (side: 'a' | 'b') => {
    const s = state[side];
    if (s.stress === null) return;
    s.stress = Math.max(0, s.stress - STRESS_MISS_RELIEF);
  };

  const seekTurn = (
    matchRound: number,
    seeker: 'a' | 'b',
    glizzies: 1 | 2,
  ): boolean => {
    const s = state[seeker];
    const hider = state[seeker === 'a' ? 'b' : 'a'];
    const hideWeight = (spot: (typeof HIDING_SPOTS)[number]) =>
      hider.profile.hide[spot.id] ?? 1;
    const hidden = weightedPick(HIDING_SPOTS, hideWeight).id;
    const secondHidden =
      glizzies === 2
        ? weightedPick(
            HIDING_SPOTS.filter((spot) => spot.id !== hidden),
            hideWeight,
          ).id
        : undefined;
    const loaded = (spot: HidingSpotId) =>
      spot === hidden || spot === secondHidden;
    let picked: HidingSpotId;
    if (
      s.appetite !== null &&
      s.appetite > APPETITE_BINGE_ZONE &&
      Math.random() < (s.appetite - APPETITE_BINGE_ZONE) / 60
    ) {
      picked = hidden;
      events.push({
        afterTurn: turns.length,
        side: seeker,
        kind: 'binge-grab',
      });
    } else if (
      s.stress !== null &&
      s.stress > STRESS_RED_ZONE &&
      Math.random() < (s.stress - STRESS_RED_ZONE) / 40
    ) {
      picked = HIDING_SPOTS[Math.floor(Math.random() * HIDING_SPOTS.length)].id;
      events.push({
        afterTurn: turns.length,
        side: seeker,
        kind: 'random-pick',
      });
    } else {
      const seekWeight = (spot: (typeof HIDING_SPOTS)[number]) =>
        s.profile.seek[spot.id] ?? 1;
      picked = weightedPick(HIDING_SPOTS, seekWeight).id;
      // A trained nose gets one warning: when the hand goes for a spot with a
      // glizzy in it, the smell pulls it back and the turn is spent somewhere
      // else, which in sudden death may be the other loaded spot
      if (
        s.seekAvoidance !== null &&
        loaded(picked) &&
        Math.random() > s.seekAvoidance
      ) {
        const sensed = picked;
        picked = weightedPick(
          HIDING_SPOTS.filter((spot) => spot.id !== sensed),
          seekWeight,
        ).id;
        events.push({
          afterTurn: turns.length,
          side: seeker,
          kind: 'sniff-dodge',
        });
      }
    }
    const hit = loaded(picked);
    turns.push({
      matchRound,
      seeker,
      picked,
      hidden,
      ...(secondHidden ? { secondHidden } : {}),
      hit,
    });
    if (hit) {
      s.eaten++;
      bumpStress(seeker, STRESS_EAT_GAIN);
      if (s.appetite !== null)
        s.appetite = Math.max(0, s.appetite - s.fullnessDrop);
    } else {
      relieveStress(seeker);
    }
    snapshot();
    return hit;
  };

  // Layer checks after every turn; ordered so the most dramatic exit wins
  const checkExits = (): boolean => {
    for (const side of ['a', 'b'] as const) {
      const s = state[side];
      // In the red zone every check risks a collapse; at the limit it is certain
      if (
        s.stress !== null &&
        (s.stress >= STRESS_LIMIT ||
          (s.stress > STRESS_RED_ZONE &&
            Math.random() <
              (s.stress - STRESS_RED_ZONE) / RED_ZONE_MELTDOWN_SCALE))
      ) {
        loser = side;
        reason = 'meltdown';
        events.push({ afterTurn: turns.length - 1, side, kind: 'meltdown' });
        return true;
      }
      // Overfull below 20 can crack any turn; below 10 or after a second
      // glizzy it is certain
      if (
        s.appetite !== null &&
        s.eaten > 0 &&
        (s.appetite < APPETITE_CRITICAL_FORFEIT ||
          (s.appetite < APPETITE_FULL_FORFEIT &&
            (s.eaten >= 2 ||
              Math.random() <
                (APPETITE_FULL_FORFEIT - s.appetite) / OVERFULL_RISK_SCALE)))
      ) {
        loser = side;
        reason = 'overfull-forfeit';
        events.push({
          afterTurn: turns.length - 1,
          side,
          kind: 'overfull-forfeit',
        });
        return true;
      }
    }
    if (policeSide && policeAt !== null && turns.length >= policeAt) {
      loser = policeSide;
      reason = 'police';
      events.push({
        afterTurn: turns.length - 1,
        side: policeSide,
        kind: 'police',
      });
      return true;
    }
    return false;
  };

  const maxSeeks = maxSeekTurns(state.a.cap, state.b.cap);
  let matchRound = 0;
  let seeks = 0;
  while (loser === null && seeks < maxSeeks) {
    matchRound++;
    for (const seeker of ['a', 'b'] as const) {
      seeks++;
      seekTurn(matchRound, seeker, 1);
      if (state.a.eaten >= state.a.cap) loser = 'a';
      else if (state.b.eaten >= state.b.cap) loser = 'b';
      if (loser === null && checkExits()) break;
      if (loser || seeks >= maxSeeks) break;
    }
  }

  // At the turn cap whoever has fewer glizzies left loses outright; only a
  // true tie in remaining lives goes to sudden death
  const leftA = state.a.cap - state.a.eaten;
  const leftB = state.b.cap - state.b.eaten;
  if (loser === null && leftA !== leftB) {
    loser = leftA < leftB ? 'a' : 'b';
  }

  // Sudden death tiebreaker: two glizzies on the table, the first seeker to
  // grab one loses
  let tiebreakRounds = 0;
  while (loser === null && tiebreakRounds < MAX_TIEBREAK_ROUNDS) {
    matchRound++;
    tiebreakRounds++;
    for (const seeker of ['a', 'b'] as const) {
      bumpStress(seeker, STRESS_TIEBREAK_GAIN);
      if (seekTurn(matchRound, seeker, 2)) {
        loser = seeker;
        break;
      }
      if (checkExits()) break;
    }
  }
  if (loser === null) {
    matchRound++;
    const victim: 'a' | 'b' = Math.random() < 0.5 ? 'a' : 'b';
    const spot =
      HIDING_SPOTS[Math.floor(Math.random() * HIDING_SPOTS.length)].id;
    turns.push({
      matchRound,
      seeker: victim,
      picked: spot,
      hidden: spot,
      secondHidden: HIDING_SPOTS.find((s) => s.id !== spot)?.id ?? spot,
      hit: true,
    });
    state[victim].eaten++;
    snapshot();
    loser = victim;
  }

  const result: CupMatchResult = {
    turns,
    livesA: Math.max(0, state.a.cap - state.a.eaten),
    livesB: Math.max(0, state.b.cap - state.b.eaten),
    winner: loser === 'a' ? 'b' : 'a',
  };
  if (reason) result.reason = reason;
  if (events.length > 0) result.events = events;
  if (state.a.cap !== STARTING_LIVES) result.livesCapA = state.a.cap;
  if (state.b.cap !== STARTING_LIVES) result.livesCapB = state.b.cap;
  if (layered) {
    result.exit = {
      stressA: state.a.stress ?? 0,
      stressB: state.b.stress ?? 0,
      appetiteA: state.a.appetite ?? 0,
      appetiteB: state.b.appetite ?? 0,
    };
    result.meters = meters;
  }
  return result;
}

export function resolveCupMatch(
  rounds: CupMatch[][],
  round: number,
  index: number,
  result: CupMatchResult,
): CupMatch[][] {
  const next = rounds.map((r) => r.map((m) => ({ ...m })));
  const match = next[round][index];
  match.result = result;
  const winner = result.winner === 'a' ? match.a : match.b;
  if (round + 1 < next.length) {
    const target = next[round + 1][Math.floor(index / 2)];
    if (index % 2 === 0) target.a = winner;
    else target.b = winner;
  }
  return next;
}

export function cupMatchWinner(match: CupMatch): string | null {
  if (!match.result) return null;
  return match.result.winner === 'a' ? match.a : match.b;
}

export function cupMatchLoser(match: CupMatch): string | null {
  if (!match.result) return null;
  return match.result.winner === 'a' ? match.b : match.a;
}

// Placements for a fully played bracket: losers of later rounds place higher,
// same-round losers ranked by glizzies they had left when they fell.
// A forfeiter always ranks below anyone who lost fighting.
export function cupStandings(rounds: CupMatch[][]): CupStanding[] {
  const final = rounds[rounds.length - 1][0];
  const standings: CupStanding[] = [];
  const champion = cupMatchWinner(final);
  if (champion) standings.push({ slug: champion, place: 1 });
  for (let r = rounds.length - 1; r >= 0; r--) {
    const losers = rounds[r]
      .filter((m) => m.result)
      .map((m) => ({
        slug: cupMatchLoser(m) as string,
        lives: m.result!.reason
          ? -1
          : m.result!.winner === 'a'
            ? m.result!.livesB
            : m.result!.livesA,
      }))
      .sort((x, y) => y.lives - x.lives);
    losers.forEach((loser) =>
      standings.push({ slug: loser.slug, place: standings.length + 1 }),
    );
  }
  return standings;
}
