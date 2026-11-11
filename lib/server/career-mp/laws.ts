import { DEFAULT_LAWS_SECONDS } from '@/lib/constants/careerMp';
import { mergeShared, sharedCareer } from '@/lib/server/career-mp/lens';
import { attachQuotes } from '@/lib/server/career-mp/quotes';
import type { CoachState, LeagueState, Room } from '@/lib/server/career-mp/room';
import { ActionError } from '@/lib/server/rooms/errors';
import { logEvent } from '@/lib/server/rooms/log';
import { deadlineFor } from '@/lib/server/rooms/presence';
import {
  aiLawPick,
  applyLawBallot,
  closeLawBallot,
  lawBallotReady,
  lawLetterFor,
  lawPickerIsHuman,
  lawVoteDue,
  lawVoter,
  openLawBallot,
  pickLawCard,
  voteLaw,
  type LawBallot,
  type LawVote,
} from '@/lib/utils/careerLaws';
import { pendingHumans } from '@/lib/utils/careerParliamentVote';

function lawsDeadline(room: Room, now: number): number | null {
  const seconds =
    room.settings.lawsSeconds === undefined
      ? DEFAULT_LAWS_SECONDS
      : room.settings.lawsSeconds;
  return deadlineFor(seconds, now);
}

function withBallot(league: LeagueState, ballot: LawBallot): LeagueState {
  if (!league.parliament) throw new ActionError('no-parliament');
  return {
    ...league,
    parliament: { ...league.parliament, lawBallot: ballot },
  };
}

function openBallot(room: Room): { league: LeagueState; ballot: LawBallot } {
  const league = room.league;
  if (!league) throw new ActionError('bad-room');
  const ballot = league.parliament?.lawBallot;
  if (room.phase.kind !== 'laws' || !ballot || ballot.outcome !== null)
    throw new ActionError('bad-phase');
  return { league, ballot };
}

// The vote is in: the AI fills every gap, the books change, the paper gets
// its story and every coach a letter. The phase is the caller's to move on
export function settleLaws(room: Room, now: number): Room {
  const league = room.league;
  const ballot = league?.parliament?.lawBallot;
  if (!league || !ballot) return room;
  const shared = sharedCareer(league);
  const closed = closeLawBallot(shared, ballot);
  let next = mergeShared(league, applyLawBallot(shared, closed));
  const letter = lawLetterFor(closed);
  if (letter) {
    const coachStates: Record<string, CoachState> = {};
    Object.entries(next.coachStates).forEach(([coachId, cs]) => {
      coachStates[coachId] = { ...cs, mail: [...cs.mail, { ...letter }] };
    });
    next = { ...next, coachStates };
  }
  return logEvent({ ...room, league: next }, now, 'laws-closed', {
    outcome: closed.outcome ?? '',
  });
}

// After the Frozen cup of a law year the chamber sits. A vote that waits on
// a human opens the laws phase; one the AI settles on its own is applied on
// the spot and the year carries on
export function openLaws(room: Room, now: number): { room: Room; open: boolean } {
  const league = room.league;
  if (!league) return { room, open: false };
  const shared = sharedCareer(league);
  if (!lawVoteDue(shared)) return { room, open: false };
  const ballot = openLawBallot(shared);
  if (!ballot) return { room, open: false };
  const seated: Room = { ...room, league: withBallot(league, ballot) };
  const picking = ballot.pick === null && lawPickerIsHuman(shared, ballot);
  if (!picking && pendingHumans(ballot.ballots).length === 0) {
    return { room: settleLaws(seated, now), open: false };
  }
  return {
    room: attachQuotes(
      logEvent(
        {
          ...seated,
          phase: {
            kind: 'laws',
            stage: picking ? 'pick' : 'vote',
            deadline: lawsDeadline(room, now),
          },
        },
        now,
        'laws-open',
        { leader: ballot.government[0] },
      ),
    ),
    open: true,
  };
}

// The roll call opens on the picked card, its clock fresh
function toVote(room: Room, league: LeagueState, ballot: LawBallot, now: number): Room {
  return {
    ...room,
    league: withBallot(league, ballot),
    phase: { kind: 'laws', stage: 'vote', deadline: lawsDeadline(room, now) },
  };
}

// The leading party's top coach puts a card on the table
export function castLawPick(
  room: Room,
  coachId: string,
  index: number,
  now: number,
): Room {
  const { league, ballot } = openBallot(room);
  if (room.phase.kind !== 'laws' || room.phase.stage !== 'pick')
    throw new ActionError('bad-phase');
  const slug = league.coachStates[coachId]?.slug;
  if (!slug || ballot.picker !== slug) throw new ActionError('not-the-picker', 403);
  if (!Number.isInteger(index) || !ballot.cards[index])
    throw new ActionError('bad-option');
  const picked = pickLawCard(sharedCareer(league), ballot, index);
  return logEvent(toVote(room, league, picked, now), now, 'laws-pick', {
    coach: coachId,
  });
}

// A coach on a governing list casts or changes his vote while it is open
export function castLawVote(
  room: Room,
  coachId: string,
  vote: unknown,
  now: number,
): Room {
  const { league, ballot } = openBallot(room);
  if (room.phase.kind !== 'laws' || room.phase.stage !== 'vote')
    throw new ActionError('bad-phase');
  if (vote !== 'yes' && vote !== 'no') throw new ActionError('bad-vote');
  const slug = league.coachStates[coachId]?.slug;
  if (!slug || !lawVoter(ballot, slug)) throw new ActionError('not-a-voter', 403);
  return logEvent(
    { ...room, league: withBallot(league, voteLaw(ballot, slug, vote as LawVote)) },
    now,
    'laws-vote',
    { coach: coachId },
  );
}

// The picker's clock ran out: the AI picks for him and the roll call opens,
// or settles at once when no human is left to vote
export function autoPickLaw(room: Room, now: number): Room {
  const { league, ballot } = openBallot(room);
  const shared = sharedCareer(league);
  const picked: LawBallot = {
    ...pickLawCard(shared, ballot, aiLawPick(shared, ballot)),
    autoPick: true,
  };
  return logEvent(toVote(room, league, picked, now), now, 'laws-autopick');
}

// Nothing left to wait for: the card is down and every human has voted
export function lawVotesIn(room: Room): boolean {
  const ballot = room.league?.parliament?.lawBallot;
  return Boolean(ballot) && lawBallotReady(ballot as LawBallot);
}
