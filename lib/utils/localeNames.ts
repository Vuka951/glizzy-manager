import { seasonThemeIndex } from '@/lib/utils/cupSeason';
import type { HidingSpotId } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { CHARACTER_ROSTER } from '@/data/games/roster';

// Ids to words, read from the locale at call time. Screens only: the server
// stores and sends the ids

const CHARACTER_NAMES = new Map(CHARACTER_ROSTER.map((c) => [c.slug, c.name]));

export function characterName(slug: string): string {
  return CHARACTER_NAMES.get(slug) ?? slug;
}

export function characterEpithet(slug: string): string {
  return (GAMES_UI.roster.epithets as Record<string, string>)[slug] ?? '';
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
