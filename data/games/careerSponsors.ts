import type { SponsorId } from '@/lib/utils/careerSave';

export type SponsorDef = {
  id: SponsorId;
  baseInterest: number;
  seasonPay: number;
  perWinPay: number;
};

// Base interest is the weight of each list once a phone is ringing for a
// character nobody owns: the Stranka calls most, the Zidari least
export const SPONSOR_DEFS: Record<SponsorId, SponsorDef> = {
  zidari: { id: 'zidari', baseInterest: 0.15, seasonPay: 70, perWinPay: 0 },
  ostrvo: { id: 'ostrvo', baseInterest: 0.25, seasonPay: 80, perWinPay: 0 },
  korporacija: { id: 'korporacija', baseInterest: 0.35, seasonPay: 60, perWinPay: 40 },
  stranka: { id: 'stranka', baseInterest: 0.4, seasonPay: 60, perWinPay: 0 },
};

export const SPONSOR_IDS: SponsorId[] = [
  'zidari',
  'ostrvo',
  'korporacija',
  'stranka',
];

// Three characters belong to a house. Share is the chance that any call is
// the house calling, the rest of the calls split by the other lists' weights.
// The house also rings early: from the first window after the first cup, at
// HOUSE_OFFER_CHANCE a window, with no fame and no results asked
export const HOUSE_SPONSORS: Record<
  string,
  { sponsor: SponsorId; share: number }
> = {
  'bane': { sponsor: 'zidari', share: 0.95 },
  'jovan': { sponsor: 'ostrvo', share: 0.95 },
  nikola: { sponsor: 'korporacija', share: 0.95 },
};
export const HOUSE_OFFER_CHANCE = 0.5;

// Lore-based signing interest. These are weights against each other, not
// separate yes-or-no rolls: once a call is happening, they decide which of the
// four is on the line. A zero means that sponsor will never sign this
// character and the others split his share
export const AFFINITY_OVERRIDES: Record<
  string,
  Partial<Record<SponsorId, number>>
> = {
  kosta: { stranka: 1.4 },
  dusan: { zidari: 1.86 },
  dax: { ostrvo: 1.67 },
  'halvard': { ostrvo: 0.6, zidari: 0.6 },
  steva: { korporacija: 0 },
};

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
export const SPONSOR_FAME_GATE = 50;
export const SPONSOR_FAME_GATE_UNTIL_YEAR = 5;
// The fluke call: once in a blue moon somebody's phone rings for no reason at
// all, no results and no fame required
export const SPONSOR_WILDCARD_CHANCE = 0.01;

export function sponsorInterest(slug: string, id: SponsorId): number {
  return AFFINITY_OVERRIDES[slug]?.[id] ?? SPONSOR_DEFS[id].baseInterest;
}
