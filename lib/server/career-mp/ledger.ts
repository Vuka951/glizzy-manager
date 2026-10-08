import type { CoachState } from '@/lib/server/career-mp/room';
import type { LedgerCategory } from '@/lib/types/careerMp';

export function withLedger(
  cs: CoachState,
  year: number,
  season: number,
  category: LedgerCategory,
  amount: number,
): CoachState {
  if (amount === 0) return cs;
  return {
    ...cs,
    ledger: [...cs.ledger, { year, season, category, amount }],
  };
}
