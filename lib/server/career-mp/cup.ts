import {
  CAREER_BET_FALLBACK_ODDS,
  CAREER_BET_STAKE,
  CAREER_BET_STAKES,
} from '@/data/games/careerEconomy';
import {
  FAVOR_TARGET_EGO,
  FAVOR_TARGET_STRESS,
  FAVOR_VOTE_COST,
  type ElectionResult,
} from '@/data/games/careerElections';
import {
  COALITION_COUNT_ALLOWANCE_MS,
  DEFAULT_COALITION_SECONDS,
} from '@/lib/constants/careerMp';
import { livesForLevel } from '@/data/games/careerTraining';
import { withLedger } from '@/lib/server/career-mp/ledger';
import {
  careerFor,
  mergeShared,
  sharedCareer,
} from '@/lib/server/career-mp/lens';
import { matchPlayback } from '@/lib/server/career-mp/playback';
import {
  attachQuotes,
  cueMatchResult,
  cueQuotes,
  reclaimPhaseQuotes,
} from '@/lib/server/career-mp/quotes';
import { buildReport } from '@/lib/server/career-mp/report';
import { openWindow } from '@/lib/server/career-mp/resolve';
import type {
  CoachState,
  LeagueState,
  Room,
} from '@/lib/server/career-mp/room';
import { ActionError } from '@/lib/server/rooms/errors';
import { logEvent } from '@/lib/server/rooms/log';
import { clipEndsAt, clipResultAt } from '@/lib/server/rooms/playback';
import {
  connectedSeatIds,
  deadlineFor,
  majorityOf,
} from '@/lib/server/rooms/presence';
import type { PhaseState, Stage } from '@/lib/types/careerMp';
import {
  applyElection,
  bookAiRemoval,
  bookRemoval,
  canRemove,
  favorPending,
  favorsLeft,
  isElectionYear,
  removalFor,
  roundParticipants,
} from '@/lib/utils/careerElections';
import {
  coalitionOpen,
  countElection,
  electionNews,
  settleElection,
} from '@/lib/utils/careerCoalition';
import { electionScenes } from '@/lib/utils/careerElectionScenes';
import { electionPremier } from '@/lib/utils/careerPremier';
import {
  derbyWinLetter,
  electionLetter,
  glizzyMarketLetter,
  favorLetter,
} from '@/lib/utils/careerMail';
import { openLaws } from '@/lib/server/career-mp/laws';
import {
  constitutionWin,
  cupPrizeFor,
} from '@/lib/utils/careerLaws';
import {
  applyH2h,
  applyMatchToCharacters,
  participantFor,
} from '@/lib/utils/careerMatch';
import { applyCupPlacement, clampMeter } from '@/lib/utils/careerMeters';
import { careerBettingUnlocked, matchOdds } from '@/lib/utils/careerOdds';
import {
  careerPoints,
  crownedLeader,
  overlordGoal,
  rankBySeeding,
} from '@/lib/utils/careerPoints';
import {
  cupRecapCoachNews,
  cupRecapLeagueNews,
} from '@/lib/utils/careerRecap';
import { applyDerbyMeters, rivalCandidates } from '@/lib/utils/careerRivals';
import type { CharacterCareerState, NewsItem } from '@/lib/utils/careerSave';
import { seededRounds } from '@/lib/utils/careerSeeding';
import { sponsorPayout } from '@/lib/utils/careerSponsors';
import type { QuoteEvent } from '@/lib/utils/quoteCutsceneTriggers';
import {
  cupBetKey,
  cupMatchWinner,
  cupStandings,
  resolveCupMatch,
  simulateMatch,
  type CupMatch,
  type CupMatchBet,
  type CupMatchResult,
} from '@/lib/utils/tournamentSim';

const SEASON_COUNT = 4;

function league(room: Room): LeagueState {
  if (!room.league) throw new ActionError('bad-room');
  return room.league;
}

function withCoach(
  room: Room,
  coachId: string,
  update: (cs: CoachState) => CoachState,
): Room {
  const l = league(room);
  return {
    ...room,
    league: {
      ...l,
      coachStates: {
        ...l.coachStates,
        [coachId]: update(l.coachStates[coachId]),
      },
    },
  };
}

function withEveryCoach(
  room: Room,
  update: (cs: CoachState, coachId: string) => CoachState,
): Room {
  const l = league(room);
  return {
    ...room,
    league: {
      ...l,
      coachStates: Object.fromEntries(
        Object.entries(l.coachStates).map(([id, cs]) => [id, update(cs, id)]),
      ),
    },
  };
}

function stageMatch(
  l: LeagueState,
  stage: Stage,
  index: number,
): { a: string; b: string; result: CupMatchResult | null } | null {
  const m = l.cup?.rounds[stage.round]?.[index];
  return m && m.a && m.b ? { a: m.a, b: m.b, result: m.result } : null;
}

function betOf(cs: CoachState, stage: Stage, index: number): CupMatchBet | undefined {
  return cs.matchBets[cupBetKey(stage.round, index)];
}

function setBet(
  cs: CoachState,
  stage: Stage,
  index: number,
  bet: CupMatchBet | null,
): CoachState {
  const bets = { ...cs.matchBets };
  const key = cupBetKey(stage.round, index);
  if (bet) bets[key] = bet;
  else delete bets[key];
  return { ...cs, matchBets: bets };
}

// The first match of a stage still waiting for its clip
function nextUnplayed(l: LeagueState, stage: Stage, from: number): number | null {
  const matches = l.cup?.rounds[stage.round] ?? [];
  for (let i = from; i < matches.length; i++) {
    const m = matches[i];
    if (m.a && m.b && !m.result) return i;
  }
  return null;
}

export function openMatchBets(
  room: Room,
  stage: Stage,
  index: number,
  now: number,
): Room {
  const reset = withEveryCoach(room, (cs) => ({ ...cs, passed: false, done: false }));
  const phase: PhaseState = {
    kind: 'match-bets',
    stage,
    index,
    deadline: deadlineFor(room.settings.matchBetSeconds, now),
  };
  return { ...reset, phase };
}


// The single-player simFor: police warrants and party removals scripted in
function simFor(l: LeagueState, match: CupMatch): CupMatchResult {
  const state = sharedCareer(l, 'cup');
  const removal = removalFor(state, match.round, match.index);
  const optsFor = (slug: string) => {
    const opts: Parameters<typeof participantFor>[2] = {};
    if (l.pendingPolice.includes(slug)) opts.scriptedForfeit = 'police';
    if (removal?.targetSlug === slug) opts.scriptedForfeit = 'removed';
    return opts;
  };
  const result = simulateMatch(
    participantFor(state, match.a as string, optsFor(match.a as string)),
    participantFor(state, match.b as string, optsFor(match.b as string)),
  );
  return removal && result.reason === 'removed'
    ? { ...result, removedBy: removal.byParty }
    : result;
}

// The bets close: the match is decided now and the clip starts for everyone
export function closeMatchBets(room: Room, now: number): Room {
  if (room.phase.kind !== 'match-bets') return room;
  const { stage, index } = room.phase;
  const l = league(room);
  const match = stageMatch(l, stage, index);
  if (!match) return afterClip(room, stage, index, now);
  const result = simFor(l, l.cup!.rounds[stage.round][index]);
  const phase: PhaseState = {
    kind: 'match-clip',
    stage,
    index,
    playback: matchPlayback(result, now),
    result,
  };
  // The news the result cues is booked now, off the men as they walk in,
  // and pops up on every screen once the clip lands; the clip runs its
  // usual length either way
  return attachQuotes(
    cueMatchResult({ ...room, phase }, stage, match.a, match.b, result),
  );
}

// The derby swing for every coach who named the other side his rival
function applyDerbies(
  room: Room,
  characters: Record<string, CharacterCareerState>,
  a: string,
  b: string,
  winner: string,
): { characters: Record<string, CharacterCareerState>; room: Room } {
  let next = characters;
  let nextRoom = room;
  Object.entries(league(room).coachStates).forEach(([coachId, cs]) => {
    const mine = cs.slug === a ? a : cs.slug === b ? b : null;
    if (!mine || !cs.rivalSlug) return;
    const other = mine === a ? b : a;
    if (cs.rivalSlug !== other) return;
    const won = winner === mine;
    next = applyDerbyMeters(next, mine, other, won);
    nextRoom = withCoach(nextRoom, coachId, (state) => ({
      ...state,
      mail: won
        ? [
            ...state.mail,
            derbyWinLetter(league(room).year, league(room).season, other),
          ]
        : state.mail,
      rivalHistory: state.rivalHistory.map((r, i, all) =>
        i === all.length - 1 && r.slug === other
          ? { ...r, wins: r.wins + (won ? 1 : 0), losses: r.losses + (won ? 0 : 1) }
          : r,
      ),
    }));
  });
  return { characters: next, room: nextRoom };
}

// Every coach's bet on the match, settled; a coach who cashed in against his
// own man risks the leak
function settleBets(
  room: Room,
  stage: Stage,
  index: number,
  a: string,
  b: string,
  result: CupMatchResult,
): Room {
  let next = room;
  const l = league(room);
  Object.entries(l.coachStates).forEach(([coachId, cs]) => {
    const bet = betOf(cs, stage, index);
    if (!bet || bet.won !== undefined) return;
    const won = bet.side === result.winner;
    const payout = won
      ? Math.round(bet.stake * (bet.odds ?? CAREER_BET_FALLBACK_ODDS))
      : 0;
    next = withCoach(next, coachId, (state) => {
      let updated = setBet(state, stage, index, { ...bet, won, payout });
      updated = {
        ...updated,
        balance: updated.balance + payout,
        betsWon: updated.betsWon + (won ? 1 : 0),
      };
      return payout > 0
        ? withLedger(updated, l.year, l.season, 'bets', payout)
        : updated;
    });
    const mySide = a === cs.slug ? 'a' : b === cs.slug ? 'b' : null;
    if (won && mySide && bet.side !== mySide && Math.random() < 0.6) {
      const nl = league(next);
      const ch = nl.characters[cs.slug];
      next = {
        ...next,
        league: {
          ...nl,
          characters: {
            ...nl.characters,
            [cs.slug]: {
              ...ch,
              stress: clampMeter(ch.stress + 25),
              ego: clampMeter(ch.ego - 20),
            },
          },
          newsQueue: [
            ...nl.newsQueue,
            {
              kind: 'scandal',
              templateKey: 'scandal',
              params: {},
              slugs: [cs.slug],
              freezeframe: 'crying',
            },
          ],
        },
      };
      next = logEvent(next, Date.now(), 'scandal', { coach: coachId }, coachId);
    }
  });
  return next;
}

function applyRemoval(
  room: Room,
  round: number,
  index: number,
  result: CupMatchResult,
): Room {
  const l = league(room);
  const state = sharedCareer(l, 'cup');
  const removal = removalFor(state, round, index);
  if (!removal || !l.cup || result.reason !== 'removed') return room;
  const target = l.characters[removal.targetSlug];
  const parliament = l.parliament;
  return {
    ...room,
    league: {
      ...l,
      characters: {
        ...l.characters,
        [removal.targetSlug]: {
          ...target,
          stress: clampMeter(target.stress + FAVOR_TARGET_STRESS),
          ego: clampMeter(target.ego + FAVOR_TARGET_EGO),
        },
      },
      cup: {
        ...l.cup,
        removals: l.cup.removals.filter((r) => r !== removal),
        removed: [...l.cup.removed, removal.targetSlug],
      },
      parliament: parliament
        ? {
            ...parliament,
            penalties: {
              ...parliament.penalties,
              [removal.byParty]:
                parliament.penalties[removal.byParty] + FAVOR_VOTE_COST,
            },
          }
        : parliament,
    },
  };
}

// Fold one decided match into the league: the characters, the head to head,
// the derbies, the bracket, the warrants and the bets
function applyResult(
  room: Room,
  stage: Stage,
  index: number,
  result: CupMatchResult,
): Room {
  let l = league(room);
  const match = stageMatch(l, stage, index);
  if (!match) return room;
  const winner = result.winner === 'a' ? match.a : match.b;
  let next = room;
  let characters = applyMatchToCharacters(l.characters, match.a, match.b, result, l.season);
  const derby = applyDerbies(next, characters, match.a, match.b, winner);
  next = derby.room;
  characters = derby.characters;
  l = league(next);
  const h2h = applyH2h(l.h2h, match.a, match.b, winner);
  const loser = result.winner === 'a' ? match.b : match.a;
  next = {
    ...next,
    league: {
      ...l,
      characters,
      h2h,
      cup: l.cup
        ? {
            ...l.cup,
            rounds: resolveCupMatch(l.cup.rounds, stage.round, index, result),
          }
        : null,
      pendingPolice: l.pendingPolice.filter((slug) => slug !== loser),
    },
  };
  next = applyRemoval(next, stage.round, index, result);
  return settleBets(next, stage, index, match.a, match.b, result);
}

// The clip is over on every screen: the result lands and the cursor moves
export function endClip(room: Room, now: number): Room {
  if (room.phase.kind !== 'match-clip') return room;
  const { stage, index, result } = room.phase;
  const applied = applyResult(room, stage, index, result);
  return afterClip(applied, stage, index, now);
}

function afterClip(room: Room, stage: Stage, index: number, now: number): Room {
  const l = league(room);
  const next = nextUnplayed(l, stage, index + 1);
  if (next !== null) return openMatchBets(room, stage, next, now);
  return endRound(room, stage.round, now);
}

// The paper is read and the table seeds the bracket
export function closePaper(room: Room, now: number): Room {
  const l = league(room);
  if (!l.cupStartRanks) throw new ActionError('bad-room');
  const rounds = seededRounds(l.cupStartRanks);
  let next: Room = {
    ...room,
    league: {
      ...l,
      cup: { rounds, currentRound: 0, removals: [], removed: [] },
      skipRoundVotes: [],
    },
  };
  next = bookAi(next, 0);
  return openCupPre(next, 0, now);
}

function bookAi(room: Room, round: number): Room {
  const l = league(room);
  const booked = bookAiRemoval(sharedCareer(l, 'cup'), round);
  return { ...room, league: mergeShared(l, booked) };
}

function openCupPre(room: Room, round: number, now: number): Room {
  const l = league(room);
  const reset = withEveryCoach(room, (cs) => ({ ...cs, done: false, passed: false }));
  const next: Room = {
    ...reset,
    league: {
      ...league(reset),
      cup: l.cup ? { ...l.cup, currentRound: round } : null,
      skipRoundVotes: [],
    },
    phase: {
      kind: 'cup-pre',
      round,
      deadline: deadlineFor(room.settings.preRoundSeconds, now),
    },
  };
  // Results decided by a skip reach the screens with the next draw
  return logEvent(attachQuotes(next), now, 'round', { round });
}

export function closeCupPre(room: Room, now: number): Room {
  if (room.phase.kind !== 'cup-pre') return room;
  const round = room.phase.round;
  const first = nextUnplayed(league(room), { round }, 0);
  if (first === null) return endRound(room, round, now);
  return openMatchBets(room, { round }, first, now);
}

function endRound(room: Room, round: number, now: number): Room {
  const l = league(room);
  if (!l.cup) throw new ActionError('bad-room');
  if (round >= l.cup.rounds.length - 1) return finishCup(room, now);
  const next = bookAi(room, round + 1);
  return openCupPre(next, round + 1, now);
}

// Every match of the stage still waiting, decided in order with no clips
function resolveRest(room: Room, stage: Stage): Room {
  let next = room;
  for (;;) {
    const l = league(next);
    const index = nextUnplayed(l, stage, 0);
    if (index === null) return next;
    const match = stageMatch(l, stage, index);
    if (!match) return next;
    const result = simFor(l, l.cup!.rounds[stage.round][index]);
    next = cueMatchResult(next, stage, match.a, match.b, result);
    next = applyResult(next, stage, index, result);
  }
}

function currentStage(room: Room): Stage | null {
  const phase = room.phase;
  if (phase.kind === 'cup-pre') return { round: phase.round };
  if (phase.kind === 'match-bets' || phase.kind === 'match-clip') return phase.stage;
  return null;
}

// A clip that was running lands first, then the rest of the stage is
// decided at once. Lines booked on a clip skipped before its result carry
// over to whatever comes next
function landRunningClip(room: Room, now: number): Room {
  if (room.phase.kind !== 'match-clip') return room;
  const { stage, index, result, playback } = room.phase;
  const landed = now < clipResultAt(playback) ? reclaimPhaseQuotes(room) : room;
  return applyResult(landed, stage, index, result);
}

export function skipRound(room: Room, now: number): Room {
  const stage = currentStage(room);
  if (!stage) return room;
  let next = resolveRest(landRunningClip(room, now), stage);
  next = logEvent(next, now, 'skip-round');
  return endRound(next, stage.round, now);
}

export function skipCup(room: Room, now: number): Room {
  const stage = currentStage(room);
  if (!stage) return room;
  let next = resolveRest(landRunningClip(room, now), stage);
  const roundCount = league(next).cup?.rounds.length ?? 0;
  for (let r = stage.round; r < roundCount; r++) {
    if (r > stage.round) next = bookAi(next, r);
    const l = league(next);
    next = {
      ...next,
      league: { ...l, cup: l.cup ? { ...l.cup, currentRound: r } : null },
    };
    next = resolveRest(next, { round: r });
  }
  next = logEvent(next, now, 'skip-cup');
  return finishCup(next, now);
}

// The cup is decided: prize money and sponsor pay per placed coach, the
// placement effects for everyone, the morning-after paper and the record
export function finishCup(room: Room, now: number): Room {
  let l = league(room);
  const cup = l.cup;
  if (!cup) throw new ActionError('bad-room');
  const standings = cupStandings(cup.rounds);
  const champion = standings[0]?.slug ?? null;
  const placeBySlug = new Map(standings.map((s) => [s.slug, s.place]));
  const finished: QuoteEvent[] = [{ kind: 'cup-finished', standings }];
  const characters = Object.fromEntries(
    Object.entries(l.characters).map(([slug, chStart]) => {
      const place = placeBySlug.get(slug) ?? 0;
      const ch: CharacterCareerState = applyCupPlacement(
        {
          ...chStart,
          titles: slug === champion ? chStart.titles + 1 : chStart.titles,
          titleStreak: slug === champion ? chStart.titleStreak + 1 : 0,
          lastPlace: place,
          fineRecency: Math.max(0, (chStart.fineRecency ?? 0) - 1),
          hitRecency: Math.max(0, (chStart.hitRecency ?? 0) - 1),
        },
        place,
      );
      return [slug, ch];
    }),
  );
  l = { ...l, characters, cup: { ...cup, currentRound: cup.rounds.length - 1 } };
  const shared = sharedCareer(l, 'cup');
  const leagueRecap = cupRecapLeagueNews(shared, cup.rounds, standings);
  const places: Record<string, number> = {};
  const coachStates: Record<string, CoachState> = {};
  // Derbies are the whole room's business: every coach's derby story goes
  // into the shared paper, one per pairing, the winner's angle first
  const derbies = new Map<string, NewsItem>();
  // Every placed coach's prize, human or AI
  Object.entries(l.coachStates).forEach(([coachId, cs]) => {
    const place = placeBySlug.get(cs.slug) ?? 0;
    places[coachId] = place;
    const prize = cupPrizeFor(place);
    const contract = characters[cs.slug].sponsor;
    const wins = cup.rounds
      .flat()
      .filter((m) => m.result && cupMatchWinner(m) === cs.slug).length;
    const income = contract
      ? sponsorPayout(contract, wins, characters[cs.slug].partyStatus)
      : 0;
    const ownNews = cupRecapCoachNews(
      careerFor({ ...l, coachStates: l.coachStates }, coachId, 'cup'),
      cup.rounds,
      standings,
    );
    ownNews
      .filter((item) => item.kind === 'rival')
      .forEach((item) => {
        const pair = [cs.slug, cs.rivalSlug ?? ''].sort().join('|');
        const won = item.templateKey === 'rival-derby-win';
        if (!derbies.has(pair) || won) derbies.set(pair, item);
      });
    let next: CoachState = {
      ...cs,
      balance: cs.balance + prize + income,
      cupRecap: ownNews.filter((item) => item.kind !== 'rival'),
      cupPlaces: [...cs.cupPlaces, place],
      done: false,
      passed: false,
    };
    next = withLedger(next, l.year, l.season, 'prize', prize);
    next = withLedger(next, l.year, l.season, 'sponsor', income);
    coachStates[coachId] = next;
  });
  const humanSlugs = new Set(Object.values(coachStates).map((cs) => cs.slug));
  const paidOut = { ...characters };
  placeBySlug.forEach((place, slug) => {
    const prize = cupPrizeFor(place);
    if (humanSlugs.has(slug) || !paidOut[slug] || prize <= 0) return;
    paidOut[slug] = { ...paidOut[slug], money: (paidOut[slug].money ?? 0) + prize };
  });
  l = {
    ...l,
    characters: paidOut,
    coachStates,
    leagueRecap: {
      head: leagueRecap.head,
      tail: [...derbies.values(), ...leagueRecap.tail],
    },
    skipRoundVotes: [],
    skipCupVotes: [],
    standingsHistory: [
      ...l.standingsHistory,
      {
        year: l.year,
        season: l.season,
        champion: champion ?? '',
        ranks: rankBySeeding(paidOut, new Set(l.humanSlugs)),
        points: Object.fromEntries(
          Object.entries(paidOut).map(([slug, ch]) => [slug, careerPoints(ch)]),
        ),
        places,
      },
    ],
  };
  const next: Room = attachQuotes(
    cueQuotes(
      {
        ...room,
        league: l,
        phase: {
          kind: 'season-end',
          deadline: deadlineFor(room.settings.seasonEndSeconds, now),
        },
      },
      finished,
    ),
  );
  return logEvent(next, now, 'cup-finished', { champion: champion ?? '' });
}

// Season over: the logs archive, the year wraps with its election, rival
// shortlists and suspect files, and the crown ends the campaign. A count
// whose partner vote waits on a human opens the coalition phase first
export function closeSeasonEnd(room: Room, now: number): Room {
  let l = league(room);
  const crowned =
    l.overlordSlug || constitutionWin(l.parliament)
      ? null
      : crownedLeader(l.characters, new Set(l.humanSlugs), overlordGoal(l));
  const wrapped = l.season === SEASON_COUNT - 1;
  const electionDue = wrapped && isElectionYear(l.year);
  const recapNews = [...l.leagueRecap.head, ...l.leagueRecap.tail];
  const year = l.year;
  const season = l.season;
  const coachStates: Record<string, CoachState> = {};
  Object.entries(l.coachStates).forEach(([coachId, cs]) => {
    const logsByYear = { ...cs.logsByYear };
    const yearLogs = (logsByYear[year] ?? [[], [], [], []]).map((s) => [...s]);
    yearLogs[season] = cs.slotLog;
    logsByYear[year] = yearLogs;
    coachStates[coachId] = { ...cs, logsByYear, done: false, passed: false };
  });
  l = {
    ...l,
    coachStates,
    lastIssue: recapNews.length > 0 ? { news: recapNews, year, season } : l.lastIssue,
    lastIssueRecap: recapNews.length > 0,
    prevIssue:
      recapNews.length > 0 && !l.lastIssueRecap ? l.lastIssue : undefined,
    lastCupRanks: rankBySeeding(l.characters, new Set(l.humanSlugs)),
    cup: null,
    ...(crowned ? { overlordSlug: crowned } : {}),
  };
  const next: Room = { ...room, league: l };
  // After the Frozen cup of a law year the chamber votes before the window
  if (!electionDue && !crowned) {
    const laws = openLaws(next, now);
    return laws.open ? laws.room : wrapYear(laws.room, null, null, now);
  }
  if (!electionDue) return wrapYear(next, null, crowned, now);
  const shared = sharedCareer(l, 'offseason');
  const result = countElection(shared);
  if (!coalitionOpen(result)) return wrapYear(next, result, crowned, now);
  // A crowned campaign does not wait on a vote
  if (crowned) {
    return wrapYear(next, settleElection(shared, result), crowned, now);
  }
  const seconds =
    room.settings.coalitionSeconds === undefined
      ? DEFAULT_COALITION_SECONDS
      : room.settings.coalitionSeconds;
  const deadline = deadlineFor(seconds, now);
  return attachQuotes(
    logEvent(
      {
        ...next,
        league: { ...l, lastElection: { year, result } },
        phase: {
          kind: 'coalition',
          deadline:
            deadline === null ? null : deadline + COALITION_COUNT_ALLOWANCE_MS,
        },
      },
      now,
      'coalition-open',
      { leader: result.coalition?.leader ?? '' },
    ),
  );
}

// The year turns: the count becomes the chamber with its paper story and
// letters, every coach gets a rival shortlist, and the crown ends the
// campaign or the next window opens
export function wrapYear(
  room: Room,
  result: ElectionResult | null,
  crowned: string | null,
  now: number,
): Room {
  let l = league(room);
  const year = l.year;
  const season = l.season;
  const wrapped = season === SEASON_COUNT - 1;
  // One-party rule passed in this season's law vote ends the campaign too
  const constitution = constitutionWin(l.parliament);
  const enacted =
    constitution?.year === year && constitution.season === season
      ? constitution
      : null;
  let coachStates: Record<string, CoachState> = {};
  if (result) {
    // The count closes the year, so the government takes office in the next
    // one, the year single player's election night records
    const inOffice = year + 1;
    const shared = sharedCareer(l, 'offseason');
    const scenes = electionScenes(shared, result);
    const premier = electionPremier(shared, result);
    const applied = applyElection(shared, result);
    l = mergeShared(l, {
      ...applied,
      parliament: applied.parliament && {
        ...applied.parliament,
        electedYear: inOffice,
      },
    });
    l = {
      ...l,
      lastElection: { year, result, scenes, premier },
      governments: [
        ...l.governments,
        {
          year: inOffice,
          government: result.government,
          primeMinister: applied.parliament?.primeMinister ?? null,
        },
      ],
      newsQueue: [
        ...l.newsQueue,
        { ...electionNews(result, '', premier), slugs: [] },
      ],
    };
    Object.entries(l.coachStates).forEach(([coachId, cs]) => {
      const career = careerFor(l, coachId, 'offseason');
      const ch = career.characters[cs.slug];
      const status = ch.partyStatus ?? 'none';
      const left = favorsLeft(career, cs.slug);
      coachStates[coachId] = {
        ...cs,
        mail: [
          ...cs.mail,
          electionLetter(
            year,
            season,
            status,
            premier && {
              slug: premier.slug,
              you: premier.slug === cs.slug,
            },
          ),
          ...(career.parliament?.elections === 1
            ? [glizzyMarketLetter(year, season)]
            : []),
          ...(ch.sponsor && left > 0
            ? [favorLetter(year, season, ch.sponsor.sponsorId, left)]
            : []),
        ],
      };
    });
    l = { ...l, coachStates };
  }
  l = { ...l, season: wrapped ? 0 : season + 1, year: wrapped ? year + 1 : year };
  if (wrapped) {
    coachStates = {};
    Object.entries(l.coachStates).forEach(([coachId, cs]) => {
      const career = careerFor(
        { ...l, year, season, cup: null },
        coachId,
        'offseason',
      );
      coachStates[coachId] = {
        ...cs,
        rivalChoice: rivalCandidates({ ...career, cup: null }),
        saboteursThisYear: [],
      };
    });
    l = { ...l, coachStates };
  }
  let next: Room = { ...room, league: l };
  if (crowned || enacted) {
    next = {
      ...next,
      status: 'finished',
      phase: { kind: 'finished', reopenVotes: [] },
    };
    next = { ...next, report: buildReport(next) };
    return crowned
      ? logEvent(next, now, 'overlord', { slug: crowned })
      : logEvent(next, now, 'constitution', { party: enacted?.party ?? '' });
  }
  return openWindow(next, now);
}

// A majority of the connected room wants to keep playing: the crown stays
// in the record and the next window opens
export function reopenRoom(room: Room, now: number): Room {
  const next: Room = { ...room, status: 'playing' };
  return openWindow(logEvent(next, now, 'reopened'), now);
}

// Cup-phase actions per coach

export function placeBet(
  room: Room,
  coachId: string,
  side: 'a' | 'b',
  now: number,
): Room {
  if (room.phase.kind !== 'match-bets') throw new ActionError('bad-phase');
  const { stage, index } = room.phase;
  const l = league(room);
  const cs = l.coachStates[coachId];
  const career = careerFor(l, coachId, 'cup');
  if (!careerBettingUnlocked(career)) throw new ActionError('betting-locked');
  const match = stageMatch(l, stage, index);
  if (!match) throw new ActionError('no-match');
  const existing = betOf(cs, stage, index);
  let balance = cs.balance;
  if (existing && existing.won === undefined) balance += existing.stake;
  const stake = cs.betStake ?? CAREER_BET_STAKE;
  if (balance < stake) throw new ActionError('no-funds');
  const odds = matchOdds(l.characters, match.a, match.b);
  const bet: CupMatchBet = {
    side,
    stake,
    odds: side === 'a' ? odds.a : odds.b,
  };
  let next = withCoach(room, coachId, (state) => {
    let updated = setBet(state, stage, index, bet);
    updated = {
      ...updated,
      balance: balance - stake,
      passed: true,
      betsPlaced: updated.betsPlaced + (existing ? 0 : 1),
    };
    if (existing && existing.won === undefined) {
      updated = withLedger(updated, l.year, l.season, 'bets', existing.stake);
    }
    return withLedger(updated, l.year, l.season, 'bets', -stake);
  });
  next = logEvent(next, now, 'bet', { coach: coachId, key: cupBetKey(stage.round, index) });
  return next;
}

export function removeBet(room: Room, coachId: string): Room {
  if (room.phase.kind !== 'match-bets') throw new ActionError('bad-phase');
  const { stage, index } = room.phase;
  const l = league(room);
  const cs = l.coachStates[coachId];
  const existing = betOf(cs, stage, index);
  if (!existing || existing.won !== undefined) throw new ActionError('no-bet');
  return withCoach(room, coachId, (state) => {
    const updated = setBet(state, stage, index, null);
    return withLedger(
      {
        ...updated,
        balance: updated.balance + existing.stake,
        passed: false,
        betsPlaced: Math.max(0, updated.betsPlaced - 1),
      },
      l.year,
      l.season,
      'bets',
      existing.stake,
    );
  });
}

export function setBetStake(room: Room, coachId: string, stake: number): Room {
  if (!CAREER_BET_STAKES.includes(stake)) throw new ActionError('bad-stake');
  return withCoach(room, coachId, (cs) => ({ ...cs, betStake: stake }));
}

export function passBet(room: Room, coachId: string): Room {
  if (room.phase.kind !== 'match-bets') throw new ActionError('bad-phase');
  return withCoach(room, coachId, (cs) => ({ ...cs, passed: true }));
}

export function everyonePassed(room: Room): boolean {
  const l = room.league;
  if (!l) return false;
  return Object.keys(room.coaches).every((id) => l.coachStates[id]?.passed ?? true);
}

export function bookFavor(
  room: Room,
  coachId: string,
  targetSlug: string,
  index: number,
  now: number,
): Room {
  if (room.phase.kind !== 'cup-pre') throw new ActionError('bad-phase');
  const round = room.phase.round;
  const l = league(room);
  const cs = l.coachStates[coachId];
  const career = careerFor(l, coachId, 'cup');
  if (!career.cup || !career.parliament) throw new ActionError('no-parliament');
  if (round >= career.cup.rounds.length - 1) throw new ActionError('final');
  if (favorsLeft(career, cs.slug) <= 0) throw new ActionError('no-favors');
  if (favorPending(career, cs.slug)) throw new ActionError('favor-pending');
  const party = career.characters[cs.slug].sponsor?.sponsorId;
  if (!party || !canRemove(career, cs.slug, targetSlug))
    throw new ActionError('bad-target');
  const candidates = roundParticipants(
    career.cup.rounds[round] ?? [],
    career.cup.removals,
  );
  if (!candidates.some((p) => p.slug === targetSlug && p.index === index))
    throw new ActionError('bad-target');
  const booked = bookRemoval(career, {
    round,
    index,
    targetSlug,
    bySlug: cs.slug,
    byParty: party,
  });
  let next: Room = { ...room, league: mergeShared(l, booked) };
  next = withCoach(next, coachId, (state) => ({
    ...state,
    favorsUsed: state.favorsUsed + 1,
    done: false,
  }));
  return logEvent(next, now, 'favor', { coach: coachId, target: targetSlug });
}

export function withdraw(room: Room, coachId: string, now: number): Room {
  if (room.phase.kind !== 'cup-pre') throw new ActionError('bad-phase');
  const round = room.phase.round;
  const l = league(room);
  const cs = l.coachStates[coachId];
  if (!l.cup || cs.withdrawn) throw new ActionError('withdrawn');
  const match = l.cup.rounds[round].find(
    (m) => !m.result && m.a && m.b && (m.a === cs.slug || m.b === cs.slug),
  );
  if (!match) throw new ActionError('no-match');
  const playerSide = match.a === cs.slug ? 'a' : 'b';
  const opponentSlug = (playerSide === 'a' ? match.b : match.a) as string;
  const chA = l.characters[match.a as string];
  const chB = l.characters[match.b as string];
  const result: CupMatchResult = {
    turns: [],
    livesA: livesForLevel(chA?.livesCap.level ?? 0),
    livesB: livesForLevel(chB?.livesCap.level ?? 0),
    winner: playerSide === 'a' ? 'b' : 'a',
    reason: 'withdrawn',
    livesCapA: livesForLevel(chA?.livesCap.level ?? 0),
    livesCapB: livesForLevel(chB?.livesCap.level ?? 0),
  };
  const player = l.characters[cs.slug];
  const opponent = l.characters[opponentSlug];
  const fanTrained = player.fanSkill.level >= 2;
  const characters = {
    ...l.characters,
    [cs.slug]: {
      ...player,
      withdrawals: player.withdrawals + 1,
      fame: clampMeter(player.fame - (fanTrained ? 0 : 10)),
      ego: clampMeter(player.ego - 6),
      ambition: clampMeter(player.ambition - 4),
    },
    [opponentSlug]: { ...opponent, wins: opponent.wins + 1 },
  };
  // The walkover cues its lines off the men as they stood before it
  const cued = cueMatchResult(
    room,
    { round },
    match.a as string,
    match.b as string,
    result,
  );
  let next: Room = {
    ...cued,
    league: {
      ...league(cued),
      characters,
      cup: {
        ...l.cup,
        rounds: resolveCupMatch(l.cup.rounds, round, match.index, result),
      },
    },
  };
  next = withCoach(next, coachId, (state) => ({ ...state, withdrawn: true }));
  next = settleBets(next, { round }, match.index, match.a as string, match.b as string, result);
  next = attachQuotes(next);
  return logEvent(next, now, 'withdraw', { coach: coachId });
}

export function voteSkipClip(room: Room, coachId: string, now: number): Room {
  if (room.phase.kind !== 'match-clip') throw new ActionError('bad-phase');
  const playback = room.phase.playback;
  if (playback.skippedAt !== undefined || playback.skipVotes.includes(coachId))
    return room;
  const votes = [...playback.skipVotes, coachId];
  const connected = connectedSeatIds(room.coaches, now);
  const counted = votes.filter((id) => connected.includes(id)).length;
  const skipped = counted >= majorityOf(Math.max(1, connected.length));
  return {
    ...room,
    phase: {
      ...room.phase,
      playback: {
        ...playback,
        skipVotes: votes,
        ...(skipped ? { skippedAt: now } : {}),
      },
    },
  };
}

function cupPhase(room: Room): boolean {
  const kind = room.phase.kind;
  return (
    kind === 'cup-pre' ||
    kind === 'match-bets' ||
    kind === 'match-clip'
  );
}

function everyConnectedVoted(room: Room, votes: string[], now: number): boolean {
  const connected = connectedSeatIds(room.coaches, now);
  const voters = connected.length > 0 ? connected : Object.keys(room.coaches);
  return voters.every((id) => votes.includes(id));
}

export function voteSkipRound(
  room: Room,
  coachId: string,
  on: boolean,
  now: number,
): Room {
  if (!cupPhase(room)) throw new ActionError('bad-phase');
  const l = league(room);
  const votes = on
    ? [...new Set([...l.skipRoundVotes, coachId])]
    : l.skipRoundVotes.filter((id) => id !== coachId);
  const next: Room = { ...room, league: { ...l, skipRoundVotes: votes } };
  if (on && everyConnectedVoted(next, votes, now)) return skipRound(next, now);
  return next;
}

export function voteSkipCup(
  room: Room,
  coachId: string,
  on: boolean,
  now: number,
): Room {
  if (!cupPhase(room)) throw new ActionError('bad-phase');
  const l = league(room);
  const votes = on
    ? [...new Set([...l.skipCupVotes, coachId])]
    : l.skipCupVotes.filter((id) => id !== coachId);
  const next: Room = { ...room, league: { ...l, skipCupVotes: votes } };
  if (on && everyConnectedVoted(next, votes, now)) return skipCup(next, now);
  return next;
}

export function voteReopen(
  room: Room,
  coachId: string,
  on: boolean,
  now: number,
): Room {
  if (room.phase.kind !== 'finished') throw new ActionError('bad-phase');
  const votes = on
    ? [...new Set([...room.phase.reopenVotes, coachId])]
    : room.phase.reopenVotes.filter((id) => id !== coachId);
  const next: Room = { ...room, phase: { kind: 'finished', reopenVotes: votes } };
  const connected = connectedSeatIds(room.coaches, now);
  const voters = connected.length > 0 ? connected : Object.keys(room.coaches);
  const counted = votes.filter((id) => voters.includes(id)).length;
  if (on && counted >= majorityOf(voters.length)) return reopenRoom(next, now);
  return next;
}

// The phase's own end: the countdown, the linger after a clip, or everyone
// being done
export function phaseExpired(room: Room, now: number): boolean {
  const phase = room.phase;
  switch (phase.kind) {
    case 'window':
    case 'paper':
    case 'cup-pre':
    case 'season-end':
    case 'coalition':
    case 'laws':
    case 'match-bets':
      return phase.deadline !== null && now >= phase.deadline;
    case 'match-clip':
      return now >= clipEndsAt(phase.playback, room.settings.matchLingerSeconds);
    default:
      return false;
  }
}
