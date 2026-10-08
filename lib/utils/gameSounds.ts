import type { HidingSpotId } from '@/data/games/glizzyDuel';
import { CUTSCENE_AUDIO_DIR } from '@/lib/constants/cutsceneSounds';
import { gameAudio } from '@/lib/utils/gameAudio';

const CHOMP_SOUNDS = [
  '/games/audio/sfx/chomp-1.mp3',
  '/games/audio/sfx/chomp-2.mp3',
  '/games/audio/sfx/chomp-3.mp3',
];

const PLACE_SOUNDS = [
  '/games/audio/sfx/place-1.mp3',
  '/games/audio/sfx/place-2.mp3',
  '/games/audio/sfx/place-3.mp3',
];

const LIFT_SOUNDS: Record<HidingSpotId, string[]> = {
  hat: [
    '/games/audio/sfx/lift-hat-1.mp3',
    '/games/audio/sfx/lift-hat-2.mp3',
    '/games/audio/sfx/lift-hat-3.mp3',
  ],
  sock: [
    '/games/audio/sfx/lift-sock-1.mp3',
    '/games/audio/sfx/lift-sock-2.mp3',
    '/games/audio/sfx/lift-sock-3.mp3',
  ],
  box: [
    '/games/audio/sfx/lift-box-1.mp3',
    '/games/audio/sfx/lift-box-2.mp3',
    '/games/audio/sfx/lift-box-3.mp3',
  ],
};

const CHEER_SOUNDS = [
  '/games/audio/sfx/cheer-1.mp3',
  '/games/audio/sfx/cheer-2.mp3',
];

const BOO_SOUNDS = [
  '/games/audio/sfx/boo-1.mp3',
  '/games/audio/sfx/boo-2.mp3',
];

const CRICKET_SOUNDS = [
  '/games/audio/sfx/cricket-1.mp3',
  '/games/audio/sfx/cricket-2.mp3',
];

const PAPER_SOUNDS = [
  '/games/audio/sfx/paper-1.mp3',
  '/games/audio/sfx/paper-2.mp3',
  '/games/audio/sfx/paper-3.mp3',
];

const LETTER_SOUNDS = [
  '/games/audio/sfx/letter-1.mp3',
  '/games/audio/sfx/letter-2.mp3',
  '/games/audio/sfx/letter-3.mp3',
];

const PUKE_SOUNDS = [
  '/games/audio/sfx/puke-1.mp3',
  '/games/audio/sfx/puke-2.mp3',
  '/games/audio/sfx/puke-3.mp3',
];

const MELTDOWN_SOUNDS = [
  '/games/audio/sfx/meltdown-1.mp3',
  '/games/audio/sfx/meltdown-2.mp3',
  '/games/audio/sfx/meltdown-3.mp3',
];

const POLICE_SOUNDS = [
  '/games/audio/sfx/police-1.mp3',
  '/games/audio/sfx/police-2.mp3',
  '/games/audio/sfx/police-3.mp3',
];

const SHUTTER_SOUNDS = [
  '/games/audio/sfx/shutter-1.mp3',
  '/games/audio/sfx/shutter-2.mp3',
  '/games/audio/sfx/shutter-3.mp3',
];

const TROPHY_SOUNDS = Array.from(
  { length: 2 },
  (_, i) => `/games/audio/sfx/trophy-${i + 1}.mp3`,
);

// A pen ticking the ad on the classifieds page, the same for every applicant
const CHARACTER_SELECT_SOUNDS = [`${CUTSCENE_AUDIO_DIR}/pen-tick.mp3`];

const WITHDRAW_SOUNDS = [
  '/games/audio/sfx/withdraw-1.mp3',
  '/games/audio/sfx/withdraw-2.mp3',
  '/games/audio/sfx/withdraw-3.mp3',
];

function play(sources: string[], baseVolume: number): void {
  if (typeof window === 'undefined') return;
  const volume = gameAudio.scaled(baseVolume, 'sfx');
  if (volume <= 0.01) return;
  const audio = new Audio(sources[Math.floor(Math.random() * sources.length)]);
  audio.volume = volume;
  audio.play().catch(() => {});
}

export function playChompSound(volume = 0.5): void {
  play(CHOMP_SOUNDS, volume);
}

export function playPlaceSound(): void {
  play(PLACE_SOUNDS, 0.45);
}

export function playLiftSound(spot: HidingSpotId): void {
  play(LIFT_SOUNDS[spot], 0.45);
}

// Intensity carries the crowd's fame reading: 1 is the ordinary room
const COIN_SOUNDS = {
  small: '/games/audio/sfx/coins-small.mp3',
  medium: '/games/audio/sfx/coins-medium.mp3',
  jackpot: '/games/audio/sfx/coins-jackpot.mp3',
};

// A won bet pays out loud: a few coins for a small stake, a handful for a
// medium one, the jackpot tray for the top of the ladder
export function playCoinSound(stake: number): void {
  const tier = stake >= 50 ? 'jackpot' : stake >= 25 ? 'medium' : 'small';
  play([COIN_SOUNDS[tier]], 0.5);
}

export function playCheerSound(intensity = 1): void {
  play(CHEER_SOUNDS, 0.45 * intensity);
}

export function playBooSound(intensity = 1): void {
  play(BOO_SOUNDS, 0.45 * intensity);
}

// The hall could not be bothered either way
export function playCricketSound(): void {
  play(CRICKET_SOUNDS, 0.45);
}

export function playPaperSound(): void {
  play(PAPER_SOUNDS, 0.45);
}

export function playLetterSound(): void {
  play(LETTER_SOUNDS, 0.45);
}

export function playPukeSound(): void {
  play(PUKE_SOUNDS, 0.5);
}

export function playMeltdownSound(): void {
  play(MELTDOWN_SOUNDS, 0.45);
}

export function playPoliceSound(): void {
  play(POLICE_SOUNDS, 0.45);
}

export function playWithdrawSound(): void {
  play(WITHDRAW_SOUNDS, 0.5);
}

// One press camera firing off, quiet enough to layer several at once
export function playShutterSound(volume = 0.3): void {
  play(SHUTTER_SOUNDS, volume);
}

export function playTrophySound(): void {
  play(TROPHY_SOUNDS, 0.6);
}

export function playCharacterSelectSound(): void {
  play(CHARACTER_SELECT_SOUNDS, 0.6);
}
