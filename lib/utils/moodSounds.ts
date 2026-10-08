import type { CareerMoodActivity } from '@/lib/utils/careerMood';
import { gameAudio } from '@/lib/utils/gameAudio';

// Two moods are missing on purpose: `shy` is defined by hiding and `idle` by
// nothing being wrong, and a character who keeps announcing either one stops
// reading as shy or calm.
const MOOD_SOUNDS: Partial<Record<CareerMoodActivity, string[]>> = {
  sick: ['sick-1', 'sick-2', 'sick-3'],
  frantic: ['frantic-1', 'frantic-2', 'frantic-3'],
  anxious: ['anxious-1', 'anxious-2', 'anxious-3'],
  defeated: ['defeated-1', 'defeated-2', 'defeated-3'],
  proud: ['proud-1', 'proud-2', 'proud-3'],
  energized: ['energized-1', 'energized-2', 'energized-3'],
  hungry: ['hungry-1', 'hungry-2', 'hungry-3'],
  relaxed: ['relaxed-1', 'relaxed-2', 'relaxed-3'],
  celebrating: ['celebrating-1', 'celebrating-2', 'celebrating-3'],
};

// Quiet enough to sit under the season music rather than answer it
const MOOD_VOLUME = 0.34;

export const MOOD_GAP_MIN_MS = 12000;
export const MOOD_GAP_MAX_MS = 30000;

export function moodSoundVariants(activity: CareerMoodActivity): string[] {
  return (MOOD_SOUNDS[activity] ?? []).map(
    (name) => `/games/audio/moods/${name}.mp3`,
  );
}

export function hasMoodSound(activity: CareerMoodActivity): boolean {
  return moodSoundVariants(activity).length > 0;
}

export function moodGapMs(): number {
  return (
    MOOD_GAP_MIN_MS + Math.random() * (MOOD_GAP_MAX_MS - MOOD_GAP_MIN_MS)
  );
}

// Returns the element so a caller that unmounts mid-clip can cut it off
export function playMoodSound(
  activity: CareerMoodActivity,
  variant?: number,
): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  const sources = moodSoundVariants(activity);
  if (sources.length === 0) return null;
  const volume = gameAudio.scaled(MOOD_VOLUME, 'sfx');
  if (volume <= 0.01) return null;
  const index =
    variant === undefined
      ? Math.floor(Math.random() * sources.length)
      : variant % sources.length;
  const audio = new Audio(sources[index]);
  audio.volume = volume;
  audio.play().catch(() => {});
  return audio;
}
