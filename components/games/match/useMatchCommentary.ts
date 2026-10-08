import { useCallback, useEffect, useRef, useState } from 'react';
import {
  COMMENTARY_PLAYBACK_RATE,
  COMMENTARY_VOICE_VOLUME,
} from '@/lib/constants/careerCommentary';
import useCommentatorEnabled from '@/components/games/useCommentatorEnabled';
import { gameAudio } from '@/lib/utils/gameAudio';
import { readGameSettings, subscribeGameSettings } from '@/lib/utils/gameSettings';
import { captionHoldMs, type PlannedLine } from '@/lib/utils/matchCommentary';

type Speaking = { audio: HTMLAudioElement | null; timer: number | null };

// Drives the commentator during a match: at most one line plays at a time, a
// new line only interrupts a strictly less important one, everything else is
// dropped (a real commentator skips beats too). The finish frame is the one
// place lines chain back to back. A line whose clip cannot play still shows
// its caption, held for a reading time. introHolding is true while the
// pre-match line is still being spoken, so the viewer can wait before the
// first move; cutIntro silences it when the viewer moves on by hand.
export default function useMatchCommentary(
  plan: PlannedLine[] | null,
  frameIndex: number,
  finished: boolean,
): { caption: string | null; introHolding: boolean; cutIntro: () => void } {
  const [caption, setCaption] = useState<string | null>(null);
  const [playingFrame, setPlayingFrame] = useState<number | null>(null);
  const speakingRef = useRef<Speaking | null>(null);
  const priorityRef = useRef(-1);
  const chainRef = useRef<PlannedLine[]>([]);
  const enabled = useCommentatorEnabled();

  const silence = useCallback(() => {
    const speaking = speakingRef.current;
    speaking?.audio?.pause();
    if (speaking && speaking.timer !== null) window.clearTimeout(speaking.timer);
    speakingRef.current = null;
  }, []);

  useEffect(() => {
    const apply = () => {
      const audio = speakingRef.current?.audio;
      if (audio) audio.volume = gameAudio.scaled(COMMENTARY_VOICE_VOLUME, 'voice');
    };
    apply();
    return gameAudio.subscribe(apply);
  }, []);

  useEffect(() => {
    if (!plan?.length || !enabled) return;
    const clear = () => {
      speakingRef.current = null;
      priorityRef.current = -1;
      setCaption(null);
      setPlayingFrame(null);
    };
    const play = (line: PlannedLine) => {
      silence();
      const speaking: Speaking = { audio: null, timer: null };
      speakingRef.current = speaking;
      priorityRef.current = line.priority;
      setCaption(line.text);
      setPlayingFrame(line.frameIndex);
      // A line cut off while its play() was still pending settles late; by
      // then the ref already holds its replacement, which must stay tracked
      // so the next cut can silence it too
      const finish = () => {
        if (speakingRef.current !== speaking) return;
        clear();
        const next = chainRef.current.shift();
        if (next) play(next);
      };
      // No clip to time the line (a language without a voice bank, a file
      // not rendered yet, autoplay refused): the caption stays up long
      // enough to be read, then the line ends like a spoken one
      const hold = () => {
        if (speakingRef.current !== speaking || speaking.timer !== null) return;
        speaking.audio = null;
        speaking.timer = window.setTimeout(finish, captionHoldMs(line.text));
      };
      if (!line.clip) {
        hold();
        return;
      }
      const audio = new Audio(line.clip);
      audio.volume = gameAudio.scaled(COMMENTARY_VOICE_VOLUME, 'voice');
      audio.playbackRate = COMMENTARY_PLAYBACK_RATE;
      audio.preservesPitch = true;
      speaking.audio = audio;
      audio.onended = finish;
      audio.onerror = hold;
      audio.play().catch(hold);
    };
    const lines = plan.filter((line) => line.frameIndex === frameIndex);
    if (finished) {
      // The skip button jumps straight here: cut whatever is talking and
      // deliver only the verdict
      silence();
      clear();
      chainRef.current = lines.slice(1);
      if (lines[0]) play(lines[0]);
      return;
    }
    for (const line of lines) {
      if (!speakingRef.current || line.priority > priorityRef.current) play(line);
    }
  }, [plan, frameIndex, finished, enabled, silence]);

  useEffect(() => silence, [silence]);

  const cutIntro = useCallback(() => {
    silence();
    priorityRef.current = -1;
    chainRef.current = [];
    setCaption(null);
    setPlayingFrame(null);
  }, [silence]);

  useEffect(
    () =>
      subscribeGameSettings(() => {
        if (!readGameSettings().commentator) cutIntro();
      }),
    [cutIntro],
  );

  return {
    caption: enabled ? caption : null,
    introHolding: enabled && playingFrame === 0 && frameIndex === 0 && !finished,
    cutIntro,
  };
}
