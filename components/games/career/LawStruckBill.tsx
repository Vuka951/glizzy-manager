'use client';

import { useEffect, useRef } from 'react';
import LawStamp from '@/components/games/career/LawStamp';
import type { LawId } from '@/data/games/careerLaws';
import { GAMES_UI } from '@/data/games/locale';
import { lawName } from '@/lib/utils/careerLaws';

const STAMPS = GAMES_UI.career.laws.vote.stamps;

// A law off the books: its slip of paper with a red pen stroke drawn through
// the name and the stamp beside it. With animate the stroke is drawn on mount
export default function LawStruckBill({
  law,
  animate = true,
}: {
  law: LawId;
  animate?: boolean;
}) {
  const root = useRef<HTMLSpanElement | null>(null);
  const line = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const enter = root.current?.animate(
      [
        { transform: 'translateY(30%)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ],
      { duration: 260, easing: 'ease-out' },
    );
    const stroke = line.current?.animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: 420, delay: 260, easing: 'ease-in-out', fill: 'backwards' },
    );
    return () => {
      enter?.cancel();
      stroke?.cancel();
    };
  }, [animate]);
  return (
    <span
      ref={root}
      className="relative flex items-center gap-2 rounded-[2px] bg-[#f1e8d3] py-1.5 pl-2 pr-3 shadow-[2px_2px_0_rgb(2_6_23/0.45)]"
    >
      <span className="relative font-serif text-[13px] font-black text-[#55472f]">
        {lawName(law)}
        <span
          ref={line}
          className="absolute inset-x-[-3px] top-1/2 h-[3px] origin-left -translate-y-1/2 -rotate-3 rounded-full bg-[#b91c1c]"
        />
      </span>
      <LawStamp
        verdict="repealed"
        text={STAMPS.repealed}
        size="sm"
        onPaper
        className="ml-1"
      />
    </span>
  );
}
