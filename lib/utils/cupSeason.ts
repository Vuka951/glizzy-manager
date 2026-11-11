import { SEASON_THEME_INDEX } from '@/data/games/careerSeasons';
import { inFormSeason } from '@/lib/utils/characterTraits';

export const IN_FORM_STRESS_DROP = 20;
export const IN_FORM_GAIN_SCALE = 0.5;

export function seasonThemeIndex(season: number): number {
  return SEASON_THEME_INDEX[season] ?? 0;
}

export function buffedSlugsForSeason(
  season: number,
  slugs: readonly string[],
): Set<string> {
  return new Set(slugs.filter((slug) => inFormSeason(slug) === season));
}
