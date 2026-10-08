import type {
  CoachState,
  LeagueState,
} from '@/lib/server/career-mp/room';
import type {
  CareerPhase,
  SavedCareer,
  SeasonRecord,
} from '@/lib/utils/careerSave';

// The slug the shared league plays under when no coach is in the chair
export const LEAGUE_SLUG = '__league__';

function rivalOf(league: LeagueState): Record<string, string> {
  const out: Record<string, string> = {};
  Object.values(league.coachStates).forEach((cs) => {
    if (cs.rivalSlug) out[cs.slug] = cs.rivalSlug;
  });
  return out;
}

function humanGuards(league: LeagueState): Record<string, number> {
  const out: Record<string, number> = {};
  Object.values(league.coachStates).forEach((cs) => {
    if (cs.guarded && cs.guardChance !== undefined) out[cs.slug] = cs.guardChance;
  });
  return out;
}

function standingsFor(
  league: LeagueState,
  coachId: string | null,
): SeasonRecord[] {
  return league.standingsHistory.map((record) => ({
    year: record.year,
    season: record.season,
    champion: record.champion,
    playerPlace: coachId ? (record.places[coachId] ?? 0) : 0,
    ranks: record.ranks,
    points: record.points,
  }));
}

function sharedFields(league: LeagueState) {
  return {
    version: 1 as const,
    year: league.year,
    season: league.season,
    characters: league.characters,
    pendingSabotages: league.pendingSabotages,
    newsQueue: league.newsQueue,
    lastIssue: league.lastIssue,
    h2h: league.h2h,
    pendingPolice: league.pendingPolice,
    aiGuarded: league.aiGuarded,
    parliament: league.parliament,
    seasonPricePct: league.seasonPricePct,
    seasonPriceByYear: league.seasonPriceByYear,
    gliziPricePct: league.gliziPricePct,
    gliziPriceIndex: league.gliziPriceIndex,
    gliziPriceHistory: league.gliziPriceHistory,
    lastCupRanks: league.lastCupRanks,
    cupStartRanks: league.cupStartRanks,
    overlordSlug: league.overlordSlug,
    humanSlugs: league.humanSlugs,
    rivalOf: rivalOf(league),
    humanGuards: humanGuards(league),
  };
}

// The league with nobody in the chair: what the AI window, the plots and the
// cup simulation run over. Every human is just a slug in humanSlugs
export function sharedCareer(
  league: LeagueState,
  phase: CareerPhase = 'offseason',
): SavedCareer {
  return {
    ...sharedFields(league),
    playerSlug: LEAGUE_SLUG,
    phase,
    slotsUsed: 0,
    slotLog: [],
    balance: 0,
    mail: [],
    cup: league.cup
      ? {
          rounds: league.cup.rounds,
          currentRound: league.cup.currentRound,
          matchBets: {},
          withdrawn: false,
          removals: league.cup.removals,
          removed: league.cup.removed,
        }
      : null,
    standingsHistory: standingsFor(league, null),
    rivalSlug: null,
    saboteursThisYear: [],
  };
}

// One coach's view of the same league, in the exact single-player shape so
// every existing component and helper reads it unchanged
export function careerFor(
  league: LeagueState,
  coachId: string,
  phase: CareerPhase = 'offseason',
): SavedCareer {
  const cs = league.coachStates[coachId];
  const league_ = sharedFields(league);
  // The morning-after paper: the league's head and tail with this coach's
  // own stories in between, same shape as the single-player recap
  const recap = [
    ...league.leagueRecap.head,
    ...cs.cupRecap,
    ...league.leagueRecap.tail,
  ].slice(0, 8);
  const lastIssue =
    league.lastIssue && league.lastIssueRecap
      ? { ...league.lastIssue, news: recap }
      : league.lastIssue;
  return {
    ...league_,
    lastIssue,
    playerSlug: cs.slug,
    phase,
    slotsUsed: cs.slotsUsed,
    slotLog: cs.slotLog,
    logsByYear: cs.logsByYear,
    balance: cs.balance,
    mail: cs.mail,
    mediaUses: cs.mediaUses,
    guarded: cs.guarded,
    guardChance: cs.guardChance,
    betStake: cs.betStake,
    islandYear: cs.islandYear,
    islandSeason: cs.islandSeason,
    korpVendetta: cs.korpVendetta,
    rivalSlug: cs.rivalSlug,
    rivalChoice: cs.rivalChoice,
    saboteursThisYear: cs.saboteursThisYear,
    cupRecap: recap,
    newsSeen: false,
    overlordWon: league.overlordSlug === cs.slug,
    cup: league.cup
      ? {
          rounds: league.cup.rounds,
          currentRound: league.cup.currentRound,
          matchBets: cs.matchBets,
          withdrawn: cs.withdrawn,
          removals: league.cup.removals,
          removed: league.cup.removed,
        }
      : null,
    standingsHistory: standingsFor(league, coachId),
  };
}

// Write the shared half of a career back into the league
export function mergeShared(
  league: LeagueState,
  career: SavedCareer,
): LeagueState {
  return {
    ...league,
    year: career.year,
    season: career.season,
    characters: career.characters,
    pendingSabotages: career.pendingSabotages,
    newsQueue: career.newsQueue,
    ...(career.lastIssue === league.lastIssue
      ? {}
      : { lastIssue: career.lastIssue, lastIssueRecap: false }),
    h2h: career.h2h ?? {},
    pendingPolice: career.pendingPolice ?? [],
    aiGuarded: career.aiGuarded ?? [],
    parliament: career.parliament,
    seasonPricePct: career.seasonPricePct ?? league.seasonPricePct,
    seasonPriceByYear: career.seasonPriceByYear ?? league.seasonPriceByYear,
    gliziPricePct: career.gliziPricePct,
    gliziPriceIndex: career.gliziPriceIndex,
    gliziPriceHistory: career.gliziPriceHistory ?? [],
    lastCupRanks: career.lastCupRanks,
    cupStartRanks: career.cupStartRanks,
    overlordSlug: career.overlordSlug,
    cup: career.cup
      ? {
          rounds: career.cup.rounds,
          currentRound: career.cup.currentRound,
          removals: career.cup.removals ?? [],
          removed: career.cup.removed ?? [],
        }
      : null,
  };
}

// Write one coach's fields and the shared half back into the league
export function mergeBack(
  league: LeagueState,
  coachId: string,
  career: SavedCareer,
): LeagueState {
  const cs = league.coachStates[coachId];
  const next: CoachState = {
    ...cs,
    balance: career.balance,
    mail: career.mail,
    slotsUsed: career.slotsUsed,
    slotLog: career.slotLog,
    logsByYear: career.logsByYear ?? cs.logsByYear,
    mediaUses: career.mediaUses ?? 0,
    guarded: career.guarded ?? false,
    guardChance: career.guardChance,
    betStake: career.betStake,
    islandYear: career.islandYear,
    islandSeason: career.islandSeason,
    korpVendetta: career.korpVendetta,
    rivalSlug: career.rivalSlug ?? null,
    rivalChoice: career.rivalChoice ?? null,
    saboteursThisYear: career.saboteursThisYear ?? [],
    matchBets: career.cup?.matchBets ?? cs.matchBets,
    withdrawn: career.cup?.withdrawn ?? cs.withdrawn,
  };
  const shared = mergeShared(league, career);
  return {
    ...shared,
    coachStates: { ...shared.coachStates, [coachId]: next },
  };
}
