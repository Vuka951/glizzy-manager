import { equilibriumFor } from '@/data/games/careerEquilibria';
import { randomPersonality } from '@/data/games/careerPersonalities';
import {
  AI_START_FAME_MAX,
  AI_START_FAME_MIN,
  APPETITE_REGROWTH,
  FASTING_AMBITION_GAIN,
  FASTING_APPETITE_GAIN,
  FASTING_STRESS,
  MEDIA_APPEARANCE_PAY,
  MEDIA_FAME_MAX,
  MEDIA_FAME_MIN,
  MEDIA_FAME_PER_FAN_LEVEL,
  MEDIA_SCANDAL_PAY,
  type MediaAppearanceKind,
  PLOTTING_EGO_GAIN,
  REST_DRIFT,
  REST_EGO_TARGET,
  REST_FAME_DROP,
  REST_SIDE_DRIFT,
  REST_STRESS_DROP,
} from '@/data/games/careerEconomy';
import {
  AI_START_SKILL_LEVELS,
  fameStressTaxScale,
  overtrainChance,
  TRAININGS_PER_LEVEL,
  type TrainingDef,
} from '@/data/games/careerTraining';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import type { MatchForfeitReason } from '@/lib/utils/tournamentSim';

// Past these the character stops taking orders at the start of the off-season:
// a big ego signs him up for a training on its own, and no will to compete
// sends him hiding behind the cheapest security he can afford, or into a fast
// when he cannot
export const EGO_HIJACK_THRESHOLD = 75;
export const AMBITION_SLUMP_THRESHOLD = 15;

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function towards(current: number, target: number, step: number): number {
  if (current === target) return current;
  const delta = Math.min(step, Math.abs(target - current));
  return current + Math.sign(target - current) * delta;
}

export function newCharacterState(
  slug: string,
  ai = false,
): CharacterCareerState {
  const eq = equilibriumFor(slug);
  // Everyone starts untrained; league veterans get two random levels spread
  // across the four skills. AI fame also gets a fresh roll around the lore
  // value so the opening seeding varies per career
  const skillLevels = [0, 0, 0, 0];
  // Everyone in the league runs their off-season a different way; which way
  // is drawn fresh per career, so the same name plays differently each run
  if (ai) {
    for (let i = 0; i < AI_START_SKILL_LEVELS; i++) {
      skillLevels[Math.floor(Math.random() * skillLevels.length)] += 1;
    }
  }
  const skill = (level: number) => ({ level, progress: 0 });
  // Every AI starts as a mid-table name so the comeback player seeds among
  // them instead of guaranteed last; fame then moves on results
  const aiFame = () =>
    AI_START_FAME_MIN +
    Math.floor(Math.random() * (AI_START_FAME_MAX - AI_START_FAME_MIN + 1));
  return {
    ...(ai ? { personality: randomPersonality() } : {}),
    livesCap: skill(skillLevels[0]),
    njuh: skill(skillLevels[1]),
    nutrition: skill(skillLevels[2]),
    fanSkill: skill(skillLevels[3]),
    stress: eq.stress,
    appetite: eq.appetite,
    ambition: eq.ambition,
    ego: eq.ego,
    fame: ai ? aiFame() : eq.fame,
    wins: 0,
    losses: 0,
    titles: 0,
    titleStreak: 0,
    meltdowns: 0,
    forfeits: 0,
    withdrawals: 0,
    lastTraining: null,
    sameTrainingStreak: 0,
    sponsor: null,
    fineRecency: 0,
    punishments: 0,
  };
}

// The rest action: a big stress dump, the body drifting back toward its lore
// equilibrium, and the price of stepping out of the spotlight. The ego levels
// out toward the same modest baseline for everyone, so a month off is the way
// back from a humbling and a haircut for anyone riding high, while the fame
// drains at a flat rate because the papers do not wait. Also closes the
// overtraining window
export function applyRest(
  ch: CharacterCareerState,
  slug: string,
): CharacterCareerState {
  const eq = equilibriumFor(slug);
  return {
    ...ch,
    stress: clamp(towards(ch.stress - REST_STRESS_DROP, eq.stress, REST_DRIFT)),
    appetite: clamp(
      towards(ch.appetite, eq.appetite, REST_SIDE_DRIFT) + APPETITE_REGROWTH,
    ),
    ambition: clamp(towards(ch.ambition, eq.ambition, REST_SIDE_DRIFT)),
    ego: clamp(towards(ch.ego, REST_EGO_TARGET, REST_SIDE_DRIFT)),
    fame: clamp(ch.fame - REST_FAME_DROP),
    lastTraining: null,
    sameTrainingStreak: 0,
  };
}

// Fasting skips the recovery and starves the appetite back up instead
export function applyFast(ch: CharacterCareerState): CharacterCareerState {
  return {
    ...ch,
    appetite: clamp(ch.appetite + FASTING_APPETITE_GAIN),
    ambition: clamp(ch.ambition + FASTING_AMBITION_GAIN),
    stress: clamp(ch.stress + FASTING_STRESS),
    lastTraining: null,
    sameTrainingStreak: 0,
  };
}

// A month behind hired muscle: nobody at the door means a quiet appetite
// comes back, and walking around with security goes to the head
export function applyGuardHire(ch: CharacterCareerState): CharacterCareerState {
  return {
    ...ch,
    appetite: clamp(ch.appetite + APPETITE_REGROWTH),
    ego: clamp(ch.ego + PLOTTING_EGO_GAIN),
  };
}

export type TrainingOutcome = 'progress' | 'level-up' | 'regression';

export const STAT_KEY_BY_TRAINING: Partial<
  Record<TrainingDef['id'], 'livesCap' | 'njuh' | 'nutrition' | 'fanSkill'>
> = {
  stomach: 'livesCap',
  sniffer: 'njuh',
  nutrition: 'nutrition',
  fans: 'fanSkill',
};

export function applyTraining(
  ch: CharacterCareerState,
  def: TrainingDef,
  opts: { overtrainScale?: number } = {},
): {
  next: CharacterCareerState;
  outcome: TrainingOutcome;
  statKey: 'livesCap' | 'njuh' | 'nutrition' | 'fanSkill' | null;
} {
  const streak = ch.lastTraining === def.id ? ch.sameTrainingStreak : 0;
  const regressed =
    Math.random() < overtrainChance(streak) * (opts.overtrainScale ?? 1);
  const stressed = clamp(ch.stress + def.stressGain);
  const base: CharacterCareerState = {
    ...ch,
    stress: stressed,
    // Discipline builds ambition; a month away from the plate rebuilds appetite;
    // winning sparring bouts feeds the ego a little
    ambition: clamp(ch.ambition + 1),
    ego: def.id === 'sparring' ? clamp(ch.ego + 3) : ch.ego,
    appetite:
      def.id === 'stomach'
        ? ch.appetite
        : clamp(ch.appetite + APPETITE_REGROWTH),
    lastTraining: def.id,
    sameTrainingStreak: streak + 1,
  };

  const statKey = def.leveled
    ? STAT_KEY_BY_TRAINING[def.id]
    : (['livesCap', 'njuh', 'nutrition', 'fanSkill'] as const)[
        Math.floor(Math.random() * 4)
      ];
  if (!statKey) return { next: base, outcome: 'progress', statKey: null };
  const stat = base[statKey];

  if (regressed) {
    return {
      next: {
        ...base,
        [statKey]: { level: Math.max(0, stat.level - 1), progress: 0 },
      },
      outcome: 'regression',
      statKey,
    };
  }

  const STAT_MAX = { livesCap: 3, njuh: 3, nutrition: 3, fanSkill: 3 } as const;
  const maxLevel = STAT_MAX[statKey];
  if (stat.level >= maxLevel)
    return { next: base, outcome: 'progress', statKey };

  // High ambition trains harder
  const gain = ch.ambition >= 70 && Math.random() < 0.3 ? 2 : 1;
  let progress = stat.progress + gain;
  let level = stat.level;
  let outcome: TrainingOutcome = 'progress';
  if (progress >= TRAININGS_PER_LEVEL) {
    level = Math.min(maxLevel, level + 1);
    progress = level >= maxLevel ? 0 : progress - TRAININGS_PER_LEVEL;
    outcome = 'level-up';
  }
  return {
    next: { ...base, [statKey]: { level, progress } },
    outcome,
    statKey,
  };
}

// Fold a finished match back into the character: sim exit values plus the
// psychological aftermath
export function applyMatchOutcome(
  ch: CharacterCareerState,
  {
    won,
    exitStress,
    exitAppetite,
    reason,
  }: {
    won: boolean;
    exitStress: number;
    exitAppetite: number;
    reason: MatchForfeitReason | null;
  },
): CharacterCareerState {
  let stress = exitStress;
  const appetite = exitAppetite;
  let ego = ch.ego;
  let fame = ch.fame;
  let ambition = ch.ambition;
  const next = {
    ...ch,
    wins: ch.wins + (won ? 1 : 0),
    losses: ch.losses + (won ? 0 : 1),
    lastForfeitReason: won ? null : reason,
  };
  if (won) {
    ego += 6;
    fame += 4;
    ambition += 2;
  } else {
    const famePressure = 1 + (ch.ambition - 50) / 100 + (ch.fame - 50) / 200;
    stress +=
      10 * Math.max(0.3, famePressure) * fameStressTaxScale(ch.fanSkill.level);
    fame -= 2;
    if (
      reason === 'meltdown' ||
      reason === 'overfull-forfeit' ||
      reason === 'withdrawn'
    ) {
      // The humbling loss: ego crashes and the will to compete takes a hit
      ego -= 20 + Math.floor(Math.random() * 11);
      ambition -= 10 + Math.floor(Math.random() * 6);
    } else {
      ego -= 4;
    }
  }
  if (reason === 'meltdown') next.meltdowns += 1;
  if (reason && reason !== 'meltdown') next.forfeits += 1;
  return {
    ...next,
    stress: clamp(stress),
    appetite: clamp(appetite),
    ego: clamp(ego),
    fame: clamp(fame),
    ambition: clamp(ambition),
  };
}

// The season verdict: final cup placement feeds fame and ego on a scale from
// lifting the trophy down to a first-round exit, which costs pride but not
// fame: showing up at all is worth something. A name without a place on the
// standings is left alone
export function applyCupPlacement(
  ch: CharacterCareerState,
  place: number,
): CharacterCareerState {
  if (place < 1) return ch;
  const [fame, ego] =
    place === 1
      ? [12, 10]
      : place === 2
        ? [8, 5]
        : place <= 4
          ? [5, 2]
          : place <= 8
            ? [1, 0]
            : [0, -2];
  return { ...ch, fame: clamp(ch.fame + fame), ego: clamp(ch.ego + ego) };
}

// What one appearance is worth in fame. Some nights the story runs, some
// nights it does not, and a trained media man is worth more either way.
// baseScale is how loud the story is told; the fan bonus lands once regardless
export function rollMediaFame(fanLevel: number, baseScale = 1): number {
  const span = MEDIA_FAME_MAX - MEDIA_FAME_MIN + 1;
  const base = MEDIA_FAME_MIN + Math.floor(Math.random() * span);
  return base * baseScale + MEDIA_FAME_PER_FAN_LEVEL * fanLevel;
}

export function mediaFameRange(
  fanLevel: number,
  baseScale = 1,
): [number, number] {
  const bonus = MEDIA_FAME_PER_FAN_LEVEL * fanLevel;
  return [
    MEDIA_FAME_MIN * baseScale + bonus,
    MEDIA_FAME_MAX * baseScale + bonus,
  ];
}

// What one appearance pays: the fan skill raises the fee, state media
// multiply it by whatever the party's seat is worth, and the season's press
// market moves the whole figure
export function mediaPay(
  kind: MediaAppearanceKind,
  fanLevel: number,
  stateMultiplier = 1,
  priceScale = 1,
): number {
  const base = kind === 'scandal' ? MEDIA_SCANDAL_PAY : MEDIA_APPEARANCE_PAY;
  return Math.round(base * (1 + 0.5 * fanLevel) * priceScale * stateMultiplier);
}

export { clamp as clampMeter };
