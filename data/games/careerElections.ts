import { POINTS_SPONSOR_BONUS } from '@/data/games/careerEconomy';
import type { CareerPersonalityId } from '@/data/games/careerPersonalities';
import type { CoalitionBallot } from '@/lib/utils/careerCoalition';
import type { PartyStatus, SponsorId } from '@/lib/utils/careerSave';

export const PARLIAMENT_SEATS = 100;
// Strictly more than this governs alone
export const MAJORITY_SEATS = 50;
// No list ever drops below this many seats, the city always has a few of everyone
export const MIN_PARTY_SEATS = 3;

// The city votes at the end of every second year, first at the end of year
// two. The poll and the donation letter land in the third quarter, the count
// runs on the table the Bloody cup leaves behind
export const ELECTION_FIRST_YEAR = 2;
export const ELECTION_EVERY_YEARS = 2;
export const ELECTION_POLL_SEASON = 2;
export const ELECTION_SEASON = 3;

// How the chamber is seated, far left to far right
export const PARTY_SEAT_ORDER: SponsorId[] = [
  'green',
  'red',
  'yellow',
  'blue',
];

// Who each party would govern with, first choice first. When the largest
// party has no majority its coaches vote on a partner (careerCoalition.ts):
// the AI among them leans on this order and only rarely backs the last name,
// and ties go to the earlier name. A list nobody coaches still walks it
// alone: first choice, then second, then both
export const PARTY_PARTNER_RANKS: Record<SponsorId, SponsorId[]> = {
  blue: ['yellow', 'green', 'red'],
  green: ['blue', 'red', 'yellow'],
  yellow: ['blue', 'green', 'red'],
  red: ['green', 'blue', 'yellow'],
};

// What each list polls with no players at all: the registry votes for the
// Red Party, the tenants vote for the Yellow Party, the fenced streets for the
// Blue Party, and the island's guests for the island
export const PARTY_BASE_VOTES: Record<SponsorId, number> = {
  red: 16,
  yellow: 16,
  blue: 14,
  green: 12,
};

// points = base + per client (fame / divisor + weight * (top - table place))
//        + donations / divisor + the leader's rating, minus affair penalties,
// where top is one past the last place, see votePlaceTop
export const VOTE_FAME_DIVISOR = 5;
export const VOTE_PLACE_WEIGHT = 3;
export const VOTE_DONATION_DIVISOR = 10;
// The poll jitters every list's share by up to this many points before it
// prints, and the count itself moves by up to this many on the night
export const POLL_NOISE_SEATS = 6;
export const ELECTION_NOISE_VOTES = 4;
// Every league punishment a signed player collects costs his party this many
// points at the next count; the voters read the paper too
export const PUNISHMENT_PARTY_PENALTY = 1;

export const DONATION_SCALE = [20, 50, 100, 200, 500, 1000, 2000, 4000, 8000];
// What a campaign chest buys its donor once the party governs: one favor a
// year from the first rung, then one more per rung up the ladder, five at
// the top. The first rung is low on purpose so a small donor is in the game
export const FAVOR_TIERS = [100, 500, 1000, 2000, 4000];
// An unsigned man can still pay into any campaign in an election season. The
// party books a tenth of it as if a member gave it and reads the rest as an
// application: the bigger the envelope, the likelier the contract offer, a
// sure thing at the top step
export const OUTSIDER_DONATION_STEPS = [200, 500, 1000];
export const OUTSIDER_DONATION_WEIGHT = 0.1;
export const OUTSIDER_OFFER_SURE_AT = 1000;
// How likely each personality is to open its wallet for a campaign at all;
// the amount is the biggest step of the scale it can pay above its reserve
export const AI_DONATION_CHANCE: Record<CareerPersonalityId, number> = {
  grinder: 0.3,
  showman: 0.9,
  schemer: 0.8,
  paranoid: 0.6,
  pro: 0.7,
  hedonist: 0.1,
  miser: 0,
  bruiser: 0.2,
};

// The one random event for now: the glizi price. Every story moves the
// price index by a random step and the index compounds. Hikes are a little
// likelier than drops, so prices creep up over the years like inflation,
// inside a floor and a ceiling. The leading
// party's rating moves by a couple of points with it, and a hike hurts the
// incumbent twice as hard as a drop helps, so a government that only sits
// still bleeds rating and has to buy it back with campaigns
export const GLIZI_PRICE_EVENT_CHANCE = 0.6;
export const GLIZI_PRICE_UP_CHANCE = 0.65;
export const GLIZI_PRICE_MOVE_MIN = 5;
export const GLIZI_PRICE_MOVE_MAX = 15;
export const GLIZI_PRICE_INDEX_MIN = 0.5;
export const GLIZI_PRICE_INDEX_MAX = 2.5;
export const GLIZI_PRICE_RATING_MIN = 2;
export const GLIZI_PRICE_RATING_MAX = 3;
export const GLIZI_PRICE_HIKE_RATING_SCALE = 2;

// What a seat at the table is worth. Each sponsor carries its own perk
// ladder by seat; here are the table bonus and the season pay that every
// party shares. The junior partner sits at base, the opposition pays
export const TABLE_BONUS_LEADER = 15;
export const TABLE_BONUS_OPPOSITION = 5;
export const YELLOW_WIN_PAY_LEADER = 50;
export const YELLOW_WIN_PAY_OPPOSITION = 30;

export function tableBonusFor(status?: PartyStatus): number {
  if (status === 'leader') return TABLE_BONUS_LEADER;
  if (status === 'opposition') return TABLE_BONUS_OPPOSITION;
  return POINTS_SPONSOR_BONUS;
}
export const SEASON_PAY_LEADER = 20;
export const SEASON_PAY_OPPOSITION = -10;
// The Blue Party house crew, by seat
export const BLUE_BLOCK_LEADER = 0.75;
export const BLUE_BLOCK_OPPOSITION = 0.45;
// State media pay, by seat
export const RED_MEDIA_LEADER = 3;
export const RED_MEDIA_OPPOSITION = 1.5;

// The leading party's power: a gift for its own clients and a tax on everyone
// outside the government. Junior partners feel neither half
export const BLUE_LEAD_BLOCK_BONUS = 0.1;
export const BLUE_LEAD_BLOCK_CAP = 0.85;
export const BLUE_LEAD_GUARD_TAX = 0.2;
export const GREEN_LEAD_SABOTAGE_TAX = 0.25;
export const YELLOW_LEAD_TAX = 30;
export const YELLOW_LEAD_REFUND = 30;
export const RED_LEAD_FAME_BONUS = 8;
export const RED_LEAD_FANS_TRAINING_SCALE = 0.5;
export const RED_LEAD_OUTSIDE_PAY_SCALE = 0.75;
export const RED_LEAD_OUTSIDE_FAME_SCALE = 0.5;
export const RED_LEAD_OUTSIDE_MEDIA_USES = 1;

// The favor: a donor whose party governs can have opponents removed, as many
// a year as his donation bought, one booked at a time and never from a
// final. It always lands, and the party always pays a few points at the next
// count. The AI rolls it every round it has a favor left
export const FAVOR_AI_CHANCE = 0.35;
export const FAVOR_VOTE_COST = 3;
export const FAVOR_TARGET_STRESS = 15;
export const FAVOR_TARGET_EGO = -10;

// A party vote in the chamber: every coach on the list has a voice, a human
// coach's counts five times. The coalition vote and the law ballot both count
// this way
export const AI_VOTE_WEIGHT = 1;
export const HUMAN_VOTE_WEIGHT = 5;
// How an AI coach picks a coalition (aiCoalitionPick): the party line,
// RANK_STEP per step down its list, then his own reasons. The people across
// the cabinet table: a grudge (lore rival, a human rival either way, whoever
// last sent men to his door) pushes RIVAL_PENALTY, twice that for a
// schemer; a coach sitting up to THREAT_PLACES above him, or within
// THREAT_POINT_SHARE of his points, is competition he would rather not
// share the perks with, and a paranoid minds every coach above him. All of
// that together is capped at PEOPLE_CAP either way
export const COALITION_RANK_STEP = 0.15;
// The name at the bottom of the party's list: only a coach with strong
// reasons of his own and a lucky nudge backs it
export const COALITION_LAST_PENALTY = 1.3;
export const COALITION_AI_NOISE = 1.4;
export const COALITION_RIVAL_PENALTY = 0.5;
export const COALITION_SCHEMER_GRUDGE_SCALE = 2;
export const COALITION_THREAT_PENALTY = 0.25;
export const COALITION_THREAT_PLACES = 3;
export const COALITION_THREAT_POINT_SHARE = 0.05;
export const COALITION_PARANOID_ABOVE = 0.15;
export const COALITION_PEOPLE_CAP = 1.5;
// The majority itself: a pro or a grinder wants a safe one, a schemer the
// smallest that carries, up to SAFE_MARGIN seats over fifty; the showman
// wants the most seats on the photo, no cap
export const COALITION_SAFE_MARGIN = 15;
export const COALITION_MARGIN_TASTE: Partial<
  Record<CareerPersonalityId, number>
> = {
  pro: 0.6,
  grinder: 0.5,
  schemer: -0.6,
};
export const COALITION_SHOWMAN_SEAT_BONUS = 0.04;
// A hedonist wants the island in
export const COALITION_HEDONIST_GREEN = 0.6;

export type ElectionResult = {
  // Vote share per party in whole percent, sums to 100
  votes: Record<SponsorId, number>;
  seats: Record<SponsorId, number>;
  // Leader first
  government: SponsorId[];
  // The largest list without a majority picks its partners by a vote of its
  // coaches; absent when a list governs alone or nobody sits on it
  coalition?: CoalitionBallot;
};
