// What a settled bet does to the coach in the stand: a winner throws
// something into the air, a loser sheds tears. Three looks each, picked per
// coach so a full stand does not move in lockstep
// Five flight paths fanning out from the top of the head, each piece
// spinning as it goes, staggered so the burst never stops
const FLIGHTS = [
  'animate-[fly1_1.3s_ease-out_infinite]',
  'animate-[fly2_1.5s_ease-out_infinite] [animation-delay:-0.3s]',
  'animate-[fly3_1.2s_ease-out_infinite] [animation-delay:-0.6s]',
  'animate-[fly4_1.6s_ease-out_infinite] [animation-delay:-0.9s]',
  'animate-[fly5_1.4s_ease-out_infinite] [animation-delay:-1.1s]',
];
const BURST_DELAYS = [
  '',
  '[animation-delay:-0.3s]',
  '[animation-delay:-0.6s]',
  '[animation-delay:-0.9s]',
  '[animation-delay:-1.2s]',
];

const CONFETTI = [
  'bg-rose-400',
  'bg-sky-300',
  'bg-amber-300',
  'bg-lime-300',
  'bg-fuchsia-400',
];

export type CrowdEffectVariant = 0 | 1 | 2;

export function effectVariant(seed: string): CrowdEffectVariant {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 3) as CrowdEffectVariant;
}

function Burst({ pieces }: { pieces: string[] }) {
  return (
    <span className="pointer-events-none absolute left-1/2 top-0 z-10 h-0 w-0">
      {FLIGHTS.map((flight, i) => (
        <span
          key={i}
          className={`absolute -left-0.5 -top-0.5 block ${flight} ${pieces[i % pieces.length]}`}
        />
      ))}
    </span>
  );
}

export default function CrowdTokenEffect({
  outcome,
  variant,
}: {
  outcome: 'won' | 'lost';
  variant: CrowdEffectVariant;
}) {
  if (outcome === 'won') {
    if (variant === 0) {
      return (
        <Burst pieces={CONFETTI.map((c) => `h-2 w-1.5 rounded-sm ${c}`)} />
      );
    }
    if (variant === 1) {
      return (
        <span className="pointer-events-none absolute inset-x-0 -top-2 z-10 h-8">
          {[
            '-left-1 top-0',
            'right-0 top-1',
            'left-2 -top-2',
            'right-2 -top-1',
          ].map((pos, i) => (
            <span
              key={i}
              className={`absolute ${pos} text-[10px] leading-none text-amber-200 animate-[twinkle_1.2s_ease-in-out_infinite] ${BURST_DELAYS[i]}`}
            >
              &#10022;
            </span>
          ))}
        </span>
      );
    }
    return (
      <Burst
        pieces={['h-2 w-2 rounded-full bg-amber-300 ring-1 ring-amber-600']}
      />
    );
  }
  if (variant === 0) {
    return (
      <span className="pointer-events-none absolute left-1/2 top-2 z-10 h-0 w-0">
        {['-left-2', 'left-1'].map((pos, i) => (
          <span
            key={i}
            className={`absolute ${pos} block h-2 w-1 rounded-b-full bg-sky-300 animate-[teardrop_1.1s_ease-in_infinite] ${BURST_DELAYS[i + 1]}`}
          />
        ))}
      </span>
    );
  }
  if (variant === 1) {
    return (
      <span className="pointer-events-none absolute left-1/2 -top-3 z-10 h-0 w-0">
        <span className="absolute -left-3 -top-1 h-2.5 w-6 rounded-full bg-slate-400/80" />
        {['-left-2', 'left-0', 'left-2'].map((pos, i) => (
          <span
            key={i}
            className={`absolute ${pos} top-1.5 block h-1.5 w-0.5 rounded-full bg-sky-300 animate-[teardrop_0.9s_linear_infinite] ${BURST_DELAYS[i]}`}
          />
        ))}
      </span>
    );
  }
  return (
    <span className="pointer-events-none absolute left-1/2 top-2 z-10 h-0 w-0">
      <span className="absolute left-1 block h-2.5 w-1 rounded-b-full bg-sky-200 animate-[teardrop_1.6s_ease-in_infinite]" />
    </span>
  );
}
