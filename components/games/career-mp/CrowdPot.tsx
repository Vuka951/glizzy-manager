import { GAMES_UI } from '@/data/games/locale';

const PM = GAMES_UI.careerMp.prematch;

// The pile grows in six steps and tops out at 200: how many coins tall each
// stack is, left to right
const POT_MAX = 200;
const STACKS = [
  [2],
  [3, 2],
  [2, 4, 3],
  [3, 5, 4, 2],
  [3, 6, 5, 3, 2],
  [4, 7, 6, 5, 3, 2],
];
const SIZES = [
  'h-6 w-8',
  'h-8 w-12',
  'h-9 w-16',
  'h-11 w-20',
  'h-12 w-24',
  'h-14 w-28',
];
const COIN_W = 16;
const COIN_H = 4.5;
const GAP = 1.5;

function tierOf(amount: number): number {
  const share = Math.min(1, amount / POT_MAX);
  return Math.min(STACKS.length - 1, Math.floor(share * STACKS.length));
}

// One coin seen from the side: a dark rim under a bright face
function Coin({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect
        x={x}
        y={y - COIN_H}
        width={COIN_W}
        height={COIN_H}
        rx="1.2"
        className="fill-amber-600"
      />
      <ellipse
        cx={x + COIN_W / 2}
        cy={y - COIN_H}
        rx={COIN_W / 2}
        ry="2.4"
        className="fill-amber-300 stroke-amber-700"
        strokeWidth="0.7"
      />
      <ellipse
        cx={x + COIN_W / 2}
        cy={y - COIN_H}
        rx={COIN_W / 2 - 3.5}
        ry="1.1"
        className="fill-yellow-200/90"
      />
    </g>
  );
}

// Everything staked on one side, stacked up next to the table: neat coin
// towers of different heights, a few loose coins at their feet
export default function CrowdPot({ amount }: { amount: number }) {
  if (amount <= 0) return null;
  const tier = tierOf(amount);
  const stacks = STACKS[tier];
  const width = stacks.length * (COIN_W + GAP) + 6;
  const tallest = Math.max(...stacks);
  const height = tallest * COIN_H + 12;
  return (
    <span
      data-crowd-pot={amount}
      className="flex flex-col items-center gap-0.5"
      title={`${PM.pot}: ${amount}`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`${SIZES[tier]} drop-shadow-md`}
        aria-hidden="true"
      >
        <ellipse
          cx={width / 2}
          cy={height - 3}
          rx={width / 2 - 1}
          ry="3"
          className="fill-slate-950/40"
        />
        {stacks.map((count, s) =>
          Array.from({ length: count }, (_, i) => (
            <Coin
              key={`${s}-${i}`}
              x={3 + s * (COIN_W + GAP)}
              y={height - 4 - i * COIN_H}
            />
          )),
        )}
        {tier >= 3 && (
          <path
            d={`M${width - 6} 4 l1.2 2.4 2.4 1.2 -2.4 1.2 -1.2 2.4 -1.2 -2.4 -2.4 -1.2 2.4 -1.2z`}
            className="fill-white/90"
          />
        )}
      </svg>
      <span className="rounded-full bg-slate-950/70 px-1.5 font-mono text-[9px] font-bold leading-4 text-amber-300">
        {amount}
      </span>
    </span>
  );
}
