'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

// The trophy count as a bar that fills with the share unlocked. The label
// in the middle is the count, or the percent where there is less room. In the
// career it is a brass gauge, in the other games a glass bar
export default function TrophyProgressBar({
  done,
  total,
  label = 'count',
  className = '',
}: {
  done: number;
  total: number;
  label?: 'count' | 'percent';
  className?: string;
}) {
  const share = total > 0 ? done / total : 0;
  const complete = total > 0 && done === total;
  const street = useCareerFrames() === 'street';
  const text =
    label === 'percent' ? `${Math.round(share * 100)}%` : `${done}/${total}`;
  if (street) {
    return (
      <span
        title={fmt(GAMES_UI.achievements.page.progress, { unlocked: done, total })}
        className={`relative flex items-center justify-center overflow-hidden rounded-[3px] bg-[#140d07] shadow-[inset_0_1px_3px_rgb(0_0_0/0.9),0_0_0_2px_#b8862f,0_2px_0_2px_rgb(2_6_23/0.55)] ${className}`}
      >
        <svg
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <rect x="0" y="0" width={100 * share} height="8" className="fill-[#8a6420]" />
        </svg>
        <span className="relative font-sign text-[14px] font-bold leading-none tabular-nums text-[#fdf0c8]">
          {text}
        </span>
      </span>
    );
  }
  return (
    <span
      title={fmt(GAMES_UI.achievements.page.progress, { unlocked: done, total })}
      className={`relative flex items-center justify-center overflow-hidden rounded-full border ${
        complete
          ? 'border-yellow-300/70 bg-yellow-400/20'
          : 'border-yellow-300/35 bg-slate-900/70'
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <rect x="0" y="0" width={100 * share} height="8" className="fill-yellow-400/70" />
      </svg>
      <span className="relative font-mono text-[11px] font-black tabular-nums text-yellow-50">
        {text}
      </span>
    </span>
  );
}
