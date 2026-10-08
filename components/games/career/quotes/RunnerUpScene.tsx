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
  QUOTE_LINE_START_MS,
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 6000;
const TOTAL_MS = QUOTE_LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
const hand = (side: 1 | -1) => {
  const spread = `translate(${side * 16}px, -12px) rotate(${side * 24}deg)`;
  return sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translate(0, 12px) rotate(0deg)' }],
    [4800, { opacity: 0, transform: 'translate(0, 12px) rotate(0deg)' }],
    [5100, { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' }],
    [6500, { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' }],
    [6850, { opacity: 1, transform: spread }],
    [TOTAL_MS, { opacity: 1, transform: spread }],
  ]);
};

const CUSTOM: Record<string, SceneAnimationSpec> = {
  wander: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0)' }],
    [1000, { transform: 'translate(0, 0)' }],
    [1450, { transform: 'translate(14px, -4px)' }],
    [1900, { transform: 'translate(28px, 0)' }],
    [2300, { transform: 'translate(28px, 0)' }],
    [2750, { transform: 'translate(30px, 26px)' }],
    [4250, { transform: 'translate(30px, 26px)' }],
    [4650, { transform: 'translate(24px, -2px)' }],
    [5000, { transform: 'translate(18px, 0)' }],
    [TOTAL_MS, { transform: 'translate(18px, 0)' }],
  ]),
  'hang-head': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'rotate(-4deg)' }],
    [2300, { transform: 'rotate(-4deg)' }],
    [2750, { transform: 'rotate(-10deg) translateY(2px)' }],
    [4250, { transform: 'rotate(-10deg) translateY(2px)' }],
    [5000, { transform: 'rotate(9deg) translateY(4px)' }],
    [6500, { transform: 'rotate(9deg) translateY(4px)' }],
    [6900, { transform: 'rotate(0deg) translateY(-2px)' }],
    [TOTAL_MS, { transform: 'rotate(0deg) translateY(-2px)' }],
  ]),
  'hand-left': hand(-1),
  'hand-right': hand(1),
  celebrate: {
    keyframes: [
      { transform: 'translateY(0) rotate(-7deg)' },
      { transform: 'translateY(-16px) rotate(7deg)', offset: 0.5 },
      { transform: 'translateY(0) rotate(-7deg)' },
    ],
    options: { duration: 620, iterations: Infinity, easing: 'ease-in-out' },
  },
  pump: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 620, iterations: Infinity, easing: 'ease-in-out' },
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
    options: { duration: 2300, iterations: Infinity, easing: 'linear' },
  },
};

const CONFETTI = [
  { cls: 'right-[4%] bg-amber-300', delay: 0 },
  { cls: 'right-[10%] bg-red-400', delay: -700 },
  { cls: 'right-[16%] bg-sky-300', delay: -1500 },
  { cls: 'right-[22%] bg-amber-300', delay: -300 },
  { cls: 'right-[28%] bg-cyan-200', delay: -1900 },
  { cls: 'right-[7%] bg-sky-300', delay: -1100 },
  { cls: 'right-[19%] bg-red-400', delay: -2100 },
  { cls: 'right-[25%] bg-amber-300', delay: -900 },
  { cls: 'right-[13%] bg-cyan-200', delay: -1700 },
  { cls: 'right-[31%] bg-red-400', delay: -500 },
];

const CROWD = [
  'left-[2%]',
  'left-[9%]',
  'left-[16%]',
  'left-[23%]',
  'left-[30%]',
  'left-[37%]',
  'left-[44%]',
  'left-[51%]',
  'left-[58%]',
  'left-[65%]',
  'left-[72%]',
  'left-[79%]',
  'left-[86%]',
  'left-[93%]',
];

export default function RunnerUpScene({
  speaker,
  other,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const loser = characterBySlug(speaker);
  const winner = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor="bg-slate-800"
      >
        {CROWD.map((cls, index) => (
          <span
            key={cls}
            className={`absolute h-5 w-7 rounded-t-full bg-slate-800/70 ${cls} ${index % 2 ? 'bottom-[47%]' : 'bottom-[44%]'}`}
          />
        ))}
        <span className="absolute inset-x-0 bottom-[40%] h-1 bg-slate-950/80" />

        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-amber-300/15 via-amber-300/5 to-transparent" />
        <div className="absolute left-[6%] top-0 h-[84%] w-[36%] bg-gradient-to-b from-sky-100/15 to-sky-100/0 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />

        <div className="absolute bottom-[18%] left-[calc(16%+6px)] z-10 h-6 w-28 sm:w-32">
          <span className="absolute inset-x-0 top-0 h-2 rounded-sm bg-slate-600 shadow" />
          <span className="absolute bottom-0 left-2 h-4 w-1.5 bg-slate-700" />
          <span className="absolute bottom-0 right-2 h-4 w-1.5 bg-slate-700" />
        </div>

        {CONFETTI.map((piece) => (
          <span
            key={piece.cls}
            data-anim="confetti"
            data-anim-delay={piece.delay}
            className={`absolute top-0 z-10 h-2 w-1 rounded-[1px] ${piece.cls}`}
          />
        ))}

        <SceneActor
          character={winner}
          className="bottom-[22%] right-[8%]"
          anim="celebrate"
          size="h-16 w-16 sm:h-20 sm:w-20"
        >
          <span
            data-anim="pump"
            className="absolute -left-3 -top-2 h-4 w-4 rounded-full bg-orange-200 ring-2 ring-slate-950/60"
          />
          <span
            data-anim="pump"
            data-anim-delay={310}
            className="absolute -right-3 -top-2 h-4 w-4 rounded-full bg-orange-200 ring-2 ring-slate-950/60"
          />
        </SceneActor>

        <SceneActor
          character={loser}
          className="bottom-[22%] left-[16%]"
          anim="wander hang-head talk"
          animDelay={`0 0 ${QUOTE_LINE_START_MS}`}
          animIterations={`1 1 ${TALK_ITERATIONS}`}
          pose="origin-bottom saturate-50"
        >
          <span
            data-anim="spotlight"
            data-anim-delay={QUOTE_LINE_START_MS}
            data-anim-duration={LINE_MS}
            className="absolute -inset-3 -z-10 rounded-full bg-sky-100/25 opacity-0 blur-md"
          />
          <span
            data-anim="hand-left"
            className="absolute -bottom-1 left-[18%] h-3 w-5 rounded-full bg-orange-200 opacity-0 ring-2 ring-slate-950/60"
          />
          <span
            data-anim="hand-right"
            className="absolute -bottom-1 right-[18%] h-3 w-5 rounded-full bg-orange-200 opacity-0 ring-2 ring-slate-950/60"
          />
        </SceneActor>
      </SceneFrame>
    </div>
  );
}
