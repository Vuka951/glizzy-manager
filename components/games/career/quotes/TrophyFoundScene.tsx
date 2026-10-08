'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import Icon from '@/components/icons/Icon';
import {
  TALK_BEAT_MS,
  type SceneAnimationSpec,
} from '@/lib/constants/sceneAnimations';
import {
  QUOTE_LINE_START_MS,
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 1500;
const TOTAL_MS = QUOTE_LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The footsteps and the sparkle cues of this scene's definition land here
const ARRIVE_MS = 1150;
const GRAB_MS = 2850;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'run-in': sceneTimeline(TOTAL_MS, [
    [0, { left: '-22%' }],
    [ARRIVE_MS, { left: '34%' }],
    [GRAB_MS - 250, { left: '34%' }],
    [GRAB_MS, { left: '46%' }],
    [TOTAL_MS, { left: '46%' }],
  ]),
  stride: {
    keyframes: [
      { transform: 'translateY(0) rotate(-6deg)' },
      { transform: 'translateY(-8px) rotate(6deg)', offset: 0.5 },
      { transform: 'translateY(0) rotate(-6deg)' },
    ],
    options: { duration: 230, iterations: 5, easing: 'ease-in-out' },
  },
  'spot-it': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scale(1) translateY(0)' }],
    [ARRIVE_MS, { transform: 'scale(1) translateY(0)' }],
    [ARRIVE_MS + 180, { transform: 'scale(1.14) translateY(-6px)' }],
    [ARRIVE_MS + 520, { transform: 'scale(1.06) translateY(-2px)' }],
    [GRAB_MS, { transform: 'scale(1.06) translateY(-2px)' }],
    [GRAB_MS + 200, { transform: 'scale(1) translateY(0)' }],
    [TOTAL_MS, { transform: 'scale(1) translateY(0)' }],
  ]),
  'joy-hop': {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-12px)', offset: 0.45 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 420, iterations: Infinity, easing: 'ease-out' },
  },
  'table-trophy': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 1 }],
    [GRAB_MS - 40, { opacity: 1 }],
    [GRAB_MS, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'held-trophy': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translate(12px, 22px) rotate(10deg)' }],
    [
      GRAB_MS - 40,
      { opacity: 0, transform: 'translate(12px, 22px) rotate(10deg)' },
    ],
    [GRAB_MS, { opacity: 1, transform: 'translate(12px, 22px) rotate(10deg)' }],
    [GRAB_MS + 350, { opacity: 1, transform: 'translate(0, 0) rotate(-6deg)' }],
    [TOTAL_MS, { opacity: 1, transform: 'translate(0, 0) rotate(-6deg)' }],
  ]),
  'hands-up': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translateY(18px)' }],
    [GRAB_MS, { opacity: 0, transform: 'translateY(18px)' }],
    [GRAB_MS + 350, { opacity: 1, transform: 'translateY(0)' }],
    [TOTAL_MS, { opacity: 1, transform: 'translateY(0)' }],
  ]),
  sparkle: {
    keyframes: [
      { transform: 'scale(0.3) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1) rotate(45deg)', opacity: 1, offset: 0.4 },
      { transform: 'scale(0.3) rotate(90deg)', opacity: 0 },
    ],
    options: { duration: 1100, iterations: Infinity, easing: 'ease-in-out' },
  },
  confetti: {
    keyframes: [
      { transform: 'translateY(-20px) rotate(0deg)', opacity: 0 },
      {
        transform: 'translateY(10px) rotate(120deg)',
        opacity: 1,
        offset: 0.15,
      },
      { transform: 'translateY(190px) rotate(620deg)', opacity: 0.9 },
    ],
    options: { duration: 1800, iterations: Infinity, easing: 'linear' },
  },
};

const SPARKLES = [
  { cls: 'left-[62%] bottom-[62%]', delay: 0 },
  { cls: 'left-[76%] bottom-[56%]', delay: -400 },
  { cls: 'left-[70%] bottom-[70%]', delay: -800 },
];

const CONFETTI = [
  'left-[22%] bg-amber-300',
  'left-[30%] bg-red-500',
  'left-[38%] bg-sky-300',
  'left-[46%] bg-amber-300',
  'left-[54%] bg-cyan-200',
  'left-[62%] bg-red-500',
  'left-[70%] bg-sky-300',
  'left-[78%] bg-amber-300',
];

export default function TrophyFoundScene({ speaker }: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const champion = characterBySlug(speaker);
  useSceneAnimation(root, CUSTOM, [speaker]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor="bg-slate-800"
      >
        <div className="absolute inset-x-0 top-0 h-[82%] bg-[radial-gradient(ellipse_at_68%_70%,rgba(252,211,77,0.14),transparent_60%)]" />
        <div className="absolute left-[46%] top-0 h-[82%] w-[46%] bg-gradient-to-b from-amber-100/25 to-amber-100/5 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
        <span className="absolute bottom-[14%] left-[56%] h-[6%] w-[30%] rounded-[50%] bg-amber-100/15 blur-sm" />

        <div className="absolute bottom-[18%] left-[58%] z-10 h-[22%] w-[24%]">
          <span className="absolute inset-x-0 top-0 h-2 rounded-sm bg-amber-800" />
          <span className="absolute inset-x-1 bottom-0 top-2 bg-gradient-to-b from-red-800 to-red-950 [clip-path:polygon(0_0,100%_0,94%_100%,6%_100%)]">
            <span className="absolute inset-x-0 top-1 h-1 bg-amber-300/70" />
          </span>
        </div>
        <span
          data-anim="table-trophy"
          className="absolute bottom-[40%] left-[64%] z-10 text-amber-300"
        >
          <span
            data-anim="glow-pulse"
            className="absolute -inset-4 rounded-full bg-amber-200/30 blur-md"
          />
          <Icon
            name="trophy"
            className="relative h-12 w-12 drop-shadow-[0_0_14px_rgba(252,211,77,0.9)]"
          />
        </span>
        {SPARKLES.map((sparkle) => (
          <span
            key={sparkle.cls}
            data-anim="sparkle"
            data-anim-delay={sparkle.delay}
            className={`absolute z-10 h-3 w-3 bg-amber-100 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)] ${sparkle.cls}`}
          />
        ))}

        {CONFETTI.map((cls, index) => (
          <span
            key={cls}
            data-anim="confetti"
            data-anim-delay={GRAB_MS + index * 110}
            className={`absolute top-0 z-30 h-2 w-1 rounded-[1px] opacity-0 ${cls}`}
          />
        ))}

        <div
          data-anim="run-in"
          className="absolute bottom-[40%] left-[-22%] z-20 h-14 w-14 sm:h-16 sm:w-16"
        >
          <SceneActor
            character={champion}
            className="bottom-0 left-0"
            anim="stride spot-it talk joy-hop"
            animDelay={`0 0 ${QUOTE_LINE_START_MS} ${GRAB_MS + 350}`}
            animIterations={`5 1 ${TALK_ITERATIONS} Infinity`}
            pose="origin-bottom"
            size="h-14 w-14 sm:h-16 sm:w-16"
          >
            <span
              data-anim="spotlight"
              data-anim-delay={QUOTE_LINE_START_MS}
              data-anim-duration={LINE_MS + QUOTE_SCENE_TAIL_MS}
              className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
            />
            <span className="absolute left-1/2 top-[calc(100%-4px)] -z-10 h-[34px] w-12 -translate-x-1/2 rounded-t-2xl bg-gradient-to-b from-orange-600 to-orange-800 sm:h-[38px] sm:w-14">
              <span className="absolute left-[18%] top-full h-[18px] w-[28%] rounded-b-md bg-slate-700 sm:h-[22px]" />
              <span className="absolute right-[18%] top-full h-[18px] w-[28%] rounded-b-md bg-slate-700 sm:h-[22px]" />
            </span>
            <span
              data-anim="held-trophy"
              className="absolute -top-12 left-1/2 -ml-6 text-amber-300 opacity-0"
            >
              <Icon
                name="trophy"
                className="h-12 w-12 drop-shadow-[0_0_14px_rgba(252,211,77,0.9)]"
              />
            </span>
            <span
              data-anim="hands-up"
              className="absolute -top-3 inset-x-1 opacity-0"
            >
              <span className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
            </span>
          </SceneActor>
        </div>
      </SceneFrame>
    </div>
  );
}
