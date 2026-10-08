'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';
import BroadcastFrame from '@/components/games/career/quotes/BroadcastFrame';
import QuoteSceneStage from '@/components/games/career/quotes/QuoteSceneStage';
import QuoteSubtitle from '@/components/games/career/quotes/QuoteSubtitle';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  QUOTE_SCENE_BY_ID,
  QUOTE_WORD_BLIP,
  QUOTE_WORD_BLIP_VOLUME,
} from '@/lib/constants/quoteCutscenes';
import {
  playCutsceneClip,
  playQuoteSounds,
} from '@/lib/utils/cutsceneSounds';
import { gameAudio } from '@/lib/utils/gameAudio';
import {
  readGameSettings,
  readServerGameSettings,
  subscribeGameSettings,
} from '@/lib/utils/gameSettings';
import type { QuotePlayback } from '@/lib/utils/quoteCutsceneTriggers';
import { quoteHeadline, quoteSceneSchedule } from '@/lib/utils/quoteSceneText';

const QUOTE = GAMES_UI.career.quoteCutscene;

// The tick stands in for the speaker's voice, so it is an effect that also
// follows the voice channel: muting either one silences it
function playWordBlip(): HTMLAudioElement | null {
  const audio = gameAudio.load();
  const voice = audio.voiceMuted ? 0 : audio.voiceVolume;
  return playCutsceneClip(QUOTE_WORD_BLIP, QUOTE_WORD_BLIP_VOLUME * voice);
}

// A line as a breaking news window floating over the game, which stays
// usable underneath: the scene inside the broadcast frame, the line typed
// on word by word in its lower third, a tick under each word. It closes on
// its own, on its skip button or on Escape; Enter and Space belong to the
// game. Several scenes from one event play back to back
export default function QuoteCutscene({
  queue,
  characterBySlug,
  onDone,
}: {
  queue: QuotePlayback[];
  characterBySlug: Map<string, DuelCharacter>;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState<{ line: number; words: number } | null>(
    null,
  );
  const onDoneRef = useRef(onDone);
  const enabled = useSyncExternalStore(
    subscribeGameSettings,
    () => readGameSettings().cutscenes,
    () => readServerGameSettings().cutscenes,
  );
  const play = queue[index];
  const def = play ? QUOTE_SCENE_BY_ID[play.id] : null;
  const variant = play ? (play.variant ?? def?.variant) : undefined;
  const playsLeft = queue.length - index;
  // A parent that appends to the queue or re-renders with a fresh array
  // must not restart the scene that is already on air
  const sceneKey = play
    ? `${index}|${play.id}|${play.speaker}|${play.other ?? ''}|${variant ?? ''}|${play.lineRoll}`
    : null;

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const advance = useCallback(() => {
    if (index + 1 < queue.length) setIndex(index + 1);
    else onDoneRef.current();
  }, [index, queue.length]);

  const skipAll = useCallback(() => onDoneRef.current(), []);
  const advanceRef = useRef(advance);

  useEffect(() => {
    advanceRef.current = advance;
  }, [advance]);

  useEffect(() => {
    if (!enabled) onDoneRef.current();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !def || !play) return;
    const { subtitles, durationMs } = quoteSceneSchedule(def, play);
    let blip: HTMLAudioElement | null = null;
    const timers: number[] = [
      ...subtitles.flatMap((subtitle, line) =>
        subtitle.wordAt.map((at, word) =>
          window.setTimeout(() => {
            setTyped({ line, words: word + 1 });
            blip = playWordBlip();
          }, at),
        ),
      ),
      window.setTimeout(() => advanceRef.current(), durationMs),
    ];
    const stopSounds = def.sounds
      ? playQuoteSounds(def.sounds, durationMs, variant)
      : () => {};
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      stopSounds();
      blip?.pause();
      setTyped(null);
    };
    // Keyed on the scene on air, not on the queue array or the callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey, enabled]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') advance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance]);

  if (!enabled || !play || !def || typeof document === 'undefined') {
    return null;
  }
  const subtitle = typed
    ? quoteSceneSchedule(def, play).subtitles[typed.line]
    : null;
  const nameOf = (slug: string) => characterBySlug.get(slug)?.name ?? slug;

  return createPortal(
    <div
      key={`${play.id}-${index}`}
      role="dialog"
      aria-label={QUOTE.breaking}
      className="fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-3xl border border-frost-border/40 bg-slate-950 shadow-[0_12px_48px_rgba(2,6,23,0.7),0_0_40px_rgba(220,38,38,0.2)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[28rem]"
    >
      <BroadcastFrame
        headline={quoteHeadline(def.id, variant, {
          name: nameOf(play.speaker),
          other: play.other && nameOf(play.other),
        })}
        subtitle={
          typed &&
          subtitle && (
            <QuoteSubtitle
              key={typed.line}
              speakerName={nameOf(subtitle.speaker)}
              words={subtitle.words}
              shown={typed.words}
            />
          )
        }
      >
        <QuoteSceneStage
          scene={play.id}
          speaker={play.speaker}
          other={play.other}
          variant={variant}
        />
      </BroadcastFrame>
      <div className="absolute right-2 top-2 z-[70] flex gap-1.5 sm:right-3 sm:top-3">
        {playsLeft > 1 && (
          <button
            onClick={skipAll}
            className="rounded-md border border-sky-200/30 bg-slate-950/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.25em] text-sky-200 transition hover:border-sky-200/60 hover:text-white sm:text-[10px]"
          >
            {QUOTE.skipAll}
          </button>
        )}
        <button
          onClick={advance}
          className="rounded-md border border-sky-200/30 bg-slate-950/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.25em] text-sky-200 transition hover:border-sky-200/60 hover:text-white sm:text-[10px]"
        >
          {QUOTE.skip}
        </button>
      </div>
    </div>,
    document.fullscreenElement ?? document.body,
  );
}
