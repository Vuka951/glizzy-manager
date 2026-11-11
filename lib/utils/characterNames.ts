import {
  CHARACTER_NAME_MAX_LENGTH,
  CHARACTER_NAME_MIN_LENGTH,
  CHARACTER_NAME_PATTERN,
  BLOCKED_NAME_HASHES,
  NAME_FORBIDDEN_PARTS,
} from '@/lib/constants/characterNames';
import { textHash } from '@/lib/utils/seededRandom';

export type CharacterNameProblem = 'short' | 'long' | 'letters' | 'taken';

// Spaces trimmed and collapsed, composed form, so the same typed name is
// always the same name
export function normalizeCharacterName(raw: string): string {
  return raw.normalize('NFC').trim().replace(/\s+/g, ' ');
}

// The name in plain lowercase ascii: diacritics folded, đ as dj, every run
// of spaces or punctuation one dash
export function nameSlug(name: string): string {
  return normalizeCharacterName(name)
    .toLowerCase()
    .replaceAll('đ', 'dj')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// A second name that folds to a slug already in the league gets -2, -3. A
// slug that is a built-in object key (constructor) would read back from every
// slug-keyed record, so it counts as taken
export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  const isTaken = (slug: string) => taken.has(slug) || slug in Object.prototype;
  if (!isTaken(base)) return base;
  let n = 2;
  while (isTaken(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

// Readable stand-in for a slug nobody registered a name for
export function nameFromSlug(slug: string): string {
  return slug
    .replace(/-\d+$/, '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function plainWords(name: string): string[] {
  return nameSlug(name).split('-').filter(Boolean);
}

function isBlockedWord(word: string): boolean {
  if (BLOCKED_NAME_HASHES.has(textHash(word))) return true;
  for (let end = 4; end < word.length; end += 1) {
    if (BLOCKED_NAME_HASHES.has(textHash(word.slice(0, end)))) return true;
  }
  return false;
}

export function isBlockedName(name: string): boolean {
  const words = plainWords(name);
  const joined = words.join('');
  return (
    words.some(isBlockedWord) || NAME_FORBIDDEN_PARTS.some((part) => joined.includes(part))
  );
}

// What is wrong with a name a player wrote, or null when it can play. The
// league's other names are compared by slug, so Đole and Djole are one name
export function characterNameProblem(
  name: string,
  otherSlugs: readonly string[],
): CharacterNameProblem | null {
  const clean = normalizeCharacterName(name);
  if (clean.length < CHARACTER_NAME_MIN_LENGTH) return 'short';
  if (clean.length > CHARACTER_NAME_MAX_LENGTH) return 'long';
  if (!CHARACTER_NAME_PATTERN.test(clean) || nameSlug(clean).length === 0) {
    return 'letters';
  }
  if (otherSlugs.includes(nameSlug(clean))) return 'taken';
  return null;
}
