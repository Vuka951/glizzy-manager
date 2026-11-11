import type { TownLayoutKey } from '@/lib/constants/townLayout';
import type { CareerMoodActivity } from '@/lib/utils/careerMood';

export type TownMoodStop = { x: number; y: number; behind?: boolean };

export type TownMoodBit = { duration: number; keyframes: Keyframe[] };

export type TownMoodGait = {
  // Times the walker's trip speed
  speed: number;
  // The bounce the character and any escort walk with
  hop: string;
  // How the body moves on top of the bounce, one full step cycle
  step: TownMoodBit;
};

// How long the character stays at a stop before moving on, in milliseconds. At
// the mood's own spot the long version, anywhere else a quick errand
export const TOWN_MOOD_DWELL = {
  home: [7000, 12000],
  stop: [3200, 6500],
} as const;

// The chance of heading back to the mood's own spot after a stop elsewhere
export const TOWN_MOOD_RETURN_CHANCE = 0.4;

// Closer than this in height and the character walks straight there, further
// and they go by way of the road
export const TOWN_MOOD_DIRECT_DY = 46;

const shake = (spread: number, turn: number, duration: number): TownMoodBit => ({
  duration,
  keyframes: [
    { transform: 'translateX(0) rotate(0deg)' },
    { transform: `translateX(${-spread}px) rotate(${-turn}deg)` },
    { transform: `translateX(${spread}px) rotate(${turn}deg)` },
    { transform: `translateX(${-spread}px) rotate(${-turn}deg)` },
    { transform: `translateX(${spread}px) rotate(${turn}deg)` },
    { transform: 'translateX(0) rotate(0deg)' },
  ],
});

const hopClass = {
  drag: 'motion-safe:animate-[fanhop_0.9s_ease-in-out_infinite] motion-lite:animate-none!',
  slow: 'motion-safe:animate-[fanhop_0.6s_ease-in-out_infinite] motion-lite:animate-none!',
  easy: 'motion-safe:animate-[fanhop_0.44s_ease-in-out_infinite] motion-lite:animate-none!',
  quick: 'motion-safe:animate-[fanhop_0.3s_ease-in-out_infinite] motion-lite:animate-none!',
  run: 'motion-safe:animate-[fanhop_0.22s_ease-in-out_infinite] motion-lite:animate-none!',
};

export const TOWN_MOOD_GAITS: Record<CareerMoodActivity, TownMoodGait> = {
  idle: {
    speed: 0.28,
    hop: hopClass.easy,
    step: {
      duration: 880,
      keyframes: [
        { transform: 'rotate(-3deg)' },
        { transform: 'rotate(3deg)' },
        { transform: 'rotate(-3deg)' },
      ],
    },
  },
  celebrating: {
    speed: 0.55,
    hop: hopClass.quick,
    step: {
      duration: 900,
      keyframes: [
        { transform: 'translateY(0) rotate(-10deg)' },
        { transform: 'translateY(-12px) rotate(0deg) scale(1.05)' },
        { transform: 'translateY(0) rotate(10deg)' },
        { transform: 'translateY(-12px) rotate(0deg) scale(1.05)' },
        { transform: 'translateY(0) rotate(-10deg)' },
      ],
    },
  },
  energized: {
    speed: 0.85,
    hop: hopClass.quick,
    step: {
      duration: 600,
      keyframes: [
        { transform: 'translateY(0) rotate(7deg)' },
        { transform: 'translateY(-5px) rotate(9deg)' },
        { transform: 'translateY(0) rotate(7deg)' },
      ],
    },
  },
  proud: {
    speed: 0.24,
    hop: hopClass.slow,
    step: {
      duration: 1200,
      keyframes: [
        { transform: 'translateY(-2px) rotate(-4deg) scale(1.08)' },
        { transform: 'translateY(-5px) rotate(0deg) scale(1.1)' },
        { transform: 'translateY(-2px) rotate(4deg) scale(1.08)' },
        { transform: 'translateY(-5px) rotate(0deg) scale(1.1)' },
        { transform: 'translateY(-2px) rotate(-4deg) scale(1.08)' },
      ],
    },
  },
  relaxed: {
    speed: 0.18,
    hop: hopClass.slow,
    step: {
      duration: 2200,
      keyframes: [
        { transform: 'rotate(-5deg)' },
        { transform: 'rotate(5deg)' },
        { transform: 'rotate(-5deg)' },
      ],
    },
  },
  hungry: {
    speed: 0.3,
    hop: hopClass.easy,
    step: {
      duration: 1300,
      keyframes: [
        { transform: 'translateY(2px) rotate(9deg)' },
        { transform: 'translateY(4px) rotate(13deg) scale(0.97)' },
        { transform: 'translateY(2px) rotate(9deg)' },
      ],
    },
  },
  anxious: {
    speed: 0.5,
    hop: hopClass.quick,
    step: {
      duration: 1500,
      keyframes: [
        { transform: 'rotate(-6deg) scale(0.95)', offset: 0 },
        { transform: 'rotate(-6deg) scale(0.95)', offset: 0.4 },
        { transform: 'rotate(10deg) scale(0.95)', offset: 0.5 },
        { transform: 'rotate(10deg) scale(0.95)', offset: 0.8 },
        { transform: 'rotate(-6deg) scale(0.95)', offset: 1 },
      ],
    },
  },
  frantic: {
    speed: 1.15,
    hop: hopClass.run,
    step: {
      duration: 440,
      keyframes: [
        { transform: 'rotate(-11deg)' },
        { transform: 'rotate(11deg)' },
        { transform: 'rotate(-11deg)' },
      ],
    },
  },
  sick: {
    speed: 0.14,
    hop: hopClass.drag,
    step: {
      duration: 2400,
      keyframes: [
        { transform: 'translate(-8px, 2px) rotate(-16deg) scale(0.95)' },
        { transform: 'translate(0, 5px) rotate(4deg) scale(0.92)' },
        { transform: 'translate(9px, 1px) rotate(19deg) scale(0.95)' },
        { transform: 'translate(0, 5px) rotate(-2deg) scale(0.92)' },
        { transform: 'translate(-8px, 2px) rotate(-16deg) scale(0.95)' },
      ],
    },
  },
  shy: {
    speed: 0.45,
    hop: hopClass.quick,
    step: {
      duration: 700,
      keyframes: [
        { transform: 'translateY(5px) rotate(-3deg) scale(0.85)' },
        { transform: 'translateY(6px) rotate(3deg) scale(0.83)' },
        { transform: 'translateY(5px) rotate(-3deg) scale(0.85)' },
      ],
    },
  },
  defeated: {
    speed: 0.11,
    hop: hopClass.drag,
    step: {
      duration: 2600,
      keyframes: [
        { transform: 'translateY(7px) rotate(16deg) scaleY(0.9)' },
        { transform: 'translateY(9px) rotate(21deg) scaleY(0.86)' },
        { transform: 'translateY(7px) rotate(16deg) scaleY(0.9)' },
      ],
    },
  },
};

// What the character does at a stop away from the mood's own spot, one picked
// at random each time. The mood's own loop stays at its own spot
export const TOWN_MOOD_BITS: Record<CareerMoodActivity, TownMoodBit[]> = {
  idle: [
    {
      // Looking around
      duration: 4200,
      keyframes: [
        { transform: 'rotate(0deg)', offset: 0 },
        { transform: 'rotate(-10deg)', offset: 0.2 },
        { transform: 'rotate(-10deg)', offset: 0.42 },
        { transform: 'rotate(10deg)', offset: 0.6 },
        { transform: 'rotate(10deg)', offset: 0.84 },
        { transform: 'rotate(0deg)', offset: 1 },
      ],
    },
    {
      // A long stretch
      duration: 3600,
      keyframes: [
        { transform: 'scale(1)', offset: 0 },
        { transform: 'translateY(-5px) scaleX(0.94) scaleY(1.12)', offset: 0.35 },
        { transform: 'translateY(-5px) scaleX(0.94) scaleY(1.12)', offset: 0.55 },
        { transform: 'translateY(1px) scaleX(1.03) scaleY(0.97)', offset: 0.72 },
        { transform: 'scale(1)', offset: 1 },
      ],
    },
    {
      // Kicking a pebble
      duration: 2600,
      keyframes: [
        { transform: 'translate(0, 0) rotate(0deg)', offset: 0 },
        { transform: 'translate(-5px, 1px) rotate(-7deg)', offset: 0.5 },
        { transform: 'translate(7px, -5px) rotate(10deg)', offset: 0.6 },
        { transform: 'translate(0, 0) rotate(0deg)', offset: 0.78 },
        { transform: 'translate(0, 0) rotate(0deg)', offset: 1 },
      ],
    },
  ],
  celebrating: [
    {
      // A jump with a full turn
      duration: 1800,
      keyframes: [
        { transform: 'translateY(0) rotate(0deg) scale(1)', offset: 0 },
        { transform: 'translateY(3px) rotate(0deg) scale(1.05, 0.9)', offset: 0.18 },
        { transform: 'translateY(-44px) rotate(180deg) scale(1.08)', offset: 0.45 },
        { transform: 'translateY(0) rotate(360deg) scale(1.05, 0.9)', offset: 0.72 },
        { transform: 'translateY(0) rotate(360deg) scale(1)', offset: 1 },
      ],
    },
    {
      // A shimmy
      duration: 1100,
      keyframes: [
        { transform: 'translateX(-9px) skewX(10deg)' },
        { transform: 'translateX(9px) skewX(-10deg)' },
        { transform: 'translateX(-9px) skewX(10deg)' },
      ],
    },
    {
      // Hopping on the spot
      duration: 800,
      keyframes: [
        { transform: 'translateY(0) scale(1.06, 0.92)' },
        { transform: 'translateY(-24px) scale(0.96, 1.06)' },
        { transform: 'translateY(0) scale(1.06, 0.92)' },
      ],
    },
  ],
  energized: [
    {
      // Jumping jacks
      duration: 760,
      keyframes: [
        { transform: 'translateY(0) scaleX(1.1) scaleY(0.9)' },
        { transform: 'translateY(-16px) scaleX(0.92) scaleY(1.1)' },
        { transform: 'translateY(0) scaleX(1.1) scaleY(0.9)' },
      ],
    },
    {
      // Squats
      duration: 1500,
      keyframes: [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(9px) scaleX(1.12) scaleY(0.78)' },
        { transform: 'translateY(0) scale(1)' },
      ],
    },
    {
      // Shadow boxing
      duration: 1200,
      keyframes: [
        { transform: 'translateX(0) rotate(0deg)', offset: 0 },
        { transform: 'translateX(13px) rotate(9deg)', offset: 0.14 },
        { transform: 'translateX(0) rotate(0deg)', offset: 0.3 },
        { transform: 'translateX(-5px) rotate(-5deg)', offset: 0.5 },
        { transform: 'translateX(15px) rotate(11deg)', offset: 0.62 },
        { transform: 'translateX(0) rotate(0deg)', offset: 0.82 },
        { transform: 'translateX(0) rotate(0deg)', offset: 1 },
      ],
    },
  ],
  proud: [
    {
      // A slow bow to nobody
      duration: 4200,
      keyframes: [
        { transform: 'translateY(0) rotate(0deg) scale(1.08)', offset: 0 },
        { transform: 'translateY(6px) rotate(24deg) scale(1.04)', offset: 0.3 },
        { transform: 'translateY(6px) rotate(24deg) scale(1.04)', offset: 0.48 },
        { transform: 'translateY(0) rotate(0deg) scale(1.1)', offset: 0.7 },
        { transform: 'translateY(0) rotate(0deg) scale(1.08)', offset: 1 },
      ],
    },
    {
      // Chest out, turning for the crowd
      duration: 4600,
      keyframes: [
        { transform: 'translateY(-4px) rotate(-5deg) scale(1.14)', offset: 0 },
        { transform: 'translateY(-4px) rotate(-5deg) scale(1.14)', offset: 0.35 },
        { transform: 'translateY(-6px) rotate(5deg) scale(1.16)', offset: 0.5 },
        { transform: 'translateY(-6px) rotate(5deg) scale(1.16)', offset: 0.85 },
        { transform: 'translateY(-4px) rotate(-5deg) scale(1.14)', offset: 1 },
      ],
    },
  ],
  relaxed: [
    {
      // A slow yawn
      duration: 5200,
      keyframes: [
        { transform: 'translateY(0) scale(1)', offset: 0 },
        { transform: 'translateY(-3px) rotate(-6deg) scaleY(1.07)', offset: 0.32 },
        { transform: 'translateY(-3px) rotate(-6deg) scaleY(1.07)', offset: 0.5 },
        { transform: 'translateY(3px) rotate(2deg) scaleY(0.96)', offset: 0.72 },
        { transform: 'translateY(0) scale(1)', offset: 1 },
      ],
    },
    {
      // Swaying with their eyes shut
      duration: 4800,
      keyframes: [
        { transform: 'rotate(-7deg)' },
        { transform: 'rotate(7deg)' },
        { transform: 'rotate(-7deg)' },
      ],
    },
  ],
  hungry: [
    {
      // Sniffing the air
      duration: 2600,
      keyframes: [
        { transform: 'translateX(0) rotate(0deg)', offset: 0 },
        { transform: 'translateX(5px) rotate(10deg)', offset: 0.14 },
        { transform: 'translateX(2px) rotate(5deg)', offset: 0.26 },
        { transform: 'translateX(6px) rotate(11deg)', offset: 0.38 },
        { transform: 'translateX(2px) rotate(5deg)', offset: 0.5 },
        { transform: 'translateX(-4px) rotate(-9deg)', offset: 0.72 },
        { transform: 'translateX(0) rotate(0deg)', offset: 1 },
      ],
    },
    {
      // Doubled over the rumbling stomach
      duration: 3400,
      keyframes: [
        { transform: 'translateY(0) rotate(0deg) scale(1)', offset: 0 },
        { transform: 'translateY(6px) rotate(20deg) scale(0.92)', offset: 0.3 },
        { transform: 'translate(-2px, 6px) rotate(17deg) scale(0.92)', offset: 0.4 },
        { transform: 'translate(2px, 6px) rotate(23deg) scale(0.92)', offset: 0.5 },
        { transform: 'translateY(6px) rotate(20deg) scale(0.92)', offset: 0.6 },
        { transform: 'translateY(0) rotate(0deg) scale(1)', offset: 1 },
      ],
    },
  ],
  anxious: [
    {
      // Glancing over each shoulder
      duration: 2800,
      keyframes: [
        { transform: 'rotate(0deg) scale(0.96)', offset: 0 },
        { transform: 'rotate(-17deg) scale(0.96)', offset: 0.08 },
        { transform: 'rotate(-17deg) scale(0.96)', offset: 0.38 },
        { transform: 'rotate(17deg) scale(0.96)', offset: 0.46 },
        { transform: 'rotate(17deg) scale(0.96)', offset: 0.76 },
        { transform: 'rotate(0deg) scale(0.96)', offset: 0.84 },
        { transform: 'rotate(0deg) scale(0.96)', offset: 1 },
      ],
    },
    shake(2, 2, 420),
    {
      // Hunched, chewing their nails
      duration: 1100,
      keyframes: [
        { transform: 'translateY(4px) scale(0.9)' },
        { transform: 'translateY(2px) rotate(3deg) scale(0.92)' },
        { transform: 'translateY(4px) scale(0.9)' },
      ],
    },
  ],
  frantic: [
    {
      // A tantrum, leaping about
      duration: 900,
      keyframes: [
        { transform: 'translate(-12px, 0) rotate(-16deg)' },
        { transform: 'translate(0, -22px) rotate(0deg) scale(1.06)' },
        { transform: 'translate(12px, 0) rotate(16deg)' },
        { transform: 'translate(0, -22px) rotate(0deg) scale(1.06)' },
        { transform: 'translate(-12px, 0) rotate(-16deg)' },
      ],
    },
    shake(5, 14, 620),
    {
      // Stamping
      duration: 520,
      keyframes: [
        { transform: 'translateY(0) rotate(-4deg) scale(1.06, 0.92)' },
        { transform: 'translateY(-11px) rotate(5deg) scale(0.97, 1.05)' },
        { transform: 'translateY(0) rotate(-4deg) scale(1.06, 0.92)' },
      ],
    },
  ],
  sick: [
    {
      // Retching, then getting their breath back
      duration: 4200,
      keyframes: [
        { transform: 'translateY(0) rotate(0deg) scale(0.96)', offset: 0 },
        { transform: 'translateY(9px) rotate(34deg) scale(0.88)', offset: 0.22 },
        { transform: 'translateY(13px) rotate(42deg) scale(0.84)', offset: 0.3 },
        { transform: 'translateY(9px) rotate(34deg) scale(0.88)', offset: 0.38 },
        { transform: 'translateY(13px) rotate(42deg) scale(0.84)', offset: 0.46 },
        { transform: 'translateY(6px) rotate(26deg) scale(0.9)', offset: 0.68 },
        { transform: 'translateY(0) rotate(0deg) scale(0.96)', offset: 1 },
      ],
    },
    {
      // Almost going over
      duration: 3400,
      keyframes: [
        { transform: 'translate(-5px, 2px) rotate(-14deg) scale(0.95)' },
        { transform: 'translate(10px, 7px) rotate(29deg) scale(0.9)' },
        { transform: 'translate(-5px, 2px) rotate(-14deg) scale(0.95)' },
      ],
    },
    shake(1, 3, 700),
  ],
  shy: [
    {
      // Ducking out of sight
      duration: 3800,
      keyframes: [
        { transform: 'translateY(0) scale(0.96)', opacity: 1, offset: 0 },
        { transform: 'translateY(18px) scale(0.8)', opacity: 0.5, offset: 0.2 },
        { transform: 'translateY(18px) scale(0.8)', opacity: 0.5, offset: 0.7 },
        { transform: 'translateY(0) scale(0.96)', opacity: 1, offset: 0.86 },
        { transform: 'translateY(0) scale(0.96)', opacity: 1, offset: 1 },
      ],
    },
    {
      // Peeking from either side
      duration: 4400,
      keyframes: [
        { transform: 'translateX(-8px) rotate(-11deg) scale(0.92)', offset: 0 },
        { transform: 'translateX(-8px) rotate(-11deg) scale(0.92)', offset: 0.4 },
        { transform: 'translateX(8px) rotate(11deg) scale(0.92)', offset: 0.5 },
        { transform: 'translateX(8px) rotate(11deg) scale(0.92)', offset: 0.9 },
        { transform: 'translateX(-8px) rotate(-11deg) scale(0.92)', offset: 1 },
      ],
    },
  ],
  defeated: [
    {
      // Slumped, sitting down
      duration: 5200,
      keyframes: [
        { transform: 'translateY(9px) rotate(9deg) scaleX(1.05) scaleY(0.84)' },
        { transform: 'translateY(11px) rotate(13deg) scaleX(1.07) scaleY(0.8)' },
        { transform: 'translateY(9px) rotate(9deg) scaleX(1.05) scaleY(0.84)' },
      ],
    },
    {
      // A big sigh
      duration: 4600,
      keyframes: [
        { transform: 'translateY(6px) scaleY(0.92)', offset: 0 },
        { transform: 'translateY(0) scaleY(1.02)', offset: 0.3 },
        { transform: 'translateY(11px) rotate(8deg) scaleY(0.82)', offset: 0.5 },
        { transform: 'translateY(6px) scaleY(0.92)', offset: 1 },
      ],
    },
    {
      // Shaking their head at it all
      duration: 2800,
      keyframes: [
        { transform: 'translateY(7px) rotate(-7deg) scaleY(0.9)' },
        { transform: 'translateY(7px) rotate(7deg) scaleY(0.9)' },
        { transform: 'translateY(7px) rotate(-7deg) scaleY(0.9)' },
      ],
    },
  ],
};

// Where each mood takes the character when they are not at the mood's own spot,
// all out on the road and pavements, never into a building
export const TOWN_MOOD_STOPS: Record<
  TownLayoutKey,
  Record<CareerMoodActivity, TownMoodStop[]>
> = {
  desk: {
    idle: [
      { x: 620, y: 528 },
      { x: 380, y: 526 },
      { x: 470, y: 504 },
      { x: 300, y: 530 },
    ],
    celebrating: [
      { x: 590, y: 530 },
      { x: 360, y: 530 },
      { x: 690, y: 532 },
      { x: 500, y: 504 },
    ],
    energized: [
      { x: 230, y: 530 },
      { x: 50, y: 526 },
      { x: 330, y: 528 },
      { x: 170, y: 506 },
    ],
    proud: [
      { x: 548, y: 492 },
      { x: 620, y: 530 },
      { x: 440, y: 530 },
    ],
    relaxed: [
      { x: 335, y: 530 },
      { x: 200, y: 510 },
      { x: 400, y: 530 },
    ],
    hungry: [
      { x: 905, y: 506 },
      { x: 690, y: 566 },
      { x: 450, y: 504 },
    ],
    anxious: [
      { x: 600, y: 532 },
      { x: 735, y: 532 },
      { x: 825, y: 530 },
      { x: 540, y: 504 },
    ],
    frantic: [
      { x: 360, y: 528 },
      { x: 650, y: 528 },
      { x: 820, y: 528 },
      { x: 240, y: 530 },
    ],
    sick: [
      { x: 830, y: 512 },
      { x: 960, y: 530 },
      { x: 720, y: 530 },
    ],
    shy: [
      { x: 698, y: 486, behind: true },
      { x: 263, y: 632, behind: true },
      { x: 745, y: 622, behind: true },
    ],
    defeated: [
      { x: 395, y: 546 },
      { x: 545, y: 546 },
      { x: 330, y: 506 },
    ],
  },
  phone: {
    idle: [
      { x: 285, y: 536 },
      { x: 110, y: 536 },
      { x: 240, y: 512 },
    ],
    celebrating: [
      { x: 275, y: 538 },
      { x: 90, y: 538 },
      { x: 215, y: 556 },
    ],
    energized: [
      { x: 135, y: 536 },
      { x: 28, y: 534 },
      { x: 195, y: 534 },
    ],
    proud: [
      { x: 120, y: 536 },
      { x: 290, y: 536 },
      { x: 215, y: 438 },
    ],
    relaxed: [
      { x: 70, y: 536 },
      { x: 235, y: 536 },
      { x: 105, y: 514 },
    ],
    hungry: [
      { x: 290, y: 600 },
      { x: 150, y: 600 },
      { x: 110, y: 556 },
    ],
    anxious: [
      { x: 230, y: 556 },
      { x: 355, y: 540 },
      { x: 150, y: 548 },
    ],
    frantic: [
      { x: 90, y: 536 },
      { x: 305, y: 536 },
      { x: 30, y: 536 },
    ],
    sick: [
      { x: 258, y: 698 },
      { x: 362, y: 690 },
      { x: 340, y: 712 },
    ],
    shy: [
      { x: 350, y: 492, behind: true },
      { x: 225, y: 725, behind: true },
    ],
    defeated: [
      { x: 100, y: 552 },
      { x: 270, y: 552 },
      { x: 150, y: 512 },
    ],
  },
};
