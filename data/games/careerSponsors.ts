import type { SponsorId } from '@/lib/utils/careerSave';

export type SponsorDef = {
  id: SponsorId;
  baseInterest: number;
  seasonPay: number;
  perWinPay: number;
};

// Base interest is the weight of each list once a phone is ringing for a
// character nobody owns: the Red Party calls most, the Blue Party least
export const SPONSOR_DEFS: Record<SponsorId, SponsorDef> = {
  blue: { id: 'blue', baseInterest: 0.15, seasonPay: 70, perWinPay: 0 },
  green: { id: 'green', baseInterest: 0.25, seasonPay: 80, perWinPay: 0 },
  yellow: {
    id: 'yellow',
    baseInterest: 0.35,
    seasonPay: 60,
    perWinPay: 40,
  },
  red: { id: 'red', baseInterest: 0.4, seasonPay: 60, perWinPay: 0 },
};

export const SPONSOR_IDS: SponsorId[] = [
  'blue',
  'green',
  'yellow',
  'red',
];

// Some characters belong to a house, rolled from the name at this chance,
// the house one of these lists. Share is the chance that any call is the
// house calling, the rest of the calls split by the other lists' weights.
// The house also rings early: from the first window after the first cup, at
// HOUSE_OFFER_CHANCE a window, with no fame and no results asked
export const HOUSE_CHANCE = 3 / 16;
export const HOUSE_PARTIES: readonly SponsorId[] = ['blue', 'green', 'yellow'];
export const HOUSE_SHARE = 0.95;
export const HOUSE_OFFER_CHANCE = 0.5;

// Signing interest leanings, rolled from the name. These are weights against
// each other, not separate yes-or-no rolls: once a call is happening, they
// decide which of the four is on the line. A fan's list weighs between the
// two figures, a lukewarm character weighs two lists at the flat figure, and
// a zero means that sponsor will never sign him and the others split his share
export const AFFINITY_FAN_CHANCE = 3 / 16;
export const AFFINITY_FAN_MIN = 1.4;
export const AFFINITY_FAN_MAX = 1.9;
export const AFFINITY_LUKEWARM_CHANCE = 1 / 16;
export const AFFINITY_LUKEWARM_WEIGHT = 0.6;
export const AFFINITY_REFUSE_CHANCE = 1 / 16;

// Two independent doors into a contract, rolled separately every window.
//
// The earned call: in the first year, reaching the cup final is what gets you
// noticed. From year two on, the table does the talking and sitting in the top
// of it keeps the phone ringing every single window
export const SPONSOR_FINALIST_PLACE = 2;
export const SPONSOR_FINALIST_OFFER_CHANCE = 0.3;
export const SPONSOR_TOP_SEED_COUNT = 5;
export const SPONSOR_TOP_SEED_OFFER_CHANCE = 0.5;
// Fame the league wants to see before it puts a word in, waived from the
// year after this one
export const SPONSOR_FAME_GATE = 20;
export const SPONSOR_FAME_GATE_UNTIL_YEAR = 3;
// The fluke call: once in a blue moon somebody's phone rings for no reason at
// all, no results and no fame required. Once the city has voted for the
// first time the parties go looking for members and it rings more often, and
// more often again once the league is a few years old
export const SPONSOR_WILDCARD_CHANCE = 0.01;
export const SPONSOR_WILDCARD_CHANCE_AFTER_ELECTION = 0.05;
export const SPONSOR_WILDCARD_LATE_YEAR = 5;
export const SPONSOR_WILDCARD_CHANCE_LATE = 0.1;

// AI signings lean toward the emptier lists so no party swallows the league:
// every member a party has over the smallest one multiplies its pull by this,
// and a party already holding this share of the league (never under two)
// stops calling AI coaches at all, its own house names included
export const PARTY_CROWD_FACTOR = 0.4;
export const PARTY_CAP_SHARE = 0.4;
export const PARTY_CAP_MIN = 2;
