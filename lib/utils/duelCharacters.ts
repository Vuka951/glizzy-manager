import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { CHARACTER_ROSTER } from '@/data/games/roster';

export function characterBySlug(slug: string): DuelCharacter {
  const found = CHARACTER_ROSTER.find((character) => character.slug === slug);
  return {
    slug,
    name: found?.name ?? slug,
    portrait: found?.portrait ?? null,
  };
}
