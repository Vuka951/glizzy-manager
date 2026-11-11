import {
  GLIZI_PRICE_EVENT_CHANCE,
  GLIZI_PRICE_UP_CHANCE,
} from '@/data/games/careerElections';

// A call on the next glizzflation story: up, down, or no story at all, and
// what it was staked with
export type GlizzyCall = 'up' | 'flat' | 'down';
export type GlizzyBet = { call: GlizzyCall; stake: number };

export type GlizzyBetResult = GlizzyBet & {
  actualPct: number;
  // What came back, stake included; zero when the call was wrong
  payout: number;
};

export const GLIZZY_CALLS: GlizzyCall[] = ['up', 'flat', 'down'];
export const GLIZZY_BET_STAKES = [10, 25, 50, 100, 250];

// How often each call comes true, straight off the story roll
export const GLIZZY_CALL_CHANCES: Record<GlizzyCall, number> = {
  up: GLIZI_PRICE_EVENT_CHANCE * GLIZI_PRICE_UP_CHANCE,
  flat: 1 - GLIZI_PRICE_EVENT_CHANCE,
  down: GLIZI_PRICE_EVENT_CHANCE * (1 - GLIZI_PRICE_UP_CHANCE),
};

// The bookie keeps this share of the turnover in the long run: every
// payout sits under fair odds, so backing one call forever still bleeds
export const GLIZZY_BET_HOUSE_EDGE = 0.1;

// Glizari back per glizar staked on a right call, rounded down to a tenth
export const GLIZZY_BET_PAYOUTS: Record<GlizzyCall, number> = Object.fromEntries(
  GLIZZY_CALLS.map((call) => [
    call,
    Math.floor(((1 - GLIZZY_BET_HOUSE_EDGE) / GLIZZY_CALL_CHANCES[call]) * 10) /
      10,
  ]),
) as Record<GlizzyCall, number>;
