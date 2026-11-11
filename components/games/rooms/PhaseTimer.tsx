'use client';

import { useEffect, useState } from 'react';
import { useCareerFrames } from '@/components/games/career/careerFrames';
import { GAMES_UI } from '@/data/games/locale';
import { PHASE_URGENT_MS } from '@/lib/constants/rooms';
import { fmt } from '@/lib/utils/format';

const T = GAMES_UI.rooms.timer;

function formatLeft(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// The countdown: reads the server's deadline against the server's clock, so
// every screen in the room shows the same number. In the street frame it is a
// brass-housed clock in the same paint as the till; the classic frame keeps
// the chip
export default function PhaseTimer({
  deadline,
  serverOffset,
}: {
  deadline: number | null;
  serverOffset: number;
}) {
  // Ticks even without a deadline, so one that appears mid-phase is read
  // against a fresh clock on its first frame
  const street = useCareerFrames() === 'street';
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  if (deadline === null) return null;
  const left = deadline - (now + serverOffset);
  const urgent = left < PHASE_URGENT_MS;
  if (street) {
    return (
      <span className="inline-flex items-stretch rounded-[4px] bg-gradient-to-b from-[#e8c066] to-[#a8782a] p-[3px] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_2px_0_rgb(2_6_23/0.65)]">
        <span
          className={`relative flex items-center overflow-hidden rounded-[2px] px-2 py-1 font-sign text-[15px] font-bold leading-none tabular-nums tracking-[0.06em] shadow-[inset_0_1px_3px_rgb(0_0_0/0.9)] ${
            urgent ? 'bg-[#7f1d1d] text-[#ffffff]' : 'bg-[#140d07] text-[#fdf0c8]'
          }`}
        >
          {urgent && (
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[#b91c1c] motion-safe:animate-pulse"
            />
          )}
          <span className="relative">
            {fmt(T.left, { time: formatLeft(left) })}
          </span>
        </span>
      </span>
    );
  }
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
