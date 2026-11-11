import { SEASON_COUNT, SEASON_PRICE_RULES } from '@/data/games/careerSeasons';
import { GAMES_UI } from '@/data/games/locale';
import { NOTICE_TEXT } from '@/lib/constants/typedNotice';
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

export function seasonPriceDirection(
  category: (typeof SEASON_PRICE_RULES)[number]['category'],
  pct: number
): string {
  if (category === 'media') return pct > 0 ? SP.paysMore : SP.paysLess;
  return pct < 0 ? SP.cheaper : SP.pricier;
}

// The four price rules as a typed price list, the current season's line marked
// with a highlighter and its rolled figure, so the calendar can be planned
// around what gets cheap when
export default function SeasonPriceInfoPanel({
  career,
}: {
  career: SavedCareer;
}) {
  const currentPct = seasonPricePct(career);
  return (
    <div className="flex flex-col gap-2 text-left">
      <p className={NOTICE_TEXT}>{SP.intro}</p>
      <div className="flex flex-col border-t border-[#1c1408]/40">
        {Array.from({ length: SEASON_COUNT }, (_, season) => {
          const rule = seasonPriceRule(season);
          const isCurrent = season === career.season;
          return (
            <div
              key={season}
              className={`flex flex-wrap items-baseline justify-between gap-x-3 border-b border-[#1c1408]/25 px-1 py-1 ${
                isCurrent ? 'bg-[#fde047]/55' : ''
              }`}
            >
              <span className="font-serif text-[13px] font-bold text-slate-100">
                {seasonName(season)}
              </span>
              <span className="font-sign text-[14px] font-semibold tabular-nums tracking-[0.02em] text-slate-300">
                {fmt(SP.range, {
                  category: SP.categories[rule.category],
                  min: signedPct(rule.minPct).replace('%', ''),
                  max: signedPct(rule.maxPct),
                })}
              </span>
              {isCurrent && (
                <span
                  className={`w-full font-sign text-[14px] font-bold tabular-nums tracking-[0.02em] ${
                    isOpeningWindow(career.year, season)
                      ? 'text-slate-300'
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
    </div>
  );
}
