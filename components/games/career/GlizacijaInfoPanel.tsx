import TypedNotice from '@/components/games/career/TypedNotice';
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
import { GLIZZY_BET_PAYOUTS } from '@/data/games/careerGlizzflationBets';
import { GAMES_UI } from '@/data/games/locale';
import { NOTICE_TEXT } from '@/lib/constants/typedNotice';
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
    fmt(G.info.bet, GLIZZY_BET_PAYOUTS),
  ];
  return (
    <TypedNotice className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {rows.map((text) => (
          <p key={text} className={NOTICE_TEXT}>
            {text}
          </p>
        ))}
      </div>
      <span
        className={`self-start rounded-[3px] border-2 border-current px-2 py-0.5 font-sign text-[15px] font-bold tabular-nums tracking-[0.02em] ${
          pct > 0
            ? 'text-red-300'
            : pct < 0
              ? 'text-emerald-300'
              : 'text-slate-300'
        }`}
      >
        {pct === 0
          ? G.info.nowFlat
          : fmt(G.info.now, {
              scale: (career.gliziPriceIndex ?? 1).toFixed(2),
              pct: signedPct(pct),
            })}
      </span>
    </TypedNotice>
  );
}
