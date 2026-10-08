import {
  CONNECTED_WINDOW_MS,
  COUNTDOWN_PRESETS,
  LOG_CAP,
} from '@/lib/constants/careerMp';
import { DEFAULT_SETTINGS, type Room } from '@/lib/server/career-mp/room';
import type { RoomSettings } from '@/lib/types/careerMp';

export function logEvent(
  room: Room,
  now: number,
  kind: string,
  params: Record<string, string | number> = {},
  visibleTo?: string,
): Room {
  const entry = visibleTo
    ? { at: now, kind, params, visibleTo }
    : { at: now, kind, params };
  const log = [...room.log, entry];
  return {
    ...room,
    log: log.length > LOG_CAP ? log.slice(log.length - LOG_CAP) : log,
  };
}

function countdown(value: unknown, fallback: number | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  if (n <= 0) return null;
  // Only the lobby presets are accepted, so a room cannot be set to a
  // countdown nobody can read
  return COUNTDOWN_PRESETS.includes(n) ? n : fallback;
}

export function normalizeSettings(input: Partial<RoomSettings>): RoomSettings {
  const linger = Number(input.matchLingerSeconds);
  return {
    windowSeconds: countdown(input.windowSeconds, DEFAULT_SETTINGS.windowSeconds),
    paperSeconds: countdown(input.paperSeconds, DEFAULT_SETTINGS.paperSeconds),
    preRoundSeconds: countdown(
      input.preRoundSeconds,
      DEFAULT_SETTINGS.preRoundSeconds,
    ),
    matchBetSeconds: countdown(
      input.matchBetSeconds,
      DEFAULT_SETTINGS.matchBetSeconds,
    ),
    seasonEndSeconds: countdown(
      input.seasonEndSeconds,
      DEFAULT_SETTINGS.seasonEndSeconds,
    ),
    matchLingerSeconds:
      Number.isFinite(linger) && linger >= 0 && linger <= 60
        ? linger
        : DEFAULT_SETTINGS.matchLingerSeconds,
  };
}

export function deadlineFor(seconds: number | null, now: number): number | null {
  return seconds === null ? null : now + seconds * 1000;
}

export function connectedCoachIds(room: Room, now: number): string[] {
  return Object.values(room.coaches)
    .filter((c) => now - c.lastSeenAt <= CONNECTED_WINDOW_MS)
    .map((c) => c.id);
}

// Strictly more than half of the connected coaches, never fewer than one
export function majorityOf(count: number): number {
  return Math.floor(count / 2) + 1;
}
