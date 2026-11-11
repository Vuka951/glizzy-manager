'use client';

import { useEffect, useState } from 'react';
import PhaseTimer from '@/components/games/rooms/PhaseTimer';
import { PHASE_URGENT_MS } from '@/lib/constants/rooms';

// A board covers the coach bar, and on a phone it hides the bar outright. When
// the phase is about to take the board away the clock comes up over it, and it
// stays out of the way otherwise so the bar remains the only clock on screen
export default function BoardClock({
  deadline,
  serverOffset,
}: {
  deadline: number | null;
  serverOffset: number;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  if (deadline === null) return null;
  const left = deadline - (now + serverOffset);
  if (left <= 0 || left >= PHASE_URGENT_MS) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-1 z-[75] hidden justify-center [:root:has([data-street-dialog])_&]:flex">
      <PhaseTimer deadline={deadline} serverOffset={serverOffset} />
    </div>
  );
}
