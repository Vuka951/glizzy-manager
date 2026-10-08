import {
  type CareerActionKind,
  type CareerPersonality,
  trainingPriorityWeight,
} from '@/data/games/careerPersonalities';
import type { SeasonPriceCategory } from '@/data/games/careerSeasons';
import { TRAINING_DEFS, type TrainingId } from '@/data/games/careerTraining';
import type { CharacterCareerState, SavedCareer } from '@/lib/utils/careerSave';
import { seasonPricePctFor } from '@/lib/utils/careerSeasonPrices';

// What the coach looks at before the window opens. Everything here is
// public: the table, his own body and record, and the season's price list
export type AiSituation = {
  rank: number;
  // Inside the top of the table, where the plots aim
  contender: boolean;
  // The name directly above on the table, the one worth passing
  above: string | null;
  grudgeSlug: string | null;
  // A plot got through within the last couple of cups
  hit: boolean;
  lastForfeitReason: CharacterCareerState['lastForfeitReason'];
  // The match skill with the most ground to make up, weighted by what
  // actually wins turns; null once the ring skills are maxed
  weakestTraining: TrainingId | null;
  fameHeadroom: number;
  // This window's swing per priced category, signed percent
  priceSwing: Record<SeasonPriceCategory, number>;
};

const CONTENDER_POSITIONS = 5;
const FAME_HEADROOM_FLOOR = 30;

// Stomach and sniffer decide turns outright, nutrition keeps the stomach in
// the match; the same ladder the bookie prices strength on
const RING_TRAININGS: {
  id: TrainingId;
  weight: number;
  key: 'livesCap' | 'njuh' | 'nutrition';
}[] = [
  { id: 'stomach', weight: 3, key: 'livesCap' },
  { id: 'sniffer', weight: 3, key: 'njuh' },
  { id: 'nutrition', weight: 2, key: 'nutrition' },
];

const PRICE_CATEGORIES: SeasonPriceCategory[] = [
  'training',
  'media',
  'guard',
  'sabotage',
  'investment',
];

export function weakestRingTraining(
  ch: CharacterCareerState,
): TrainingId | null {
  let best: { id: TrainingId; deficit: number } | null = null;
  for (const { id, weight, key } of RING_TRAININGS) {
    const deficit = (TRAINING_DEFS[id].maxLevel - ch[key].level) * weight;
    if (deficit > 0 && (!best || deficit > best.deficit))
      best = { id, deficit };
  }
  return best?.id ?? null;
}

export function readAiSituation(
  state: SavedCareer,
  slug: string,
  seeding: string[],
): AiSituation {
  const ch = state.characters[slug];
  const rank = seeding.indexOf(slug);
  return {
    rank,
    contender: rank >= 0 && rank < CONTENDER_POSITIONS,
    above: rank > 0 ? seeding[rank - 1] : null,
    grudgeSlug: ch.grudgeSlug ?? null,
    hit: (ch.hitRecency ?? 0) > 0,
    lastForfeitReason: ch.lastForfeitReason ?? null,
    weakestTraining: weakestRingTraining(ch),
    fameHeadroom: 100 - ch.fame,
    priceSwing: Object.fromEntries(
      PRICE_CATEGORIES.map((category) => [
        category,
        seasonPricePctFor(state, category),
      ]),
    ) as Record<SeasonPriceCategory, number>,
  };
}

// A discount pulls, a surcharge repels, both scaled by how much this
// temperament cares about the price list
export function priceReaction(
  mind: CareerPersonality,
  situation: AiSituation,
  category: SeasonPriceCategory,
): number {
  const pct = situation.priceSwing[category];
  return Math.max(0.1, 1 - (mind.reactions.bargain * pct) / 100);
}

export type ReactionContext = {
  // The door is already watched by a retainer or the house crew at least as
  // well as a hired crew would watch it
  doorCovered: boolean;
};

// Per-action multipliers on the base weights, re-read every action because
// the body changes between them
export function reactionWeights(
  mind: CareerPersonality,
  situation: AiSituation,
  ch: CharacterCareerState,
  context: ReactionContext,
): Record<CareerActionKind, number> {
  const r = mind.reactions;
  const threat = situation.contender || situation.hit || situation.grudgeSlug;
  const meltdown = situation.lastForfeitReason === 'meltdown';
  const overfull = situation.lastForfeitReason === 'overfull-forfeit';
  const fameFade =
    situation.fameHeadroom < FAME_HEADROOM_FLOOR
      ? 1 - r.fameSense * (1 - situation.fameHeadroom / FAME_HEADROOM_FLOOR)
      : 1;
  return {
    rest: meltdown ? 1 + 1.5 * r.fixesLosses : 1,
    fast: overfull ? 1 + 1.5 * r.fixesLosses : 1,
    train: priceReaction(mind, situation, 'training'),
    media: priceReaction(mind, situation, 'media') * Math.max(0, fameFade),
    guard:
      priceReaction(mind, situation, 'guard') *
      (threat ? 1 + r.threatGuard : 1) *
      (context.doorCovered ? 0.1 : 1),
    sabotage:
      priceReaction(mind, situation, 'sabotage') *
      (situation.grudgeSlug ? 1 + r.revenge : 1),
    invest: 1,
  };
}

// Which session to book: the favourite list, bent toward the skill that is
// actually losing matches
export function trainingChoiceWeight(
  mind: CareerPersonality,
  situation: AiSituation,
  id: TrainingId,
): number {
  const r = mind.reactions;
  let weight = trainingPriorityWeight(mind, id);
  if (id === situation.weakestTraining) weight *= 1 + 4 * r.trainsWeakest;
  if (id === 'nutrition' && situation.lastForfeitReason === 'overfull-forfeit')
    weight *= 1 + 2 * r.fixesLosses;
  return weight;
}
