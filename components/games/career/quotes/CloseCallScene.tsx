'use client';

import { useRef } from 'react';
import XEyes from '@/components/games/career/quotes/XEyes';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import { GAMES_UI } from '@/data/games/locale';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import {
  QUOTE_LINE_START_MS,
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 3800;
const TOTAL_MS = QUOTE_LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The drum-roll, gasp and cheer cues of the definition land on these, the
// body thud on the floor at FALL_MS + 520
const ROLL_MS = 900;
const GASP_MS = 2500;
const FALL_MS = 2900;
const CHEER_MS = 3400;
const SHAKE_ITERATIONS = Math.floor((FALL_MS - ROLL_MS) / 320);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'winner-sway': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'rotate(0deg)' }],
    [500, { transform: 'rotate(-2deg)' }],
    [1000, { transform: 'rotate(2deg)' }],
    [1500, { transform: 'rotate(-2deg)' }],
    [2000, { transform: 'rotate(2deg)' }],
    [GASP_MS, { transform: 'rotate(-2deg)' }],
    [FALL_MS, { transform: 'rotate(1deg)' }],
    [CHEER_MS, { transform: 'rotate(0deg)' }],
    [TOTAL_MS, { transform: 'rotate(0deg)' }],
  ]),
  'winner-head': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'rotate(0deg) translateY(0)' }],
    [FALL_MS, { transform: 'rotate(0deg) translateY(0)' }],
    [FALL_MS + 80, { transform: 'rotate(10deg) translateY(4px)' }],
    [FALL_MS + 250, { transform: 'rotate(4deg) translateY(1px)' }],
    [CHEER_MS, { transform: 'rotate(0deg) translateY(0)' }],
    [CHEER_MS + 250, { transform: 'rotate(-10deg) translateY(-3px)' }],
    [CHEER_MS + 700, { transform: 'rotate(-4deg) translateY(-1px)' }],
    [TOTAL_MS, { transform: 'rotate(-4deg) translateY(-1px)' }],
  ]),
  'glizzy-lift': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0)' }],
    [ROLL_MS, { transform: 'translate(0, 0)' }],
    [ROLL_MS + 350, { transform: 'translate(-6px, -30px)' }],
    [FALL_MS, { transform: 'translate(-6px, -30px)' }],
    [FALL_MS + 80, { transform: 'translate(-16px, -24px)' }],
    [FALL_MS + 250, { transform: 'translate(-8px, -28px)' }],
    [CHEER_MS, { transform: 'translate(-8px, -28px)' }],
    [CHEER_MS + 400, { transform: 'translate(-2px, -4px)' }],
    [TOTAL_MS, { transform: 'translate(-2px, -4px)' }],
  ]),
  'glizzy-bite': sceneTimeline(TOTAL_MS, [
    [0, { clipPath: 'inset(0 0 0 0)' }],
    [FALL_MS + 60, { clipPath: 'inset(0 0 0 0)' }],
    [FALL_MS + 120, { clipPath: 'inset(0 0 0 55%)' }],
    [TOTAL_MS, { clipPath: 'inset(0 0 0 55%)' }],
  ]),
  'brow-wipe': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0)' }],
    [CHEER_MS, { transform: 'translate(0, 0)' }],
    [CHEER_MS + 250, { transform: 'translate(-34px, -46px)' }],
    [CHEER_MS + 550, { transform: 'translate(8px, -50px)' }],
    [CHEER_MS + 850, { transform: 'translate(22px, -38px)' }],
    [CHEER_MS + 1300, { transform: 'translate(0, 0)' }],
    [TOTAL_MS, { transform: 'translate(0, 0)' }],
  ]),
  exhale: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translate(0, 0) scale(0.4)' }],
    [CHEER_MS, { opacity: 0, transform: 'translate(0, 0) scale(0.4)' }],
    [
      CHEER_MS + 200,
      { opacity: 0.8, transform: 'translate(8px, -4px) scale(1)' },
    ],
    [
      CHEER_MS + 800,
      { opacity: 0, transform: 'translate(24px, -14px) scale(1.6)' },
    ],
    [
      TOTAL_MS,
      { opacity: 0, transform: 'translate(24px, -14px) scale(1.6)' },
    ],
  ]),
  'loser-sway': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'rotate(0deg)' }],
    [400, { transform: 'rotate(-3deg)' }],
    [800, { transform: 'rotate(3deg)' }],
    [1200, { transform: 'rotate(-5deg)' }],
    [1600, { transform: 'rotate(5deg)' }],
    [2000, { transform: 'rotate(-7deg)' }],
    [2400, { transform: 'rotate(7deg)' }],
    [GASP_MS, { transform: 'rotate(-13deg)' }],
    [GASP_MS + 150, { transform: 'rotate(11deg)' }],
    [GASP_MS + 300, { transform: 'rotate(-15deg)' }],
    [FALL_MS, { transform: 'rotate(4deg)' }],
    [TOTAL_MS, { transform: 'rotate(4deg)' }],
  ]),
  'loser-topple': sceneTimeline(
    TOTAL_MS,
    [
      [0, { transform: 'translate(0, 0) rotate(0deg)' }],
      [FALL_MS, { transform: 'translate(0, 0) rotate(0deg)' }],
      [FALL_MS + 200, { transform: 'translate(-20px, 2px) rotate(28deg)' }],
      [
        FALL_MS + 520,
        { transform: 'translate(-74px, 60px) rotate(86deg)' },
      ],
      [
        FALL_MS + 660,
        { transform: 'translate(-72px, 58px) rotate(82deg)' },
      ],
      [TOTAL_MS, { transform: 'translate(-72px, 58px) rotate(82deg)' }],
    ],
    'ease-in',
  ),
  'loser-x': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [FALL_MS + 60, { opacity: 0 }],
    [FALL_MS + 160, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'sick-tint': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0.2 }],
    [ROLL_MS, { opacity: 0.3 }],
    [GASP_MS, { opacity: 0.6 }],
    [TOTAL_MS, { opacity: 0.6 }],
  ]),
  cheeks: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scale(0.4)' }],
    [GASP_MS - 100, { opacity: 0, transform: 'scale(0.4)' }],
    [GASP_MS + 120, { opacity: 1, transform: 'scale(1.3)' }],
    [FALL_MS + 300, { opacity: 1, transform: 'scale(1.3)' }],
    [FALL_MS + 500, { opacity: 0, transform: 'scale(0.6)' }],
    [TOTAL_MS, { opacity: 0, transform: 'scale(0.6)' }],
  ]),
  'crowd-jump': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0)' }],
    [CHEER_MS, { transform: 'translateY(0)' }],
    [CHEER_MS + 150, { transform: 'translateY(-6px)' }],
    [CHEER_MS + 300, { transform: 'translateY(0)' }],
    [CHEER_MS + 450, { transform: 'translateY(-5px)' }],
    [CHEER_MS + 600, { transform: 'translateY(0)' }],
    [CHEER_MS + 750, { transform: 'translateY(-4px)' }],
    [CHEER_MS + 900, { transform: 'translateY(0)' }],
    [TOTAL_MS, { transform: 'translateY(0)' }],
  ]),
  'score-old': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 1, transform: 'translateY(0)' }],
    [CHEER_MS, { opacity: 1, transform: 'translateY(0)' }],
    [CHEER_MS + 160, { opacity: 0, transform: 'translateY(-6px)' }],
    [TOTAL_MS, { opacity: 0, transform: 'translateY(-6px)' }],
  ]),
  'score-new': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translateY(6px) scale(1)' }],
    [CHEER_MS + 60, { opacity: 0, transform: 'translateY(6px) scale(1)' }],
    [
      CHEER_MS + 260,
      { opacity: 1, transform: 'translateY(0) scale(1.25)' },
    ],
    [CHEER_MS + 500, { opacity: 1, transform: 'translateY(0) scale(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'translateY(0) scale(1)' }],
  ]),
  confetti: {
    keyframes: [
      { transform: 'translateY(-20px) rotate(0deg)', opacity: 0 },
      {
        transform: 'translateY(10px) rotate(120deg)',
        opacity: 1,
        offset: 0.12,
      },
      { transform: 'translateY(210px) rotate(580deg)', opacity: 0.9 },
    ],
    options: { duration: 2400, easing: 'linear', fill: 'both' },
  },
};

const CROWD = Array.from({ length: 14 }, (_, index) => index);

const CONFETTI = [
  { cls: 'left-[6%] bg-amber-300', delay: 0 },
  { cls: 'left-[14%] bg-red-400', delay: 180 },
  { cls: 'left-[23%] bg-sky-300', delay: 60 },
  { cls: 'left-[31%] bg-amber-300', delay: 300 },
  { cls: 'left-[39%] bg-cyan-200', delay: 120 },
  { cls: 'left-[47%] bg-red-400', delay: 240 },
];

const SWEAT = [
  { cls: '-right-1 top-2', delay: ROLL_MS, iterations: 2 },
  { cls: 'right-1 -top-1', delay: ROLL_MS + 400, iterations: 1 },
  { cls: '-left-1 top-3', delay: ROLL_MS + 800, iterations: 1 },
];

const SMEARS = [
  'left-[34%] bg-red-500',
  'left-[41%] bg-yellow-400',
  'left-[58%] bg-amber-500',
  'left-[63%] bg-red-500',
];

export default function CloseCallScene({ speaker, other }: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const winner = characterBySlug(speaker);
  const loser = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor="bg-slate-800"
      >
        <div
          data-anim="crowd-jump"
          className="absolute inset-x-0 bottom-[46%] flex justify-around px-1"
        >
          {CROWD.map((index) => (
            <span
              key={index}
              className={`h-5 w-7 rounded-t-full bg-slate-800/70 ${index % 2 ? 'mb-2' : ''}`}
            />
          ))}
        </div>
        <div className="absolute left-[25%] top-0 h-[84%] w-[50%] bg-gradient-to-b from-amber-200/20 to-amber-200/0 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />

        {CONFETTI.map((piece) => (
          <span
            key={piece.cls}
            data-anim="confetti"
            data-anim-delay={CHEER_MS + piece.delay}
            className={`absolute top-0 z-40 h-2 w-1 rounded-[1px] opacity-0 ${piece.cls}`}
          />
        ))}

        <div className="absolute left-1/2 top-2 z-40 flex -translate-x-1/2 flex-col items-center rounded-md bg-slate-950/85 px-2 py-1 ring-1 ring-slate-700 sm:top-3">
          <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {GAMES_UI.career.quoteCutscene.closeCallLives}
          </span>
          <span className="relative h-4 w-9 text-center text-sm font-black leading-4 tracking-wider text-slate-100">
            <span data-anim="score-old" className="absolute inset-0">
              1 : 1
            </span>
            <span data-anim="score-new" className="absolute inset-0 opacity-0">
              <span className="text-amber-300">1</span> :{' '}
              <span className="text-red-300">0</span>
            </span>
          </span>
        </div>

        <div className="absolute bottom-[18%] left-[20%] z-20 h-[24%] w-[54%]">
          <span className="absolute inset-x-0 top-0 h-2 rounded-sm bg-amber-800" />
          <span className="absolute inset-x-1 bottom-0 top-2 bg-gradient-to-b from-red-800 to-red-950 [clip-path:polygon(0_0,100%_0,97%_100%,3%_100%)]">
            <span className="absolute inset-x-0 top-1 h-1 bg-amber-300/70" />
          </span>
        </div>
        {SMEARS.map((cls) => (
          <span
            key={cls}
            className={`absolute bottom-[42%] z-20 h-1 w-1.5 rounded-full ${cls}`}
          />
        ))}
        {['left-[36%]', 'left-[56%]'].map((cls) => (
          <div
            key={cls}
            className={`absolute bottom-[42%] z-20 flex w-9 flex-col-reverse items-center ${cls}`}
          >
            {[0, 1, -1, 0, 1].map((shift, index) => (
              <span
                key={index}
                className={`-mt-0.5 h-1 w-8 shrink-0 rounded-[50%] bg-stone-100 ring-1 ring-stone-400 ${shift > 0 ? 'translate-x-0.5' : shift < 0 ? '-translate-x-0.5' : ''}`}
              />
            ))}
          </div>
        ))}

        <div className="absolute bottom-[42%] left-[4%] z-30 h-16 w-24">
          <span className="absolute bottom-[-30px] left-0 h-[46px] w-2.5 rounded-t-sm bg-slate-700" />
          <span className="absolute bottom-[-30px] left-0 h-2 w-11 bg-slate-600" />
          <span className="absolute bottom-[-60px] left-0.5 h-[30px] w-1.5 bg-slate-700" />
          <span className="absolute bottom-[-60px] left-[38px] h-[30px] w-1.5 bg-slate-700" />
          <span className="absolute bottom-[-28px] left-[26px] h-4 w-8 rounded-r-md bg-slate-800" />
          <span className="absolute bottom-[-60px] left-[32px] h-8 w-3 bg-slate-800" />
          <span className="absolute bottom-[-3px] left-[72px] h-2 w-10 rounded-[50%] bg-stone-50 ring-1 ring-stone-300" />

          <div
            data-anim="winner-sway"
            className="absolute inset-0 origin-bottom"
          >
            <span className="absolute bottom-[-26px] left-[6px] h-12 w-14 rounded-t-2xl bg-gradient-to-b from-red-700 to-red-900" />
            <span
              data-anim="breathe"
              className="absolute bottom-[-20px] left-[30px] h-8 w-9 rounded-full bg-red-800"
            />
            <SceneActor
              character={winner}
              className="bottom-[14px] left-[10px]"
              anim="winner-head"
              pose="origin-bottom"
              size="h-12 w-12 sm:h-14 sm:w-14"
            >
              <span
                data-anim="spotlight"
                data-anim-delay={CHEER_MS}
                data-anim-duration={TOTAL_MS - CHEER_MS}
                className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
              />
              {SWEAT.map((drop) => (
                <span
                  key={drop.cls}
                  data-anim="drip"
                  data-anim-delay={drop.delay}
                  data-anim-iterations={drop.iterations}
                  className={`absolute z-20 h-2 w-1.5 rounded-full bg-sky-200/90 opacity-0 ${drop.cls}`}
                />
              ))}
            </SceneActor>
            <span
              data-anim="exhale"
              className="absolute bottom-[22px] left-[58px] z-30 h-3 w-5 rounded-full bg-slate-200/50 opacity-0 blur-[1px]"
            />
            <span
              data-anim="spark-out"
              data-anim-delay={CHEER_MS + 550}
              className="absolute bottom-[54px] left-[56px] z-30 h-2 w-1.5 rounded-full bg-sky-200/90 opacity-0"
            />
            <span
              data-anim="spark-out"
              data-anim-delay={CHEER_MS + 200}
              className="absolute bottom-[60px] left-[20px] z-30 h-2.5 w-2.5 bg-amber-100 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
            />
            <span
              data-anim="spark-out"
              data-anim-delay={CHEER_MS + 450}
              className="absolute bottom-[50px] left-[66px] z-30 h-2 w-2 bg-amber-100 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
            />
            <span
              data-anim="brow-wipe"
              className="absolute bottom-[2px] left-[44px] z-30 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40"
            />
            <span
              data-anim="glizzy-lift shake"
              data-anim-delay={`0 ${ROLL_MS}`}
              data-anim-iterations={`1 ${SHAKE_ITERATIONS}`}
              className="absolute bottom-0 left-[74px] z-30 flex items-end"
            >
              <span data-anim="glizzy-bite" className="-mr-1">
                <GlizzyIcon variant={0} className="h-4 w-7" />
              </span>
              <span className="h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
            </span>
          </div>
        </div>

        <div className="absolute bottom-[42%] right-[6%] z-30 h-16 w-24">
          <span className="absolute bottom-[-3px] right-[72px] h-2 w-10 rounded-[50%] bg-stone-50 ring-1 ring-stone-300">
            <span className="absolute left-3 top-0.5 h-0.5 w-2 rounded-full bg-red-500/80" />
          </span>
        </div>
        <div
          data-anim="loser-topple"
          className="absolute bottom-[42%] right-[6%] z-30 h-16 w-24 origin-bottom-right"
        >
          <span className="absolute bottom-[-30px] right-0 h-[46px] w-2.5 rounded-t-sm bg-slate-700" />
          <span className="absolute bottom-[-30px] right-0 h-2 w-11 bg-slate-600" />
          <span className="absolute bottom-[-60px] right-0.5 h-[30px] w-1.5 bg-slate-700" />
          <span className="absolute bottom-[-60px] right-[38px] h-[30px] w-1.5 bg-slate-700" />
          <span className="absolute bottom-[-28px] right-[26px] h-4 w-8 rounded-l-md bg-slate-800" />
          <span className="absolute bottom-[-60px] right-[32px] h-8 w-3 bg-slate-800" />

          <div
            data-anim="loser-sway"
            className="absolute inset-0 origin-bottom"
          >
            <span className="absolute bottom-[-26px] right-[6px] h-12 w-14 rounded-t-2xl bg-gradient-to-b from-amber-700 to-amber-900" />
            <span
              data-anim="breathe"
              className="absolute bottom-[-20px] right-[30px] h-8 w-9 rounded-full bg-amber-800"
            />
            <span className="absolute bottom-[-10px] right-[62px] z-30 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
            <span className="absolute bottom-[2px] right-[72px] z-30 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
            <SceneActor
              character={loser}
              className="bottom-[14px] right-[10px]"
              pose="origin-bottom saturate-75"
              size="h-12 w-12 sm:h-14 sm:w-14"
            >
              <span
                data-anim="sick-tint"
                className="absolute inset-0 rounded-full bg-emerald-500 opacity-0 mix-blend-multiply"
              />
              <span
                data-anim="cheeks"
                className="absolute bottom-[22%] left-[14%] h-2.5 w-3 rounded-full bg-rose-400/70 opacity-0 blur-[1px]"
              />
              <span
                data-anim="cheeks"
                className="absolute bottom-[22%] right-[14%] h-2.5 w-3 rounded-full bg-rose-400/70 opacity-0 blur-[1px]"
              />
              <XEyes anim="loser-x" />
            </SceneActor>
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
