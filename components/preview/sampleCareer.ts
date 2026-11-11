import { OVERLORD_POINTS } from '@/data/games/careerEconomy';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import { PERSONALITY_IDS } from '@/data/games/careerPersonalities';
import { rivalLetterStakes } from '@/data/games/careerRivals';
import { seededRounds } from '@/lib/utils/careerSeeding';
import {
  electionResult,
  emptyParliament,
  seatParams,
  withPartyStatuses,
} from '@/lib/utils/careerElections';
import type { LawInForce } from '@/lib/utils/careerLaws';
import { debtInterest } from '@/lib/utils/careerCredit';
import {
  debtInterestLetter,
  debtWarningLetter,
  electionLetter,
} from '@/lib/utils/careerMail';
import { newCharacterState } from '@/lib/utils/careerMeters';
import { careerPoints } from '@/lib/utils/careerPoints';
import { characterBySlug, registerLeague } from '@/lib/utils/duelCharacters';
import type { LeagueEntry } from '@/lib/utils/leagueRoster';
import { previewLeague } from '@/components/preview/previewRoster';
import { CAREER_SAVE_VERSION } from '@/lib/utils/careerSave';
import type {
  CharacterCareerState,
  MailItem,
  NewsItem,
  Parliament,
  SavedCareer,
  SlotAction,
  SponsorId,
  SeasonRecord,
} from '@/lib/utils/careerSave';

export type SampleCareerOptions = {
  slugs: string[];
  playerSlug?: string;
  phase?: 'offseason' | 'cup';
  year?: number;
  season?: number;
  // The counted result is waiting for the broadcast; nobody governs yet
  pendingElection?: boolean;
  // No parliament at all, the league before its first election year
  noParliament?: boolean;
  // The books: laws in force under the sitting government
  laws?: LawInForce[];
};

// Sponsors by seed: two coaches on each list, the rest free agents
const SPONSOR_BY_SEED: Partial<Record<number, SponsorId>> = {
  0: 'red',
  1: 'green',
  2: 'red',
  4: 'blue',
  5: 'yellow',
  6: 'green',
  7: 'blue',
  12: 'yellow',
};

// The character who plays the part of the given seed: the seed itself, or
// someone else when the seed is the player or the list is too short for it
function seatOf(slugs: string[], playerSlug: string, seed: number): string {
  const slug = slugs[seed];
  if (slug && slug !== playerSlug) return slug;
  const others = slugs.filter((s) => s !== playerSlug);
  return others[seed % Math.max(others.length, 1)] ?? playerSlug;
}

// The preview league's own entries for the slugs, registered so the
// screens read their names
function sampleLeague(slugs: string[]): LeagueEntry[] {
  const known = new Map(previewLeague().map((entry) => [entry.slug, entry]));
  const league = slugs.map(
    (slug, i) =>
      known.get(slug) ?? { slug, name: characterBySlug(slug).name, epithet: i },
  );
  registerLeague(league);
  return league;
}

const SAMPLE_VOTES: Record<SponsorId, number> = {
  red: 33,
  yellow: 27,
  blue: 25,
  green: 15,
};

let sampleMailId = 0;

function letter(
  kind: MailItem['kind'],
  templateKey: string,
  extra: Partial<MailItem> = {},
): MailItem {
  sampleMailId += 1;
  return {
    id: `sample-${kind}-${sampleMailId}`,
    kind,
    year: 3,
    season: 0,
    templateKey,
    params: {},
    read: false,
    ...extra,
  };
}

// One of every letter the mailbox knows, sealed
export function sampleMail(
  playerSlug: string,
  rivalSlug: string,
  oppositionSlug: string,
): MailItem[] {
  return [
    letter('info', 'welcome', { params: { amount: 100 }, amount: 100 }),
    letter('info', 'overlord', { params: { points: OVERLORD_POINTS } }),
    letter('stipend', 'stipend', { params: { amount: 40 }, amount: 40 }),
    letter('sponsor-offer', 'sponsor-offer', { sponsorId: 'yellow' }),
    letter('rival', 'rival-taunt', {
      params: { name: rivalSlug, ...rivalLetterStakes },
      refs: { name: 'character' },
    }),
    letter('donation', 'donation', { sponsorId: 'red' }),
    letter('campaign', 'campaign'),
    letter('info', 'campaign-declined', { sponsorId: 'blue' }),
    letter('election', 'election', { params: { status: 'leader' } }),
    electionLetter(3, 0, 'leader', { slug: playerSlug, you: true }),
    electionLetter(3, 0, 'opposition', { slug: oppositionSlug, you: false }),
    letter('favor', 'favor', { sponsorId: 'red', params: { count: 2 } }),
    letter('tax', 'tax', { params: { amount: 30 } }),
    letter('tax-refund', 'tax-refund', { params: { amount: 30 }, amount: 30 }),
    debtInterestLetter(3, 0, 180, debtInterest(180)),
    debtWarningLetter(3, 0),
    letter('info', 'season-prices', { params: { pct: 15 } }),
    letter('info', 'glizzy-market-unlocked'),
    letter('info', 'glizzy-bet', {
      params: { call: 'up', actualPct: 8, stake: 50, payout: 135 },
    }),
    letter('info', 'glizzy-bet', {
      params: { call: 'down', actualPct: 0, stake: 25, payout: 0 },
    }),
    ...sampleLawMail(),
  ];
}

// The chamber's post after a law vote, one of each verdict, and the city's
// statement of what the laws took and paid
export function sampleLawMail(): MailItem[] {
  const vote = (
    law: string,
    action: 'pass' | 'repeal',
    outcome: 'passed' | 'failed',
    yes: number,
    no: number,
    repealed = '',
  ) =>
    letter('law', 'law-vote', {
      params: { law, action, outcome, yes, no, repealed, party: 'red' },
    });
  return [
    vote('training-subsidy', 'pass', 'passed', 14, 3),
    vote('amnesty', 'pass', 'passed', 11, 6, 'public-order'),
    vote('fencing', 'pass', 'failed', 4, 13),
    vote('curfew', 'repeal', 'passed', 12, 5),
    letter('law', 'law-bill', {
      params: {
        lines: 'tourist-tax=30;lottery=-20;wealth-tax=-25',
        total: -15,
      },
    }),
  ];
}

function news(
  templateKey: string,
  slug: string,
  params: NewsItem['params'] = {},
  freezeframe?: string,
  refs?: NewsItem['refs'],
): NewsItem {
  return { kind: 'league', templateKey, params, refs, slugs: [slug], freezeframe };
}

// The election-year stories, in the order the paper would meet them
export function sampleElectionNews(
  playerSlug: string,
  otherSlug: string,
): NewsItem[] {
  const poll = { red: 31, yellow: 27, blue: 24, green: 18 };
  return [
    news(
      'election-year',
      playerSlug,
      { parties: 'green,red,yellow,blue' },
      'ballot',
      { parties: 'sponsorList' },
    ),
    news('election-poll', playerSlug, seatParams(poll), 'poll'),
    news('glizi-price-up', playerSlug, { pct: 10 }),
    news('glizi-price-down', playerSlug, { pct: 10 }),
    news('removal-red', otherSlug, {}, 'police'),
    news('removal-affair', otherSlug, { sponsor: 'red' }),
    news('cup-removed', otherSlug, {}, 'police'),
  ];
}

const SLOT_SAMPLE: SlotAction[] = [
  { kind: 'training', trainingId: 'stomach', outcome: 'progress' },
  { kind: 'rest' },
  { kind: 'media' },
];

// A league three years in, with a parliament: enough history for the table,
// the calendar and the chamber to have something to show
export function sampleCareer(options: SampleCareerOptions): SavedCareer {
  const {
    slugs,
    playerSlug = slugs[0],
    phase = 'offseason',
    year = 3,
    season = 0,
    pendingElection = false,
    noParliament = false,
    laws,
  } = options;
  const seat = (seed: number) => seatOf(slugs, playerSlug, seed);
  const characters: Record<string, CharacterCareerState> = {};
  slugs.forEach((slug, i) => {
    const base = newCharacterState(slug, slug !== playerSlug);
    const sponsor = SPONSOR_BY_SEED[i];
    characters[slug] = {
      ...base,
      fame: 25 + ((i * 11) % 65),
      wins: (i * 5) % 11,
      losses: (i * 3) % 7,
      titles: slug === seat(3) ? 3 : slug === seat(2) ? 2 : 0,
      titleStreak: slug === seat(3) ? 3 : 0,
      money: 200 + ((i * 37) % 300),
      sponsor: sponsor ? { sponsorId: sponsor } : null,
      lastPlace: (i % 16) + 1,
    };
  });

  const result = electionResult(SAMPLE_VOTES);
  // The leading list's best placed coach took the office on election night
  const primeMinister =
    slugs.find(
      (slug) => characters[slug].sponsor?.sponsorId === result.government[0],
    ) ?? null;
  const parliament: Parliament | undefined = noParliament
    ? undefined
    : pendingElection
      ? { ...emptyParliament(), pendingResult: result }
      : {
          ...emptyParliament(),
          seats: result.seats,
          government: result.government,
          primeMinister,
          electedYear: year - 1,
          // Two rungs of the chest for the player, one for the eighth seed
          // on the junior partner, and a Yellow Party donor the opposition
          // cannot cash
          lastDonors: {
            [seat(7)]: 100,
            [seat(5)]: 2000,
            [playerSlug]: 500,
          },
          // The next campaign is already moving: money in, affairs on record,
          // the glizzy price against the leader, and a poll on the stands
          donations: { red: 250, yellow: 60, blue: 120, green: 20 },
          donors: {
            [seat(1)]: 20,
            [seat(4)]: 20,
            [seat(7)]: 100,
            [seat(5)]: 60,
            [seat(2)]: 150,
            [playerSlug]: 100,
          },
          penalties: { red: 4, yellow: 2, blue: 0, green: 1 },
          rating: -3,
          poll: { red: 40, yellow: 22, blue: 24, green: 14 },
          elections: 1,
          ...(laws ? { laws } : {}),
        };
  const governed = parliament?.government ?? [];
  const seeds = [playerSlug, ...slugs.filter((s) => s !== playerSlug)];
  const cup =
    phase === 'cup'
      ? {
          rounds: seededRounds(seeds),
          currentRound: 0,
          matchBets: {},
          withdrawn: false,
        }
      : null;
  const logsByYear: Record<number, SlotAction[][]> = {};
  for (let y = 1; y < year; y++) {
    logsByYear[y] = [SLOT_SAMPLE, SLOT_SAMPLE, SLOT_SAMPLE, SLOT_SAMPLE];
  }
  const standingsHistory: SeasonRecord[] = [];
  const points: Record<string, number> = Object.fromEntries(
    slugs.map((slug) => [slug, 0]),
  );
  let cupsPlayed = 0;
  for (let y = 1; y < year; y++) {
    for (let s = 0; s < 4; s++) {
      cupsPlayed += 1;
      // A deterministic wobble so every line on the report's charts moves
      slugs.forEach((slug, i) => {
        points[slug] += 4 + ((i * 7 + cupsPlayed * 11 + slug.length) % 19) - 6;
      });
      const ranks = [...slugs].sort((a, b) => points[b] - points[a]);
      standingsHistory.push({
        year: y,
        season: s,
        champion: s % 2 === 0 ? seat(3) : seat(2),
        playerPlace: ranks.indexOf(playerSlug) + 1,
        ranks,
        points: { ...points },
      });
    }
  }

  return {
    version: CAREER_SAVE_VERSION,
    league: sampleLeague(slugs),
    playerSlug,
    year,
    season,
    phase,
    slotsUsed: phase === 'cup' ? 3 : 0,
    slotLog: [],
    balance: 640,
    mediaUses: 0,
    betStake: 5,
    seasonPricePct: 15,
    gliziPricePct: 10,
    gliziPriceIndex: 1.21,
    gliziPriceHistory: [1, 1, 0.92, 0.92, 1.03, 1.03, 1.15, 1.1, 1.21],
    rivalSlug: seat(4),
    logsByYear,
    characters: withPartyStatuses(characters, governed),
    pendingSabotages: [],
    newsQueue: sampleElectionNews(playerSlug, seat(5)),
    newsSeen: false,
    mail: sampleMail(playerSlug, seat(4), seat(2)),
    cup,
    cupStartRanks: seeds,
    lastCupRanks: seeds,
    standingsHistory,
    ...(parliament ? { parliament } : {}),
    ...(parliament && !pendingElection
      ? {
          governments: [
            { year: year - 1, government: result.government, primeMinister },
          ],
        }
      : {}),
  };
}

// A campaign at its end, built backwards from a believable final table: a
// spread of titles with the odd streak, records that fit the titles, points
// that climb cup by cup towards each character's final score with a jump on
// the cups they won, and the crown on whoever the caller names
export function sampleFinishedCareer(
  slugs: string[],
  overlordSlug: string,
): SavedCareer {
  const save = sampleCareer({ slugs, phase: 'offseason', year: 6, season: 1 });
  const playerSlug = save.playerSlug;
  const cups = save.standingsHistory.length;
  const seat = (seed: number) => seatOf(slugs, playerSlug, seed);

  const share: Record<string, number> = {};
  const give = (slug: string, titles: number) => {
    share[slug] = (share[slug] ?? 0) + titles;
  };
  give(overlordSlug, 7);
  give(playerSlug === overlordSlug ? seat(3) : playerSlug, 3);
  give(seat(2), 4);
  give(seat(5), 2);
  give(seat(1), 2);
  give(seat(7), 1);
  give(seat(4), 1);
  const given = Object.values(share).reduce((a, b) => a + b, 0);
  share[overlordSlug] += cups - given;

  // Champions spread across the cups, with a lean towards repeating so a
  // few streaks show up
  const remaining = { ...share };
  const champions: string[] = [];
  for (let k = 0; k < cups; k++) {
    const previous = champions[k - 1];
    const pick = Object.keys(remaining)
      .filter((slug) => remaining[slug] > 0)
      .sort(
        (a, b) =>
          (remaining[b] / share[b]) * (b === previous ? 1.35 : 1) -
          (remaining[a] / share[a]) * (a === previous ? 1.35 : 1),
      )[0];
    champions.push(pick);
    remaining[pick] -= 1;
  }
  const streakOf = (slug: string) => {
    let streak = 0;
    for (let k = champions.length - 1; k >= 0 && champions[k] === slug; k--) {
      streak += 1;
    }
    return streak;
  };

  const h2h: Record<string, [number, number]> = {};
  const characters: Record<string, CharacterCareerState> = {};
  slugs.forEach((slug, i) => {
    const ch = save.characters[slug];
    const titles = share[slug] ?? 0;
    const crowned = slug === overlordSlug;
    const wins = titles * 4 + 6 + ((i * 7) % 23) + (crowned ? 10 : 0);
    const losses = Math.max(4, cups - titles - ((i * 5) % 9));
    if (slug !== playerSlug) {
      const key = [slug, playerSlug].sort().join('|');
      const theirs = (i * 5) % 4;
      const mine = (i * 7) % 5;
      h2h[key] = key.startsWith(slug) ? [theirs, mine] : [mine, theirs];
    }
    characters[slug] = {
      ...ch,
      // The base roll is random; the report renders on both ends, so the
      // fixture picks temperaments in a fixed rotation instead
      ...(ch.personality
        ? { personality: PERSONALITY_IDS[i % PERSONALITY_IDS.length] }
        : {}),
      titles,
      titleStreak: streakOf(slug),
      wins,
      losses,
      eaten: wins * 3 + losses + (i % 7),
      meltdowns: (i * 3) % 4,
      forfeits: (i * 2) % 3,
      withdrawals: i % 2,
      punishments: (i * 7) % 5,
      fame: crowned ? 100 : 20 + ((i * 17) % 75),
      money: 120 + ((i * 53) % 420),
    };
  });
  // The crown belongs to the top of the table, whatever the spread produced
  const topOf = () =>
    [...slugs].sort(
      (a, b) => careerPoints(characters[b]) - careerPoints(characters[a]),
    )[0];
  while (topOf() !== overlordSlug) {
    characters[overlordSlug] = {
      ...characters[overlordSlug],
      wins: characters[overlordSlug].wins + 5,
    };
  }

  const finals = Object.fromEntries(
    slugs.map((slug) => [slug, careerPoints(characters[slug])]),
  );
  // Each character's points climb to their final score in uneven steps, a
  // bigger one on every cup they won
  const paths = Object.fromEntries(
    slugs.map((slug, i) => {
      // Some cups barely move a character, some carry him a long way
      const weights = champions.map(
        (champion, k) =>
          0.3 + ((i * 13 + k * 7) % 10) / 6 + (champion === slug ? 2.5 : 0),
      );
      const total = weights.reduce((a, b) => a + b, 0);
      let sum = 0;
      return [
        slug,
        weights.map((w) => {
          sum += w;
          return Math.round((finals[slug] * sum) / total);
        }),
      ];
    }),
  );
  const standingsHistory = save.standingsHistory.map((record, k) => {
    const points = Object.fromEntries(
      slugs.map((slug) => [slug, paths[slug][k]]),
    );
    const ranks = [...slugs].sort((a, b) => points[b] - points[a]);
    // The cup placing, not the table place: a title is always first
    const playerPlace =
      champions[k] === playerSlug ? 1 : 2 + ((k * 5 + 3) % 8);
    return {
      ...record,
      champion: champions[k],
      playerPlace,
      ranks,
      points,
    };
  });
  // The market and the chamber over the whole run: a price walk with one
  // close per window, and a vote every other year from the second
  const gliziPriceHistory = standingsHistory.reduce<number[]>(
    (history, _, k) => {
      const last = history[history.length - 1];
      const move = ((k * 7 + 3) % 11) / 100 - 0.04;
      return [...history, Math.round(last * (1 + move) * 100) / 100];
    },
    [1],
  );
  const parties = [...SPONSOR_IDS];
  const governments = standingsHistory
    .filter((record) => record.year % 2 === 0 && record.season === 3)
    .map((record, i) => {
      const government = [
        parties[(i * 2) % parties.length],
        parties[(i * 2 + 1) % parties.length],
      ];
      return {
        year: record.year,
        government,
        primeMinister:
          Object.keys(characters).find(
            (slug) => characters[slug].sponsor?.sponsorId === government[0],
          ) ?? null,
      };
    });
  return {
    ...save,
    characters,
    h2h,
    overlordSlug,
    standingsHistory,
    gliziPriceHistory,
    governments,
  };
}
