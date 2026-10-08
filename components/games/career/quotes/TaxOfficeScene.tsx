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
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 2300;
// Matches the lineStartMs of this scene's definition: he empties his
// pockets first, and the line starts as the stamp comes down
const LINE_START_MS = 3600;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_BEAT_SLOW_MS = TALK_BEAT_MS * 1.4;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_SLOW_MS);
// The coin-clink and stamp-thud cues of the definition land on these
const SACK_MS = 1000;
const GLIZZY_MS = 1600;
const WATCH_MS = 2200;
const POCKETS_MS = 2700;
const STAMP_MS = LINE_START_MS;
const SWEEP_MS = 3950;

const drop = (at: number): SceneAnimationSpec =>
  sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translate(-40px, -24px) rotate(-20deg)' }],
    [
      at - 200,
      { opacity: 0, transform: 'translate(-40px, -24px) rotate(-20deg)' },
    ],
    [
      at - 120,
      { opacity: 1, transform: 'translate(-30px, -20px) rotate(-12deg)' },
    ],
    [at, { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' }],
    [SWEEP_MS, { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' }],
    [
      SWEEP_MS + 450,
      { opacity: 0, transform: 'translate(90px, 0) rotate(0deg)' },
    ],
    [TOTAL_MS, { opacity: 0, transform: 'translate(90px, 0) rotate(0deg)' }],
  ]);

const SHELVES = ['top-[12%]', 'top-[36%]', 'top-[60%]', 'top-[84%]'];

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'drop-sack': drop(SACK_MS),
  'drop-glizzy': drop(GLIZZY_MS),
  'drop-watch': drop(WATCH_MS),
  'give-arm': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'rotate(70deg)' }],
    ...[SACK_MS, GLIZZY_MS, WATCH_MS].flatMap((at): [number, Keyframe][] => [
      [at - 260, { transform: 'rotate(70deg)' }],
      [at - 80, { transform: 'rotate(0deg)' }],
      [at + 120, { transform: 'rotate(0deg)' }],
      [at + 300, { transform: 'rotate(70deg)' }],
    ]),
    [TOTAL_MS, { transform: 'rotate(70deg)' }],
  ]),
  pockets: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scaleY(0)' }],
    [POCKETS_MS, { opacity: 0, transform: 'scaleY(0)' }],
    [POCKETS_MS + 150, { opacity: 1, transform: 'scaleY(1.2)' }],
    [POCKETS_MS + 300, { opacity: 1, transform: 'scaleY(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scaleY(1)' }],
  ]),
  count: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(6deg) translateY(2px)', offset: 0.5 },
      { transform: 'rotate(0deg)' },
    ],
    options: { duration: 380, iterations: 6, easing: 'ease-in-out' },
  },
  stamp: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0)' }],
    [STAMP_MS - 400, { transform: 'translateY(0)' }],
    [STAMP_MS - 120, { transform: 'translateY(-26px)' }],
    [STAMP_MS, { transform: 'translateY(4px)' }],
    [STAMP_MS + 250, { transform: 'translateY(0)' }],
    [TOTAL_MS, { transform: 'translateY(0)' }],
  ]),
  'stamp-mark': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scale(1.4) rotate(-12deg)' }],
    [STAMP_MS, { opacity: 0, transform: 'scale(1.4) rotate(-12deg)' }],
    [STAMP_MS + 60, { opacity: 1, transform: 'scale(1) rotate(-12deg)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scale(1) rotate(-12deg)' }],
  ]),
  drawer: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0)' }],
    [SWEEP_MS - 200, { transform: 'translateY(0)' }],
    [SWEEP_MS, { transform: 'translateY(8px)' }],
    [SWEEP_MS + 500, { transform: 'translateY(8px)' }],
    [SWEEP_MS + 700, { transform: 'translateY(0)' }],
    [TOTAL_MS, { transform: 'translateY(0)' }],
  ]),
  deflate: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0) rotate(0deg)' }],
    [POCKETS_MS, { transform: 'translateY(0) rotate(0deg)' }],
    [POCKETS_MS + 500, { transform: 'translateY(4px) rotate(-6deg)' }],
    [TOTAL_MS, { transform: 'translateY(4px) rotate(-6deg)' }],
  ]),
  'slow-talk': {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-1.5px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: TALK_BEAT_SLOW_MS, easing: 'ease-in-out' },
  },
};

export default function TaxOfficeScene({
  speaker,
  other,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const inspector = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-stone-800 via-stone-800 to-stone-700"
        floor="bg-gradient-to-b from-stone-600 to-stone-700"
      >
        <div className="absolute inset-x-0 top-0 h-[82%] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_24px,rgba(28,25,23,0.18)_24px,rgba(28,25,23,0.18)_26px)]" />
        <div className="absolute left-[40%] top-[8%] h-[30%] w-[44%] rounded-sm border-2 border-stone-600 bg-stone-900/60">
          {SHELVES.map((cls) => (
            <span
              key={cls}
              className={`absolute inset-x-2 h-2 rounded-sm bg-[repeating-linear-gradient(90deg,#78716c_0,#78716c_8px,#a8a29e_8px,#a8a29e_10px,#44403c_10px,#44403c_14px)] ${cls}`}
            />
          ))}
        </div>
        <div className="absolute left-[70%] top-[4%] h-[16%] w-[1px] bg-stone-950">
          <span className="absolute -bottom-2 left-1/2 h-3 w-7 -translate-x-1/2 rounded-t-full bg-emerald-800 shadow-[0_6px_16px_4px_rgba(254,240,138,0.2)]" />
        </div>

        <SceneActor
          character={inspector}
          className="bottom-[40%] left-[62%]"
          anim="count"
          animDelay={SACK_MS}
          pose="origin-bottom"
          size="h-14 w-14 sm:h-16 sm:w-16"
        >
          <span className="absolute left-1/2 top-[calc(100%-4px)] -z-10 h-6 w-12 -translate-x-1/2 rounded-t-2xl bg-slate-700" />
          <span className="absolute left-[18%] top-[34%] z-10 flex h-3 w-[64%] gap-1">
            <span className="h-full flex-1 rounded-full border-2 border-slate-900" />
            <span className="h-full flex-1 rounded-full border-2 border-slate-900" />
          </span>
        </SceneActor>

        <div className="absolute bottom-[18%] left-[36%] z-30 h-[22%] w-[58%]">
          <span className="absolute inset-x-0 top-0 h-3 rounded-sm bg-gradient-to-b from-amber-800 to-amber-900 shadow-lg" />
          <span className="absolute inset-x-[2%] bottom-0 top-3 bg-gradient-to-b from-amber-900 to-amber-950" />
          <span
            data-anim="drawer"
            className="absolute right-[8%] top-[34%] h-[30%] w-[32%] rounded-sm border border-amber-950 bg-amber-800"
          >
            <span className="absolute left-1/2 top-1/2 h-1 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300" />
          </span>

          <span className="absolute -top-2 left-[58%] h-2.5 w-[30%] rounded-[1px] bg-stone-100 shadow">
            <span className="absolute inset-y-0 left-1/2 w-px bg-stone-400" />
            <span
              data-anim="stamp-mark"
              className="absolute right-1 top-0 h-2 w-4 rounded-[2px] border border-red-600 opacity-0"
            />
          </span>
          <span
            data-anim="stamp"
            className="absolute -top-6 left-[80%] h-5 w-3"
          >
            <span className="absolute left-0.5 top-0 h-3 w-2 rounded-t-full bg-amber-900" />
            <span className="absolute bottom-0 left-0 h-2 w-3 rounded-sm bg-red-700" />
          </span>

          <span
            data-anim="drop-sack"
            className="absolute -top-6 left-[6%] h-6 w-6 rounded-b-full rounded-t-[40%] bg-amber-700 opacity-0 shadow"
          >
            <span className="absolute -top-1 left-1/2 h-2 w-3 -translate-x-1/2 rounded-t-sm bg-amber-800" />
            <span className="absolute bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-300" />
          </span>
          <span
            data-anim="drop-glizzy"
            className="absolute -top-6 left-[22%] flex flex-col opacity-0"
          >
            <GlizzyIcon variant={0} className="-mb-2 h-4 w-7" />
            <GlizzyIcon variant={1} className="-mb-2 h-4 w-7" />
            <GlizzyIcon variant={2} className="h-4 w-7" />
          </span>
          <span
            data-anim="drop-watch"
            className="absolute -top-3 left-[40%] h-3 w-6 rounded-full bg-slate-700 opacity-0"
          >
            <span className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300 bg-stone-100" />
          </span>
        </div>

        <div className="absolute bottom-[18%] left-[10%] z-20 h-[120px] w-16">
          <div data-anim="deflate" className="absolute inset-0 origin-bottom">
            <span className="absolute bottom-0 left-3 h-9 w-3.5 rounded-b-md bg-slate-700" />
            <span className="absolute bottom-0 right-3 h-9 w-3.5 rounded-b-md bg-slate-700" />
            <span className="absolute bottom-8 left-1 h-10 w-14 rounded-t-2xl bg-gradient-to-b from-sky-800 to-sky-900" />
            <span
              data-anim="pockets"
              className="absolute bottom-7 left-0 h-3 w-3 origin-top rounded-b-md bg-stone-100 opacity-0"
            />
            <span
              data-anim="pockets"
              className="absolute bottom-7 right-0 h-3 w-3 origin-top rounded-b-md bg-stone-100 opacity-0"
            />
            <span
              data-anim="give-arm"
              className="absolute bottom-[62px] left-[46px] z-30 h-3 w-10 origin-left rounded-full bg-sky-800"
            >
              <span className="absolute -right-1 -top-0.5 h-4 w-4 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
            </span>
            <SceneActor
              character={lead}
              className="bottom-[68px] left-1"
              anim="slow-talk"
              animDelay={LINE_START_MS}
              animIterations={TALK_ITERATIONS}
              pose="origin-bottom saturate-50"
              size="h-14 w-14"
            >
              <span
                data-anim="spotlight"
                data-anim-delay={LINE_START_MS}
                data-anim-duration={LINE_MS}
                className="absolute -inset-3 -z-10 rounded-full bg-amber-100/20 opacity-0 blur-md"
              />
            </SceneActor>
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
