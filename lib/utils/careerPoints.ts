import {
  OVERLORD_POINT_OPTIONS,
  OVERLORD_POINTS,
  POINTS_FAME_DIVISOR,
  POINTS_PER_LOSS,
  POINTS_PER_TITLE,
  POINTS_PER_WIN,
  type OverlordPoints,
} from '@/data/games/careerEconomy';
import { tableBonusFor } from '@/data/games/careerElections';
import type { CharacterCareerState, SavedCareer } from '@/lib/utils/careerSave';

export function careerPoints(ch: CharacterCareerState): number {
  return (
    ch.titles * POINTS_PER_TITLE +
    ch.wins * POINTS_PER_WIN +
    ch.losses * POINTS_PER_LOSS +
    Math.round(ch.fame / POINTS_FAME_DIVISOR) +
    (ch.sponsor ? tableBonusFor(ch.partyStatus) : 0)
  );
}

// Table order doubles as cup seeding. Everyone starts at zero; on a full tie
// the comeback player seeds last and the rest fall back to a stable order.
// A shared league passes every human slug and they all sort last together
export function rankBySeeding(
  characters: Record<string, CharacterCareerState>,
  playerSlug?: string | ReadonlySet<string>,
): string[] {
  const isHuman = (slug: string) =>
    typeof playerSlug === 'string'
      ? slug === playerSlug
      : (playerSlug?.has(slug) ?? false);
  return Object.keys(characters).sort((x, y) => {
    const a = characters[x];
    const b = characters[y];
    return (
      careerPoints(b) - careerPoints(a) ||
      b.titles - a.titles ||
      b.wins - a.wins ||
      a.losses - b.losses ||
      (isHuman(x) ? 1 : 0) - (isHuman(y) ? 1 : 0) ||
      x.localeCompare(y)
    );
  });
}

// The tie-break a save's table uses: the one player, or every human coach
// in a shared league
export function seedingKey(state: {
  playerSlug: string;
  humanSlugs?: string[];
}): string | ReadonlySet<string> {
  return state.humanSlugs ? new Set(state.humanSlugs) : state.playerSlug;
}

export function isHumanSlug(
  state: { playerSlug: string; humanSlugs?: string[] },
  slug: string,
): boolean {
  return state.humanSlugs
    ? state.humanSlugs.includes(slug)
    : slug === state.playerSlug;
}

// Who holds the crown in a finished campaign, reading the old player-only
// flag as the player's crown
export function campaignOverlord(state: SavedCareer): string | null {
  return state.overlordSlug ?? (state.overlordWon ? state.playerSlug : null);
}

// The campaign is over: somebody took the crown, or a party voted itself
// one-party rule
export function campaignFinished(state: SavedCareer): boolean {
  return campaignOverlord(state) !== null || Boolean(state.parliament?.constitution);
}

export function isOverlordPoints(value: unknown): value is OverlordPoints {
  return OVERLORD_POINT_OPTIONS.some((points) => points === value);
}

// What the crown costs in this campaign; saves without the pick play the
// short one
export function overlordGoal(state: {
  overlordPoints?: OverlordPoints;
}): OverlordPoints {
  return state.overlordPoints ?? OVERLORD_POINTS;
}

// Whoever has the crown's points, whoever they are; when several cross the
// line in the same window the table order settles it, highest first
export function crownedLeader(
  characters: Record<string, CharacterCareerState>,
  playerSlug?: string | ReadonlySet<string>,
  goal: OverlordPoints = OVERLORD_POINTS,
): string | null {
  return (
    rankBySeeding(characters, playerSlug).find(
      (slug) => careerPoints(characters[slug]) >= goal,
    ) ?? null
  );
}
