import { GAMES_UI } from '@/data/games/locale';

const NP = GAMES_UI.career.newspaper;

// The ticker line the market page prints: it climbs or slides across the
// grid and a glizzy rides the end of it
const UP_LINE = [
  [6, 54],
  [20, 48],
  [32, 52],
  [46, 38],
  [60, 42],
  [76, 26],
  [92, 31],
  [108, 18],
] as const;
// The same climb mirrored inside the chart band, under the header
const DOWN_LINE = UP_LINE.map(([x, y]) => [x, 74 - y] as const);
const BASELINE = 58;
const GRID_ROWS = [22, 36, 50];

function linePath(points: readonly (readonly [number, number])[]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
}

// The market story in one picture: a stock-page ticker for glizi, the line
// going the way the price went, the percentage stamped in the corner. Up is
// red ink because up means everything in the city costs more
export default function GliziPriceGraphic({
  up,
  pct,
  small = false,
}: {
  up: boolean;
  pct: number;
  small?: boolean;
}) {
  const points = up ? UP_LINE : DOWN_LINE;
  const [endX, endY] = points[points.length - 1];
  const ink = up ? 'stroke-red-700' : 'stroke-emerald-700';
  const wash = up ? 'fill-red-700/15' : 'fill-emerald-700/15';
  const stamp = up ? 'fill-red-700' : 'fill-emerald-700';
  return (
    <div
      className={`flex flex-col items-center rounded-sm border border-slate-900/40 bg-slate-100 shadow-[2px_2px_0_rgb(15_23_42/0.35)] ${
        small ? 'w-[6.5rem] p-1' : 'w-[9rem] p-1.5'
      }`}
    >
      <svg
        viewBox="0 0 120 64"
        className={small ? 'h-14 w-auto' : 'h-20 w-auto'}
        aria-hidden="true"
      >
        {GRID_ROWS.map((y) => (
          <line
            key={y}
            x1="4"
            x2="116"
            y1={y}
            y2={y}
            className="stroke-slate-900/25"
            strokeWidth="0.6"
            strokeDasharray="1.5 2"
          />
        ))}
        <line
          x1="4"
          x2="116"
          y1={BASELINE}
          y2={BASELINE}
          className="stroke-slate-900"
          strokeWidth="1"
        />
        <path
          d={`${linePath(points)} L${endX} ${BASELINE} L${points[0][0]} ${BASELINE} Z`}
          className={wash}
        />
        <path
          d={linePath(points)}
          className={`fill-none ${ink}`}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.slice(0, -1).map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" className="fill-slate-100 stroke-slate-900" strokeWidth="0.8" />
        ))}
        <g transform={`translate(${endX - 8} ${endY - 10})`}>
          <path d="M2 6 Q8 11 14 6" className="fill-none stroke-amber-500" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M1.5 4.5 Q8 9 14.5 4.5" className="fill-none stroke-red-500" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M3.5 4.5 q1.3 1.6 2.6 0.5 t2.6 0.5 t2.6 0.5" className="fill-none stroke-yellow-300" strokeWidth="0.9" strokeLinecap="round" />
        </g>
        <text
          x="6"
          y="11"
          className="fill-slate-900 font-sans text-[7px] font-black uppercase tracking-[0.2em]"
        >
          {NP.chartGlizi}
        </text>
        <g transform={up ? 'translate(74 39)' : 'translate(74 3)'}>
          <rect width="42" height="16" rx="2" className={stamp} transform="rotate(-3 21 8)" />
          <text
            x="21"
            y="11.5"
            textAnchor="middle"
            className="fill-amber-50 font-mono text-[10px] font-black"
            transform="rotate(-3 21 8)"
          >
            {up ? '+' : '-'}
            {pct}%
          </text>
        </g>
      </svg>
    </div>
  );
}
