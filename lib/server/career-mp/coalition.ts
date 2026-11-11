import { wrapYear } from '@/lib/server/career-mp/cup';
import { sharedCareer } from '@/lib/server/career-mp/lens';
import type { LeagueState, Room } from '@/lib/server/career-mp/room';
import { ActionError } from '@/lib/server/rooms/errors';
import { logEvent } from '@/lib/server/rooms/log';
import {
  coalitionOpen,
  coalitionVoter,
  settleElection,
  voteCoalition,
} from '@/lib/utils/careerCoalition';
import { pendingHumans } from '@/lib/utils/careerParliamentVote';

function openCount(room: Room): {
  league: LeagueState;
  election: NonNullable<LeagueState['lastElection']>;
} {
  const league = room.league;
  if (!league) throw new ActionError('bad-room');
  const election = league.lastElection;
  if (room.phase.kind !== 'coalition' || !election || !coalitionOpen(election.result))
    throw new ActionError('bad-phase');
  return { league, election };
}

// A coach on the leader's list casts or changes his vote while it is open
export function castCoalitionVote(
  room: Room,
  coachId: string,
  key: string,
  now: number,
): Room {
  const { league, election } = openCount(room);
  const ballot = election.result.coalition;
  const slug = league.coachStates[coachId]?.slug;
  if (!ballot || !slug || !coalitionVoter(ballot, slug))
    throw new ActionError('not-a-voter', 403);
  if (!ballot.options.includes(key)) throw new ActionError('bad-option');
  return logEvent(
    {
      ...room,
      league: {
        ...league,
        lastElection: {
          ...election,
          result: {
            ...election.result,
            coalition: voteCoalition(ballot, slug, key),
          },
        },
      },
    },
    now,
    'coalition-vote',
    { coach: coachId },
  );
}

// Every human on the leader's list has voted
export function coalitionVotesIn(room: Room): boolean {
  const ballot = room.league?.lastElection?.result.coalition;
  return Boolean(ballot) && pendingHumans(ballot?.ballots ?? []).length === 0;
}

// The clock ran out or the last human voted: the AI votes for anyone still
// silent, the government forms and the year turns
export function closeCoalition(room: Room, now: number): Room {
  const { league, election } = openCount(room);
  const result = settleElection(sharedCareer(league, 'offseason'), election.result);
  const next = logEvent(room, now, 'coalition-closed', {
    winner: result.coalition?.winner ?? '',
  });
  return wrapYear(next, result, null, now);
}
