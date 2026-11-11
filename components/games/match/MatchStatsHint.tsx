'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';
import HintTooltip from '@/components/games/HintTooltip';

// The gap where a reading would be. Hovering or tapping says what buys it,
// the only place the game admits there is something here to unlock. The
// bubble always opens toward the table
export default function MatchStatsHint({
  text,
  placement,
}: {
  text: string;
  placement: 'up' | 'down';
}) {
  const street = useCareerFrames() === 'street';
  return (
    <HintTooltip
      text={text}
      placement={placement}
      className={
        street
          ? 'flex h-4 w-4 items-center justify-center rounded-[2px] border border-[#7a6232] font-sign text-[11px] font-bold leading-none text-[#d6b871] transition hover:border-[#fcd34d] hover:text-[#fcd34d]'
          : 'flex h-3.5 w-3.5 items-center justify-center rounded-full border border-dashed border-slate-600 text-[8px] font-black leading-none text-slate-500 transition hover:border-sky-200/50 hover:text-sky-200'
      }
    >
      ?
    </HintTooltip>
  );
}
