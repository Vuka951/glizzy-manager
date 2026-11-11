const SIZES = {
  lg: { bar: 'h-4', marker: '-inset-y-1.5 w-1' },
  sm: { bar: 'h-2.5', marker: '-inset-y-1 w-1' },
} as const;

const MARKER = {
  open: 'bg-white',
  met: 'bg-emerald-200',
  missed: 'bg-red-400',
} as const;

const THRESHOLD_INK = {
  open: 'text-slate-300',
  met: 'text-emerald-200',
  missed: 'text-red-300',
} as const;

// One bar a law has to clear: a cell per unit of weight, YES filling from the
// left and NO from the right, and a post after the cell YES has to reach
// with the share it stands for printed under it. Once the count is in, the
// post takes the colour of the result and a bar that was missed is ringed in
// red
export default function LawQuorumMeter({
  yes,
  no,
  total,
  needed,
  threshold,
  result = null,
  size = 'lg',
}: {
  yes: number;
  no: number;
  total: number;
  needed: number;
  threshold?: string;
  result?: 'met' | 'missed' | null;
  size?: keyof typeof SIZES;
}) {
  const dims = SIZES[size];
  const cells = Array.from({ length: total }, (_, i) =>
    i < yes ? 'yes' : i >= total - no ? 'no' : 'open',
  );
  return (
    <div
      className={`relative flex min-w-0 flex-1 gap-px rounded-[2px] transition-shadow duration-300 ${dims.bar} ${
        result === 'missed'
          ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-slate-950'
          : ''
      }`}
    >
      {cells.length === 0 ? (
        <span className="h-full flex-1 rounded-[2px] bg-slate-800" />
      ) : (
        cells.map((cell, i) => (
          <span
            key={i}
            className={`relative h-full flex-1 transition-colors duration-300 first:rounded-l-[2px] last:rounded-r-[2px] ${
              cell === 'yes'
                ? 'bg-emerald-400'
                : cell === 'no'
                  ? 'bg-red-500'
                  : 'bg-slate-800'
            }`}
          >
            {i === needed - 1 && (
              <span
                className={`absolute -right-px z-10 translate-x-1/2 rounded-[1px] ring-2 ring-slate-950 transition-colors duration-300 ${dims.marker} ${MARKER[result ?? 'open']}`}
              />
            )}
            {i === needed - 1 && threshold && (
              <span
                className={`absolute -right-px top-full mt-1.5 translate-x-1/2 font-sign text-[12px] font-bold leading-none tabular-nums transition-colors duration-300 ${THRESHOLD_INK[result ?? 'open']}`}
              >
                {threshold}
              </span>
            )}
          </span>
        ))
      )}
    </div>
  );
}
