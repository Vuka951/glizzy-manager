import {
  SEAT_COLOR_CLASSES,
  SEAT_COLOR_ORDER,
  SEAT_NAME_MAX,
  type SeatColor,
} from '@/lib/constants/rooms';

// A coach is the seat of this game: the shared room palette under its names
export type CoachColor = SeatColor;
export const COACH_COLOR_ORDER = SEAT_COLOR_ORDER;
export const COACH_COLOR_CLASSES = SEAT_COLOR_CLASSES;

export const MIN_COACHES = 2;
export const MAX_COACHES = 8;
export const COACH_NAME_MAX = SEAT_NAME_MAX;

// One countdown for every decision phase, picked in the lobby; null means
// the room waits for every coach
export const DEFAULT_WINDOW_SECONDS: number | null = null;
export const DEFAULT_PAPER_SECONDS: number | null = null;
export const DEFAULT_PRE_ROUND_SECONDS: number | null = null;
export const DEFAULT_MATCH_BET_SECONDS: number | null = null;
export const DEFAULT_SEASON_END_SECONDS: number | null = null;
export const DEFAULT_MATCH_LINGER_SECONDS = 6;
// The partner vote is short on purpose: whoever has not voted when it runs
// out gets the AI's vote. The count plays before the ballot, so the clock
// starts that much later
export const DEFAULT_COALITION_SECONDS: number | null = 30;
export const COALITION_COUNTDOWN_PRESETS: (number | null)[] = [null, 30, 60, 120];
export const COALITION_COUNT_ALLOWANCE_MS = 9000;
// The law vote runs on the same short clock, once for the card pick and
// again for the roll call; whoever is silent gets the AI's choice
export const DEFAULT_LAWS_SECONDS: number | null = 30;
export const LAWS_COUNTDOWN_PRESETS: (number | null)[] = [null, 30, 60, 120];

// Once every coach has placed or passed, the match still waits this long
export const BETS_CLOSING_MS = 5000;
// A clip is scheduled this far ahead of the request that decided it, so
// every screen has the result before the first frame and starts together
export const CLIP_PRE_ROLL_MS = 3000;
// Allowance for the clip's intro before the first frame, in milliseconds
export const CLIP_INTRO_ALLOWANCE_MS = 1500;

export const CAREER_MP_ROOM_NAMESPACE = 'career-mp';
export const CAREER_MP_API_PATH = '/api/career-mp/rooms';
export const COACH_TOKEN_HEADER = 'x-coach-token';
// Honoured outside production only, so timers can be tested without waiting
export const CAREER_MP_NOW_HEADER = 'x-career-mp-now';
export const TOKEN_STORAGE_PREFIX = 'glizzy-rivals:';

// Room creation is open to anyone, so one client address gets this many
// rooms per fixed hour window and the whole store stops at the cap
export const ROOM_CREATE_PER_HOUR = 10;
export const ROOM_CREATE_WINDOW_SECONDS = 60 * 60;
export const OPEN_ROOMS_CAP = 500;

// Every refusal the room API can answer with. The server only ever sends the
// code; each one has a sentence under careerMp.errors in the locale files
export const ROOM_ERROR_CODES = [
  'generic',
  'stale',
  'conflict',
  'unauthorized',
  'not-found',
  'expired',
  'closed',
  'already-started',
  'league-started',
  'room-full',
  'rate-limited',
  'rooms-full',
  'no-code',
  'bad-body',
  'bad-room',
  'bad-phase',
  'not-host',
  'bad-name',
  'name-taken',
  'bad-slug',
  'character-taken',
  'bad-character-name',
  'character-name-taken',
  'missing-slug',
  'not-ready',
  'bad-color',
  'color-taken',
  'no-slot',
  'no-funds',
  'bad-training',
  'maxed',
  'media-spent',
  'no-island',
  'guarded',
  'locked',
  'no-sponsor',
  'bad-target',
  'bad-tier',
  'no-mail',
  'signed',
  'has-sponsor',
  'no-offer',
  'no-parliament',
  'bad-amount',
  'bad-party',
  'letter-expired',
  'bad-rival',
  'betting-locked',
  'no-match',
  'no-bet',
  'bad-stake',
  'bad-side',
  'final',
  'no-favors',
  'favor-pending',
  'withdrawn',
  'bad-bet',
  'bad-option',
  'bad-vote',
  'not-a-voter',
  'not-the-picker',
] as const;

export type RoomErrorCode = (typeof ROOM_ERROR_CODES)[number];
