import {
  GLIZI_PRICE_EVENT_CHANCE,
  GLIZI_PRICE_HIKE_RATING_SCALE,
  GLIZI_PRICE_INDEX_MAX,
  GLIZI_PRICE_INDEX_MIN,
  GLIZI_PRICE_MOVE_MAX,
  GLIZI_PRICE_MOVE_MIN,
  GLIZI_PRICE_RATING_MAX,
  GLIZI_PRICE_RATING_MIN,
} from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import type { SavedCareer } from '@/lib/utils/careerSave';
import {
  GLIZI_PRICED_CATEGORIES,
  gliziPricePct,
} from '@/lib/utils/careerSeasonPrices';
import { fmt, signedPct } from '@/lib/utils/format';

const G = GAMES_UI.career.offseason.glizacija;
const CATEGORY_NAMES = GAMES_UI.career.offseason.seasonPrices.categories;

// The market explained: what the index is, how a window moves it, what it
// multiplies and who pays for it politically, then where it stands today
export default function GlizacijaInfoPanel({ career }: { career: SavedCareer }) {
  const pct = gliziPricePct(career);
  const rows = [
    G.info.what,
    fmt(G.info.moves, {
      chance: Math.round(GLIZI_PRICE_EVENT_CHANCE * 100),
      min: GLIZI_PRICE_MOVE_MIN,
      max: GLIZI_PRICE_MOVE_MAX,
      floor: Math.round(GLIZI_PRICE_INDEX_MIN * 100),
      ceiling: Math.round(GLIZI_PRICE_INDEX_MAX * 100),
    }),
    fmt(G.info.prices, {
      categories: GLIZI_PRICED_CATEGORIES.map(
        (category) => CATEGORY_NAMES[category],
      ).join(', '),
    }),
    G.info.notPrices,
    fmt(G.info.rating, {
      hikeMin: GLIZI_PRICE_RATING_MIN * GLIZI_PRICE_HIKE_RATING_SCALE,
      hikeMax: GLIZI_PRICE_RATING_MAX * GLIZI_PRICE_HIKE_RATING_SCALE,
      dropMin: GLIZI_PRICE_RATING_MIN,
      dropMax: GLIZI_PRICE_RATING_MAX,
    }),
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {rows.map((text) => (
          <span key={text} className="text-[10px] leading-relaxed text-slate-400">
            {text}
          </span>
        ))}
      </div>
      <span
        className={`rounded-xl border px-3 py-2 font-mono text-[10px] font-bold tabular-nums ${
          pct > 0
            ? 'border-red-400/40 bg-red-500/10 text-red-300'
            : pct < 0
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
              : 'border-slate-700 text-slate-300'
        }`}
      >
        {pct === 0
          ? G.info.nowFlat
          : fmt(G.info.now, {
              scale: (career.gliziPriceIndex ?? 1).toFixed(2),
              pct: signedPct(pct),
            })}
      </span>
    </div>
  );
}
