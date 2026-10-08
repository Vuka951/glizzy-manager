'use client';

import { useRef } from 'react';
import XEyes from '@/components/games/career/quotes/XEyes';
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

const LINE_MS = 4400;
// Matches the lineStartMs of this scene's definition: the alarm, the stretch
// and the step over the beaten man come first, the line once he lands
const LINE_START_MS = 3500;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The cues of the definition land on these: a beep per ring, a footstep on
// each landing, the creak on the stretch and the whoosh on the big step
const ALARM_MS = 1100;
const RING_MS = 370;
const RINGS = 2;
const SIT_MS = 1500;
const OUT_MS = 1800;
const FEET_DOWN_MS = OUT_MS + 400;
const STRETCH_MS = FEET_DOWN_MS;
const STEP_MS = 2950;
const BREATH_MS = 1300;

const IN_BED = 'translateY(-13px) rotate(-14deg)';
const SITTING = 'translateY(-36px) rotate(0deg)';
const STANDING = 'translateY(0) rotate(0deg)';

const timeline = (frames: [number, Keyframe][]) =>
  sceneTimeline(TOTAL_MS, frames);

const arm = (side: 1 | -1) =>
  timeline([
    [0, { transform: `rotate(${side * 12}deg)` }],
    [STRETCH_MS, { transform: `rotate(${side * 12}deg)` }],
    [STRETCH_MS + 250, { transform: `rotate(${side * 158}deg)` }],
    [STRETCH_MS + 550, { transform: `rotate(${side * 150}deg)` }],
    [STRETCH_MS + 720, { transform: `rotate(${side * 16}deg)` }],
    [TOTAL_MS, { transform: `rotate(${side * 16}deg)` }],
  ]);

const leg = (swing: number, follow: number) =>
  timeline([
    [0, { transform: 'rotate(0deg)' }],
    [STEP_MS, { transform: 'rotate(0deg)' }],
    [STEP_MS + 180, { transform: `rotate(${swing}deg)` }],
    [STEP_MS + 400, { transform: `rotate(${follow}deg)` }],
    [LINE_START_MS, { transform: 'rotate(0deg)' }],
    [TOTAL_MS, { transform: 'rotate(0deg)' }],
  ]);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'lead-travel': timeline([
    [0, { left: '24%' }],
    [OUT_MS, { left: '24%' }],
    [FEET_DOWN_MS, { left: '48%' }],
    [STEP_MS, { left: '48%' }],
    [LINE_START_MS, { left: '89.5%' }],
    [TOTAL_MS, { left: '89.5%' }],
  ]),
  'lead-body': timeline([
    [0, { transform: IN_BED }],
    [ALARM_MS, { transform: IN_BED }],
    [ALARM_MS + 120, { transform: 'translateY(-19px) rotate(-6deg)' }],
    [ALARM_MS + 300, { transform: IN_BED }],
    [SIT_MS, { transform: IN_BED }],
    [SIT_MS + 250, { transform: SITTING }],
    [OUT_MS, { transform: SITTING }],
    [OUT_MS + 180, { transform: 'translateY(-46px) rotate(6deg)' }],
    [FEET_DOWN_MS, { transform: STANDING }],
    [STRETCH_MS + 250, { transform: 'translateY(-5px) rotate(-7deg)' }],
    [STRETCH_MS + 550, { transform: 'translateY(-5px) rotate(-7deg)' }],
    [STRETCH_MS + 720, { transform: STANDING }],
    [STEP_MS, { transform: STANDING }],
    [STEP_MS + 275, { transform: 'translateY(-40px) rotate(8deg)' }],
    [LINE_START_MS, { transform: STANDING }],
    [TOTAL_MS, { transform: STANDING }],
  ]),
  'arm-left': arm(1),
  'arm-right': arm(-1),
  'leg-lead': leg(-44, -18),
  'leg-trail': leg(12, 40),
  'sleep-breathe': {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.03)', offset: 0.5 },
      { transform: 'scale(1)' },
    ],
    options: { duration: BREATH_MS, easing: 'ease-in-out' },
  },
  'z-float': {
    keyframes: [
      { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
      { transform: 'translate(4px, -8px) scale(1)', opacity: 0.9, offset: 0.3 },
      { transform: 'translate(12px, -30px) scale(1.2)', opacity: 0 },
    ],
    options: { duration: 900, easing: 'ease-out', fill: 'both' },
  },
  mound: timeline([
    [0, { transform: 'scaleY(1)' }],
    [BREATH_MS / 2, { transform: 'scaleY(1.1)' }],
    [ALARM_MS, { transform: 'scaleY(1)' }],
    [SIT_MS, { transform: 'scaleY(1)' }],
    [SIT_MS + 250, { transform: 'scaleY(0.7)' }],
    [OUT_MS, { transform: 'scaleY(0.7)' }],
    [FEET_DOWN_MS, { transform: 'scaleY(0.25)' }],
    [TOTAL_MS, { transform: 'scaleY(0.25)' }],
  ]),
  ring: {
    keyframes: [
      { transform: 'translate(0, 0) rotate(0deg)' },
      { transform: 'translate(-2px, -1px) rotate(-12deg)', offset: 0.25 },
      { transform: 'translate(2px, -2px) rotate(12deg)', offset: 0.5 },
      { transform: 'translate(-2px, -1px) rotate(-12deg)', offset: 0.75 },
      { transform: 'translate(0, 0) rotate(0deg)' },
    ],
    options: { duration: RING_MS, iterations: RINGS, easing: 'linear' },
  },
  'ring-mark': {
    keyframes: [
      { opacity: 0, transform: 'scale(0.6)' },
      { opacity: 1, transform: 'scale(1.1)', offset: 0.3 },
      { opacity: 1, transform: 'scale(1.1)', offset: 0.7 },
      { opacity: 0, transform: 'scale(1.3)' },
    ],
    options: { duration: RING_MS, iterations: RINGS, easing: 'linear' },
  },
  'gloom-lift': timeline([
    [0, { opacity: 1 }],
    [SIT_MS, { opacity: 1 }],
    [FEET_DOWN_MS, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'knocked-out': {
    keyframes: [{ opacity: 1 }, { opacity: 1 }],
    options: { duration: TOTAL_MS, fill: 'both' },
  },
  flinch: timeline([
    [0, { transform: 'translateY(0) rotate(0deg)' }],
    [STEP_MS + 150, { transform: 'translateY(0) rotate(0deg)' }],
    [STEP_MS + 300, { transform: 'translateY(-4px) rotate(-2deg)' }],
    [LINE_START_MS, { transform: 'translateY(0) rotate(0deg)' }],
    [TOTAL_MS, { transform: 'translateY(0) rotate(0deg)' }],
  ]),
};

const MOTES = [
  { cls: 'left-[46%] top-[40%]', delay: 0 },
  { cls: 'left-[54%] top-[52%]', delay: -1200 },
  { cls: 'left-[40%] top-[58%]', delay: -2300 },
  { cls: 'left-[62%] top-[46%]', delay: -600 },
];

const Z_DELAYS = [-500, 100, 700];

const RING_MARKS = [
  '-left-2 top-0 -rotate-45',
  'left-1/2 -top-3 -translate-x-1/2 rotate-90',
  '-right-2 top-0 rotate-45',
];

const LOST_DAYS = 11;

const PLATES = ['bottom-0 w-9', 'bottom-1 w-8', 'bottom-2 w-9'];

const STARS = [
  'left-1/2 top-0 -translate-x-1/2',
  'bottom-0 left-0',
  'bottom-0 right-0',
];

export default function StreakBrokenScene({
  speaker,
  other,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const beaten = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-800 via-slate-800 to-slate-700"
        floor="bg-gradient-to-b from-amber-900 to-amber-950"
      >
        <div className="absolute inset-x-0 top-0 h-[82%] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_18px,rgba(251,191,36,0.05)_18px,rgba(251,191,36,0.05)_20px)]" />
        <div className="absolute inset-0 bg-gradient-to-bl from-amber-200/25 via-orange-200/5 to-transparent" />
        <span className="absolute inset-x-0 bottom-[18%] h-1.5 bg-amber-950/80" />

        <div className="absolute inset-y-0 left-1/2 w-[340px] -translate-x-1/2 sm:w-[420px]">
          <div className="absolute left-[56%] top-[8%] h-[36%] w-[24%] rounded-t-md border-4 border-amber-900 bg-gradient-to-b from-blue-200 via-orange-100 to-amber-200 shadow-[0_0_40px_rgba(253,230,138,0.45)]">
            <span className="absolute bottom-[8%] right-[26%] h-6 w-6 rounded-full bg-yellow-100 blur-[2px]" />
            <span className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-amber-900" />
            <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-amber-900" />
          </div>
          <span className="absolute left-[53%] top-[6%] h-[42%] w-[4%] rounded-b-full bg-gradient-to-b from-rose-800 to-rose-900 shadow-md" />
          <span className="absolute left-[79%] top-[6%] h-[42%] w-[4%] rounded-b-full bg-gradient-to-b from-rose-800 to-rose-900 shadow-md" />
          <span className="absolute left-[52%] top-[5%] h-1.5 w-[32%] rounded-full bg-amber-950" />
          <div className="absolute left-[14%] top-[12%] h-[88%] w-[64%] bg-gradient-to-b from-amber-100/25 via-amber-100/10 to-transparent [clip-path:polygon(68%_0,100%_0,56%_100%,0_100%)]" />
          {MOTES.map((mote) => (
            <span
              key={mote.cls}
              data-anim="drift"
              data-anim-delay={mote.delay}
              className={`absolute h-1 w-1 rounded-full bg-amber-100/80 ${mote.cls}`}
            />
          ))}

          <div className="absolute left-0 top-[13%] h-[23%] w-[9%] rounded-sm bg-stone-100 shadow-md">
            <span className="absolute inset-x-0 top-0 h-[20%] rounded-t-sm bg-red-600" />
            <div className="absolute inset-x-[10%] bottom-[8%] top-[28%] grid grid-cols-4 place-items-center">
              {Array.from({ length: LOST_DAYS }, (_, day) => (
                <span key={day} className="relative h-1.5 w-1.5">
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-red-600" />
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-red-600" />
                </span>
              ))}
              <span className="h-1.5 w-1.5 rounded-full ring-1 ring-emerald-600" />
            </div>
          </div>

          <span className="absolute bottom-[12%] left-[4%] z-10 h-[9%] w-[40%] rounded-[50%] bg-rose-900/60" />

          <div className="absolute bottom-[18%] left-0 z-10 h-[16%] w-[8%] rounded-t-sm border-t-2 border-amber-700 bg-gradient-to-b from-amber-800 to-amber-950">
            <span className="absolute left-1/2 top-[35%] h-1 w-1 -translate-x-1/2 rounded-full bg-amber-300" />
          </div>
          <div
            data-anim="ring"
            data-anim-delay={ALARM_MS}
            className="absolute bottom-[34%] left-[4%] z-10 h-5 w-5 -translate-x-1/2"
          >
            <span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-amber-300" />
            <span className="absolute -top-1 right-0 h-2 w-2 rounded-full bg-amber-300" />
            <span className="absolute inset-0 rounded-full border-2 border-red-600 bg-stone-100">
              <span className="absolute bottom-1/2 left-1/2 h-1.5 w-px -translate-x-1/2 bg-slate-900" />
              <span className="absolute left-1/2 top-1/2 h-px w-1.5 bg-slate-900" />
            </span>
            {RING_MARKS.map((cls) => (
              <span
                key={cls}
                data-anim="ring-mark"
                data-anim-delay={ALARM_MS}
                className={`absolute h-0.5 w-2.5 rounded-full bg-yellow-200 opacity-0 ${cls}`}
              />
            ))}
          </div>
          <div className="absolute bottom-[7%] left-[1%] z-50 h-4 w-9">
            {PLATES.map((cls) => (
              <span
                key={cls}
                className={`absolute left-1/2 h-1.5 -translate-x-1/2 rounded-[50%] border-b border-stone-400 bg-stone-200 ${cls}`}
              />
            ))}
          </div>

          <div className="absolute bottom-[40%] left-[10%] h-[36%] w-[28%] rounded-t-[40%] border-4 border-amber-950/60 bg-gradient-to-b from-amber-700 to-amber-900 shadow-lg">
            <span className="absolute inset-x-[12%] top-[22%] h-[40%] rounded-t-[40%] border-2 border-amber-950/40" />
          </div>
          <span className="absolute bottom-[45%] left-[13%] z-10 h-[14%] w-[22%] rounded-[40%] bg-stone-50 shadow" />

          <div
            data-anim="flinch"
            className="absolute bottom-[6%] left-[46%] z-30 h-14 w-[35%] sm:h-16"
          >
            <span className="absolute bottom-2 left-[5%] h-3 w-[30%] origin-right -rotate-6 rounded-full bg-slate-600" />
            <span className="absolute bottom-0 left-[3%] h-3 w-[32%] rounded-full bg-slate-700" />
            <span
              data-anim="wobble"
              className="absolute bottom-0 left-0 h-5 w-2.5 origin-bottom rounded-t-full bg-slate-950"
            />
            <span className="absolute bottom-0 left-[30%] h-7 w-[32%] rounded-2xl bg-stone-200 shadow" />
            <span className="absolute bottom-0 left-[24%] h-2.5 w-[22%] rounded-full bg-stone-300">
              <span className="absolute -left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
            </span>
            <SceneActor
              character={beaten}
              className="bottom-0 right-0 rotate-90"
              size="h-14 w-14 sm:h-16 sm:w-16"
            >
              <XEyes anim="knocked-out" />
            </SceneActor>
            <span className="absolute -top-5 right-1.5 z-30 h-11 w-11 scale-y-50">
              <span data-anim="spin" className="absolute inset-0">
                {STARS.map((cls) => (
                  <span
                    key={cls}
                    className={`absolute h-3.5 w-3.5 bg-yellow-300 [clip-path:polygon(50%_0,62%_36%,100%_50%,62%_64%,50%_100%,38%_64%,0_50%,38%_36%)] ${cls}`}
                  />
                ))}
              </span>
            </span>
          </div>

          <div
            data-anim="lead-travel"
            className="absolute bottom-[41%] left-[24%] z-40 h-14 w-14 -translate-x-1/2 sm:h-16 sm:w-16"
          >
            <SceneActor
              character={lead}
              className="bottom-0 left-0"
              anim="lead-body sleep-breathe talk"
              animDelay={`0 0 ${LINE_START_MS}`}
              animIterations={`1 1 ${TALK_ITERATIONS}`}
              pose="origin-bottom"
              size="h-14 w-14 sm:h-16 sm:w-16"
            >
              <span
                data-anim="spotlight"
                data-anim-delay={LINE_START_MS}
                data-anim-duration={LINE_MS}
                className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
              />
              {Z_DELAYS.map((delay) => (
                <span
                  key={delay}
                  data-anim="z-float"
                  data-anim-delay={delay}
                  className="absolute -right-3 -top-2 text-xs font-black text-blue-200 opacity-0"
                >
                  Z
                </span>
              ))}
              <span className="absolute left-1/2 top-[calc(100%-4px)] -z-10 h-[34px] w-12 -translate-x-1/2 rounded-t-2xl bg-[repeating-linear-gradient(90deg,#93c5fd_0,#93c5fd_4px,#dbeafe_4px,#dbeafe_8px)] sm:h-[38px] sm:w-14">
                <span
                  data-anim="arm-left"
                  className="absolute left-0 top-1 h-9 w-3 origin-top rounded-full bg-blue-300"
                >
                  <span className="absolute -bottom-1 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                </span>
                <span
                  data-anim="arm-right"
                  className="absolute right-0 top-1 h-9 w-3 origin-top rounded-full bg-blue-300"
                >
                  <span className="absolute -bottom-1 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                </span>
                <span
                  data-anim="leg-trail"
                  className="absolute left-[18%] top-full h-[26px] w-[28%] origin-top rounded-b-md bg-slate-700 sm:h-[32px]"
                />
                <span
                  data-anim="leg-lead"
                  className="absolute right-[18%] top-full h-[26px] w-[28%] origin-top rounded-b-md bg-slate-700 sm:h-[32px]"
                />
              </span>
            </SceneActor>
          </div>

          <div className="absolute bottom-[18%] left-[9%] z-50 h-[30%] w-[30%]">
            <span
              data-anim="mound"
              className="absolute -top-[18%] left-[18%] h-[40%] w-[64%] origin-bottom rounded-[50%] bg-sky-700"
            />
            <div className="absolute inset-0 overflow-hidden rounded-t-2xl bg-gradient-to-b from-sky-700 to-sky-900 shadow-[0_-4px_12px_rgba(2,6,23,0.35)]">
              <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_20px,rgba(255,255,255,0.09)_20px,rgba(255,255,255,0.09)_22px),repeating-linear-gradient(0deg,transparent_0,transparent_20px,rgba(255,255,255,0.06)_20px,rgba(255,255,255,0.06)_22px)]" />
              <span className="absolute inset-x-0 top-0 h-[20%] bg-stone-100 shadow-[0_3px_6px_rgba(2,6,23,0.3)]" />
            </div>
          </div>
          <div className="absolute bottom-[18%] left-[8%] z-50 h-[10%] w-[32%] rounded-t-md border-t-4 border-amber-700 bg-gradient-to-b from-amber-800 to-amber-950 shadow-lg" />
          <span className="absolute bottom-[14%] left-[9%] z-50 h-[5%] w-[2.5%] bg-amber-950" />
          <span className="absolute bottom-[14%] left-[36.5%] z-50 h-[5%] w-[2.5%] bg-amber-950" />
        </div>

        <div
          data-anim="gloom-lift"
          className="absolute inset-0 z-[55] bg-indigo-950/60"
        />
      </SceneFrame>
    </div>
  );
}
