import MinusIcon from '@/components/icons/MinusIcon';
import PlusIcon from '@/components/icons/PlusIcon';

const TONES = {
  amber: {
    value: 'text-amber-300',
    pipOn: 'bg-amber-400',
    button:
      'border-amber-400/30 text-amber-200 hover:border-amber-400/70 hover:bg-amber-500/20 hover:text-white',
    note: 'border-amber-400/25 bg-amber-500/10 text-amber-200',
  },
  red: {
    value: 'text-red-300',
    pipOn: 'bg-red-400',
    button:
      'border-red-500/30 text-red-200 hover:border-red-500/70 hover:bg-red-500/20 hover:text-white',
    note: 'border-red-500/25 bg-red-500/10 text-red-200',
  },
} as const;

// The plus/minus dial behind every bought percentage: the big readout is the
// chance, the pips are the steps of coverage the money has already paid for
export default function ChanceStepper({
  label,
  caption,
  note,
  hint,
  pct,
  steps,
  filled,
  tone = 'amber',
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
  tone?: keyof typeof TONES;
  onLess: () => void;
  onMore: () => void;
}) {
  const T = TONES[tone];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-sky-200/10 bg-slate-800/40 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        {note && (
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold ${T.note}`}
          >
            {note}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onLess}
          disabled={filled <= 1}
          aria-label={caption}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-slate-950/50 transition disabled:pointer-events-none disabled:opacity-25 ${T.button}`}
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <span
            className={`font-mono text-3xl font-black leading-none ${T.value}`}
          >
            {pct}%
          </span>
          <span className="flex w-full gap-0.5">
            {Array.from({ length: steps }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < filled ? T.pipOn : 'bg-slate-950/70'
                }`}
              />
            ))}
          </span>
          <span className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-500">
            {caption}
          </span>
        </div>
        <button
          onClick={onMore}
          disabled={filled >= steps}
          aria-label={caption}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-slate-950/50 transition disabled:pointer-events-none disabled:opacity-25 ${T.button}`}
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[10px] leading-relaxed text-slate-400">{hint}</p>
    </div>
  );
}
