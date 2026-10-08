'use client';

import { useEffect, useState } from 'react';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const T = GAMES_UI.careerMp.timer;

function formatLeft(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// The countdown chip: reads the server's deadline against the server's
// clock, so every screen in the room shows the same number
export default function PhaseTimer({
  deadline,
  serverOffset,
}: {
  deadline: number | null;
  serverOffset: number;
}) {
  // Ticks even without a deadline, so one that appears mid-phase is read
  // against a fresh clock on its first frame
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  if (deadline === null) return null;
  const left = deadline - (now + serverOffset);
  const urgent = left < 15_000;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tabular-nums tracking-widest backdrop-blur-sm ${
        urgent
          ? 'animate-pulse border-red-500/60 bg-red-950/80 text-red-200'
          : 'border-sky-200/20 bg-slate-950/70 text-sky-200'
      }`}
    >
      {fmt(T.left, { time: formatLeft(left) })}
    </span>
  );
}
