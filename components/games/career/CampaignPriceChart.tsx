import { GAMES_UI } from "@/data/games/locale";
import { fmt } from "@/lib/utils/format";

const R = GAMES_UI.career.report;

// The glizi price as change from the start, one point per transfer window,
// with a percent axis, a year axis and the zero line
export default function CampaignPriceChart({ index }: { index: number[] }) {
  if (index.length < 2) return null;
  const w = 640;
  const h = 240;
  const pad = { top: 16, right: 56, bottom: 28, left: 44 };
  const base = index[0] || 1;
  const pct = index.map((v) => Math.round((v / base - 1) * 100));
  const lo = Math.min(0, ...pct);
  const hi = Math.max(0, ...pct);
  // A tick step that lands on round numbers and keeps about five lines
  const span = Math.max(10, hi - lo);
  const step = span <= 20 ? 5 : span <= 50 ? 10 : span <= 100 ? 20 : 50;
  const yMin = Math.floor(lo / step) * step;
  const yMax = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let t = yMin; t <= yMax; t += step) ticks.push(t);
  const x = (i: number) =>
    pad.left + (i / (pct.length - 1)) * (w - pad.left - pad.right);
  const y = (v: number) =>
    pad.top +
    (1 - (v - yMin) / Math.max(1, yMax - yMin)) * (h - pad.top - pad.bottom);
  const line = pct
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(v)}`)
    .join(" ");
  const area = `${line} L${x(pct.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`;
  const last = pct[pct.length - 1];
  const signed = (v: number) => `${v > 0 ? "+" : ""}${v}%`;
  // Four windows make a year; the axis names the year at its first window
  const years = pct.map((_, i) => (i % 4 === 0 ? i / 4 + 1 : null));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={pad.left}
            x2={w - pad.right}
            y1={y(t)}
            y2={y(t)}
            className={t === 0 ? "stroke-slate-900" : "stroke-slate-300"}
            strokeWidth={t === 0 ? 1.5 : 1}
          />
          <text
            x={pad.left - 8}
            y={y(t) + 3.5}
            textAnchor="end"
            className={`font-mono text-[10px] ${t === 0 ? "fill-slate-900 font-bold" : "fill-slate-500"}`}
          >
            {signed(t)}
          </text>
        </g>
      ))}
      {years.map((year, i) =>
        year === null ? null : (
          <g key={i}>
            <line
              x1={x(i)}
              x2={x(i)}
              y1={pad.top}
              y2={h - pad.bottom + 4}
              className="stroke-slate-300"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <text
              x={x(i)}
              y={h - 8}
              textAnchor={i === 0 ? "start" : "middle"}
              className="fill-slate-500 text-[10px] font-semibold uppercase tracking-widest"
            >
              {fmt(R.yearShort, { year })}
            </text>
          </g>
        ),
      )}
      <path
        d={area}
        className={last >= 0 ? "fill-emerald-700/15" : "fill-red-700/15"}
      />
      <path
        d={line}
        fill="none"
        strokeWidth={2.5}
        strokeLinejoin="round"
        className="stroke-slate-900"
      />
      {pct.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={3.5}
          className={`${v >= 0 ? "fill-emerald-700" : "fill-red-700"} stroke-amber-50`}
          strokeWidth={1.5}
        />
      ))}
      <text
        x={x(pct.length - 1) + 10}
        y={y(last) + 4}
        className={`font-mono text-[12px] font-black ${last >= 0 ? "fill-emerald-800" : "fill-red-800"}`}
      >
        {signed(last)}
      </text>
    </svg>
  );
}
