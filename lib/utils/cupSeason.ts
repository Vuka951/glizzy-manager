import {
  SEASON_BUFF_ROSTERS,
  SEASON_THEME_INDEX,
} from '@/data/games/careerSeasons';

export const IN_FORM_STRESS_DROP = 20;
export const IN_FORM_GAIN_SCALE = 0.5;

export function seasonThemeIndex(season: number): number {
  return SEASON_THEME_INDEX[season] ?? 0;
}

export function buffedSlugsForSeason(season: number): Set<string> {
  return new Set(SEASON_BUFF_ROSTERS[season] ?? []);
}
