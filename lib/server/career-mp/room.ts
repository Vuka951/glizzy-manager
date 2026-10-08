import { createHash, randomBytes } from 'node:crypto';
import {
  COACH_COLOR_ORDER,
  DEFAULT_MATCH_BET_SECONDS,
  DEFAULT_MATCH_LINGER_SECONDS,
  DEFAULT_PAPER_SECONDS,
  DEFAULT_PRE_ROUND_SECONDS,
  DEFAULT_SEASON_END_SECONDS,
  DEFAULT_WINDOW_SECONDS,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  type CoachColor,
} from '@/lib/constants/careerMp';
import type {
  CampaignReportData,
  LedgerEntry,
  PhaseState,
  Receipt,
  RoomEvent,
  RoomSettings,
  RoomStatus,
} from '@/lib/types/careerMp';
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
import type { ElectionResult } from '@/data/games/careerElections';

export type Coach = {
  id: string;
  name: string;
  color: CoachColor;
  slug: string | null;
  tokenHash: string;
  joinedAt: number;
  lastSeenAt: number;
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
  islandYear?: number;
  islandSeason?: number;
  korpVendetta?: boolean;
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
  // contracts' payout, an ego hijack or a slump. Replayed once per key
  windowIntro: { key: string; receipts: Receipt[] } | null;
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
  characters: Record<string, CharacterCareerState>;
  coachStates: Record<string, CoachState>;
  humanSlugs: string[];
  pendingSabotages: PendingSabotage[];
  newsQueue: NewsItem[];
  lastIssue?: { news: NewsItem[]; year: number; season: number };
  // The last issue is the morning-after paper, so every coach's own recap
  // items slot in between the league's head and tail
  lastIssueRecap?: boolean;
  // The morning-after paper everybody reads, the coach's own items go between
  leagueRecap: { head: NewsItem[]; tail: NewsItem[] };
  cup: LeagueCup | null;
  h2h: Record<string, [number, number]>;
  pendingPolice: string[];
  aiGuarded: string[];
  standingsHistory: StandingsRecord[];
  parliament?: Parliament;
  lastElection?: { year: number; result: ElectionResult };
  seasonPricePct: number;
  seasonPriceByYear: Record<number, number[]>;
  gliziPricePct?: number;
  gliziPriceIndex?: number;
  gliziPriceHistory: number[];
  lastCupRanks?: string[];
  cupStartRanks?: string[];
  overlordSlug?: string | null;
  governments: { year: number; government: SponsorId[] }[];
  skipRoundVotes: string[];
  skipCupVotes: string[];
  // Scenes cued since the last phase change, waiting for the phase every
  // screen will meet them in
  pendingQuotes?: QuotePlayback[];
  quoteSeq?: number;
  // News scene ids aired this season; cleared with the window
  quoteScenesFired?: string[];
};

export type Room = {
  code: string;
  version: number;
  // The version at which the phase last changed; an action sent against an
  // older view is refused as stale
  phaseVersion: number;
  createdAt: number;
  updatedAt: number;
  hostCoachId: string;
  status: RoomStatus;
  settings: RoomSettings;
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
  matchLingerSeconds: DEFAULT_MATCH_LINGER_SECONDS,
};

export function randomRoomCode(): string {
  const bytes = randomBytes(ROOM_CODE_LENGTH);
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[bytes[i] % ROOM_CODE_ALPHABET.length];
  }
  return code;
}

export function isRoomCode(code: string): boolean {
  return (
    code.length === ROOM_CODE_LENGTH &&
    [...code].every((c) => ROOM_CODE_ALPHABET.includes(c))
  );
}

export function newToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function newCoachId(): string {
  return randomBytes(6).toString('hex');
}

export function freeColor(room: Room): CoachColor | null {
  const taken = new Set(Object.values(room.coaches).map((c) => c.color));
  return COACH_COLOR_ORDER.find((color) => !taken.has(color)) ?? null;
}

export function coachByToken(room: Room, token: string | null): Coach | null {
  if (!token) return null;
  const hash = hashToken(token);
  return Object.values(room.coaches).find((c) => c.tokenHash === hash) ?? null;
}
