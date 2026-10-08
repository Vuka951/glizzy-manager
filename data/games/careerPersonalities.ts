import type { InvestmentId } from '@/data/games/careerInvestments';
import type { TrainingId } from '@/data/games/careerTraining';

export type CareerPersonalityId =
  | 'grinder'
  | 'showman'
  | 'schemer'
  | 'paranoid'
  | 'pro'
  | 'hedonist'
  | 'miser'
  | 'bruiser';

export type CareerActionKind =
  | 'train'
  | 'rest'
  | 'fast'
  | 'media'
  | 'guard'
  | 'sabotage'
  | 'invest';

export type CareerPersonality = {
  id: CareerPersonalityId;
  // Relative pull toward each action, rolled against whatever is affordable
  // and useful this window. Zero means the character never does it by choice
  weights: Record<CareerActionKind, number>;
  // Which skills the money goes into, best first. It is a lean, not a script:
  // earlier entries are picked far more often, anything left off the list
  // still comes up occasionally
  trainingPriority: TrainingId[];
  // Which standing contract gets signed first once there is money for one;
  // the rest of the list still gets bought, just later
  investPriority: InvestmentId[];
  // Cholesterol at or above this and rest jumps the queue
  restAt: number;
  // Appetite at or below this and fasting jumps the queue
  fastAt: number;
  // How often the media appearance is the staged scandal instead of a plain
  // interview: double the pay and the hype, double the cholesterol, and a
  // chance the whole thing turns on them
  scandalChance: number;
  // Money kept back rather than spent down to nothing
  reserve: number;
  // The share of a window's income put aside for the next standing contract
  // on the list, untouchable by every other budget until it is bought
  saving: number;
  // Which tier of plot they reach for first when they do decide to spend a
  // window on somebody else's career
  preferredTier: 1 | 2 | 3;
  // How the temperament reads its own situation before the window opens
  reactions: CareerReactions;
};

// Multipliers layered on the base weights once the coach has looked at the
// table, the body, the last result and the price list. Each one is a lean:
// 0 means the temperament never notices that thing, 1 is a sober read, more
// is an obsession. See lib/utils/careerAiSituation.ts for what they move
export type CareerReactions = {
  // Plots and target picks against whoever last landed a hit on them
  revenge: number;
  // Guard pull when the door is worth watching: a place near the top, a
  // fresh hit, or a grudge still open
  threatGuard: number;
  // Spending pull toward a discount window and away from a surcharge
  bargain: number;
  // How much harder a plot aims at the name directly above on the table
  bubble: number;
  // Reads the last forfeit and fixes it: a meltdown asks for rest, an
  // overfull forfeit for nutrition and a fast
  fixesLosses: number;
  // How much the weakest match skill outranks the favourite one, 0..1
  trainsWeakest: number;
  // Skips the microphone when there is no fame left to gain, 0..1
  fameSense: number;
  // Reaches for a bigger plot against the leader or a grudge when the money covers it
  escalates: boolean;
  // How sure a job has to be, funded, before the money leaves the pocket
  plotPatience: number;
};

// Eight ways to spend an off-season. Each one is built to be good at
// something and visibly bad at something else, so the league table ends up
// mixed rather than sorted by whoever drew the strongest script:
//
//   grinder   most skill levels, no fame and no protection
//   showman   fame, sponsors and table points, weakest in the ring
//   schemer   spends the league's money on plots, thin on skills, gets fined
//   paranoid  never loses a window to a plot, pays for it in everything else
//   pro       the flat baseline, second best at everything, best at nothing
//   hedonist  perfect body, high appetite binges, almost no trained skill
//   miser     slowest start in the league, buys the top of the tree late
//   bruiser   sparring and ego, stats land wherever they land
//
// The weights are the temperament at rest; the reactions are how it reads the
// window in front of it, and both go into the same draw
export const CAREER_PERSONALITIES: Record<
  CareerPersonalityId,
  CareerPersonality
> = {
  grinder: {
    id: 'grinder',
    weights: { train: 9, rest: 4, fast: 2, media: 2, guard: 2, sabotage: 2, invest: 3 },
    trainingPriority: ['stomach', 'nutrition', 'sniffer', 'fans'],
    investPriority: ['assistant', 'spa', 'security'],
    restAt: 70,
    fastAt: 25,
    scandalChance: 0.05,
    reserve: 0,
    saving: 0.4,
    preferredTier: 1,
    reactions: { revenge: 0.5, threatGuard: 0.5, bargain: 1, bubble: 2, fixesLosses: 1, trainsWeakest: 0.8, fameSense: 0.5, escalates: false, plotPatience: 0.6 },
  },
  showman: {
    id: 'showman',
    weights: { train: 7, rest: 3, fast: 2, media: 9, guard: 2, sabotage: 3, invest: 2 },
    trainingPriority: ['fans', 'stomach', 'nutrition', 'sniffer'],
    investPriority: ['assistant', 'security', 'spa'],
    restAt: 75,
    fastAt: 20,
    scandalChance: 0.45,
    reserve: 0,
    saving: 0.6,
    preferredTier: 1,
    reactions: { revenge: 1, threatGuard: 1, bargain: 0.5, bubble: 1, fixesLosses: 0.3, trainsWeakest: 0.2, fameSense: 0.3, escalates: false, plotPatience: 0.6 },
  },
  schemer: {
    id: 'schemer',
    weights: { train: 7, rest: 3, fast: 2, media: 3, guard: 4, sabotage: 9, invest: 2 },
    trainingPriority: ['sniffer', 'stomach', 'fans', 'nutrition'],
    investPriority: ['security', 'assistant', 'spa'],
    restAt: 72,
    fastAt: 20,
    scandalChance: 0.2,
    reserve: 40,
    saving: 0.5,
    preferredTier: 2,
    reactions: { revenge: 4, threatGuard: 1.5, bargain: 1.5, bubble: 2, fixesLosses: 0.5, trainsWeakest: 0.5, fameSense: 0.7, escalates: true, plotPatience: 0.6 },
  },
  paranoid: {
    id: 'paranoid',
    weights: { train: 7, rest: 4, fast: 2, media: 3, guard: 8, sabotage: 2, invest: 6 },
    trainingPriority: ['sniffer', 'nutrition', 'stomach', 'fans'],
    investPriority: ['security', 'spa', 'assistant'],
    restAt: 60,
    fastAt: 30,
    scandalChance: 0.05,
    reserve: 60,
    saving: 0.7,
    preferredTier: 1,
    reactions: { revenge: 0.5, threatGuard: 3, bargain: 1, bubble: 1.5, fixesLosses: 1, trainsWeakest: 0.6, fameSense: 0.8, escalates: false, plotPatience: 0.7 },
  },
  pro: {
    id: 'pro',
    weights: { train: 7, rest: 4, fast: 3, media: 5, guard: 3, sabotage: 3, invest: 4 },
    trainingPriority: ['nutrition', 'stomach', 'sniffer', 'fans'],
    investPriority: ['assistant', 'security', 'spa'],
    restAt: 65,
    fastAt: 30,
    scandalChance: 0.1,
    reserve: 20,
    saving: 0.6,
    preferredTier: 1,
    reactions: { revenge: 1, threatGuard: 2, bargain: 1.5, bubble: 2, fixesLosses: 1, trainsWeakest: 0.7, fameSense: 1, escalates: false, plotPatience: 0.65 },
  },
  hedonist: {
    id: 'hedonist',
    weights: { train: 7, rest: 6, fast: 7, media: 6, guard: 1, sabotage: 3, invest: 3 },
    trainingPriority: ['nutrition', 'stomach', 'fans', 'sniffer'],
    investPriority: ['spa', 'assistant', 'security'],
    restAt: 45,
    fastAt: 55,
    scandalChance: 0.3,
    reserve: 0,
    saving: 0.45,
    preferredTier: 1,
    reactions: { revenge: 0, threatGuard: 0.3, bargain: 0, bubble: 0.3, fixesLosses: 0, trainsWeakest: 0.1, fameSense: 0, escalates: false, plotPatience: 0.5 },
  },
  miser: {
    id: 'miser',
    weights: { train: 7, rest: 5, fast: 3, media: 6, guard: 1, sabotage: 2, invest: 7 },
    trainingPriority: ['stomach', 'sniffer', 'nutrition', 'fans'],
    investPriority: ['assistant', 'security', 'spa'],
    restAt: 68,
    fastAt: 28,
    scandalChance: 0.15,
    reserve: 200,
    saving: 0.9,
    preferredTier: 1,
    reactions: { revenge: 1, threatGuard: 1, bargain: 3, bubble: 1, fixesLosses: 0.7, trainsWeakest: 0.6, fameSense: 1, escalates: false, plotPatience: 0.7 },
  },
  bruiser: {
    id: 'bruiser',
    weights: { train: 9, rest: 4, fast: 2, media: 3, guard: 1, sabotage: 5, invest: 2 },
    trainingPriority: ['sparring', 'stomach', 'sniffer', 'nutrition'],
    investPriority: ['assistant', 'spa', 'security'],
    restAt: 78,
    fastAt: 20,
    scandalChance: 0.25,
    reserve: 0,
    saving: 0.4,
    preferredTier: 1,
    reactions: { revenge: 3, threatGuard: 0.5, bargain: 0.5, bubble: 1.5, fixesLosses: 0.3, trainsWeakest: 0.3, fameSense: 0.4, escalates: true, plotPatience: 0.5 },
  },
};

// Nobody is a machine. Three things keep a temperament from being a script:
// no action is ever truly off the table, every weight is re-rolled inside a
// band each time a choice comes up, and now and then somebody ignores their
// own plan entirely and does whatever
export const ACTION_WEIGHT_FLOOR = 0.35;
export const ACTION_WEIGHT_JITTER = 0.5;
export const OFF_SCRIPT_CHANCE = 0.08;
// Even "I am about to burst, I should rest" is only mostly obeyed
export const OVERRIDE_OBEY_CHANCE = 0.85;

// The weight this action actually goes into the draw with: never zero, and
// never quite the same twice
export function jitteredWeight(weight: number): number {
  const rolled = Math.max(weight, ACTION_WEIGHT_FLOOR);
  return rolled * (1 - ACTION_WEIGHT_JITTER + 2 * ACTION_WEIGHT_JITTER * Math.random());
}

// Money sitting in the account is money a coach starts finding uses for: every
// step of unspent cash above the reserve pulls harder toward the gym, up to
// the cap. Without this the league hoards its stipend and never gets stronger
export const TRAIN_SURPLUS_STEP = 250;
export const TRAIN_SURPLUS_MAX_BONUS = 2.5;

export function trainingSurplusPull(surplus: number): number {
  return 1 + Math.min(TRAIN_SURPLUS_MAX_BONUS, Math.max(0, surplus) / TRAIN_SURPLUS_STEP);
}

// A coach with every skill at the top has nothing left to buy in the gym, so
// the money starts going into the rest of the league
export const LEARNED_OUT_PLOT_PULL = 3;

// How much harder the first pick on the list is chased than the second, and
// so on down; anything unlisted shares the tail weight
export const TRAINING_PRIORITY_WEIGHTS = [8, 4, 2, 1];
export const TRAINING_PRIORITY_TAIL = 1;

export function trainingPriorityWeight(
  personality: CareerPersonality,
  id: TrainingId,
): number {
  const index = personality.trainingPriority.indexOf(id);
  if (index < 0) return TRAINING_PRIORITY_TAIL;
  return TRAINING_PRIORITY_WEIGHTS[index] ?? TRAINING_PRIORITY_TAIL;
}

export const PERSONALITY_IDS = Object.keys(
  CAREER_PERSONALITIES,
) as CareerPersonalityId[];

export function personalityFor(
  id: CareerPersonalityId | undefined,
): CareerPersonality {
  return CAREER_PERSONALITIES[id ?? 'pro'] ?? CAREER_PERSONALITIES.pro;
}

export function randomPersonality(): CareerPersonalityId {
  return PERSONALITY_IDS[Math.floor(Math.random() * PERSONALITY_IDS.length)];
}
