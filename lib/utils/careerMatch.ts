import {
  fullnessDropForLevel,
  livesForLevel,
  seekAvoidanceForLevel,
} from '@/data/games/careerTraining';
import type { CharacterCareerState, SavedCareer } from '@/lib/utils/careerSave';
import { applyMatchOutcome } from '@/lib/utils/careerMeters';
import {
  IN_FORM_GAIN_SCALE,
  buffedSlugsForSeason,
} from '@/lib/utils/cupSeason';
import {
  FORFEIT_EVENT_KINDS,
  profileFor,
  resultHadTiebreak,
  type CupMatchResult,
  type MatchParticipant,
} from '@/lib/utils/tournamentSim';

const RECENT_RESULTS_CAP = 5;

// Below these, motivation becomes a match problem of its own
export const LOW_MORALE_THRESHOLD = 15;
const LOW_MORALE_WALKOVER_CHANCE = 0.2;
const LOW_EGO_STRESS_BUMP = 8;

export function participantFor(
  career: SavedCareer,
  slug: string,
  opts?: {
    scriptedForfeit?: 'police' | 'withdrawn' | 'removed' | null;
  },
): MatchParticipant {
  const ch = career.characters[slug];
  const buffed = buffedSlugsForSeason(career.season).has(slug);
  const lowMorale =
    (ch?.ego ?? 50) < LOW_MORALE_THRESHOLD ||
    (ch?.ambition ?? 50) < LOW_MORALE_THRESHOLD;
  const nervous = (ch?.ego ?? 50) < LOW_MORALE_THRESHOLD;
  const participant: MatchParticipant = {
    profile: profileFor(slug),
    lives: livesForLevel(ch?.livesCap.level ?? 0),
    stress: Math.min(
      100,
      (ch?.stress ?? 35) + (nervous ? LOW_EGO_STRESS_BUMP : 0),
    ),
    appetite: ch?.appetite ?? 50,
    fullnessDrop: fullnessDropForLevel(ch?.nutrition.level ?? 0),
  };
  if (
    !opts?.scriptedForfeit &&
    lowMorale &&
    Math.random() < LOW_MORALE_WALKOVER_CHANCE
  ) {
    participant.scriptedForfeit = 'withdrawn';
  }
  const avoidance = seekAvoidanceForLevel(ch?.njuh.level ?? 0);
  if (avoidance !== undefined) participant.seekAvoidance = avoidance;
  if (buffed) {
    participant.stressGainScale = IN_FORM_GAIN_SCALE;
  }
  if (opts?.scriptedForfeit) participant.scriptedForfeit = opts.scriptedForfeit;
  return participant;
}

// Fold one resolved match into both characters' career states; the season
// books the result into each man's record for this edition of the cup
export function applyMatchToCharacters(
  characters: Record<string, CharacterCareerState>,
  slugA: string,
  slugB: string,
  result: CupMatchResult,
  season?: number,
): Record<string, CharacterCareerState> {
  const next = { ...characters };
  const sides = [
    { slug: slugA, side: 'a' as const },
    { slug: slugB, side: 'b' as const },
  ];
  for (const { slug, side } of sides) {
    const ch = next[slug];
    if (!ch) continue;
    const won = result.winner === side;
    const forfeitedBySide =
      result.reason &&
      !won &&
      (result.events?.some(
        (e) => e.side === side && FORFEIT_EVENT_KINDS.has(e.kind),
      ) ??
        true);
    const applied = applyMatchOutcome(ch, {
      won,
      exitStress:
        side === 'a'
          ? (result.exit?.stressA ?? ch.stress)
          : (result.exit?.stressB ?? ch.stress),
      exitAppetite:
        side === 'a'
          ? (result.exit?.appetiteA ?? ch.appetite)
          : (result.exit?.appetiteB ?? ch.appetite),
      reason: forfeitedBySide ? (result.reason ?? null) : null,
    });
    next[slug] = {
      ...applied,
      eaten:
        (ch.eaten ?? 0) +
        result.turns.filter((t) => t.seeker === side && t.hit).length,
      recentResults: [
        ...(ch.recentResults ?? []),
        won ? ('w' as const) : ('l' as const),
      ].slice(-RECENT_RESULTS_CAP),
      ...(season === undefined
        ? {}
        : { editionRecord: bookEdition(ch.editionRecord, season, won) }),
      turnsPlayed: (ch.turnsPlayed ?? 0) + result.turns.length,
      tiebreaks: (ch.tiebreaks ?? 0) + (resultHadTiebreak(result) ? 1 : 0),
    };
  }
  return next;
}

function bookEdition(
  record: CharacterCareerState['editionRecord'],
  season: number,
  won: boolean,
): NonNullable<CharacterCareerState['editionRecord']> {
  const [wins, losses] = record?.[season] ?? [0, 0];
  return { ...record, [season]: [wins + (won ? 1 : 0), losses + (won ? 0 : 1)] };
}

function h2hKey(slugA: string, slugB: string): string {
  return [slugA, slugB].sort().join('|');
}

export function applyH2h(
  h2h: Record<string, [number, number]> | undefined,
  slugA: string,
  slugB: string,
  winnerSlug: string,
): Record<string, [number, number]> {
  const key = h2hKey(slugA, slugB);
  const [first] = key.split('|');
  const [winsFirst, winsSecond] = h2h?.[key] ?? [0, 0];
  const wonByFirst = winnerSlug === first;
  return {
    ...(h2h ?? {}),
    [key]: [
      winsFirst + (wonByFirst ? 1 : 0),
      winsSecond + (wonByFirst ? 0 : 1),
    ],
  };
}

// Wins oriented to the (slugA, slugB) order asked for; null before any meeting
export function h2hFor(
  h2h: Record<string, [number, number]> | undefined,
  slugA: string,
  slugB: string,
): [number, number] | null {
  const key = h2hKey(slugA, slugB);
  const record = h2h?.[key];
  if (!record) return null;
  const [first] = key.split('|');
  return first === slugA ? record : [record[1], record[0]];
}

