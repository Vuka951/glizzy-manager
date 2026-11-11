import {
  COALITION_AI_NOISE,
  COALITION_HEDONIST_GREEN,
  COALITION_LAST_PENALTY,
  COALITION_MARGIN_TASTE,
  COALITION_PARANOID_ABOVE,
  COALITION_PEOPLE_CAP,
  COALITION_RANK_STEP,
  COALITION_RIVAL_PENALTY,
  COALITION_SAFE_MARGIN,
  COALITION_SCHEMER_GRUDGE_SCALE,
  COALITION_SHOWMAN_SEAT_BONUS,
  COALITION_THREAT_PENALTY,
  COALITION_THREAT_PLACES,
  COALITION_THREAT_POINT_SHARE,
  MAJORITY_SEATS,
  PARTY_PARTNER_RANKS,
  type ElectionResult,
} from '@/data/games/careerElections';
import {
  electionResult,
  electionVotes,
  governmentSeats,
  largestParty,
  seatParams,
} from '@/lib/utils/careerElections';
import { loreRivals } from '@/lib/utils/characterTraits';
import { leagueNews } from '@/lib/utils/careerMail';
import {
  aiPreferencePick,
  ballotWinner,
  castBallot,
  fillBallots,
  newBallot,
  pendingHumans,
  tallyBallots,
  type Ballot,
} from '@/lib/utils/careerParliamentVote';
import {
  careerPoints,
  isHumanSlug,
  rankBySeeding,
  seedingKey,
} from '@/lib/utils/careerPoints';
import {
  premierNewsParams,
  type PremierSpeech,
} from '@/lib/utils/careerPremier';
import type { NewsItem, SavedCareer, SponsorId } from '@/lib/utils/careerSave';
import {
  voterProfile,
  type VoterProfile,
} from '@/lib/utils/careerVoteMotives';

export type CoalitionBallot = {
  leader: SponsorId;
  // Partner sets that reach a majority with the leader, each keyed by its
  // partners joined with '+', in the party's own order of preference
  options: string[];
  // Every coach signed to the leader, table order
  ballots: Ballot[];
  // The winning key once the vote is closed
  winner: string | null;
};

function coalitionKey(partners: SponsorId[]): string {
  return partners.join('+');
}

export function coalitionPartners(key: string): SponsorId[] {
  return key.split('+') as SponsorId[];
}

export function coalitionSeats(
  seats: Record<SponsorId, number>,
  leader: SponsorId,
  key: string,
): number {
  return coalitionPartners(key).reduce(
    (sum, id) => sum + seats[id],
    seats[leader],
  );
}

function hasMajority(seats: Record<SponsorId, number>): boolean {
  return seats[largestParty(seats)] > MAJORITY_SEATS;
}

// The ways the largest list can reach a majority, in its order of
// preference. A single partner is always enough when there is one, so a third
// party is only offered when no partner alone carries the list past fifty;
// the name it never governs with comes last either way
function coalitionOptions(seats: Record<SponsorId, number>): string[] {
  if (hasMajority(seats)) return [];
  const leader = largestParty(seats);
  const [first, second, last] = PARTY_PARTNER_RANKS[leader];
  const reaches = (key: string) =>
    coalitionSeats(seats, leader, key) > MAJORITY_SEATS;
  const singles = [[first], [second], [last]].map(coalitionKey).filter(reaches);
  if (singles.length > 0) return singles;
  return [
    [first, second],
    [first, last],
    [second, last],
  ]
    .map(coalitionKey)
    .filter(reaches);
}

// Everyone signed to the party, table order
function coalitionVoters(
  state: SavedCareer,
  leader: SponsorId,
): string[] {
  return rankBySeeding(state.characters, seedingKey(state)).filter(
    (slug) => state.characters[slug].sponsor?.sponsorId === leader,
  );
}

// Who a coach would rather not share a cabinet with: his lore grudges, the
// humans who picked him as their rival or whom he picked, and whoever last
// sent men to his door
function grudgesOf(state: SavedCareer, slug: string): Set<string> {
  const out = new Set(loreRivals(slug, Object.keys(state.characters)));
  Object.entries(state.rivalOf ?? {}).forEach(([human, rival]) => {
    if (rival === slug) out.add(human);
    if (human === slug) out.add(rival);
  });
  if (state.rivalSlug === slug) out.add(state.playerSlug);
  if (slug === state.playerSlug && state.rivalSlug) out.add(state.rivalSlug);
  const hitBy = state.characters[slug]?.grudgeSlug;
  if (hitBy) out.add(hitBy);
  return out;
}

const clamp = (x: number, cap: number) => Math.max(-cap, Math.min(cap, x));

// How one coach feels about the people a partner set brings to the table:
// grudges push, and whoever he races on the table is a rival for the
// cabinet's perks
function cabinetFeeling(
  state: SavedCareer,
  slug: string,
  partners: SponsorId[],
  seeding: string[],
): number {
  const ch = state.characters[slug];
  const grudges = grudgesOf(state, slug);
  const grudgeScale =
    ch.personality === 'schemer' ? COALITION_SCHEMER_GRUDGE_SCALE : 1;
  const rank = seeding.indexOf(slug);
  const points = careerPoints(ch);
  let feeling = 0;
  Object.entries(state.characters).forEach(([other, och]) => {
    const party = och.sponsor?.sponsorId;
    if (other === slug || !party || !partners.includes(party)) return;
    if (grudges.has(other)) feeling -= COALITION_RIVAL_PENALTY * grudgeScale;
    const above = rank - seeding.indexOf(other);
    const close =
      Math.abs(careerPoints(och) - points) <=
      points * COALITION_THREAT_POINT_SHARE;
    if ((above > 0 && above <= COALITION_THREAT_PLACES) || close) {
      feeling -= COALITION_THREAT_PENALTY;
    }
    if (ch.personality === 'paranoid' && above > 0) {
      feeling -= COALITION_PARANOID_ABOVE;
    }
  });
  return clamp(feeling, COALITION_PEOPLE_CAP);
}

// What the coach's temperament makes of the deal itself: the size of the
// majority, the island, the partner's money laws
function temperFor(
  profile: VoterProfile,
  partners: SponsorId[],
  margin: number,
): number {
  const personality = profile.personality;
  if (!personality) return 0;
  const taste = COALITION_MARGIN_TASTE[personality] ?? 0;
  let temper =
    (taste * Math.min(margin, COALITION_SAFE_MARGIN)) / COALITION_SAFE_MARGIN;
  if (personality === 'showman') {
    temper += COALITION_SHOWMAN_SEAT_BONUS * margin;
  }
  if (personality === 'hedonist' && partners.includes('green')) {
    temper += COALITION_HEDONIST_GREEN;
  }
  return temper;
}

// One AI coach's score for a partner set before the noise: the party line,
// with the name at the bottom of the party's list far behind the rest, the
// people and his temperament
function coalitionScore(
  state: SavedCareer,
  slug: string,
  ballot: Pick<CoalitionBallot, 'leader' | 'options'>,
  seats: Record<SponsorId, number>,
  key: string,
  seeding: string[] = rankBySeeding(state.characters, seedingKey(state)),
): number {
  const partners = coalitionPartners(key);
  const ranks = PARTY_PARTNER_RANKS[ballot.leader];
  const shunned = partners.includes(ranks[ranks.length - 1]);
  const profile = voterProfile(state, slug, true, seeding);
  return (
    -COALITION_RANK_STEP * ballot.options.indexOf(key) -
    (shunned ? COALITION_LAST_PENALTY : 0) +
    cabinetFeeling(state, slug, partners, seeding) +
    temperFor(
      profile,
      partners,
      coalitionSeats(seats, ballot.leader, key) - MAJORITY_SEATS,
    )
  );
}

// The AI's vote: his best score after a nudge
export function aiCoalitionPick(
  state: SavedCareer,
  slug: string,
  ballot: Pick<CoalitionBallot, 'leader' | 'options'>,
  seats: Record<SponsorId, number>,
  random: () => number = Math.random,
  seeding: string[] = rankBySeeding(state.characters, seedingKey(state)),
): string {
  return aiPreferencePick(
    ballot.options,
    (key) => coalitionScore(state, slug, ballot, seats, key, seeding),
    COALITION_AI_NOISE,
    random,
  );
}

// The vote opens when the largest list has no majority, more than one way to
// get there and somebody on its list. The AI votes on the spot
export function openCoalitionBallot(
  state: SavedCareer,
  seats: Record<SponsorId, number>,
): CoalitionBallot | null {
  const options = coalitionOptions(seats);
  if (options.length < 2) return null;
  const leader = largestParty(seats);
  const voters = coalitionVoters(state, leader);
  if (voters.length === 0) return null;
  const seeding = rankBySeeding(state.characters, seedingKey(state));
  const shell = { leader, options };
  return {
    ...shell,
    ballots: voters.map((slug) => {
      const ballot = newBallot(slug, isHumanSlug(state, slug));
      return ballot.human
        ? ballot
        : {
            ...ballot,
            choice: aiCoalitionPick(
              state,
              slug,
              shell,
              seats,
              Math.random,
              seeding,
            ),
          };
    }),
    winner: null,
  };
}

function coalitionTally(ballot: CoalitionBallot): Record<string, number> {
  return tallyBallots(ballot.ballots, ballot.options);
}

// The clock is up: anyone who has not voted gets the AI's vote, and the
// most weight wins, ties to the party's own preference
export function closeCoalitionBallot(
  state: SavedCareer,
  ballot: CoalitionBallot,
  seats: Record<SponsorId, number>,
): CoalitionBallot {
  if (ballot.winner !== null) return ballot;
  const seeding = rankBySeeding(state.characters, seedingKey(state));
  const ballots = fillBallots(ballot.ballots, (slug) =>
    aiCoalitionPick(state, slug, ballot, seats, Math.random, seeding),
  );
  const closed = { ...ballot, ballots };
  return {
    ...closed,
    winner: ballotWinner(coalitionTally(closed), ballot.options),
  };
}

export function coalitionVoter(
  ballot: CoalitionBallot | undefined,
  slug: string,
): boolean {
  return Boolean(ballot?.ballots.some((b) => b.slug === slug && b.human));
}

// A human's vote, while the ballot is open; anything else leaves it alone
export function voteCoalition(
  ballot: CoalitionBallot,
  slug: string,
  key: string,
): CoalitionBallot {
  if (ballot.winner !== null || !ballot.options.includes(key)) return ballot;
  if (!coalitionVoter(ballot, slug)) return ballot;
  return { ...ballot, ballots: castBallot(ballot.ballots, slug, key) };
}

export function coalitionGovernment(ballot: CoalitionBallot): SponsorId[] {
  return ballot.winner === null
    ? [ballot.leader]
    : [ballot.leader, ...coalitionPartners(ballot.winner)];
}

// The result with its vote closed and the government it formed
export function settleElection(
  state: SavedCareer,
  result: ElectionResult,
): ElectionResult {
  if (!result.coalition) return result;
  const coalition = closeCoalitionBallot(state, result.coalition, result.seats);
  return { ...result, coalition, government: coalitionGovernment(coalition) };
}

// Election night: the count, then the leader's coaches vote on a partner.
// The vote stays open while a human on the list still has to cast his; a
// single way to a majority needs no vote, and a list nobody coaches forms
// its government the old way
export function countElection(state: SavedCareer): ElectionResult {
  const result = electionResult(electionVotes(state));
  const coalition = openCoalitionBallot(state, result.seats);
  if (!coalition) {
    const options = coalitionOptions(result.seats);
    if (options.length !== 1) return result;
    const leader = largestParty(result.seats);
    return {
      ...result,
      government: [leader, ...coalitionPartners(options[0])],
    };
  }
  const open = { ...result, coalition };
  return pendingHumans(coalition.ballots).length > 0
    ? open
    : settleElection(state, open);
}

export function coalitionOpen(result: ElectionResult | null | undefined): boolean {
  return Boolean(result?.coalition && result.coalition.winner === null);
}

// The paper's election story: the plain count, or the count and the vote
// that made the government
export function electionNews(
  result: ElectionResult,
  slug: string,
  premier: PremierSpeech | null = null,
): NewsItem {
  const coalition = result.coalition;
  const params = {
    ...seatParams(result.seats),
    government: result.government.join(','),
    parties: result.government.join(','),
    seats: governmentSeats(result),
    ...(premier ? premierNewsParams(premier) : {}),
  };
  if (coalition && coalition.winner !== null) {
    const tally = coalitionTally(coalition);
    const total = Object.values(tally).reduce((sum, n) => sum + n, 0);
    return leagueNews(
      'election-coalition',
      slug,
      {
        ...params,
        leader: coalition.leader,
        votes: tally[coalition.winner],
        total,
      },
      'election-result',
      { parties: 'sponsorCoalition', leader: 'sponsor' },
    );
  }
  return leagueNews(
    result.government.length === 1 ? 'election-result-alone' : 'election-result',
    slug,
    params,
    'election-result',
    { parties: 'sponsorCoalition' },
  );
}
