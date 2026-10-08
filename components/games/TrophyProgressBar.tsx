import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

// The trophy count as a bar that fills with the share unlocked. The label
// in the middle is the count, or the percent where there is less room
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
        {label === 'percent' ? `${Math.round(share * 100)}%` : `${done}/${total}`}
      </span>
    </span>
  );
}
