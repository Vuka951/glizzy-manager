import {
  COACH_COLOR_ORDER,
  DEFAULT_COALITION_SECONDS,
  DEFAULT_LAWS_SECONDS,
  DEFAULT_MATCH_BET_SECONDS,
  DEFAULT_MATCH_LINGER_SECONDS,
  DEFAULT_PAPER_SECONDS,
  DEFAULT_PRE_ROUND_SECONDS,
  DEFAULT_SEASON_END_SECONDS,
  DEFAULT_WINDOW_SECONDS,
  type CoachColor,
} from '@/lib/constants/careerMp';
import type {
  CampaignReportData,
  LedgerEntry,
  PhaseState,
  Receipt,
  RoomSettings,
} from '@/lib/types/careerMp';
import type { RoomCore, RoomEvent, RoomSeat } from '@/lib/types/rooms';
import type { PremierSpeech } from '@/lib/utils/careerPremier';
import type { QuotePlayback } from '@/lib/utils/quoteCutsceneTriggers';
import type {
  CharacterCareerState,
  MailItem,
  NewsItem,
  Parliament,
  PendingSabotage,
  PendingRemoval,
  RivalCandidate,
  SlotAction,
  SponsorId,
} from '@/lib/utils/careerSave';
import type { CupMatch, CupMatchBet } from '@/lib/utils/tournamentSim';
import type { LeagueEntry } from '@/lib/utils/leagueRoster';
import type { ElectionResult } from '@/data/games/careerElections';
import {
  OVERLORD_POINTS,
  type OverlordPoints,
} from '@/data/games/careerEconomy';
import type {
  GlizzyBet,
  GlizzyBetResult,
} from '@/data/games/careerGlizzflationBets';

export type Coach = RoomSeat & {
  color: CoachColor;
  slug: string | null;
  ready: boolean;
};

// What SavedCareer kept for "the player", now one per coach
export type CoachState = {
  slug: string;
  balance: number;
  mail: MailItem[];
  slotsUsed: number;
  slotLog: SlotAction[];
  logsByYear: Record<number, SlotAction[][]>;
  mediaUses: number;
  guarded: boolean;
  guardChance?: number;
  betStake?: number;
  glizzyBet?: GlizzyBet;
  lastGlizzyBet?: GlizzyBetResult;
  islandYear?: number;
  islandSeason?: number;
  yellowVendetta?: boolean;
  rivalSlug: string | null;
  rivalChoice: RivalCandidate[] | null;
  saboteursThisYear: string[];
  matchBets: Record<string, CupMatchBet>;
  withdrawn: boolean;
  cupRecap: NewsItem[];
  ledger: LedgerEntry[];
  done: boolean;
  // Placed or passed on the match at the cursor
  passed: boolean;
  // What the window opening did to this coach on its own: the standing
  // contracts' payout, an ego hijack or a slump, or the car the Yellow Party
  // sent. Replayed once per key
  windowIntro: {
    key: string;
    receipts: Receipt[];
    scenes?: QuotePlayback[];
  } | null;
  sponsorHistory: { sponsorId: SponsorId; year: number }[];
  rivalHistory: { slug: string; year: number; wins: number; losses: number }[];
  cupPlaces: number[];
  guardWindows: number;
  guardBlocks: number;
  hitsTaken: number;
  plotsBooked: number;
  plotsLanded: number;
  plotsBlocked: number;
  plotsCaught: number;
  betsPlaced: number;
  betsWon: number;
  favorsUsed: number;
};

export type LeagueCup = {
  rounds: CupMatch[][];
  currentRound: number;
  removals: PendingRemoval[];
  removed: string[];
};

export type StandingsRecord = {
  year: number;
  season: number;
  champion: string;
  ranks: string[];
  points: Record<string, number>;
  places: Record<string, number>;
};

export type LeagueState = {
  year: number;
  season: number;
  // Everyone in the league, in seeding order, with the names the screens print
  roster: LeagueEntry[];
  overlordPoints?: OverlordPoints;
  characters: Record<string, CharacterCareerState>;
  coachStates: Record<string, CoachState>;
  humanSlugs: string[];
  pendingSabotages: PendingSabotage[];
  newsQueue: NewsItem[];
  lastIssue?: { news: NewsItem[]; year: number; season: number };
  // The last issue is the morning-after paper, so every coach's own recap
  // items slot in between the league's head and tail
  lastIssueRecap?: boolean;
  // The pre-cup paper the morning-after recap pushed off the counter
  prevIssue?: { news: NewsItem[]; year: number; season: number };
  // The morning-after paper everybody reads, the coach's own items go between
  leagueRecap: { head: NewsItem[]; tail: NewsItem[] };
  cup: LeagueCup | null;
  h2h: Record<string, [number, number]>;
  pendingPolice: string[];
  aiGuarded: string[];
  standingsHistory: StandingsRecord[];
  parliament?: Parliament;
  // The last count; while the room sits in the coalition phase its partner
  // vote is still open
  lastElection?: {
    year: number;
    result: ElectionResult;
    // The night's stories, picked once the government stands
    scenes?: QuotePlayback[];
    // The man handed the office, with what he says on air
    premier?: PremierSpeech | null;
  };
  seasonPricePct: number;
  seasonPriceByYear: Record<number, number[]>;
  gliziPricePct?: number;
  gliziPriceIndex?: number;
  gliziPriceHistory: number[];
  lastCupRanks?: string[];
  cupStartRanks?: string[];
  overlordSlug?: string | null;
  governments: {
    year: number;
    government: SponsorId[];
    primeMinister?: string | null;
  }[];
  skipRoundVotes: string[];
  skipCupVotes: string[];
  // Scenes cued since the last phase change, waiting for the phase every
  // screen will meet them in
  pendingQuotes?: QuotePlayback[];
  quoteSeq?: number;
  // News scene ids aired this season; cleared with the window
  quoteScenesFired?: string[];
};

// The shared room envelope under the field names stored rooms already carry
export type Room = RoomCore & {
  hostCoachId: string;
  settings: RoomSettings;
  // The room's generated league, every name of it offered in the lobby
  roster: LeagueEntry[];
  coaches: Record<string, Coach>;
  league: LeagueState | null;
  phase: PhaseState;
  log: RoomEvent[];
  report: CampaignReportData | null;
};

export const DEFAULT_SETTINGS: RoomSettings = {
  windowSeconds: DEFAULT_WINDOW_SECONDS,
  paperSeconds: DEFAULT_PAPER_SECONDS,
  preRoundSeconds: DEFAULT_PRE_ROUND_SECONDS,
  matchBetSeconds: DEFAULT_MATCH_BET_SECONDS,
  seasonEndSeconds: DEFAULT_SEASON_END_SECONDS,
  coalitionSeconds: DEFAULT_COALITION_SECONDS,
  lawsSeconds: DEFAULT_LAWS_SECONDS,
  matchLingerSeconds: DEFAULT_MATCH_LINGER_SECONDS,
  overlordPoints: OVERLORD_POINTS,
};

export function freeColor(room: Room): CoachColor | null {
  const taken = new Set(Object.values(room.coaches).map((c) => c.color));
  return COACH_COLOR_ORDER.find((color) => !taken.has(color)) ?? null;
}
