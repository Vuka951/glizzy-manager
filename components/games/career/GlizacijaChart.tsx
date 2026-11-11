import { SEASON_COUNT } from '@/data/games/careerSeasons';
import { GAMES_UI } from '@/data/games/locale';
import { fmt, signedPct } from '@/lib/utils/format';

const G = GAMES_UI.career.offseason.glizacija;
const VIEW_W = 320;
const VIEW_H = 150;
const PAD = { top: 10, right: 30, bottom: 20, left: 28 };
// A start-anchored label runs right into a middle-anchored one closer
// than its own width plus half of the next
const MIN_LABEL_GAP = 50;

function toneFill(value: number): string {
  return value > 0
    ? 'fill-[#fca5a5]'
    : value < 0
      ? 'fill-[#86efac]'
      : 'fill-[#fdf0c8]';
}

// The market chalked on the exchange's board: change against the opening price
// on a percent axis with round gridlines, a dotted line where every year opens,
// a marked point per window and the latest value at the end. Up is red chalk
// here because up means everything costs more
export default function GlizacijaChart({
  history,
  startWindow = 0,
}: {
  history: number[];
  startWindow?: number;
}) {
  const points = history.length > 0 ? history : [1];
  const pct = points.map((v) => Math.round((v - 1) * 100));
  const lo = Math.min(0, ...pct);
  const hi = Math.max(0, ...pct);
  // A tick step that lands on round numbers and keeps about four lines
  const span = Math.max(10, hi - lo);
  const step = span <= 20 ? 5 : span <= 50 ? 10 : span <= 100 ? 20 : 50;
  const yMin = Math.floor(lo / step) * step;
  const yMax = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let t = yMin; t <= yMax; t += step) ticks.push(t);
  const plotW = VIEW_W - PAD.left - PAD.right;
  const plotH = VIEW_H - PAD.top - PAD.bottom;
  const x = (i: number) =>
    pct.length > 1
      ? PAD.left + (i / (pct.length - 1)) * plotW
      : PAD.left + plotW;
  const y = (v: number) =>
    PAD.top + (1 - (v - yMin) / Math.max(1, yMax - yMin)) * plotH;
  const line = pct
    .map(
      (v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`,
    )
    .join(' ');
  const area = `${line} L${x(pct.length - 1).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const last = pct[pct.length - 1];
  // The axis names a year at its first window; a range that opens mid-year
  // names the opening window's year too, unless a boundary sits right there
  const boundaries = pct
    .map((_, i) => ({ i, window: startWindow + i }))
    .filter(({ window }) => window % SEASON_COUNT === 0)
    .map(({ i, window }) => ({
      i,
      year: Math.floor(window / SEASON_COUNT) + 1,
    }));
  const firstBoundary = boundaries[0];
  const yearLabels =
    firstBoundary && x(firstBoundary.i) - x(0) < MIN_LABEL_GAP
      ? boundaries
      : [
          { i: 0, year: Math.floor(startWindow / SEASON_COUNT) + 1 },
          ...boundaries,
        ];
  const labelFor = (i: number, year: number) =>
    startWindow + i === 0 ? G.start : fmt(G.yearTick, { year });

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full"
      aria-hidden="true"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={VIEW_W - PAD.right}
            y1={y(t).toFixed(1)}
            y2={y(t).toFixed(1)}
            className={t === 0 ? 'stroke-[#f1f5f9]/75' : 'stroke-[#f1f5f9]/15'}
            strokeWidth={t === 0 ? 1.2 : 1}
          />
          <text
            x={PAD.left - 5}
            y={(y(t) + 2.5).toFixed(1)}
            textAnchor="end"
            className={`font-sign text-[9px] font-semibold ${t === 0 ? 'fill-[#f8fafc]' : 'fill-[#f1f5f9]/70'}`}
          >
            {signedPct(t)}
          </text>
        </g>
      ))}
      {boundaries.map((tick) => (
        <line
          key={tick.i}
          x1={x(tick.i).toFixed(1)}
          x2={x(tick.i).toFixed(1)}
          y1={PAD.top}
          y2={PAD.top + plotH + 3}
          className="stroke-[#f1f5f9]/30"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
      ))}
      {yearLabels.map((tick) => (
        <text
          key={tick.i}
          x={x(tick.i).toFixed(1)}
          y={VIEW_H - 5}
          textAnchor={
            tick.i === 0
              ? 'start'
              : x(tick.i) > VIEW_W - PAD.right - 12
                ? 'end'
                : 'middle'
          }
          className="fill-[#f1f5f9]/70 font-sign text-[9px] font-semibold uppercase tracking-[0.08em]"
        >
          {labelFor(tick.i, tick.year)}
        </text>
      ))}
      <path
        d={area}
        className={
          last > 0
            ? 'fill-[#fca5a5]/15'
            : last < 0
              ? 'fill-[#86efac]/15'
              : 'fill-[#fdf0c8]/10'
        }
      />
      <path
        d={line}
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="stroke-[#f8fafc]"
      />
      {pct.map((v, i) => (
        <circle
          key={i}
          cx={x(i).toFixed(1)}
          cy={y(v).toFixed(1)}
          r={i === pct.length - 1 ? 3.2 : 2.4}
          className={`${toneFill(v)} stroke-[#1b2622]`}
          strokeWidth="1"
        />
      ))}
      <text
        x={(x(pct.length - 1) + 6).toFixed(1)}
        y={(y(last) + 3).toFixed(1)}
        className={`font-sign text-[12px] font-bold ${toneFill(last)}`}
      >
        {signedPct(last)}
      </text>
    </svg>
  );
}
