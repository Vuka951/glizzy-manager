import {
  KORPORACIJA_LEAD_REFUND,
  KORPORACIJA_LEAD_TAX,
  OSTRVO_LEAD_SABOTAGE_TAX,
  STRANKA_LEAD_FAME_BONUS,
  STRANKA_LEAD_FANS_TRAINING_SCALE,
  STRANKA_LEAD_OUTSIDE_FAME_SCALE,
  STRANKA_LEAD_OUTSIDE_PAY_SCALE,
  ZIDARI_LEAD_BLOCK_BONUS,
  ZIDARI_LEAD_BLOCK_CAP,
  ZIDARI_LEAD_GUARD_TAX,
} from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const LINES = GAMES_UI.career.parliament.effects.leader;

export function percentOf(scale: number): number {
  return Math.round(scale * 100);
}

const OWN_PARAMS: Record<SponsorId, Record<string, number>> = {
  zidari: {
    bonus: percentOf(ZIDARI_LEAD_BLOCK_BONUS),
    cap: percentOf(ZIDARI_LEAD_BLOCK_CAP),
  },
  ostrvo: {},
  korporacija: { refund: KORPORACIJA_LEAD_REFUND },
  stranka: {
    fame: STRANKA_LEAD_FAME_BONUS,
    discount: percentOf(1 - STRANKA_LEAD_FANS_TRAINING_SCALE),
  },
};

const OUTSIDE_PARAMS: Record<SponsorId, Record<string, number>> = {
  zidari: { tax: percentOf(ZIDARI_LEAD_GUARD_TAX) },
  ostrvo: { tax: percentOf(OSTRVO_LEAD_SABOTAGE_TAX) },
  korporacija: { tax: KORPORACIJA_LEAD_TAX },
  stranka: {
    fame: percentOf(STRANKA_LEAD_OUTSIDE_FAME_SCALE),
    pay: percentOf(STRANKA_LEAD_OUTSIDE_PAY_SCALE),
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
