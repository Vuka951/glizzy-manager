import {
  LAW_EQUALIZING,
  LAW_GAMBLE_TASTE,
  LAW_OPPOSITION_RISK_LEADER,
  LAW_OPPOSITION_RISK_PARTNER,
  LAW_POOR_MONEY,
  LAW_STAKE_CAP,
  LAW_STRESS_PIVOT,
  LAW_STRESS_SPAN,
  LAW_TABLE_WEIGHT,
  LAW_WEALTH_PIVOT,
  VOTER_HIT_TARGETED,
  VOTER_PLOT_RATE,
  VOTER_SKILL_SPAN,
  VOTER_TOP_PLOT_DRIVE,
  type LawId,
} from '@/data/games/careerLaws';
import {
  CAREER_PERSONALITIES,
  type CareerPersonalityId,
} from '@/data/games/careerPersonalities';
import { rankBySeeding, seedingKey } from '@/lib/utils/careerPoints';
import type { CharacterCareerState, SavedCareer } from '@/lib/utils/careerSave';

// One AI coach as a chamber vote reads him
export type VoterProfile = {
  // 0 the table's leader, 1 the last place
  rankShare: number;
  money: number;
  stress: number;
  // Skill levels short of the league's median, -1 well ahead to 1 well behind
  skillGap: number;
  // 0 to 1, from his record of plots and his temperament
  plotter: number;
  // 0 to 1, how likely a plot comes for him: the top of the table, and
  // whoever has been hit lately
  targeted: number;
  oppositionRisk: number;
  personality?: CareerPersonalityId;
};

const clamp = (x: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, x));
const clamp01 = (x: number) => clamp(x, 0, 1);

function skillLevels(ch: CharacterCareerState): number {
  return (
    ch.livesCap.level + ch.njuh.level + ch.nutrition.level + ch.fanSkill.level
  );
}

export function voterProfile(
  state: SavedCareer,
  slug: string,
  leading: boolean,
  seeding: string[] = rankBySeeding(state.characters, seedingKey(state)),
): VoterProfile {
  const ch = state.characters[slug];
  const n = seeding.length;
  const rankShare = n > 1 ? Math.max(0, seeding.indexOf(slug)) / (n - 1) : 0.5;
  const levels = Object.values(state.characters)
    .map(skillLevels)
    .sort((a, b) => a - b);
  const median = levels[Math.floor(levels.length / 2)] ?? 0;
  const mind = ch.personality ? CAREER_PERSONALITIES[ch.personality] : null;
  const plotRate =
    ((ch.plotsLanded ?? 0) + (ch.sabotageFails ?? 0)) / Math.max(1, state.year);
  const plotTaste = mind ? mind.plotDrive / VOTER_TOP_PLOT_DRIVE : 0.3;
  return {
    rankShare,
    money: ch.money ?? 0,
    stress: ch.stress,
    skillGap: clamp((median - skillLevels(ch)) / VOTER_SKILL_SPAN, -1, 1),
    plotter: (clamp01(plotRate / VOTER_PLOT_RATE) + plotTaste) / 2,
    targeted: clamp01(
      (1 - rankShare) * (1 - VOTER_HIT_TARGETED) +
        (ch.grudgeSlug ? VOTER_HIT_TARGETED : 0),
    ),
    oppositionRisk: leading
      ? LAW_OPPOSITION_RISK_LEADER
      : LAW_OPPOSITION_RISK_PARTNER,
    personality: ch.personality,
  };
}

const poor = (p: VoterProfile) =>
  clamp01((LAW_POOR_MONEY - p.money) / LAW_POOR_MONEY);
const strained = (p: VoterProfile) =>
  (p.stress - LAW_STRESS_PIVOT) / LAW_STRESS_SPAN;
const gambler = (p: VoterProfile) =>
  p.personality ? LAW_GAMBLE_TASTE[p.personality] : 0;
// Every voter governs, so a law that splits the chamber pays him now and
// bites him once his party is out
const side = (p: VoterProfile, gain: number, loss: number) =>
  (1 - p.oppositionRisk) * gain - p.oppositionRisk * loss;

// What each law does to this one coach, read off its effect in careerLaws.ts
const LAW_STAKES: Record<LawId, (p: VoterProfile) => number> = {
  holiday: strained,
  'training-subsidy': (p) => 0.2 + 0.9 * p.skillGap,
  lottery: (p) => 0.5 * gambler(p) - 0.6 * poor(p),
  'wealth-tax': (p) => (LAW_WEALTH_PIVOT - p.money) / LAW_WEALTH_PIVOT,
  'credit-law': (p) => 0.9 * poor(p) + 0.4 * gambler(p) - 0.3,
  'tourist-tax': (p) => side(p, 0.3 + 0.6 * poor(p), 0.3 + 0.6 * poor(p)),
  curfew: (p) => 0.9 * p.targeted - 1.2 * p.plotter,
  'public-order': (p) => 0.9 * p.targeted - 1.2 * p.plotter,
  amnesty: (p) => 1.2 * p.plotter - 0.4,
  fencing: (p) => side(p, 0.2 + 0.8 * p.targeted, 0.6 * p.targeted),
};

function lawStake(law: LawId, profile: VoterProfile): number {
  return clamp(LAW_STAKES[law](profile), -LAW_STAKE_CAP, LAW_STAKE_CAP);
}

// Why this coach wants the law on the books, before the whip: what it does
// to him, and where he sits on the table when the law evens the league out
export function lawMotive(law: LawId, profile: VoterProfile): number {
  const equalizing = LAW_EQUALIZING[law] ?? 0;
  return (
    lawStake(law, profile) +
    LAW_TABLE_WEIGHT * equalizing * (profile.rankShare * 2 - 1)
  );
}
