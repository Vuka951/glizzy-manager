import {
  type AchievementId,
  CAREER_LONG_YEAR,
  CAREER_LOST_CAUSE_DONATION,
  CAREER_MEDIA_PAYDAY,
  CAREER_RICH_BALANCE,
} from '@/data/games/achievements';
import { SEASON_COUNT } from '@/data/games/careerSeasons';
import { TRAINING_DEFS } from '@/data/games/careerTraining';
import { STAT_KEY_BY_TRAINING } from '@/lib/utils/careerMeters';
import type { CharacterCareerState, SavedCareer } from '@/lib/utils/careerSave';
import { CUP_BRACKET_SIZE, cupMatchWinner } from '@/lib/utils/tournamentSim';

function maxedTraining(ch: CharacterCareerState): boolean {
  return Object.values(TRAINING_DEFS).some((def) => {
    const key = STAT_KEY_BY_TRAINING[def.id];
    return def.leveled && key !== undefined && ch[key].level >= def.maxLevel;
  });
}

function investmentCount(ch: CharacterCareerState): number {
  return Object.values(ch.investments ?? {}).filter((n) => (n ?? 0) > 0).length;
}

function favorsUsed(state: SavedCareer): number {
  return state.parliament?.favorsUsed[state.playerSlug] ?? 0;
}

function donated(state: SavedCareer): number {
  return state.parliament?.donors[state.playerSlug] ?? 0;
}

function lastSlot(prev: SavedCareer, next: SavedCareer): string | null {
  if (next.slotLog.length <= prev.slotLog.length) return null;
  return next.slotLog[next.slotLog.length - 1].kind;
}

function wonWholeYear(state: SavedCareer): boolean {
  const recent = state.standingsHistory.slice(-SEASON_COUNT);
  if (recent.length < SEASON_COUNT) return false;
  const year = recent[0].year;
  return recent.every(
    (r) => r.year === year && r.champion === state.playerSlug,
  );
}

function beatRivalInCup(state: SavedCareer): boolean {
  const rival = state.rivalSlug;
  if (!rival || !state.cup) return false;
  return state.cup.rounds
    .flat()
    .some(
      (m) =>
        m.result &&
        ((m.a === state.playerSlug && m.b === rival) ||
          (m.a === rival && m.b === state.playerSlug)) &&
        cupMatchWinner(m) === state.playerSlug,
    );
}

// Every career trophy is a change between two saves of the same run, so the
// game only has to hand over the state before and after each update
export function careerAchievementsUnlocked(
  prev: SavedCareer,
  next: SavedCareer,
): AchievementId[] {
  if (prev.playerSlug !== next.playerSlug) return [];
  const before = prev.characters[prev.playerSlug];
  const after = next.characters[next.playerSlug];
  if (!before || !after) return [];
  const cupJustEnded = prev.phase === 'cup' && next.phase === 'podium';
  const lastCup = next.standingsHistory[next.standingsHistory.length - 1];
  const wonCup = cupJustEnded && lastCup?.champion === next.playerSlug;
  // Seeded in the bottom half of the bracket when the cup opened
  const bottomHalfSeed =
    (next.cupStartRanks?.indexOf(next.playerSlug) ?? -1) >=
    CUP_BRACKET_SIZE / 2;
  const slot = lastSlot(prev, next);
  // A count lands as one more election on the record, the same moment in
  // single player and in a room, where the server counts without a pending
  // result ever reaching the coach
  const electionCounted =
    (next.parliament?.elections ?? 0) > (prev.parliament?.elections ?? 0);

  const checks: [AchievementId, boolean][] = [
    ['career-first-title', after.titles > before.titles],
    ['career-perfect-year', wonCup && wonWholeYear(next)],
    [
      'career-overlord',
      Boolean(next.overlordWon) &&
        next.overlordSlug === next.playerSlug &&
        !prev.overlordWon,
    ],
    ['career-underdog', wonCup && bottomHalfSeed],
    ['career-rival-down', cupJustEnded && beatRivalInCup(next)],
    ['career-sponsored', !before.sponsor && Boolean(after.sponsor)],
    [
      'career-leader',
      after.partyStatus === 'leader' && before.partyStatus !== 'leader',
    ],
    ['career-favor', favorsUsed(next) > favorsUsed(prev)],
    ['career-donor', donated(next) > donated(prev)],
    [
      'career-lost-cause',
      electionCounted &&
        (next.parliament?.lastDonors[next.playerSlug] ?? 0) >=
          CAREER_LOST_CAUSE_DONATION &&
        after.partyStatus === 'opposition',
    ],
    [
      'career-investor',
      investmentCount(before) === 0 && investmentCount(after) > 0,
    ],
    [
      'career-rich',
      next.balance >= CAREER_RICH_BALANCE && prev.balance < CAREER_RICH_BALANCE,
    ],
    ['career-maxed', !maxedTraining(before) && maxedTraining(after)],
    [
      'career-media-payday',
      slot === 'media' && next.balance - prev.balance >= CAREER_MEDIA_PAYDAY,
    ],
    ['career-plot-hit', (after.hitRecency ?? 0) > (before.hitRecency ?? 0)],
    // A crew comes out of the wallet, not the month, so it never logs a slot
    ['career-guard', !prev.guarded && Boolean(next.guarded)],
    ['career-island', slot === 'island'],
    ['career-meltdown', after.meltdowns > before.meltdowns],
    [
      'career-decade',
      next.year >= CAREER_LONG_YEAR && prev.year < CAREER_LONG_YEAR,
    ],
  ];
  return checks.filter(([, hit]) => hit).map(([id]) => id);
}
