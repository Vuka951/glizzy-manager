import { SEASON_COUNT, SEASON_PRICE_RULES } from '@/data/games/careerSeasons';
import { GAMES_UI } from '@/data/games/locale';
import type { SavedCareer } from '@/lib/utils/careerSave';
import {
  seasonPriceFavorable,
  isOpeningWindow,
  seasonPricePct,
  seasonPriceRule,
} from '@/lib/utils/careerSeasonPrices';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt, signedPct } from '@/lib/utils/format';

const SP = GAMES_UI.career.offseason.seasonPrices;

// Winter, spring, summer, autumn tints, matching the calendar rows
const SEASON_TINTS = [
  'border-slate-100/25 bg-slate-100/10',
  'border-purple-400/25 bg-purple-500/10',
  'border-amber-300/15 bg-amber-500/5',
  'border-orange-300/15 bg-orange-500/5',
];

export function seasonPriceDirection(
  category: (typeof SEASON_PRICE_RULES)[number]['category'],
  pct: number
): string {
  if (category === 'media') return pct > 0 ? SP.paysMore : SP.paysLess;
  return pct < 0 ? SP.cheaper : SP.pricier;
}

// The four price rules side by side, with this season's rolled figure called
// out, so the calendar can be planned around what gets cheap when
export default function SeasonPriceInfoPanel({
  career,
}: {
  career: SavedCareer;
}) {
  const currentPct = seasonPricePct(career);
  return (
    <div className="flex flex-col gap-2.5 text-left">
      <p className="text-[11px] leading-relaxed text-slate-400">{SP.intro}</p>
      {Array.from({ length: SEASON_COUNT }, (_, season) => {
        const rule = seasonPriceRule(season);
        const isCurrent = season === career.season;
        return (
          <div
            key={season}
            className={`flex flex-col gap-1 rounded-2xl border p-3 ${SEASON_TINTS[season]} ${
              isCurrent ? 'ring-1 ring-sky-300/40' : ''
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">
              {seasonName(season)}
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-300">
              {fmt(SP.range, {
                category: SP.categories[rule.category],
                min: signedPct(rule.minPct).replace('%', ''),
                max: signedPct(rule.maxPct),
              })}
            </span>
            {isCurrent && (
              <span
                className={`font-mono text-[10px] font-bold ${
                  isOpeningWindow(career.year, season)
                    ? 'text-sky-300'
                    : seasonPriceFavorable(rule.category, currentPct)
                      ? 'text-emerald-300'
                      : 'text-red-300'
                }`}
              >
                {isOpeningWindow(career.year, season)
                  ? SP.none
                  : fmt(SP.current, {
                      pct: Math.abs(currentPct),
                      direction: seasonPriceDirection(
                        rule.category,
                        currentPct
                      ),
                    })}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
