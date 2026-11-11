import { SEASON_COUNT } from '@/data/games/careerSeasons';

// The Yellow Party lends to its own clients at the bank's counter: the most one
// may owe, by seat. Anyone else borrows only while the credit law stands
export const CREDIT_LIMIT_LEADER = 500;
export const CREDIT_LIMIT_OPPOSITION = 200;
export const CREDIT_LIMIT_BASE = 300;

// Every window opens with the bill on whatever is owed: a tenth of the debt,
// never under the minimum, added to the debt. Interest may run a client past
// his limit
export const DEBT_INTEREST_RATE = 0.1;
export const DEBT_INTEREST_MIN = 5;

// Window openings in a row spent owing: after three years the Yellow Party
// writes, after four it sends a car
export const DEBT_WARNING_WINDOWS = 3 * SEASON_COUNT;
export const DEBT_RUN_OVER_WINDOWS = 4 * SEASON_COUNT;

// The league's own clients never visit the counter: they only run a tab for
// the next standing contract on their list, never past this share of the
// line, and it is settled from whatever they earn
export const AI_CREDIT_DEPTH = 0.5;

// The amounts the counter offers, below whatever is left to take or to pay
export const LOAN_STEPS = [25, 50, 100, 200];
