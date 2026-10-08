import {
  FORFEIT_EVENT_KINDS,
  tiebreakStartTurn,
  type CupMatchResult,
  type MatchEvent,
} from '@/lib/utils/tournamentSim';

export const INTRO_MS = 900;
export const PLACE_MS = 1800;
export const THINK_MS = 1800;
export const REVEAL_MS = 1200;
export const EVENT_MS = 2600;
export const TIEBREAK_MS = 2200;

export type MatchFrame =
  | { kind: 'intro'; ms: number }
  | { kind: 'place'; turnIndex: number; ms: number }
  | { kind: 'think'; turnIndex: number; ms: number }
  | { kind: 'reveal'; turnIndex: number; ms: number }
  | { kind: 'event'; event: MatchEvent; ms: number };

// Events that pause the playback with their own frame; the rest only decorate
// the turn they happened on
export function isInterruptEvent(event: MatchEvent): boolean {
  return FORFEIT_EVENT_KINDS.has(event.kind);
}

export function buildMatchFrames(result: CupMatchResult): MatchFrame[] {
  const frames: MatchFrame[] = [{ kind: 'intro', ms: INTRO_MS }];
  const interrupts = (result.events ?? []).filter(isInterruptEvent);
  const pushInterrupts = (afterTurn: number) => {
    interrupts
      .filter((event) => event.afterTurn === afterTurn)
      .forEach((event) => frames.push({ kind: 'event', event, ms: EVENT_MS }));
  };
  pushInterrupts(-1);
  const tiebreakAt = tiebreakStartTurn(result);
  result.turns.forEach((turn, turnIndex) => {
    // Extra time gets its whistle before the first sudden-death seek
    if (turnIndex === tiebreakAt) {
      frames.push({
        kind: 'event',
        event: { afterTurn: turnIndex - 1, side: turn.seeker, kind: 'tiebreak' },
        ms: TIEBREAK_MS,
      });
    }
    frames.push({ kind: 'place', turnIndex, ms: PLACE_MS });
    frames.push({ kind: 'think', turnIndex, ms: THINK_MS });
    frames.push({ kind: 'reveal', turnIndex, ms: REVEAL_MS });
    pushInterrupts(turnIndex);
  });
  return frames;
}

// A turn only counts once its reveal frame has fully played out
export function revealedTurnCount(frames: MatchFrame[], frameIndex: number): number {
  let count = 0;
  for (let i = 0; i < Math.min(frameIndex, frames.length); i++) {
    const frame = frames[i];
    if (frame.kind === 'reveal') count = frame.turnIndex + 1;
  }
  return count;
}
