import {
  COALITION_COUNTDOWN_PRESETS,
  LAWS_COUNTDOWN_PRESETS,
} from '@/lib/constants/careerMp';
import { COUNTDOWN_PRESETS } from '@/lib/constants/rooms';
import { DEFAULT_SETTINGS, type Room } from '@/lib/server/career-mp/room';
import { deadlineFor } from '@/lib/server/rooms/presence';
import type { RoomSettings } from '@/lib/types/careerMp';
import { isOverlordPoints } from '@/lib/utils/careerPoints';
import { isLeagueRoster } from '@/lib/utils/leagueRoster';
import { CUP_BRACKET_SIZE } from '@/lib/utils/tournamentSim';
import {
  currentLawMail,
  currentParliament,
} from '@/lib/utils/careerRetiredLaws';
import {
  withoutRetiredFeatures,
  withoutRetiredSettings,
  withoutRetiredStories,
} from '@/lib/utils/careerRetiredFeatures';
import { OVERLORD_POINTS } from '@/data/games/careerEconomy';

function countdown(
  value: unknown,
  fallback: number | null,
  presets: (number | null)[] = COUNTDOWN_PRESETS,
): number | null {
  if (value === null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  if (n <= 0) return null;
  // Only the lobby presets are accepted, so a room cannot be set to a
  // countdown nobody can read
  return presets.includes(n) ? n : fallback;
}

export function normalizeSettings(input: Partial<RoomSettings>): RoomSettings {
  const linger = Number(input.matchLingerSeconds);
  return {
    windowSeconds: countdown(input.windowSeconds, DEFAULT_SETTINGS.windowSeconds),
    paperSeconds: countdown(input.paperSeconds, DEFAULT_SETTINGS.paperSeconds),
    preRoundSeconds: countdown(
      input.preRoundSeconds,
      DEFAULT_SETTINGS.preRoundSeconds,
    ),
    matchBetSeconds: countdown(
      input.matchBetSeconds,
      DEFAULT_SETTINGS.matchBetSeconds,
    ),
    seasonEndSeconds: countdown(
      input.seasonEndSeconds,
      DEFAULT_SETTINGS.seasonEndSeconds,
    ),
    coalitionSeconds:
      input.coalitionSeconds === undefined
        ? DEFAULT_SETTINGS.coalitionSeconds
        : countdown(
            input.coalitionSeconds,
            DEFAULT_SETTINGS.coalitionSeconds ?? null,
            COALITION_COUNTDOWN_PRESETS,
          ),
    lawsSeconds:
      input.lawsSeconds === undefined
        ? DEFAULT_SETTINGS.lawsSeconds
        : countdown(
            input.lawsSeconds,
            DEFAULT_SETTINGS.lawsSeconds ?? null,
            LAWS_COUNTDOWN_PRESETS,
          ),
    matchLingerSeconds:
      Number.isFinite(linger) && linger >= 0 && linger <= 60
        ? linger
        : DEFAULT_SETTINGS.matchLingerSeconds,
    overlordPoints: isOverlordPoints(input.overlordPoints)
      ? input.overlordPoints
      : OVERLORD_POINTS,
  };
}

// A room stored before a law, the plots or the state of emergency left the
// game reads without them. A roll call whose card was dropped goes back to
// the pick and a room parked on the plot vote opens its window. A room from
// the fixed roster, before leagues were generated, has no names to show and
// reads as gone, and so does one drawn for the short-lived twenty-name league
export function currentRoom(room: Room | null): Room | null {
  if (
    !room ||
    !isLeagueRoster(room.roster) ||
    room.roster.length !== CUP_BRACKET_SIZE
  )
    return null;
  const settings = withoutRetiredSettings(room.settings);
  const stored = room.phase as Room['phase'] | { kind: 'grand' };
  const phase: Room['phase'] =
    stored.kind === 'grand'
      ? {
          kind: 'window',
          deadline: deadlineFor(settings.windowSeconds, Date.now()),
        }
      : (stored as Room['phase']);
  const league = room.league && withoutRetiredFeatures(room.league);
  if (!league) return { ...room, settings, phase };
  const parliament = league.parliament && currentParliament(league.parliament);
  const coachStates = Object.fromEntries(
    Object.entries(league.coachStates).map(([id, cs]) => [
      id,
      {
        ...cs,
        mail: currentLawMail(withoutRetiredStories(cs.mail)),
        cupRecap: withoutRetiredStories(cs.cupRecap),
        ledger: cs.ledger.filter((e) => (e.category as string) !== 'grand'),
      },
    ]),
  );
  const repicked =
    phase.kind === 'laws' && parliament?.lawBallot?.pick === null;
  return {
    ...room,
    settings,
    league: { ...league, ...(parliament ? { parliament } : {}), coachStates },
    phase: repicked && phase.kind === 'laws' ? { ...phase, stage: 'pick' } : phase,
  };
}
