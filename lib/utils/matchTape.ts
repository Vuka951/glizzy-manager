import { h2hFor } from '@/lib/utils/careerMatch';
import { matchWinChance } from '@/lib/utils/careerOdds';
import { isRivalMatch } from '@/lib/utils/careerRivals';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { buffedSlugsForSeason } from '@/lib/utils/cupSeason';

export type TapeBadge = 'inForm' | 'rival' | 'titleHolder';

export type TapeSide = {
  seed: number | null;
  // Implied win chance from the bookmaker odds, 0-100
  winPct: number | null;
  badges: TapeBadge[];
  // Wins and losses in this edition of the cup, null before the first one
  edition: [number, number] | null;
};

export type MatchTape = {
  a: TapeSide;
  b: TapeSide;
  // Wins oriented (a, b); null until the two have ever met
  h2h: [number, number] | null;
};

export function currentStreak(
  results: ('w' | 'l')[] | undefined,
): { kind: 'w' | 'l'; length: number } | null {
  if (!results?.length) return null;
  const kind = results[results.length - 1];
  let length = 0;
  for (let i = results.length - 1; i >= 0 && results[i] === kind; i--) length++;
  return { kind, length };
}

export function buildMatchTape(
  career: SavedCareer,
  slugA: string,
  slugB: string,
): MatchTape {
  const winPctA = Math.round(matchWinChance(career.characters, slugA, slugB) * 100);
  const buffed = buffedSlugsForSeason(career.season);
  const rival = isRivalMatch(career, slugA, slugB);
  const lastChampion =
    career.standingsHistory[career.standingsHistory.length - 1]?.champion ?? null;
  const sideFor = (slug: string, winPct: number): TapeSide => {
    const ch = career.characters[slug];
    const badges: TapeBadge[] = [];
    if (buffed.has(slug)) badges.push('inForm');
    if (rival) badges.push('rival');
    if (slug === lastChampion || (ch && ch.titles > 0 && ch.titleStreak > 0)) {
      badges.push('titleHolder');
    }
    const rank = career.cupStartRanks?.indexOf(slug) ?? -1;
    return {
      seed: rank >= 0 ? rank + 1 : null,
      winPct,
      badges,
      edition: ch?.editionRecord?.[career.season] ?? null,
    };
  };
  return {
    a: sideFor(slugA, winPctA),
    b: sideFor(slugB, 100 - winPctA),
    h2h: h2hFor(career.h2h, slugA, slugB),
  };
}
