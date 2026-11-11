'use client';

import InfoTip from '@/components/games/career/InfoTip';
import MinusIcon from '@/components/icons/MinusIcon';
import PlusIcon from '@/components/icons/PlusIcon';

const KEY =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] border-2 border-[#ffffff] bg-[#b91c1c] text-[#ffffff] shadow-[0_3px_0_rgba(2,6,23,0.65)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0dca8] active:translate-y-[2px] active:shadow-[0_1px_0_rgba(2,6,23,0.65)] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none';

// The hand counter behind a bought percentage: the drums show the chance, the
// row of pins the steps of coverage the money has already paid for
export default function ChanceStepper({
  label,
  caption,
  note,
  hint,
  pct,
  steps,
  filled,
  onLess,
  onMore,
}: {
  label: string;
  caption: string;
  note?: string;
  hint: string;
  pct: number;
  steps: number;
  filled: number;
  onLess: () => void;
  onMore: () => void;
}) {
  return (
    <div
      className="flex flex-col gap-2.5 rounded-[5px] bg-gradient-to-b from-[#2a2019] to-[#14100c] p-3 shadow-[inset_0_0_0_2px_#9a6d24,inset_0_3px_0_rgb(255_255_255/0.1),0_3px_0_rgb(0_0_0/0.5)]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-sign text-[14px] font-bold uppercase tracking-[0.06em] text-[#f0dca8]">
          {label}
          <InfoTip text={hint} />
        </span>
        {note && (
          <span className="rounded-[2px] bg-[#ecdcb4] px-1.5 py-0.5 font-sign text-[13px] font-semibold tabular-nums leading-none text-[#2a2012] shadow-[0_1px_0_rgb(0_0_0/0.6)]">
            {note}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onLess} disabled={filled <= 1} aria-label={caption} className={KEY}>
          <MinusIcon className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <span role="img" aria-label={`${pct}%`} className="flex gap-0.5">
            {`${pct}%`.split('').map((digit, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="flex h-11 w-8 items-center justify-center rounded-[2px] bg-[linear-gradient(180deg,#000,#2e2e2e_45%,#2e2e2e_55%,#000)] font-sign text-[32px] font-bold leading-none text-[#fbf5e6] shadow-[inset_0_0_0_1px_#000,0_1px_0_rgb(255_255_255/0.14)]"
              >
                {digit}
              </span>
            ))}
          </span>
          <span className="flex w-full gap-[3px]">
            {Array.from({ length: steps }).map((_, i) => (
              <span
                key={i}
                className={`h-2 flex-1 rounded-[1px] transition-colors motion-reduce:transition-none ${
                  i < filled
                    ? 'bg-[#ef4444] shadow-[inset_0_1px_0_rgb(255_255_255/0.4)]'
                    : 'bg-[#050302] shadow-[0_1px_0_rgb(255_255_255/0.1)]'
                }`}
              />
            ))}
          </span>
          <span className="text-center font-sign text-[13px] font-semibold uppercase tracking-[0.06em] text-[#d4c29a]">
            {caption}
          </span>
        </div>
        <button onClick={onMore} disabled={filled >= steps} aria-label={caption} className={KEY}>
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
