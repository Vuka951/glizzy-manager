import {
  AI_DONATION_CHANCE,
  DONATION_SCALE,
  FAVOR_TIERS,
  ELECTION_EVERY_YEARS,
  ELECTION_FIRST_YEAR,
  FAVOR_AI_CHANCE,
  ELECTION_NOISE_VOTES,
  GLIZI_PRICE_EVENT_CHANCE,
  GLIZI_PRICE_UP_CHANCE,
  GLIZI_PRICE_HIKE_RATING_SCALE,
  GLIZI_PRICE_RATING_MAX,
  GLIZI_PRICE_RATING_MIN,
  GLIZI_PRICE_INDEX_MAX,
  GLIZI_PRICE_INDEX_MIN,
  GLIZI_PRICE_MOVE_MAX,
  GLIZI_PRICE_MOVE_MIN,
  KORPORACIJA_LEAD_REFUND,
  KORPORACIJA_LEAD_TAX,
  MAJORITY_SEATS,
  MIN_PARTY_SEATS,
  OSTRVO_LEAD_SABOTAGE_TAX,
  PARLIAMENT_SEATS,
  PARTY_BASE_VOTES,
  PARTY_PARTNER_RANKS,
  PARTY_SEAT_ORDER,
  POLL_NOISE_SEATS,
  SEASON_PAY_LEADER,
  SEASON_PAY_OPPOSITION,
  STRANKA_LEAD_FAME_BONUS,
  STRANKA_LEAD_FANS_TRAINING_SCALE,
  STRANKA_LEAD_OUTSIDE_FAME_SCALE,
  STRANKA_LEAD_OUTSIDE_MEDIA_USES,
  STRANKA_LEAD_OUTSIDE_PAY_SCALE,
  STRANKA_MEDIA_LEADER,
  STRANKA_MEDIA_OPPOSITION,
  VOTE_DONATION_DIVISOR,
  VOTE_FAME_DIVISOR,
  ZIDARI_BLOCK_LEADER,
  ZIDARI_BLOCK_OPPOSITION,
  ZIDARI_LEAD_BLOCK_BONUS,
  ZIDARI_LEAD_BLOCK_CAP,
  ZIDARI_LEAD_GUARD_TAX,
  type ElectionResult,
  OUTSIDER_DONATION_WEIGHT,
  OUTSIDER_OFFER_SURE_AT,
} from '@/data/games/careerElections';
import type { TrainingId } from '@/data/games/careerTraining';
import {
  GUARD_BLOCK_CHANCE,
  STRANKA_MEDIA_MULTIPLIER,
} from '@/data/games/careerEconomy';
import { CAREER_PERSONALITIES } from '@/data/games/careerPersonalities';
import { LORE_RIVALS } from '@/data/games/careerRivals';
import { isHumanSlug, rankBySeeding, seedingKey } from '@/lib/utils/careerPoints';
import type {
  CharacterCareerState,
  MailItem,
  Parliament,
  PartyStatus,
  PendingRemoval,
  SavedCareer,
  SponsorId,
} from '@/lib/utils/careerSave';
import type { CupMatch } from '@/lib/utils/tournamentSim';

const ZERO: Record<SponsorId, number> = {
  zidari: 0,
  ostrvo: 0,
  korporacija: 0,
  stranka: 0,
};

export function isElectionYear(year: number): boolean {
  return (
    year >= ELECTION_FIRST_YEAR &&
    (year - ELECTION_FIRST_YEAR) % ELECTION_EVERY_YEARS === 0
  );
}

// A campaign or outsider letter asks for money for the count at the end of
// its own year, so it closes with that count
export function campaignLetterOpen(
  item: MailItem,
  state: { year: number; parliament?: Parliament },
): boolean {
  return (
    (item.kind === 'campaign' || item.kind === 'donation') &&
    item.year === state.year &&
    isElectionYear(state.year) &&
    !state.parliament?.pendingResult
  );
}

// Unanswered campaign letters from a count that is already over are filed
// away, the way accepting a sponsor retires the other offers
export function closeCampaignLetters(state: {
  year: number;
  parliament?: Parliament;
  mail: MailItem[];
}): MailItem[] {
  return state.mail.map((m) =>
    !m.read &&
    (m.kind === 'campaign' || m.kind === 'donation') &&
    !campaignLetterOpen(m, state)
      ? { ...m, read: true }
      : m,
  );
}

// The chamber opens its doors to the player once the first election year is
// under way: from the Eggplant window of that year, after its Frozen cup
export function parliamentOpen(state: {
  year: number;
  season: number;
  parliament?: Parliament;
}): boolean {
  if (!state.parliament) return false;
  return (
    state.year > ELECTION_FIRST_YEAR ||
    (state.year === ELECTION_FIRST_YEAR && state.season >= 1)
  );
}

// The first vote at or after this year
export function nextElectionYear(year: number): number {
  let next = ELECTION_FIRST_YEAR;
  while (next < year) next += ELECTION_EVERY_YEARS;
  return next;
}

// The chamber before anyone has voted: the poll fills it, nobody governs
export function emptyParliament(): Parliament {
  return {
    seats: { ...ZERO },
    government: [],
    electedYear: 0,
    donations: { ...ZERO },
    donors: {},
    lastDonors: {},
    rating: 0,
    penalties: { ...ZERO },
    favorsUsed: {},
    pendingResult: null,
    elections: 0,
  };
}

// Seats by vote share: every list keeps its floor, the rest goes by
// largest remainder so the chamber always adds up to the full house
export function seatsFromVotes(
  votes: Record<SponsorId, number>,
): Record<SponsorId, number> {
  const total = PARTY_SEAT_ORDER.reduce((sum, id) => sum + votes[id], 0);
  const seats = {} as Record<SponsorId, number>;
  const remainders: { id: SponsorId; rest: number }[] = [];
  let used = 0;
  PARTY_SEAT_ORDER.forEach((id) => {
    const raw = total > 0 ? (PARLIAMENT_SEATS * votes[id]) / total : 0;
    const floor = Math.max(MIN_PARTY_SEATS, Math.floor(raw));
    seats[id] = floor;
    used += floor;
    remainders.push({ id, rest: raw - Math.floor(raw) });
  });
  remainders.sort((a, b) => b.rest - a.rest);
  for (let i = 0; used < PARLIAMENT_SEATS; i++) {
    seats[remainders[i % remainders.length].id] += 1;
    used += 1;
  }
  while (used > PARLIAMENT_SEATS) {
    const biggest = [...PARTY_SEAT_ORDER].sort(
      (a, b) => seats[b] - seats[a],
    )[0];
    seats[biggest] -= 1;
    used -= 1;
  }
  return seats;
}

export function largestParty(seats: Record<SponsorId, number>): SponsorId {
  return [...PARTY_SEAT_ORDER].sort((a, b) => seats[b] - seats[a])[0];
}

// Leader first. A majority governs alone, otherwise the leader walks its
// partner list: first choice, second choice, then both together
export function formGovernment(seats: Record<SponsorId, number>): SponsorId[] {
  const leader = largestParty(seats);
  if (seats[leader] > MAJORITY_SEATS) return [leader];
  const [first, second] = PARTY_PARTNER_RANKS[leader];
  if (seats[leader] + seats[first] > MAJORITY_SEATS) return [leader, first];
  if (seats[leader] + seats[second] > MAJORITY_SEATS) return [leader, second];
  return [leader, first, second];
}

export function electionResult(
  votes: Record<SponsorId, number>,
): ElectionResult {
  const seats = seatsFromVotes(votes);
  return { votes, seats, government: formGovernment(seats) };
}

export function governmentSeats(result: {
  seats: Record<SponsorId, number>;
  government: SponsorId[];
}): number {
  return result.government.reduce((sum, id) => sum + result.seats[id], 0);
}

// The convictions on every list, a fresh copy, zero for saves that never
// kept them
export function partyConvictions(
  parliament: Pick<Parliament, 'convictions'>,
): Record<SponsorId, number> {
  return { ...ZERO, ...(parliament.convictions ?? {}) };
}

// What the table's first place brings a list; the last place always brings
// one, whatever the size of the league
export function votePlaceTop(tableSize: number): number {
  return tableSize + 1;
}

// Vote share in whole percent off the table as it stands: every signed
// character brings his fame and his place, the campaign chest brings its
// points, the leader brings its record and every party its affairs
export function countVotes(state: SavedCareer): Record<SponsorId, number> {
  const parliament = state.parliament ?? emptyParliament();
  const order = rankBySeeding(state.characters, seedingKey(state));
  const points = { ...ZERO };
  PARTY_SEAT_ORDER.forEach((id) => {
    points[id] = PARTY_BASE_VOTES[id];
  });
  const top = votePlaceTop(order.length);
  order.forEach((slug, index) => {
    const ch = state.characters[slug];
    const party = ch.sponsor?.sponsorId;
    if (!party) return;
    points[party] += ch.fame / VOTE_FAME_DIVISOR + (top - (index + 1));
  });
  const convictions = partyConvictions(parliament);
  PARTY_SEAT_ORDER.forEach((id) => {
    points[id] += Math.floor(parliament.donations[id] / VOTE_DONATION_DIVISOR);
    points[id] -= parliament.penalties[id] + convictions[id];
  });
  const leader = parliament.government[0];
  if (leader) points[leader] += parliament.rating;
  PARTY_SEAT_ORDER.forEach((id) => {
    points[id] = Math.max(0, points[id]);
  });
  const total = PARTY_SEAT_ORDER.reduce((sum, id) => sum + points[id], 0);
  const votes = { ...ZERO };
  const remainders: { id: SponsorId; rest: number }[] = [];
  let used = 0;
  PARTY_SEAT_ORDER.forEach((id) => {
    const raw = total > 0 ? (100 * points[id]) / total : 25;
    votes[id] = Math.floor(raw);
    used += votes[id];
    remainders.push({ id, rest: raw - votes[id] });
  });
  remainders.sort((a, b) => b.rest - a.rest);
  for (let i = 0; used < 100; i++) {
    votes[remainders[i % remainders.length].id] += 1;
    used += 1;
  }
  return votes;
}

export type PartyPlayerPoints = {
  slug: string;
  place: number;
  fame: number;
  placePts: number;
  famePts: number;
  // Whole percent of the vote the list would lose without him
  sharePts: number;
};

// What each signed man brings to his list's count, table order, the same
// numbers countVotes adds up
export function partyPlayerPoints(
  state: SavedCareer,
): Record<SponsorId, PartyPlayerPoints[]> {
  const order = rankBySeeding(state.characters, seedingKey(state));
  const out = {} as Record<SponsorId, PartyPlayerPoints[]>;
  PARTY_SEAT_ORDER.forEach((id) => {
    out[id] = [];
  });
  const votes = countVotes(state);
  order.forEach((slug, index) => {
    const ch = state.characters[slug];
    const party = ch.sponsor?.sponsorId;
    if (!party) return;
    const without = countVotes({
      ...state,
      characters: { ...state.characters, [slug]: { ...ch, sponsor: null } },
    });
    out[party].push({
      slug,
      place: index + 1,
      fame: ch.fame,
      placePts: votePlaceTop(order.length) - (index + 1),
      famePts: Math.round(ch.fame / VOTE_FAME_DIVISOR),
      sharePts: votes[party] - without[party],
    });
  });
  return out;
}

// The vote share a list would lose with every one of its men unsigned
export function partyPlayersShare(state: SavedCareer, party: SponsorId): number {
  const characters = Object.fromEntries(
    Object.entries(state.characters).map(([slug, ch]) => [
      slug,
      ch.sponsor?.sponsorId === party ? { ...ch, sponsor: null } : ch,
    ]),
  );
  return countVotes(state)[party] - countVotes({ ...state, characters })[party];
}

export type PartyRating = {
  // What the list polls with no players, no money and no record
  base: number;
  // The base with the party's own conduct on it: the campaign chest, the
  // affairs and punishments on record, and the leader's rating
  current: number;
  donations: number;
  rating: number;
  penalties: number;
  // Members caught plotting, ever; never wiped by a count
  convictions: number;
};

// The part of the vote that is about the party rather than its players
export function partyRatings(state: SavedCareer): Record<SponsorId, PartyRating> {
  const parliament = state.parliament ?? emptyParliament();
  const leader = parliament.government[0];
  const convictions = partyConvictions(parliament);
  const out = {} as Record<SponsorId, PartyRating>;
  PARTY_SEAT_ORDER.forEach((id) => {
    const base = PARTY_BASE_VOTES[id];
    const donations = Math.floor(parliament.donations[id] / VOTE_DONATION_DIVISOR);
    const rating = id === leader ? parliament.rating : 0;
    const penalties = parliament.penalties[id];
    out[id] = {
      base,
      current: Math.max(
        0,
        base + donations + rating - penalties - convictions[id],
      ),
      donations,
      rating,
      penalties,
      convictions: convictions[id],
    };
  });
  return out;
}

// The same share with the day's mood on it: every list moves by up to the
// spread, nobody drops below zero, and the whole still adds up to 100
export function jitterVotes(
  votes: Record<SponsorId, number>,
  spread: number,
): Record<SponsorId, number> {
  const raw = { ...ZERO };
  PARTY_SEAT_ORDER.forEach((id) => {
    const shift = Math.round((Math.random() * 2 - 1) * spread);
    raw[id] = Math.max(0, votes[id] + shift);
  });
  const total = PARTY_SEAT_ORDER.reduce((sum, id) => sum + raw[id], 0);
  const out = { ...ZERO };
  const remainders: { id: SponsorId; rest: number }[] = [];
  let used = 0;
  PARTY_SEAT_ORDER.forEach((id) => {
    const share = total > 0 ? (100 * raw[id]) / total : 25;
    out[id] = Math.floor(share);
    used += out[id];
    remainders.push({ id, rest: share - out[id] });
  });
  remainders.sort((a, b) => b.rest - a.rest);
  for (let i = 0; used < 100; i++) {
    out[remainders[i % remainders.length].id] += 1;
    used += 1;
  }
  return out;
}

// What the pollster prints: the projection with the poll's noise on it
export function pollSeats(state: SavedCareer): Record<SponsorId, number> {
  return seatsFromVotes(jitterVotes(countVotes(state), POLL_NOISE_SEATS));
}

// What the ballot boxes hold on the night
export function electionVotes(state: SavedCareer): Record<SponsorId, number> {
  return jitterVotes(countVotes(state), ELECTION_NOISE_VOTES);
}

export function partyStatusOf(
  government: SponsorId[],
  sponsorId: SponsorId | null | undefined,
): PartyStatus | undefined {
  if (!sponsorId || government.length === 0) return undefined;
  if (government[0] === sponsorId) return 'leader';
  if (government.includes(sponsorId)) return 'partner';
  return 'opposition';
}

// Every character's seat, re-read off the government; the field is also
// what a fresh signing picks up mid-term
export function withPartyStatuses(
  characters: Record<string, CharacterCareerState>,
  government: SponsorId[],
): Record<string, CharacterCareerState> {
  const next: Record<string, CharacterCareerState> = {};
  Object.entries(characters).forEach(([slug, ch]) => {
    const status = partyStatusOf(government, ch.sponsor?.sponsorId);
    next[slug] = status ? { ...ch, partyStatus: status } : ch;
    if (!status && ch.partyStatus) {
      const rest = { ...ch };
      delete rest.partyStatus;
      next[slug] = rest;
    }
  });
  return next;
}

// Election night: the counted result becomes the chamber. The rating stays
// with a re-elected leader and dies with a replaced one; the campaign chest
// empties, the favor ledger opens, the donors move to the list the favor reads
export function applyElection(
  state: SavedCareer,
  result: ElectionResult,
): SavedCareer {
  const parliament = state.parliament ?? emptyParliament();
  const sameLeader = parliament.government[0] === result.government[0];
  const next: Parliament = {
    ...parliament,
    seats: result.seats,
    government: result.government,
    electedYear: state.year,
    donations: { ...ZERO },
    donors: {},
    lastDonors: parliament.donors,
    rating: sameLeader ? parliament.rating : 0,
    penalties: { ...ZERO },
    poll: undefined,
    favorsUsed: {},
    pendingResult: null,
    elections: parliament.elections + 1,
  };
  return {
    ...state,
    parliament: next,
    governments: [
      ...(state.governments ?? []),
      { year: state.year, government: result.government },
    ],
    characters: withPartyStatuses(state.characters, result.government),
  };
}

export function leadingParty(parliament?: Parliament): SponsorId | null {
  return parliament?.government[0] ?? null;
}

// Signed to a party that sits outside the government, or not signed at all,
// while somebody governs
export function outsideGovernment(
  ch: CharacterCareerState,
  parliament?: Parliament,
): boolean {
  if (!parliament || parliament.government.length === 0) return false;
  return ch.partyStatus !== 'leader' && ch.partyStatus !== 'partner';
}

export function seasonPayAdjust(status?: PartyStatus): number {
  if (status === 'leader') return SEASON_PAY_LEADER;
  if (status === 'opposition') return SEASON_PAY_OPPOSITION;
  return 0;
}

// The Zidari house crew by seat, plus the door bonus when Zidari lead
export function zidariBlockChance(
  ch: CharacterCareerState,
  parliament?: Parliament,
): number {
  const base =
    ch.partyStatus === 'leader'
      ? ZIDARI_BLOCK_LEADER
      : ch.partyStatus === 'opposition'
        ? ZIDARI_BLOCK_OPPOSITION
        : GUARD_BLOCK_CHANCE;
  if (
    leadingParty(parliament) === 'zidari' &&
    ch.sponsor?.sponsorId === 'zidari'
  ) {
    return Math.min(ZIDARI_LEAD_BLOCK_CAP, base + ZIDARI_LEAD_BLOCK_BONUS);
  }
  return base;
}

export function strankaMediaMultiplier(status?: PartyStatus): number {
  if (status === 'leader') return STRANKA_MEDIA_LEADER;
  if (status === 'opposition') return STRANKA_MEDIA_OPPOSITION;
  return STRANKA_MEDIA_MULTIPLIER;
}

export type StrankaLeadMedia = {
  payScale: number;
  // Added to the fame an appearance brings
  fameDelta: number;
  // Multiplies the fame an appearance brings
  fameScale: number;
  usesDelta: number;
};

const NEUTRAL_MEDIA: StrankaLeadMedia = {
  payScale: 1,
  fameDelta: 0,
  fameScale: 1,
  usesDelta: 0,
};

// What the leading party's power does to a media appearance: a fame bonus
// for its own clients, less pay, half the fame and one appearance fewer for
// anyone outside the government. Whoever had a single slot has none
export function strankaLeadMedia(
  ch: CharacterCareerState,
  parliament?: Parliament,
): StrankaLeadMedia {
  if (leadingParty(parliament) !== 'stranka') return NEUTRAL_MEDIA;
  if (ch.sponsor?.sponsorId === 'stranka') {
    return { ...NEUTRAL_MEDIA, fameDelta: STRANKA_LEAD_FAME_BONUS };
  }
  if (outsideGovernment(ch, parliament)) {
    return {
      payScale: STRANKA_LEAD_OUTSIDE_PAY_SCALE,
      fameDelta: 0,
      fameScale: STRANKA_LEAD_OUTSIDE_FAME_SCALE,
      usesDelta: -STRANKA_LEAD_OUTSIDE_MEDIA_USES,
    };
  }
  return NEUTRAL_MEDIA;
}

// State media coach their own: fan training is cheaper for the party's
// clients while the party leads
export function strankaLeadTrainingScale(
  ch: CharacterCareerState,
  parliament: Parliament | undefined,
  trainingId: TrainingId,
): number {
  return trainingId === 'fans' &&
    leadingParty(parliament) === 'stranka' &&
    ch.sponsor?.sponsorId === 'stranka'
    ? STRANKA_LEAD_FANS_TRAINING_SCALE
    : 1;
}

export function guardTaxScale(
  ch: CharacterCareerState,
  parliament?: Parliament,
): number {
  return leadingParty(parliament) === 'zidari' &&
    outsideGovernment(ch, parliament)
    ? 1 + ZIDARI_LEAD_GUARD_TAX
    : 1;
}

export function sabotageTaxScale(
  ch: CharacterCareerState,
  parliament?: Parliament,
): number {
  return leadingParty(parliament) === 'ostrvo' &&
    outsideGovernment(ch, parliament)
    ? 1 + OSTRVO_LEAD_SABOTAGE_TAX
    : 1;
}

// While the island sits in the government the archive is the prosecutor's
// office: planted evidence against an island client never reaches an indictment
export function shieldedFromIndictment(
  target: CharacterCareerState,
  parliament?: Parliament,
): boolean {
  return (
    target.sponsor?.sponsorId === 'ostrvo' &&
    (parliament?.government.includes('ostrvo') ?? false)
  );
}

// The Korporacija's tax office: a refund for its own clients, a bill for
// everyone outside the government, nothing for the junior partner
export function korporacijaTax(
  ch: CharacterCareerState,
  parliament?: Parliament,
): number {
  if (leadingParty(parliament) !== 'korporacija') return 0;
  if (ch.sponsor?.sponsorId === 'korporacija') return KORPORACIJA_LEAD_REFUND;
  if (outsideGovernment(ch, parliament)) return -KORPORACIJA_LEAD_TAX;
  return 0;
}

export function ostrvoWeekendEveryWindow(ch: CharacterCareerState): boolean {
  return ch.sponsor?.sponsorId === 'ostrvo' && ch.partyStatus === 'leader';
}

export type GliziPriceEvent = { up: boolean; pct: number; ratingDelta: number };

// The compounded index after a story: the last one times the move, held
// between the floor and the ceiling
export function nextGliziPriceIndex(
  index: number | undefined,
  pct: number,
): number {
  const moved = (index ?? 1) * (1 + pct / 100);
  return Math.min(GLIZI_PRICE_INDEX_MAX, Math.max(GLIZI_PRICE_INDEX_MIN, moved));
}

// The glizi price story: rolled once a window, moves the price index a
// random step either way and the leader's rating the other way. Nobody to
// blame before the first government, so the rating only moves once there is one
export function rollGliziPriceEvent(
  parliament?: Parliament,
): GliziPriceEvent | null {
  if (Math.random() >= GLIZI_PRICE_EVENT_CHANCE) return null;
  const up = Math.random() < GLIZI_PRICE_UP_CHANCE;
  const move =
    GLIZI_PRICE_MOVE_MIN +
    Math.floor(
      Math.random() * (GLIZI_PRICE_MOVE_MAX - GLIZI_PRICE_MOVE_MIN + 1),
    );
  const swing =
    GLIZI_PRICE_RATING_MIN +
    Math.floor(
      Math.random() * (GLIZI_PRICE_RATING_MAX - GLIZI_PRICE_RATING_MIN + 1),
    );
  const governed = (parliament?.government.length ?? 0) > 0;
  return {
    up,
    pct: up ? move : -move,
    ratingDelta: governed
      ? up
        ? -swing * GLIZI_PRICE_HIKE_RATING_SCALE
        : swing
      : 0,
  };
}

export function recordDonation(
  parliament: Parliament,
  slug: string,
  party: SponsorId,
  amount: number,
): Parliament {
  return {
    ...parliament,
    donations: {
      ...parliament.donations,
      [party]: parliament.donations[party] + amount,
    },
    donors: {
      ...parliament.donors,
      [slug]: (parliament.donors[slug] ?? 0) + amount,
    },
  };
}

// The outsider's envelope: a tenth of it lands in the chest and on the donor
// list, so a later contract with the party carries the favor it earned
export function recordOutsiderDonation(
  parliament: Parliament,
  slug: string,
  party: SponsorId,
  amount: number,
): Parliament {
  return recordDonation(
    parliament,
    slug,
    party,
    Math.round(amount * OUTSIDER_DONATION_WEIGHT),
  );
}

// How likely the party answers an outsider's envelope with a contract
export function outsiderOfferChance(amount: number): number {
  return Math.min(1, amount / OUTSIDER_OFFER_SURE_AT);
}

// The biggest step of the scale a character can pay and still keep his reserve
export function aiDonationAmount(ch: CharacterCareerState): number {
  const personality = ch.personality
    ? CAREER_PERSONALITIES[ch.personality]
    : null;
  if (!personality || Math.random() >= AI_DONATION_CHANCE[personality.id])
    return 0;
  const spare = (ch.money ?? 0) - personality.reserve;
  const affordable = DONATION_SCALE.filter((step) => step <= spare);
  return affordable.length > 0 ? affordable[affordable.length - 1] : 0;
}

// Favors a year for what went into the last campaign chest
export function favorsEarned(donated: number): number {
  return FAVOR_TIERS.filter((tier) => donated >= tier).length;
}

export function favorsSpent(
  parliament: Parliament,
  slug: string,
  year: number,
): number {
  return parliament.favorsYear === year ? (parliament.favorsUsed[slug] ?? 0) : 0;
}

// What a donor still has coming this year, zero for anyone outside the
// government or below the first rung of the chest
export function favorsLeft(state: SavedCareer, slug: string): number {
  const parliament = state.parliament;
  const party = state.characters[slug]?.sponsor?.sponsorId;
  if (!parliament || !party || !parliament.government.includes(party))
    return 0;
  return (
    favorsEarned(parliament.lastDonors[slug] ?? 0) -
    favorsSpent(parliament, slug, state.year)
  );
}

export function favorAvailable(state: SavedCareer, slug: string): boolean {
  return favorsLeft(state, slug) > 0;
}

// One booked at a time: the next favor waits until the last one has walked
// somebody out. A shared league counts per booking coach, so one coach's
// pending favor never blocks another's
export function favorPending(state: SavedCareer, bySlug?: string): boolean {
  const removals = state.cup?.removals ?? [];
  return bySlug === undefined
    ? removals.length > 0
    : removals.some((r) => r.bySlug === bySlug);
}

// Who a favor can reach. The leader is untouchable by anyone in government
// and can hit everyone else, junior partners included; a junior partner
// cannot touch the leader but can hit the other partners, the opposition and
// the unsigned. Nobody hits his own party
export function canRemove(
  state: SavedCareer,
  bySlug: string,
  targetSlug: string,
): boolean {
  const parliament = state.parliament;
  const byParty = state.characters[bySlug]?.sponsor?.sponsorId;
  if (!parliament || !byParty || bySlug === targetSlug) return false;
  const government = parliament.government;
  if (!government.includes(byParty)) return false;
  const targetParty = state.characters[targetSlug]?.sponsor?.sponsorId;
  if (targetParty === byParty) return false;
  return targetParty !== government[0];
}

// Everyone in an unplayed match of the round, paired with the match it sits
// in. A match that already carries a removal is left alone
export function roundParticipants(
  matches: CupMatch[],
  removals: PendingRemoval[] = [],
): { slug: string; index: number }[] {
  const out: { slug: string; index: number }[] = [];
  matches.forEach((match) => {
    if (match.result || !match.a || !match.b) return;
    if (
      removals.some((r) => r.round === match.round && r.index === match.index)
    )
      return;
    out.push({ slug: match.a, index: match.index });
    out.push({ slug: match.b, index: match.index });
  });
  return out;
}

export function bookRemoval(
  state: SavedCareer,
  removal: PendingRemoval,
): SavedCareer {
  if (!state.cup || !state.parliament) return state;
  const sameYear = state.parliament.favorsYear === state.year;
  const spent = sameYear ? state.parliament.favorsUsed : {};
  return {
    ...state,
    cup: { ...state.cup, removals: [...(state.cup.removals ?? []), removal] },
    parliament: {
      ...state.parliament,
      favorsYear: state.year,
      favorsUsed: {
        ...spent,
        [removal.bySlug]: (spent[removal.bySlug] ?? 0) + 1,
      },
    },
  };
}

// The league's own donors spend their favors too: one booked at a time,
// never in the final, aimed at a lore grudge first, then at the player if he
// is this year's feud, then at the best seed in reach
export function bookAiRemoval(state: SavedCareer, round: number): SavedCareer {
  const cup = state.cup;
  if (!cup || !state.parliament) return state;
  if (round >= cup.rounds.length - 1) return state;
  if (favorPending(state)) return state;
  const participants = roundParticipants(cup.rounds[round] ?? [], cup.removals);
  if (participants.length === 0) return state;
  const donors = Object.keys(state.characters)
    .filter((slug) => !isHumanSlug(state, slug) && favorAvailable(state, slug))
    .sort(() => Math.random() - 0.5);
  const seedOrder =
    state.cupStartRanks ?? rankBySeeding(state.characters, seedingKey(state));
  for (const bySlug of donors) {
    if (Math.random() >= FAVOR_AI_CHANCE) continue;
    const reachable = participants.filter((p) =>
      canRemove(state, bySlug, p.slug),
    );
    if (reachable.length === 0) continue;
    const grudges = LORE_RIVALS[bySlug] ?? [];
    const pick =
      reachable.find((p) => grudges.includes(p.slug)) ??
      (bySlug === state.rivalSlug
        ? reachable.find((p) => p.slug === state.playerSlug)
        : undefined) ??
      reachable.find((p) => state.rivalOf?.[p.slug] === bySlug) ??
      [...reachable].sort(
        (a, b) => seedOrder.indexOf(a.slug) - seedOrder.indexOf(b.slug),
      )[0];
    const byParty = state.characters[bySlug].sponsor?.sponsorId;
    if (!pick || !byParty) continue;
    return bookRemoval(state, {
      round,
      index: pick.index,
      targetSlug: pick.slug,
      bySlug,
      byParty,
    });
  }
  return state;
}

export function removalFor(
  state: SavedCareer,
  round: number,
  index: number,
): PendingRemoval | null {
  return (
    (state.cup?.removals ?? []).find(
      (r) => r.round === round && r.index === index,
    ) ?? null
  );
}

// What the poll article carries so the paper can draw its chart
export function seatParams(
  seats: Record<SponsorId, number>,
): Record<string, string | number> {
  return { ...seats };
}
