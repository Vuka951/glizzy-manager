import { ACTIVE_LOCALE, type Locale } from '@/data/games/locale';

// Serbian is written in Latin script here, so its collation is asked for by
// script: plain `sr` would sort as Cyrillic
const COLLATION: Record<Locale, string> = { en: 'en', sr: 'sr-Latn' };

export function compareLocalized(a: string, b: string): number {
  return a.localeCompare(b, COLLATION[ACTIVE_LOCALE]);
}
