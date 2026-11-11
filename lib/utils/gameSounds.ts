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

const SPLASH_SOUNDS = [
  '/games/audio/sfx/splash-1.mp3',
  '/games/audio/sfx/splash-2.mp3',
  '/games/audio/sfx/splash-3.mp3',
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

function play(sources: string[], baseVolume: number): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  const volume = gameAudio.scaled(baseVolume, 'sfx');
  if (volume <= 0.01) return null;
  const audio = new Audio(sources[Math.floor(Math.random() * sources.length)]);
  audio.volume = volume;
  audio.play().catch(() => {});
  return audio;
}

const HOVER_SOUNDS = Array.from(
  { length: 4 },
  (_, i) => `/games/audio/sfx/hover-${i + 1}.mp3`,
);

// Every file in the sfx folder sits at one loudness, so the hover is kept
// about 25 dB under every other cue by its base volume alone. A town tap
// plays it a little louder so the click stands out from the hover before it
export function playHoverSound(volume = 0.025): void {
  play(HOVER_SOUNDS, volume);
}

export function playChompSound(volume = 0.5): void {
  play(CHOMP_SOUNDS, volume);
}

export function playPlaceSound(volume = 0.45): void {
  play(PLACE_SOUNDS, volume);
}

export function playLiftSound(spot: HidingSpotId, volume = 0.45): void {
  play(LIFT_SOUNDS[spot], volume);
}

export function playSplashSound(volume = 0.4): void {
  play(SPLASH_SOUNDS, volume);
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

export function playPukeSound(volume = 0.5): void {
  play(PUKE_SOUNDS, volume);
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

export function playDogSound(): void {
  play(['/games/audio/sfx/dog-woof.mp3'], 0.5);
}

// The cup bus engine is long enough to outlive its scene, so the caller keeps
// the element and cuts it off when the bus goes away early
export function playBusArriveSound(): HTMLAudioElement | null {
  return play(['/games/audio/sfx/bus-arrive.mp3'], 0.2);
}

export function playBusLeaveSound(): HTMLAudioElement | null {
  return play(['/games/audio/sfx/bus-leave.mp3'], 0.4);
}

export function playTrophySound(volume = 0.6): void {
  play(TROPHY_SOUNDS, volume);
}

export function playCharacterSelectSound(): void {
  play(CHARACTER_SELECT_SOUNDS, 0.6);
}

// One recorded line on the voice channel; the caller keeps the element so a
// skipped scene can cut it off
export function playQuoteClip(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  const volume = gameAudio.scaled(0.9, 'voice');
  if (volume <= 0.01) return null;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
  return audio;
}
