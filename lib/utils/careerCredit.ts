import {
  CREDIT_LIMIT_BASE,
  CREDIT_LIMIT_LEADER,
  CREDIT_LIMIT_OPPOSITION,
  DEBT_INTEREST_MIN,
  DEBT_INTEREST_RATE,
  DEBT_RUN_OVER_WINDOWS,
  DEBT_WARNING_WINDOWS,
} from '@/data/games/careerCredit';
import { creditLawLine } from '@/lib/utils/careerLaws';
import {
  debtInterestLetter,
  debtWarningLetter,
} from '@/lib/utils/careerMail';
import type {
  CharacterCareerState,
  MailItem,
  NewsItem,
  Parliament,
} from '@/lib/utils/careerSave';

function yellowLine(ch: CharacterCareerState | undefined): number {
  if (ch?.sponsor?.sponsorId !== 'yellow') return 0;
  if (ch.partyStatus === 'leader') return CREDIT_LIMIT_LEADER;
  if (ch.partyStatus === 'opposition') return CREDIT_LIMIT_OPPOSITION;
  return CREDIT_LIMIT_BASE;
}

// How much this character may owe the bank at the counter: the
// The Yellow Party's line for its own clients, plus the credit law's line for
// everyone while it stands
export function creditLimit(
  ch: CharacterCareerState | undefined,
  parliament?: Parliament,
): number {
  if (!ch) return 0;
  return yellowLine(ch) + creditLawLine(parliament);
}

// The league's own clients still run a tab: they may sign a standing
// contract this far below zero
export function withinCredit(
  balance: number,
  cost: number,
  limit: number,
): boolean {
  return balance - cost >= -limit;
}

export function loanOf(ch: CharacterCareerState | undefined): number {
  return ch?.loan ?? 0;
}

// What is left on the line; interest can run a loan past it
export function creditRoom(
  ch: CharacterCareerState | undefined,
  parliament?: Parliament,
): number {
  return Math.max(0, creditLimit(ch, parliament) - loanOf(ch));
}

// Everything owed: the loan, plus a wallet a bill pushed below zero
export function debtOf(
  ch: CharacterCareerState | undefined,
  wallet: number,
): number {
  return loanOf(ch) + Math.max(0, -wallet);
}

export function debtInterest(debt: number): number {
  if (debt <= 0) return 0;
  return Math.max(DEBT_INTEREST_MIN, Math.round(debt * DEBT_INTEREST_RATE));
}

export type LoanMove = { ch: CharacterCareerState; wallet: number };

// Cash out at the counter, up to what is left on the line
export function borrowLoan(
  ch: CharacterCareerState,
  wallet: number,
  amount: number,
  parliament?: Parliament,
): LoanMove | null {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  if (amount > creditRoom(ch, parliament)) return null;
  return {
    ch: { ...ch, loan: loanOf(ch) + amount },
    wallet: wallet + amount,
  };
}

// Pay back out of the wallet, never more than is owed
export function repayLoan(
  ch: CharacterCareerState,
  wallet: number,
  amount: number,
): LoanMove | null {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  if (amount > loanOf(ch) || amount > wallet) return null;
  return {
    ch: { ...ch, loan: loanOf(ch) - amount },
    wallet: wallet - amount,
  };
}

const UNTRAINED = { level: 0, progress: 0 };

// What the car leaves behind: no debt, no contracts, every session ever
// trained gone. The fame, the table and the sponsor stay where they were
function runOver(ch: CharacterCareerState): CharacterCareerState {
  return {
    ...ch,
    livesCap: UNTRAINED,
    njuh: UNTRAINED,
    nutrition: UNTRAINED,
    fanSkill: UNTRAINED,
    investments: {},
    debtWindows: 0,
    loan: 0,
  };
}

export type DebtWindow = {
  ch: CharacterCareerState;
  wallet: number;
  interest: number;
  warned: boolean;
  runOver: boolean;
};

// One character's debt as a window opens: the clock stops the moment
// nothing is owed, otherwise it ticks and the interest goes on the debt. The
// window the clock runs out the car comes instead of the bill, and the
// wallet goes toward the loan
function openDebtWindow(
  ch: CharacterCareerState,
  wallet: number,
): DebtWindow {
  const debt = debtOf(ch, wallet);
  const loan = loanOf(ch);
  if (debt <= 0) {
    return {
      ch: ch.debtWindows ? { ...ch, debtWindows: 0 } : ch,
      wallet,
      interest: 0,
      warned: false,
      runOver: false,
    };
  }
  const windows = (ch.debtWindows ?? 0) + 1;
  if (windows >= DEBT_RUN_OVER_WINDOWS) {
    return {
      ch: runOver(ch),
      wallet: Math.max(0, wallet - loan),
      interest: 0,
      warned: false,
      runOver: true,
    };
  }
  const interest = debtInterest(debt);
  return {
    ch: {
      ...ch,
      debtWindows: windows,
      ...(loan > 0 ? { loan: loan + interest } : {}),
    },
    wallet: loan > 0 ? wallet : wallet - interest,
    interest,
    warned: windows === DEBT_WARNING_WINDOWS,
    runOver: false,
  };
}

function debtNews(
  slug: string,
  templateKey: 'yellow-debt-warning' | 'yellow-run-over',
): NewsItem {
  return {
    kind: 'yellow',
    templateKey,
    params: {},
    slugs: [slug],
    freezeframe: templateKey,
  };
}

export type LeagueDebt = {
  characters: Record<string, CharacterCareerState>;
  // The human wallets after the window's bill, by slug
  wallets: Record<string, number>;
  // What the opening took off each debtor, and the debt it was taken on
  interest: Record<string, { debt: number; amount: number }>;
  warned: string[];
  runOver: string[];
  news: NewsItem[];
};

// The whole league's debts as a window opens. The humans' wallets come in by
// slug, everybody else carries his own money on the character
export function openLeagueDebt(
  characters: Record<string, CharacterCareerState>,
  wallets: Record<string, number>,
): LeagueDebt {
  const out: LeagueDebt = {
    characters: { ...characters },
    wallets: { ...wallets },
    interest: {},
    warned: [],
    runOver: [],
    news: [],
  };
  Object.entries(characters).forEach(([slug, ch]) => {
    const human = slug in wallets;
    const wallet = human ? wallets[slug] : ch.money;
    if (wallet === undefined) return;
    const result = openDebtWindow(ch, wallet);
    out.characters[slug] =
      human || result.wallet === wallet
        ? result.ch
        : { ...result.ch, money: result.wallet };
    if (human) out.wallets[slug] = result.wallet;
    if (result.interest > 0) {
      out.interest[slug] = {
        debt: debtOf(ch, wallet),
        amount: result.interest,
      };
    }
    if (result.warned) {
      out.warned.push(slug);
      out.news.push(debtNews(slug, 'yellow-debt-warning'));
    }
    if (result.runOver) {
      out.runOver.push(slug);
      out.news.push(debtNews(slug, 'yellow-run-over'));
    }
  });
  return out;
}

// The letters a human debtor finds as the window opens
export function debtLetters(
  debt: LeagueDebt,
  slug: string,
  year: number,
  season: number,
): MailItem[] {
  const interest = debt.interest[slug];
  return [
    ...(interest
      ? [debtInterestLetter(year, season, interest.debt, interest.amount)]
      : []),
    ...(debt.warned.includes(slug) ? [debtWarningLetter(year, season)] : []),
  ];
}
