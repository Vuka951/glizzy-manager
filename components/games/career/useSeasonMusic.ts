import { useEffect, useRef } from 'react';
import { GAME_MUSIC_TRACKS } from '@/lib/constants/gameMusic';
import { gameAudio } from '@/lib/utils/gameAudio';

const BASE_VOLUME = 0.3;
const EDGE_TRIM = 0.05;
const CROSSFADE_S = 2;

type Bed = { gain: GainNode; src: AudioBufferSourceNode };
type Bundle = { context: AudioContext; master: GainNode; current?: Bed };

// One chill loop per season, sample-accurate looping via WebAudio; when the
// calendar turns, the old season fades into the new one
export function useSeasonMusic(season: number, active: boolean) {
  const bundleRef = useRef<Bundle | null>(null);

  useEffect(() => {
    if (!active) return;
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = gameAudio.scaled(BASE_VOLUME, 'music');
    master.connect(context.destination);
    const bundle: Bundle = { context, master };
    bundleRef.current = bundle;
    const unsubscribe = gameAudio.subscribe(() => {
      master.gain.value = gameAudio.scaled(BASE_VOLUME, 'music');
    });
    // Autoplay policies keep the context suspended until a gesture lands
    const resume = () => {
      context.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      unsubscribe();
      try {
        bundle.current?.src.stop();
      } catch {
        // already stopped
      }
      context.close().catch(() => {});
      bundleRef.current = null;
    };
  }, [active]);

  useEffect(() => {
    const bundle = bundleRef.current;
    if (!active || !bundle) return;
    let cancelled = false;
    const count = GAME_MUSIC_TRACKS.length;
    fetch(GAME_MUSIC_TRACKS[((season % count) + count) % count])
      .then((response) => response.arrayBuffer())
      .then((data) => bundle.context.decodeAudioData(data))
      .then((buffer) => {
        if (cancelled) return;
        const { context, master } = bundle;
        const gain = context.createGain();
        gain.connect(master);
        const src = context.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.loopStart = EDGE_TRIM;
        src.loopEnd = buffer.duration - EDGE_TRIM;
        src.connect(gain);
        const now = context.currentTime;
        const previous = bundle.current;
        if (previous) {
          previous.gain.gain.setValueAtTime(previous.gain.gain.value, now);
          previous.gain.gain.linearRampToValueAtTime(0, now + CROSSFADE_S);
          const old = previous.src;
          window.setTimeout(
            () => {
              try {
                old.stop();
              } catch {
                // already stopped
              }
            },
            (CROSSFADE_S + 0.3) * 1000,
          );
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(1, now + CROSSFADE_S);
        } else {
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(1, now + 1.2);
        }
        src.start(now, EDGE_TRIM);
        bundle.current = { gain, src };
        context.resume().catch(() => {});
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [season, active]);
}
