import {
  closeCupPre,
  closeMatchBets,
  closePaper,
  closeSeasonEnd,
  wrapYear,
  endClip,
  everyonePassed,
  phaseExpired,
} from '@/lib/server/career-mp/cup';
import { BETS_CLOSING_MS } from '@/lib/constants/careerMp';
import {
  closeCoalition,
  coalitionVotesIn,
} from '@/lib/server/career-mp/coalition';
import {
  autoPickLaw,
  lawVotesIn,
  settleLaws,
} from '@/lib/server/career-mp/laws';
import { everyoneDone } from '@/lib/server/career-mp/reducer';
import { closeWindow } from '@/lib/server/career-mp/resolve';
import type { Room } from '@/lib/server/career-mp/room';

// One phase transition when its gate is open: the countdown ran out, the
// clip and its linger played out, or every coach is done
export function step(room: Room, now: number): Room | null {
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
    case 'coalition':
      return expired || coalitionVotesIn(room)
        ? closeCoalition(room, now)
        : null;
    case 'laws':
      // A picker who let the clock run out gets the AI's card and the roll
      // call opens; the vote closes once every human is in or on the clock
      if (room.phase.stage === 'pick') {
        return expired ? autoPickLaw(room, now) : null;
      }
      return expired || lawVotesIn(room)
        ? wrapYear(settleLaws(room, now), null, null, now)
        : null;
    default:
      return null;
  }
}
