import type { Room } from '@/lib/server/career-mp/room';
import { ActionError } from '@/lib/server/rooms/errors';
import {
  generateLeague,
  ownNameProblem,
  ownNameSlot,
  withOwnName,
  type LeagueEntry,
} from '@/lib/utils/leagueRoster';

export function pickedSlugs(room: Room): string[] {
  return Object.values(room.coaches).flatMap((c) => (c.slug ? [c.slug] : []));
}

// New faces from a new seed. Every picked character stays where he stood,
// the free places take the new names in order
export function rerolledRoster(room: Room, seed: number): LeagueEntry[] {
  const picked = new Set(pickedSlugs(room));
  const keptEpithets = new Set(
    room.roster.filter((e) => picked.has(e.slug)).map((e) => e.epithet),
  );
  const fresh = generateLeague(seed, room.roster.length + picked.size).filter(
    (e) => !picked.has(e.slug),
  );
  let next = room.roster.map((e) => (picked.has(e.slug) ? e : fresh.shift() ?? e));
  // A fresh face written in again against the whole league takes an epithet
  // no kept character carries
  next
    .filter((e) => !picked.has(e.slug) && keptEpithets.has(e.epithet))
    .forEach((e) => {
      next = withOwnName(next, e.name, e.slug);
    });
  return next;
}

// A coach writes his own man in: over his pick if he has one, else over the
// last free face of the table. Returns the new league and the slug he sits on
export function namedRoster(
  room: Room,
  coachId: string,
  rawName: unknown,
): { roster: LeagueEntry[]; slug: string } {
  if (typeof rawName !== 'string') throw new ActionError('bad-character-name');
  const replaceSlug =
    room.coaches[coachId].slug ?? ownNameSlot(room.roster, pickedSlugs(room));
  if (!replaceSlug) throw new ActionError('character-taken', 409);
  const problem = ownNameProblem(room.roster, rawName, replaceSlug);
  if (problem === 'taken') throw new ActionError('character-name-taken', 409);
  if (problem) throw new ActionError('bad-character-name');
  const index = room.roster.findIndex((e) => e.slug === replaceSlug);
  const roster = withOwnName(room.roster, rawName, replaceSlug);
  return { roster, slug: roster[index].slug };
}
