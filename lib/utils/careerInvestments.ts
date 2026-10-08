import {
  AI_INVESTMENT_ORDER,
  ASSISTANT_SESSIONS,
  SECURITY_CHANCE,
  SPA_STRESS_DROP,
  investmentCost,
  type InvestmentId,
} from '@/data/games/careerInvestments';
import {
  TRAINING_DEFS,
  TRAININGS_PER_LEVEL,
} from '@/data/games/careerTraining';
import type { CharacterCareerState, NewsItem } from '@/lib/utils/careerSave';

const SKILL_KEYS = ['livesCap', 'njuh', 'nutrition', 'fanSkill'] as const;

type SkillKey = (typeof SKILL_KEYS)[number];

const MAX_LEVEL_BY_SKILL: Record<SkillKey, number> = {
  livesCap: TRAINING_DEFS.stomach.maxLevel,
  njuh: TRAINING_DEFS.sniffer.maxLevel,
  nutrition: TRAINING_DEFS.nutrition.maxLevel,
  fanSkill: TRAINING_DEFS.fans.maxLevel,
};

export function investmentLevel(
  ch: CharacterCareerState,
  id: InvestmentId,
): number {
  return ch.investments?.[id] ?? 0;
}

// The list price at the character's next level, scaled by the glizi market
export function nextInvestmentCost(
  ch: CharacterCareerState,
  id: InvestmentId,
  priceScale = 1,
): number | null {
  const cost = investmentCost(id, investmentLevel(ch, id));
  return cost === null ? null : Math.round(cost * priceScale);
}

// The share of attacks the standing retainer stops on its own, before anybody
// pays for extra coverage this window
export function standingSecurityChance(ch: CharacterCareerState): number {
  const level = investmentLevel(ch, 'security');
  return level > 0 ? SECURITY_CHANCE[level - 1] : 0;
}

export function spaStressDrop(ch: CharacterCareerState): number {
  const level = investmentLevel(ch, 'spa');
  return level > 0 ? SPA_STRESS_DROP[level - 1] : 0;
}

export function assistantSessions(ch: CharacterCareerState): number {
  const level = investmentLevel(ch, 'assistant');
  return level > 0 ? ASSISTANT_SESSIONS[level - 1] : 0;
}

export function buyInvestment(
  ch: CharacterCareerState,
  id: InvestmentId,
): CharacterCareerState {
  return {
    ...ch,
    investments: {
      ...ch.investments,
      [id]: investmentLevel(ch, id) + 1,
    },
  };
}

// Signing a standing contract is a money story, so the paper runs it: the
// first one reads as news, every level after that as an expansion
export function investmentNews(
  slug: string,
  id: InvestmentId,
  level: number,
): NewsItem {
  const templateKey = level > 1 ? `invest-${id}-up` : `invest-${id}`;
  return {
    kind: 'invest',
    templateKey,
    params: { level },
    slugs: [slug],
    freezeframe: `invest-${id}`,
  };
}

// One session the assistant coach runs unsupervised: it lands on whatever is
// still worth training, carries no overtraining risk and costs no cholesterol
function assistantSession(ch: CharacterCareerState): CharacterCareerState {
  const open = SKILL_KEYS.filter(
    (key) => ch[key].level < MAX_LEVEL_BY_SKILL[key],
  );
  if (open.length === 0) return ch;
  const key = open[Math.floor(Math.random() * open.length)];
  const stat = ch[key];
  const progress = stat.progress + 1;
  if (progress < TRAININGS_PER_LEVEL) {
    return { ...ch, [key]: { level: stat.level, progress } };
  }
  const level = stat.level + 1;
  return {
    ...ch,
    [key]: {
      level,
      progress:
        level >= MAX_LEVEL_BY_SKILL[key] ? 0 : progress - TRAININGS_PER_LEVEL,
    },
  };
}

// What the standing contracts pay out when a window opens: the spa card has
// already done its work by the time anybody shows up, and the assistant hands
// over the sessions he ran while nobody was watching
export function applyStandingInvestments(
  ch: CharacterCareerState,
): CharacterCareerState {
  const drop = spaStressDrop(ch);
  let next =
    drop > 0 && ch.stress > 0
      ? { ...ch, stress: Math.max(0, ch.stress - drop) }
      : ch;
  for (let i = 0; i < assistantSessions(next); i++) {
    next = assistantSession(next);
  }
  return next;
}

// The next track on the list with a level left, whatever it costs; null when
// every track is maxed
export function nextInvestmentGoal(
  ch: CharacterCareerState,
  priority: InvestmentId[],
  priceScale = 1,
): { id: InvestmentId; cost: number } | null {
  return affordableInvestment(ch, priority, Number.POSITIVE_INFINITY, priceScale);
}

// The best track this character can still afford to move up, and what it
// costs; null when everything on the list is maxed or out of reach
export function affordableInvestment(
  ch: CharacterCareerState,
  priority: InvestmentId[],
  money: number,
  priceScale = 1,
): { id: InvestmentId; cost: number } | null {
  const ranked = [
    ...priority.filter((id) => AI_INVESTMENT_ORDER.includes(id)),
    ...AI_INVESTMENT_ORDER.filter((id) => !priority.includes(id)),
  ];
  for (const id of ranked) {
    const cost = nextInvestmentCost(ch, id, priceScale);
    if (cost !== null && money >= cost) return { id, cost };
  }
  return null;
}
