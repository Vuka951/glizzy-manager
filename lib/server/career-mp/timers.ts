import {
  closeCupPre,
  closeMatchBets,
  closePaper,
  closeSeasonEnd,
  endClip,
  everyonePassed,
  phaseExpired,
} from '@/lib/server/career-mp/cup';
import { BETS_CLOSING_MS } from '@/lib/constants/careerMp';
import { everyoneDone } from '@/lib/server/career-mp/reducer';
import { closeWindow } from '@/lib/server/career-mp/resolve';
import type { Room } from '@/lib/server/career-mp/room';

const MAX_STEPS = 64;

// One phase transition when its gate is open: the countdown ran out, the
// clip and its linger played out, or every coach is done
function step(room: Room, now: number): Room | null {
  if (room.status !== 'playing') return null;
  const expired = phaseExpired(room, now);
  switch (room.phase.kind) {
    case 'window':
      return expired || everyoneDone(room) ? closeWindow(room, now) : null;
    case 'paper':
      return expired || everyoneDone(room) ? closePaper(room, now) : null;
    case 'cup-pre':
      return expired || everyoneDone(room) ? closeCupPre(room, now) : null;
    case 'match-bets': {
      if (expired) return closeMatchBets(room, now);
      // Everyone has decided: a short countdown, then the clip
      const closingAt = now + BETS_CLOSING_MS;
      if (
        everyonePassed(room) &&
        (room.phase.deadline === null || room.phase.deadline > closingAt)
      ) {
        return { ...room, phase: { ...room.phase, deadline: closingAt } };
      }
      return null;
    }
    case 'match-clip':
      return expired ? endClip(room, now) : null;
    case 'season-end':
      return expired || everyoneDone(room) ? closeSeasonEnd(room, now) : null;
    default:
      return null;
  }
}

// Nothing fires a deadline on its own: every request first applies whatever
// has passed. A room nobody polls simply waits
export function advanceExpired(room: Room, now: number): Room {
  let current = room;
  for (let i = 0; i < MAX_STEPS; i++) {
    const next = step(current, now);
    if (!next) return current;
    current = next;
  }
  return current;
}
