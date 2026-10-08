export type TrainingId =
  | 'stomach'
  | 'sniffer'
  | 'nutrition'
  | 'fans'
  | 'sparring';

export type TrainingDef = {
  id: TrainingId;
  cost: number;
  stressGain: number;
  leveled: boolean;
  maxLevel: number;
};

// Cost is the price of one session at the level being trained out of. The
// first level of anything is within reach of a single month's income; mastery
// is where the money actually goes
export const TRAINING_DEFS: Record<TrainingId, TrainingDef> = {
  stomach: {
    id: 'stomach',
    cost: 60,
    stressGain: 12,
    leveled: true,
    maxLevel: 3,
  },
  sniffer: {
    id: 'sniffer',
    cost: 55,
    stressGain: 10,
    leveled: true,
    maxLevel: 3,
  },
  nutrition: {
    id: 'nutrition',
    cost: 48,
    stressGain: 8,
    leveled: true,
    maxLevel: 3,
  },
  fans: { id: 'fans', cost: 45, stressGain: 6, leveled: true, maxLevel: 3 },
  sparring: {
    id: 'sparring',
    cost: 50,
    stressGain: 10,
    leveled: false,
    maxLevel: 0,
  },
};

// Every level up the ladder costs this much more than the base session, so
// going from nothing to level 1 is cheap and polishing level 3 is not
export const TRAINING_LEVEL_COST_STEP = 0.6;

export function trainingCost(
  def: TrainingDef,
  level: number,
  priceScale = 1,
): number {
  const base = def.leveled
    ? def.cost * (1 + TRAINING_LEVEL_COST_STEP * level)
    : def.cost;
  return Math.round(base * priceScale);
}

export const TRAINING_ORDER: TrainingId[] = [
  'stomach',
  'sniffer',
  'nutrition',
  'fans',
  'sparring',
];

// Regression chance by consecutive uses of the same training without a rest,
// evaluated before the session about to start
export const OVERTRAIN_CHANCES = [0, 0.25, 0.5, 0.75];

export const TRAININGS_PER_LEVEL = 3;

// Levels handed to each AI character at career start, spread randomly
export const AI_START_SKILL_LEVELS = 1;

export function overtrainChance(sameTrainingStreak: number): number {
  return OVERTRAIN_CHANCES[
    Math.min(sameTrainingStreak, OVERTRAIN_CHANCES.length - 1)
  ];
}

// Per-level effects consumed by the match layer. Everyone starts at level 0
// (two glizzies); each stomach level adds one
export function livesForLevel(level: number): number {
  return 2 + level;
}

export function seekAvoidanceForLevel(level: number): number | undefined {
  return level > 0 ? 1 - 0.12 * level : undefined;
}

export function fullnessDropForLevel(level: number): number {
  return Math.max(2, 8 - 2 * level);
}

export function fameStressTaxScale(fanLevel: number): number {
  return Math.max(0.25, 1 - 0.25 * fanLevel);
}

// The fan skill buys airtime as well as reach: from this level the press
// takes a second call inside the same window
export const MEDIA_EXTRA_SLOT_FAN_LEVEL = 2;

export function mediaUsesFor(fanLevel: number): number {
  return fanLevel >= MEDIA_EXTRA_SLOT_FAN_LEVEL ? 2 : 1;
}
