import type { CareerPersonalityId } from '@/data/games/careerPersonalities';

export type LawId =
  | 'holiday'
  | 'training-subsidy'
  | 'lottery'
  | 'wealth-tax'
  | 'credit-law'
  | 'tourist-tax'
  | 'curfew'
  | 'public-order'
  | 'amnesty'
  | 'fencing';

// Laws in one group cannot stand together: passing one repeals the other
export type LawConflictGroup = 'order';

export type LawDef = {
  id: LawId;
  conflict?: LawConflictGroup;
};

export const LAW_DEFS: Record<LawId, LawDef> = {
  holiday: { id: 'holiday' },
  'training-subsidy': { id: 'training-subsidy' },
  lottery: { id: 'lottery' },
  'wealth-tax': { id: 'wealth-tax' },
  'credit-law': { id: 'credit-law' },
  'tourist-tax': { id: 'tourist-tax' },
  curfew: { id: 'curfew' },
  'public-order': { id: 'public-order', conflict: 'order' },
  amnesty: { id: 'amnesty', conflict: 'order' },
  fencing: { id: 'fencing' },
};

export const LAW_ORDER: LawId[] = Object.keys(LAW_DEFS) as LawId[];

// Laws taken out of the game: what an old save or room reads them as, or
// null when it drops them
export const RETIRED_LAWS: Record<string, LawId | null> = {
  'circuit-breaker': 'credit-law',
  'prize-fund': null,
  'admin-tax': null,
  'party-finance': null,
  'state-tender': null,
  'exchange-privatization': null,
  'lease-law': null,
  'guard-license': null,
  crackdown: null,
  'island-weekend': null,
  'opposition-hunt': null,
  'lift-controls': null,
};

// Whom a law lands on, for the bill's header: every coach, the government's
// coaches, or money moved from the opposition to the government
export type LawScope = 'everyone' | 'government' | 'transfer';

export const LAW_SCOPES: Record<LawId, LawScope> = {
  holiday: 'everyone',
  'training-subsidy': 'everyone',
  lottery: 'everyone',
  'wealth-tax': 'everyone',
  'credit-law': 'everyone',
  'tourist-tax': 'transfer',
  curfew: 'everyone',
  'public-order': 'everyone',
  amnesty: 'everyone',
  fencing: 'government',
};

// The ballot: once per term, after the Frozen cup of the year between two
// counts, so the new laws are on the books when the Patlidzan window opens
export const LAW_VOTE_SEASON = 0;
export const MAX_LAWS_IN_FORCE = 5;
// A full house offers this many repeal cards and nothing else
export const MAX_REPEAL_CARDS = 3;
// The table always deals this many cards when the leader has laws left
export const LAW_CARD_COUNT = 3;
// Chamber weight per seat: the leading party's coach outweighs the partner's,
// and a human outweighs an AI on either bench. Kept low enough that in a
// usual roll (four leading coaches, three partners) no single human can sink
// a vote alone, while two humans together usually can
export const LAW_LEADER_WEIGHT = 3;
export const LAW_PARTNER_WEIGHT = 2;
export const LAW_LEADER_HUMAN_WEIGHT = 5;
export const LAW_PARTNER_HUMAN_WEIGHT = 4;
// A law passes with at least this share of all the weight, and in a
// coalition also with at least this share of the junior partners' weight, so
// the leading party never carries one alone
export const LAW_PASS_SHARE = 0.75;
export const LAW_PARTNER_PASS_SHARE = 0.5;
// The AI coach votes yes when the government whip, his own motive
// (LAW_STAKES and the table, see careerVoteMotives.ts) and a nudge of up to
// its temperament's noise either way add up above zero. The junior
// partner's bench answers to a looser whip
export const LAW_AI_NOISE = 1.7;
export const LAW_WHIP_BONUS = 0.9;
export const LAW_PARTNER_WHIP_BONUS = 0.5;
// The prime minister picks the card the leading party's coaches want most,
// counting the partners' average motive this much against theirs, plus a
// nudge of up to the noise
export const LAW_PICK_PARTNER_WEIGHT = 1;
export const LAW_PICK_NOISE = 1.2;
// How far each temperament strays from the whip
export const LAW_PERSONALITY_NOISE: Record<CareerPersonalityId, number> = {
  grinder: 1.1,
  showman: 1.7,
  schemer: 2.2,
  paranoid: 1.4,
  pro: 0.8,
  hedonist: 2,
  miser: 1.4,
  bruiser: 1.7,
};
// What a law means to one coach (LAW_STAKES in careerVoteMotives.ts),
// capped at STAKE_CAP either way
export const LAW_STAKE_CAP = 1.5;
// Below this many glizara a coach counts as short of money
export const LAW_POOR_MONEY = 150;
// The wealth tax worries a coach from this many glizara up, well under the
// threshold, since a good year carries him over it
export const LAW_WEALTH_PIVOT = 200;
// Stress where a holiday starts to matter
export const LAW_STRESS_PIVOT = 45;
export const LAW_STRESS_SPAN = 35;
// How likely a voter's party is out of the government by the time a law
// that splits the chamber bites him: the leading party's coach sits safer
// than the junior partner's
export const LAW_OPPOSITION_RISK_LEADER = 0.3;
export const LAW_OPPOSITION_RISK_PARTNER = 0.5;
// Plots a year (landed or failed) that make a coach a full-time plotter;
// his temperament's taste for plots counts the same as his record
export const VOTER_PLOT_RATE = 0.6;
// A coach somebody has sent people to lately feels this much more targeted
// than his table place alone says
export const VOTER_HIT_TARGETED = 0.3;
// Skill levels off the league's median that count as far ahead or behind
export const VOTER_SKILL_SPAN = 4;
// The keenest plot drive in careerPersonalities.ts: the taste for plots is
// read as a share of it
export const VOTER_TOP_PLOT_DRIVE = 0.7;
// Who likes a gamble (+1) and who wants the books steady (-1)
export const LAW_GAMBLE_TASTE: Record<CareerPersonalityId, number> = {
  showman: 1,
  hedonist: 1,
  schemer: 1,
  bruiser: 0.5,
  paranoid: -0.5,
  grinder: -0.5,
  pro: -1,
  miser: -1,
};

// How far a law evens the league out: the bottom of the table leans toward
// these and the top away
export const LAW_EQUALIZING: Partial<Record<LawId, number>> = {
  lottery: 0.5,
  'training-subsidy': 0.5,
  'wealth-tax': 1,
  'credit-law': 0.5,
};
export const LAW_TABLE_WEIGHT = 0.6;

// One-party rule: from this year on, a party holding at least this share of
// all the seats in the chamber may put a new constitution to it. It needs
// this share of the governing benches' weight, a little more than a law,
// and it ends the campaign with the whole party as the winner
export const CONSTITUTION_FROM_YEAR = 11;
export const CONSTITUTION_SEAT_SHARE = 2 / 3;
export const CONSTITUTION_PASS_SHARE = 0.8;
// The AI coach's vote on it: the whole party wins, so the base leans yes, and
// a coach this far along the crown's points would rather take it alone, his
// pull growing to AMBITION at the crown itself
export const CONSTITUTION_BASE = 1.5;
export const CONSTITUTION_AMBITION_FROM = 0.6;
export const CONSTITUTION_AMBITION = 2.5;
// Every failed try at one-party rule costs the party this much rating, for
// good, at every count after it
export const CONSTITUTION_FAIL_RATING_PENALTY = 40;

// Effects, by law
export const HOLIDAY_STRESS_DROP = 10;
export const LOTTERY_TICKET = 20;
export const TRAINING_SUBSIDY_SCALE = 0.75;
export const WEALTH_TAX_THRESHOLD = 500;
export const WEALTH_TAX_RATE = 0.05;
// Extra glizara every coach may borrow at the bank's counter, on top of
// whatever line the Yellow Party gives its own clients
export const CREDIT_LAW_LINE = 200;
export const CURFEW_CHANCE_DROP = 0.15;
export const FENCING_STANDING_BONUS = 0.1;
export const PUBLIC_ORDER_SCALE = 2;
export const TOURIST_TAX = 30;
