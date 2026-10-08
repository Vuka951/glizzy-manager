import { INTRO_STAGGER } from '@/lib/constants/broadcastWeather';

const PIP_COUNT = 5;

// The last five results as a row of W and L tiles, oldest first; missing
// matches stay hollow
export default function ResultPips({
  results,
  size = 'sm',
}: {
  results?: ('w' | 'l')[];
  size?: 'sm' | 'md';
}) {
  const last = (results ?? []).slice(-PIP_COUNT);
  const cells: ('w' | 'l' | null)[] = [
    ...Array.from({ length: PIP_COUNT - last.length }, () => null),
    ...last,
  ];
  return (
    <span className="flex items-center gap-0.5">
      {cells.map((result, i) => (
        <span
          key={i}
          className={`flex items-center justify-center rounded-sm font-black uppercase opacity-0 animate-[bubblein_0.3s_ease-out_forwards] ${
            size === 'md' ? 'h-4 w-4 text-[9px]' : 'h-3 w-3 text-[7px]'
          } ${
            result === 'w'
              ? 'bg-green-400/80 text-slate-950'
              : result === 'l'
                ? 'bg-red-400/80 text-slate-950'
                : 'border border-slate-700/80'
          } ${INTRO_STAGGER[i]}`}
        >
          {result ?? ''}
        </span>
      ))}
    </span>
  );
}
