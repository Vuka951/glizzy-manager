export type CoachColor =
  | 'sky'
  | 'violet'
  | 'fuchsia'
  | 'orange'
  | 'lime'
  | 'teal'
  | 'rose'
  | 'amber';

export const COACH_COLOR_ORDER: CoachColor[] = [
  'sky',
  'violet',
  'fuchsia',
  'orange',
  'lime',
  'teal',
  'rose',
  'amber',
];

export type CoachColorClasses = {
  // The coach tag pill and the token ring
  pill: string;
  ring: string;
  text: string;
  dot: string;
  border: string;
  // SVG bars on the paper report
  fill: string;
};

export const COACH_COLOR_CLASSES: Record<CoachColor, CoachColorClasses> = {
  sky: {
    pill: 'border-sky-400/60 bg-sky-400/15 text-sky-200',
    ring: 'ring-sky-400',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    border: 'border-sky-400',
    fill: 'fill-sky-400',
  },
  violet: {
    pill: 'border-violet-400/60 bg-violet-400/15 text-violet-200',
    ring: 'ring-violet-400',
    text: 'text-violet-300',
    dot: 'bg-violet-400',
    border: 'border-violet-400',
    fill: 'fill-violet-400',
  },
  fuchsia: {
    pill: 'border-fuchsia-400/60 bg-fuchsia-400/15 text-fuchsia-200',
    ring: 'ring-fuchsia-400',
    text: 'text-fuchsia-300',
    dot: 'bg-fuchsia-400',
    border: 'border-fuchsia-400',
    fill: 'fill-fuchsia-400',
  },
  orange: {
    pill: 'border-orange-400/60 bg-orange-400/15 text-orange-200',
    ring: 'ring-orange-400',
    text: 'text-orange-300',
    dot: 'bg-orange-400',
    border: 'border-orange-400',
    fill: 'fill-orange-400',
  },
  lime: {
    pill: 'border-lime-400/60 bg-lime-400/15 text-lime-200',
    ring: 'ring-lime-400',
    text: 'text-lime-300',
    dot: 'bg-lime-400',
    border: 'border-lime-400',
    fill: 'fill-lime-400',
  },
  teal: {
    pill: 'border-teal-400/60 bg-teal-400/15 text-teal-200',
    ring: 'ring-teal-400',
    text: 'text-teal-300',
    dot: 'bg-teal-400',
    border: 'border-teal-400',
    fill: 'fill-teal-400',
  },
  rose: {
    pill: 'border-rose-400/60 bg-rose-400/15 text-rose-200',
    ring: 'ring-rose-400',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
    border: 'border-rose-400',
    fill: 'fill-rose-400',
  },
  amber: {
    pill: 'border-amber-400/60 bg-amber-400/15 text-amber-200',
    ring: 'ring-amber-400',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    border: 'border-amber-400',
    fill: 'fill-amber-400',
  },
};

export const MIN_COACHES = 2;
export const MAX_COACHES = 8;
export const COACH_NAME_MIN = 2;
export const COACH_NAME_MAX = 18;

// Six characters, no glyphs that read alike when typed from a phone screen
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 6;
// Rooms idle longer than this drop off the room board (still open by link)
export const ROOM_BOARD_WINDOW_MS = 24 * 60 * 60 * 1000;
// A lobby nobody has touched for this long is cleared on the next request
export const LOBBY_IDLE_MS = 10 * 60 * 1000;
export const ROOM_TTL_SECONDS = 30 * 24 * 60 * 60;

// A coach counts as connected while a poll landed inside this window
export const CONNECTED_WINDOW_MS = 30_000;

// Polling cadence per phase kind, in milliseconds
export const POLL_DECISION_MS = 2000;
export const POLL_WAITING_MS = 3000;
export const POLL_PLAYBACK_MS = 2000;

// One countdown for every decision phase, picked in the lobby; null means
// the room waits for every coach
export const DEFAULT_WINDOW_SECONDS: number | null = null;
export const DEFAULT_PAPER_SECONDS: number | null = null;
export const DEFAULT_PRE_ROUND_SECONDS: number | null = null;
export const DEFAULT_MATCH_BET_SECONDS: number | null = null;
export const DEFAULT_SEASON_END_SECONDS: number | null = null;
export const DEFAULT_MATCH_LINGER_SECONDS = 6;

// Countdown presets offered in the lobby, null meaning the room waits
export const COUNTDOWN_PRESETS: (number | null)[] = [null, 60, 180, 300];

export const LOG_CAP = 2000;
// Once every coach has placed or passed, the match still waits this long
export const BETS_CLOSING_MS = 5000;
// A clip is scheduled this far ahead of the request that decided it, so
// every screen has the result before the first frame and starts together
export const CLIP_PRE_ROLL_MS = 3000;
// How soon after a known deadline the client asks the server for the change
export const DEADLINE_REFETCH_DELAY_MS = 150;
// Allowance for the clip's intro before the first frame, in milliseconds
export const CLIP_INTRO_ALLOWANCE_MS = 1500;

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
] as const;

export type RoomErrorCode = (typeof ROOM_ERROR_CODES)[number];
