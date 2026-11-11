import {
  ELECTION_EVERY_YEARS,
  ELECTION_FIRST_YEAR,
} from '@/data/games/careerElections';
import { PARLIAMENT_SEATS } from '@/data/games/careerElections';
import {
  CONSTITUTION_AMBITION,
  CONSTITUTION_AMBITION_FROM,
  CONSTITUTION_BASE,
  CONSTITUTION_FAIL_RATING_PENALTY,
  CONSTITUTION_FROM_YEAR,
  CONSTITUTION_PASS_SHARE,
  CONSTITUTION_SEAT_SHARE,
  CREDIT_LAW_LINE,
  CURFEW_CHANCE_DROP,
  FENCING_STANDING_BONUS,
  HOLIDAY_STRESS_DROP,
  LAW_AI_NOISE,
  LAW_DEFS,
  LAW_LEADER_HUMAN_WEIGHT,
  LAW_LEADER_WEIGHT,
  LAW_ORDER,
  LAW_PARTNER_HUMAN_WEIGHT,
  LAW_PARTNER_PASS_SHARE,
  LAW_PARTNER_WEIGHT,
  LAW_PARTNER_WHIP_BONUS,
  LAW_PASS_SHARE,
  LAW_PERSONALITY_NOISE,
  LAW_PICK_NOISE,
  LAW_PICK_PARTNER_WEIGHT,
  LAW_VOTE_SEASON,
  LAW_WHIP_BONUS,
  LOTTERY_TICKET,
  MAX_LAWS_IN_FORCE,
  MAX_REPEAL_CARDS,
  LAW_CARD_COUNT,
  PUBLIC_ORDER_SCALE,
  TOURIST_TAX,
  TRAINING_SUBSIDY_SCALE,
  WEALTH_TAX_RATE,
  WEALTH_TAX_THRESHOLD,
  type LawId,
} from '@/data/games/careerLaws';
import { PRIZE_MONEY } from '@/data/games/careerEconomy';
import { GAMES_UI } from '@/data/games/locale';
import { lawBillLetter, lawLetter, leagueNews } from '@/lib/utils/careerMail';
import {
  aiPreferencePick,
  castBallot,
  fillBallots,
  newBallot,
  pendingHumans,
  tallyBallots,
  type Ballot,
} from '@/lib/utils/careerParliamentVote';
import {
  campaignOverlord,
  careerPoints,
  isHumanSlug,
  overlordGoal,
  rankBySeeding,
  seedingKey,
} from '@/lib/utils/careerPoints';
import type {
  CharacterCareerState,
  MailItem,
  NewsItem,
  Parliament,
  SavedCareer,
  SponsorId,
} from '@/lib/utils/careerSave';
import { lawMotive, voterProfile } from '@/lib/utils/careerVoteMotives';
import { fmt } from '@/lib/utils/format';

export type LawVote = 'yes' | 'no';
export const LAW_VOTES: LawVote[] = ['yes', 'no'];

export type BillCard = { action: 'pass' | 'repeal'; law: LawId };
// A party holding two thirds of the chamber rewrites the constitution:
// one-party rule
export type ConstitutionCard = { action: 'constitution'; party: SponsorId };
export type LawCard = BillCard | ConstitutionCard;

// The constitution the chamber passed, and every coach of the party when it
// did; they all won the campaign
export type ConstitutionWin = {
  party: SponsorId;
  year: number;
  season: number;
  winners: string[];
};

export type LawInForce = {
  id: LawId;
  year: number;
  season: number;
  // The government that passed it, leader first
  government: SponsorId[];
};

export type LawOutcome = 'passed' | 'failed';

export type LawBallot = {
  year: number;
  season: number;
  // Leader first
  government: SponsorId[];
  cards: LawCard[];
  // The leading party's coach highest in the table; null when the list has
  // nobody, and the AI picks for the government
  picker: string | null;
  pick: number | null;
  // The human picker let the clock run out and the AI picked for him
  autoPick?: boolean;
  // Empty until a card is picked: every coach signed to a governing party,
  // table order
  ballots: Ballot<LawVote>[];
  // The roll's coaches from the junior partners, whose own share of the
  // weight must back a law too. Absent on a vote cast before the rule
  partners?: string[];
  outcome: LawOutcome | null;
  // Off the books by this vote: the repeal card's law, or the laws a passed
  // one pushed out of its conflict group
  repealed?: LawId[];
};

export type LawMove = { law: LawId; amount: number };

const pct = (scale: number) => Math.round(Math.abs(scale - 1) * 100);

// The numbers every law's text quotes, straight off the tunables
const LAW_EFFECT_PARAMS: Partial<Record<LawId, Record<string, number>>> = {
  holiday: { stress: HOLIDAY_STRESS_DROP },
  lottery: { amount: LOTTERY_TICKET },
  'training-subsidy': { pct: pct(TRAINING_SUBSIDY_SCALE) },
  'wealth-tax': {
    threshold: WEALTH_TAX_THRESHOLD,
    pct: Math.round(WEALTH_TAX_RATE * 100),
  },
  'credit-law': { amount: CREDIT_LAW_LINE },
  curfew: { pct: Math.round(CURFEW_CHANCE_DROP * 100) },
  fencing: { pct: Math.round(FENCING_STANDING_BONUS * 100) },
  'public-order': { scale: PUBLIC_ORDER_SCALE },
  'tourist-tax': { amount: TOURIST_TAX },
};

// Screens only, read at call time: the server stores and sends the law id
export function lawName(id: LawId): string {
  return (GAMES_UI.career.laws.names as Record<LawId, string>)[id] ?? id;
}

export function lawEffectText(id: LawId): string {
  const effects = GAMES_UI.career.laws.effects as Record<LawId, string>;
  return fmt(effects[id] ?? '', LAW_EFFECT_PARAMS[id] ?? {});
}

export function isLawId(value: unknown): value is LawId {
  return typeof value === 'string' && value in LAW_DEFS;
}

// The ballot is held in the years between two counts, once a government
// sits; LAW_VOTE_SEASON's cup closes the door on it
export function isLawYear(year: number): boolean {
  return (
    year > ELECTION_FIRST_YEAR &&
    (year - ELECTION_FIRST_YEAR) % ELECTION_EVERY_YEARS !== 0
  );
}

export function lawsInForce(parliament?: Parliament): LawInForce[] {
  return parliament?.laws ?? [];
}

export function lawActive(
  parliament: Parliament | undefined,
  id: LawId,
): boolean {
  return lawsInForce(parliament).some((l) => l.id === id);
}

export function lawVotes(parliament?: Parliament): LawBallot[] {
  return parliament?.lawVotes ?? [];
}

export function constitutionWin(
  parliament?: Parliament,
): ConstitutionWin | null {
  return parliament?.constitution ?? null;
}

export function isConstitutionCard(
  card: LawCard | null | undefined,
): card is ConstitutionCard {
  return card?.action === 'constitution';
}

// The seats a party must hold to put up a new constitution: two thirds of
// the whole chamber
export function constitutionSeatsNeeded(parliament?: Parliament): number {
  const total = parliament
    ? Object.values(parliament.seats).reduce((sum, n) => sum + n, 0)
    : PARLIAMENT_SEATS;
  return Math.ceil(total * CONSTITUTION_SEAT_SHARE - 1e-9);
}

// The party that may rewrite the constitution at this vote: from year
// CONSTITUTION_FROM_YEAR on, the leading party holding two thirds of all the
// seats, with somebody on its list, while the campaign is still open
function constitutionParty(state: SavedCareer): SponsorId | null {
  const parliament = state.parliament;
  if (!parliament || state.year < CONSTITUTION_FROM_YEAR) return null;
  if (parliament.constitution || campaignOverlord(state)) return null;
  const party = parliament.government[0];
  if (!party) return null;
  if (parliament.seats[party] < constitutionSeatsNeeded(parliament)) return null;
  return Object.values(state.characters).some(
    (ch) => ch.sponsor?.sponsorId === party,
  )
    ? party
    : null;
}

// Due once the season's cup is in, in a law year, under a sitting government
// that has not voted this year
export function lawVoteDue(state: {
  year: number;
  season: number;
  parliament?: Parliament;
}): boolean {
  const parliament = state.parliament;
  return (
    state.season === LAW_VOTE_SEASON &&
    isLawYear(state.year) &&
    (parliament?.government.length ?? 0) > 0 &&
    !parliament?.lawBallot &&
    !lawVotes(parliament).some((v) => v.year === state.year)
  );
}

export function inGovernment(
  ch: CharacterCareerState,
  parliament?: Parliament,
): boolean {
  return (
    (parliament?.government.length ?? 0) > 0 &&
    (ch.partyStatus === 'leader' || ch.partyStatus === 'partner')
  );
}

// Outside the government: another party's client or nobody's, while somebody
// governs
function inOpposition(
  ch: CharacterCareerState,
  parliament?: Parliament,
): boolean {
  return (
    (parliament?.government.length ?? 0) > 0 && !inGovernment(ch, parliament)
  );
}

export function trainingLawScale(parliament?: Parliament): number {
  return lawActive(parliament, 'training-subsidy') ? TRAINING_SUBSIDY_SCALE : 1;
}

// What every job costs whoever the target is
export function sabotageLawScale(parliament?: Parliament): number {
  return lawActive(parliament, 'public-order') ? PUBLIC_ORDER_SCALE : 1;
}

export function sabotageLawChance(
  chance: number,
  parliament?: Parliament,
): number {
  return lawActive(parliament, 'curfew')
    ? Math.max(0, chance - CURFEW_CHANCE_DROP)
    : chance;
}

export function punishmentsCostVotes(parliament?: Parliament): boolean {
  return !lawActive(parliament, 'amnesty');
}

export function standingLawBonus(
  ch: CharacterCareerState,
  parliament?: Parliament,
): number {
  return lawActive(parliament, 'fencing') && inGovernment(ch, parliament)
    ? FENCING_STANDING_BONUS
    : 0;
}

export function cupPrizeFor(place: number): number {
  return place >= 1 && place <= PRIZE_MONEY.length ? PRIZE_MONEY[place - 1] : 0;
}

// What the credit law adds to every coach's line at the bank's counter
export function creditLawLine(parliament?: Parliament): number {
  return lawActive(parliament, 'credit-law') ? CREDIT_LAW_LINE : 0;
}

function governmentSlugs(state: {
  characters: Record<string, CharacterCareerState>;
  parliament?: Parliament;
}): string[] {
  return Object.keys(state.characters)
    .filter((slug) => inGovernment(state.characters[slug], state.parliament))
    .sort();
}

// An amount split evenly, the odd glizari to the first names
function splitAmong(amount: number, slugs: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  if (slugs.length === 0 || amount <= 0) return out;
  const share = Math.floor(amount / slugs.length);
  const rest = amount - share * slugs.length;
  slugs.forEach((slug, i) => {
    const n = share + (i < rest ? 1 : 0);
    if (n > 0) out[slug] = n;
  });
  return out;
}

// Every per-season bill and payout the laws on the books write, per coach,
// off the wallets as they stand when the window opens. Nobody pays more than
// he has. The lottery pot goes to a random coach when a new year opens
function seasonLawMoves(
  state: {
    year: number;
    season: number;
    characters: Record<string, CharacterCareerState>;
    parliament?: Parliament;
  },
  wallets: Record<string, number>,
  random: () => number = Math.random,
): {
  moves: Record<string, LawMove[]>;
  pot: number;
  winner: string | null;
  jackpot: number;
} {
  const parliament = state.parliament;
  const slugs = Object.keys(state.characters).sort();
  const money = { ...wallets };
  const moves: Record<string, LawMove[]> = {};
  const move = (slug: string, law: LawId, amount: number) => {
    if (amount === 0) return;
    money[slug] = (money[slug] ?? 0) + amount;
    (moves[slug] ??= []).push({ law, amount });
  };
  const charge = (slug: string, law: LawId, amount: number) => {
    const due = Math.min(amount, Math.max(0, money[slug] ?? 0));
    move(slug, law, -due);
    return due;
  };
  let pot = parliament?.lotteryPot ?? 0;
  let winner: string | null = null;
  let jackpot = 0;
  if (state.season === 0 && pot > 0 && slugs.length > 0) {
    winner = slugs[Math.floor(random() * slugs.length)];
    jackpot = pot;
    move(winner, 'lottery', pot);
    pot = 0;
  }
  if (!parliament || lawsInForce(parliament).length === 0) {
    return { moves, pot, winner, jackpot };
  }
  const government = governmentSlugs(state);
  const opposition = slugs.filter((slug) =>
    inOpposition(state.characters[slug], parliament),
  );
  if (lawActive(parliament, 'wealth-tax')) {
    slugs.forEach((slug) => {
      const wealth = money[slug] ?? 0;
      if (wealth > WEALTH_TAX_THRESHOLD) {
        charge(slug, 'wealth-tax', Math.round(wealth * WEALTH_TAX_RATE));
      }
    });
  }
  if (lawActive(parliament, 'lottery')) {
    slugs.forEach((slug) => {
      pot += charge(slug, 'lottery', LOTTERY_TICKET);
    });
  }
  if (lawActive(parliament, 'tourist-tax') && government.length > 0) {
    const collected = opposition.reduce(
      (sum, slug) => sum + charge(slug, 'tourist-tax', TOURIST_TAX),
      0,
    );
    Object.entries(splitAmong(collected, government)).forEach(([slug, n]) =>
      move(slug, 'tourist-tax', n),
    );
  }
  return { moves, pot, winner, jackpot };
}

export function lawMovesTotal(moves: LawMove[] | undefined): number {
  return (moves ?? []).reduce((sum, m) => sum + m.amount, 0);
}

// The window opens under the laws: the holiday takes its bite out of every
// coach's stress, the bills and payouts land, the AI's wallets settle on the
// spot and the lottery winner makes the paper. Human wallets are the
// caller's to settle, from the moves handed back
export function applySeasonLaws(
  state: SavedCareer,
  humanWallets: Record<string, number>,
  random: () => number = Math.random,
): { state: SavedCareer; moves: Record<string, LawMove[]> } {
  const parliament = state.parliament;
  if (!parliament) return { state, moves: {} };
  const holiday = lawActive(parliament, 'holiday');
  const rested = holiday
    ? Object.fromEntries(
        Object.entries(state.characters).map(([slug, ch]) => [
          slug,
          { ...ch, stress: Math.max(0, ch.stress - HOLIDAY_STRESS_DROP) },
        ]),
      )
    : state.characters;
  const wallets: Record<string, number> = {};
  Object.entries(rested).forEach(([slug, ch]) => {
    wallets[slug] = humanWallets[slug] ?? ch.money ?? 0;
  });
  const { moves, pot, winner, jackpot } = seasonLawMoves(
    { ...state, characters: rested },
    wallets,
    random,
  );
  const characters = { ...rested };
  Object.entries(moves).forEach(([slug, list]) => {
    if (slug in humanWallets) return;
    const ch = characters[slug];
    characters[slug] = { ...ch, money: (ch.money ?? 0) + lawMovesTotal(list) };
  });
  const news: NewsItem[] = winner
    ? [
        {
          kind: 'league',
          templateKey: 'law-lottery',
          params: { pot: jackpot },
          slugs: [winner],
          freezeframe: 'ballot',
        },
      ]
    : [];
  return {
    state: {
      ...state,
      characters,
      parliament: { ...parliament, lotteryPot: pot },
      newsQueue: [...state.newsQueue, ...news],
    },
    moves,
  };
}

// The constitution votes a party put up and lost, read off the record so
// saves from before the rule count none
export function constitutionFailures(
  parliament: Parliament | undefined,
  party: SponsorId,
): number {
  return lawVotes(parliament).filter((vote) => {
    const card = pickedCard(vote);
    return (
      vote.outcome === 'failed' &&
      card?.action === 'constitution' &&
      card.party === party
    );
  }).length;
}

export function constitutionRatingPenalty(
  parliament: Parliament | undefined,
  party: SponsorId,
): number {
  return constitutionFailures(parliament, party) * CONSTITUTION_FAIL_RATING_PENALTY;
}

// What one party's coaches make of a law, on average. A bench nobody sits
// on counts nothing
function benchMotive(
  state: SavedCareer,
  party: SponsorId,
  leading: boolean,
  law: LawId,
  seeding: string[],
): number {
  const slugs = seeding.filter(
    (slug) => state.characters[slug].sponsor?.sponsorId === party,
  );
  if (slugs.length === 0) return 0;
  return (
    slugs.reduce(
      (sum, slug) =>
        sum + lawMotive(law, voterProfile(state, slug, leading, seeding)),
      0,
    ) / slugs.length
  );
}

// What the government makes of a law: the leading party's coaches, with the
// partners' average counted in
function governmentMotive(
  state: SavedCareer,
  government: SponsorId[],
  law: LawId,
  seeding: string[],
): number {
  const [leader, ...partners] = government;
  const partnersMotive =
    partners.length === 0
      ? 0
      : partners.reduce(
          (sum, party) => sum + benchMotive(state, party, false, law, seeding),
          0,
        ) / partners.length;
  return (
    benchMotive(state, leader, true, law, seeding) +
    LAW_PICK_PARTNER_WEIGHT * partnersMotive
  );
}

// The laws on the books the government would most like gone: never one the
// leading party put up itself, those passed by a government with none of
// today's parties first, then the one the benches like least, oldest first
function repealCandidates(
  state: SavedCareer,
  laws: LawInForce[],
  government: SponsorId[],
  seeding: string[],
): LawId[] {
  const shared = (l: LawInForce) =>
    l.government.some((party) => government.includes(party)) ? 1 : 0;
  return laws
    .map((l, i) => ({
      l,
      i,
      motive: governmentMotive(state, government, l.id, seeding),
    }))
    .filter(({ l }) => l.government[0] !== government[0])
    .sort(
      (a, b) => shared(a.l) - shared(b.l) || a.motive - b.motive || a.i - b.i,
    )
    .map(({ l }) => l.id);
}

// Three cards: laws drawn from those off the books, and the repeal the
// government wants most when there is one. A full house offers repeals only
function lawCards(
  state: SavedCareer,
  random: () => number = Math.random,
): LawCard[] {
  const parliament = state.parliament;
  if (!parliament) return [];
  const laws = lawsInForce(parliament);
  const repeals = repealCandidates(
    state,
    laws,
    parliament.government,
    tableOrder(state),
  );
  if (laws.length >= MAX_LAWS_IN_FORCE) {
    return repeals
      .slice(0, MAX_REPEAL_CARDS)
      .map((law) => ({ action: 'repeal', law }));
  }
  const repeal: LawCard[] =
    repeals.length > 0 ? [{ action: 'repeal', law: repeals[0] }] : [];
  const pool = LAW_ORDER.filter((id) => !laws.some((l) => l.id === id));
  const passes: LawCard[] = [];
  while (pool.length > 0 && passes.length + repeal.length < LAW_CARD_COUNT) {
    const [law] = pool.splice(Math.floor(random() * pool.length), 1);
    passes.push({ action: 'pass', law });
  }
  return [...passes, ...repeal];
}

// The leading party's coaches in table order
function tableOrder(state: SavedCareer): string[] {
  return rankBySeeding(state.characters, seedingKey(state));
}

export function lawPicker(state: SavedCareer, leader: SponsorId): string | null {
  return (
    tableOrder(state).find(
      (slug) => state.characters[slug].sponsor?.sponsorId === leader,
    ) ?? null
  );
}

// The prime minister: the leading party's coach highest in the table on
// election night, kept for the whole term. A save from before the office
// picks him once by the same rule
export function primeMinister(state: SavedCareer): string | null {
  const leader = state.parliament?.government[0];
  const stored = state.parliament?.primeMinister;
  if (!leader) return null;
  return stored !== undefined ? stored : lawPicker(state, leader);
}

// A save from before the office writes its prime minister down once, so he
// stays put until the next election
export function withPrimeMinister(state: SavedCareer): SavedCareer {
  const parliament = state.parliament;
  if (!parliament || parliament.primeMinister !== undefined) return state;
  if (parliament.government.length === 0) return state;
  return {
    ...state,
    parliament: { ...parliament, primeMinister: primeMinister(state) },
  };
}

function noiseFor(ch: CharacterCareerState | undefined): number {
  return ch?.personality ? LAW_PERSONALITY_NOISE[ch.personality] : LAW_AI_NOISE;
}

// The AI's card: whatever the government's coaches want most, the other
// way round for a repeal, with a pinch of mood
export function aiLawPick(
  state: SavedCareer,
  ballot: Pick<LawBallot, 'cards' | 'government' | 'picker'>,
  random: () => number = Math.random,
): number {
  const constitution = ballot.cards.findIndex(isConstitutionCard);
  if (constitution >= 0) return constitution;
  const seeding = tableOrder(state);
  const indexes = ballot.cards.map((_, i) => String(i));
  const picked = aiPreferencePick(
    indexes,
    (i) => {
      const card = ballot.cards[Number(i)];
      if (isConstitutionCard(card)) return 0;
      const motive = governmentMotive(
        state,
        ballot.government,
        card.law,
        seeding,
      );
      return card.action === 'repeal' ? -motive : motive;
    },
    LAW_PICK_NOISE,
    random,
  );
  return Number(picked);
}

// A coach on the bench of one-party rule: the whole party wins, so he leans
// yes, unless he is close enough to the crown to want it alone
function aiConstitutionVote(
  state: SavedCareer,
  slug: string,
  card: ConstitutionCard,
  random: () => number,
): LawVote {
  const ch = state.characters[slug];
  if (ch?.sponsor?.sponsorId !== card.party) return 'no';
  const share = Math.min(1, careerPoints(ch) / overlordGoal(state));
  const ambition =
    (Math.max(0, share - CONSTITUTION_AMBITION_FROM) /
      (1 - CONSTITUTION_AMBITION_FROM)) *
    CONSTITUTION_AMBITION;
  const noise = (random() * 2 - 1) * noiseFor(ch);
  return CONSTITUTION_BASE - ambition + noise > 0 ? 'yes' : 'no';
}

// The AI's vote: the government whip (looser on the junior partner's
// bench), the coach's own motive, the other way round for a repeal, and his
// temperament either way
function aiLawVote(
  state: SavedCareer,
  slug: string,
  card: LawCard,
  random: () => number = Math.random,
  seeding?: string[],
): LawVote {
  const ch = state.characters[slug];
  const party = ch?.sponsor?.sponsorId;
  if (!party) return 'no';
  if (card.action === 'constitution')
    return aiConstitutionVote(state, slug, card, random);
  const leading = state.parliament?.government[0] === party;
  const whip = leading ? LAW_WHIP_BONUS : LAW_PARTNER_WHIP_BONUS;
  const motive = lawMotive(
    card.law,
    voterProfile(state, slug, leading, seeding),
  );
  const own = card.action === 'repeal' ? -motive : motive;
  const noise = (random() * 2 - 1) * noiseFor(ch);
  return whip + own + noise > 0
    ? 'yes'
    : 'no';
}

export function pickedCard(ballot: LawBallot): LawCard | null {
  return ballot.pick === null ? null : (ballot.cards[ballot.pick] ?? null);
}

// The laws on the books a passed card would push out of its conflict group
export function conflictingLaws(card: LawCard, laws: LawInForce[]): LawId[] {
  if (card.action !== 'pass') return [];
  const group = LAW_DEFS[card.law].conflict;
  if (!group) return [];
  return laws
    .filter((l) => l.id !== card.law && LAW_DEFS[l.id].conflict === group)
    .map((l) => l.id);
}

export type LawVerdict = 'passed' | 'failed' | 'repealed';

// What the stamp reads once the vote is closed
export function lawVerdict(ballot: LawBallot): LawVerdict | null {
  const card = pickedCard(ballot);
  if (!card || ballot.outcome === null) return null;
  if (ballot.outcome === 'failed') return 'failed';
  return card.action === 'repeal' ? 'repealed' : 'passed';
}

// The stamp a paper story of a vote carries, by its template
export function lawNewsVerdict(templateKey: string): LawVerdict | null {
  if (
    templateKey === 'law-passed' ||
    templateKey === 'law-passed-conflict' ||
    templateKey === 'constitution-passed'
  )
    return 'passed';
  if (templateKey === 'law-repealed') return 'repealed';
  if (
    templateKey === 'law-failed' ||
    templateKey === 'law-repeal-failed' ||
    templateKey === 'constitution-failed'
  )
    return 'failed';
  return null;
}

// One side of the count: the weight cast yes, all the weight on that side and
// the yes it takes to carry it
export type LawQuorum = { yes: number; total: number; needed: number };

function quorum(ballots: Ballot<LawVote>[], share: number): LawQuorum {
  const total = ballots.reduce((sum, b) => sum + b.weight, 0);
  const yes = ballots
    .filter((b) => b.choice === 'yes')
    .reduce((sum, b) => sum + b.weight, 0);
  return { yes, total, needed: Math.ceil(total * share - 1e-9) };
}

type QuorumBallot = Pick<LawBallot, 'ballots' | 'partners'> &
  Partial<Pick<LawBallot, 'cards' | 'pick'>>;

// The constitution needs four fifths of the benches' weight, a law three
// quarters
export function lawPassShare(ballot: Partial<Pick<LawBallot, 'cards' | 'pick'>>): number {
  const card =
    ballot.pick === null || ballot.pick === undefined
      ? null
      : ballot.cards?.[ballot.pick];
  return isConstitutionCard(card) ? CONSTITUTION_PASS_SHARE : LAW_PASS_SHARE;
}

// The two bars a law has to clear: the whole chamber's weight, and in a
// coalition the junior partners' own. Partners is null when no partner coach
// sits on the roll
export function lawQuorums(ballot: QuorumBallot): {
  chamber: LawQuorum;
  partners: LawQuorum | null;
} {
  const partnerSlugs = new Set(ballot.partners ?? []);
  const partners = ballot.ballots.filter((b) => partnerSlugs.has(b.slug));
  return {
    chamber: quorum(ballot.ballots, lawPassShare(ballot)),
    partners:
      partners.length > 0 ? quorum(partners, LAW_PARTNER_PASS_SHARE) : null,
  };
}

export function quorumMet(q: LawQuorum | null): boolean {
  return q === null || (q.total > 0 && q.yes >= q.needed);
}

// A voice's weight on the roll: the leading party's bench outweighs the
// partners', a human outweighs an AI on either
function lawVoteWeight(human: boolean, leading: boolean): number {
  if (leading) return human ? LAW_LEADER_HUMAN_WEIGHT : LAW_LEADER_WEIGHT;
  return human ? LAW_PARTNER_HUMAN_WEIGHT : LAW_PARTNER_WEIGHT;
}

// The roll call once the card is on the table: everyone signed to a
// governing party, the AI voting on the spot
function rollCall(
  state: SavedCareer,
  ballot: LawBallot,
  random: () => number,
): Pick<LawBallot, 'ballots' | 'partners'> {
  const card = pickedCard(ballot);
  if (!card) return { ballots: [], partners: [] };
  const [leader] = ballot.government;
  const table = tableOrder(state);
  const roll = table.filter((slug) => {
    const party = state.characters[slug].sponsor?.sponsorId;
    return party !== undefined && ballot.government.includes(party);
  });
  const leading = (slug: string) =>
    state.characters[slug].sponsor?.sponsorId === leader;
  return {
    ballots: roll.map((slug) => {
      const human = isHumanSlug(state, slug);
      const entry: Ballot<LawVote> = {
        ...newBallot<LawVote>(slug, human),
        weight: lawVoteWeight(human, leading(slug)),
      };
      return human
        ? entry
        : { ...entry, choice: aiLawVote(state, slug, card, random, table) };
    }),
    partners: roll.filter((slug) => !leading(slug)),
  };
}

export function lawBallotStage(
  ballot: LawBallot | null | undefined,
): 'pick' | 'vote' | 'closed' | null {
  if (!ballot) return null;
  if (ballot.outcome !== null) return 'closed';
  return ballot.pick === null ? 'pick' : 'vote';
}

// The card goes on the table and the AI votes at once
export function pickLawCard(
  state: SavedCareer,
  ballot: LawBallot,
  index: number,
  random: () => number = Math.random,
): LawBallot {
  if (ballot.pick !== null || !ballot.cards[index]) return ballot;
  const picked = { ...ballot, pick: index };
  return { ...picked, ...rollCall(state, picked, random) };
}

// Opens the ballot: the cards, the picker, and when the picker is not a
// human, his pick and the AI's votes right away. Null when there is nothing
// to vote on
export function openLawBallot(
  state: SavedCareer,
  random: () => number = Math.random,
): LawBallot | null {
  const parliament = state.parliament;
  if (!parliament || parliament.government.length === 0) return null;
  const party = constitutionParty(state);
  const cards: LawCard[] = [
    ...(party ? [{ action: 'constitution' as const, party }] : []),
    ...lawCards(state, random),
  ];
  if (cards.length === 0) return null;
  const government = parliament.government;
  const picker = primeMinister(state);
  const ballot: LawBallot = {
    year: state.year,
    season: state.season,
    government,
    cards,
    picker,
    pick: null,
    ballots: [],
    outcome: null,
  };
  if (picker !== null && isHumanSlug(state, picker)) return ballot;
  return pickLawCard(state, ballot, aiLawPick(state, ballot, random), random);
}

export function lawPickerIsHuman(
  state: SavedCareer,
  ballot: LawBallot,
): boolean {
  return ballot.picker !== null && isHumanSlug(state, ballot.picker);
}

export function lawVoter(ballot: LawBallot | null | undefined, slug: string): boolean {
  return Boolean(ballot?.ballots.some((b) => b.slug === slug && b.human));
}

export function voteLaw(
  ballot: LawBallot,
  slug: string,
  vote: LawVote,
): LawBallot {
  if (ballot.outcome !== null || ballot.pick === null) return ballot;
  if (!lawVoter(ballot, slug)) return ballot;
  return { ...ballot, ballots: castBallot(ballot.ballots, slug, vote) };
}

// Nobody left to wait for: the card is picked and every human has voted
export function lawBallotReady(ballot: LawBallot): boolean {
  return ballot.pick !== null && pendingHumans(ballot.ballots).length === 0;
}

function lawTally(ballot: LawBallot): Record<LawVote, number> {
  return tallyBallots(ballot.ballots, LAW_VOTES);
}

// Both bars cleared: three quarters of the chamber's weight and half of the
// junior partners'
export function lawCarried(ballot: QuorumBallot): boolean {
  const { chamber, partners } = lawQuorums(ballot);
  return quorumMet(chamber) && quorumMet(partners);
}

// The clock is up or the last vote is in: a missing pick and every silent
// voice go to the AI, and the law needs both bars of lawQuorums. A chamber
// with nobody on the governing lists has nobody to carry it
export function closeLawBallot(
  state: SavedCareer,
  ballot: LawBallot,
  random: () => number = Math.random,
): LawBallot {
  if (ballot.outcome !== null) return ballot;
  let open = ballot;
  if (open.pick === null) {
    open = {
      ...pickLawCard(state, open, aiLawPick(state, open, random), random),
      autoPick: lawPickerIsHuman(state, open) || undefined,
    };
  }
  const card = pickedCard(open);
  if (!card) return { ...open, outcome: 'failed' };
  const table = tableOrder(state);
  const ballots = fillBallots(open.ballots, (slug) =>
    aiLawVote(state, slug, card, random, table),
  );
  const closed = { ...open, ballots };
  const result: LawBallot = {
    ...closed,
    outcome: lawCarried(closed) ? 'passed' : 'failed',
  };
  return {
    ...result,
    repealed: lawsAfter(lawsInForce(state.parliament), result).repealed,
  };
}

// What the closed vote does to the books: a passed law goes on and pushes
// out its conflict group, a passed repeal takes its law off. Anything off
// the books is back in the pool
function lawsAfter(
  laws: LawInForce[],
  ballot: LawBallot,
): { laws: LawInForce[]; repealed: LawId[] } {
  const card = pickedCard(ballot);
  if (!card || ballot.outcome !== 'passed' || card.action === 'constitution')
    return { laws, repealed: [] };
  if (card.action === 'repeal') {
    return {
      laws: laws.filter((l) => l.id !== card.law),
      repealed: laws.some((l) => l.id === card.law) ? [card.law] : [],
    };
  }
  const group = LAW_DEFS[card.law].conflict;
  const repealed = group
    ? laws
        .filter((l) => l.id !== card.law && LAW_DEFS[l.id].conflict === group)
        .map((l) => l.id)
    : [];
  return {
    laws: [
      ...laws.filter((l) => !repealed.includes(l.id) && l.id !== card.law),
      {
        id: card.law,
        year: ballot.year,
        season: ballot.season,
        government: ballot.government,
      },
    ],
    repealed,
  };
}

// The paper's story of the vote
export function lawNews(ballot: LawBallot): NewsItem | null {
  const card = pickedCard(ballot);
  if (!card || ballot.outcome === null) return null;
  const tally = lawTally(ballot);
  const passed = ballot.outcome === 'passed';
  if (card.action === 'constitution') {
    return {
      ...leagueNews(
        passed ? 'constitution-passed' : 'constitution-failed',
        '',
        {
          party: card.party,
          constitution: card.party,
          yes: tally.yes,
          no: tally.no,
          penalty: CONSTITUTION_FAIL_RATING_PENALTY,
        },
        'ballot',
        { party: 'sponsor' },
      ),
      slugs: [],
    };
  }
  const conflicts = (ballot.repealed ?? []).filter((id) => id !== card.law);
  const templateKey =
    card.action === 'repeal'
      ? passed
        ? 'law-repealed'
        : 'law-repeal-failed'
      : passed
        ? conflicts.length > 0
          ? 'law-passed-conflict'
          : 'law-passed'
        : 'law-failed';
  return {
    ...leagueNews(
      templateKey,
      '',
      {
        law: card.law,
        lawId: card.law,
        party: ballot.government[0],
        leader: ballot.government[0],
        yes: tally.yes,
        no: tally.no,
        repealed: conflicts.join(','),
      },
      'ballot',
      { law: 'law', party: 'sponsor', leader: 'sponsor', repealed: 'lawList' },
    ),
    slugs: [],
  };
}

export function lawLetterFor(ballot: LawBallot): MailItem | null {
  const card = pickedCard(ballot);
  if (!card || ballot.outcome === null) return null;
  const tally = lawTally(ballot);
  const law = card.action === 'constitution' ? 'constitution' : card.law;
  return lawLetter(ballot.year, ballot.season, {
    law,
    action: card.action,
    outcome: ballot.outcome,
    yes: tally.yes,
    no: tally.no,
    repealed: (ballot.repealed ?? []).filter((id) => id !== law).join(','),
    party: ballot.government[0],
  });
}

// The closed vote goes on the books and into the record; the paper prints
// it and the reader's letter is in the post. A shared league leaves the
// letters to the room, the paper story is tagless there
export function applyLawBallot(
  state: SavedCareer,
  ballot: LawBallot,
): SavedCareer {
  const parliament = state.parliament;
  if (!parliament || ballot.outcome === null) return state;
  const { laws, repealed } = lawsAfter(lawsInForce(parliament), ballot);
  const recorded: LawBallot = { ...ballot, repealed };
  const news = lawNews(recorded);
  const letter = state.humanSlugs ? null : lawLetterFor(recorded);
  const card = pickedCard(recorded);
  const constitution: ConstitutionWin | null =
    isConstitutionCard(card) && recorded.outcome === 'passed'
      ? {
          party: card.party,
          year: recorded.year,
          season: recorded.season,
          winners: tableOrder(state).filter(
            (slug) => state.characters[slug].sponsor?.sponsorId === card.party,
          ),
        }
      : null;
  return {
    ...state,
    parliament: {
      ...parliament,
      laws,
      lawVotes: [...lawVotes(parliament), recorded],
      lawBallot: null,
      ...(constitution ? { constitution } : {}),
    },
    newsQueue: news
      ? [
          ...state.newsQueue,
          state.humanSlugs ? news : { ...news, slugs: [state.playerSlug] },
        ]
      : state.newsQueue,
    mail: letter ? [...state.mail, letter] : state.mail,
  };
}

// The whole vote with nobody waiting on a human: open, close, apply. Returns
// the state untouched when no vote is due or there is nothing to vote on
export function runAiLawVote(
  state: SavedCareer,
  random: () => number = Math.random,
): SavedCareer {
  if (!lawVoteDue(state)) return state;
  const ballot = openLawBallot(state, random);
  if (!ballot) return state;
  return applyLawBallot(state, closeLawBallot(state, ballot, random));
}

// The bill letter for one human coach's window, when the laws moved money
export function lawBillFor(
  moves: LawMove[] | undefined,
  year: number,
  season: number,
): MailItem | null {
  if (!moves || moves.length === 0) return null;
  return lawBillLetter(
    year,
    season,
    moves.map((m) => `${m.law}=${m.amount}`).join(';'),
    lawMovesTotal(moves),
  );
}

// Every government the league has voted in, oldest first. Saves from before
// the list was kept still hold the sitting government
export function campaignGovernments(
  state: SavedCareer,
): NonNullable<SavedCareer['governments']> {
  if (state.governments) return state.governments;
  return state.parliament && state.parliament.electedYear > 0
    ? [
        {
          year: state.parliament.electedYear,
          government: state.parliament.government,
          primeMinister: primeMinister(state),
        },
      ]
    : [];
}
