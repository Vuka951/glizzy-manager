import { SEASON_COUNT } from '@/data/games/careerSeasons';
import { ELECTION_POLL_SEASON } from '@/data/games/careerElections';
import { newCharacterState, applyCupPlacement, clampMeter } from '@/lib/utils/careerMeters';
import { simulateAiWindow } from '@/lib/utils/careerOffseason';
import { applyYellowVendetta, resolveSabotagesDetailed } from '@/lib/utils/careerSabotage';
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
  emptyParliament,
  isElectionYear,
  pollSeats,
  removalFor,
} from '@/lib/utils/careerElections';
import { countElection, settleElection } from '@/lib/utils/careerCoalition';
import { applySeasonLaws, cupPrizeFor, lawVoteDue, runAiLawVote } from '@/lib/utils/careerLaws';
import { FAVOR_TARGET_EGO, FAVOR_TARGET_STRESS, FAVOR_VOTE_COST, PARTY_PARTNER_RANKS, PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import { randomPersonality } from '@/data/games/careerPersonalities';
import { CAREER_SAVE_VERSION, type SavedCareer, type CharacterCareerState } from '@/lib/utils/careerSave';
import { equilibriumFor } from '@/lib/utils/characterTraits';
import { generateLeague } from '@/lib/utils/leagueRoster';
import { randomSeed } from '@/lib/utils/seededRandom';

const GHOST = '__ghost__';
let coalitionVotes = 0;
// Ballot variety: coalition votes and law votes as the AI cast them
const coalitionRows: { aiVoters: number; aiSame: boolean; firstWon: boolean; winShare: number; open: number; aiLast: number; lastWon: boolean }[] = [];
const lawRows: { aiVoters: number; aiSame: boolean; leaderAi: number; leaderSplit: boolean; passed: boolean; yesShare: number; repeal: boolean }[] = [];
const YEARS = Number(process.argv[2] ?? 20);
const RUNS = Number(process.argv[3] ?? 200);
const CHECKPOINTS = [5, 10, 15, 20, 25, 30].filter((y) => y <= YEARS);
// SIM_LAWS=0 runs the league without the law ballot, for an A/B on balance
const LAWS = process.env.SIM_LAWS !== '0';

const TABLE = CUP_BRACKET_SIZE;

// Plot bookkeeping: what the AI booked each window, who it landed on, how it ended
const SIM_MARK = process.env.SIM_MARK !== '0';
type PlotWindow = { total: number; perAi: number[]; received: number[]; landedByRank: number[]; marked: number; markedRank: number; byRival: number; lyingLow: number; ais: number };
const plotWindows: PlotWindow[] = [];
const plotOutcomes: Record<string, number> = { landed: 0, blocked: 0, caught: 0, hushed: 0 };
const plotsByPersonality: Record<string, { windows: number; plots: number }> = {};
let markedSlug: string | null = null;
let markedRival: string | null = null;
const leaderPointsByRun: number[][] = [];
let leaderPoints: number[] = [];
const aiPrizeByYear: Record<number, number[]> = {};
let aiPrizeThisYear = 0;
const moneyByYear: Record<number, number[][]> = {};
// Standing contracts by year (sum of security, spa, assistant levels per
// coach, signed coaches only) and campaign gifts per election cycle
const investByYear: Record<number, { signed: number; levels: number; maxed: number; byPos: number[] }[]> = {};
const donationRows: { year: number; donors: number; total: number; signed: number; byPos: number[] }[] = [];

function newLeague(): SavedCareer {
  const league = generateLeague(randomSeed());
  const characters: Record<string, CharacterCareerState> = {};
  for (const { slug } of league) {
    characters[slug] = { ...newCharacterState(slug, true), personality: randomPersonality() };
  }
  return {
    version: CAREER_SAVE_VERSION,
    league,
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

function beginOffseason(raw: SavedCareer): SavedCareer {
  const input = applySeasonLaws(raw, {}).state;
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
  const opened = beginOffseason(input);
  const seedOrder = rankBySeeding(opened.characters, GHOST);
  const booked = simulateAiWindow(opened);
  if (opened.standingsHistory.length > 0) {
    const plots = booked.pendingSabotages;
    const perAi = seedOrder.map((slug) => plots.filter((p) => p.bySlug === slug).length);
    const received = seedOrder.map((slug) => plots.filter((p) => p.targetSlug === slug).length);
    seedOrder.forEach((slug, i) => {
      const row = (plotsByPersonality[opened.characters[slug].personality ?? 'pro'] ??= { windows: 0, plots: 0 });
      row.windows += 1;
      row.plots += perAi[i];
    });
    plotWindows.push({
      total: plots.length,
      perAi,
      received,
      landedByRank: seedOrder.map(() => 0),
      marked: markedSlug ? plots.filter((p) => p.targetSlug === markedSlug).length : 0,
      markedRank: markedSlug ? seedOrder.indexOf(markedSlug) : -1,
      byRival: markedSlug ? plots.filter((p) => p.targetSlug === markedSlug && p.bySlug === markedRival).length : 0,
      lyingLow: seedOrder.filter((slug) => (opened.characters[slug].fineRecency ?? 0) > 0).length,
      ais: seedOrder.length,
    });
  }
  {
    const before = opened.parliament?.donors ?? {};
    const after = booked.parliament?.donors ?? {};
    const gifts = Object.entries(after).map(([slug, v]) => [slug, v - (before[slug] ?? 0)] as const).filter(([, v]) => v > 0);
    if (gifts.length > 0 || opened.season === ELECTION_POLL_SEASON) {
      const signed = seedOrder.filter((slug) => opened.characters[slug].sponsor).length;
      const byPos = seedOrder.map((slug) => gifts.find(([g]) => g === slug)?.[1] ?? 0);
      donationRows.push({ year: opened.year, donors: gifts.length, total: gifts.reduce((a, [, v]) => a + v, 0), signed, byPos });
    }
  }
  const resolved = resolveSabotagesDetailed(booked);
  if (opened.standingsHistory.length > 0) {
    const row = plotWindows[plotWindows.length - 1];
    resolved.outcomes.forEach((o) => {
      plotOutcomes[o.outcome] += 1;
      if (o.outcome === 'landed') row.landedByRank[seedOrder.indexOf(o.targetSlug)] += 1;
    });
  }
  let state = resolved.state.yellowVendetta ? applyYellowVendetta(resolved.state) : resolved.state;
  const buffed = buffedSlugsForSeason(state.season, Object.keys(state.characters));
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
    { ...state, cupStartRanks: seeds, phase: 'cup', cup: { rounds: seededRounds(seeds), currentRound: 0, matchBets: {}, withdrawn: false } },
    0,
  );
  const field = state.cup!.rounds[0].flatMap((m) => [m.a, m.b]);
  if (new Set(field).size !== CUP_BRACKET_SIZE || field.some((s) => !s || !state.characters[s])) {
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
  if (standings.length !== CUP_BRACKET_SIZE) throw new Error(`standings ${standings.length}`);
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
  placeBySlug.forEach((place, slug) => {
    const prize = cupPrizeFor(place);
    if (prize <= 0) return;
    characters[slug] = { ...characters[slug], money: (characters[slug].money ?? 0) + prize };
    aiPrizeThisYear += prize;
  });
  state = {
    ...state,
    characters,
    standingsHistory: [...state.standingsHistory, { year: state.year, season: state.season, champion, playerPlace: 0 }],
  };
  if (LAWS && lawVoteDue(state)) {
    const before = state.parliament?.lawVotes?.length ?? 0;
    state = runAiLawVote(state);
    const votes = state.parliament?.lawVotes ?? [];
    if (votes.length > before) {
      const vote = votes[votes.length - 1];
      const card = vote.pick === null ? null : vote.cards[vote.pick];
      const ai = vote.ballots.filter((b) => !b.human);
      const leaderAi = ai.filter((b) => state.characters[b.slug]?.sponsor?.sponsorId === vote.government[0]);
      const total = vote.ballots.reduce((a, b) => a + b.weight, 0);
      const yes = vote.ballots.filter((b) => b.choice === 'yes').reduce((a, b) => a + b.weight, 0);
      lawRows.push({
        aiVoters: ai.length,
        aiSame: new Set(ai.map((b) => b.choice)).size <= 1,
        leaderAi: leaderAi.length,
        leaderSplit: new Set(leaderAi.map((b) => b.choice)).size > 1,
        passed: vote.outcome === 'passed',
        yesShare: total > 0 ? yes / total : 0,
        repeal: card?.action === 'repeal',
      });
    }
  }
  const wrapped = state.season === SEASON_COUNT - 1;
  if (wrapped) {
    const order = rankBySeeding(state.characters, GHOST);
    leaderPoints.push(careerPoints(state.characters[order[0]]));
    (aiPrizeByYear[state.year] ??= []).push(aiPrizeThisYear);
    aiPrizeThisYear = 0;
    (moneyByYear[state.year] ??= []).push(order.map((slug) => state.characters[slug].money ?? 0));
    const levelOf = (slug: string) => {
      const inv = state.characters[slug].investments ?? {};
      return (inv.security ?? 0) + (inv.spa ?? 0) + (inv.assistant ?? 0);
    };
    const signedSlugs = order.filter((slug) => state.characters[slug].sponsor);
    (investByYear[state.year] ??= []).push({
      signed: signedSlugs.length,
      levels: signedSlugs.reduce((a, slug) => a + levelOf(slug), 0),
      maxed: signedSlugs.filter((slug) => levelOf(slug) >= 9).length,
      byPos: order.map(levelOf),
    });
  }
  state = {
    ...state,
    lastCupRanks: rankBySeeding(state.characters, GHOST),
    season: wrapped ? 0 : state.season + 1,
    year: wrapped ? state.year + 1 : state.year,
    ...(wrapped ? { saboteursThisYear: [] } : {}),
  };
  if (wrapped && isElectionYear(state.year - 1)) {
    const counted = { ...state, year: state.year - 1 };
    const result = settleElection(counted, countElection(counted));
    if (result.coalition) {
      coalitionVotes += 1;
      const c = result.coalition;
      const ai = c.ballots.filter((b) => !b.human);
      const total = c.ballots.reduce((a, b) => a + b.weight, 0);
      const won = c.ballots.filter((b) => b.choice === c.winner).reduce((a, b) => a + b.weight, 0);
      const lastPartner = PARTY_PARTNER_RANKS[c.leader][2];
      coalitionRows.push({
        aiVoters: ai.length,
        aiSame: new Set(ai.map((b) => b.choice)).size <= 1,
        firstWon: c.winner === c.options[0],
        winShare: total > 0 ? won / total : 0,
        open: c.options.filter((k) => !k.split('+').includes(lastPartner)).length,
        aiLast: ai.filter((b) => (b.choice ?? '').split('+').includes(lastPartner)).length,
        lastWon: (c.winner ?? '').split('+').includes(lastPartner),
      });
    }
    state = applyElection(counted, result);
    state = { ...state, year: state.year + 1 };
  }
  return state;
}

type Snap = { slug: string; points: number; titles: number; wins: number; losses: number; sponsor: string; fame: number; punishments: number; personality: string; skills: number; money: number; invest: number; plots: number; stress: number }[];

const byYear: Record<number, Snap[]> = {};
for (const y of CHECKPOINTS) byYear[y] = [];
const lawsInForceAt: Record<number, number[]> = {};
for (const y of CHECKPOINTS) lawsInForceAt[y] = [];
const lawStats: Record<string, { offered: number; picked: number; passed: number }> = {};
let lawBallots = 0;
let lawPassed = 0;
// One-party rule: the year it passed per run, and every failed try (each one
// costs the party CONSTITUTION_FAIL_RATING_PENALTY for good)
const constitutionYears: number[] = [];
let constitutionFails = 0;

for (let run = 0; run < RUNS; run++) {
  markedSlug = null;
  markedRival = null;
  let state = newLeague();
  if (SIM_MARK) {
    const roster = Object.keys(state.characters);
    markedSlug = roster[Math.floor(Math.random() * roster.length)];
    const others = roster.filter((s) => s !== markedSlug);
    markedRival = others[Math.floor(Math.random() * others.length)];
    state = { ...state, rivalOf: { [markedSlug]: markedRival } };
  }
  leaderPoints = [];
  while (state.year <= YEARS) {
    const before = state.year;
    state = playSeason(state);
    if (state.year !== before && CHECKPOINTS.includes(before)) {
      lawsInForceAt[before].push(state.parliament?.laws?.length ?? 0);
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
            plots: (ch.plotsLanded ?? 0) + (ch.sabotageFails ?? 0),
            stress: ch.stress,
          };
        }),
      );
    }
  }
  leaderPointsByRun.push(leaderPoints);
  if (state.parliament?.constitution) constitutionYears.push(state.parliament.constitution.year);
  for (const vote of state.parliament?.lawVotes ?? []) {
    lawBallots += 1;
    if (vote.outcome === 'passed') lawPassed += 1;
    vote.cards.forEach((card, i) => {
      const key = card.action === 'constitution' ? 'constitution' : `${card.action}:${card.law}`;
      const row = (lawStats[key] ??= { offered: 0, picked: 0, passed: 0 });
      row.offered += 1;
      if (vote.pick === i) {
        row.picked += 1;
        if (vote.outcome === 'passed') row.passed += 1;
        else if (card.action === 'constitution') constitutionFails += 1;
      }
    });
  }
}

function q(values: number[], p: number): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}

const mean = (v: number[]) => (v.length > 0 ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0);

const out: Record<string, unknown> = { runs: RUNS, years: YEARS, table: TABLE, byYear: {} as Record<string, unknown> };
const partyBalance: Record<string, unknown> = {};
for (const y of CHECKPOINTS) {
  const sizes = byYear[y].map((snap) => {
    const counts: Record<string, number> = {};
    snap.forEach((r) => { if (r.sponsor !== '-') counts[r.sponsor] = (counts[r.sponsor] ?? 0) + 1; });
    const vals = PARTY_SEAT_ORDER.map((k) => counts[k] ?? 0);
    const signed = vals.reduce((x, z) => x + z, 0);
    return { max: Math.max(...vals), min: Math.min(...vals), signed, dominant: signed > 0 && Math.max(...vals) * 2 >= signed };
  });
  const avg = (f: (x: (typeof sizes)[number]) => number) => +(sizes.reduce((acc, x) => acc + f(x), 0) / sizes.length).toFixed(2);
  partyBalance[y] = { biggest: avg((x) => x.max), smallest: avg((x) => x.min), signed: avg((x) => x.signed), dominantRuns: avg((x) => (x.dominant ? 1 : 0)) };
}
out.partyBalance = partyBalance;
for (const y of CHECKPOINTS) {
  const snaps = byYear[y];
  const positions = [];
  for (let pos = 0; pos < TABLE; pos++) {
    const pts = snaps.map((s) => s[pos].points);
    const titles = snaps.map((s) => s[pos].titles);
    positions.push({
      pos: pos + 1,
      mean: mean(pts),
      p10: q(pts, 0.1),
      median: q(pts, 0.5),
      p90: q(pts, 0.9),
      min: Math.min(...pts),
      max: Math.max(...pts),
      titlesMean: +(titles.reduce((a, b) => a + b, 0) / titles.length).toFixed(1),
    });
  }
  // The names are new every run, so the table is read by the lore fame each
  // character rests at instead: a low-fame name should still win some
  const fameBand = (slug: string) => {
    const fame = equilibriumFor(slug).fame;
    return fame < 20 ? 'fame<20' : fame < 30 ? 'fame20-29' : fame < 40 ? 'fame30-39' : 'fame40+';
  };
  const perFame: Record<string, { n: number; pos: number; titles: number }> = {};
  for (const snap of snaps) {
    snap.forEach((row, idx) => {
      const band = (perFame[fameBand(row.slug)] ??= { n: 0, pos: 0, titles: 0 });
      band.n += 1; band.pos += idx + 1; band.titles += row.titles;
    });
  }
  const byLoreFame = Object.fromEntries(
    Object.entries(perFame)
      .sort(([x], [y]) => x.localeCompare(y))
      .map(([band, v]) => [band, { share: +(v.n / (snaps.length * TABLE)).toFixed(2), meanPos: +(v.pos / v.n).toFixed(1), meanTitles: +(v.titles / v.n).toFixed(2) }]),
  );
  const perPers: Record<string, { n: number; pos: number; pts: number; titles: number; punish: number; skills: number; money: number; invest: number; plots: number; stress: number }> = {};
  for (const snap of snaps) {
    snap.forEach((row, idx) => {
      const p = (perPers[row.personality] ??= { n: 0, pos: 0, pts: 0, titles: 0, punish: 0, skills: 0, money: 0, invest: 0, plots: 0, stress: 0 });
      p.n += 1; p.pos += idx + 1; p.pts += row.points; p.titles += row.titles; p.punish += row.punishments; p.skills += row.skills; p.money += row.money; p.invest += row.invest; p.plots += row.plots; p.stress += row.stress;
    });
  }
  const perPersonality = Object.fromEntries(
    Object.entries(perPers)
      .map(([id, p]): [string, { meanPos: number; meanPts: number; meanTitles: number; meanPunish: number; meanSkills: number; meanMoney: number; meanInvest: number; meanPlots: number; meanStress: number }] => [id, { meanPos: +(p.pos / p.n).toFixed(1), meanPts: Math.round(p.pts / p.n), meanTitles: +(p.titles / p.n).toFixed(2), meanPunish: +(p.punish / p.n).toFixed(2), meanSkills: +(p.skills / p.n).toFixed(1), meanMoney: Math.round(p.money / p.n), meanInvest: +(p.invest / p.n).toFixed(2), meanPlots: +(p.plots / p.n).toFixed(1), meanStress: Math.round(p.stress / p.n) }])
      .sort((a, b) => a[1].meanPos - b[1].meanPos),
  );
  const gaps = snaps.map((s) => s[0].points - s[TABLE - 1].points);
  (out.byYear as Record<string, unknown>)[y] = {
    positions,
    perPersonality,
    spreadMean: mean(gaps),
    byLoreFame,
  };
}
out.coalitionVotes = coalitionVotes;
{
  const share = <T,>(rows: T[], f: (r: T) => boolean) => (rows.length > 0 ? +(rows.filter(f).length / rows.length).toFixed(3) : 0);
  const avg = <T,>(rows: T[], f: (r: T) => number) => (rows.length > 0 ? +(rows.reduce((a, r) => a + f(r), 0) / rows.length).toFixed(3) : 0);
  const multi = coalitionRows.filter((r) => r.aiVoters >= 2);
  const lawMulti = lawRows.filter((r) => r.aiVoters >= 2);
  const leaderMulti = lawRows.filter((r) => r.leaderAi >= 2);
  const lastOpen = coalitionRows.filter((r) => r.open >= 1);
  const lastVoters = lastOpen.reduce((a, r) => a + r.aiVoters, 0);
  out.variety = {
    coalition: {
      ballots: coalitionRows.length,
      aiUnanimous: share(multi, (r) => r.aiSame),
      aiUnanimousAll: share(coalitionRows, (r) => r.aiSame),
      firstRankedWon: share(coalitionRows, (r) => r.firstWon),
      meanWinShare: avg(coalitionRows, (r) => r.winShare),
      singleAllowed: share(coalitionRows, (r) => r.open <= 1),
      aiUnanimousOpen: share(multi.filter((r) => r.open >= 2), (r) => r.aiSame),
      firstRankedWonOpen: share(coalitionRows.filter((r) => r.open >= 2), (r) => r.firstWon),
      meanAiVoters: avg(coalitionRows, (r) => r.aiVoters),
      aiLastShare: lastVoters > 0 ? +(lastOpen.reduce((a, r) => a + r.aiLast, 0) / lastVoters).toFixed(3) : 0,
      lastWon: share(coalitionRows, (r) => r.lastWon),
    },
    laws: {
      ballots: lawRows.length,
      aiUnanimous: share(lawMulti, (r) => r.aiSame),
      leaderBrokeRanks: share(leaderMulti, (r) => r.leaderSplit),
      passRate: share(lawRows, (r) => r.passed),
      passRatePass: share(lawRows.filter((r) => !r.repeal), (r) => r.passed),
      passRateRepeal: share(lawRows.filter((r) => r.repeal), (r) => r.passed),
      meanYesShare: avg(lawRows, (r) => r.yesShare),
    },
  };
}
out.laws = {
  enabled: LAWS,
  ballots: lawBallots,
  passRate: lawBallots > 0 ? +(lawPassed / lawBallots).toFixed(2) : 0,
  inForceMean: Object.fromEntries(
    Object.entries(lawsInForceAt).map(([y, v]) => [y, v.length > 0 ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : 0]),
  ),
  cards: Object.entries(lawStats).sort((a, b) => b[1].passed - a[1].passed),
  constitution: { runsWon: constitutionYears.length, years: constitutionYears.sort((a, b) => a - b), failedTries: constitutionFails },
};
{
  const money: Record<string, unknown> = {};
  Object.entries(moneyByYear).forEach(([y, snaps]) => {
    if (![1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30].includes(Number(y))) return;
    const band = (from: number, to: number) => snaps.flatMap((s) => s.slice(from, to));
    const all = snaps.flat();
    money[y] = {
      leader: mean(snaps.map((s) => s[0])),
      top4: mean(band(0, 4)),
      middle: mean(band(4, TABLE - 4)),
      bottom4: mean(band(TABLE - 4, TABLE)),
      p50: q(all, 0.5),
      p90: q(all, 0.9),
      leagueTotal: mean(snaps.map((s) => s.reduce((a, b) => a + b, 0))),
    };
  });
  out.aiMoneyAtYearEnd = money;
}
{
  const n = plotWindows.length;
  const avg = (f: (w: PlotWindow) => number) => +(plotWindows.reduce((a, w) => a + f(w), 0) / Math.max(1, n)).toFixed(3);
  const hist = (values: number[], cap: number) => {
    const h: Record<string, number> = {};
    values.forEach((v) => {
      const k = v >= cap ? `${cap}+` : String(v);
      h[k] = (h[k] ?? 0) + 1;
    });
    return Object.fromEntries(Object.entries(h).sort().map(([k, v]) => [k, +(v / values.length).toFixed(4)]));
  };
  const allPerAi = plotWindows.flatMap((w) => w.perAi);
  const allReceived = plotWindows.flatMap((w) => w.received);
  const rankBand = (i: number) => (i === 0 ? 'leader' : i < 4 ? 'top2-4' : i < TABLE - 4 ? 'middle' : 'bottom4');
  const bands: Record<string, { n: number; received: number; landed: number }> = {};
  plotWindows.forEach((w) => {
    w.received.forEach((r, i) => {
      const b = (bands[rankBand(i)] ??= { n: 0, received: 0, landed: 0 });
      b.n += 1;
      b.received += r;
      b.landed += w.landedByRank[i];
    });
  });
  const totalOutcomes = Object.values(plotOutcomes).reduce((a, b) => a + b, 0);
  const markedWindows = plotWindows.filter((w) => w.markedRank >= 0);
  const markedBands: Record<string, { n: number; received: number }> = {};
  markedWindows.forEach((w) => {
    const b = (markedBands[rankBand(w.markedRank)] ??= { n: 0, received: 0 });
    b.n += 1;
    b.received += w.marked;
  });
  // The year the table leader first holds each crown's points, 99 for never
  const reachYears = (goal: number) =>
    leaderPointsByRun.map((pts) => {
      const i = pts.findIndex((p) => p >= goal);
      return i < 0 ? 99 : i + 1;
    });
  const reachSummary = (years: number[]) => ({
    median: q(years, 0.5),
    p10: q(years, 0.1),
    p90: q(years, 0.9),
    neverShare: +(years.filter((y) => y === 99).length / years.length).toFixed(3),
  });
  out.leader250 = reachSummary(reachYears(250));
  out.leader500 = reachSummary(reachYears(500));
  out.leader750 = reachSummary(reachYears(750));
  out.invest = Object.fromEntries(
    Object.entries(investByYear)
      .filter(([y]) => [1, 2, 3, 5, 8, 10, 15, 20, 25, 30].includes(Number(y)))
      .map(([y, rows]) => {
        const signed = rows.reduce((a, r) => a + r.signed, 0);
        const posMean = (from: number, to: number) => +(rows.reduce((a, r) => a + r.byPos.slice(from, to).reduce((x, v) => x + v, 0), 0) / (rows.length * (to - from))).toFixed(2);
        return [y, {
          signedPerLeague: +(signed / rows.length).toFixed(1),
          levelsPerSigned: +(rows.reduce((a, r) => a + r.levels, 0) / Math.max(1, signed)).toFixed(2),
          maxedShareOfSigned: +(rows.reduce((a, r) => a + r.maxed, 0) / Math.max(1, signed)).toFixed(2),
          levelsTop4: posMean(0, 4),
          levelsMiddle: posMean(4, TABLE - 4),
          levelsBottom4: posMean(TABLE - 4, TABLE),
        }];
      }),
  );
  {
    const donationsByYear: Record<number, { windows: number; donors: number; total: number; signed: number }> = {};
    donationRows.forEach((r) => {
      const b = (donationsByYear[r.year] ??= { windows: 0, donors: 0, total: 0, signed: 0 });
      b.windows += 1;
      b.donors += r.donors;
      b.total += r.total;
      b.signed += r.signed;
    });
    out.donations = Object.fromEntries(
      Object.entries(donationsByYear)
        .filter(([y]) => [2, 4, 6, 8, 10, 14, 20, 26, 30].includes(Number(y)))
        .map(([y, b]) => [y, { donorsPerRun: +(b.donors / RUNS).toFixed(2), signedPerRun: +(b.signed / Math.max(1, b.windows)).toFixed(1), totalPerRun: Math.round(b.total / RUNS), meanGift: Math.round(b.total / Math.max(1, b.donors)) }]),
    );
  }
  out.plots = {
    windows: n,
    totalPerWindow: avg((w) => w.total),
    totalPerWindowHist: hist(plotWindows.map((w) => w.total), 12),
    perAiPerWindow: +(allPerAi.reduce((a, b) => a + b, 0) / Math.max(1, allPerAi.length)).toFixed(3),
    perAiHist: hist(allPerAi, 3),
    perPersonality: Object.fromEntries(Object.entries(plotsByPersonality).map(([k, v]) => [k, +(v.plots / v.windows).toFixed(3)])),
    lyingLowShare: avg((w) => w.lyingLow / w.ais),
    outcomes: Object.fromEntries(Object.entries(plotOutcomes).map(([k, v]) => [k, +(v / Math.max(1, totalOutcomes)).toFixed(3)])),
    receivedPerCoachHist: hist(allReceived, 4),
    maxReceivedMean: avg((w) => Math.max(...w.received)),
    maxReceivedHist: hist(plotWindows.map((w) => Math.max(...w.received)), 5),
    pileOn3PlusShare: avg((w) => (Math.max(...w.received) >= 3 ? 1 : 0)),
    byRankBand: Object.fromEntries(Object.entries(bands).map(([k, b]) => [k, { received: +(b.received / b.n).toFixed(3), landed: +(b.landed / b.n).toFixed(3) }])),
    marked: {
      receivedPerWindow: +(markedWindows.reduce((a, w) => a + w.marked, 0) / Math.max(1, markedWindows.length)).toFixed(3),
      fromRivalPerWindow: +(markedWindows.reduce((a, w) => a + w.byRival, 0) / Math.max(1, markedWindows.length)).toFixed(3),
      byRankBand: Object.fromEntries(Object.entries(markedBands).map(([k, b]) => [k, +(b.received / b.n).toFixed(3)])),
    },
  };
  out.aiPrizeByYear = Object.fromEntries(Object.entries(aiPrizeByYear).filter(([y]) => [1, 2, 5, 10, 15, 20, 25, 30].includes(Number(y))).map(([y, v]) => [y, mean(v)]));
}
console.log(JSON.stringify(out));
