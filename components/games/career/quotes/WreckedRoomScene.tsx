'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
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

const LINE_MS = 8300;
const TOTAL_MS = QUOTE_LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_BEAT_SLOW_MS = TALK_BEAT_MS * 1.6;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_SLOW_MS);
const BEAT_MS = 6000;

type RuinVariant = 'cholesterol' | 'puke' | 'surrender';

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'push-in': sceneTimeline(
    TOTAL_MS,
    [
      [0, { transform: 'scale(1)' }],
      [TOTAL_MS, { transform: 'scale(1.1)' }],
    ],
    'linear',
  ),
  slump: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0) rotate(0deg)' }],
    [2800, { transform: 'translateY(0) rotate(0deg)' }],
    [3400, { transform: 'translateY(4px) rotate(-8deg)' }],
    [8800, { transform: 'translateY(4px) rotate(-8deg)' }],
    [9500, { transform: 'translateY(9px) rotate(-17deg)' }],
    [TOTAL_MS, { transform: 'translateY(9px) rotate(-17deg)' }],
  ]),
  retch: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0) rotate(0deg)' }],
    [BEAT_MS, { transform: 'translate(0, 0) rotate(0deg)' }],
    [BEAT_MS + 180, { transform: 'translate(7px, 5px) rotate(12deg)' }],
    [BEAT_MS + 420, { transform: 'translate(0, 0) rotate(0deg)' }],
    [BEAT_MS + 600, { transform: 'translate(6px, 4px) rotate(10deg)' }],
    [BEAT_MS + 900, { transform: 'translate(0, 0) rotate(0deg)' }],
    [TOTAL_MS, { transform: 'translate(0, 0) rotate(0deg)' }],
  ]),
  'slow-talk': {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-2px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: TALK_BEAT_SLOW_MS, easing: 'ease-in-out' },
  },
  'puddle-spread': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scale(0.7, 0.8)' }],
    [BEAT_MS + 300, { transform: 'scale(0.85, 0.9)' }],
    [BEAT_MS + 900, { transform: 'scale(1.1, 1.05)' }],
    [TOTAL_MS, { transform: 'scale(1.2, 1.1)' }],
  ]),
  bite: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0) rotate(0deg)' }],
    [BEAT_MS, { transform: 'translate(0, 0) rotate(0deg)' }],
    [BEAT_MS + 400, { transform: 'translate(-22px, -14px) rotate(-30deg)' }],
    [BEAT_MS + 900, { transform: 'translate(-22px, -14px) rotate(-30deg)' }],
    [BEAT_MS + 1300, { transform: 'translate(0, 4px) rotate(10deg)' }],
    [TOTAL_MS, { transform: 'translate(0, 6px) rotate(14deg)' }],
  ]),
  'flag-droop': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'rotate(18deg)' }],
    [BEAT_MS, { transform: 'rotate(18deg)' }],
    [BEAT_MS + 1400, { transform: 'rotate(64deg)' }],
    [TOTAL_MS, { transform: 'rotate(70deg)' }],
  ]),
  'towel-fall': {
    keyframes: [
      { transform: 'translate(40px, -170px) rotate(-220deg)', opacity: 1 },
      { transform: 'translate(0, 0) rotate(-8deg)', opacity: 1, offset: 0.85 },
      { transform: 'translate(0, 0) rotate(-4deg)', opacity: 1 },
    ],
    options: { duration: 700, delay: 850, easing: 'ease-in', fill: 'both' },
  },
  'flag-wave': {
    keyframes: [
      { transform: 'skewY(0deg) scaleX(1)' },
      { transform: 'skewY(-6deg) scaleX(0.92)', offset: 0.5 },
      { transform: 'skewY(0deg) scaleX(1)' },
    ],
    options: { duration: 1600, iterations: Infinity, easing: 'ease-in-out' },
  },
  flicker: {
    keyframes: [
      { opacity: 1 },
      { opacity: 1, offset: 0.4 },
      { opacity: 0.35, offset: 0.43 },
      { opacity: 1, offset: 0.46 },
      { opacity: 0.5, offset: 0.5 },
      { opacity: 1, offset: 0.53 },
      { opacity: 1, offset: 0.86 },
      { opacity: 0.25, offset: 0.88 },
      { opacity: 1 },
    ],
    options: { duration: 2900, iterations: Infinity, easing: 'linear' },
  },
  'bulb-swing': {
    keyframes: [
      { transform: 'rotate(-4deg)' },
      { transform: 'rotate(4deg)' },
      { transform: 'rotate(-4deg)' },
    ],
    options: { duration: 3600, iterations: Infinity, easing: 'ease-in-out' },
  },
  fly: {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(14px, -8px)', offset: 0.25 },
      { transform: 'translate(22px, 4px)', offset: 0.5 },
      { transform: 'translate(8px, 12px)', offset: 0.75 },
      { transform: 'translate(0, 0)' },
    ],
    options: { duration: 1500, iterations: Infinity, easing: 'linear' },
  },
  'burst-drop': {
    keyframes: [
      { transform: 'translate(0, 0) scale(0.6)', opacity: 0 },
      { transform: 'translate(0, -10px) scale(1)', opacity: 1, offset: 0.2 },
      { transform: 'translate(0, 26px) scale(0.7)', opacity: 0 },
    ],
    options: { duration: 1300, iterations: Infinity, easing: 'ease-in' },
  },
};

const STAINS = [
  'left-[6%] top-[14%] h-16 w-24 bg-amber-900/25',
  'left-[58%] top-[8%] h-20 w-16 bg-lime-900/25',
  'left-[78%] top-[30%] h-12 w-20 bg-amber-950/40',
  'left-[34%] top-[36%] h-10 w-14 bg-stone-950/40',
];

const DRIPS = [
  'left-[12%] h-[34%]',
  'left-[15%] h-[22%]',
  'left-[63%] h-[40%]',
  'left-[82%] h-[26%]',
];

const TRASH = [
  'bottom-[7%] left-[62%] h-2 w-4 rotate-12 rounded-sm bg-red-500/80',
  'bottom-[12%] left-[70%] h-2.5 w-3 -rotate-6 rounded-sm bg-yellow-400/80',
  'bottom-[4%] left-[78%] h-2 w-5 rotate-3 rounded-sm bg-stone-300/70',
  'bottom-[14%] left-[86%] h-2 w-3 -rotate-12 rounded-sm bg-red-500/70',
  'bottom-[3%] left-[4%] h-2 w-4 rotate-6 rounded-sm bg-yellow-400/70',
  'bottom-[10%] left-[92%] h-3 w-3 rounded-full bg-stone-200/60',
];

const FLIES = [
  { cls: 'bottom-[62%] left-[20%]', delay: 0 },
  { cls: 'bottom-[56%] left-[30%]', delay: -500 },
  { cls: 'bottom-[20%] left-[72%]', delay: -1000 },
];

const BURST_DROPS = [
  { cls: 'left-[6px]', delay: 0 },
  { cls: 'left-[12px]', delay: -450 },
  { cls: 'left-[2px]', delay: -900 },
];

function isRuinVariant(value: string | undefined): value is RuinVariant {
  return value === 'cholesterol' || value === 'puke' || value === 'surrender';
}

function CholesterolProps() {
  return (
    <>
      <div className="absolute bottom-[6px] left-[4px] h-[84px] w-[22px] rounded-full border-2 border-slate-400 bg-slate-900 shadow-lg">
        <span className="absolute inset-x-[3px] bottom-[3px] top-[10px] rounded-full bg-gradient-to-t from-red-700 to-red-500" />
        <span className="absolute -bottom-2 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full border-2 border-slate-400 bg-red-600" />
        <span className="absolute -top-2 left-0 h-3 w-2 -rotate-[30deg] rounded-sm bg-slate-400" />
        <span className="absolute -top-3 right-0 h-3 w-2 rotate-[35deg] rounded-sm bg-slate-400" />
        <span className="absolute left-1/2 top-2 h-5 w-px -translate-x-1/2 rotate-12 bg-slate-950" />
        {BURST_DROPS.map((drop) => (
          <span
            key={drop.cls}
            data-anim="burst-drop"
            data-anim-delay={drop.delay}
            className={`absolute -top-4 h-2 w-1.5 rounded-b-full rounded-t-[40%] bg-red-500 ${drop.cls}`}
          />
        ))}
      </div>
      <span className="absolute bottom-0 left-[20px] h-2.5 w-12 rounded-[50%] bg-red-700/70" />
      <span
        data-anim="bite"
        className="absolute bottom-[34px] left-[98px] z-30 origin-left"
      >
        <span className="absolute left-0 top-0 h-4 w-4 rounded-full bg-orange-200 ring-2 ring-slate-950/50" />
        <GlizzyIcon
          variant={0}
          className="absolute -top-2 left-2 h-5 w-8 -rotate-12"
        />
      </span>
    </>
  );
}

function PukeProps() {
  return (
    <>
      <span
        data-anim="puddle-spread"
        className="absolute bottom-[-4px] left-[96px] h-[16px] w-[84px] origin-left rounded-[50%] bg-lime-700/80"
      >
        <span className="absolute left-[20%] top-[25%] h-1.5 w-2 rounded-full bg-amber-200/70" />
        <span className="absolute left-[55%] top-[40%] h-1 w-1.5 rounded-full bg-amber-200/60" />
        <span className="absolute left-[70%] top-[20%] h-1.5 w-1.5 rounded-full bg-lime-300/70" />
      </span>
      <div className="absolute bottom-[2px] left-[170px] h-9 w-8 bg-gradient-to-b from-slate-300 to-slate-500 shadow-md [clip-path:polygon(0_0,100%_0,86%_100%,14%_100%)]">
        <span className="absolute inset-x-0 top-0 h-1.5 bg-slate-600" />
        <span className="absolute inset-x-0 top-[45%] h-px bg-slate-600/60" />
      </div>
      <span className="absolute bottom-[34px] left-[168px] h-3 w-9 rounded-t-full border-2 border-b-0 border-slate-400" />
    </>
  );
}

function SurrenderProps() {
  return (
    <>
      <span
        data-anim="towel-fall"
        className="absolute bottom-0 left-[112px] z-30 h-3.5 w-14 rounded-sm bg-stone-100 opacity-0 shadow-md"
      >
        <span className="absolute inset-y-0 left-2 w-1 bg-red-500" />
        <span className="absolute inset-y-0 right-2 w-1 bg-red-500" />
      </span>
      <span
        data-anim="flag-droop"
        className="absolute bottom-[30px] left-[102px] z-30 h-[64px] w-1 origin-bottom rounded-full bg-amber-800"
      >
        <span
          data-anim="flag-wave"
          className="absolute left-1 top-0 h-7 w-10 origin-left rounded-r-sm bg-stone-50 shadow"
        />
      </span>
      <span className="absolute bottom-[28px] left-[98px] z-30 h-4 w-4 rounded-full bg-orange-200 ring-2 ring-slate-950/50" />
    </>
  );
}

export default function WreckedRoomScene({
  speaker,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const ruin: RuinVariant = isRuinVariant(variant) ? variant : 'puke';
  useSceneAnimation(root, CUSTOM, [speaker, ruin]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900"
        floor={null}
      >
        <div data-anim="push-in" className="absolute inset-0 origin-[30%_80%]">
          <div className="absolute inset-x-0 bottom-[18%] h-[34%] bg-[repeating-linear-gradient(90deg,rgba(214,211,209,0.08)_0,rgba(214,211,209,0.08)_22px,rgba(12,10,9,0.5)_22px,rgba(12,10,9,0.5)_24px),repeating-linear-gradient(0deg,rgba(214,211,209,0.06)_0,rgba(214,211,209,0.06)_16px,rgba(12,10,9,0.5)_16px,rgba(12,10,9,0.5)_18px)]" />
          <span className="absolute bottom-[34%] left-[48%] h-4 w-6 bg-stone-950/80" />
          <span className="absolute bottom-[22%] left-[84%] h-4 w-6 bg-stone-950/80" />
          <span className="absolute inset-x-0 bottom-[52%] h-1 bg-stone-950/60" />
          {STAINS.map((cls) => (
            <span
              key={cls}
              className={`absolute rounded-[50%] blur-md ${cls}`}
            />
          ))}
          {DRIPS.map((cls) => (
            <span
              key={cls}
              className={`absolute top-0 w-1 rounded-b-full bg-gradient-to-b from-amber-900/50 to-transparent ${cls}`}
            />
          ))}

          <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-b from-stone-700 to-stone-800 shadow-[0_-8px_24px_rgba(2,6,23,0.6)]">
            <span className="absolute left-[40%] top-[30%] h-3 w-16 rounded-[50%] bg-amber-950/60 blur-[2px]" />
            <span className="absolute left-[8%] top-[55%] h-2 w-10 rounded-[50%] bg-lime-950/60 blur-[2px]" />
          </div>
          {TRASH.map((cls) => (
            <span key={cls} className={`absolute ${cls}`} />
          ))}

          <div
            data-anim="bulb-swing"
            className="absolute left-[40%] top-0 h-[30%] w-px origin-top bg-stone-950"
          >
            <span className="absolute -bottom-1 left-1/2 h-3 w-2 -translate-x-1/2 rounded-sm bg-stone-600" />
            <span
              data-anim="flicker"
              className="absolute -bottom-4 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-yellow-100 shadow-[0_0_24px_8px_rgba(254,240,138,0.55)]"
            />
          </div>
          <div
            data-anim="flicker"
            className="pointer-events-none absolute left-[6%] top-[24%] h-[76%] w-[68%] bg-gradient-to-b from-yellow-100/20 to-yellow-100/0 [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)]"
          />

          {FLIES.map((fly) => (
            <span
              key={fly.cls}
              data-anim="fly"
              data-anim-delay={fly.delay}
              className={`absolute z-30 h-1 w-1.5 rounded-full bg-stone-950 ${fly.cls}`}
            />
          ))}

          <div className="absolute bottom-[12%] left-[12%] h-28 w-52">
            <span className="absolute bottom-[10px] left-[82px] z-10 h-3.5 w-[72px] -rotate-3 rounded-full bg-slate-700">
              <span className="absolute -right-1 -top-1 h-5 w-3.5 rounded-md bg-slate-900" />
            </span>
            <span className="absolute bottom-[2px] left-[86px] z-10 h-3.5 w-[66px] rotate-2 rounded-full bg-slate-700">
              <span className="absolute -right-1 -top-1 h-5 w-3.5 rounded-md bg-slate-900" />
            </span>
            <span className="absolute bottom-[4px] left-[44px] z-10 h-[46px] w-[56px] -rotate-6 rounded-t-[22px] bg-gradient-to-b from-slate-600 to-slate-700 shadow-lg">
              <span className="absolute left-[30%] top-[40%] h-3 w-4 rounded-full bg-amber-900/50" />
            </span>

            <SceneActor
              character={lead}
              className="bottom-[40px] left-[44px]"
              anim={
                ruin === 'puke' ? 'slump retch slow-talk' : 'slump slow-talk'
              }
              animDelay={
                ruin === 'puke'
                  ? `0 0 ${QUOTE_LINE_START_MS}`
                  : `0 ${QUOTE_LINE_START_MS}`
              }
              animIterations={
                ruin === 'puke'
                  ? `1 1 ${TALK_ITERATIONS}`
                  : `1 ${TALK_ITERATIONS}`
              }
              pose="origin-bottom -rotate-6 saturate-50 brightness-90"
              size="h-14 w-14 sm:h-16 sm:w-16"
            />

            {ruin === 'cholesterol' && <CholesterolProps />}
            {ruin === 'puke' && <PukeProps />}
            {ruin === 'surrender' && <SurrenderProps />}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_36%_62%,transparent_28%,rgba(12,10,9,0.8)_100%)]" />
        </div>
      </SceneFrame>
    </div>
  );
}
