'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import { GAMES_UI } from '@/data/games/locale';
import {
  TALK_BEAT_MS,
  type SceneAnimationSpec,
} from '@/lib/constants/sceneAnimations';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 2265;
// Matches the lineStartMs of this scene's definition: the crash, the index
// graphic and the first bite all happen before the line
const LINE_START_MS = 3800;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The skid-crash cue at 0 lands its impact here; the whoosh, the hiss, the
// footsteps and the chomp of the definition land on the later beats
const HIT_MS = 1350;
const CHART_MS = 2100;
const PLUNGE_MS = CHART_MS + 450;
const EXIT_MS = 2700;
const PICK_MS = 3250;
const BITE_MS = 3600;

const TITLE = GAMES_UI.career.offseason.glizacija.title;

// Where each spilled glizzy comes to rest, as its offset from the truck
// door it flew out of and the angle it lands at
const SPILL = [
  { cls: 'left-[34%] bottom-[9%]', dx: 150, turn: -20 },
  { cls: 'left-[46%] bottom-[5%]', dx: 110, turn: 35 },
  { cls: 'left-[52%] bottom-[12%]', dx: 80, turn: -60 },
  { cls: 'left-[60%] bottom-[3%]', dx: 50, turn: 15 },
  { cls: 'left-[66%] bottom-[10%]', dx: 20, turn: 80 },
  { cls: 'left-[74%] bottom-[4%]', dx: -10, turn: -35 },
  { cls: 'left-[80%] bottom-[11%]', dx: -40, turn: 25 },
  { cls: 'left-[88%] bottom-[6%]', dx: -70, turn: -75 },
  { cls: 'left-[94%] bottom-[13%]', dx: -95, turn: 50 },
];

const spill = (dx: number, turn: number, from: number) =>
  sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: `translate(${dx}px, -40px) rotate(0deg)` }],
    [from, { opacity: 0, transform: `translate(${dx}px, -40px) rotate(0deg)` }],
    [
      from + 120,
      {
        opacity: 1,
        transform: `translate(${dx * 0.55}px, -80px) rotate(${turn * 2}deg)`,
      },
    ],
    [
      from + 520,
      { opacity: 1, transform: `translate(0, 0) rotate(${turn}deg)` },
    ],
    [TOTAL_MS, { opacity: 1, transform: `translate(0, 0) rotate(${turn}deg)` }],
  ]);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  ...Object.fromEntries(
    SPILL.map((item, index) => [
      `spill-${index}`,
      spill(item.dx, item.turn, HIT_MS + 60 + index * 30),
    ])
  ),
  'spill-pick': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translate(130px, -40px) rotate(0deg)' }],
    [
      HIT_MS + 90,
      { opacity: 0, transform: 'translate(130px, -40px) rotate(0deg)' },
    ],
    [
      HIT_MS + 210,
      { opacity: 1, transform: 'translate(70px, -90px) rotate(-90deg)' },
    ],
    [HIT_MS + 610, { opacity: 1, transform: 'translate(0, 0) rotate(-8deg)' }],
    [PICK_MS + 60, { opacity: 1, transform: 'translate(0, 0) rotate(-8deg)' }],
    [PICK_MS + 100, { opacity: 0, transform: 'translate(0, 0) rotate(-8deg)' }],
    [TOTAL_MS, { opacity: 0, transform: 'translate(0, 0) rotate(-8deg)' }],
  ]),
  'truck-in': sceneTimeline(TOTAL_MS, [
    [0, { left: '100%' }],
    [HIT_MS, { left: '48%' }],
    [HIT_MS + 300, { left: '52%' }],
    [TOTAL_MS, { left: '52%' }],
  ]),
  'truck-flip': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0) rotate(0deg)' }],
    [HIT_MS, { transform: 'translateY(0) rotate(0deg)' }],
    [HIT_MS + 220, { transform: 'translateY(-34%) rotate(95deg)' }],
    [HIT_MS + 440, { transform: 'translateY(0) rotate(184deg)' }],
    [HIT_MS + 560, { transform: 'translateY(-6%) rotate(178deg)' }],
    [HIT_MS + 680, { transform: 'translateY(0) rotate(176deg)' }],
    [TOTAL_MS, { transform: 'translateY(0) rotate(176deg)' }],
  ]),
  'roof-glizzy': sceneTimeline(TOTAL_MS, [
    [0, { left: '34%', top: '-22%', transform: 'rotate(0deg)' }],
    [HIT_MS, { left: '34%', top: '-22%', transform: 'rotate(0deg)' }],
    [HIT_MS + 300, { left: '70%', top: '-80%', transform: 'rotate(120deg)' }],
    [HIT_MS + 700, { left: '96%', top: '82%', transform: 'rotate(200deg)' }],
    [TOTAL_MS, { left: '96%', top: '82%', transform: 'rotate(200deg)' }],
  ]),
  'wheel-spin': {
    keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
    options: { duration: 260, iterations: Infinity, easing: 'linear' },
  },
  'car-in': sceneTimeline(TOTAL_MS, [
    [0, { left: '-40%' }],
    [HIT_MS - 450, { left: '-40%' }],
    [HIT_MS, { left: '24%' }],
    [HIT_MS + 250, { left: '19%' }],
    [TOTAL_MS, { left: '19%' }],
  ]),
  'car-crumple': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scale(1, 1) skewX(0deg)' }],
    [HIT_MS, { transform: 'scale(1, 1) skewX(0deg)' }],
    [HIT_MS + 90, { transform: 'scale(0.8, 1.06) skewX(-8deg)' }],
    [TOTAL_MS, { transform: 'scale(0.8, 1.06) skewX(-8deg)' }],
  ]),
  'hood-pop': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'rotate(0deg)' }],
    [HIT_MS, { transform: 'rotate(0deg)' }],
    [HIT_MS + 120, { transform: 'rotate(-38deg)' }],
    [TOTAL_MS, { transform: 'rotate(-38deg)' }],
  ]),
  hazard: {
    keyframes: [
      { opacity: 1 },
      { opacity: 1, offset: 0.5 },
      { opacity: 0.1, offset: 0.5 },
      { opacity: 0.1 },
    ],
    options: { duration: 700, iterations: Infinity, easing: 'linear' },
  },
  'impact-burst': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scale(0.3)' }],
    [HIT_MS, { opacity: 0, transform: 'scale(0.3)' }],
    [HIT_MS + 70, { opacity: 1, transform: 'scale(1.2)' }],
    [HIT_MS + 380, { opacity: 0, transform: 'scale(1.6)' }],
    [TOTAL_MS, { opacity: 0, transform: 'scale(1.6)' }],
  ]),
  'impact-flash': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [HIT_MS, { opacity: 0 }],
    [HIT_MS + 40, { opacity: 0.5 }],
    [HIT_MS + 260, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'impact-jolt': {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-5px, 3px)' },
      { transform: 'translate(5px, -3px)' },
      { transform: 'translate(-3px, -2px)' },
      { transform: 'translate(3px, 2px)' },
      { transform: 'translate(0, 0)' },
    ],
    options: { duration: 320, delay: HIT_MS, easing: 'linear' },
  },
  'chart-in': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateX(130%)' }],
    [CHART_MS, { transform: 'translateX(130%)' }],
    [CHART_MS + 320, { transform: 'translateX(0)' }],
    [TOTAL_MS, { transform: 'translateX(0)' }],
  ]),
  'chart-draw': sceneTimeline(TOTAL_MS, [
    [0, { clipPath: 'inset(0 100% 0 0)' }],
    [CHART_MS + 250, { clipPath: 'inset(0 100% 0 0)' }],
    [PLUNGE_MS, { clipPath: 'inset(0 30% 0 0)' }],
    [PLUNGE_MS + 350, { clipPath: 'inset(0 0 0 0)' }],
    [TOTAL_MS, { clipPath: 'inset(0 0 0 0)' }],
  ]),
  'arrow-drop': {
    keyframes: [
      { transform: 'translateY(-3px)', opacity: 0.6 },
      { transform: 'translateY(3px)', opacity: 1 },
      { transform: 'translateY(-3px)', opacity: 0.6 },
    ],
    options: { duration: 600, iterations: Infinity, easing: 'ease-in-out' },
  },
  'lead-path': sceneTimeline(TOTAL_MS, [
    [0, { left: '26%', opacity: 0 }],
    [EXIT_MS, { left: '26%', opacity: 0 }],
    [EXIT_MS + 100, { left: '26%', opacity: 1 }],
    [PICK_MS - 50, { left: '36%', opacity: 1 }],
    [TOTAL_MS, { left: '36%', opacity: 1 }],
  ]),
  'walk-bob': {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-4px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 240, iterations: 2, easing: 'ease-in-out' },
  },
  crouch: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0) rotate(0deg)' }],
    [PICK_MS, { transform: 'translateY(0) rotate(0deg)' }],
    [PICK_MS + 120, { transform: 'translateY(12px) rotate(10deg)' }],
    [PICK_MS + 280, { transform: 'translateY(0) rotate(0deg)' }],
    [TOTAL_MS, { transform: 'translateY(0) rotate(0deg)' }],
  ]),
  'held-glizzy': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translate(4px, 30px) rotate(20deg)' }],
    [
      PICK_MS + 60,
      { opacity: 0, transform: 'translate(4px, 30px) rotate(20deg)' },
    ],
    [
      PICK_MS + 100,
      { opacity: 1, transform: 'translate(4px, 30px) rotate(20deg)' },
    ],
    [
      BITE_MS - 80,
      { opacity: 1, transform: 'translate(-14px, -6px) rotate(-10deg)' },
    ],
    [
      BITE_MS + 120,
      { opacity: 1, transform: 'translate(-14px, -6px) rotate(-10deg)' },
    ],
    [
      LINE_START_MS,
      { opacity: 1, transform: 'translate(0, 12px) rotate(-30deg)' },
    ],
    [TOTAL_MS, { opacity: 1, transform: 'translate(0, 12px) rotate(-30deg)' }],
  ]),
  bitten: sceneTimeline(TOTAL_MS, [
    [0, { clipPath: 'inset(0 0 0 0)' }],
    [BITE_MS, { clipPath: 'inset(0 0 0 0)' }],
    [BITE_MS + 40, { clipPath: 'inset(0 0 0 32%)' }],
    [TOTAL_MS, { clipPath: 'inset(0 0 0 32%)' }],
  ]),
  chew: {
    keyframes: [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.04, 0.96)', offset: 0.5 },
      { transform: 'scale(1, 1)' },
    ],
    options: { duration: 180, iterations: 1, easing: 'ease-in-out' },
  },
};

const HAZARDS = ['left-0 top-[54%]', 'right-0 top-[54%]'];
const SMOKE = [0, 1100, 2200];

export default function TruckCrashScene({ speaker }: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  useSceneAnimation(root, CUSTOM, [speaker]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900"
        floor="bg-gradient-to-b from-slate-700 to-slate-800"
      >
        <div data-anim="impact-jolt" className="absolute inset-0">
          <span className="absolute left-[12%] top-[10%] h-1 w-1 rounded-full bg-slate-200/70" />
          <span className="absolute left-[40%] top-[20%] h-0.5 w-0.5 rounded-full bg-slate-200/60" />
          <span className="absolute left-[58%] top-[8%] h-1 w-1 rounded-full bg-slate-200/50" />
          <span className="absolute left-[30%] top-[12%] h-7 w-7 rounded-full bg-amber-50/80 shadow-[0_0_24px_6px_rgba(254,243,199,0.25)]" />
          <div className="absolute bottom-[18%] inset-x-0 h-[16%] bg-slate-950/70 [clip-path:polygon(0_100%,0_40%,12%_10%,24%_50%,38%_0,52%_45%,66%_15%,80%_55%,92%_20%,100%_40%,100%_100%)]" />
          <div className="absolute bottom-[18%] left-[6%] h-[48%] w-1 bg-slate-600">
            <span className="absolute -left-0.5 top-0 h-1.5 w-6 rounded-full bg-slate-500" />
            <span className="absolute left-3 top-1 h-2 w-3 rounded-b-full bg-yellow-100 shadow-[0_0_20px_6px_rgba(254,240,138,0.4)]" />
          </div>
          <span className="absolute bottom-[8%] inset-x-0 h-1 bg-[repeating-linear-gradient(90deg,rgba(231,229,228,0.5)_0,rgba(231,229,228,0.5)_22px,transparent_22px,transparent_40px)]" />

          <div
            data-anim="truck-in"
            className="absolute bottom-[14%] left-full z-20 h-[40%] w-[44%]"
          >
            <div data-anim="truck-flip" className="absolute inset-0">
              <span className="absolute bottom-[14%] left-0 h-[58%] w-[24%] rounded-l-xl rounded-tr-md bg-gradient-to-b from-red-600 to-red-800 shadow-lg">
                <span className="absolute left-[10%] top-[12%] h-[36%] w-[56%] rounded-tl-lg bg-sky-950/80" />
                <span className="absolute bottom-[18%] left-0 h-1.5 w-2 rounded-sm bg-yellow-100" />
              </span>
              <span className="absolute bottom-[14%] right-0 h-[86%] w-[74%] rounded-md bg-gradient-to-b from-slate-100 to-slate-300 shadow-lg">
                <span className="absolute inset-x-0 bottom-[16%] h-[10%] bg-red-600" />
                <GlizzyIcon className="absolute left-1/2 top-[14%] h-[52%] w-[62%] -translate-x-1/2" />
              </span>
              {['left-[6%]', 'left-[46%]', 'right-[6%]'].map((cls) => (
                <span
                  key={cls}
                  data-anim="wheel-spin"
                  className={`absolute bottom-0 aspect-square h-[30%] rounded-full bg-slate-950 ring-2 ring-slate-500 ${cls}`}
                >
                  <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-500" />
                </span>
              ))}
            </div>
            <span
              data-anim="roof-glizzy"
              className="absolute left-[34%] top-[-22%] z-10"
            >
              <GlizzyIcon className="h-9 w-14 drop-shadow-[0_2px_0_rgba(2,6,23,0.6)] sm:h-10 sm:w-16" />
            </span>
          </div>

          {SPILL.map((item, index) => (
            <span
              key={item.cls}
              data-anim={`spill-${index}`}
              className={`absolute z-30 opacity-0 ${item.cls}`}
            >
              <GlizzyIcon className="h-4 w-7 sm:h-5 sm:w-8" />
            </span>
          ))}
          <span
            data-anim="spill-pick"
            className="absolute bottom-[6%] left-[40%] z-30 opacity-0"
          >
            <GlizzyIcon className="h-4 w-7 sm:h-5 sm:w-8" />
          </span>

          <div
            data-anim="car-in"
            className="absolute bottom-[14%] left-[-40%] z-30 h-[22%] w-[26%]"
          >
            <div
              data-anim="car-crumple"
              className="absolute inset-0 origin-right"
            >
              <span className="absolute bottom-[40%] left-[16%] h-[40%] w-[52%] rounded-t-md bg-gradient-to-b from-lime-700 to-lime-900">
                <span className="absolute bottom-[12%] left-[8%] h-[62%] w-[38%] rounded-tl-md bg-sky-950/80" />
                <span className="absolute bottom-[12%] right-[8%] h-[62%] w-[38%] bg-sky-950/80">
                  <span className="absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(226,232,240,0.7)_47%,transparent_50%),linear-gradient(45deg,transparent_55%,rgba(226,232,240,0.6)_57%,transparent_60%)]" />
                </span>
              </span>
              <span className="absolute bottom-[16%] inset-x-0 h-[34%] rounded-md bg-gradient-to-b from-lime-700 to-lime-900 shadow-lg" />
              <span
                data-anim="hood-pop"
                className="absolute bottom-[48%] right-[2%] h-1.5 w-[30%] origin-left rounded-sm bg-lime-800"
              />
              {HAZARDS.map((cls) => (
                <span
                  key={cls}
                  data-anim="hazard"
                  data-anim-delay={HIT_MS + 300}
                  className={`absolute h-2 w-2 rounded-sm bg-amber-400 opacity-0 shadow-[0_0_10px_3px_rgba(251,191,36,0.7)] ${cls}`}
                />
              ))}
              <span className="absolute bottom-0 left-[12%] aspect-square h-[36%] rounded-full bg-slate-950 ring-2 ring-slate-500" />
              <span className="absolute bottom-0 right-[12%] aspect-square h-[36%] rounded-full bg-slate-950 ring-2 ring-slate-500" />
            </div>
            {SMOKE.map((delay) => (
              <span
                key={delay}
                data-anim="drift"
                data-anim-delay={HIT_MS + 400 + delay}
                className="absolute right-[4%] top-[20%] h-4 w-4 rounded-full bg-slate-400/50 opacity-0 blur-[2px]"
              />
            ))}
          </div>

          <span
            data-anim="impact-burst"
            className="absolute bottom-[18%] left-[42%] z-40 h-20 w-20 bg-yellow-300 opacity-0 [clip-path:polygon(50%_0,61%_24%,88%_6%,78%_36%,100%_48%,76%_62%,90%_94%,60%_76%,48%_100%,38%_76%,8%_92%,22%_60%,0_46%,22%_34%,12%_6%,38%_24%)]"
          />

          <div
            data-anim="lead-path"
            className="absolute bottom-[34%] left-[26%] z-40 h-14 w-14 opacity-0 sm:h-16 sm:w-16"
          >
            <div
              data-anim="walk-bob crouch"
              data-anim-delay={`${EXIT_MS} 0`}
              className="absolute inset-0"
            >
              <SceneActor
                character={lead}
                className="bottom-0 left-0"
                anim="chew talk"
                animDelay={`${BITE_MS} ${LINE_START_MS}`}
                animIterations={`1 ${TALK_ITERATIONS}`}
                pose="origin-bottom"
                size="h-14 w-14 sm:h-16 sm:w-16"
              >
                <span
                  data-anim="spotlight"
                  data-anim-delay={LINE_START_MS}
                  data-anim-duration={LINE_MS + QUOTE_SCENE_TAIL_MS}
                  className="absolute -inset-3 -z-10 rounded-full bg-amber-100/25 opacity-0 blur-md"
                />
                <span className="absolute left-1/2 top-[calc(100%-4px)] -z-10 h-[30px] w-12 -translate-x-1/2 rounded-t-2xl bg-gradient-to-b from-orange-600 to-orange-800 sm:h-[34px] sm:w-14">
                  <span className="absolute left-[18%] top-full h-[14px] w-[28%] rounded-b-md bg-slate-700 sm:h-[18px]" />
                  <span className="absolute right-[18%] top-full h-[14px] w-[28%] rounded-b-md bg-slate-700 sm:h-[18px]" />
                </span>
                <span
                  data-anim="held-glizzy"
                  className="absolute -right-5 top-7 z-10 opacity-0"
                >
                  <span data-anim="bitten" className="block">
                    <GlizzyIcon className="h-6 w-10 drop-shadow-[0_1px_0_rgba(2,6,23,0.7)]" />
                  </span>
                  <span className="absolute -bottom-1 right-0 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                </span>
              </SceneActor>
            </div>
          </div>
        </div>

        <div
          data-anim="chart-in"
          className="absolute right-[3%] top-[14%] z-50 w-[36%] max-w-44 rounded-sm border-l-4 border-emerald-400 bg-slate-950/85 px-2 py-1.5 shadow-[0_4px_18px_rgba(2,6,23,0.7)]"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-200 sm:text-[10px]">
              {TITLE}
            </span>
            <span
              data-anim="arrow-drop"
              className="text-base font-black leading-none text-emerald-300 sm:text-lg"
            >
              {'▼'}
            </span>
          </span>
          <span data-anim="chart-draw" className="mt-1 block">
            <svg viewBox="0 0 60 30" className="h-6 w-full" aria-hidden="true">
              <polyline
                points="0,8 10,6 18,9 27,5 36,8 42,7 49,24 54,22 60,28"
                className="fill-none stroke-emerald-300"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>

        <span
          data-anim="impact-flash"
          className="pointer-events-none absolute inset-0 z-50 bg-slate-50 opacity-0"
        />
      </SceneFrame>
    </div>
  );
}
