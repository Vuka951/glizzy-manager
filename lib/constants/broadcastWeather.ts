// Studio weather dressing per theme index: Frozen, Bloody, Summer, Eggplant
export const WEATHER_EMOJI = ['❄️', '🍂', '☀️', '🍆'];

// Degrees the forecast rolls between, per theme
export const WEATHER_RANGES: readonly (readonly [number, number])[] = [
  [-19, -3],
  [3, 14],
  [27, 39],
  [12, 23],
];

export const WEATHER_TINTS = [
  'border-cyan-200/25 bg-cyan-200/5',
  'border-red-300/25 bg-red-300/5',
  'border-amber-300/25 bg-amber-300/5',
  'border-purple-300/25 bg-purple-300/5',
];

export const WEATHER_TEXT = [
  'text-cyan-200',
  'text-red-300',
  'text-amber-300',
  'text-purple-300',
];

// What falls through the weather card; the summer night twinkles instead
export const WEATHER_PARTICLES: readonly (readonly string[])[] = [
  ['❄️', '❄️', '❄️', '❄️', '❄️', '❄️', '❄️', '❄️'],
  ['🍂', '🍁', '🍂', '🍂', '🍁', '🍂', '🍂', '🍁'],
  ['✨', '✨', '✨', '✨', '✨', '✨', '✨', '✨'],
  ['🌸', '🌸', '🍆', '🌸', '🌸', '🍆', '🌸', '🌸'],
];

export const WEATHER_TWINKLES = 2;

export type ParticleSlot = { place: string; drift: string; twinkle: string };

export const PARTICLE_SLOTS: readonly ParticleSlot[] = [
  {
    place: 'left-[6%] top-[10%] text-base [animation-delay:0s]',
    drift: 'animate-[introdrift_5.2s_linear_infinite]',
    twinkle: 'animate-[twinkle_2.6s_ease-in-out_infinite]',
  },
  {
    place: 'left-[19%] top-[42%] text-xs [animation-delay:1.1s]',
    drift: 'animate-[introdrift_6.1s_linear_infinite]',
    twinkle: 'animate-[twinkle_3.1s_ease-in-out_infinite]',
  },
  {
    place: 'left-[31%] top-[6%] text-sm [animation-delay:2.3s]',
    drift: 'animate-[introdrift_4.8s_linear_infinite]',
    twinkle: 'animate-[twinkle_2.2s_ease-in-out_infinite]',
  },
  {
    place: 'left-[47%] top-[58%] text-base [animation-delay:0.6s]',
    drift: 'animate-[introdrift_5.9s_linear_infinite]',
    twinkle: 'animate-[twinkle_2.9s_ease-in-out_infinite]',
  },
  {
    place: 'left-[58%] top-[22%] text-xs [animation-delay:3.1s]',
    drift: 'animate-[introdrift_5.4s_linear_infinite]',
    twinkle: 'animate-[twinkle_2.4s_ease-in-out_infinite]',
  },
  {
    place: 'left-[71%] top-[66%] text-sm [animation-delay:1.8s]',
    drift: 'animate-[introdrift_6.4s_linear_infinite]',
    twinkle: 'animate-[twinkle_3.4s_ease-in-out_infinite]',
  },
  {
    place: 'left-[84%] top-[14%] text-base [animation-delay:2.7s]',
    drift: 'animate-[introdrift_5.1s_linear_infinite]',
    twinkle: 'animate-[twinkle_2.7s_ease-in-out_infinite]',
  },
  {
    place: 'left-[93%] top-[46%] text-xs [animation-delay:0.3s]',
    drift: 'animate-[introdrift_5.7s_linear_infinite]',
    twinkle: 'animate-[twinkle_2.1s_ease-in-out_infinite]',
  },
];

// Staggers for rows and cards that cut in one after another
export const INTRO_STAGGER = [
  '[animation-delay:0ms]',
  '[animation-delay:140ms]',
  '[animation-delay:280ms]',
  '[animation-delay:420ms]',
  '[animation-delay:560ms]',
  '[animation-delay:700ms]',
];
