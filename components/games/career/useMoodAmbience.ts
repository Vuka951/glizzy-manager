import { useEffect, useRef } from 'react';
import type { CareerMoodActivity } from '@/lib/utils/careerMood';
import { hasMoodSound, moodGapMs, playMoodSound } from '@/lib/utils/moodSounds';

// The character keeps making the noise their mood makes: a random variant on a
// random 12 to 30 second gap, so it never settles into a rhythm you can predict.
// Silent while the tab is in the background, and cut off the moment the mood
// changes or the lobby goes away.
export function useMoodAmbience(
  activity: CareerMoodActivity,
  active: boolean,
): void {
  const playingRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!active || !hasMoodSound(activity)) return;
    let timer = 0;
    const tick = () => {
      if (typeof document === 'undefined' || !document.hidden) {
        playingRef.current = playMoodSound(activity);
      }
      timer = window.setTimeout(tick, moodGapMs());
    };
    timer = window.setTimeout(tick, moodGapMs());
    return () => {
      window.clearTimeout(timer);
      const audio = playingRef.current;
      playingRef.current = null;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [activity, active]);
}
