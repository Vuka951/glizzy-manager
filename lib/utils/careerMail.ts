import {
  COACH_INHERITANCE,
  LEAGUE_STIPEND,
  OVERLORD_POINTS,
} from '@/data/games/careerEconomy';
import { RIVAL_WIN_MONEY, rivalLetterStakes } from '@/data/games/careerRivals';
import type {
  MailItem,
  NewsItem,
  PartyStatus,
  SponsorId,
} from '@/lib/utils/careerSave';
import type { MessageParams, MessageRefs } from '@/lib/utils/message';
import { seasonPriceAgainstLean } from '@/lib/utils/careerSeasonPrices';

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
export function overlordLetter(): MailItem {
  mailCounter += 1;
  return {
    id: `overlord-${mailCounter}`,
    kind: 'info',
    year: 1,
    season: 0,
    templateKey: 'overlord',
    params: { points: OVERLORD_POINTS },
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

export function electionLetter(
  year: number,
  season: number,
  status: PartyStatus | 'none',
): MailItem {
  mailCounter += 1;
  return {
    id: `election-${year}-${season}-${mailCounter}`,
    kind: 'election',
    year,
    season,
    templateKey: 'election',
    params: { status },
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

// The Korporacija's tax office writes twice: the bill is already deducted
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
