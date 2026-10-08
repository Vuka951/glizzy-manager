import { GAMES_UI } from '@/data/games/locale';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { gliziPricePct } from '@/lib/utils/careerSeasonPrices';
import { signedPct } from '@/lib/utils/format';

const G = GAMES_UI.career.offseason.glizacija;
const SPARK_POINTS = 8;

// The ticker on the scene: the market against the opening price, which way
// it moved last, and the last few windows as a sparkline. Opens the chart
export default function GlizacijaPill({
  career,
  onOpen,
}: {
  career: SavedCareer;
  onOpen: () => void;
}) {
  const pct = gliziPricePct(career);
  const history = career.gliziPriceHistory ?? [];
  const previous = history.length > 1 ? history[history.length - 2] : 1;
  const current = career.gliziPriceIndex ?? 1;
  const trend = current > previous ? 1 : current < previous ? -1 : 0;
  const spark = history.slice(-SPARK_POINTS);
  const lo = Math.min(1, ...spark);
  const hi = Math.max(1, ...spark);
  const sparkPath = spark
    .map((v, i) => {
      const sx = spark.length > 1 ? (i / (spark.length - 1)) * 40 : 40;
      const sy = hi === lo ? 6 : 11 - ((v - lo) / (hi - lo)) * 10;
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(' ');
  const tone =
    pct > 0 ? 'text-red-300' : pct < 0 ? 'text-emerald-300' : 'text-slate-300';

  return (
    <button
      onClick={onOpen}
      title={G.title}
      className="flex h-9 items-center gap-2 self-stretch rounded-2xl border border-sky-200/15 bg-slate-950/70 px-3 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-200/40"
    >
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {G.title}
      </span>
      {spark.length > 1 && (
        <svg
          viewBox="0 0 40 12"
          className="hidden h-3 w-10 xl:block"
          aria-hidden="true"
        >
          <polyline
            points={sparkPath}
            className={`fill-none ${pct > 0 ? 'stroke-red-300' : pct < 0 ? 'stroke-emerald-300' : 'stroke-slate-400'}`}
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span className={`ml-auto font-mono text-xs font-black tabular-nums ${tone}`}>
        {trend > 0 ? '\u25B2' : trend < 0 ? '\u25BC' : ''}
        {signedPct(pct)}
      </span>
    </button>
  );
}
