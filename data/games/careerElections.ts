import { POINTS_SPONSOR_BONUS } from '@/data/games/careerEconomy';
import type { CareerPersonalityId } from '@/data/games/careerPersonalities';
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
  'ostrvo',
  'stranka',
  'korporacija',
  'zidari',
];

// Who each party would govern with, first choice first. When the largest
// party has no majority it tries a two-way with its first choice, then its
// second, and only takes both if neither is enough. The last name on every
// list never enters that party's government
export const PARTY_PARTNER_RANKS: Record<SponsorId, SponsorId[]> = {
  zidari: ['korporacija', 'ostrvo', 'stranka'],
  ostrvo: ['zidari', 'stranka', 'korporacija'],
  korporacija: ['zidari', 'ostrvo', 'stranka'],
  stranka: ['ostrvo', 'zidari', 'korporacija'],
};

// What each list polls with no players at all: the registry votes for the
// Stranka, the tenants vote for the Korporacija, the fenced streets for the
// Zidari, and the island's guests for the island
export const PARTY_BASE_VOTES: Record<SponsorId, number> = {
  stranka: 20,
  korporacija: 16,
  zidari: 14,
  ostrvo: 12,
};

// points = base + per client (fame / divisor + (top - table place))
//        + donations / divisor + the leader's rating, minus affair penalties,
// where top is one past the last place, see votePlaceTop
export const VOTE_FAME_DIVISOR = 5;
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
export const GLIZI_PRICE_UP_CHANCE = 0.55;
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
export const KORPORACIJA_WIN_PAY_LEADER = 50;
export const KORPORACIJA_WIN_PAY_OPPOSITION = 30;

export function tableBonusFor(status?: PartyStatus): number {
  if (status === 'leader') return TABLE_BONUS_LEADER;
  if (status === 'opposition') return TABLE_BONUS_OPPOSITION;
  return POINTS_SPONSOR_BONUS;
}
export const SEASON_PAY_LEADER = 20;
export const SEASON_PAY_OPPOSITION = -10;
// The Zidari house crew, by seat
export const ZIDARI_BLOCK_LEADER = 0.75;
export const ZIDARI_BLOCK_OPPOSITION = 0.45;
// State media pay, by seat
export const STRANKA_MEDIA_LEADER = 3;
export const STRANKA_MEDIA_OPPOSITION = 1.5;

// The leading party's power: a gift for its own clients and a tax on everyone
// outside the government. Junior partners feel neither half
export const ZIDARI_LEAD_BLOCK_BONUS = 0.1;
export const ZIDARI_LEAD_BLOCK_CAP = 0.85;
export const ZIDARI_LEAD_GUARD_TAX = 0.2;
export const OSTRVO_LEAD_SABOTAGE_TAX = 0.25;
export const KORPORACIJA_LEAD_TAX = 30;
export const KORPORACIJA_LEAD_REFUND = 30;
export const STRANKA_LEAD_FAME_BONUS = 8;
export const STRANKA_LEAD_FANS_TRAINING_SCALE = 0.5;
export const STRANKA_LEAD_OUTSIDE_PAY_SCALE = 0.75;
export const STRANKA_LEAD_OUTSIDE_FAME_SCALE = 0.5;
export const STRANKA_LEAD_OUTSIDE_MEDIA_USES = 1;

// The favor: a donor whose party governs can have opponents removed, as many
// a year as his donation bought, one booked at a time and never from a
// final. It always lands, and the party always pays a few points at the next
// count. The AI rolls it every round it has a favor left
export const FAVOR_AI_CHANCE = 0.35;
export const FAVOR_VOTE_COST = 3;
export const FAVOR_TARGET_STRESS = 15;
export const FAVOR_TARGET_EGO = -10;

export type ElectionResult = {
  // Vote share per party in whole percent, sums to 100
  votes: Record<SponsorId, number>;
  seats: Record<SponsorId, number>;
  // Leader first
  government: SponsorId[];
};
