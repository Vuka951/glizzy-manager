import {
  SCOUT_DETAIL_LEVEL,
  SCOUT_METERS_LEVEL,
  SCOUT_SKILLS_LEVEL,
} from '@/data/games/careerInvestments';
import { investmentLevel } from '@/lib/utils/careerInvestments';
import type { CharacterCareerState } from '@/lib/utils/careerSave';

export type ScoutReveal = {
  // Trained skill levels: what the other man can actually do on the night
  skills: boolean;
  // The card itself: cholesterol, appetite, ambition, ego, fame
  meters: boolean;
  // How he spends an off-season, what he has signed, what he is sitting on
  detail: boolean;
};

export const FULL_REVEAL: ScoutReveal = {
  skills: true,
  meters: true,
  detail: true,
};

export function scoutLevel(player: CharacterCareerState): number {
  return investmentLevel(player, 'scout');
}

// What the informant on the payroll is worth when the coach opens somebody
// else's file. His own is never a secret from him
export function scoutReveal(
  player: CharacterCareerState,
  isSelf: boolean,
): ScoutReveal {
  if (isSelf) return FULL_REVEAL;
  const level = scoutLevel(player);
  return {
    skills: level >= SCOUT_SKILLS_LEVEL,
    meters: level >= SCOUT_METERS_LEVEL,
    detail: level >= SCOUT_DETAIL_LEVEL,
  };
}
