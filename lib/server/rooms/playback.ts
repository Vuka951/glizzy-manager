import type { Playback } from '@/lib/types/rooms';

// A clip scheduled `preRollMs` ahead of the request that decided it, so every
// screen has the result before the first frame and starts together
export function newPlayback(
  durationMs: number,
  now: number,
  preRollMs: number,
): Playback {
  return { startedAt: now + preRollMs, durationMs, skipVotes: [] };
}

// When the result is on every screen: the clip's natural end, or the moment
// a majority skipped it
export function clipResultAt(playback: Playback): number {
  return playback.skippedAt ?? playback.startedAt + playback.durationMs;
}

export function clipEndsAt(playback: Playback, lingerSeconds: number): number {
  return clipResultAt(playback) + lingerSeconds * 1000;
}
