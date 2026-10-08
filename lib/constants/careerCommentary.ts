// A line with no clip to time it holds its caption this long, so it can be
// read: a base plus a share per character
export const CAPTION_HOLD_BASE_MS = 1200;
export const CAPTION_HOLD_MS_PER_CHAR = 55;

// The broadcast grows one piece per finished cup: commentator, then pre-match
// graphics (alongside betting at 2), then the studio open
export const COMMENTARY_UNLOCK_CUPS = 1;
export const MATCH_TAPE_UNLOCK_CUPS = 2;
export const BROADCAST_OPEN_UNLOCK_CUPS = 3;

export const COMMENTARY_VOICE_VOLUME = 0.9;

// Slightly faster than recorded, pitch preserved: broadcast urgency without
// the chipmunk
export const COMMENTARY_PLAYBACK_RATE = 1.12;

// A plain dodge only gets a call this often; the silences make the spikes land
export const DODGE_CALL_CHANCE = 0.55;

// Misses in a row before the streak lines take over from plain dodge calls
export const DODGE_STREAK_MIN = 3;

// Turn counts that read as a blitz or a marathon
export const QUICK_MATCH_MAX_TURNS = 3;
export const LONG_MATCH_MIN_TURNS = 9;
