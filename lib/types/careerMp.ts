import type { ActionIconKind } from '@/components/icons/ActionIcon';
import type { InvestmentId } from '@/data/games/careerInvestments';
import type { TrainingId } from '@/data/games/careerTraining';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { MediaAppearanceKind } from '@/data/games/careerEconomy';
import type { ElectionResult } from '@/data/games/careerElections';
import type { CoachColor, RoomErrorCode } from '@/lib/constants/careerMp';
import type {
  ActionSceneId,
  ActionSceneOutcome,
} from '@/lib/constants/careerScenes';
import type {
  CharacterCareerState,
  SabotageTier,
  SavedCareer,
  SponsorId,
} from '@/lib/utils/careerSave';
import type { Message } from '@/lib/utils/message';
import type { QuotePlayback } from '@/lib/utils/quoteCutsceneTriggers';
import type { CupMatchResult } from '@/lib/utils/tournamentSim';

export type RoomStatus = 'lobby' | 'playing' | 'finished' | 'closed';

// One line of the room browser
export type RoomSummary = {
  code: string;
  status: RoomStatus;
  phase: PhaseKind;
  year: number | null;
  season: number | null;
  hostName: string;
  coaches: { id: string; name: string; color: CoachColor; slug: string | null; connected: boolean }[];
  createdAt: number;
  updatedAt: number;
};

// Coach name and color by character slug, for the tags on every screen
export type CoachTagMap = Record<
  string,
  { name: string; color: CoachColor; connected?: boolean }
>;

// A coach's seat in a stand during a clip
export type CrowdTokenData = {
  coachId: string;
  name: string;
  color: CoachColor;
  stake: number;
  character: DuelCharacter;
  // Once the result is in: did the bet come through
  outcome?: 'won' | 'lost' | null;
};

export type CoachTokens = {
  top: CrowdTokenData[];
  bottom: CrowdTokenData[];
  // Everything staked on each side, shown as a pile next to the stand
  topPot?: number;
  bottomPot?: number;
};

// Every countdown is optional: null means the room waits for everyone
export type RoomSettings = {
  windowSeconds: number | null;
  paperSeconds: number | null;
  preRoundSeconds: number | null;
  matchBetSeconds: number | null;
  seasonEndSeconds: number | null;
  matchLingerSeconds: number;
};

export type Stage = { round: number };

export type Playback = {
  startedAt: number;
  durationMs: number;
  skipVotes: string[];
  // Set the moment a majority skipped the clip; the cursor lingers from here
  skippedAt?: number;
};

// The news scenes one moment cued for the whole room, in play order. The
// sequence number grows over the whole league, so a screen knows which cue
// it last aired
export type QuoteCue = {
  seq: number;
  plays: QuotePlayback[];
};

export type PhaseState =
  | { kind: 'window'; deadline: number | null; quotes?: QuoteCue[] }
  | { kind: 'paper'; deadline: number | null; quotes?: QuoteCue[] }
  | {
      kind: 'cup-pre';
      round: number;
      deadline: number | null;
      quotes?: QuoteCue[];
    }
  | {
      kind: 'match-bets';
      stage: Stage;
      index: number;
      deadline: number | null;
      quotes?: QuoteCue[];
    }
  | {
      kind: 'match-clip';
      stage: Stage;
      index: number;
      playback: Playback;
      result: CupMatchResult;
      quotes?: QuoteCue[];
    }
  | { kind: 'season-end'; deadline: number | null; quotes?: QuoteCue[] }
  | { kind: 'finished'; reopenVotes: string[] };

export type PhaseKind = PhaseState['kind'];

// What every coach in the room can see of every other coach
export type CoachPublic = {
  id: string;
  name: string;
  color: CoachColor;
  slug: string | null;
  connected: boolean;
  ready: boolean;
  done: boolean;
  balance: number;
  withdrawn: boolean;
  passed: boolean;
  isHost: boolean;
};

export type RoomEvent = {
  at: number;
  kind: string;
  params: Record<string, string | number>;
  // Only this coach sees the entry; absent means everyone
  visibleTo?: string;
};

// A live pick on the pre-match screen: who sits in which stand and for how much
export type PublicBet = {
  coachId: string;
  side: 'a' | 'b';
  stake: number;
};

export type CupSkipVotes = {
  round: string[];
  cup: string[];
};

export type RoomView = {
  code: string;
  version: number;
  now: number;
  status: RoomStatus;
  hostCoachId: string;
  coachId: string;
  settings: RoomSettings;
  coaches: CoachPublic[];
  phase: PhaseState;
  // The caller's own career, in the single-player shape, redacted
  career: SavedCareer | null;
  // Coach id to character slug, for tags on the table, the bracket and the paper
  coachBySlug: Record<string, string>;
  // Bets already on the table for the match at the cursor, everyone's
  publicBets: PublicBet[];
  skipVotes: CupSkipVotes;
  // Standings and the report exist once the campaign has finished
  report: CampaignReportData | null;
  log: RoomEvent[];
  // The last count, for the election night every client plays once
  lastElection: { year: number; result: ElectionResult } | null;
  // What opening the window did to this coach, played once per key
  windowIntro: { key: string; receipts: Receipt[] } | null;
  connectedCount: number;
};

export type UnchangedView = { unchanged: true; version: number; now: number };

export type Receipt = {
  // Rendered by the screen that shows the receipt, in its own language
  title: Message;
  before: CharacterCareerState | null;
  after: CharacterCareerState | null;
  moneyDelta: number;
  icon: ActionIconKind;
  ok: boolean;
  scene?: ActionSceneId;
  outcome?: ActionSceneOutcome;
};

export type LobbyAction =
  | { type: 'closeRoom' }
  | { type: 'setSettings'; settings: Partial<RoomSettings> }
  | { type: 'pickCharacter'; slug: string }
  | { type: 'pickColor'; color: CoachColor }
  | { type: 'rename'; name: string }
  | { type: 'ready'; ready: boolean }
  | { type: 'start' }
  | { type: 'leave' };

export type WindowAction =
  | { type: 'train'; trainingId: TrainingId }
  | { type: 'rest'; fasting: boolean }
  | { type: 'media'; kind: MediaAppearanceKind }
  | { type: 'island' }
  | { type: 'guard'; steps: number }
  | { type: 'invest'; investmentId: InvestmentId }
  | {
      type: 'sabotage';
      targetSlug: string;
      tier: SabotageTier;
      boostSteps: number;
    }
  | { type: 'readMail'; mailId: string }
  | { type: 'readAllMail' }
  | { type: 'acceptSponsor'; mailId: string; sponsorId: SponsorId }
  | { type: 'donate'; mailId: string; amount: number; sponsorId?: SponsorId }
  | { type: 'chooseRival'; slug: string }
  | { type: 'setDone'; done: boolean };

export type CupAction =
  | { type: 'setBetStake'; stake: number }
  | { type: 'bet'; side: 'a' | 'b' }
  | { type: 'removeBet' }
  | { type: 'pass' }
  | { type: 'favor'; targetSlug: string; index: number }
  | { type: 'withdraw' }
  | { type: 'voteSkip' }
  | { type: 'voteSkipRound'; on: boolean }
  | { type: 'voteSkipCup'; on: boolean };

export type EndAction = { type: 'voteReopen'; on: boolean };

export type RoomAction = LobbyAction | WindowAction | CupAction | EndAction;

export type ActionRequest = {
  action: RoomAction;
  expectVersion: number;
};

export type ActionResponse = {
  view: RoomView;
  receipt?: Receipt;
};

export type CreateRoomRequest = {
  coachName: string;
  color?: CoachColor;
  settings?: Partial<RoomSettings>;
};

export type JoinRoomRequest = {
  coachName: string;
  color?: CoachColor;
};

export type JoinRoomResponse = {
  code: string;
  coachId: string;
  token: string;
  view: RoomView;
};

export type ApiError = { error: RoomErrorCode; view?: RoomView };

export type LedgerCategory =
  | 'prize'
  | 'sponsor'
  | 'stipend'
  | 'media'
  | 'bets'
  | 'training'
  | 'guard'
  | 'plots'
  | 'fines'
  | 'donations'
  | 'investments'
  | 'tax';

export type LedgerEntry = {
  year: number;
  season: number;
  category: LedgerCategory;
  amount: number;
};

export type CoachReport = {
  coachId: string;
  name: string;
  color: CoachColor;
  slug: string;
  place: number;
  points: number;
  titles: number;
  seasons: number;
  money: Record<LedgerCategory, number>;
  plots: { booked: number; landed: number; blocked: number; caught: number };
  hitsTaken: number;
  guard: { windows: number; blocks: number };
  bets: { placed: number; won: number; net: number };
  donations: number;
  favorsUsed: number;
  sponsors: { sponsorId: SponsorId; year: number }[];
  rivals: { slug: string; year: number; wins: number; losses: number }[];
  bestCup: number | null;
  worstCup: number | null;
};

export type CampaignReportData = {
  overlordSlug: string;
  coaches: CoachReport[];
  champions: { year: number; season: number; champion: string }[];
  governments: { year: number; government: SponsorId[] }[];
  priceIndex: number[];
  // Wins between the human characters, row slug beats column slug
  h2h: Record<string, Record<string, number>>;
};
