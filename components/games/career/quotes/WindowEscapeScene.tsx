'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
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

const LINE_MS = 1200;
// Matches the lineStartMs of this scene's definition: the line starts as he
// swings up onto the sill
const LINE_START_MS = 1400;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The slide-wood, throw-whoosh and thud-body cues of the definition land on
// the hop, the drop and the thud; the sneak steps run under the tiptoe
const TIPTOE_STEPS = 6;
const HOP_MS = 1100;
const SILL_MS = 1450;
const EXIT_MS = 2650;
const DROP_MS = EXIT_MS + 170;
const THUD_MS = 3200;
const NOTICE_MS = 3400;
const TALK_ITERATIONS = Math.max(
  1,
  Math.round((EXIT_MS - SILL_MS) / TALK_BEAT_MS),
);
const PUMP_MS = 280;
const PUMPS = Math.floor(NOTICE_MS / PUMP_MS);

const timeline = (frames: [number, Keyframe][], easing?: string) =>
  sceneTimeline(TOTAL_MS, frames, easing);

const sneakPose = (x: number, y: number, lean: number): Keyframe => ({
  transform: `translate(${x}px, ${y}px) rotate(${lean}deg)`,
});

// One beat of the winner's show for the cameras, up to the moment he notices
const pumpFrames = (frame: (up: boolean) => Keyframe): [number, Keyframe][] =>
  Array.from({ length: PUMPS + 1 }, (_, index): [number, Keyframe] => [
    index * PUMP_MS,
    frame(index % 2 === 1),
  ]);

const arm = (side: 1 | -1) =>
  timeline([
    ...pumpFrames((up) => ({
      transform: `rotate(${side * (up ? 20 : -8)}deg)`,
    })),
    [NOTICE_MS, { transform: `rotate(${side * 20}deg)` }],
    [NOTICE_MS + 220, { transform: `rotate(${side * -105}deg)` }],
    [TOTAL_MS, { transform: `rotate(${side * -105}deg)` }],
  ]);

const puff = (delayMs: number) =>
  timeline([
    [0, { opacity: 0, transform: 'translateY(0) scale(0.5)' }],
    [THUD_MS + delayMs, { opacity: 0, transform: 'translateY(0) scale(0.5)' }],
    [
      THUD_MS + delayMs + 150,
      { opacity: 0.9, transform: 'translateY(-10px) scale(1)' },
    ],
    [
      THUD_MS + delayMs + 650,
      { opacity: 0, transform: 'translateY(-30px) scale(1.5)' },
    ],
    [TOTAL_MS, { opacity: 0, transform: 'translateY(-30px) scale(1.5)' }],
  ]);

const UNCLIPPED = 'inset(-400px -400px -400px -400px)';
const BEHIND_SILL = 'inset(-400px -400px 0px -400px)';

const CUSTOM: Record<string, SceneAnimationSpec> = {
  sneak: timeline([
    ...Array.from(
      { length: TIPTOE_STEPS + 1 },
      (_, index): [number, Keyframe] => [
        (HOP_MS / TIPTOE_STEPS) * index,
        sneakPose((36 / TIPTOE_STEPS) * index, index % 2 ? -6 : 0, 8),
      ],
    ),
    [HOP_MS + 200, sneakPose(60, -66, -4)],
    [SILL_MS, sneakPose(76, -58, 0)],
    [TOTAL_MS, sneakPose(76, -58, 0)],
  ]),
  drop: timeline(
    [
      [0, { transform: 'translateY(0)' }],
      [EXIT_MS, { transform: 'translateY(0)' }],
      [DROP_MS, { transform: 'translateY(-8px)' }],
      [DROP_MS + 300, { transform: 'translateY(200px)' }],
      [TOTAL_MS, { transform: 'translateY(200px)' }],
    ],
    'ease-in',
  ),
  // Once he lets go, everything under the sill line is outside the wall
  'sill-clip': timeline([
    [0, { clipPath: UNCLIPPED }],
    [EXIT_MS, { clipPath: UNCLIPPED }],
    [EXIT_MS + 1, { clipPath: BEHIND_SILL }],
    [TOTAL_MS, { clipPath: BEHIND_SILL }],
  ]),
  'crouch-legs': timeline([
    [0, { transform: 'scaleY(1)' }],
    [HOP_MS + 200, { transform: 'scaleY(1)' }],
    [SILL_MS, { transform: 'scaleY(0.35)' }],
    [TOTAL_MS, { transform: 'scaleY(0.35)' }],
  ]),
  'crouch-body': timeline([
    [0, { transform: 'translateY(0)' }],
    [HOP_MS + 200, { transform: 'translateY(0)' }],
    [SILL_MS, { transform: 'translateY(18px)' }],
    [TOTAL_MS, { transform: 'translateY(18px)' }],
  ]),
  'look-back': timeline([
    [0, { transform: 'rotate(0deg)' }],
    [SILL_MS, { transform: 'rotate(0deg)' }],
    [SILL_MS + 200, { transform: 'rotate(-12deg)' }],
    [EXIT_MS, { transform: 'rotate(-12deg)' }],
    [DROP_MS, { transform: 'rotate(0deg)' }],
    [TOTAL_MS, { transform: 'rotate(0deg)' }],
  ]),
  'bindle-fling': timeline([
    [0, { transform: 'rotate(0deg)' }],
    [EXIT_MS, { transform: 'rotate(0deg)' }],
    [DROP_MS, { transform: 'rotate(55deg)' }],
    [TOTAL_MS, { transform: 'rotate(55deg)' }],
  ]),
  gloat: timeline([
    ...pumpFrames((up) => ({
      transform: `translateY(${up ? -5 : 0}px)`,
    })),
    [NOTICE_MS, { transform: 'translateY(0px)' }],
    [NOTICE_MS + 120, { transform: 'translateY(-10px)' }],
    [NOTICE_MS + 280, { transform: 'translateY(0px)' }],
    [TOTAL_MS, { transform: 'translateY(0px)' }],
  ]),
  'arm-left': arm(1),
  'arm-right': arm(-1),
  'head-turn': timeline([
    [0, { transform: 'translateX(0) rotate(-8deg)' }],
    [NOTICE_MS, { transform: 'translateX(0) rotate(-8deg)' }],
    [NOTICE_MS + 200, { transform: 'translateX(3px) rotate(14deg)' }],
    [TOTAL_MS, { transform: 'translateX(3px) rotate(14deg)' }],
  ]),
  alarm: timeline([
    [0, { opacity: 0, transform: 'scale(0.4)' }],
    [NOTICE_MS + 150, { opacity: 0, transform: 'scale(0.4)' }],
    [NOTICE_MS + 300, { opacity: 1, transform: 'scale(1.3)' }],
    [NOTICE_MS + 450, { opacity: 1, transform: 'scale(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scale(1)' }],
  ]),
  'pane-rattle': timeline([
    [0, { transform: 'scaleX(1)' }],
    [THUD_MS, { transform: 'scaleX(1)' }],
    [THUD_MS + 120, { transform: 'scaleX(0.7)' }],
    [THUD_MS + 300, { transform: 'scaleX(1.1)' }],
    [THUD_MS + 500, { transform: 'scaleX(1)' }],
    [TOTAL_MS, { transform: 'scaleX(1)' }],
  ]),
  'puff-one': puff(0),
  'puff-two': puff(120),
};

const LOCKERS = 7;

const STARS = [
  'left-[16%] top-[14%]',
  'left-[40%] top-[30%]',
  'left-[22%] top-[46%]',
];

const BUNDLE_DOTS = [
  'left-2 top-2',
  'left-6 top-3',
  'left-3 top-5',
  'left-7 top-6',
];

export default function WindowEscapeScene({
  speaker,
  other,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const winner = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-800 via-slate-700 to-slate-700"
        floor="bg-gradient-to-b from-stone-700 to-stone-800"
      >
        <span className="absolute inset-x-0 bottom-[18%] h-[24%] bg-slate-800/50" />
        <span className="absolute inset-x-0 bottom-[18%] h-1.5 bg-slate-900/70" />

        <div className="absolute bottom-[16%] left-1/2 h-0 w-[340px] -translate-x-1/2">
          <div className="absolute bottom-[6px] left-0 flex">
            {Array.from({ length: LOCKERS }, (_, index) => (
              <span
                key={index}
                className="relative h-[128px] w-7 border border-slate-800/70 bg-slate-600/40"
              >
                <span className="absolute inset-x-1.5 top-2 h-0.5 bg-slate-800/60" />
                <span className="absolute inset-x-1.5 top-3.5 h-0.5 bg-slate-800/60" />
                <span className="absolute right-1 top-1/2 h-2.5 w-0.5 rounded-full bg-slate-400/60" />
              </span>
            ))}
          </div>

          <div className="absolute bottom-[58px] left-[218px] h-[112px] w-[84px] overflow-hidden bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800 ring-[5px] ring-slate-300">
            <span className="absolute right-2.5 top-2.5 h-5 w-5 rounded-full bg-yellow-100 shadow-[0_0_12px_3px_rgba(254,249,195,0.5)]" />
            {STARS.map((cls) => (
              <span
                key={cls}
                className={`absolute h-0.5 w-0.5 rounded-full bg-slate-100 ${cls}`}
              />
            ))}
            <span className="absolute bottom-0 left-0 h-5 w-9 bg-slate-950" />
            <span className="absolute bottom-0 right-0 h-8 w-10 bg-slate-950" />
            <span
              data-anim="puff-one"
              className="absolute bottom-0 left-[30%] h-4 w-4 rounded-full bg-slate-300/80 opacity-0"
            />
            <span
              data-anim="puff-two"
              className="absolute bottom-0 left-[52%] h-3 w-3 rounded-full bg-slate-300/80 opacity-0"
            />
          </div>
          <div className="absolute bottom-[58px] left-[307px] h-[112px] w-6 origin-left -skew-y-[16deg]">
            <span
              data-anim="pane-rattle"
              className="absolute inset-0 origin-left border-2 border-slate-300 bg-sky-200/15"
            />
          </div>

          <span className="absolute bottom-[51px] left-[206px] h-[7px] w-[108px] rounded-sm bg-slate-200 shadow-[0_3px_6px_rgba(2,6,23,0.5)]" />

          <div className="absolute bottom-0 left-0 z-10 h-[90px] w-[60px]">
            <span className="absolute bottom-0 left-0 h-[58px] w-9 rounded-t-2xl bg-slate-900" />
            <span className="absolute bottom-[54px] left-1 h-7 w-7 rounded-full bg-slate-900" />
            <span className="absolute bottom-[50px] left-6 h-4 w-6 rounded-sm bg-slate-950 ring-1 ring-slate-500">
              <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-slate-700 ring-1 ring-slate-400" />
            </span>
            <span
              data-anim="flash"
              className="absolute bottom-[56px] left-5 h-9 w-9 rounded-full bg-white opacity-0 blur-[3px]"
            />
            <span className="absolute bottom-0 left-7 h-[48px] w-8 rounded-t-2xl bg-slate-950" />
            <span className="absolute bottom-[44px] left-[30px] h-6 w-6 rounded-full bg-slate-950" />
            <span className="absolute bottom-[40px] left-[46px] h-0.5 w-6 origin-left -rotate-[35deg] bg-slate-400">
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-slate-300" />
            </span>
          </div>

          <div
            data-anim="gloat"
            className="absolute bottom-0 left-[84px] z-10 h-[140px] w-16"
          >
            <span className="absolute bottom-0 left-3 h-12 w-4 rounded-b-md bg-slate-900" />
            <span className="absolute bottom-0 right-3 h-12 w-4 rounded-b-md bg-slate-900" />
            <span
              data-anim="arm-left"
              className="absolute bottom-[78px] right-[52px] h-3 w-8 origin-right rotate-[50deg] rounded-full bg-red-800"
            >
              <span className="absolute -left-2 -top-0.5 h-4 w-4 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
            </span>
            <span
              data-anim="arm-right"
              className="absolute bottom-[78px] left-[52px] h-3 w-8 origin-left -rotate-[50deg] rounded-full bg-red-800"
            >
              <span className="absolute -right-2 -top-0.5 h-4 w-4 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
            </span>
            <span className="absolute bottom-11 left-1 h-12 w-14 rounded-t-2xl bg-gradient-to-b from-red-700 to-red-900" />
            <SceneActor
              character={winner}
              className="bottom-[88px] left-1/2 -translate-x-1/2"
              anim="head-turn"
              pose="origin-bottom"
              size="h-14 w-14 sm:h-16 sm:w-16"
            >
              <span
                data-anim="alarm"
                className="absolute -top-8 left-1/2 -ml-1 h-7 w-2 origin-bottom opacity-0"
              >
                <span className="absolute inset-x-0 top-0 h-[18px] rounded-full bg-yellow-300" />
                <span className="absolute inset-x-0 bottom-0 h-2 rounded-full bg-yellow-300" />
              </span>
            </SceneActor>
          </div>

          <div
            data-anim="sill-clip"
            className="absolute inset-x-0 bottom-[58px] z-20 h-[160px]"
          >
            <div
              data-anim="sneak drop"
              className="absolute -bottom-[58px] left-[152px] h-32 w-16 origin-bottom"
            >
              <span
                data-anim="crouch-legs"
                className="absolute inset-x-0 bottom-0 h-7 origin-bottom"
              >
                <span className="absolute bottom-0 left-[14px] h-7 w-3 rounded-b-md bg-slate-900" />
                <span className="absolute bottom-0 right-[14px] h-7 w-3 rounded-b-md bg-slate-900" />
              </span>
              <div data-anim="crouch-body" className="absolute inset-0">
                <span
                  data-anim="bindle-fling"
                  className="absolute bottom-[50px] right-[14px] z-10 h-1 w-[76px] origin-right rotate-[35deg] rounded-full bg-amber-600"
                >
                  <span className="absolute -left-5 -top-4 h-9 w-10 -rotate-[35deg] rounded-[45%] bg-red-600 ring-1 ring-slate-950/40">
                    {BUNDLE_DOTS.map((cls) => (
                      <span
                        key={cls}
                        className={`absolute h-1 w-1 rounded-full bg-slate-50 ${cls}`}
                      />
                    ))}
                    <span className="absolute -top-1 right-2 h-2.5 w-2.5 rotate-45 rounded-sm bg-red-700" />
                  </span>
                </span>
                <span className="absolute bottom-6 left-2 h-11 w-12 rounded-t-2xl bg-gradient-to-b from-emerald-600 to-emerald-800" />
                <SceneActor
                  character={lead}
                  className="bottom-[60px] left-1/2 -translate-x-1/2"
                  anim="look-back talk"
                  animDelay={`0 ${SILL_MS}`}
                  animIterations={`1 ${TALK_ITERATIONS}`}
                  pose="origin-bottom"
                  size="h-14 w-14 sm:h-16 sm:w-16"
                >
                  <span
                    data-anim="spotlight"
                    data-anim-delay={LINE_START_MS}
                    data-anim-duration={LINE_MS}
                    className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
                  />
                </SceneActor>
                <span className="absolute bottom-[45px] right-[8px] z-30 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              </div>
            </div>
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
