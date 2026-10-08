'use client';

import { useCallback, useEffect, useState } from 'react';
import QuoteCutscene from '@/components/games/career/QuoteCutscene';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { QuoteCue, RoomView } from '@/lib/types/careerMp';

// The league news the server booked for the whole room, aired on this
// screen in order and never twice on this browser. A cue stays up after the
// room has moved on, until this coach has watched or closed it. A clip's
// news waits for its result to land on the scoreboard
export default function RoomQuoteCues({
  view,
  serverOffset,
  characterBySlug,
  waiting,
  ackedSeq,
  onAck,
}: {
  view: RoomView;
  serverOffset: number;
  characterBySlug: Map<string, DuelCharacter>;
  // Something else holds the screen first, like the hit reel
  waiting: boolean;
  ackedSeq: number;
  onAck: (seq: number) => void;
}) {
  const phase = view.phase;
  const cues = phase.kind === 'finished' ? [] : (phase.quotes ?? []);
  const newestSeq = cues.at(-1)?.seq ?? null;
  const resultAt =
    phase.kind === 'match-clip'
      ? (phase.playback.skippedAt ??
        phase.playback.startedAt + phase.playback.durationMs)
      : null;
  const [landedSeq, setLandedSeq] = useState<number | null>(null);
  useEffect(() => {
    if (resultAt === null || newestSeq === null) return;
    const wait = Math.max(0, resultAt - (Date.now() + serverOffset));
    const timer = window.setTimeout(() => setLandedSeq(newestSeq), wait);
    return () => window.clearTimeout(timer);
    // serverOffset drifts a little per poll and must not restart the wait
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultAt, newestSeq]);

  // Cues move into this screen's own inbox once due, so a poll handing over
  // the next phase neither drops nor restarts what is on screen
  const [inbox, setInbox] = useState<QuoteCue[]>([]);
  const seenSeq = Math.max(ackedSeq, inbox.at(-1)?.seq ?? 0);
  const landed =
    resultAt === null || (landedSeq !== null && landedSeq === newestSeq);
  const due = landed ? cues.filter((cue) => cue.seq > seenSeq) : [];
  if (due.length > 0) setInbox([...inbox, ...due]);

  const current = inbox[0] ?? null;
  const seq = current?.seq ?? null;
  const onDone = useCallback(() => {
    if (seq === null) return;
    onAck(seq);
    setInbox((prev) => prev.filter((cue) => cue.seq !== seq));
  }, [seq, onAck]);

  if (!current || waiting) return null;
  return (
    <QuoteCutscene
      key={current.seq}
      queue={current.plays}
      characterBySlug={characterBySlug}
      onDone={onDone}
    />
  );
}
