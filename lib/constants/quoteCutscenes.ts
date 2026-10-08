import type {
  CutsceneClipId,
  CutsceneCue,
  CutsceneSoundtrack,
} from '@/lib/constants/cutsceneSounds';
import { QUOTE_LINE_START_MS } from '@/lib/types/quoteScenes';

export type QuoteSceneId =
  | 'streak-broken'
  | 'opponent-burst'
  | 'opponent-removed'
  | 'favorite-wins'
  | 'underdog-wins'
  | 'photo-finish'
  | 'loss-collapse'
  | 'first-match-exit'
  | 'upset-loss'
  | 'heavy-loss-escape'
  | 'heavy-loss-pillory'
  | 'losing-streak'
  | 'tax-office'
  | 'champion-trophy'
  | 'champion-chicken'
  | 'champion-egg'
  | 'champion-brain'
  | 'champion-crowd'
  | 'runner-up'
  | 'wooden-spoon'
  | 'sponsor-signed'
  | 'price-crash';

export type QuoteMatchRound =
  | 'earlier'
  | 'quarterfinal'
  | 'semifinal'
  | 'final';

export const QUOTE_ROUND_ORDER: QuoteMatchRound[] = [
  'earlier',
  'quarterfinal',
  'semifinal',
  'final',
];

// A match result cues a line from the quarterfinal on, unless the scene
// sets its own first round
export const QUOTE_MATCH_ROUNDS: QuoteMatchRound[] = [
  'quarterfinal',
  'semifinal',
  'final',
];

// The odds a scene airs once its trigger fits, unless the scene sets its own
export const QUOTE_DEFAULT_CHANCE = 0.5;

// Any character can land in a match situation and every match of the cup is
// watched, so a season airs at most this many match-result scenes. Cup-finish,
// sponsor and price scenes do not count toward it
export const QUOTE_MATCH_SCENES_PER_SEASON = 4;

// A match with no human-coached character on either side rolls at this share
// of the scene's chance
export const QUOTE_UNCOACHED_CHANCE_SCALE = 0.5;

// Who stands next to the speaker: the other side of the match (the other
// finalist for a cup-finish scene), or nobody
export type QuoteOtherRule = 'opponent' | 'none';

// Last is the foot of the bracket standings: the round-of-16 loser who went
// out with the fewest lives left, a forfeit below any fought loss
export type QuoteCupPlace = 'champion' | 'runner-up' | 'last';

// Why the loser went out when it was not on lives: his cholesterol burst
// (the sim's meltdown), he threw up overfull, or he gave the match up
export const QUOTE_LOSS_CAUSES = ['cholesterol', 'puke', 'surrender'] as const;
export type QuoteLossCause = (typeof QUOTE_LOSS_CAUSES)[number];

// What has to be true of a game event for the scene to play, and whose
// scene it then is: the event's winner or loser, the holder of a cup place,
// the signer, or a character drawn from the league. A scene lists several
// triggers when more than one moment can cue the same line
// A trigger may name the variant the scene plays in, for a line two
// different moments cue in two dressings
export type QuoteTrigger = { variant?: string } & (
  | {
      kind: 'match-result';
      // The speaker's side of the result
      role: 'winner' | 'loser';
      opponent?: string;
      // The winner finished at least this many lives ahead of the loser
      minMargin?: number;
      // The match went the distance and the winner finished at most this
      // many lives ahead; a forfeit, a walkover or a removal never fits
      maxMargin?: number;
      opponentLowerFame?: boolean;
      opponentHigherFame?: boolean;
      afterLossStreak?: boolean;
      // The loser walked in on a run of straight losses that this one
      // stretches to a streak
      extendsLossStreak?: boolean;
      // The loser was taken out of the match by the police or by a party
      // favor's removal
      opponentRemoved?: boolean;
      // The match was the loser's first of the cup, his round-of-16 match
      loserFirstMatch?: boolean;
      // The speaker's sponsor at the whistle becomes the variant, none when
      // he has no contract
      sponsorVariant?: boolean;
      // The loser went out to one of the loss causes, which becomes the
      // variant the scene plays in. The speaker can be either side of it
      lossCause?: boolean;
      // Narrows lossCause to these causes, every cause when absent
      lossCauses?: QuoteLossCause[];
    }
  | { kind: 'cup-finished'; place: QuoteCupPlace }
  // sponsorVariant plays the scene in the sponsor just signed
  | { kind: 'sponsor-accepted'; sponsorVariant?: boolean }
  // The window closed with the glizacija index lower than it opened, by any
  // amount. The speaker is drawn from the league
  | { kind: 'glizacija-drop' }
);

// Who says line N of the scene: its speaker or the one standing next to
// them. The words live in the locale file under career.quoteScenes, in the
// same order
export type QuoteLineRole = 'speaker' | 'other';

export type QuoteLine = {
  speaker: QuoteLineRole;
  // Offset from the start of the line window at which the subtitle moves on
  // to this line, which then runs until the next line or the window's end
  at: number;
};

// Every promo sits in the arena corridor, so the bed is usually the crowd
// heard through the wall rather than one of the cutscene beds
export type QuoteBedId = CutsceneClipId | 'arena-crowd';

// A cue can belong to the scene's plain dressing or to any variant of it,
// for a sound that only fits one of the two, or to a few named variants
export type QuoteCue = CutsceneCue & {
  dressing?: 'plain' | 'variant';
  variants?: string[];
};

// The bed length follows the scene, so only the cues are declared here
export type QuoteSoundtrack = Omit<
  CutsceneSoundtrack,
  'bedMs' | 'bed' | 'cues'
> & {
  bed: QuoteBedId;
  cues: QuoteCue[];
};

export type QuoteSceneDefinition = {
  id: QuoteSceneId;
  component: string;
  other: QuoteOtherRule;
  variant?: string;
  // A scene that needs a longer setup opens its line window later
  lineStartMs?: number;
  // How long the line window runs: the subtitle types on inside it and the
  // scene's talking beats and sound cues are laid out against it
  lineMs: number;
  lines: QuoteLine[];
  triggers: QuoteTrigger[];
  // The first round its match triggers fire in, the quarterfinal when
  // absent
  fromRound?: QuoteMatchRound;
  // 0 to 1, QUOTE_DEFAULT_CHANCE when absent
  chance?: number;
  sounds?: QuoteSoundtrack;
};

// The subtitle types a line on word by word. The complete line stays up
// for the base time plus a share per word before the scene ends, and the
// words never follow each other faster than the minimum gap
export const QUOTE_READ_BASE_MS = 1200;
export const QUOTE_READ_WORD_MS = 250;
export const QUOTE_MIN_WORD_GAP_MS = 170;

// The tick under every typed word, well under the scene's own cues
export const QUOTE_WORD_BLIP: CutsceneClipId = 'seat-tick';
export const QUOTE_WORD_BLIP_VOLUME = 0.4;

const line = (speaker: QuoteLineRole = 'speaker', at = 0): QuoteLine => ({
  speaker,
  at,
});

const cue = (
  at: number,
  clip: CutsceneCue['clip'],
  volume?: number
): CutsceneCue => (volume === undefined ? { at, clip } : { at, clip, volume });

// Cue volumes sit each one-shot level with the action cutscenes and each
// bed about 12 dB under the one-shots. The arena crowd file runs hotter than
// the cutscene beds
const CROWD_BED_VOLUME = 0.7;

export const QUOTE_SCENES: QuoteSceneDefinition[] = [
  {
    id: 'streak-broken',
    component: 'StreakBrokenScene',
    other: 'opponent',
    lineMs: 4400,
    lineStartMs: 3500,
    lines: [line()],
    triggers: [{ kind: 'match-result', role: 'winner', afterLossStreak: true }],
    fromRound: 'earlier',
    sounds: {
      bed: 'bed-bedroom',
      bedVolume: 1.1,
      // A snore under the bumper, the alarm beeps twice, feet hit the
      // floor, the back creaks on the stretch (the creak peaks 300 ms in)
      // and the whoosh carries the big step to its landing on the line
      cues: [
        cue(100, 'snore', 0.65),
        cue(1100, 'phone-beep'),
        cue(1470, 'phone-beep'),
        cue(2150, 'rope-creak', 0.95),
        cue(2200, 'footsteps-heavy', 1.75),
        cue(2950, 'throw-whoosh'),
        cue(3500, 'footsteps-heavy', 1.75),
      ],
    },
  },
  {
    id: 'opponent-burst',
    component: 'VillainLaughScene',
    other: 'opponent',
    lineMs: 1800,
    lineStartMs: 4200,
    lines: [line()],
    triggers: [
      {
        kind: 'match-result',
        role: 'winner',
        lossCause: true,
        lossCauses: ['cholesterol', 'puke'],
      },
    ],
    fromRound: 'earlier',
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      cues: [
        { at: 300, sfx: 'chomp', volume: 0.7 },
        { at: 700, sfx: 'chomp', volume: 0.7 },
        { at: 1100, sfx: 'chomp', volume: 0.7 },
        { ...cue(1000, 'hit-iv-beep'), variants: ['cholesterol'] },
        { ...cue(1900, 'hit-heart-crack', 1.2), variants: ['cholesterol'] },
        { ...cue(2150, 'hit-thud-body'), variants: ['cholesterol'] },
        { ...cue(2600, 'footsteps-heavy', 1.75), variants: ['cholesterol'] },
        { ...cue(1250, 'belly-gurgle'), variants: ['puke'] },
        { ...cue(1750, 'hit-retch'), variants: ['puke'] },
        { at: 1950, sfx: 'puke', variants: ['puke'] },
        { ...cue(2900, 'hit-thud-body'), variants: ['puke'] },
        cue(2050, 'hit-crowd-gasp'),
      ],
    },
  },
  {
    id: 'opponent-removed',
    component: 'HitAndRunScene',
    other: 'opponent',
    lineMs: 2400,
    lineStartMs: 4200,
    lines: [line()],
    triggers: [
      {
        kind: 'match-result',
        role: 'winner',
        opponentRemoved: true,
        sponsorVariant: true,
      },
    ],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      // The crash in the clip lands on the hit at 1350, the thump on the
      // flatten just after it
      cues: [
        cue(0, 'car-skid-crash', 1.1),
        cue(1440, 'hit-thud-body'),
        cue(2250, 'phone-dial'),
        cue(2300, 'phone-beep'),
        { ...cue(2700, 'police-siren', 1.1), dressing: 'plain' },
        { ...cue(2400, 'car-brake', 1.1), dressing: 'variant' },
        { ...cue(3650, 'footsteps-heavy', 1.75), dressing: 'variant' },
        { ...cue(3950, 'footsteps-heavy', 1.75), dressing: 'variant' },
      ],
    },
  },
  {
    id: 'favorite-wins',
    component: 'DressedUpScene',
    other: 'opponent',
    lineMs: 2420,
    lineStartMs: 3700,
    lines: [line()],
    triggers: [
      { kind: 'match-result', role: 'winner', opponentLowerFame: true },
    ],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      // Chair scrape on standing up, the brush-off, one shutter per flash
      // and the loser's head landing back on the table
      cues: [
        cue(950, 'slide-wood', 0.8),
        cue(2950, 'hit-dust-hands', 2),
        { at: 3400, sfx: 'shutter', volume: 4 },
        { at: 3580, sfx: 'shutter', volume: 4 },
        cue(7040, 'hit-thud-body'),
      ],
    },
  },
  {
    id: 'underdog-wins',
    component: 'SpoonBonkScene',
    other: 'opponent',
    lineMs: 2100,
    lines: [line()],
    triggers: [
      { kind: 'match-result', role: 'winner', opponentHigherFame: true },
    ],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      // One bonk per swing, on the frame the spoon meets the favorite's head
      cues: Array.from({ length: 11 }, (_, i) =>
        cue(1126 + i * 280, 'spoon-bonk', 1.3)
      ),
    },
  },
  {
    id: 'photo-finish',
    component: 'PhotoFinishScene',
    other: 'opponent',
    lineMs: 1700,
    lineStartMs: 3400,
    lines: [line()],
    triggers: [{ kind: 'match-result', role: 'winner', maxMargin: 1 }],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      // The roll runs under the replay and breaks into the crash on the
      // raised finger; the whoosh is the magnifier, the ding the crumb
      cues: [
        cue(950, 'drum-roll', 0.8),
        cue(2400, 'throw-whoosh', 0.7),
        cue(2850, 'discover-ding', 0.8),
        cue(3350, 'cymbal-crash', 0.7),
        cue(3400, 'crowd-cheer', 0.95),
      ],
    },
  },
  {
    id: 'loss-collapse',
    component: 'WreckedRoomScene',
    other: 'none',
    lineMs: 8300,
    lines: [line()],
    triggers: [{ kind: 'match-result', role: 'loser', lossCause: true }],
    fromRound: 'earlier',
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      cues: [cue(250, 'hit-locker-clang', 0.85), cue(600, 'mic-tap')],
    },
  },
  {
    id: 'first-match-exit',
    component: 'FlashbackScene',
    other: 'opponent',
    lineMs: 1900,
    lineStartMs: 4500,
    lines: [line()],
    triggers: [{ kind: 'match-result', role: 'loser', loserFirstMatch: true }],
    fromRound: 'earlier',
    // Every early loser fits, so it rolls low to stay an occasional sight
    chance: 0.2,
    sounds: {
      bed: 'bed-dark-room',
      cues: [
        cue(1500, 'crowd-echo', 0.8),
        cue(2700, 'crowd-echo', 0.8),
        cue(3700, 'crowd-echo', 0.8),
      ],
    },
  },
  {
    id: 'upset-loss',
    component: 'TvRageScene',
    other: 'opponent',
    lineMs: 4400,
    lines: [line()],
    triggers: [
      { kind: 'match-result', role: 'loser', opponentLowerFame: true },
    ],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      cues: [],
    },
  },
  {
    id: 'heavy-loss-escape',
    component: 'WindowEscapeScene',
    other: 'opponent',
    lineMs: 1200,
    lineStartMs: 1400,
    lines: [line()],
    triggers: [{ kind: 'match-result', role: 'loser', minMargin: 3 }],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      cues: [
        cue(250, 'hit-sneak-steps'),
        cue(1100, 'slide-wood', 0.6),
        cue(2800, 'throw-whoosh'),
        cue(3200, 'hit-thud-body'),
      ],
    },
  },
  {
    id: 'heavy-loss-pillory',
    component: 'PilloryScene',
    other: 'opponent',
    lineMs: 2800,
    lines: [line()],
    triggers: [{ kind: 'match-result', role: 'loser', minMargin: 2 }],
    sounds: {
      bed: 'bed-square',
      // Each tomato leaves the hand 380 ms before it bursts; the square
      // gasps at the first one in the face and cheers the last
      cues: [
        ...[1350, 2000, 2700, 3400, 4250].flatMap((at) => [
          cue(at - 380, 'throw-whoosh', 0.7),
          cue(at, 'hit-paint-splat', 1.2),
        ]),
        cue(2000, 'hit-crowd-gasp', 0.85),
        cue(4250, 'crowd-cheer', 0.95),
      ],
    },
  },
  {
    id: 'losing-streak',
    component: 'TallyWallScene',
    other: 'none',
    lineMs: 1600,
    lineStartMs: 3200,
    lines: [line()],
    triggers: [
      { kind: 'match-result', role: 'loser', extendsLossStreak: true },
    ],
    fromRound: 'earlier',
    chance: 0.35,
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      // The shuffle up to the wall, the chalk on the stroke, the snap as the
      // stroke ends, the broken half on the floor and the forehead on the
      // wall
      cues: [
        cue(800, 'hit-sneak-steps'),
        cue(1950, 'pen-tick', 1.2),
        cue(2350, 'hit-twig-snap'),
        cue(2780, 'pen-tick', 0.5),
        cue(3150, 'hit-thud-body', 0.8),
      ],
    },
  },
  {
    id: 'tax-office',
    component: 'TaxOfficeScene',
    other: 'opponent',
    lineMs: 2300,
    lineStartMs: 3600,
    lines: [line()],
    triggers: [
      { kind: 'match-result', role: 'loser', opponent: 'tax-inspector' },
    ],
    fromRound: 'earlier',
    sounds: {
      bed: 'bed-office',
      bedVolume: 1.45,
      cues: [
        cue(1000, 'coin-clink'),
        cue(1600, 'coin-clink'),
        cue(2200, 'coin-clink'),
        cue(3600, 'stamp-thud', 1.75),
      ],
    },
  },
  {
    id: 'champion-trophy',
    component: 'TrophyFoundScene',
    other: 'none',
    lineMs: 1500,
    lines: [line()],
    triggers: [{ kind: 'cup-finished', place: 'champion' }],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      cues: [
        cue(150, 'footsteps-heavy', 1.75),
        cue(650, 'footsteps-heavy', 1.75),
        cue(2850, 'discover-ding', 0.8),
        cue(2900, 'crowd-cheer', 0.95),
      ],
    },
  },
  {
    id: 'champion-chicken',
    component: 'ChickenDinnerScene',
    other: 'opponent',
    lineMs: 1400,
    lineStartMs: 1900,
    lines: [line()],
    triggers: [{ kind: 'cup-finished', place: 'champion' }],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      // The platter slides down to the runner-up, the crash lands on the
      // lifted cloche, a stomach gives its owner away and the gulp is the
      // bite
      cues: [
        cue(1000, 'plate-slide'),
        cue(1500, 'cymbal-crash', 0.7),
        cue(2800, 'stomach-growl'),
        cue(3800, 'hit-gulp'),
      ],
    },
  },
  {
    id: 'champion-egg',
    component: 'EggOnTrophyScene',
    other: 'opponent',
    lineMs: 951,
    lineStartMs: 4000,
    lines: [line()],
    triggers: [{ kind: 'cup-finished', place: 'champion' }],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      // The cheer lands as the bumper clears, the slide on the toppling
      // plate, the thud on the cup landing, the clink on the egg against
      // its rim and the body thud on the finalist's head going back down
      cues: [
        cue(950, 'crowd-cheer', 0.95),
        cue(1400, 'plate-slide'),
        cue(2300, 'stamp-thud', 1.75),
        cue(2950, 'vial-clink'),
        cue(5300, 'hit-thud-body'),
      ],
    },
  },
  {
    id: 'champion-brain',
    component: 'BigBrainScene',
    other: 'opponent',
    lineMs: 807,
    lineStartMs: 3800,
    lines: [line()],
    triggers: [{ kind: 'cup-finished', place: 'champion' }],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      // The cheer lands as the bumper clears, the flutter on the paper out of
      // the sleeve, the thud on the seal and the gasp on the double take
      cues: [
        cue(950, 'crowd-cheer', 0.95),
        cue(1900, 'paper-flutter'),
        cue(2450, 'stamp-thud', 1.75),
        cue(3180, 'hit-crowd-gasp', 0.85),
        cue(4700, 'discover-ding', 0.65),
      ],
    },
  },
  {
    id: 'champion-crowd',
    component: 'CrowdSurfScene',
    other: 'none',
    lineMs: 3800,
    lines: [line()],
    triggers: [{ kind: 'cup-finished', place: 'champion' }],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      cues: [cue(1250, 'crowd-cheer', 0.95)],
    },
  },
  {
    id: 'runner-up',
    component: 'RunnerUpScene',
    other: 'opponent',
    lineMs: 6000,
    lines: [line()],
    triggers: [{ kind: 'cup-finished', place: 'runner-up' }],
    sounds: {
      bed: 'arena-crowd',
      bedVolume: CROWD_BED_VOLUME,
      cues: [
        cue(300, 'coin-clink', 0.8),
        cue(450, 'mic-tap'),
        cue(720, 'coin-clink', 0.8),
        cue(1140, 'coin-clink', 0.8),
        cue(4300, 'discover-ding', 0.65),
      ],
    },
  },
  {
    id: 'wooden-spoon',
    component: 'WoodenSpoonScene',
    other: 'none',
    lineMs: 1800,
    lineStartMs: 3200,
    lines: [line()],
    triggers: [{ kind: 'cup-finished', place: 'last' }],
    // Every cup has a last place, so it rolls low to stay an occasional sight
    chance: 0.3,
    sounds: {
      // The hall has emptied by the time the last place gets its turn
      bed: 'bed-dark-room',
      // The thud pins the ribbon on, the trombone greets the spoon, the ding
      // lands on the hoist and each clap is one of the lone spectator's
      cues: [
        cue(1250, 'stamp-thud', 1.2),
        cue(1500, 'sting-fail', 0.7),
        cue(3050, 'discover-ding', 0.65),
        ...Array.from({ length: 4 }, (_, i) =>
          cue(3600 + i * 900, 'hit-dust-hands', 1.4)
        ),
      ],
    },
  },
  {
    id: 'sponsor-signed',
    component: 'SponsorDealScene',
    other: 'none',
    lineMs: 900,
    lineStartMs: 1900,
    lines: [line()],
    triggers: [{ kind: 'sponsor-accepted', sponsorVariant: true }],
    sounds: {
      bed: 'bed-office',
      bedVolume: 1.45,
      cues: [
        { at: 2950, sfx: 'shutter', volume: 4 },
        { at: 3350, sfx: 'shutter', volume: 4 },
      ],
    },
  },
  {
    id: 'price-crash',
    component: 'TruckCrashScene',
    other: 'none',
    lineMs: 2265,
    lineStartMs: 3800,
    lines: [line()],
    triggers: [{ kind: 'glizacija-drop' }],
    chance: 0.5,
    sounds: {
      bed: 'bed-forest-night',
      // The crash in the clip lands on the impact at 1350; the whoosh on
      // the index graphic, the hiss on its plunge, the chomp on the bite
      cues: [
        cue(0, 'car-skid-crash', 1.1),
        cue(2100, 'throw-whoosh', 0.8),
        cue(2550, 'deflate-hiss', 0.9),
        cue(2750, 'footsteps-heavy', 1.75),
        { at: 3600, sfx: 'chomp', volume: 0.7 },
      ],
    },
  },
];

export const QUOTE_SCENE_BY_ID = Object.fromEntries(
  QUOTE_SCENES.map((scene) => [scene.id, scene])
) as Record<QuoteSceneId, QuoteSceneDefinition>;

export function quoteLineStartMs(scene: QuoteSceneDefinition): number {
  return scene.lineStartMs ?? QUOTE_LINE_START_MS;
}
