import type {
  ActionSceneId,
  ActionSceneOutcome,
  SabotageHitSceneId,
} from '@/lib/constants/careerScenes';

export const CUTSCENE_AUDIO_DIR = '/games/audio/cutscenes';
// The arena crowd from the broadcast, heard through the corridor wall
export const ARENA_CROWD_BED_SRC = '/games/audio/ambience/crowd-1.mp3';

// One id per mp3 in public/games/audio/cutscenes. The bank was rendered
// once; the prompts behind it live with the generator, not the app
export type CutsceneClipId =
  | 'bed-gym'
  | 'bed-dark-room'
  | 'bed-clinic'
  | 'bed-square'
  | 'bed-parlor'
  | 'bed-bedroom'
  | 'bed-kitchen-night'
  | 'bed-sea'
  | 'bed-press'
  | 'bed-scandal'
  | 'bed-club-door'
  | 'bed-office'
  | 'bed-alley'
  | 'belly-gurgle'
  | 'burp-big'
  | 'sniff-1'
  | 'sniff-2'
  | 'discover-ding'
  | 'plate-slide'
  | 'pen-tick'
  | 'scale-creak'
  | 'megaphone-shout'
  | 'firework'
  | 'spot-shuffle'
  | 'snore'
  | 'stomach-growl'
  | 'rope-creak'
  | 'boat-creak'
  | 'gull-cry'
  | 'mic-tap'
  | 'flash-barrage'
  | 'paper-flutter'
  | 'fire-crackle'
  | 'footsteps-heavy'
  | 'throw-whoosh'
  | 'rope-clink'
  | 'pen-scribble'
  | 'coin-clink'
  | 'stamp-thud'
  | 'whisper'
  | 'slide-wood'
  | 'vial-clink'
  | 'cat-meow'
  | 'sting-level-up'
  | 'sting-good'
  | 'sting-fail'
  | 'bed-forest-night'
  | 'hit-vial-pour'
  | 'hit-retch'
  | 'hit-iv-beep'
  | 'hit-witch-cackle'
  | 'hit-cat-hiss'
  | 'hit-spooky-chime'
  | 'hit-envelope-slide'
  | 'hit-grease-sizzle'
  | 'hit-gulp'
  | 'hit-phone-buzz'
  | 'hit-crowd-gasp'
  | 'hit-crowd-angry'
  | 'hit-camera-roll'
  | 'hit-heart-crack'
  | 'hit-candle-blow'
  | 'hit-twig-snap'
  | 'hit-beast-growl'
  | 'hit-beast-roar'
  | 'hit-claw-swipe'
  | 'hit-paint-splat'
  | 'hit-demon-growl'
  | 'hit-door-pound'
  | 'hit-chain-rattle'
  | 'hit-salt-pour'
  | 'hit-rooster'
  | 'hit-door-kick'
  | 'hit-police-radio'
  | 'hit-locker-clang'
  | 'hit-door-creak'
  | 'hit-sneak-steps'
  | 'hit-thud-body'
  | 'hit-dust-hands'
  | 'spoon-bonk'
  | 'deflate-hiss'
  | 'crowd-cheer'
  | 'car-skid-crash'
  | 'car-brake'
  | 'phone-beep'
  | 'police-siren'
  | 'phone-dial'
  | 'crowd-echo'
  | 'drum-roll'
  | 'cymbal-crash'
  | 'fanfare'
  | 'seat-tick';

// The site's existing one-shots, reused where the scene mirrors a match beat
export type ExistingSfx =
  | 'chomp'
  | 'puke'
  | 'cheer'
  | 'boo'
  | 'shutter'
  | 'paper'
  | 'place'
  | 'lift-hat'
  | 'lift-sock'
  | 'lift-box'
  | 'trophy';

// Election night on the action cutscenes' scale. The roll is a CC0
// recording by Scheffler (freesound.org/people/Scheffler/sounds/201211),
// cut at its cymbal so the crash lands on the called winner; the fanfare is
// CC0 by plasterbrain (freesound.org/people/plasterbrain/sounds/397353)
export const electionNightSounds = {
  rollMs: 2400,
  roll: 0.8,
  crash: 1.2,
  fanfare: 1.2,
  barWhoosh: 0.8,
  seatTick: 0.7,
  seatsPerTick: 5,
};

export type CutsceneCue = {
  at: number;
  clip?: CutsceneClipId;
  sfx?: ExistingSfx;
  volume?: number;
  only?: ActionSceneOutcome[];
  // Odds the cue plays at all; a gag that lands every time stops being one
  chance?: number;
};

export type CutsceneSoundtrack = {
  bed: CutsceneClipId;
  bedVolume?: number;
  // When the bed fades out: the choreography is over by then and nothing
  // should keep looping under a scene that has stopped moving
  bedMs: number;
  cues: CutsceneCue[];
};

const GOOD: ActionSceneOutcome[] = ['good', 'level-up'];
const BAD: ActionSceneOutcome[] = ['bad'];
const LEVEL: ActionSceneOutcome[] = ['level-up'];
const PROGRESS: ActionSceneOutcome[] = ['good'];

const INVEST: CutsceneSoundtrack = {
  bed: 'bed-office',
  bedMs: 4200,
  cues: [
    { at: 200, sfx: 'paper' },
    { at: 200, clip: 'coin-clink' },
    { at: 460, clip: 'coin-clink' },
    { at: 720, clip: 'coin-clink' },
    { at: 900, clip: 'pen-scribble' },
    { at: 2700, clip: 'stamp-thud' },
    { at: 3000, clip: 'sting-good', volume: 0.35 },
  ],
};

const sabotage = (item: CutsceneCue): CutsceneSoundtrack => ({
  bed: 'bed-alley',
  bedMs: 5200,
  cues: [
    { at: 600, clip: 'whisper' },
    { at: 1500, clip: 'cat-meow', volume: 0.3 },
    item,
    { at: 2600, clip: 'whisper', volume: 0.4 },
  ],
});

// Timings follow the keyframe beats declared in each scene component
export const CUTSCENE_SOUNDTRACKS: Record<ActionSceneId, CutsceneSoundtrack> = {
  'training-stomach': {
    bed: 'bed-gym',
    bedMs: 5200,
    cues: [
      { at: 1500, sfx: 'chomp' },
      { at: 1980, sfx: 'chomp' },
      { at: 2460, sfx: 'chomp' },
      { at: 2600, clip: 'belly-gurgle', volume: 0.5 },
      { at: 2940, sfx: 'chomp' },
      { at: 3420, sfx: 'chomp' },
      { at: 3600, clip: 'burp-big', only: LEVEL },
      { at: 3800, clip: 'sting-level-up', only: LEVEL },
      { at: 3900, clip: 'sting-good', volume: 0.35, only: PROGRESS },
      { at: 3700, sfx: 'puke', only: BAD },
      { at: 4000, clip: 'sting-fail', only: BAD },
    ],
  },
  'training-sniffer': {
    bed: 'bed-dark-room',
    bedMs: 4800,
    cues: [
      { at: 300, clip: 'sniff-1' },
      { at: 1100, clip: 'sniff-2' },
      { at: 1900, clip: 'sniff-1' },
      { at: 2600, sfx: 'lift-box' },
      { at: 2750, clip: 'discover-ding', only: GOOD },
      { at: 3000, sfx: 'lift-hat', only: LEVEL },
      { at: 3300, sfx: 'lift-sock', only: LEVEL },
      { at: 3500, clip: 'sting-level-up', only: LEVEL },
      { at: 3100, clip: 'sting-good', volume: 0.35, only: PROGRESS },
      { at: 2800, clip: 'sting-fail', only: BAD },
    ],
  },
  'training-nutrition': {
    bed: 'bed-clinic',
    bedMs: 5200,
    cues: [
      { at: 500, clip: 'scale-creak' },
      { at: 1300, clip: 'plate-slide' },
      { at: 1600, clip: 'plate-slide' },
      { at: 1800, clip: 'pen-tick' },
      { at: 2280, clip: 'pen-tick' },
      { at: 2760, clip: 'pen-tick' },
      { at: 3400, sfx: 'chomp', only: GOOD },
      { at: 4000, clip: 'sting-good', volume: 0.35, only: PROGRESS },
      { at: 3700, clip: 'sting-level-up', only: LEVEL },
      { at: 3000, clip: 'plate-slide', only: BAD },
      { at: 3600, clip: 'sting-fail', only: BAD },
    ],
  },
  'training-fans': {
    bed: 'bed-square',
    bedMs: 5200,
    cues: [
      { at: 300, clip: 'megaphone-shout' },
      { at: 700, sfx: 'cheer', only: GOOD },
      { at: 700, sfx: 'boo', only: BAD },
      { at: 2400, clip: 'firework', only: LEVEL },
      { at: 2780, clip: 'firework', only: LEVEL },
      { at: 3160, clip: 'firework', only: LEVEL },
      { at: 2600, clip: 'sting-level-up', only: LEVEL },
      { at: 3200, clip: 'sting-fail', only: BAD },
    ],
  },
  'training-sparring': {
    bed: 'bed-parlor',
    bedMs: 5200,
    cues: [
      { at: 900, sfx: 'place' },
      { at: 1400, clip: 'spot-shuffle' },
      { at: 2700, sfx: 'lift-box', only: GOOD },
      { at: 2700, sfx: 'lift-hat', only: BAD },
      { at: 3500, sfx: 'chomp', only: GOOD },
      { at: 4100, clip: 'sting-good', volume: 0.35, only: GOOD },
      { at: 3300, clip: 'sting-fail', only: BAD },
    ],
  },
  rest: {
    bed: 'bed-bedroom',
    bedMs: 7000,
    cues: [
      { at: 1200, clip: 'snore' },
      { at: 4600, clip: 'snore' },
      { at: 8000, clip: 'snore' },
    ],
  },
  fast: {
    bed: 'bed-kitchen-night',
    bedMs: 6500,
    cues: [
      { at: 0, clip: 'rope-creak', volume: 0.4 },
      { at: 2600, clip: 'rope-creak', volume: 0.4 },
      { at: 5200, clip: 'rope-creak', volume: 0.4 },
      { at: 2100, clip: 'stomach-growl' },
      { at: 5100, clip: 'stomach-growl' },
    ],
  },
  island: {
    bed: 'bed-sea',
    bedMs: 7500,
    cues: [
      { at: 800, clip: 'gull-cry' },
      { at: 1500, clip: 'boat-creak' },
      { at: 3400, clip: 'gull-cry', volume: 0.6 },
      { at: 4500, clip: 'boat-creak' },
    ],
  },
  'media-interview': {
    bed: 'bed-press',
    bedMs: 5000,
    cues: [
      { at: 400, clip: 'mic-tap' },
      { at: 900, sfx: 'shutter' },
      { at: 1500, sfx: 'shutter' },
      { at: 2100, sfx: 'shutter' },
      { at: 3200, sfx: 'shutter' },
    ],
  },
  'media-scandal': {
    bed: 'bed-scandal',
    bedMs: 5000,
    cues: [
      { at: 100, clip: 'flash-barrage' },
      { at: 600, clip: 'paper-flutter' },
      { at: 2300, clip: 'paper-flutter', volume: 0.6 },
      { at: 1500, sfx: 'cheer', only: GOOD },
      { at: 2000, clip: 'sting-good', volume: 0.35, only: GOOD },
      { at: 2600, clip: 'fire-crackle', only: BAD },
      { at: 3200, clip: 'sting-fail', only: BAD },
    ],
  },
  guard: {
    bed: 'bed-club-door',
    bedMs: 4800,
    cues: [
      { at: 200, clip: 'footsteps-heavy' },
      { at: 500, clip: 'rope-clink' },
      { at: 3000, clip: 'footsteps-heavy' },
      { at: 3200, clip: 'throw-whoosh' },
      { at: 3900, clip: 'sting-good', volume: 0.35 },
    ],
  },
  'invest-security': INVEST,
  'invest-spa': INVEST,
  'invest-assistant': INVEST,
  'invest-scout': INVEST,
  'sabotage-1': sabotage({ at: 1900, clip: 'slide-wood' }),
  'sabotage-2': sabotage({ at: 3200, clip: 'vial-clink' }),
  'sabotage-3': sabotage({ at: 1900, clip: 'slide-wood' }),
};

// The sad trombone wears out fast across a reel of hits
const FAIL_STING_CHANCE = 0.25;

// The victim's side of every plot: each scene has its own hits, cut from
// the same bank. Timings follow the beats declared in each hit scene
const RAID: CutsceneSoundtrack = {
  bed: 'bed-club-door',
  bedMs: 5200,
  cues: [
    { at: 300, clip: 'hit-door-kick' },
    { at: 500, clip: 'hit-police-radio', volume: 0.7 },
    { at: 700, clip: 'footsteps-heavy' },
    { at: 1300, clip: 'hit-door-pound' },
    { at: 2450, clip: 'hit-locker-clang' },
    { at: 2600, clip: 'paper-flutter', volume: 0.6 },
    { at: 3200, clip: 'flash-barrage', volume: 0.6 },
    { at: 3300, clip: 'discover-ding', volume: 0.4 },
    { at: 3900, clip: 'sting-fail', chance: FAIL_STING_CHANCE },
  ],
};

export const SABOTAGE_HIT_SOUNDTRACKS: Record<
  SabotageHitSceneId,
  CutsceneSoundtrack
> = {
  'hit-poison-glizimaker': {
    bed: 'bed-kitchen-night',
    bedMs: 5200,
    cues: [
      { at: 400, clip: 'coin-clink' },
      { at: 900, clip: 'hit-vial-pour' },
      { at: 1400, clip: 'slide-wood', volume: 0.6 },
      { at: 1900, sfx: 'chomp' },
      { at: 2400, sfx: 'chomp' },
      { at: 2900, clip: 'belly-gurgle' },
      { at: 3300, clip: 'hit-retch' },
      { at: 3600, sfx: 'puke' },
      { at: 4200, clip: 'sting-fail', chance: FAIL_STING_CHANCE },
    ],
  },
  'hit-poison-kafana': {
    bed: 'bed-parlor',
    bedMs: 5600,
    cues: [
      { at: 300, clip: 'plate-slide' },
      { at: 1300, sfx: 'chomp' },
      { at: 1800, sfx: 'chomp' },
      { at: 2400, clip: 'stomach-growl' },
      { at: 3000, clip: 'hit-retch' },
      { at: 3300, sfx: 'puke' },
      { at: 3900, clip: 'hit-iv-beep' },
      { at: 4600, clip: 'sting-fail', volume: 0.7, chance: FAIL_STING_CHANCE },
    ],
  },
  'hit-curse': {
    bed: 'bed-alley',
    bedMs: 5800,
    cues: [
      { at: 300, clip: 'hit-witch-cackle', volume: 0.6 },
      { at: 1500, clip: 'whisper', volume: 0.7 },
      { at: 2700, clip: 'hit-witch-cackle' },
      { at: 3600, clip: 'hit-vial-pour' },
      { at: 4000, clip: 'hit-cat-hiss', volume: 0.6 },
      { at: 4100, clip: 'hit-spooky-chime' },
      { at: 4400, clip: 'sniff-2' },
      { at: 4900, clip: 'sting-fail', volume: 0.7, chance: FAIL_STING_CHANCE },
    ],
  },
  'hit-bribe': {
    bed: 'bed-clinic',
    bedMs: 5200,
    cues: [
      { at: 400, clip: 'hit-envelope-slide' },
      { at: 700, clip: 'coin-clink' },
      { at: 850, clip: 'coin-clink', volume: 0.7 },
      { at: 1200, clip: 'pen-scribble' },
      { at: 2200, clip: 'plate-slide' },
      { at: 2300, clip: 'hit-grease-sizzle', volume: 0.7 },
      { at: 2600, clip: 'plate-slide' },
      { at: 3200, sfx: 'chomp' },
      { at: 3650, sfx: 'chomp' },
      { at: 3900, clip: 'hit-gulp' },
      { at: 4400, clip: 'sting-fail', chance: FAIL_STING_CHANCE },
    ],
  },
  'hit-rumor': {
    bed: 'bed-square',
    bedMs: 5400,
    cues: [
      { at: 400, clip: 'hit-phone-buzz' },
      { at: 550, clip: 'whisper', volume: 0.6 },
      { at: 1040, clip: 'hit-phone-buzz', volume: 0.8 },
      { at: 1200, clip: 'whisper', volume: 0.6 },
      { at: 1680, clip: 'hit-phone-buzz', volume: 0.6 },
      { at: 2000, clip: 'paper-flutter' },
      { at: 2800, clip: 'hit-crowd-gasp' },
      { at: 3300, clip: 'hit-crowd-angry' },
      { at: 4200, clip: 'sting-fail', volume: 0.7, chance: FAIL_STING_CHANCE },
    ],
  },
  'hit-catfish-date': {
    bed: 'bed-parlor',
    bedMs: 5400,
    cues: [
      { at: 500, clip: 'rope-creak', volume: 0.5 },
      { at: 2300, sfx: 'shutter' },
      { at: 2350, clip: 'flash-barrage', volume: 0.7 },
      { at: 2500, clip: 'hit-camera-roll' },
      { at: 2600, clip: 'hit-crowd-gasp', volume: 0.6 },
      { at: 2900, clip: 'mic-tap' },
      { at: 2950, clip: 'hit-heart-crack' },
      { at: 3200, clip: 'hit-candle-blow' },
      { at: 4200, clip: 'sting-fail', volume: 0.7, chance: FAIL_STING_CHANCE },
    ],
  },
  'hit-catfish-zeka': {
    bed: 'bed-forest-night',
    bedMs: 5800,
    cues: [
      { at: 900, clip: 'hit-twig-snap' },
      { at: 1600, clip: 'hit-beast-growl' },
      { at: 2600, clip: 'hit-beast-roar' },
      { at: 2900, clip: 'hit-claw-swipe' },
      { at: 3000, clip: 'throw-whoosh' },
      { at: 3200, clip: 'hit-paint-splat' },
      { at: 3500, clip: 'hit-paint-splat', volume: 0.8 },
      { at: 3800, clip: 'hit-paint-splat' },
      { at: 4100, clip: 'hit-paint-splat', volume: 0.7 },
      { at: 4400, clip: 'hit-paint-splat', volume: 0.9 },
      { at: 4900, clip: 'sting-fail', volume: 0.7, chance: FAIL_STING_CHANCE },
    ],
  },
  'hit-catfish-demons': {
    bed: 'bed-alley',
    bedMs: 5800,
    cues: [
      { at: 300, clip: 'hit-demon-growl' },
      { at: 1200, clip: 'hit-door-pound' },
      { at: 1800, clip: 'hit-door-pound', volume: 0.8 },
      { at: 2400, clip: 'hit-salt-pour' },
      { at: 2600, clip: 'hit-chain-rattle' },
      { at: 3000, clip: 'hit-demon-growl', volume: 0.7 },
      { at: 3050, clip: 'hit-door-pound', volume: 0.6 },
      { at: 4200, clip: 'hit-rooster', volume: 0.6 },
      { at: 4700, clip: 'sting-fail', volume: 0.6, chance: FAIL_STING_CHANCE },
    ],
  },
  'hit-raid-tax': RAID,
  'hit-raid-stash': RAID,
  'hit-raid-island': RAID,
  'hit-raid-smuggling': RAID,
  'hit-blocked': {
    bed: 'bed-club-door',
    bedMs: 5200,
    cues: [
      { at: 300, clip: 'hit-sneak-steps' },
      { at: 1400, clip: 'hit-door-creak' },
      { at: 1700, clip: 'footsteps-heavy' },
      { at: 2200, clip: 'stamp-thud' },
      { at: 2900, clip: 'throw-whoosh' },
      { at: 3400, clip: 'hit-thud-body' },
      { at: 3700, clip: 'hit-dust-hands' },
      { at: 3900, clip: 'sting-good', volume: 0.4 },
    ],
  },
};
