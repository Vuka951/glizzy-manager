export type SeatColor =
  | 'sky'
  | 'violet'
  | 'fuchsia'
  | 'orange'
  | 'lime'
  | 'teal'
  | 'rose'
  | 'amber';

export const SEAT_COLOR_ORDER: SeatColor[] = [
  'sky',
  'violet',
  'fuchsia',
  'orange',
  'lime',
  'teal',
  'rose',
  'amber',
];

export type SeatColorClasses = {
  // The seat tag pill and the token ring
  pill: string;
  ring: string;
  text: string;
  dot: string;
  border: string;
  // SVG marks drawn in the seat's color
  fill: string;
};

export const SEAT_COLOR_CLASSES: Record<SeatColor, SeatColorClasses> = {
  sky: {
    pill: 'border-sky-400/60 bg-sky-400/15 text-sky-200',
    ring: 'ring-sky-400',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    border: 'border-sky-400',
    fill: 'fill-sky-400',
  },
  violet: {
    pill: 'border-violet-400/60 bg-violet-400/15 text-violet-200 ',
    ring: 'ring-violet-400',
    text: 'text-violet-300 ',
    dot: 'bg-violet-400',
    border: 'border-violet-400',
    fill: 'fill-violet-400',
  },
  fuchsia: {
    pill: 'border-fuchsia-400/60 bg-fuchsia-400/15 text-fuchsia-200 ',
    ring: 'ring-fuchsia-400',
    text: 'text-fuchsia-300 ',
    dot: 'bg-fuchsia-400',
    border: 'border-fuchsia-400',
    fill: 'fill-fuchsia-400',
  },
  orange: {
    pill: 'border-orange-400/60 bg-orange-400/15 text-orange-200 ',
    ring: 'ring-orange-400',
    text: 'text-orange-300 ',
    dot: 'bg-orange-400',
    border: 'border-orange-400',
    fill: 'fill-orange-400',
  },
  lime: {
    pill: 'border-lime-400/60 bg-lime-400/15 text-lime-200 ',
    ring: 'ring-lime-400',
    text: 'text-lime-300 ',
    dot: 'bg-lime-400',
    border: 'border-lime-400',
    fill: 'fill-lime-400',
  },
  teal: {
    pill: 'border-teal-400/60 bg-teal-400/15 text-teal-200 ',
    ring: 'ring-teal-400',
    text: 'text-teal-300 ',
    dot: 'bg-teal-400',
    border: 'border-teal-400',
    fill: 'fill-teal-400',
  },
  rose: {
    pill: 'border-rose-400/60 bg-rose-400/15 text-rose-200 ',
    ring: 'ring-rose-400',
    text: 'text-rose-300 ',
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

export const SEAT_NAME_MIN = 2;
export const SEAT_NAME_MAX = 18;

// Six characters, no glyphs that read alike when typed from a phone screen
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 6;
// Rooms idle longer than this drop off the room board (still open by link)
export const ROOM_BOARD_WINDOW_MS = 24 * 60 * 60 * 1000;
// A lobby nobody has touched for this long is cleared on the next request
export const LOBBY_IDLE_MS = 10 * 60 * 1000;
export const ROOM_TTL_SECONDS = 30 * 24 * 60 * 60;

// A seat counts as connected while a poll landed inside this window
export const CONNECTED_WINDOW_MS = 30_000;

// Polling cadence per phase kind, in milliseconds
export const POLL_DECISION_MS = 2000;
export const POLL_WAITING_MS = 3000;
export const POLL_PLAYBACK_MS = 2000;

// Countdown presets offered in the lobby, null meaning the room waits
export const COUNTDOWN_PRESETS: (number | null)[] = [null, 60, 180, 300];

export const LOG_CAP = 2000;
// How soon after a known deadline the client asks the server for the change
export const DEADLINE_REFETCH_DELAY_MS = 150;
export const PHASE_URGENT_MS = 15_000;

// The flag a closed room leaves in the lobby address, read once by the notice
export const ROOM_CLOSED_PARAM = 'closed';
