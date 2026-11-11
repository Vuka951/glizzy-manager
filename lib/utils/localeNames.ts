import { seasonThemeIndex } from '@/lib/utils/cupSeason';
import type { HidingSpotId } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { characterBySlug, leagueEntryBySlug } from '@/lib/utils/duelCharacters';
import { textHash } from '@/lib/utils/seededRandom';

// Ids to words, read from the locale at call time. Screens only: the server
// stores and sends the ids

export function characterName(slug: string): string {
  return characterBySlug(slug).name;
}

export function characterEpithet(slug: string): string {
  const pool = GAMES_UI.roster.epithets;
  const index = leagueEntryBySlug(slug)?.epithet ?? textHash(`epithet|${slug}`);
  return pool[index % pool.length] ?? '';
}

export function sponsorName(id: string): string {
  return (GAMES_UI.career.sponsors.names as Record<string, string>)[id] ?? id;
}

// The last two names take the conjunction, the rest take commas
export function sponsorCoalitionName(ids: readonly string[]): string {
  const names = ids.map(sponsorName);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} ${GAMES_UI.shared.and} ${names[names.length - 1]}`;
}

export function trainingName(id: string): string {
  return (
    (GAMES_UI.career.trainings as Record<string, { name: string }>)[id]?.name ??
    id
  );
}

export function investmentName(id: string): string {
  return (GAMES_UI.career.investments.names as Record<string, string>)[id] ?? id;
}

export function seasonName(season: number): string {
  return GAMES_UI.cup.studio.themes[seasonThemeIndex(season)];
}

export function cupRoundName(round: number): string {
  return GAMES_UI.cup.roundNames[round] ?? '';
}

export function hidingSpotLabel(id: HidingSpotId): string {
  return GAMES_UI.duel.spots[id];
}
