import { EPITHET_POOL_SIZE } from '@/lib/constants/characterNames';
import {
  characterNameProblem,
  nameSlug,
  normalizeCharacterName,
  uniqueSlug,
} from '@/lib/utils/characterNames';
import { generateNickname } from '@/lib/utils/nicknameGenerator';
import { seededRandom, textHash } from '@/lib/utils/seededRandom';
import { CUP_BRACKET_SIZE } from '@/lib/utils/tournamentSim';

// One character of a league. The slug is the id every table and save uses,
// the name is what the screens print and what the avatar is drawn from,
// the epithet indexes roster.epithets
export type LeagueEntry = { slug: string; name: string; epithet: number };

// A name's own epithet, moved along the pool past the ones the league
// already handed out
function freeEpithet(slug: string, used: ReadonlySet<number>): number {
  const start = textHash(`epithet|${slug}`) % EPITHET_POOL_SIZE;
  for (let step = 0; step < EPITHET_POOL_SIZE; step += 1) {
    const index = (start + step) % EPITHET_POOL_SIZE;
    if (!used.has(index)) return index;
  }
  return start;
}

function entryFor(name: string, others: readonly LeagueEntry[]): LeagueEntry {
  const clean = normalizeCharacterName(name);
  const slug = uniqueSlug(nameSlug(clean), new Set(others.map((e) => e.slug)));
  return {
    slug,
    name: clean,
    epithet: freeEpithet(slug, new Set(others.map((e) => e.epithet))),
  };
}

// The same seed always gives the same league, in seeding order
export function generateLeague(
  seed: number,
  length: number = CUP_BRACKET_SIZE,
): LeagueEntry[] {
  const random = seededRandom(seed);
  const league: LeagueEntry[] = [];
  while (league.length < length) {
    const name = generateNickname(random, new Set(league.map((e) => e.slug)));
    league.push(entryFor(name, league));
  }
  return league;
}

// The player's own name takes the place of `replaceSlug`, keeping its seed
export function withOwnName(
  league: readonly LeagueEntry[],
  name: string,
  replaceSlug: string,
): LeagueEntry[] {
  const others = league.filter((e) => e.slug !== replaceSlug);
  const entry = entryFor(name, others);
  return league.map((e) => (e.slug === replaceSlug ? entry : e));
}

// Null when the name can replace `replaceSlug`, else what is wrong with it
export function ownNameProblem(
  league: readonly LeagueEntry[],
  name: string,
  replaceSlug: string | null,
) {
  return characterNameProblem(
    name,
    league.filter((e) => e.slug !== replaceSlug).map((e) => e.slug),
  );
}

// The slot a written name replaces when the player has not picked one: the
// last of the league nobody plays
export function ownNameSlot(
  league: readonly LeagueEntry[],
  pickedSlugs: readonly string[],
): string | null {
  return [...league].reverse().find((e) => !pickedSlugs.includes(e.slug))?.slug ?? null;
}

function isLeagueEntry(value: unknown): value is LeagueEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<LeagueEntry>;
  return (
    typeof entry.slug === 'string' &&
    entry.slug.length > 0 &&
    typeof entry.name === 'string' &&
    entry.name.length > 0 &&
    typeof entry.epithet === 'number'
  );
}

export function isLeagueRoster(value: unknown): value is LeagueEntry[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(isLeagueEntry) &&
    new Set(value.map((e) => e.slug)).size === value.length
  );
}
