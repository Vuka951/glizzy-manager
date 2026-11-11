import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { nameFromSlug } from '@/lib/utils/characterNames';
import type { LeagueEntry } from '@/lib/utils/leagueRoster';

// Every league the page has shown, by slug. The screens deal in slugs and
// read names back from here, so whatever mounts a league registers it first
const KNOWN = new Map<string, LeagueEntry>();

export function registerLeague(league: readonly LeagueEntry[]): void {
  league.forEach((entry) => {
    const known = KNOWN.get(entry.slug);
    if (known?.name !== entry.name || known.epithet !== entry.epithet) {
      KNOWN.set(entry.slug, entry);
    }
  });
}

export function leagueEntryBySlug(slug: string): LeagueEntry | null {
  return KNOWN.get(slug) ?? null;
}

export function characterBySlug(slug: string): DuelCharacter {
  return { slug, name: KNOWN.get(slug)?.name ?? nameFromSlug(slug) };
}

export function leagueCharacters(league: readonly LeagueEntry[]): DuelCharacter[] {
  registerLeague(league);
  return league.map(({ slug, name }) => ({ slug, name }));
}
