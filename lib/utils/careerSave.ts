import type { OverlordPoints } from '@/data/games/careerEconomy';
import type {
  GlizzyBet,
  GlizzyBetResult,
} from '@/data/games/careerGlizzflationBets';
import type { InvestmentId } from '@/data/games/careerInvestments';
import type { CareerPersonalityId } from '@/data/games/careerPersonalities';
import type { CoalitionBallot } from '@/lib/utils/careerCoalition';
import type {
  ConstitutionWin,
  LawBallot,
  LawInForce,
} from '@/lib/utils/careerLaws';
import {
  currentLawMail,
  currentParliament,
} from '@/lib/utils/careerRetiredLaws';
import {
  withoutRetiredFeatures,
  withoutRetiredStories,
} from '@/lib/utils/careerRetiredFeatures';
import type { TrainingId } from '@/data/games/careerTraining';
import { isLeagueRoster, type LeagueEntry } from '@/lib/utils/leagueRoster';
import type { MessageParams, MessageRefs } from '@/lib/utils/message';
import {
  CUP_BRACKET_SIZE,
  type CupMatch,
  type CupMatchBet,
  type MatchForfeitReason,
} from '@/lib/utils/tournamentSim';

export type TrainedStat = { level: number; progress: number };

export type SponsorId = 'blue' | 'green' | 'yellow' | 'red';

export type SponsorContract = {
  sponsorId: SponsorId;
};

// Where a signed character's party sits after the last election. Absent
// until the city has voted, and for anyone without a sponsor
export type PartyStatus = 'leader' | 'partner' | 'opposition';

export type Parliament = {
  seats: Record<SponsorId, number>;
  // Leader first
  government: SponsorId[];
  electedYear: number;
  // Pooled per party for the coming vote, cleared on election night
  donations: Record<SponsorId, number>;
  // Who gave for the coming vote, slug to amount
  donors: Record<string, number>;
  // Who gave for the last vote; the favor reads this list
  lastDonors: Record<string, number>;
  // The leading party's rating, moved by the glizi price, reset only when
  // the leader changes
  rating: number;
  // Affair penalties per party, applied at the next count and wiped by it
  penalties: Record<SponsorId, number>;
  // One point per member caught plotting, on the party's rating for good;
  // absent on saves from before the league kept the record
  convictions?: Record<SponsorId, number>;
  // Seat projection printed in the third quarter of an election year
  poll?: Record<SponsorId, number>;
  // Slug to favors spent in favorsYear; a new year starts the count over
  favorsUsed: Record<string, number>;
  favorsYear?: number;
  // Counted after the Bloody cup, consumed by the broadcast
  pendingResult?: {
    votes: Record<SponsorId, number>;
    seats: Record<SponsorId, number>;
    government: SponsorId[];
    // The partner vote, open while the player still has to cast his
    coalition?: CoalitionBallot;
  } | null;
  elections: number;
  // The laws on the books, oldest first, and every closed law vote; absent
  // on saves from before the chamber passed laws
  laws?: LawInForce[];
  lawVotes?: LawBallot[];
  // The law vote while a human still has to pick or vote
  lawBallot?: LawBallot | null;
  // One-party rule, once the chamber passed it; the campaign is over
  constitution?: ConstitutionWin | null;
  // The lottery's takings this year, drawn when the next year opens
  lotteryPot?: number;
  // The prime minister, picked on election night and kept for the term;
  // absent on saves from before the office, which pick him once
  primeMinister?: string | null;
};

// A removal booked against one bracket match; the match is a walkover the
// moment it starts
export type PendingRemoval = {
  round: number;
  index: number;
  targetSlug: string;
  bySlug: string;
  byParty: SponsorId;
};

export type CharacterCareerState = {
  livesCap: TrainedStat;
  njuh: TrainedStat;
  nutrition: TrainedStat;
  fanSkill: TrainedStat;
  stress: number;
  appetite: number;
  ambition: number;
  ego: number;
  fame: number;
  wins: number;
  losses: number;
  titles: number;
  titleStreak: number;
  meltdowns: number;
  forfeits: number;
  withdrawals: number;
  lastTraining: TrainingId | null;
  sameTrainingStreak: number;
  // Broadcast stats, absent on old saves which just start counting from zero
  eaten?: number;
  recentResults?: ('w' | 'l')[];
  // Wins and losses per calendar season, so the booth can quote a man's
  // record in this edition of the cup
  editionRecord?: Partial<Record<number, [number, number]>>;
  turnsPlayed?: number;
  tiebreaks?: number;
  sponsor: SponsorContract | null;
  fineRecency: number;
  punishments: number;
  // Failed plots on record, each one raising the next fine
  sabotageFails?: number;
  // Who last sent somebody to their door, blocked or not; the temperament
  // decides what to do about it
  grudgeSlug?: string | null;
  // Cups since the last plot got through, counted down like fineRecency
  hitRecency?: number;
  // Plots of his own that got through, blocked ones not counted
  plotsLanded?: number;
  // How the last lost match ended, null after a win; the coach reads it
  lastForfeitReason?: MatchForfeitReason | null;
  money?: number;
  lastPlace?: number;
  // Standing contracts bought once and kept for the rest of the career;
  // absent on saves made before the league started selling them
  investments?: Partial<Record<InvestmentId, number>>;
  // How this character spends an off-season; absent on the player and on
  // saves made before the league grew personalities
  personality?: CareerPersonalityId;
  partyStatus?: PartyStatus;
  // Window openings in a row found owing, back to zero once nothing is;
  // absent on saves from before the Yellow Party lent money
  debtWindows?: number;
  // What a human owes the bank's counter, interest included; absent until
  // the first loan
  loan?: number;
};

export type SlotAction = {
  kind:
    | 'training'
    | 'rest'
    | 'fast'
    | 'sabotage'
    | 'island'
    | 'ego'
    | 'slump'
    | 'guard'
    | 'media';
  trainingId?: TrainingId;
  outcome?: 'progress' | 'level-up' | 'regression';
  // What a will-less character did with the month the slump took from him
  slumpAction?: 'guard' | 'fast';
};

export type SabotageTier = 1 | 2 | 3;

export type PendingSabotage = {
  bySlug: string;
  targetSlug: string;
  tier: SabotageTier;
  // Funded success chance; absent on old saves, which fall back to the base
  chance?: number;
  // What the job was paid; absent on old saves, which fine the street price
  cost?: number;
};

// A story is a template under career.news plus raw parameters; the paper
// renders it. Refs name the parameters that hold a slug or an id
export type NewsItem = {
  kind: string;
  templateKey: string;
  params: MessageParams;
  refs?: MessageRefs;
  slugs: string[];
  freezeframe?: string;
  // A league story with no hero: the reader's own man only poses for the
  // picture, so no coach tag belongs on it
  tagless?: boolean;
};

export type MailItem = {
  id: string;
  kind:
    | 'stipend'
    | 'sponsor-offer'
    | 'fine'
    | 'info'
    | 'rival'
    | 'donation'
    | 'campaign'
    | 'election'
    | 'law'
    | 'favor'
    | 'tax'
    | 'tax-refund';
  year: number;
  season: number;
  templateKey: string;
  params: MessageParams;
  refs?: MessageRefs;
  amount?: number;
  sponsorId?: SponsorId;
  read: boolean;
};

export type SavedCareerCup = {
  rounds: CupMatch[][];
  currentRound: number;
  matchBets: Record<string, CupMatchBet>;
  withdrawn: boolean;
  // Removals booked against this cup's matches, one match each
  removals?: PendingRemoval[];
  // Who has already been walked out this cup; the AI stops at one
  removed?: string[];
};

export type SeasonRecord = {
  year: number;
  season: number;
  champion: string;
  playerPlace: number;
  // The whole table after that cup, top first, and everyone's points; absent
  // on saves from before the campaign report drew its charts
  ranks?: string[];
  points?: Record<string, number>;
};

// Why a name ends up on the shortlist: the year's events outrank the chronicles
export type RivalReason =
  'eliminated' | 'sabotage' | 'champion' | 'table' | 'chaser' | 'lore';

export type RivalCandidate = {
  slug: string;
  reason: RivalReason;
};

export type CareerPhase =
  'offseason' | 'news' | 'cup' | 'podium' | 'recap' | 'standings';

// Saves from before the league was generated carry version 1 and the old
// fixed names; they are not read
export const CAREER_SAVE_VERSION = 2;

export type SavedCareer = {
  version: typeof CAREER_SAVE_VERSION;
  // Everyone the league was generated with, in seeding order: every slug
  // in `characters` has its name here
  league: LeagueEntry[];
  playerSlug: string;
  // The crown's price in table points; only a shared room can pick the long
  // campaign, so a solo save never records it
  overlordPoints?: OverlordPoints;
  year: number;
  season: number;
  phase: CareerPhase;
  slotsUsed: number;
  slotLog: SlotAction[];
  balance: number;
  // Media appearances spent this window; the fan skill raises the ceiling
  mediaUses?: number;
  // What the next match bet costs; absent on saves from before the bookie
  // took anything but the minimum
  betStake?: number;
  // The call on this window's glizzflation story, and how the last one went
  glizzyBet?: GlizzyBet;
  lastGlizzyBet?: GlizzyBetResult;
  guarded?: boolean;
  // Block chance bought this window; old saves without it mean the base chance
  guardChance?: number;
  islandYear?: number;
  // This season's rolled swing on its priced category, see SEASON_PRICE_RULES;
  // absent on saves from before the seasons had prices
  seasonPricePct?: number;
  // Who took the crown and ended the campaign; absent while it is still open
  overlordSlug?: string | null;
  // Saves from before the AI could win only recorded the player's crown
  overlordWon?: boolean;
  // The Yellow Party does not forgive a declined offer: a tier 3 hit is coming
  yellowVendetta?: boolean;
  // The year's rival; absent on old saves until the next new year offers one
  rivalSlug?: string | null;
  // Shortlist for the new-year rival pick, non-empty while the choice is open
  rivalChoice?: RivalCandidate[] | null;
  // Everyone who plotted against the player since the year began, caught or
  // not; the rival shortlist reads it as a list of suspects
  saboteursThisYear?: string[];
  // Finished off-season logs per year, four seasons of three slots each
  logsByYear?: Record<number, SlotAction[][]>;
  characters: Record<string, CharacterCareerState>;
  pendingSabotages: PendingSabotage[];
  newsQueue: NewsItem[];
  // The league paper has been read this window, so the cup gate is open
  newsSeen?: boolean;
  cupRecap?: NewsItem[];
  // The most recent paper, kept on the desk until the next one prints
  lastIssue?: { news: NewsItem[]; year: number; season: number };
  // The pre-cup paper the last cup's recap pushed off the desk, so the
  // kiosk still has it; absent on older saves and when the cup made no news
  prevIssue?: { news: NewsItem[]; year: number; season: number };
  mail: MailItem[];
  cup: SavedCareerCup | null;
  // Head-to-head wins per pairing, keyed by the two slugs sorted and joined
  // with '|'; the tuple follows the sorted order. Absent on old saves
  h2h?: Record<string, [number, number]>;
  pendingPolice?: string[];
  aiGuarded?: string[];
  // Quote cutscenes already played this window, so a reload does not replay
  // them; cleared when the next off-season opens
  quoteScenesFired?: string[];
  // Post-cup table order, snapshotted when the season advances so the podium,
  // recap, and final standings still diff against the previous cup's table
  lastCupRanks?: string[];
  // Table order the moment the cup is seeded, before a single match of the
  // season is played. The table diffs against this while the cup is running so
  // its movement arrows can only ever describe results already watched; absent
  // on saves made before the arrows were rebased
  cupStartRanks?: string[];
  standingsHistory: SeasonRecord[];
  // The city parliament, absent until the league has voted once
  parliament?: Parliament;
  // Every government the league has voted in, oldest first; absent on saves
  // from before the report printed them
  governments?: {
    year: number;
    government: SponsorId[];
    primeMinister?: string | null;
  }[];
  // What every past window rolled, by year then season, so the calendar can
  // show the figure that actually applied instead of the range
  seasonPriceByYear?: Record<number, number[]>;
  // The glizi price story's last move, and the compounded index every
  // training price is multiplied by; absent on saves from before the market
  gliziPricePct?: number;
  gliziPriceIndex?: number;
  // The index at the close of every window since the career opened
  gliziPriceHistory?: number[];
  // The island weekend's last window, for the leader's every-window perk
  islandSeason?: number;
  // League context for a shared season with several human coaches; never
  // set by the single-player game. Every human slug, who each human named as
  // rival, and the block chance of every crew a human hired this window
  humanSlugs?: string[];
  rivalOf?: Record<string, string>;
  humanGuards?: Record<string, number>;
};

export type CareerSlot = 1 | 2 | 3;

export const CAREER_SLOTS: readonly CareerSlot[] = [1, 2, 3];

export type CareerSlots = readonly [
  SavedCareer | null,
  SavedCareer | null,
  SavedCareer | null,
];

// The single save from before the slots; the first load moves it into the
// first empty slot and deletes it once the copy reads back intact
export const LEGACY_CAREER_STORAGE_KEY = 'glizzy-manager-active';

export function careerSlotStorageKey(slot: CareerSlot): string {
  return `glizzy-manager-slot-${slot}`;
}

const EMPTY_SLOTS: CareerSlots = [null, null, null];

const listeners = new Set<() => void>();

let cachedRaws: (string | null)[] = [null, null, null];
let cachedSlots: CareerSlots = EMPTY_SLOTS;
let cacheInitialized = false;
let legacyChecked = false;

// A save from before the league was generated, one whose table has a name
// its league does not carry, or one from the short-lived twenty-name league,
// cannot be played on; its slot reads empty
function parseSave(raw: string | null): SavedCareer | null {
  if (!raw) return null;
  try {
    let parsed = JSON.parse(raw) as SavedCareer;
    if (
      !parsed ||
      parsed.version !== CAREER_SAVE_VERSION ||
      !isLeagueRoster(parsed.league) ||
      typeof parsed.playerSlug !== 'string' ||
      typeof parsed.characters !== 'object' ||
      parsed.characters === null
    ) {
      return null;
    }
    const slugs = new Set(parsed.league.map((entry) => entry.slug));
    if (
      !slugs.has(parsed.playerSlug) ||
      Object.keys(parsed.characters).length !== CUP_BRACKET_SIZE ||
      !Object.keys(parsed.characters).every((slug) => slugs.has(slug))
    ) {
      return null;
    }
    parsed = withoutRetiredFeatures(parsed);
    // The coalition vote once mailed its result; the broadcast shows it now
    if (Array.isArray(parsed.mail)) {
      parsed.mail = currentLawMail(
        withoutRetiredStories(
          parsed.mail.filter((m) => m.templateKey !== 'coalition-vote'),
        ),
      );
    }
    if (parsed.parliament) {
      parsed.parliament = currentParliament(parsed.parliament);
    }
    return parsed;
  } catch {
    return null;
  }
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function migrateLegacySave(): void {
  if (legacyChecked) return;
  legacyChecked = true;
  const legacy = readRaw(LEGACY_CAREER_STORAGE_KEY);
  if (legacy === null) return;
  const target = CAREER_SLOTS.find(
    (slot) => readRaw(careerSlotStorageKey(slot)) === null
  );
  if (!target) return;
  try {
    const key = careerSlotStorageKey(target);
    window.localStorage.setItem(key, legacy);
    if (window.localStorage.getItem(key) !== legacy) return;
    window.localStorage.removeItem(LEGACY_CAREER_STORAGE_KEY);
  } catch {
    // best-effort: the old key stays put and the next page load tries again
  }
}

function loadSlots(): CareerSlots {
  if (typeof window === 'undefined') return EMPTY_SLOTS;
  migrateLegacySave();
  const raws = CAREER_SLOTS.map((slot) => readRaw(careerSlotStorageKey(slot)));
  if (!cacheInitialized || raws.some((raw, i) => raw !== cachedRaws[i])) {
    const pick = (i: number): SavedCareer | null =>
      cacheInitialized && raws[i] === cachedRaws[i]
        ? cachedSlots[i]
        : parseSave(raws[i]);
    cachedSlots = [pick(0), pick(1), pick(2)];
    cachedRaws = raws;
    cacheInitialized = true;
  }
  return cachedSlots;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

// Three independent careers, each under its own key. Every read and write
// names the slot, so one career can never write into another
export const careerSave = {
  loadSlots,
  load(slot: CareerSlot): SavedCareer | null {
    return loadSlots()[slot - 1];
  },
  save(slot: CareerSlot, state: SavedCareer): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        careerSlotStorageKey(slot),
        JSON.stringify(state)
      );
    } catch {
      // best-effort
    }
    notify();
  },
  clear(slot: CareerSlot): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(careerSlotStorageKey(slot));
    } catch {
      // best-effort
    }
    notify();
  },
  clearAll(): void {
    if (typeof window === 'undefined') return;
    [
      LEGACY_CAREER_STORAGE_KEY,
      ...CAREER_SLOTS.map((slot) => careerSlotStorageKey(slot)),
    ].forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // best-effort
      }
    });
    notify();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getServerSnapshot(): CareerSlots {
    return EMPTY_SLOTS;
  },
};
