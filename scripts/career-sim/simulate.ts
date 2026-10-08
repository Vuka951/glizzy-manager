import { CHARACTER_ROSTER } from '@/data/games/roster';
import { SEASON_COUNT } from '@/data/games/careerSeasons';
import { ELECTION_POLL_SEASON } from '@/data/games/careerElections';
import { newCharacterState, applyCupPlacement, clampMeter } from '@/lib/utils/careerMeters';
import { simulateOffseason } from '@/lib/utils/careerOffseason';
import { seededRounds } from '@/lib/utils/careerSeeding';
import { rankBySeeding, careerPoints } from '@/lib/utils/careerPoints';
import { applyMatchToCharacters, applyH2h, participantFor } from '@/lib/utils/careerMatch';
import { CUP_BRACKET_SIZE, simulateMatch, resolveCupMatch, cupStandings, type CupMatch, type CupMatchResult } from '@/lib/utils/tournamentSim';
import { buffedSlugsForSeason, IN_FORM_STRESS_DROP } from '@/lib/utils/cupSeason';
import { applyStandingInvestments } from '@/lib/utils/careerInvestments';
import { rollSeasonPricePct, withSeasonPriceRoll } from '@/lib/utils/careerSeasonPrices';
import {
  applyElection,
  bookAiRemoval,
  electionResult,
  electionVotes,
  emptyParliament,
  isElectionYear,
  pollSeats,
  removalFor,
} from '@/lib/utils/careerElections';
import { FAVOR_TARGET_EGO, FAVOR_TARGET_STRESS, FAVOR_VOTE_COST } from '@/data/games/careerElections';
import { randomPersonality } from '@/data/games/careerPersonalities';
import type { SavedCareer, CharacterCareerState } from '@/lib/utils/careerSave';

const GHOST = '__ghost__';
const YEARS = Number(process.argv[2] ?? 20);
const RUNS = Number(process.argv[3] ?? 200);
const SIZE = CUP_BRACKET_SIZE;
const CHECKPOINTS = [5, 10, 15, 20].filter((y) => y <= YEARS);

const slugs = CHARACTER_ROSTER.map((c) => c.slug);

function newLeague(): SavedCareer {
  const characters: Record<string, CharacterCareerState> = {};
  for (const slug of slugs) {
    characters[slug] = { ...newCharacterState(slug, true), personality: randomPersonality() };
  }
  return {
    version: 1,
    playerSlug: GHOST,
    year: 1,
    season: 0,
    phase: 'offseason',
    slotsUsed: 0,
    slotLog: [],
    seasonPricePct: 0,
    seasonPriceByYear: { 1: [0] },
    balance: 0,
    characters,
    pendingSabotages: [],
    newsQueue: [],
    mail: [],
    cup: null,
    standingsHistory: [],
    rivalSlug: null,
  };
}

function beginOffseason(input: SavedCareer): SavedCareer {
  const paid = Object.fromEntries(
    Object.entries(input.characters).map(([slug, ch]) => [slug, applyStandingInvestments(ch)]),
  );
  const pricePct = rollSeasonPricePct(input.season, input.year);
  let next: SavedCareer = {
    ...input,
    characters: paid,
    phase: 'offseason',
    cup: null,
    newsQueue: [],
    seasonPricePct: pricePct,
    seasonPriceByYear: withSeasonPriceRoll(input.seasonPriceByYear, input.year, input.season, pricePct),
    aiGuarded: [],
  };
  if (isElectionYear(next.year)) {
    if (next.season === 0) next = { ...next, parliament: next.parliament ?? emptyParliament() };
    if (next.season === ELECTION_POLL_SEASON) {
      next = { ...next, parliament: { ...(next.parliament ?? emptyParliament()), poll: pollSeats(next) } };
    }
  }
  return next;
}

function simFor(state: SavedCareer, match: CupMatch): CupMatchResult {
  const removal = removalFor(state, match.round, match.index);
  const optsFor = (slug: string) => {
    const opts: Parameters<typeof participantFor>[2] = {};
    if ((state.pendingPolice ?? []).includes(slug)) opts.scriptedForfeit = 'police';
    if (removal?.targetSlug === slug) opts.scriptedForfeit = 'removed';
    return opts;
  };
  const result = simulateMatch(
    participantFor(state, match.a as string, optsFor(match.a as string)),
    participantFor(state, match.b as string, optsFor(match.b as string)),
  );
  return removal && result.reason === 'removed' ? { ...result, removedBy: removal.byParty } : result;
}

function resolveMatch(state: SavedCareer, round: number, index: number, result: CupMatchResult): SavedCareer {
  const cup = state.cup!;
  const match = cup.rounds[round][index];
  const characters = applyMatchToCharacters(state.characters, match.a as string, match.b as string, result);
  const h2h = applyH2h(state.h2h, match.a as string, match.b as string, (result.winner === 'a' ? match.a : match.b) as string);
  let next: SavedCareer = {
    ...state,
    characters,
    h2h,
    cup: { ...cup, rounds: resolveCupMatch(cup.rounds, round, index, result) },
    pendingPolice: (state.pendingPolice ?? []).filter((s) => s !== match.a && s !== match.b),
  };
  const removal = removalFor(next, round, index);
  if (removal && result.reason === 'removed' && next.parliament) {
    const target = next.characters[removal.targetSlug];
    next = {
      ...next,
      characters: {
        ...next.characters,
        [removal.targetSlug]: {
          ...target,
          stress: clampMeter(target.stress + FAVOR_TARGET_STRESS),
          ego: clampMeter(target.ego + FAVOR_TARGET_EGO),
        },
      },
      cup: {
        ...next.cup!,
        removals: (next.cup!.removals ?? []).filter((r) => r !== removal),
        removed: [...(next.cup!.removed ?? []), removal.targetSlug],
      },
      parliament: {
        ...next.parliament,
        penalties: {
          ...next.parliament.penalties,
          [removal.byParty]: next.parliament.penalties[removal.byParty] + FAVOR_VOTE_COST,
        },
      },
    };
  }
  return next;
}

function playSeason(input: SavedCareer): SavedCareer {
  let state = simulateOffseason(beginOffseason(input));
  const buffed = buffedSlugsForSeason(state.season);
  state = {
    ...state,
    characters: Object.fromEntries(
      Object.entries(state.characters).map(([slug, ch]) => [
        slug,
        buffed.has(slug) ? { ...ch, stress: Math.max(0, ch.stress - IN_FORM_STRESS_DROP) } : ch,
      ]),
    ),
    newsQueue: [],
  };
  const seeds = rankBySeeding(state.characters, GHOST);
  state = bookAiRemoval(
    { ...state, phase: 'cup', cupStartRanks: seeds, cup: { rounds: seededRounds(seeds), currentRound: 0, matchBets: {}, withdrawn: false } },
    0,
  );
  const field = state.cup!.rounds[0].flatMap((m) => [m.a, m.b]);
  if (new Set(field).size !== SIZE || field.some((s) => !s || !state.characters[s])) {
    throw new Error(`bad bracket: ${field.join(',')}`);
  }
  const roundCount = state.cup!.rounds.length;
  for (let r = 0; r < roundCount; r++) {
    for (let i = 0; i < state.cup!.rounds[r].length; i++) {
      const match = state.cup!.rounds[r][i];
      if (match.a && match.b && !match.result) state = resolveMatch(state, r, i, simFor(state, match));
    }
    if (r + 1 < roundCount) state = bookAiRemoval({ ...state, cup: { ...state.cup!, currentRound: r + 1 } }, r + 1);
  }
  const standings = cupStandings(state.cup!.rounds);
  if (standings.length !== SIZE) throw new Error(`standings ${standings.length}`);
  const champion = standings[0].slug;
  const placeBySlug = new Map(standings.map((s) => [s.slug, s.place]));
  const characters = Object.fromEntries(
    Object.entries(state.characters).map(([slug, chStart]) => {
      const place = placeBySlug.get(slug) ?? 0;
      return [
        slug,
        applyCupPlacement(
          {
            ...chStart,
            titles: slug === champion ? chStart.titles + 1 : chStart.titles,
            titleStreak: slug === champion ? chStart.titleStreak + 1 : 0,
            lastPlace: place,
            fineRecency: Math.max(0, (chStart.fineRecency ?? 0) - 1),
            hitRecency: Math.max(0, (chStart.hitRecency ?? 0) - 1),
          },
          place,
        ),
      ];
    }),
  );
  state = {
    ...state,
    characters,
    standingsHistory: [...state.standingsHistory, { year: state.year, season: state.season, champion, playerPlace: 0 }],
  };
  const wrapped = state.season === SEASON_COUNT - 1;
  state = {
    ...state,
    lastCupRanks: rankBySeeding(state.characters, GHOST),
    season: wrapped ? 0 : state.season + 1,
    year: wrapped ? state.year + 1 : state.year,
    ...(wrapped ? { saboteursThisYear: [] } : {}),
  };
  if (wrapped && isElectionYear(state.year - 1)) {
    const result = electionResult(electionVotes({ ...state, year: state.year - 1 }));
    state = applyElection({ ...state, year: state.year - 1 }, result);
    state = { ...state, year: state.year + 1 };
  }
  return state;
}

type Snap = { slug: string; points: number; titles: number; wins: number; losses: number; sponsor: string; fame: number; punishments: number; personality: string; skills: number; money: number; invest: number }[];

const byYear: Record<number, Snap[]> = {};
for (const y of CHECKPOINTS) byYear[y] = [];

for (let run = 0; run < RUNS; run++) {
  let state = newLeague();
  while (state.year <= YEARS) {
    const before = state.year;
    state = playSeason(state);
    if (state.year !== before && CHECKPOINTS.includes(before)) {
      const order = rankBySeeding(state.characters, GHOST);
      byYear[before].push(
        order.map((slug) => {
          const ch = state.characters[slug];
          return {
            slug,
            points: careerPoints(ch),
            titles: ch.titles,
            wins: ch.wins,
            losses: ch.losses,
            sponsor: ch.sponsor?.sponsorId ?? '-',
            fame: ch.fame,
            punishments: ch.punishments ?? 0,
            personality: ch.personality ?? 'pro',
            skills: ch.livesCap.level + ch.njuh.level + ch.nutrition.level + ch.fanSkill.level,
            money: ch.money ?? 0,
            invest: Object.values(ch.investments ?? {}).reduce((a, b) => a + (b ?? 0), 0),
          };
        }),
      );
    }
  }
}

function q(values: number[], p: number): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}

const out: Record<string, unknown> = { runs: RUNS, years: YEARS, byYear: {} as Record<string, unknown> };
for (const y of CHECKPOINTS) {
  const snaps = byYear[y];
  const positions = [];
  for (let pos = 0; pos < SIZE; pos++) {
    const pts = snaps.map((s) => s[pos].points);
    const titles = snaps.map((s) => s[pos].titles);
    positions.push({
      pos: pos + 1,
      mean: Math.round(pts.reduce((a, b) => a + b, 0) / pts.length),
      p10: q(pts, 0.1),
      median: q(pts, 0.5),
      p90: q(pts, 0.9),
      min: Math.min(...pts),
      max: Math.max(...pts),
      titlesMean: +(titles.reduce((a, b) => a + b, 0) / titles.length).toFixed(1),
    });
  }
  const perChar: Record<string, { meanPts: number; meanPos: number; meanTitles: number; sponsored: number; meanPunish: number }> = {};
  for (const slug of slugs) {
    const rows = snaps
      .filter((s) => s.some((r) => r.slug === slug))
      .map((s) => ({ idx: s.findIndex((r) => r.slug === slug), row: s.find((r) => r.slug === slug)! }));
    if (rows.length === 0) continue;
    perChar[slug] = {
      meanPts: Math.round(rows.reduce((a, r) => a + r.row.points, 0) / rows.length),
      meanPos: +(rows.reduce((a, r) => a + r.idx + 1, 0) / rows.length).toFixed(1),
      meanTitles: +(rows.reduce((a, r) => a + r.row.titles, 0) / rows.length).toFixed(2),
      sponsored: +(rows.filter((r) => r.row.sponsor !== '-').length / rows.length).toFixed(2),
      meanPunish: +(rows.reduce((a, r) => a + r.row.punishments, 0) / rows.length).toFixed(2),
    };
  }
  const perPers: Record<string, { n: number; pos: number; pts: number; titles: number; punish: number; skills: number; money: number; invest: number }> = {};
  for (const snap of snaps) {
    snap.forEach((row, idx) => {
      const p = (perPers[row.personality] ??= { n: 0, pos: 0, pts: 0, titles: 0, punish: 0, skills: 0, money: 0, invest: 0 });
      p.n += 1; p.pos += idx + 1; p.pts += row.points; p.titles += row.titles; p.punish += row.punishments; p.skills += row.skills; p.money += row.money; p.invest += row.invest;
    });
  }
  const perPersonality = Object.fromEntries(
    Object.entries(perPers)
      .map(([id, p]): [string, { meanPos: number; meanPts: number; meanTitles: number; meanPunish: number; meanSkills: number; meanMoney: number; meanInvest: number }] => [id, { meanPos: +(p.pos / p.n).toFixed(1), meanPts: Math.round(p.pts / p.n), meanTitles: +(p.titles / p.n).toFixed(2), meanPunish: +(p.punish / p.n).toFixed(2), meanSkills: +(p.skills / p.n).toFixed(1), meanMoney: Math.round(p.money / p.n), meanInvest: +(p.invest / p.n).toFixed(2) }])
      .sort((a, b) => a[1].meanPos - b[1].meanPos),
  );
  const gaps = snaps.map((s) => s[0].points - s[SIZE - 1].points);
  (out.byYear as Record<string, unknown>)[y] = {
    positions,
    perPersonality,
    spreadMean: Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length),
    perChar: Object.entries(perChar).sort((a, b) => a[1].meanPos - b[1].meanPos),
  };
}
console.log(JSON.stringify(out));
