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
          className={`flex items-center justify-center rounded-[2px] font-sign font-extrabold uppercase leading-none opacity-0 animate-[bubblein_0.3s_ease-out_forwards] ${
            size === 'md' ? 'h-4 w-4 text-[12px]' : 'h-3.5 w-3.5 text-[11px]'
          } ${
            result === 'w'
              ? 'bg-[#15803d] text-[#f0fdf4]'
              : result === 'l'
                ? 'bg-[#b91c1c] text-[#fef2f2]'
                : 'border border-[#64748b]'
          } ${INTRO_STAGGER[i]}`}
        >
          {result ?? ''}
        </span>
      ))}
    </span>
  );
}
