import {
  SEASON_PRICE_RULES,
  SEASON_PRICE_STEP,
  type SeasonPriceCategory,
  type SeasonPriceRule,
} from '@/data/games/careerSeasons';
import type { SavedCareer } from '@/lib/utils/careerSave';

type SeasonPriceState = Pick<
  SavedCareer,
  'year' | 'season' | 'seasonPricePct' | 'gliziPriceIndex'
>;

// Every category the glizi market moves: what the city charges, not what
// the press pays out
export const GLIZI_PRICED_CATEGORIES: SeasonPriceCategory[] = [
  'training',
  'guard',
  'sabotage',
  'investment',
];

// Where the glizi market stands against the day the career opened, in whole
// percent, signed
export function gliziPricePct(state: SeasonPriceState): number {
  return Math.round(((state.gliziPriceIndex ?? 1) - 1) * 100);
}

// The first window of the career, before the first cup: the market sits
// still and nothing costs more or less than the list price
export function isOpeningWindow(year: number, season: number): boolean {
  return year === 1 && season === 0;
}

export function seasonPriceRule(season: number): SeasonPriceRule {
  return SEASON_PRICE_RULES[season] ?? SEASON_PRICE_RULES[0];
}

// A fresh figure inside the season's range, on the step grid. Zero is left
// out, so every season moves its price one way or the other
export function rollSeasonPricePct(season: number, year: number): number {
  if (isOpeningWindow(year, season)) return 0;
  const { minPct, maxPct } = seasonPriceRule(season);
  const steps = Math.round((maxPct - minPct) / SEASON_PRICE_STEP);
  const grid = Array.from(
    { length: steps + 1 },
    (_, i) => minPct + i * SEASON_PRICE_STEP,
  ).filter((pct) => pct !== 0);
  return grid[Math.floor(Math.random() * grid.length)];
}

// A rolled figure that runs against the way its season's range leans
export function seasonPriceAgainstLean(season: number, pct: number): boolean {
  const { minPct, maxPct } = seasonPriceRule(season);
  return Math.sign(pct) !== Math.sign(minPct + maxPct);
}

// Saves from before the rule existed sit on the middle of the range
export function seasonPricePct(state: SeasonPriceState): number {
  if (isOpeningWindow(state.year, state.season)) return 0;
  if (state.seasonPricePct !== undefined) return state.seasonPricePct;
  const { minPct, maxPct } = seasonPriceRule(state.season);
  return (
    Math.round((minPct + maxPct) / 2 / SEASON_PRICE_STEP) * SEASON_PRICE_STEP
  );
}

// The season's swing on one category: the rolled figure when the season's
// rule is about that category, nothing otherwise
export function seasonPricePctFor(
  state: SeasonPriceState,
  category: SeasonPriceCategory,
): number {
  return seasonPriceRule(state.season).category === category
    ? seasonPricePct(state)
    : 0;
}

// The year's figures with this window's roll written in
export function withSeasonPriceRoll(
  byYear: Record<number, number[]> | undefined,
  year: number,
  season: number,
  pct: number,
): Record<number, number[]> {
  const row = [...(byYear?.[year] ?? [])];
  row[season] = pct;
  return { ...byYear, [year]: row };
}

// The season's rule on its category, and on top of it the glizi market's
// compounded index on everything the city sells
export function seasonPriceScale(
  state: SeasonPriceState,
  category: SeasonPriceCategory,
): number {
  const glizi = GLIZI_PRICED_CATEGORIES.includes(category)
    ? (state.gliziPriceIndex ?? 1)
    : 1;
  if (seasonPriceRule(state.season).category !== category) return glizi;
  return (1 + seasonPricePct(state) / 100) * glizi;
}

// Media is the one category where a higher figure is good news
export function seasonPriceFavorable(
  category: SeasonPriceCategory,
  pct: number,
): boolean {
  return category === 'media' ? pct > 0 : pct < 0;
}
