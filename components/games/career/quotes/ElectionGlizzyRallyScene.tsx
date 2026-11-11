'use client';

import { useRef } from 'react';
import ElectionWinCoach from '@/components/games/career/quotes/ElectionWinCoach';
import ElectionWinFirework from '@/components/games/career/quotes/ElectionWinFirework';
import ElectionWinPennant from '@/components/games/career/quotes/ElectionWinPennant';
import ElectionWinGlizzy from '@/components/games/career/quotes/ElectionWinGlizzy';
import ElectionWinSuit from '@/components/games/career/quotes/ElectionWinSuit';
import ElectionWinSupporter from '@/components/games/career/quotes/ElectionWinSupporter';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import { electionWinPalette } from '@/lib/constants/electionWinPalette';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { governmentOfVariant } from '@/lib/utils/careerElectionScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 4500;
// Matches the lineStartMs of this scene's definition: the square is full and
// chanting and he has just come out on the balcony when the hold begins
const LINE_START_MS = 3000;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The air brakes, the two wrappers, the cheer and brass, the
// three rockets, the coin and the chomp of the definition land on these
const FIRST_COACH_MS = 300;
const SECOND_COACH_MS = 1000;
const FILE_OUT_MS = 800;
const FILE_STEP_MS = 100;
const HANDOUT_MS = 400;
const CHANT_MS = 2400;
const CHANT_BEAT_MS = 500;
const BALCONY_MS = 3000;
const CHEER_BEAT_MS = 600;
const FIREWORKS_MS = [4200, 5000, 5800];
const TRAIL_MS = 380;
const PEEK_MS = 6200;
const BITE_MS = 6600;
const HERO_JUMPS = Math.floor((PEEK_MS - 200 - BALCONY_MS) / CHEER_BEAT_MS);

// The door of the first coach, where every one of them steps off
const DOOR_X = 258;
const DOOR_Y = 30;
const WALK_PX_PER_MS = 0.32;

const BACK_ROW = [46, 70, 94, 118, 142, 166, 190].map((x) => ({ x, y: 26 }));
const FRONT_ROW = [30, 54, 78, 102, 126, 150, 174].map((x) => ({ x, y: 4 }));
const HERO = { x: 198, y: 0 };
// Farthest first, so the line never walks through itself
const SLOTS = [...BACK_ROW, ...FRONT_ROW, HERO].sort(
  (a, b) =>
    Math.hypot(DOOR_X - b.x, DOOR_Y - b.y) -
    Math.hypot(DOOR_X - a.x, DOOR_Y - a.y),
);
const HERO_INDEX = SLOTS.indexOf(HERO);

const SLOT_CLASSES: Record<string, string> = {
  '46,26': 'left-[46px] bottom-[26px]',
  '70,26': 'left-[70px] bottom-[26px]',
  '94,26': 'left-[94px] bottom-[26px]',
  '118,26': 'left-[118px] bottom-[26px]',
  '142,26': 'left-[142px] bottom-[26px]',
  '166,26': 'left-[166px] bottom-[26px]',
  '190,26': 'left-[190px] bottom-[26px]',
  '30,4': 'left-[30px] bottom-[4px] z-10',
  '54,4': 'left-[54px] bottom-[4px] z-10',
  '78,4': 'left-[78px] bottom-[4px] z-10',
  '102,4': 'left-[102px] bottom-[4px] z-10',
  '126,4': 'left-[126px] bottom-[4px] z-10',
  '150,4': 'left-[150px] bottom-[4px] z-10',
  '174,4': 'left-[174px] bottom-[4px] z-10',
  '198,0': 'left-[198px] bottom-0 z-20',
};

const timeline = (frames: [number, Keyframe][], easing?: string) =>
  sceneTimeline(TOTAL_MS, frames, easing);

const walkIn = (slot: { x: number; y: number }, index: number) => {
  const dx = DOOR_X - slot.x;
  const dy = slot.y - DOOR_Y;
  const depart = FILE_OUT_MS + index * FILE_STEP_MS;
  const arrive = depart + Math.round(Math.hypot(dx, dy) / WALK_PX_PER_MS);
  const hops = Math.max(2, Math.round((arrive - depart) / 140));
  return timeline(
    [
      [0, { opacity: 0, transform: `translate(${dx}px, ${dy}px)` }],
      [depart - 1, { opacity: 0, transform: `translate(${dx}px, ${dy}px)` }],
      [depart, { opacity: 1, transform: `translate(${dx}px, ${dy}px)` }],
      ...Array.from({ length: hops - 1 }, (_, hop): [number, Keyframe] => {
        const share = (hop + 1) / hops;
        return [
          depart + (arrive - depart) * share,
          {
            opacity: 1,
            transform: `translate(${dx * (1 - share)}px, ${dy * (1 - share) - (hop % 2 ? 0 : 2)}px)`,
          },
        ];
      }),
      [arrive, { opacity: 1, transform: 'translate(0px, 0px)' }],
      [TOTAL_MS, { opacity: 1, transform: 'translate(0px, 0px)' }],
    ],
    'linear',
  );
};

const coach = (arrive: number, from: number) =>
  timeline(
    [
      [0, { transform: `translateX(${from}px) rotate(0deg)` }],
      [
        Math.max(0, arrive - 650),
        { transform: `translateX(${from}px) rotate(0deg)` },
      ],
      [arrive, { transform: 'translateX(0px) rotate(-1.5deg)' }],
      [arrive + 160, { transform: 'translateX(0px) rotate(0.5deg)' }],
      [arrive + 300, { transform: 'translateX(0px) rotate(0deg)' }],
      [TOTAL_MS, { transform: 'translateX(0px) rotate(0deg)' }],
    ],
    'ease-out',
  );

const trail = (at: number) =>
  timeline(
    [
      [0, { opacity: 0, transform: 'translateY(120px)' }],
      [at - TRAIL_MS, { opacity: 0, transform: 'translateY(120px)' }],
      [at - TRAIL_MS + 20, { opacity: 1, transform: 'translateY(120px)' }],
      [at, { opacity: 1, transform: 'translateY(0px)' }],
      [at + 20, { opacity: 0, transform: 'translateY(0px)' }],
      [TOTAL_MS, { opacity: 0, transform: 'translateY(0px)' }],
    ],
    'ease-out',
  );

const burst = (at: number) =>
  timeline(
    [
      [0, { opacity: 0, transform: 'scale(0.1)' }],
      [at, { opacity: 0, transform: 'scale(0.1)' }],
      [at + 30, { opacity: 1, transform: 'scale(0.3)' }],
      [at + 350, { opacity: 1, transform: 'scale(1)' }],
      [at + 1100, { opacity: 0, transform: 'scale(1.15) translateY(6px)' }],
      [TOTAL_MS, { opacity: 0, transform: 'scale(1.15) translateY(6px)' }],
    ],
    'ease-out',
  );

const raisedArm = (rest: number, raised: number) =>
  timeline([
    [0, { transform: `rotate(${rest}deg)` }],
    [BALCONY_MS + 150, { transform: `rotate(${rest}deg)` }],
    [BALCONY_MS + 350, { transform: `rotate(${raised}deg)` }],
    [TOTAL_MS, { transform: `rotate(${raised}deg)` }],
  ]);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'coach-first': coach(FIRST_COACH_MS, 280),
  'coach-second': coach(SECOND_COACH_MS, 240),
  ...Object.fromEntries(
    SLOTS.map((slot, index) => [`walk-${index}`, walkIn(slot, index)]),
  ),
  'staffer-arm': {
    keyframes: [
      { transform: 'rotate(60deg)' },
      { transform: 'rotate(-35deg)', offset: 0.5 },
      { transform: 'rotate(60deg)' },
    ],
    options: {
      duration: HANDOUT_MS,
      delay: FILE_OUT_MS - HANDOUT_MS / 2,
      iterations: (CHANT_MS - FILE_OUT_MS) / HANDOUT_MS,
      easing: 'ease-in-out',
    },
  },
  'banner-pump': {
    keyframes: [
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-6px)', offset: 0.4 },
      { transform: 'translateY(0px)' },
    ],
    options: {
      duration: CHANT_BEAT_MS,
      delay: CHANT_MS,
      iterations: Infinity,
      easing: 'ease-in-out',
    },
  },
  'crowd-mouth': {
    keyframes: [
      { transform: 'translateX(-50%) scale(1, 1)' },
      { transform: 'translateX(-50%) scale(0.9, 2.6)', offset: 0.4 },
      { transform: 'translateX(-50%) scale(1, 1)' },
    ],
    options: {
      duration: CHANT_BEAT_MS,
      delay: CHANT_MS,
      iterations: Infinity,
      easing: 'ease-in-out',
    },
  },
  'crowd-jump': {
    keyframes: [
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-4px)', offset: 0.35 },
      { transform: 'translateY(0px)' },
    ],
    options: {
      duration: CHEER_BEAT_MS,
      delay: BALCONY_MS,
      iterations: Infinity,
      easing: 'ease-out',
    },
  },
  'hero-jump': {
    keyframes: [
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-4px)', offset: 0.35 },
      { transform: 'translateY(0px)' },
    ],
    options: {
      duration: CHEER_BEAT_MS,
      delay: BALCONY_MS,
      iterations: HERO_JUMPS,
      easing: 'ease-out',
    },
  },
  'hero-head': timeline([
    [0, { transform: 'rotate(0deg)' }],
    [PEEK_MS - 250, { transform: 'rotate(0deg)' }],
    [PEEK_MS - 50, { transform: 'rotate(14deg) translateY(1px)' }],
    [BITE_MS - 200, { transform: 'rotate(14deg) translateY(1px)' }],
    [BITE_MS - 50, { transform: 'rotate(-4deg)' }],
    [TOTAL_MS, { transform: 'rotate(-4deg)' }],
  ]),
  'hero-envelope': timeline([
    [0, { transform: 'translate(0px, 0px)' }],
    [PEEK_MS - 300, { transform: 'translate(0px, 0px)' }],
    [PEEK_MS - 80, { transform: 'translate(-3px, -13px)' }],
    [BITE_MS - 250, { transform: 'translate(-3px, -13px)' }],
    [BITE_MS - 50, { transform: 'translate(0px, 0px)' }],
    [TOTAL_MS, { transform: 'translate(0px, 0px)' }],
  ]),
  'hero-flap': timeline([
    [0, { transform: 'scaleY(1)' }],
    [PEEK_MS - 80, { transform: 'scaleY(1)' }],
    [PEEK_MS, { transform: 'scaleY(-1)' }],
    [TOTAL_MS, { transform: 'scaleY(-1)' }],
  ]),
  'hero-coin': timeline([
    [0, { opacity: 0, transform: 'translateY(0px)' }],
    [PEEK_MS, { opacity: 0, transform: 'translateY(0px)' }],
    [PEEK_MS + 80, { opacity: 1, transform: 'translateY(-6px)' }],
    [BITE_MS - 250, { opacity: 1, transform: 'translateY(-6px)' }],
    [BITE_MS - 150, { opacity: 0, transform: 'translateY(0px)' }],
    [TOTAL_MS, { opacity: 0, transform: 'translateY(0px)' }],
  ]),
  'hero-glint': timeline([
    [0, { opacity: 0, transform: 'scale(0.2) rotate(0deg)' }],
    [PEEK_MS + 60, { opacity: 0, transform: 'scale(0.2) rotate(0deg)' }],
    [PEEK_MS + 160, { opacity: 1, transform: 'scale(1.3) rotate(45deg)' }],
    [PEEK_MS + 460, { opacity: 0, transform: 'scale(0.3) rotate(90deg)' }],
    [TOTAL_MS, { opacity: 0, transform: 'scale(0.3) rotate(90deg)' }],
  ]),
  'hero-glizzy': timeline([
    [0, { transform: 'translate(0px, 0px)' }],
    [BITE_MS - 260, { transform: 'translate(0px, 0px)' }],
    [BITE_MS - 40, { transform: 'translate(9px, -13px)' }],
    [BITE_MS + 60, { transform: 'translate(9px, -12px)' }],
    [BITE_MS + 400, { transform: 'translate(2px, -4px)' }],
    [TOTAL_MS, { transform: 'translate(2px, -4px)' }],
  ]),
  'hero-bite': timeline([
    [0, { clipPath: 'polygon(0 0, 60% 0, 80% 0, 100% 0, 100% 100%, 0 100%)' }],
    [
      BITE_MS - 10,
      { clipPath: 'polygon(0 0, 60% 0, 80% 0, 100% 0, 100% 100%, 0 100%)' },
    ],
    [
      BITE_MS + 20,
      { clipPath: 'polygon(0 0, 45% 0, 62% 60%, 100% 75%, 100% 100%, 0 100%)' },
    ],
    [
      TOTAL_MS,
      { clipPath: 'polygon(0 0, 45% 0, 62% 60%, 100% 75%, 100% 100%, 0 100%)' },
    ],
  ]),
  'hero-crumbs': timeline([
    [0, { opacity: 0, transform: 'translateY(0px)' }],
    [BITE_MS, { opacity: 0, transform: 'translateY(0px)' }],
    [BITE_MS + 40, { opacity: 1, transform: 'translateY(0px)' }],
    [BITE_MS + 600, { opacity: 0, transform: 'translateY(14px)' }],
    [TOTAL_MS, { opacity: 0, transform: 'translateY(14px)' }],
  ]),
  'winner-rise': timeline([
    [0, { opacity: 0, transform: 'translateY(26px)' }],
    [BALCONY_MS - 60, { opacity: 0, transform: 'translateY(26px)' }],
    [BALCONY_MS, { opacity: 1, transform: 'translateY(18px)' }],
    [BALCONY_MS + 220, { opacity: 1, transform: 'translateY(-3px)' }],
    [BALCONY_MS + 360, { opacity: 1, transform: 'translateY(0px)' }],
    [TOTAL_MS, { opacity: 1, transform: 'translateY(0px)' }],
  ]),
  'winner-arm-left': raisedArm(100, -140),
  'winner-arm-right': raisedArm(80, -40),
  'winner-pump': {
    keyframes: [
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-3px)', offset: 0.35 },
      { transform: 'translateY(0px)' },
    ],
    options: {
      duration: CHEER_BEAT_MS,
      delay: BALCONY_MS + 400,
      iterations: Infinity,
      easing: 'ease-out',
    },
  },
  'door-light': timeline([
    [0, { opacity: 0.25 }],
    [BALCONY_MS - 200, { opacity: 0.25 }],
    [BALCONY_MS, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  beams: timeline([
    [0, { opacity: 0 }],
    [BALCONY_MS - 50, { opacity: 0 }],
    [BALCONY_MS + 150, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'beam-sway-left': {
    keyframes: [
      { transform: 'rotate(-14deg)' },
      { transform: 'rotate(6deg)' },
      { transform: 'rotate(-14deg)' },
    ],
    options: { duration: 2600, iterations: Infinity, easing: 'ease-in-out' },
  },
  'beam-sway-right': {
    keyframes: [
      { transform: 'rotate(14deg)' },
      { transform: 'rotate(-6deg)' },
      { transform: 'rotate(14deg)' },
    ],
    options: { duration: 2600, iterations: Infinity, easing: 'ease-in-out' },
  },
  'trumpet-blow': {
    keyframes: [
      { transform: 'rotate(-8deg)' },
      { transform: 'rotate(-18deg)', offset: 0.5 },
      { transform: 'rotate(-8deg)' },
    ],
    options: {
      duration: CHEER_BEAT_MS,
      delay: BALCONY_MS,
      iterations: Infinity,
      easing: 'ease-in-out',
    },
  },
  ...Object.fromEntries(
    FIREWORKS_MS.flatMap((at, index) => [
      [`trail-${index}`, trail(at)],
      [`burst-${index}`, burst(at)],
    ]),
  ),
};

const WINDOWS = [
  'left-[10px] bottom-[16px]',
  'left-[32px] bottom-[16px]',
  'right-[32px] bottom-[16px]',
  'right-[10px] bottom-[16px]',
  'left-[10px] bottom-[64px]',
  'left-[32px] bottom-[64px]',
  'right-[32px] bottom-[64px]',
  'right-[10px] bottom-[64px]',
];

const FIREWORK_SPOTS = [
  'left-[52px] bottom-[148px]',
  'left-[292px] bottom-[150px]',
  'left-[250px] bottom-[120px]',
];

const NOTES = [
  { cls: 'left-[14px] bottom-[62px]', delay: BALCONY_MS },
  { cls: 'left-[30px] bottom-[66px]', delay: BALCONY_MS + 600 },
  { cls: 'left-[6px] bottom-[70px]', delay: BALCONY_MS + 1200 },
];

const TRUMPETERS = ['left-[0px]', 'left-[22px]'];

// The rest of the convoy, already parked down the street for a wide screen
const PARKED_COACHES = [
  'left-[402px]',
  'left-[504px]',
  'left-[606px]',
  'left-[708px]',
];

export default function ElectionGlizzyRallyScene({
  speaker,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const winner = characterBySlug(speaker);
  const party = governmentOfVariant(variant)[0] ?? 'red';
  const palette = electionWinPalette[party];
  useSceneAnimation(root, CUSTOM, [speaker, variant]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-800"
        floor={null}
      >
        <div className="absolute inset-x-0 bottom-[calc(11%+34px)] h-[76px] bg-slate-900 [clip-path:polygon(0_30%,8%_30%,8%_8%,17%_8%,17%_40%,26%_40%,26%_0,33%_0,33%_25%,60%_25%,60%_10%,70%_10%,70%_35%,82%_35%,82%_5%,91%_5%,91%_28%,100%_28%,100%_100%,0_100%)]">
          <span className="absolute inset-0 bg-[radial-gradient(rgba(253,230,138,0.3)_1px,transparent_1.6px)] bg-[size:13px_15px]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[calc(11%+34px)] bg-gradient-to-b from-slate-700 to-slate-800 shadow-[0_-6px_18px_rgba(2,6,23,0.6)]">
          <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_27px,rgba(15,23,42,0.35)_27px_28px)]" />
        </div>

        <div className="absolute bottom-[11%] left-1/2 h-[200px] w-[340px] -translate-x-1/2 origin-bottom sm:scale-[1.12]">
          {FIREWORK_SPOTS.map((cls, index) => (
            <ElectionWinFirework
              key={cls}
              party={party}
              className={cls}
              trailAnim={`trail-${index}`}
              burstAnim={`burst-${index}`}
            />
          ))}

          <div className="absolute bottom-[34px] left-[104px] h-[124px] w-[136px] bg-gradient-to-b from-stone-400 to-stone-500 shadow-[0_8px_20px_rgba(2,6,23,0.6)] ring-1 ring-slate-950/60">
            <span className="absolute inset-x-[-6px] top-[-18px] h-[18px] bg-stone-300 ring-1 ring-slate-950/50 [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
            <span className="absolute inset-x-[-4px] top-[-3px] h-[5px] bg-stone-300" />
            <span className="absolute inset-x-0 bottom-[50px] h-[3px] bg-stone-600/60" />
            {WINDOWS.map((cls) => (
              <span
                key={cls}
                className={`absolute h-[20px] w-[13px] rounded-t-[6px] bg-amber-200/70 ring-2 ring-stone-600 ${cls}`}
              />
            ))}
            <span className="absolute bottom-0 left-1/2 h-[28px] w-[24px] -translate-x-1/2 rounded-t-[12px] bg-slate-900 ring-2 ring-stone-600" />
            <span className="absolute bottom-[60px] left-1/2 h-[36px] w-[24px] -translate-x-1/2 rounded-t-[12px] bg-slate-950 ring-2 ring-stone-600">
              <span
                data-anim="door-light"
                className="absolute inset-0 rounded-t-[12px] bg-gradient-to-b from-amber-100 to-amber-300 opacity-25"
              />
            </span>

            {/* Clipped at the balcony floor, so he climbs up behind the rail */}
            <div className="absolute inset-x-0 bottom-[54px] top-0 overflow-hidden">
              <div
                data-anim="winner-rise"
                className="absolute bottom-[5px] left-1/2 ml-[-18px] h-[64px] w-[36px] opacity-0"
              >
                <div data-anim="winner-pump" className="absolute inset-0">
                  <span
                    data-anim="winner-arm-left"
                    className="absolute bottom-[16px] left-[6px] h-[7px] w-[30px] origin-[3px_50%] rounded-full bg-slate-700 ring-1 ring-slate-950/60"
                  >
                    <span className="absolute right-[-3px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                  </span>
                  <span
                    data-anim="winner-arm-right"
                    className="absolute bottom-[16px] left-[28px] h-[7px] w-[30px] origin-[3px_50%] rounded-full bg-slate-700 ring-1 ring-slate-950/60"
                  >
                    <span className="absolute right-[-3px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                  </span>
                  <ElectionWinSuit
                    party={party}
                    className="bottom-0 left-[2px] h-[24px] w-[32px]"
                  />
                  <SceneActor
                    character={winner}
                    className="bottom-[18px] left-[-2px]"
                    size="h-10 w-10"
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-[54px] left-1/2 z-30 h-[19px] w-[64px] -translate-x-1/2">
              <span className="absolute inset-x-0 bottom-0 h-[5px] rounded-[1px] bg-stone-300 ring-1 ring-slate-950/50" />
              <span className="absolute inset-x-[2px] bottom-[5px] h-[12px] bg-[repeating-linear-gradient(90deg,var(--color-stone-300)_0_3px,transparent_3px_7px)]" />
              <span className="absolute inset-x-0 top-0 h-[3px] rounded-[1px] bg-stone-300 ring-1 ring-slate-950/40" />
              <ElectionWinPennant
                party={party}
                className="absolute bottom-[4px] left-1/2 h-[15px] w-[40px] -translate-x-1/2"
              />
            </div>
          </div>

          <div data-anim="beams" className="absolute inset-0 opacity-0">
            <span
              data-anim="beam-sway-left"
              className={`absolute bottom-0 left-[80px] h-[150px] w-[30px] origin-bottom opacity-50 blur-[2px] [clip-path:polygon(35%_0,65%_0,100%_100%,0_100%)] ${palette.burst}`}
            />
            <span
              data-anim="beam-sway-right"
              className={`absolute bottom-0 left-[234px] h-[150px] w-[30px] origin-bottom opacity-50 blur-[2px] [clip-path:polygon(35%_0,65%_0,100%_100%,0_100%)] ${palette.burst}`}
            />
          </div>

          {PARKED_COACHES.map((cls) => (
            <ElectionWinCoach
              key={cls}
              className={`bottom-[44px] scale-90 brightness-[0.6] ${cls}`}
            />
          ))}
          <ElectionWinCoach
            anim="coach-second"
            className="bottom-[44px] left-[300px] scale-90 brightness-75"
          />
          <ElectionWinCoach
            anim="coach-first"
            className="bottom-[28px] left-[246px] z-10"
          />

          {TRUMPETERS.map((cls) => (
            <div
              key={cls}
              className={`absolute bottom-[30px] h-[44px] w-[22px] ${cls}`}
            >
              <span className="absolute bottom-0 left-[5px] h-[10px] w-[4px] bg-slate-800" />
              <span className="absolute bottom-0 left-[12px] h-[10px] w-[4px] bg-slate-800" />
              <span className="absolute bottom-[8px] left-[2px] h-[17px] w-[17px] rounded-t-[7px] bg-slate-100 ring-1 ring-slate-950/50">
                <span className="absolute inset-y-0 left-[3px] w-[3px] bg-red-700" />
                <span className="absolute inset-y-0 right-[3px] w-[3px] bg-red-700" />
              </span>
              <span className="absolute bottom-[24px] left-[3px] h-[13px] w-[13px] rounded-full bg-orange-200 ring-1 ring-slate-950/50">
                <span className="absolute right-[3px] top-[5px] h-[2px] w-[2px] rounded-full bg-slate-950" />
              </span>
              <span className="absolute bottom-[34px] left-[1px] h-[7px] w-[17px] rounded-t-[4px] bg-slate-700 [clip-path:polygon(0_100%,15%_0,85%_0,100%_100%)]" />
              <span
                data-anim="trumpet-blow"
                className="absolute bottom-[28px] left-[13px] h-[4px] w-[14px] origin-left [transform:rotate(-8deg)]"
              >
                <span className="absolute inset-y-[1px] left-0 right-[4px] rounded-full bg-amber-400" />
                <span className="absolute right-[-2px] top-[-3px] h-[10px] w-[7px] bg-amber-300 [clip-path:polygon(0_35%,100%_0,100%_100%,0_65%)]" />
              </span>
            </div>
          ))}
          {NOTES.map((note) => (
            <span
              key={note.cls}
              data-anim="float-up"
              data-anim-delay={note.delay}
              className={`absolute z-30 text-[11px] font-black leading-none text-amber-200 opacity-0 ${note.cls}`}
            >
              ♪
            </span>
          ))}

          <div className="absolute bottom-[6px] left-[232px] z-20 h-[46px] w-[24px]">
            <span className="absolute bottom-0 left-[6px] h-[11px] w-[5px] bg-slate-900" />
            <span className="absolute bottom-0 left-[13px] h-[11px] w-[5px] bg-slate-900" />
            <span
              className={`absolute bottom-[9px] left-[3px] h-[19px] w-[18px] rounded-t-[7px] ring-1 ring-slate-950/50 ${palette.cloth}`}
            >
              <span className="absolute left-[5px] top-0 h-[10px] w-px bg-slate-200" />
              <span className="absolute left-[3px] top-[9px] h-[5px] w-[5px] rounded-[1px] bg-slate-100" />
            </span>
            <span className="absolute bottom-[26px] left-[5px] h-[14px] w-[14px] rounded-full bg-orange-200 ring-1 ring-slate-950/50">
              <span className="absolute right-[3px] top-[6px] h-[2px] w-[2px] rounded-full bg-slate-950" />
              <span className="absolute inset-x-0 top-0 h-[4px] rounded-t-full bg-slate-800" />
            </span>
            <span
              data-anim="staffer-arm"
              className={`absolute bottom-[20px] left-[16px] h-[5px] w-[14px] origin-[2px_50%] rounded-full ring-1 ring-slate-950/50 ${palette.cloth} [transform:rotate(60deg)]`}
            >
              <span className="absolute right-[-2px] top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-orange-200" />
              <ElectionWinGlizzy className="right-[-9px] top-[-6px]" />
            </span>
          </div>
          <div className="absolute bottom-[2px] left-[244px] z-30 h-[13px] w-[22px] rounded-[2px] bg-amber-700 ring-1 ring-slate-950/60">
            <span className="absolute inset-x-[2px] top-[4px] h-px bg-amber-900" />
            <ElectionWinGlizzy className="left-[2px] top-[-4px]" />
            <ElectionWinGlizzy className="left-[9px] top-[-5px]" />
          </div>

          {SLOTS.map((slot, index) =>
            index === HERO_INDEX ? (
              <ElectionWinSupporter
                key={index}
                party={party}
                className={SLOT_CLASSES[`${slot.x},${slot.y}`]}
                walkAnim={`walk-${index}`}
                jumpAnim="hero-jump"
                headAnim="hero-head"
                hands={false}
                bodyClassName="origin-bottom scale-[1.4]"
              >
                <span
                  data-anim="hero-envelope"
                  className="absolute bottom-[10px] left-[17px] h-[9px] w-[13px]"
                >
                  <span className="absolute inset-0 rounded-[1px] bg-amber-50 ring-1 ring-slate-950/50" />
                  <span
                    data-anim="hero-coin"
                    className="absolute left-[3px] top-[-1px] h-[7px] w-[7px] rounded-full bg-amber-300 opacity-0 ring-1 ring-amber-600"
                  />
                  <span
                    data-anim="hero-flap"
                    className="absolute inset-x-0 top-0 h-[5px] origin-top bg-amber-100 ring-1 ring-slate-950/40 [clip-path:polygon(0_0,100%_0,50%_100%)]"
                  />
                  <span
                    data-anim="hero-glint"
                    className="absolute left-[1px] top-[-12px] h-[11px] w-[11px] bg-amber-100 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
                  />
                  <span className="absolute bottom-[-2px] left-[-2px] h-[5px] w-[5px] rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                </span>
                <span
                  data-anim="hero-glizzy"
                  className="absolute bottom-[12px] left-[-3px] h-[5px] w-[5px] rounded-full bg-orange-200 ring-1 ring-slate-950/40"
                >
                  <ElectionWinGlizzy
                    biteAnim="hero-bite"
                    className="left-[-5px] top-[-5px]"
                  />
                </span>
                <span
                  data-anim="hero-crumbs"
                  className="absolute bottom-[22px] left-[12px] h-[6px] w-[6px] opacity-0"
                >
                  <span className="absolute left-0 top-0 h-[2px] w-[2px] bg-amber-300" />
                  <span className="absolute right-0 top-[2px] h-[2px] w-[2px] bg-amber-300" />
                  <span className="absolute bottom-0 left-[2px] h-[2px] w-[2px] bg-amber-300" />
                </span>
              </ElectionWinSupporter>
            ) : (
              <ElectionWinSupporter
                key={index}
                party={party}
                className={SLOT_CLASSES[`${slot.x},${slot.y}`]}
                walkAnim={`walk-${index}`}
              />
            ),
          )}
        </div>
      </SceneFrame>
    </div>
  );
}
