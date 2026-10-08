import type { CharacterCareerState } from '@/lib/utils/careerSave';

export type MatchSkillId = 'stomach' | 'sniffer' | 'nutrition' | 'fans';

export const MATCH_SKILL_ORDER: MatchSkillId[] = [
  'stomach',
  'sniffer',
  'nutrition',
  'fans',
];

export const MATCH_SKILL_MAX = 3;

export function matchSkillLevels(
  ch: CharacterCareerState,
): Record<MatchSkillId, number> {
  return {
    stomach: ch.livesCap.level,
    sniffer: ch.njuh.level,
    nutrition: ch.nutrition.level,
    fans: ch.fanSkill.level,
  };
}

export type MatchFlagId =
  | 'stressHigh'
  | 'stressLow'
  | 'appetiteLow'
  | 'appetiteHigh'
  | 'ambitionLow'
  | 'egoHigh'
  | 'egoLow'
  | 'fameHigh';

export type MatchFlagMeter = 'stress' | 'appetite' | 'ambition' | 'ego' | 'fame';

export type MatchFlagTone = 'danger' | 'warn' | 'great';

export type MatchFlag = {
  id: MatchFlagId;
  meter: MatchFlagMeter;
  tone: MatchFlagTone;
  dir: 'up' | 'down';
  // How far past its threshold the reading sits, 0 to 1
  severity: number;
};

// Only readings that change how the match goes. Everything between the
// thresholds is an ordinary competitor and gets no chip at all, which is what
// keeps the seat quiet on a normal night
const FLAG_RULES: {
  id: MatchFlagId;
  meter: MatchFlagMeter;
  tone: MatchFlagTone;
  dir: 'up' | 'down';
  test: (value: number) => number | null;
}[] = [
  {
    id: 'stressHigh',
    meter: 'stress',
    tone: 'danger',
    dir: 'up',
    test: (v) => (v > 80 ? (v - 80) / 20 : null),
  },
  {
    id: 'appetiteLow',
    meter: 'appetite',
    tone: 'danger',
    dir: 'down',
    test: (v) => (v < 20 ? (20 - v) / 20 : null),
  },
  {
    id: 'ambitionLow',
    meter: 'ambition',
    tone: 'danger',
    dir: 'down',
    test: (v) => (v < 15 ? (15 - v) / 15 : null),
  },
  {
    id: 'appetiteHigh',
    meter: 'appetite',
    tone: 'warn',
    dir: 'up',
    test: (v) => (v > 80 ? (v - 80) / 20 : null),
  },
  {
    id: 'egoHigh',
    meter: 'ego',
    tone: 'warn',
    dir: 'up',
    test: (v) => (v > 75 ? (v - 75) / 25 : null),
  },
  {
    id: 'egoLow',
    meter: 'ego',
    tone: 'warn',
    dir: 'down',
    test: (v) => (v < 15 ? (15 - v) / 15 : null),
  },
  {
    id: 'fameHigh',
    meter: 'fame',
    tone: 'great',
    dir: 'up',
    test: (v) => (v >= 70 ? (v - 70) / 30 : null),
  },
  {
    id: 'stressLow',
    meter: 'stress',
    tone: 'great',
    dir: 'down',
    test: (v) => (v <= 20 ? (20 - v) / 20 : null),
  },
];

const TONE_RANK: Record<MatchFlagTone, number> = {
  danger: 2,
  warn: 1,
  great: 0,
};

// How many chips a single seat ever shows. Past two the strip stops reading as
// a warning and starts reading as a table
export const MATCH_FLAG_LIMIT = 2;

export function matchStatFlags(
  ch: CharacterCareerState,
  limit = MATCH_FLAG_LIMIT,
): MatchFlag[] {
  const meters: Record<MatchFlagMeter, number> = {
    stress: ch.stress,
    appetite: ch.appetite,
    ambition: ch.ambition,
    ego: ch.ego,
    fame: ch.fame,
  };
  return FLAG_RULES.flatMap((rule) => {
    const severity = rule.test(meters[rule.meter]);
    return severity === null ? [] : [{ ...rule, severity }];
  })
    .sort(
      (a, b) =>
        TONE_RANK[b.tone] - TONE_RANK[a.tone] || b.severity - a.severity,
    )
    .slice(0, limit)
    .map(({ id, meter, tone, dir, severity }) => ({
      id,
      meter,
      tone,
      dir,
      severity,
    }));
}
