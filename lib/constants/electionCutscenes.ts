import type { CutsceneClipId } from '@/lib/constants/cutsceneSounds';
import type {
  QuoteCue,
  QuoteSceneDefinition,
} from '@/lib/constants/quoteCutscenes';

export const ELECTION_WIN_SCENES = [
  'election-fridge',
  'election-glizzy-rally',
  'election-all-channels',
] as const;
export const ELECTION_LOSS_SCENES = [
  'election-flag-sob',
] as const;
export const COALITION_SCENES = [
  'coalition-small-chair',
  'coalition-reconciliation',
  'coalition-three-way',
] as const;

export const ELECTION_SCENE_IDS: ReadonlySet<string> = new Set([
  ...ELECTION_WIN_SCENES,
  ...ELECTION_LOSS_SCENES,
  ...COALITION_SCENES,
]);

export type ElectionWinSceneId = (typeof ELECTION_WIN_SCENES)[number];
export type ElectionLossSceneId = (typeof ELECTION_LOSS_SCENES)[number];
export type CoalitionSceneId = (typeof COALITION_SCENES)[number];
export type ElectionSceneId =
  | ElectionWinSceneId
  | ElectionLossSceneId
  | CoalitionSceneId;

// The coalition scenes carry the whole government in the variant, leader
// first, so the set can fly every flag
export const GOVERNMENT_VARIANT_SEPARATOR = '+';

const SOB: CutsceneClipId[] = ['sob-1', 'sob-2', 'sob-3', 'sob-4', 'sob-5'];
const SAD_VIOLIN: CutsceneClipId[] = ['music-violin-sad-1', 'music-violin-sad-2'];
const BRASS: CutsceneClipId[] = ['music-brass-1', 'music-brass-2', 'music-brass-3'];
const CAFE: CutsceneClipId[] = ['music-cafe-1', 'music-cafe-2'];
const CEREMONY: CutsceneClipId[] = ['music-ceremony-1', 'music-ceremony-2'];
const TV_CLICK: CutsceneClipId[] = ['tv-click-1', 'tv-click-2'];
const BUS: CutsceneClipId[] = ['bus-brakes', 'bus-brakes-2'];
const FLAG: CutsceneClipId[] = ['flag-rustle', 'flag-rustle-2'];

const hit = (at: number, clip: CutsceneClipId, volume?: number): QuoteCue =>
  volume === undefined ? { at, clip } : { at, clip, volume };
const pick = (at: number, clips: CutsceneClipId[], volume?: number): QuoteCue =>
  volume === undefined ? { at, pick: clips } : { at, pick: clips, volume };

// Election night news, picked by careerElectionScenes.ts rather than by a
// trigger: the speaker is the party's top man, the variant his party, or
// the whole government for a coalition
export const ELECTION_QUOTE_SCENES: QuoteSceneDefinition[] = [
  {
    id: 'election-flag-sob',
    component: 'ElectionFlagSobScene',
    other: 'none',
    lineStartMs: 3000,
    lineMs: 4000,
    lines: [],
    triggers: [],
    sounds: {
      bed: 'bed-hq-empty',
      cues: [
        pick(1000, TV_CLICK, 1.3),
        hit(1300, 'footsteps-heavy', 1.2),
        pick(2000, FLAG),
        pick(2700, SOB),
        pick(3000, SAD_VIOLIN, 0.9),
        hit(4200, 'sniff-1'),
        hit(5200, 'deflate-hiss'),
        pick(6000, SOB, 0.8),
      ],
    },
  },
  {
    id: 'election-fridge',
    component: 'ElectionFridgeScene',
    other: 'none',
    lineStartMs: 2800,
    lineMs: 4200,
    lines: [],
    triggers: [],
    sounds: {
      bed: 'bed-kitchen-night',
      cues: [
        hit(200, 'hit-sneak-steps'),
        hit(1000, 'fridge-open'),
        pick(2000, BRASS),
        hit(3400, 'hit-crowd-gasp', 0.5),
        hit(4400, 'fridge-close', 1.4),
        hit(5200, 'fridge-open'),
      ],
    },
  },
  {
    id: 'election-glizzy-rally',
    component: 'ElectionGlizzyRallyScene',
    other: 'none',
    lineStartMs: 3000,
    lineMs: 4500,
    lines: [],
    triggers: [],
    sounds: {
      bed: 'bed-rally',
      cues: [
        pick(300, BUS),
        pick(1000, BUS, 0.8),
        hit(1600, 'wrapper-crinkle', 1.4),
        hit(2000, 'wrapper-crinkle', 1.4),
        hit(3000, 'crowd-cheer'),
        pick(3000, BRASS),
        hit(4200, 'firework'),
        hit(5000, 'firework'),
        hit(5800, 'firework'),
        hit(6200, 'coin-clink'),
        { at: 6600, sfx: 'chomp', volume: 0.8 },
      ],
    },
  },
  {
    id: 'election-all-channels',
    component: 'ElectionAllChannelsScene',
    other: 'none',
    lineStartMs: 2400,
    lineMs: 4600,
    lines: [],
    triggers: [],
    sounds: {
      bed: 'bed-parlor',
      cues: [
        pick(1150, TV_CLICK, 1.3),
        pick(1700, TV_CLICK, 1.3),
        pick(2250, TV_CLICK, 1.3),
        pick(2800, BRASS),
        hit(4000, 'deflate-hiss'),
        hit(4300, 'sting-fail', 0.6),
      ],
    },
  },
  {
    id: 'coalition-small-chair',
    component: 'CoalitionSmallChairScene',
    other: 'none',
    lineStartMs: 3000,
    lineMs: 4500,
    lines: [],
    triggers: [],
    sounds: {
      bed: 'bed-ceremony',
      cues: [
        hit(800, 'footsteps-heavy'),
        hit(1400, 'chair-creak'),
        hit(2000, 'flash-barrage', 0.8),
        pick(2000, CEREMONY, 0.8),
        hit(3000, 'pen-scribble'),
        hit(4500, 'slide-wood'),
        hit(5000, 'pen-scribble'),
        hit(6000, 'handshake-clasp', 1.6),
        hit(6100, 'flash-barrage'),
        hit(6600, 'stamp-seal', 1.4),
      ],
    },
  },
  {
    id: 'coalition-reconciliation',
    component: 'CoalitionReconciliationScene',
    other: 'none',
    lineStartMs: 3000,
    lineMs: 5500,
    lines: [],
    triggers: [],
    sounds: {
      bed: 'bed-ceremony',
      cues: [
        hit(400, 'footsteps-heavy'),
        hit(1200, 'hit-crowd-gasp', 0.6),
        hit(1800, 'handshake-clasp', 1.6),
        hit(2200, 'kiss-smack'),
        hit(3000, 'pen-scribble'),
        hit(3800, 'stamp-seal', 1.4),
        pick(4200, CAFE),
        hit(4400, 'soda-pop'),
        hit(4600, 'flash-barrage', 0.7),
      ],
    },
  },
  {
    id: 'coalition-three-way',
    component: 'CoalitionThreeWayScene',
    other: 'none',
    lineStartMs: 3000,
    lineMs: 4500,
    lines: [],
    triggers: [],
    sounds: {
      bed: 'bed-ceremony',
      cues: [
        hit(1200, 'handshake-clasp', 1.6),
        hit(1500, 'handshake-clasp', 1.6),
        pick(2000, CEREMONY, 0.8),
        hit(2800, 'pen-scribble'),
        hit(3600, 'pen-scribble'),
        hit(4200, 'pen-scribble'),
        hit(4800, 'stamp-seal', 1.4),
        hit(5400, 'flash-barrage'),
      ],
    },
  },
];
