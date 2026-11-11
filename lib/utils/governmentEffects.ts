import {
  YELLOW_LEAD_REFUND,
  YELLOW_LEAD_TAX,
  GREEN_LEAD_SABOTAGE_TAX,
  RED_LEAD_FAME_BONUS,
  RED_LEAD_FANS_TRAINING_SCALE,
  RED_LEAD_OUTSIDE_FAME_SCALE,
  RED_LEAD_OUTSIDE_PAY_SCALE,
  BLUE_LEAD_BLOCK_BONUS,
  BLUE_LEAD_BLOCK_CAP,
  BLUE_LEAD_GUARD_TAX,
} from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const LINES = GAMES_UI.career.parliament.effects.leader;

export function percentOf(scale: number): number {
  return Math.round(scale * 100);
}

const OWN_PARAMS: Record<SponsorId, Record<string, number>> = {
  blue: {
    bonus: percentOf(BLUE_LEAD_BLOCK_BONUS),
    cap: percentOf(BLUE_LEAD_BLOCK_CAP),
  },
  green: {},
  yellow: { refund: YELLOW_LEAD_REFUND },
  red: {
    fame: RED_LEAD_FAME_BONUS,
    discount: percentOf(1 - RED_LEAD_FANS_TRAINING_SCALE),
  },
};

const OUTSIDE_PARAMS: Record<SponsorId, Record<string, number>> = {
  blue: { tax: percentOf(BLUE_LEAD_GUARD_TAX) },
  green: { tax: percentOf(GREEN_LEAD_SABOTAGE_TAX) },
  yellow: { tax: YELLOW_LEAD_TAX },
  red: {
    fame: percentOf(RED_LEAD_OUTSIDE_FAME_SCALE),
    pay: percentOf(RED_LEAD_OUTSIDE_PAY_SCALE),
  },
};

// What a party's power does when it leads, written out with the live numbers:
// the gift for its own clients and the bill for everyone outside the government
export function leaderEffectLines(leader: SponsorId): {
  own: string;
  outside: string;
} {
  return {
    own: fmt(LINES[leader].own, OWN_PARAMS[leader]),
    outside: fmt(LINES[leader].outside, OUTSIDE_PARAMS[leader]),
  };
}
