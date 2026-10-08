import type { InvestmentId } from '@/data/games/careerInvestments';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { TrainingId } from '@/data/games/careerTraining';
import type { SabotageTier } from '@/lib/utils/careerSave';

// Every off-season action the player can spend a month (or the wallet) on
// gets its own short cutscene; the id doubles as the key into the caption
// strings and the scene picker on the animations preview page
export type ActionSceneId =
  | `training-${TrainingId}`
  | 'rest'
  | 'fast'
  | 'island'
  | 'media-interview'
  | 'media-scandal'
  | 'guard'
  | `invest-${InvestmentId}`
  | `sabotage-${SabotageTier}`;

export type ActionSceneOutcome = 'good' | 'bad' | 'level-up';

export const ACTION_SCENE_IDS: ActionSceneId[] = [
  'training-stomach',
  'training-sniffer',
  'training-nutrition',
  'training-fans',
  'training-sparring',
  'rest',
  'fast',
  'island',
  'media-interview',
  'media-scandal',
  'guard',
  'invest-security',
  'invest-spa',
  'invest-assistant',
  'invest-scout',
  'sabotage-1',
  'sabotage-2',
  'sabotage-3',
];

// Leveled trainings get a bigger finish when the session tips a level
export const ACTION_SCENES_WITH_LEVEL_UP = new Set<ActionSceneId>([
  'training-stomach',
  'training-sniffer',
  'training-nutrition',
  'training-fans',
]);

// Scenes where the bad outcome tells a different story, not just a red chip
export const ACTION_SCENES_WITH_BAD_OUTCOME = new Set<ActionSceneId>([
  'training-stomach',
  'training-sniffer',
  'training-nutrition',
  'training-fans',
  'training-sparring',
  'media-scandal',
]);

export type ActionSceneProps = {
  character: DuelCharacter;
  season: number;
  outcome: ActionSceneOutcome;
};

// The other side of a plot: what the paper says happened to your own man
// overnight, played as a scene before the issue opens. Keyed by the news
// story the league printed
export type SabotageHitSceneId =
  | 'hit-poison-glizimaker'
  | 'hit-poison-kafana'
  | 'hit-curse'
  | 'hit-bribe'
  | 'hit-rumor'
  | 'hit-catfish-date'
  | 'hit-catfish-zeka'
  | 'hit-catfish-demons'
  | 'hit-raid-tax'
  | 'hit-raid-stash'
  | 'hit-raid-island'
  | 'hit-raid-smuggling'
  | 'hit-blocked';

export const SABOTAGE_HIT_SCENE_BY_NEWS: Record<string, SabotageHitSceneId> = {
  'poison-glizimaker': 'hit-poison-glizimaker',
  'poison-kafana': 'hit-poison-kafana',
  'witch-curse': 'hit-curse',
  'nutrition-bribed': 'hit-bribe',
  'fans-rumor': 'hit-rumor',
  'catfish-date': 'hit-catfish-date',
  'catfish-zeka': 'hit-catfish-zeka',
  'catfish-demons': 'hit-catfish-demons',
  'police-tax': 'hit-raid-tax',
  'police-stash': 'hit-raid-stash',
  'police-island': 'hit-raid-island',
  'police-smuggling': 'hit-raid-smuggling',
  'korp-vendetta': 'hit-raid-tax',
  sabotageBlocked: 'hit-blocked',
};

export const SABOTAGE_HIT_SCENE_IDS = [
  ...new Set(Object.values(SABOTAGE_HIT_SCENE_BY_NEWS)),
] as SabotageHitSceneId[];

export type SabotageHitSceneProps = {
  character: DuelCharacter;
  season: number;
};
