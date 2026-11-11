import {
  CAREER_BET_UNLOCK_CUPS,
  COMEBACK_START_FAME,
  OFFSEASON_SLOTS,
  OVERLORD_POINTS,
  STARTING_CAREER_BALANCE,
  type OverlordPoints,
} from '@/data/games/careerEconomy';
import {
  ELECTION_POLL_SEASON,
  ELECTION_SEASON,
  PARTY_SEAT_ORDER,
} from '@/data/games/careerElections';
import { settleGlizzyBet } from '@/lib/utils/careerGlizzflationBets';
import { SPONSOR_TOP_SEED_COUNT } from '@/data/games/careerSponsors';
import { TRAINING_DEFS, type TrainingId } from '@/data/games/careerTraining';
import { BROADCAST_OPEN_UNLOCK_CUPS } from '@/lib/constants/careerCommentary';
import { withLedger } from '@/lib/server/career-mp/ledger';
import {
  careerFor,
  mergeBack,
  mergeShared,
  sharedCareer,
} from '@/lib/server/career-mp/lens';
import {
  attachQuotes,
  cueQuotes,
  resetQuotesForSeason,
} from '@/lib/server/career-mp/quotes';
import type {
  CoachState,
  LeagueState,
  Room,
} from '@/lib/server/career-mp/room';
import { logEvent } from '@/lib/server/rooms/log';
import { deadlineFor } from '@/lib/server/rooms/presence';
import type { Receipt } from '@/lib/types/careerMp';
import {
  closeCampaignLetters,
  emptyParliament,
  isElectionYear,
  yellowTax,
  pollSeats,
  seatParams,
} from '@/lib/utils/careerElections';
import { applyStandingInvestments } from '@/lib/utils/careerInvestments';
import { debtLetters, openLeagueDebt } from '@/lib/utils/careerCredit';
import {
  applySeasonLaws,
  lawBillFor,
  lawMovesTotal,
  withPrimeMinister,
} from '@/lib/utils/careerLaws';
import {
  bettingUnlockedLetter,
  broadcastUnlockLetter,
  campaignLetter,
  donationLetter,
  leagueNews,
  overlordLetter,
  rivalTauntLetter,
  sponsorOfferLetter,
  stipendLetter,
  taxLetter,
  taxRefundLetter,
  underworldLetter,
  welcomeLetter,
} from '@/lib/utils/careerMail';
import {
  AMBITION_SLUMP_THRESHOLD,
  applyFast,
  applyGuardHire,
  applyRest,
  applyTraining,
  EGO_HIJACK_THRESHOLD,
  newCharacterState,
} from '@/lib/utils/careerMeters';
import { simulateAiWindow } from '@/lib/utils/careerOffseason';
import { rankBySeeding, seedingKey } from '@/lib/utils/careerPoints';
import {
  firstYearRival,
  rivalChosenNews,
} from '@/lib/utils/careerRivals';
import {
  applyYellowVendetta,
  guardChance,
  guardCost,
  guardPriceScale,
  resolveSabotagesDetailed,
} from '@/lib/utils/careerSabotage';
import type { SavedCareer } from '@/lib/utils/careerSave';
import {
  rollSeasonPricePct,
  withSeasonPriceRoll,
} from '@/lib/utils/careerSeasonPrices';
import { rollSponsorOffers } from '@/lib/utils/careerSponsors';
import {
  buffedSlugsForSeason,
  IN_FORM_STRESS_DROP,
} from '@/lib/utils/cupSeason';
import { message, type Message } from '@/lib/utils/message';
import {
  glizacijaDropsBetween,
  sponsorSigningsBetween,
} from '@/lib/utils/quoteCutsceneTriggers';

const LEVELED_TRAININGS: TrainingId[] = [
  'stomach',
  'sniffer',
  'nutrition',
  'fans',
];

export function newCoachState(
  slug: string,
  rivalSlug: string,
  overlordPoints: OverlordPoints,
): CoachState {
  return {
    slug,
    balance: STARTING_CAREER_BALANCE,
    mail: [
      welcomeLetter(),
      overlordLetter(overlordPoints),
      rivalTauntLetter(1, 0, rivalSlug),
    ],
    slotsUsed: 0,
    slotLog: [],
    logsByYear: {},
    mediaUses: 0,
    guarded: false,
    rivalSlug,
    rivalChoice: null,
    saboteursThisYear: [],
    matchBets: {},
    withdrawn: false,
    cupRecap: [],
    ledger: [],
    done: false,
    passed: false,
    windowIntro: null,
    sponsorHistory: [],
    rivalHistory: [{ slug: rivalSlug, year: 1, wins: 0, losses: 0 }],
    cupPlaces: [],
    guardWindows: 0,
    guardBlocks: 0,
    hitsTaken: 0,
    plotsBooked: 0,
    plotsLanded: 0,
    plotsBlocked: 0,
    plotsCaught: 0,
    betsPlaced: 0,
    betsWon: 0,
    favorsUsed: 0,
  };
}

// The lobby becomes a league: every human is a comeback story on the last
// seeds, everyone else is a veteran, and the first window opens at once. The
// league is the lobby's offer, every coach's man in it
export function startGame(room: Room, now: number): Room {
  const coaches = Object.values(room.coaches);
  const humanSlugs = coaches.map((c) => c.slug as string);
  const overlordPoints = room.settings.overlordPoints ?? OVERLORD_POINTS;
  const roster = room.roster;
  const slugs = roster.map((e) => e.slug);
  const characters = Object.fromEntries(
    slugs.map((slug) => [
      slug,
      newCharacterState(slug, !humanSlugs.includes(slug)),
    ]),
  );
  humanSlugs.forEach((slug) => {
    characters[slug] = { ...characters[slug], fame: COMEBACK_START_FAME };
  });
  const coachStates: Record<string, CoachState> = {};
  coaches.forEach((coach) => {
    const slug = coach.slug as string;
    coachStates[coach.id] = newCoachState(
      slug,
      firstYearRival(slug, slugs),
      overlordPoints,
    );
  });
  const league: LeagueState = {
    year: 1,
    season: 0,
    roster,
    overlordPoints,
    characters,
    coachStates,
    humanSlugs,
    pendingSabotages: [],
    newsQueue: [],
    leagueRecap: { head: [], tail: [] },
    cup: null,
    h2h: {},
    pendingPolice: [],
    aiGuarded: [],
    standingsHistory: [],
    seasonPricePct: 0,
    seasonPriceByYear: { 1: [0] },
    gliziPriceHistory: [],
    governments: [],
    skipRoundVotes: [],
    skipCupVotes: [],
  };
  const started: Room = {
    ...room,
    status: 'playing',
    league,
    coaches: Object.fromEntries(
      coaches.map((c) => [c.id, { ...c, ready: false }]),
    ),
  };
  return openWindow(logEvent(started, now, 'started'), now, true);
}

function receiptFor(
  title: Message,
  before: SavedCareer['characters'][string] | null,
  after: SavedCareer['characters'][string] | null,
  moneyDelta: number,
  opts: Partial<Receipt> & { icon: Receipt['icon'] },
): Receipt {
  return {
    title,
    before,
    after,
    moneyDelta,
    ok: true,
    ...opts,
  };
}

// A fresh window for one coach: what the single-player beginOffseason and
// openCityWindow did for the player, minus the shared parts done once
// The price list letter is left out here: the calendar chips carry the
// season's roll and eight inboxes full of it read as noise. The tape letter
// too: a shared room has the tale of the tape on the pre-match card from
// the first match
function openCoachWindow(
  league: LeagueState,
  coachId: string,
  before: LeagueState['characters'],
  seeding: string[],
  runOver: string[],
): LeagueState {
  const receipts: Receipt[] = [];
  let career = careerFor(league, coachId, 'offseason');
  const ch = career.characters[career.playerSlug];
  if (ch !== before[career.playerSlug]) {
    receipts.push(
      receiptFor(
        message('career.toast.investPayout'),
        before[career.playerSlug],
        ch,
        0,
        { icon: 'invest' },
      ),
    );
  }
  const offers =
    career.standingsHistory.length > 0
      ? rollSponsorOffers(career.playerSlug, ch, {
          year: career.year,
          place: ch.lastPlace ?? 0,
          topSeed: seeding.indexOf(career.playerSlug) < SPONSOR_TOP_SEED_COUNT,
        })
      : [];
  const cups = career.standingsHistory.length;
  career = {
    ...career,
    slotsUsed: 0,
    slotLog: [],
    mediaUses: 0,
    guarded: false,
    guardChance: undefined,
    mail: [
      ...closeCampaignLetters(career),
      ...(ch.sponsor ? [] : [stipendLetter(career.year, career.season)]),
      ...(cups === CAREER_BET_UNLOCK_CUPS
        ? [bettingUnlockedLetter(career.year, career.season)]
        : []),
      ...(cups === BROADCAST_OPEN_UNLOCK_CUPS
        ? [broadcastUnlockLetter('studio-unlocked', career.year, career.season)]
        : []),
      ...(cups === 1 ? [underworldLetter(career.year, career.season)] : []),
      ...offers.map(({ sponsorId, wildcard }) =>
        sponsorOfferLetter(career.year, career.season, sponsorId, wildcard),
      ),
    ],
  };
  let ledgerTax = 0;
  let guardSpent = 0;
  const tax = yellowTax(ch, career.parliament);
  if (tax < 0) {
    ledgerTax = tax;
    career = {
      ...career,
      balance: career.balance + tax,
      mail: [...career.mail, taxLetter(career.year, career.season, -tax)],
    };
  } else if (tax > 0) {
    career = {
      ...career,
      mail: [...career.mail, taxRefundLetter(career.year, career.season, tax)],
    };
  }
  if (isElectionYear(career.year)) {
    if (
      career.season === ELECTION_POLL_SEASON ||
      (career.season === ELECTION_SEASON && career.parliament)
    ) {
      career = {
        ...career,
        mail: [
          ...career.mail,
          ch.sponsor
            ? donationLetter(career.year, career.season, ch.sponsor.sponsorId)
            : campaignLetter(career.year, career.season),
        ],
      };
    }
  }
  // A character past his limits spends the first month on his own
  if (ch.ego > EGO_HIJACK_THRESHOLD) {
    const id =
      LEVELED_TRAININGS[Math.floor(Math.random() * LEVELED_TRAININGS.length)];
    const { next: updated, outcome } = applyTraining(ch, TRAINING_DEFS[id]);
    career = {
      ...career,
      characters: { ...career.characters, [career.playerSlug]: updated },
      slotsUsed: 1,
      slotLog: [{ kind: 'ego', trainingId: id, outcome }],
    };
    receipts.push(
      receiptFor(
        message(
          'career.toast.egoHijack',
          { threshold: EGO_HIJACK_THRESHOLD, training: id },
          { training: 'training' },
        ),
        ch,
        updated,
        0,
        {
          icon: 'training',
          ok: outcome !== 'regression',
          scene: `training-${id}`,
          outcome:
            outcome === 'level-up'
              ? 'level-up'
              : outcome === 'regression'
                ? 'bad'
                : 'good',
        },
      ),
    );
  } else if (ch.ambition < AMBITION_SLUMP_THRESHOLD) {
    const cost = guardCost(0, guardPriceScale(career, career.playerSlug));
    const canHire = career.standingsHistory.length > 0 && career.balance >= cost;
    if (canHire) {
      const chance = guardChance(0);
      const updated = applyGuardHire(ch);
      career = {
        ...career,
        guarded: true,
        guardChance: chance,
        balance: career.balance - cost,
        characters: { ...career.characters, [career.playerSlug]: updated },
        slotsUsed: 1,
        slotLog: [{ kind: 'slump', slumpAction: 'guard' }],
      };
      guardSpent = cost;
      receipts.push(
        receiptFor(
          message('career.toast.slumpGuard', {
            threshold: AMBITION_SLUMP_THRESHOLD,
            pct: Math.round(chance * 100),
          }),
          ch,
          updated,
          -cost,
          { icon: 'guard', scene: 'guard' },
        ),
      );
    } else {
      const updated = applyFast(ch);
      career = {
        ...career,
        characters: { ...career.characters, [career.playerSlug]: updated },
        slotsUsed: 1,
        slotLog: [{ kind: 'slump', slumpAction: 'fast' }],
      };
      receipts.push(
        receiptFor(
          message('career.toast.slumpFast', {
            threshold: AMBITION_SLUMP_THRESHOLD,
          }),
          ch,
          updated,
          0,
          { icon: 'rest', scene: 'fast' },
        ),
      );
    }
  }
  const merged = mergeBack(league, coachId, career);
  let next: CoachState = {
    ...merged.coachStates[coachId],
    done: false,
    passed: false,
    windowIntro: {
      key: `${career.year}-${career.season}`,
      receipts,
      ...(runOver.includes(career.playerSlug)
        ? {
            scenes: [
              {
                id: 'yellow-run-over',
                speaker: career.playerSlug,
                lineRoll: Math.random(),
              },
            ],
          }
        : {}),
    },
  };
  if (ledgerTax !== 0) {
    next = withLedger(next, career.year, career.season, 'tax', ledgerTax);
  }
  if (guardSpent > 0) {
    next = withLedger(next, career.year, career.season, 'guard', -guardSpent);
    next = { ...next, guardWindows: next.guardWindows + 1 };
  }
  return { ...merged, coachStates: { ...merged.coachStates, [coachId]: next } };
}

// The Yellow Party's books close first: interest on every debt, a ledger line
// and a letter for every coach below zero, the warning and the car for
// whoever has been there too long
function debtOpenWindow(league: LeagueState): {
  league: LeagueState;
  runOver: string[];
} {
  const wallets = Object.fromEntries(
    Object.values(league.coachStates).map((cs) => [cs.slug, cs.balance]),
  );
  const debt = openLeagueDebt(league.characters, wallets);
  const coachStates: Record<string, CoachState> = {};
  Object.entries(league.coachStates).forEach(([coachId, cs]) => {
    const updated: CoachState = {
      ...cs,
      balance: debt.wallets[cs.slug] ?? cs.balance,
      mail: [
        ...cs.mail,
        ...debtLetters(debt, cs.slug, league.year, league.season),
      ],
    };
    coachStates[coachId] = withLedger(
      updated,
      league.year,
      league.season,
      'interest',
      -(debt.interest[cs.slug]?.amount ?? 0),
    );
  });
  return {
    league: {
      ...league,
      characters: debt.characters,
      coachStates,
      newsQueue: [...league.newsQueue, ...debt.news],
    },
    runOver: debt.runOver,
  };
}

// The laws on the books open the window right after the debts: the holiday,
// the bills and payouts out of every wallet, a ledger line per law and the
// bill letter for every coach they touched
function lawsOpenWindow(league: LeagueState): LeagueState {
  const wallets = Object.fromEntries(
    Object.values(league.coachStates).map((cs) => [cs.slug, cs.balance]),
  );
  const lawed = applySeasonLaws(sharedCareer(league), wallets);
  let next = mergeShared(league, lawed.state);
  const coachStates: Record<string, CoachState> = {};
  Object.entries(next.coachStates).forEach(([coachId, cs]) => {
    const moves = lawed.moves[cs.slug] ?? [];
    const bill = lawBillFor(moves, league.year, league.season);
    let updated: CoachState = {
      ...cs,
      balance: cs.balance + lawMovesTotal(moves),
      mail: bill ? [...cs.mail, bill] : cs.mail,
    };
    moves.forEach((m) => {
      updated = withLedger(updated, league.year, league.season, 'laws', m.amount);
    });
    coachStates[coachId] = updated;
  });
  next = { ...next, coachStates };
  return next;
}

// A new window: standing contracts pay out across the league, the season
// rolls its price, the city writes, and every coach gets his letters
export function openWindow(room: Room, now: number, first = false): Room {
  const debt = debtOpenWindow(room.league as LeagueState);
  const league = lawsOpenWindow(debt.league);
  const before = league.characters;
  const paid = Object.fromEntries(
    Object.entries(before).map(([slug, ch]) => [
      slug,
      applyStandingInvestments(ch),
    ]),
  );
  const pricePct = rollSeasonPricePct(league.season, league.year);
  let next: LeagueState = {
    ...resetQuotesForSeason(league),
    characters: paid,
    cup: null,
    aiGuarded: [],
    seasonPricePct: pricePct,
    seasonPriceByYear: withSeasonPriceRoll(
      league.seasonPriceByYear,
      league.year,
      league.season,
      pricePct,
    ),
  };
  // The city's shared business: the election-year front page and the poll
  if (isElectionYear(next.year)) {
    if (next.season === 0) {
      const parliament = next.parliament ?? emptyParliament();
      next = {
        ...next,
        parliament,
        newsQueue: [
          ...next.newsQueue,
          {
            ...leagueNews(
              parliament.elections === 0
                ? 'election-year'
                : 'election-year-again',
              '',
              { parties: PARTY_SEAT_ORDER.join(',') },
              'ballot',
              { parties: 'sponsorList' },
            ),
            slugs: [],
          },
        ],
      };
    }
    if (next.season === ELECTION_POLL_SEASON) {
      const parliament = {
        ...(next.parliament ?? emptyParliament()),
        poll: pollSeats(sharedCareer(next)),
      };
      next = {
        ...next,
        parliament,
        newsQueue: [
          ...next.newsQueue,
          {
            ...leagueNews('election-poll', '', seatParams(parliament.poll), 'poll'),
            slugs: [],
          },
        ],
      };
    }
  }
  const seeding = rankBySeeding(next.characters, new Set(next.humanSlugs));
  Object.keys(room.coaches).forEach((coachId) => {
    if (!next.coachStates[coachId]) return;
    next = openCoachWindow(next, coachId, before, seeding, debt.runOver);
  });
  // The prime minister's office is written down as the window opens
  next = mergeShared(next, withPrimeMinister(sharedCareer(next)));
  const opened: Room = {
    ...room,
    league: next,
    phase: { kind: 'window', deadline: deadlineFor(room.settings.windowSeconds, now) },
  };
  return logEvent(opened, now, first ? 'window-first' : 'window', {
    year: next.year,
    season: next.season,
  });
}

// The window shuts: unused months become rest, the AI runs its own window,
// every plot resolves, the paper prints and the table is set for the seeding
export function closeWindow(room: Room, now: number): Room {
  let league = room.league as LeagueState;
  const windowStart = league;
  Object.keys(room.coaches).forEach((coachId) => {
    const cs = league.coachStates[coachId];
    if (!cs) return;
    let career = careerFor(league, coachId, 'offseason');
    let ch = career.characters[career.playerSlug];
    const slotLog = [...career.slotLog];
    for (let i = career.slotsUsed; i < OFFSEASON_SLOTS; i++) {
      ch = applyRest(ch, career.playerSlug);
      slotLog.push({ kind: 'rest' });
    }
    career = {
      ...career,
      characters: { ...career.characters, [career.playerSlug]: ch },
      slotsUsed: OFFSEASON_SLOTS,
      slotLog,
    };
    const shortlist = career.rivalChoice ?? [];
    let rivalPicked: string | null = null;
    if (shortlist.length > 0) {
      rivalPicked = shortlist[0].slug;
      career = {
        ...career,
        rivalSlug: rivalPicked,
        rivalChoice: null,
        mail: [
          ...career.mail,
          rivalTauntLetter(career.year, career.season, rivalPicked),
        ],
        newsQueue: [
          ...career.newsQueue,
          rivalChosenNews(career.playerSlug, rivalPicked),
        ],
      };
    }
    league = mergeBack(league, coachId, career);
    const merged = league.coachStates[coachId];
    league = {
      ...league,
      coachStates: {
        ...league.coachStates,
        [coachId]: {
          ...merged,
          done: true,
          rivalHistory: rivalPicked
            ? [
                ...merged.rivalHistory,
                { slug: rivalPicked, year: league.year, wins: 0, losses: 0 },
              ]
            : merged.rivalHistory,
        },
      },
    };
  });

  const shared = sharedCareer(league);
  const aiWindow = simulateAiWindow(shared);
  // The comeback story runs once per coach, with the coach's name in it
  const nameBySlug = new Map(
    Object.values(room.coaches).map((c) => [c.slug, c.name]),
  );
  const newsQueue = aiWindow.newsQueue.flatMap((item) =>
    item.kind === 'comeback'
      ? item.slugs.map((slug) => ({
          ...item,
          templateKey: 'comeback-mp',
          params: { coach: nameBySlug.get(slug) ?? '' },
          slugs: [slug],
        }))
      : [item],
  );
  const resolution = resolveSabotagesDetailed({ ...aiWindow, newsQueue });
  league = mergeShared(league, resolution.state);
  const coachBySlug = new Map(
    Object.entries(league.coachStates).map(([id, cs]) => [cs.slug, id]),
  );
  const counters: Record<string, Partial<CoachState>> = {};
  const bump = (slug: string, key: keyof CoachState) => {
    const id = coachBySlug.get(slug);
    if (!id) return;
    const cs = league.coachStates[id];
    const current = (counters[id]?.[key] as number | undefined) ?? (cs[key] as number);
    counters[id] = { ...counters[id], [key]: current + 1 };
  };
  resolution.outcomes.forEach(({ bySlug, targetSlug, outcome }) => {
    if (outcome === 'landed') {
      bump(bySlug, 'plotsLanded');
      bump(targetSlug, 'hitsTaken');
    } else if (outcome === 'blocked') {
      bump(bySlug, 'plotsBlocked');
      bump(targetSlug, 'guardBlocks');
    } else if (outcome === 'caught') {
      bump(bySlug, 'plotsCaught');
    }
  });
  // The story that moved the index this window settles every ticket
  const actualPct = league.gliziPricePct ?? 0;
  Object.entries(league.coachStates).forEach(([coachId, cs]) => {
    const fine = resolution.fines[cs.slug] ?? 0;
    const suspects = resolution.saboteursByTarget[cs.slug] ?? [];
    let next: CoachState = {
      ...cs,
      ...counters[coachId],
      saboteursThisYear: [...new Set([...cs.saboteursThisYear, ...suspects])],
    };
    const settled = settleGlizzyBet(next, league.year, league.season, actualPct);
    if (settled.result) {
      next = withLedger(
        settled.state,
        league.year,
        league.season,
        'glizzflation',
        settled.result.payout - settled.result.stake,
      );
    }
    if (fine > 0) {
      // Same floor as the single-player wallet: a fine never digs below zero
      const balance = Math.max(0, next.balance - fine);
      next = withLedger(
        { ...next, balance },
        league.year,
        league.season,
        'fines',
        balance - next.balance,
      );
    }
    league = { ...league, coachStates: { ...league.coachStates, [coachId]: next } };
  });
  Object.entries(league.coachStates).forEach(([coachId, cs]) => {
    if (!cs.yellowVendetta) return;
    league = mergeShared(league, applyYellowVendetta(sharedCareer(league), cs.slug));
    league = {
      ...league,
      coachStates: {
        ...league.coachStates,
        [coachId]: { ...league.coachStates[coachId], yellowVendetta: false },
      },
    };
  });

  // The paper prints and the table is set for the seeding, the in-form
  // roster walking in with the season's stress drop
  const buffed = buffedSlugsForSeason(league.season, Object.keys(league.characters));
  const withBuff = Object.fromEntries(
    Object.entries(league.characters).map(([slug, ch]) => [
      slug,
      buffed.has(slug)
        ? { ...ch, stress: Math.max(0, ch.stress - IN_FORM_STRESS_DROP) }
        : ch,
    ]),
  );
  league = {
    ...league,
    characters: withBuff,
    lastIssue: { news: league.newsQueue, year: league.year, season: league.season },
    lastIssueRecap: false,
    newsQueue: [],
  };
  const seeded = sharedCareer(league);
  league = {
    ...league,
    cupStartRanks: rankBySeeding(seeded.characters, seedingKey(seeded)),
    cup: null,
    coachStates: Object.fromEntries(
      Object.entries(league.coachStates).map(([id, cs]) => [
        id,
        {
          ...cs,
          done: false,
          passed: false,
          matchBets: {},
          withdrawn: false,
        },
      ]),
    ),
  };
  // The window's signings and a glizacija drop make the news with the paper
  const closed: Room = attachQuotes(
    cueQuotes(
      {
        ...room,
        league,
        phase: { kind: 'paper', deadline: deadlineFor(room.settings.paperSeconds, now) },
      },
      [
        ...sponsorSigningsBetween(windowStart.characters, league.characters),
        ...glizacijaDropsBetween(windowStart, league),
      ],
    ),
  );
  return logEvent(closed, now, 'paper', { year: league.year, season: league.season });
}
