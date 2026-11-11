'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import { GAMES_UI } from '@/data/games/locale';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import {
  QUOTE_LINE_START_MS,
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 3600;
const TOTAL_MS = QUOTE_LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The cues of the definition: the locker clang as he sits, one front page
// per lost match fluttering in and slapping onto the bench, and the sting
// when his head goes down
const SLAM_MS = 1100;
const PAPER_AT_MS = 1750;
const PAPER_GAP_MS = 550;
const PAPER_MS = 250;
const DROP_MS = 4200;
const LOCKERS = 7;
const QUOTE = GAMES_UI.career.quoteCutscene;
const OPEN_LOCKER = 0;

type FrontPage = {
  headline: string;
  score: string;
  className: string;
};

const FRONT_PAGES: FrontPage[] = [
  {
    headline: QUOTE.lossStreakPaper,
    score: '0 : 3',
    className: 'bottom-0 right-0 w-[5.5rem] -rotate-3',
  },
  {
    headline: QUOTE.lossStreakPaper,
    score: '1 : 4',
    className: 'bottom-1 right-1 w-[5.5rem] rotate-3',
  },
  {
    headline: QUOTE.lossStreakPaper,
    score: '0 : 2',
    className: 'bottom-2 right-0.5 w-[5.5rem] -rotate-6',
  },
  {
    headline: QUOTE.lossStreakLastPaper,
    score: '0 : 5',
    className: 'bottom-3 right-0 w-[6rem] rotate-[9deg]',
  },
];
const PAPERS = FRONT_PAGES.length;
const HEAVY_LAND_MS = PAPER_AT_MS + PAPER_GAP_MS * (PAPERS - 1) + PAPER_MS;

const paperAt = (index: number) => PAPER_AT_MS + PAPER_GAP_MS * index;
const landAt = (index: number) => paperAt(index) + PAPER_MS;

const paperFly = (overshoot: number): SceneAnimationSpec => ({
  keyframes: [
    { opacity: 0, transform: 'translateY(-64px) rotate(-16deg)' },
    { opacity: 1, transform: 'translateY(-46px) rotate(12deg)', offset: 0.3 },
    { opacity: 1, transform: 'translateY(-22px) rotate(-9deg)', offset: 0.55 },
    { opacity: 1, transform: 'translateY(-6px) rotate(4deg)', offset: 0.78 },
    {
      opacity: 1,
      transform: `translateY(2px) scale(${overshoot})`,
      offset: 0.9,
    },
    { opacity: 1, transform: 'translateY(0) scale(1)' },
  ],
  options: { duration: PAPER_MS, easing: 'ease-in', fill: 'both' },
});

const timeline = (frames: [number, Keyframe][], easing?: string) =>
  sceneTimeline(TOTAL_MS, frames, easing);

const droop = (losses: number) =>
  `rotate(${-6 - losses * 2}deg) translateY(${2 + losses * 2}px)`;

const hand = (side: 1 | -1) => {
  const rest = `translate(0, 0) rotate(${side * 10}deg)`;
  const face = `translate(${side * -9}px, -26px) rotate(${side * 30}deg)`;
  return timeline([
    [0, { transform: rest }],
    [DROP_MS, { transform: rest }],
    [DROP_MS + 320, { transform: face }],
    [TOTAL_MS, { transform: face }],
  ]);
};

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'sit-down': timeline([
    [0, { transform: 'translateY(0)' }],
    [SLAM_MS - 300, { transform: 'translateY(0)' }],
    [SLAM_MS - 180, { transform: 'translateY(-10px)' }],
    [SLAM_MS - 60, { transform: 'translateY(3px)' }],
    [SLAM_MS + 120, { transform: 'translateY(0)' }],
    [TOTAL_MS, { transform: 'translateY(0)' }],
  ]),
  'door-slam': timeline(
    [
      [0, { transform: 'perspective(240px) rotateY(-78deg)' }],
      [SLAM_MS - 260, { transform: 'perspective(240px) rotateY(-78deg)' }],
      [SLAM_MS, { transform: 'perspective(240px) rotateY(0deg)' }],
      [TOTAL_MS, { transform: 'perspective(240px) rotateY(0deg)' }],
    ],
    'ease-in',
  ),
  'rack-shake': timeline(
    [
      [0, { transform: 'translate(0, 0)' }],
      [SLAM_MS, { transform: 'translate(0, 0)' }],
      [SLAM_MS + 50, { transform: 'translate(-3px, 1px)' }],
      [SLAM_MS + 100, { transform: 'translate(3px, -1px)' }],
      [SLAM_MS + 150, { transform: 'translate(-2px, 0)' }],
      [SLAM_MS + 200, { transform: 'translate(1px, 0)' }],
      [SLAM_MS + 260, { transform: 'translate(0, 0)' }],
      [TOTAL_MS, { transform: 'translate(0, 0)' }],
    ],
    'linear',
  ),
  'paper-fly': paperFly(1.08),
  'paper-fly-heavy': paperFly(1.16),
  'pile-thump': timeline([
    [0, { transform: 'scaleY(1)' }],
    ...Array.from({ length: PAPERS }, (_, index): [number, Keyframe][] => {
      const land = landAt(index);
      return [
        [land, { transform: 'scaleY(1)' }],
        [land + 60, { transform: 'scaleY(0.93)' }],
        [land + 200, { transform: 'scaleY(1)' }],
      ];
    }).flat(),
    [TOTAL_MS, { transform: 'scaleY(1)' }],
  ]),
  slump: timeline([
    [0, { transform: 'rotate(-4deg) translateY(0)' }],
    [SLAM_MS, { transform: droop(0) }],
    ...Array.from({ length: PAPERS }, (_, index): [number, Keyframe][] => {
      const land = landAt(index);
      return [
        [land, { transform: droop(index) }],
        [land + 260, { transform: droop(index + 1) }],
      ];
    }).flat(),
    [DROP_MS, { transform: droop(PAPERS) }],
    [DROP_MS + 320, { transform: 'rotate(-24deg) translateY(16px)' }],
    [TOTAL_MS, { transform: 'rotate(-24deg) translateY(16px)' }],
  ]),
  shoulders: timeline([
    [0, { transform: 'scaleY(1)' }],
    [SLAM_MS, { transform: 'scaleY(0.97)' }],
    [DROP_MS, { transform: 'scaleY(0.97)' }],
    [DROP_MS + 320, { transform: 'scaleY(0.88)' }],
    [TOTAL_MS, { transform: 'scaleY(0.88)' }],
  ]),
  'hand-left': hand(-1),
  'hand-right': hand(1),
  'frame-jolt': timeline(
    [
      [0, { transform: 'translate(0, 0)' }],
      [HEAVY_LAND_MS, { transform: 'translate(0, 0)' }],
      [HEAVY_LAND_MS + 40, { transform: 'translate(-5px, 4px)' }],
      [HEAVY_LAND_MS + 90, { transform: 'translate(5px, -3px)' }],
      [HEAVY_LAND_MS + 140, { transform: 'translate(-3px, 2px)' }],
      [HEAVY_LAND_MS + 200, { transform: 'translate(2px, -1px)' }],
      [HEAVY_LAND_MS + 260, { transform: 'translate(0, 0)' }],
      [TOTAL_MS, { transform: 'translate(0, 0)' }],
    ],
    'linear',
  ),
  'lamp-flicker': timeline(
    [
      [0, { opacity: 1 }],
      [DROP_MS, { opacity: 1 }],
      [DROP_MS + 50, { opacity: 0.1 }],
      [DROP_MS + 120, { opacity: 0.9 }],
      [DROP_MS + 190, { opacity: 0.25 }],
      [DROP_MS + 330, { opacity: 1 }],
      [TOTAL_MS, { opacity: 1 }],
    ],
    'linear',
  ),
  dim: timeline([
    [0, { opacity: 0 }],
    [DROP_MS + 300, { opacity: 0 }],
    [DROP_MS + 1100, { opacity: 0.3 }],
    [TOTAL_MS, { opacity: 0.3 }],
  ]),
};

export default function LossStreakScene({ speaker }: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const loser = characterBySlug(speaker);
  useSceneAnimation(root, CUSTOM, [speaker]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor={null}
      >
        <div data-anim="frame-jolt" className="absolute inset-0">
          <div
            data-anim="rack-shake"
            className="absolute inset-x-[2%] bottom-[18%] top-[5%] flex gap-1"
          >
            {Array.from({ length: LOCKERS }, (_, index) => (
              <div
                key={index}
                className="relative flex-1 rounded-t-sm border border-slate-700 bg-slate-950"
              >
                <span className="absolute inset-x-[15%] top-[45%] h-0.5 bg-slate-800" />
                <span
                  data-anim={index === OPEN_LOCKER ? 'door-slam' : undefined}
                  className="absolute inset-0 origin-left rounded-t-sm border-r border-slate-600 bg-gradient-to-b from-slate-700 to-slate-800"
                >
                  <span className="absolute inset-x-[25%] top-[8%] block h-0.5 rounded-full bg-slate-950/70" />
                  <span className="absolute inset-x-[25%] top-[14%] block h-0.5 rounded-full bg-slate-950/70" />
                  <span className="absolute inset-x-[25%] top-[20%] block h-0.5 rounded-full bg-slate-950/70" />
                  <span className="absolute right-[18%] top-[46%] h-3 w-1 rounded-full bg-slate-500" />
                </span>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-[18%] bg-slate-800 shadow-[0_-8px_24px_rgba(2,6,23,0.6)]">
            <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_28px,rgba(2,6,23,0.35)_28px,rgba(2,6,23,0.35)_30px)]" />
          </div>

          <div
            data-anim="sway"
            data-anim-duration={3600}
            className="absolute left-[7%] top-0 h-full w-[48%] origin-top"
          >
            <span className="absolute left-1/2 top-0 h-[9%] w-0.5 -translate-x-1/2 bg-slate-600" />
            <span className="absolute left-1/2 top-[8%] h-5 w-14 -translate-x-1/2 bg-gradient-to-b from-slate-600 to-slate-800 [clip-path:polygon(28%_0,72%_0,100%_100%,0_100%)]" />
            <span
              data-anim="lamp-flicker"
              className="absolute left-1/2 top-[15%] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-amber-100 shadow-[0_0_12px_rgba(254,243,199,0.9)]"
            />
            <span
              data-anim="lamp-flicker"
              className="absolute inset-x-0 top-[16%] h-[66%] bg-gradient-to-b from-amber-200/30 via-amber-200/10 to-amber-200/0 [clip-path:polygon(43%_0,57%_0,100%_100%,0_100%)]"
            />
          </div>
          <span
            data-anim="lamp-flicker"
            className="absolute bottom-[4%] left-[14%] h-[8%] w-[34%] rounded-[50%] bg-amber-200/10 blur-sm"
          />

          <div className="absolute bottom-[18%] left-[12%] z-10 h-10 w-[52%]">
            <span className="absolute inset-x-0 top-0 h-3 rounded-sm bg-gradient-to-b from-amber-700 to-amber-900 shadow-md" />
            <span className="absolute bottom-0 left-3 h-7 w-2 bg-slate-700" />
            <span className="absolute bottom-0 right-3 h-7 w-2 bg-slate-700" />
          </div>

          <div
            data-anim="sit-down"
            className="absolute bottom-[18%] left-[24%] z-20 h-[150px] w-16"
          >
            <span className="absolute bottom-0 left-2.5 h-10 w-4 rounded-b-md bg-slate-900" />
            <span className="absolute bottom-0 right-2.5 h-10 w-4 rounded-b-md bg-slate-900" />
            <span className="absolute bottom-[36px] left-1 h-5 w-14 rounded-md bg-slate-900" />
            <span
              data-anim="shoulders"
              className="absolute bottom-[40px] left-2 h-12 w-12 origin-bottom rounded-t-2xl bg-gradient-to-b from-slate-500 to-slate-700"
            >
              <span className="absolute inset-x-[30%] top-0 h-2 rounded-b-md bg-slate-900/50" />
            </span>
            <SceneActor
              character={loser}
              className="bottom-[82px] left-0"
              anim="slump"
              pose="origin-bottom"
              size="h-14 w-14 sm:h-16 sm:w-16"
            >
              <span
                data-anim="hand-left"
                className="absolute left-[6%] top-[92%] h-3.5 w-4 rounded-full bg-orange-200 ring-1 ring-slate-950/40"
              />
              <span
                data-anim="hand-right"
                className="absolute right-[6%] top-[92%] h-3.5 w-4 rounded-full bg-orange-200 ring-1 ring-slate-950/40"
              />
            </SceneActor>
          </div>

          <div
            data-anim="pile-thump"
            className="absolute bottom-[calc(18%+28px)] right-[34%] z-30 h-24 w-28 origin-bottom"
          >
            {FRONT_PAGES.map((page, index) => (
              <div
                key={page.score}
                className={`absolute origin-bottom ${page.className}`}
              >
                <div
                  data-anim={index === PAPERS - 1 ? 'paper-fly-heavy' : 'paper-fly'}
                  data-anim-delay={paperAt(index)}
                  className="rounded-[2px] bg-amber-50 px-1 pb-1.5 pt-0.5 opacity-0 shadow-[0_4px_10px_rgba(2,6,23,0.7)]"
                >
                  <p className="border-y-2 border-slate-950 text-center text-[6px] font-black uppercase leading-[1.6] tracking-[0.3em] text-slate-950">
                    {QUOTE.paperMasthead}
                  </p>
                  <p className="mt-1 whitespace-nowrap text-center text-[10px] font-black uppercase leading-none text-slate-950">
                    {page.headline}
                  </p>
                  <p className="mt-0.5 text-center text-[11px] font-black leading-none text-red-600">
                    {page.score}
                  </p>
                  <span className="mt-1 block h-px bg-slate-400" />
                  <span className="mt-0.5 block h-px w-[80%] bg-slate-400" />
                  <span className="mt-0.5 block h-px w-[90%] bg-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          data-anim="dim"
          className="absolute inset-0 z-40 bg-slate-950 opacity-0"
        />
      </SceneFrame>
    </div>
  );
}
