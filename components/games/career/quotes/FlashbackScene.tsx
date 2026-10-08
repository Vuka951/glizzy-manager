'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import PortraitHead from '@/components/games/PortraitHead';
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

const LINE_MS = 1900;
// Matches the lineStartMs of this scene's definition: a long silence before
// the line, broken only by the flashes
const LINE_START_MS = 4500;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_BEAT_SLOW_MS = TALK_BEAT_MS * 1.5;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_SLOW_MS);
// The crowd-echo cues of the definition land on these flashes
const FLASHES = [1500, 2700, 3700];

const memory = (at: number) =>
  sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translate(0, 0) scale(1.05) rotate(0deg)' }],
    [at, { opacity: 0, transform: 'translate(0, 0) scale(1.05) rotate(0deg)' }],
    [
      at + 40,
      {
        opacity: 0.9,
        transform: 'translate(-6px, 3px) scale(1.1) rotate(-2deg)',
      },
    ],
    [
      at + 110,
      {
        opacity: 0.6,
        transform: 'translate(5px, -4px) scale(1.08) rotate(2deg)',
      },
    ],
    [
      at + 180,
      {
        opacity: 0.85,
        transform: 'translate(-3px, 2px) scale(1.12) rotate(-1deg)',
      },
    ],
    [
      at + 280,
      { opacity: 0, transform: 'translate(0, 0) scale(1.05) rotate(0deg)' },
    ],
    [
      TOTAL_MS,
      { opacity: 0, transform: 'translate(0, 0) scale(1.05) rotate(0deg)' },
    ],
  ]);

const flinch = (at: number): [number, Keyframe][] => [
  [at, { transform: 'translate(0, 0)' }],
  [at + 60, { transform: 'translate(-3px, -2px)' }],
  [at + 260, { transform: 'translate(0, 0)' }],
];

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'push-in': sceneTimeline(
    TOTAL_MS,
    [
      [0, { transform: 'scale(1)' }],
      [TOTAL_MS, { transform: 'scale(1.14)' }],
    ],
    'linear',
  ),
  tremble: {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(0.6px, -0.4px)', offset: 0.25 },
      { transform: 'translate(-0.5px, 0.5px)', offset: 0.5 },
      { transform: 'translate(0.4px, 0.3px)', offset: 0.75 },
      { transform: 'translate(0, 0)' },
    ],
    options: { duration: 160, iterations: Infinity, easing: 'linear' },
  },
  'flash-flinch': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0)' }],
    ...FLASHES.flatMap(flinch),
    [TOTAL_MS, { transform: 'translate(0, 0)' }],
  ]),
  'slow-talk': {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-1.5px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: TALK_BEAT_SLOW_MS, easing: 'ease-in-out' },
  },
  'memory-one': memory(FLASHES[0]),
  'memory-two': memory(FLASHES[1]),
  'memory-three': memory(FLASHES[2]),
  rain: {
    keyframes: [
      { transform: 'translateY(-40px)' },
      { transform: 'translateY(90px)' },
    ],
    options: { duration: 900, iterations: Infinity, easing: 'linear' },
  },
  'bulb-sway': {
    keyframes: [
      { transform: 'rotate(-2deg)' },
      { transform: 'rotate(2deg)' },
      { transform: 'rotate(-2deg)' },
    ],
    options: { duration: 5200, iterations: Infinity, easing: 'ease-in-out' },
  },
  'dim-flicker': {
    keyframes: [
      { opacity: 1 },
      { opacity: 1, offset: 0.7 },
      { opacity: 0.4, offset: 0.72 },
      { opacity: 1, offset: 0.75 },
      { opacity: 1 },
    ],
    options: { duration: 3700, iterations: Infinity, easing: 'linear' },
  },
};

const RAIN = [
  { cls: 'left-[12%]', delay: 0 },
  { cls: 'left-[30%]', delay: -300 },
  { cls: 'left-[48%]', delay: -600 },
  { cls: 'left-[66%]', delay: -150 },
  { cls: 'left-[84%]', delay: -450 },
  { cls: 'left-[22%]', delay: -750 },
  { cls: 'left-[58%]', delay: -520 },
];

export default function FlashbackScene({
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
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        floor={null}
      >
        <div
          data-anim="push-in"
          className="absolute inset-0 origin-[38%_72%] grayscale-[65%]"
        >
          <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-b from-slate-800 to-slate-900" />
          <span className="absolute inset-x-0 bottom-[20%] h-1 bg-slate-950/70" />

          <div className="absolute right-[10%] top-[12%] h-[40%] w-[22%] overflow-hidden rounded-sm border-4 border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900">
            {RAIN.map((drop) => (
              <span
                key={drop.cls}
                data-anim="rain"
                data-anim-delay={drop.delay}
                className={`absolute top-0 h-5 w-px bg-blue-200/50 ${drop.cls}`}
              />
            ))}
            <span className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-slate-700" />
            <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-slate-700" />
          </div>
          <div className="absolute right-[4%] top-[20%] h-[70%] w-[40%] bg-gradient-to-b from-blue-200/10 to-transparent [clip-path:polygon(40%_0,80%_0,70%_100%,0_100%)]" />

          <div
            data-anim="bulb-sway"
            className="absolute left-[34%] top-0 h-[26%] w-px origin-top bg-slate-950"
          >
            <span
              data-anim="dim-flicker"
              className="absolute -bottom-3 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-yellow-100/80 shadow-[0_0_18px_6px_rgba(254,240,138,0.25)]"
            />
          </div>
          <div
            data-anim="dim-flicker"
            className="absolute left-[8%] top-[24%] h-[76%] w-[54%] bg-gradient-to-b from-yellow-100/10 to-transparent [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)]"
          />

          <div
            data-anim="flash-flinch"
            className="absolute bottom-[16%] left-[26%] h-28 w-36"
          >
            <span className="absolute bottom-[4px] left-[10px] h-[58px] w-[64px] rounded-t-[28px] bg-gradient-to-b from-stone-700 to-stone-800" />
            <SceneActor
              character={lead}
              className="bottom-[46px] left-[14px]"
              anim="tremble slow-talk"
              animDelay={`0 ${LINE_START_MS}`}
              animIterations={`Infinity ${TALK_ITERATIONS}`}
              pose="origin-bottom rotate-[4deg] brightness-75"
              size="h-14 w-14 sm:h-16 sm:w-16"
            />
            <span className="absolute bottom-[4px] left-[52px] z-30 h-[54px] w-[26px] -rotate-[18deg] rounded-t-[14px] bg-stone-600" />
            <span className="absolute bottom-[4px] left-[70px] z-30 h-[48px] w-[24px] -rotate-[10deg] rounded-t-[14px] bg-stone-700" />
            <span className="absolute bottom-[40px] left-[46px] z-30 h-3 w-[46px] -rotate-6 rounded-full bg-stone-500" />
            <span className="absolute bottom-[36px] left-[84px] z-30 h-3.5 w-3.5 rounded-full bg-orange-200/80" />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_38%_62%,transparent_25%,rgba(2,6,23,0.85)_100%)]" />
        </div>

        <div
          data-anim="memory-one"
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden bg-slate-300 opacity-0 contrast-125 grayscale"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-stone-200 via-stone-400 to-stone-700" />
          <div className="absolute left-1/2 top-[18%] -translate-x-1/2">
            <PortraitHead
              character={winner}
              className="h-28 w-28 ring-4 ring-stone-100/80"
            />
          </div>
          <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgba(0,0,0,0.18)_3px,rgba(0,0,0,0.18)_4px)]" />
        </div>
        <div
          data-anim="memory-two"
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden opacity-0 grayscale"
        >
          <div className="absolute inset-0 bg-stone-900" />
          <div className="absolute left-[10%] top-0 h-full w-[34%] bg-gradient-to-b from-stone-100/70 to-transparent [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />
          <div className="absolute right-[10%] top-0 h-full w-[34%] bg-gradient-to-b from-stone-100/70 to-transparent [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />
          <div className="absolute bottom-[10%] left-[18%]">
            <PortraitHead
              character={winner}
              className="h-20 w-20 ring-4 ring-stone-100/60"
            />
          </div>
          <div className="absolute bottom-[4%] right-[16%] rotate-[70deg]">
            <PortraitHead
              character={lead}
              className="h-16 w-16 ring-4 ring-stone-100/40"
            />
          </div>
          <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgba(0,0,0,0.25)_3px,rgba(0,0,0,0.25)_4px)]" />
        </div>
        <div
          data-anim="memory-three"
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden opacity-0 grayscale"
        >
          <div className="absolute inset-0 bg-stone-100" />
          <div className="absolute inset-x-0 bottom-0 flex h-[40%] items-end justify-around px-2">
            {Array.from({ length: 9 }, (_, index) => (
              <span
                key={index}
                className="h-10 w-8 rounded-t-full bg-stone-700"
              />
            ))}
          </div>
          <div className="absolute left-1/2 top-[10%] -translate-x-1/2 scale-150 blur-[1px]">
            <PortraitHead
              character={winner}
              className="h-16 w-16 ring-4 ring-stone-900/60"
            />
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
