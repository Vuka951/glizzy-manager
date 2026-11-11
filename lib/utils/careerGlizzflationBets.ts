import {
  GLIZZY_BET_PAYOUTS,
  GLIZZY_BET_STAKES,
  GLIZZY_CALLS,
  type GlizzyBet,
  type GlizzyBetResult,
  type GlizzyCall,
} from '@/data/games/careerGlizzflationBets';
import { glizzyBetLetter } from '@/lib/utils/careerMail';
import type { MailItem, Parliament } from '@/lib/utils/careerSave';

export type GlizzyBettor = {
  balance: number;
  mail: MailItem[];
  glizzyBet?: GlizzyBet;
  lastGlizzyBet?: GlizzyBetResult;
};

// The bookie opens once the city has a government to blame the price on
export function glizzyMarketOpen(state: { parliament?: Parliament }): boolean {
  return (state.parliament?.elections ?? 0) > 0;
}

export function isGlizzyCall(value: unknown): value is GlizzyCall {
  return GLIZZY_CALLS.some((call) => call === value);
}

export function isGlizzyBetStake(value: unknown): value is number {
  return GLIZZY_BET_STAKES.some((stake) => stake === value);
}

export function glizzyCallOf(pct: number): GlizzyCall {
  return pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
}

// Glizari back per glizar staked once the story is in
export function glizzyBetMultiplier(call: GlizzyCall, actualPct: number): number {
  return glizzyCallOf(actualPct) === call ? GLIZZY_BET_PAYOUTS[call] : 0;
}

// A right call pays the board's multiplier, a wrong call pays nothing
function glizzyBetPayout(bet: GlizzyBet, actualPct: number): number {
  return Math.round(bet.stake * glizzyBetMultiplier(bet.call, actualPct));
}

// The ticket replaces any earlier one in the same window, whose stake comes
// back first; null when the wallet cannot cover it
export function placeGlizzyBet<T extends GlizzyBettor>(
  state: T,
  bet: GlizzyBet,
): T | null {
  const refunded = state.balance + (state.glizzyBet?.stake ?? 0);
  if (refunded < bet.stake) return null;
  return { ...state, balance: refunded - bet.stake, glizzyBet: bet };
}

export function cancelGlizzyBet<T extends GlizzyBettor>(state: T): T {
  if (!state.glizzyBet) return state;
  return {
    ...state,
    balance: state.balance + state.glizzyBet.stake,
    glizzyBet: undefined,
  };
}

// The story is in: the ticket pays or does not, the letter says which, and
// the result stays on record until the next one
export function settleGlizzyBet<T extends GlizzyBettor>(
  state: T,
  year: number,
  season: number,
  actualPct: number,
): { state: T; result: GlizzyBetResult | null } {
  const bet = state.glizzyBet;
  if (!bet) return { state, result: null };
  const result: GlizzyBetResult = {
    ...bet,
    actualPct,
    payout: glizzyBetPayout(bet, actualPct),
  };
  return {
    state: {
      ...state,
      balance: state.balance + result.payout,
      glizzyBet: undefined,
      lastGlizzyBet: result,
      mail: [...state.mail, glizzyBetLetter(year, season, result)],
    },
    result,
  };
}
