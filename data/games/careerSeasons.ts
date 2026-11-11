export const SEASON_COUNT = 4;

// Seasons run in calendar order: Frozen (winter), Eggplant (spring),
// Summer (summer), Bloody (autumn). Values index into the studio theme
// arrays, whose data/games/locales/sr.json order is Frozen, Bloody, Summer, Eggplant.
export const SEASON_THEME_INDEX = [0, 3, 2, 1] as const;

// Who is in form when: each character is in form in one quarter of the
// offseason calendar's months (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec) at this
// chance, rolled from his name, the quarter weighted by these; the rest keep
// their lore season
export const SEASON_BUFF_CHANCE = 9 / 16;
export const SEASON_BUFF_WEIGHTS: readonly number[] = [3, 1, 3, 2];

export type SeasonPriceCategory =
  | 'training'
  | 'media'
  | 'guard'
  | 'sabotage'
  | 'investment';

export type SeasonPriceRule = {
  category: SeasonPriceCategory;
  // Percent swing on that category's price, or on its pay for media. Negative
  // makes it cheaper; the exact figure is rolled once per season in the range
  // and never lands on zero
  minPct: number;
  maxPct: number;
};

// One price rule per season in calendar order. Each leans one way, winter
// guards dearer, spring gyms cheaper, summer press richer, the autumn
// underworld cheaper, and each can still flip the other way some seasons
export const SEASON_PRICE_RULES: readonly SeasonPriceRule[] = [
  { category: 'guard', minPct: -10, maxPct: 35 },
  { category: 'training', minPct: -30, maxPct: 10 },
  { category: 'media', minPct: -10, maxPct: 35 },
  { category: 'sabotage', minPct: -35, maxPct: 10 },
];

// The rolled figure lands on whole percents, so two windows rarely read the same
export const SEASON_PRICE_STEP = 1;
