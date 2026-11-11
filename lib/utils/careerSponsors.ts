import {
  HOUSE_OFFER_CHANCE,
  PARTY_CAP_MIN,
  PARTY_CAP_SHARE,
  PARTY_CROWD_FACTOR,
  SPONSOR_DEFS,
  SPONSOR_FAME_GATE,
  SPONSOR_FAME_GATE_UNTIL_YEAR,
  SPONSOR_FINALIST_OFFER_CHANCE,
  SPONSOR_FINALIST_PLACE,
  SPONSOR_IDS,
  SPONSOR_TOP_SEED_OFFER_CHANCE,
  SPONSOR_WILDCARD_CHANCE,
  SPONSOR_WILDCARD_CHANCE_AFTER_ELECTION,
  SPONSOR_WILDCARD_CHANCE_LATE,
  SPONSOR_WILDCARD_LATE_YEAR,
} from '@/data/games/careerSponsors';
import { houseSponsor, sponsorInterest } from '@/lib/utils/characterTraits';
import { GREEN_SABOTAGE_DISCOUNT } from '@/data/games/careerEconomy';
import {
  ELECTION_FIRST_YEAR,
  YELLOW_WIN_PAY_LEADER,
  YELLOW_WIN_PAY_OPPOSITION,
} from '@/data/games/careerElections';
import { seasonPayAdjust } from '@/lib/utils/careerElections';
import type {
  CharacterCareerState,
  PartyStatus,
  SponsorContract,
  SponsorId,
} from '@/lib/utils/careerSave';
import { weightedPick } from '@/lib/utils/weightedPick';

export function isSponsorId(value: string | undefined): value is SponsorId {
  return SPONSOR_IDS.some((id) => id === value);
}

export function newContract(sponsorId: SponsorId): SponsorContract {
  return { sponsorId };
}

export type SponsorOffer = { sponsorId: SponsorId; wildcard: boolean };

export type SponsorOfferContext = {
  year: number;
  // Placing in the cup just played, 0 for anyone who never reached the bracket
  place: number;
  // Inside SPONSOR_TOP_SEED_COUNT of the table
  topSeed: boolean;
};

// Who is on the phone, once the phone is ringing. A house character hears
// from his house at the house share; every other call is split by the lore
// weights, so somebody always calls and a list a character refuses never does
export function rollSponsorFor(
  slug: string,
  crowd?: PartyCrowd,
): SponsorId | null {
  const house = houseSponsor(slug);
  if (
    house &&
    crowdWeight(house.sponsor, crowd) > 0 &&
    Math.random() < house.share
  ) {
    return house.sponsor;
  }
  const pool = SPONSOR_IDS.filter((id) => id !== house?.sponsor);
  const pull = (id: SponsorId) =>
    sponsorInterest(slug, id) * crowdWeight(id, crowd);
  const total = pool.reduce((sum, id) => sum + pull(id), 0);
  if (total <= 0) return null;
  return weightedPick(pool, pull);
}

// Who sits on which list right now, for the AI's calls only; humans sign
// with whoever rings
export type PartyCrowd = {
  members: Record<SponsorId, number>;
  tableSize: number;
};

export function partyCrowd(
  characters: Record<string, CharacterCareerState>,
): PartyCrowd {
  const members = Object.fromEntries(
    SPONSOR_IDS.map((id) => [id, 0]),
  ) as Record<SponsorId, number>;
  const all = Object.values(characters);
  all.forEach((ch) => {
    if (ch.sponsor) members[ch.sponsor.sponsorId] += 1;
  });
  return { members, tableSize: all.length };
}

function partyCap(tableSize: number): number {
  return Math.max(PARTY_CAP_MIN, Math.ceil(tableSize * PARTY_CAP_SHARE));
}

function crowdWeight(id: SponsorId, crowd: PartyCrowd | undefined): number {
  if (!crowd) return 1;
  if (crowd.members[id] >= partyCap(crowd.tableSize)) return 0;
  const fewest = Math.min(...SPONSOR_IDS.map((p) => crowd.members[p]));
  return PARTY_CROWD_FACTOR ** (crowd.members[id] - fewest);
}

// The first count closes year ELECTION_FIRST_YEAR, so every year after it
// already has a parliament
function wildcardChance(year: number): number {
  if (year >= SPONSOR_WILDCARD_LATE_YEAR) return SPONSOR_WILDCARD_CHANCE_LATE;
  return year > ELECTION_FIRST_YEAR
    ? SPONSOR_WILDCARD_CHANCE_AFTER_ELECTION
    : SPONSOR_WILDCARD_CHANCE;
}

export function fameGateApplies(year: number): boolean {
  return year <= SPONSOR_FAME_GATE_UNTIL_YEAR;
}

// How likely the league itself puts a word in for this character: the cup
// final in the first year, the top of the table from the second on
export function earnedOfferChance(ctx: SponsorOfferContext): number {
  if (ctx.year <= 1) {
    return ctx.place >= 1 && ctx.place <= SPONSOR_FINALIST_PLACE
      ? SPONSOR_FINALIST_OFFER_CHANCE
      : 0;
  }
  return ctx.topSeed ? SPONSOR_TOP_SEED_OFFER_CHANCE : 0;
}

// Three doors are rolled every window and none blocks another: the house
// call, the fluke and the earned call. Landing on the same sponsor twice is
// one offer, and a real call outranks the fluke
export function rollSponsorOffers(
  slug: string,
  ch: CharacterCareerState,
  ctx: SponsorOfferContext,
  crowd?: PartyCrowd,
): SponsorOffer[] {
  if (ch.sponsor) return [];
  const offers = new Map<SponsorId, boolean>();
  if (Math.random() < wildcardChance(ctx.year)) {
    const id = rollSponsorFor(slug, crowd);
    if (id) offers.set(id, true);
  }
  const house = houseSponsor(slug);
  if (
    house &&
    crowdWeight(house.sponsor, crowd) > 0 &&
    Math.random() < HOUSE_OFFER_CHANCE
  ) {
    offers.set(house.sponsor, false);
  }
  const earned = earnedOfferChance(ctx);
  const famous = !fameGateApplies(ctx.year) || ch.fame >= SPONSOR_FAME_GATE;
  if (earned > 0 && famous && Math.random() < earned) {
    const id = rollSponsorFor(slug, crowd);
    if (id) offers.set(id, false);
  }
  return [...offers].map(([sponsorId, wildcard]) => ({ sponsorId, wildcard }));
}

// Season pay by seat: the leading party's clients draw the budget line, the
// opposition pays the solidarity levy, and the Yellow Party's per-win money
// follows the same ladder
export function sponsorPayout(
  contract: SponsorContract,
  matchWins: number,
  status?: PartyStatus,
): number {
  const def = SPONSOR_DEFS[contract.sponsorId];
  const perWin =
    contract.sponsorId === 'yellow'
      ? status === 'leader'
        ? YELLOW_WIN_PAY_LEADER
        : status === 'opposition'
          ? YELLOW_WIN_PAY_OPPOSITION
          : def.perWinPay
      : def.perWinPay;
  return def.seasonPay + seasonPayAdjust(status) + perWin * matchWins;
}

export function isGreenClient(ch: CharacterCareerState): boolean {
  return ch.sponsor?.sponsorId === 'green';
}

// What the island's clients pay for a job relative to the street price
export function greenSabotageScale(ch: CharacterCareerState): number {
  return isGreenClient(ch) ? 1 - GREEN_SABOTAGE_DISCOUNT : 1;
}

// How many cup matches a final placing must have taken, read back off the
// 16-slot bracket. The player's contract is paid from a counted tally; this
// is the same number for everybody else, who are not tracked match by match
export function cupWinsForPlace(place: number): number {
  if (place === 1) return 4;
  if (place === 2) return 3;
  if (place >= 3 && place <= 4) return 2;
  if (place >= 5 && place <= 8) return 1;
  return 0;
}
