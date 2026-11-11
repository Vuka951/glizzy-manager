import {
  COACH_INHERITANCE,
  LEAGUE_STIPEND,
  OVERLORD_POINTS,
  type OverlordPoints,
} from '@/data/games/careerEconomy';
import type { GlizzyBetResult } from '@/data/games/careerGlizzflationBets';
import { RIVAL_WIN_MONEY, rivalLetterStakes } from '@/data/games/careerRivals';
import type { MailSender } from '@/lib/constants/mailSenders';
import type {
  MailItem,
  NewsItem,
  PartyStatus,
  SponsorId,
} from '@/lib/utils/careerSave';
import type { MessageParams, MessageRefs } from '@/lib/utils/message';
import { seasonPriceAgainstLean } from '@/lib/utils/careerSeasonPrices';

const LEAGUE_LETTERS = new Set([
  'overlord',
  'stipend',
  'stipend-cut',
  'rival-taunt',
  'derby-win',
  'investments-unlocked',
  'underworld-unlocked',
  'tape-unlocked',
  'studio-unlocked',
  'season-prices',
  'betting-unlocked',
]);

// What the reader should open first: answers only they can give, then what
// changes where they stand, then the money and bills already settled, and last
// the notices
const DECISION_KINDS = new Set(['sponsor-offer', 'donation', 'campaign']);
const STANDING_KINDS = new Set(['election', 'law', 'favor', 'rival']);
const STANDING_TEMPLATES = new Set([
  'overlord',
  'yellow-warning',
  'yellow-debt-warning',
  'yellow-run-over',
]);
const MONEY_KINDS = new Set(['stipend', 'tax', 'tax-refund']);
const MONEY_TEMPLATES = new Set([
  'law-bill',
  'yellow-interest',
  'glizzy-bet',
  'stipend-cut',
]);

function mailImportance(item: MailItem): number {
  if (item.templateKey === 'welcome' || DECISION_KINDS.has(item.kind)) return 0;
  if (STANDING_KINDS.has(item.kind) || STANDING_TEMPLATES.has(item.templateKey)) {
    return 1;
  }
  if (MONEY_KINDS.has(item.kind) || MONEY_TEMPLATES.has(item.templateKey)) {
    return 2;
  }
  return 3;
}

export function byMailImportance(mail: MailItem[]): MailItem[] {
  return [...mail].sort((a, b) => mailImportance(a) - mailImportance(b));
}

// Who signs a letter, going by what its head says: a party under its own name,
// the city's institutions, or the league's federation
export function mailSender(item: MailItem): MailSender {
  if (item.kind === 'tax' || item.kind === 'tax-refund') return 'yellow';
  if (
    item.kind === 'law' ||
    item.kind === 'election' ||
    item.kind === 'campaign' ||
    item.templateKey === 'law-bill'
  ) {
    return 'government';
  }
  if (LEAGUE_LETTERS.has(item.templateKey)) return 'league';
  return item.sponsorId ?? 'post';
}

let mailCounter = 0;

export function welcomeLetter(): MailItem {
  mailCounter += 1;
  return {
    id: `welcome-${mailCounter}`,
    kind: 'info',
    year: 1,
    season: 0,
    templateKey: 'welcome',
    params: { amount: COACH_INHERITANCE },
    refs: { amount: 'count' },
    amount: COACH_INHERITANCE,
    read: false,
  };
}

// The league's own letter on day one: what the crown costs, in points
export function overlordLetter(
  points: OverlordPoints = OVERLORD_POINTS,
): MailItem {
  mailCounter += 1;
  return {
    id: `overlord-${mailCounter}`,
    kind: 'info',
    year: 1,
    season: 0,
    templateKey: 'overlord',
    params: { points },
    refs: { points: 'count' },
    read: false,
  };
}

export function stipendLetter(year: number, season: number): MailItem {
  mailCounter += 1;
  return {
    id: `stipend-${year}-${season}-${mailCounter}`,
    kind: 'stipend',
    year,
    season,
    templateKey: 'stipend',
    params: { amount: LEAGUE_STIPEND },
    refs: { amount: 'count' },
    amount: LEAGUE_STIPEND,
    read: false,
  };
}

// The betting ban from the match fixing scandal expires two cups in; from the
// next cup on, the bookie takes bets again
export function bettingUnlockedLetter(year: number, season: number): MailItem {
  mailCounter += 1;
  return {
    id: `betting-unlocked-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'betting-unlocked',
    params: {},
    read: false,
  };
}

// The league's TV production upgrades come announced in writing: the
// pre-match graphics, then the studio open. The commentator's return runs in
// the paper instead
export function broadcastUnlockLetter(
  templateKey: 'tape-unlocked' | 'studio-unlocked',
  year: number,
  season: number,
): MailItem {
  mailCounter += 1;
  return {
    id: `${templateKey}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey,
    params: {},
    read: false,
  };
}

// The league files the feud in writing, with the derby stakes spelled out
export function rivalTauntLetter(
  year: number,
  season: number,
  rivalSlug: string,
): MailItem {
  mailCounter += 1;
  return {
    id: `rival-${year}-${season}-${mailCounter}`,
    kind: 'rival',
    year,
    season,
    templateKey: 'rival-taunt',
    params: { name: rivalSlug, ...rivalLetterStakes },
    refs: { name: 'character', money: 'count' },
    read: false,
  };
}

// The derby is won: the league's purse rides along and pays out when read
export function derbyWinLetter(
  year: number,
  season: number,
  rivalSlug: string,
): MailItem {
  mailCounter += 1;
  return {
    id: `derby-win-${year}-${season}-${mailCounter}`,
    kind: 'rival',
    year,
    season,
    templateKey: 'derby-win',
    params: { name: rivalSlug, amount: RIVAL_WIN_MONEY },
    refs: { name: 'character', amount: 'count' },
    amount: RIVAL_WIN_MONEY,
    read: false,
  };
}

// Standing contracts are for sponsored competitors only, so the rules land
// in the mail the moment the first contract is signed
export function investmentsLetter(year: number, season: number): MailItem {
  mailCounter += 1;
  return {
    id: `investments-unlocked-${year}-${season}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'investments-unlocked',
    params: {},
    read: false,
  };
}

// One cup in, the league stops pretending the off-season is only training
export function underworldLetter(year: number, season: number): MailItem {
  mailCounter += 1;
  return {
    id: `underworld-unlocked-${year}-${season}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'underworld-unlocked',
    params: {},
    read: false,
  };
}

// Every off-season opens with the league's price list: which action the
// season moves, which way and by how much this time
export function seasonPricesLetter(
  year: number,
  season: number,
  pct: number,
): MailItem {
  mailCounter += 1;
  return {
    id: `season-prices-${year}-${season}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'season-prices',
    params: {
      pct: Math.abs(pct),
      against: seasonPriceAgainstLean(season, pct) ? 1 : 0,
    },
    read: false,
  };
}

// The league's goodbye to its charity case: signing a sponsor ends the stipend
export function stipendCutLetter(year: number, season: number): MailItem {
  mailCounter += 1;
  return {
    id: `stipend-cut-${year}-${season}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'stipend-cut',
    params: {},
    read: false,
  };
}

// The election-season letter to a man without a party: every chest is open
export function campaignLetter(year: number, season: number): MailItem {
  mailCounter += 1;
  return {
    id: `campaign-${year}-${season}-${mailCounter}`,
    kind: 'campaign',
    year,
    season,
    templateKey: 'campaign',
    params: {},
    read: false,
  };
}

// The party took the outsider's money and kept the contract to itself
export function campaignDeclinedLetter(
  year: number,
  season: number,
  sponsorId: SponsorId,
): MailItem {
  mailCounter += 1;
  return {
    id: `campaign-declined-${year}-${season}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'campaign-declined',
    params: {},
    sponsorId,
    read: false,
  };
}

export function donationLetter(
  year: number,
  season: number,
  sponsorId: SponsorId,
): MailItem {
  mailCounter += 1;
  return {
    id: `donation-${year}-${season}-${mailCounter}`,
    kind: 'donation',
    year,
    season,
    templateKey: 'donation',
    params: {},
    sponsorId,
    read: false,
  };
}

// The premier goes in by slug, and the reader learns when it is him
export function electionLetter(
  year: number,
  season: number,
  status: PartyStatus | 'none',
  premier: { slug: string; you: boolean } | null = null,
): MailItem {
  mailCounter += 1;
  return {
    id: `election-${year}-${season}-${mailCounter}`,
    kind: 'election',
    year,
    season,
    templateKey: 'election',
    params: {
      status,
      ...(premier
        ? { premier: premier.slug, ...(premier.you ? { premierYou: 1 } : {}) }
        : {}),
    },
    ...(premier ? { refs: { premier: 'character' } } : {}),
    read: false,
  };
}

export function favorLetter(
  year: number,
  season: number,
  sponsorId: SponsorId,
  count: number,
): MailItem {
  mailCounter += 1;
  return {
    id: `favor-${year}-${season}-${mailCounter}`,
    kind: 'favor',
    year,
    season,
    templateKey: 'favor',
    params: { count },
    sponsorId,
    read: false,
  };
}

// The Yellow Party's tax office writes twice: the bill is already deducted
// when the letter lands, the refund rides along and pays out when claimed
export function taxLetter(year: number, season: number, amount: number): MailItem {
  mailCounter += 1;
  return {
    id: `tax-${year}-${season}-${mailCounter}`,
    kind: 'tax',
    year,
    season,
    templateKey: 'tax',
    params: { amount },
    refs: { amount: 'count' },
    read: false,
  };
}

export function taxRefundLetter(
  year: number,
  season: number,
  amount: number,
): MailItem {
  mailCounter += 1;
  return {
    id: `tax-refund-${year}-${season}-${mailCounter}`,
    kind: 'tax-refund',
    year,
    season,
    templateKey: 'tax-refund',
    params: { amount },
    refs: { amount: 'count' },
    amount,
    read: false,
  };
}

// The Yellow Party's bill on a debt, already on the debt when the letter lands
export function debtInterestLetter(
  year: number,
  season: number,
  debt: number,
  amount: number,
): MailItem {
  mailCounter += 1;
  return {
    id: `yellow-interest-${year}-${season}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'yellow-interest',
    params: { debt, amount },
    sponsorId: 'yellow',
    read: false,
  };
}

// Three years owing: the Yellow Party's only reminder
export function debtWarningLetter(year: number, season: number): MailItem {
  mailCounter += 1;
  return {
    id: `yellow-warning-${year}-${season}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'yellow-warning',
    params: {},
    sponsorId: 'yellow',
    read: false,
  };
}

// The chamber writes every coach once a law vote closes: the law, what
// happened to it and the tally. A law's text rides along by its id
export function lawLetter(
  year: number,
  season: number,
  params: {
    law: string;
    action: string;
    outcome: string;
    yes: number;
    no: number;
    repealed: string;
    party: SponsorId;
  },
): MailItem {
  mailCounter += 1;
  const { party, ...rest } = params;
  return {
    id: `law-${year}-${season}-${mailCounter}`,
    kind: 'law',
    year,
    season,
    templateKey: 'law-vote',
    params: rest,
    refs: { law: 'law', repealed: 'lawList' },
    sponsorId: party,
    read: false,
  };
}

// What the laws on the books took or paid this window, already in the
// wallet when the letter lands. Lines read law=amount, joined with ';'
export function lawBillLetter(
  year: number,
  season: number,
  lines: string,
  total: number,
): MailItem {
  mailCounter += 1;
  return {
    id: `law-bill-${year}-${season}-${mailCounter}`,
    kind: 'law',
    year,
    season,
    templateKey: 'law-bill',
    params: { lines, total },
    read: false,
  };
}

// The bookie's word on the glizzflation ticket once the story printed; the
// money moved at settlement, so there is nothing to claim
export function glizzyBetLetter(
  year: number,
  season: number,
  result: GlizzyBetResult,
): MailItem {
  mailCounter += 1;
  return {
    id: `glizzy-bet-${year}-${season}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'glizzy-bet',
    params: {
      call: result.call,
      actualPct: result.actualPct,
      stake: result.stake,
      payout: result.payout,
    },
    read: false,
  };
}

// With the first government in, the bookie opens a book on the glizi price
export function glizzyMarketLetter(year: number, season: number): MailItem {
  mailCounter += 1;
  return {
    id: `glizzy-market-${year}-${season}-${mailCounter}`,
    kind: 'info',
    year,
    season,
    templateKey: 'glizzy-market-unlocked',
    params: {},
    read: false,
  };
}

export function leagueNews(
  templateKey: string,
  slug: string,
  params: MessageParams = {},
  freezeframe?: string,
  refs?: MessageRefs,
): NewsItem {
  return {
    kind: 'league',
    templateKey,
    params,
    ...(refs ? { refs } : {}),
    slugs: [slug],
    freezeframe,
  };
}

// Two doors a window can open: the earned call and the fluke
export function sponsorOfferLetter(
  year: number,
  season: number,
  sponsorId: SponsorId,
  wildcard: boolean,
): MailItem {
  mailCounter += 1;
  return {
    id: `offer-${sponsorId}-${year}-${season}-${mailCounter}`,
    kind: 'sponsor-offer',
    year,
    season,
    templateKey: wildcard ? 'sponsor-offer-wildcard' : 'sponsor-offer',
    params: {},
    sponsorId,
    read: false,
  };
}
