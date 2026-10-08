'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import PortraitHead from '@/components/games/PortraitHead';
import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';
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

const LINE_MS = 4400;
const TOTAL_MS = QUOTE_LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
const LEAN_MS = 900;
// The second half of the line is the scream
const SCREAM_MS = QUOTE_LINE_START_MS + 2300;
const SCREAM_END_MS = QUOTE_LINE_START_MS + LINE_MS;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  lean: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0) rotate(0deg)' }],
    [LEAN_MS, { transform: 'translate(0, 0) rotate(0deg)' }],
    [LEAN_MS + 400, { transform: 'translate(10px, 0) rotate(8deg)' }],
    [SCREAM_MS, { transform: 'translate(10px, 0) rotate(8deg)' }],
    [SCREAM_MS + 200, { transform: 'translate(22px, -4px) rotate(12deg)' }],
    [SCREAM_END_MS, { transform: 'translate(22px, -4px) rotate(12deg)' }],
    [SCREAM_END_MS + 500, { transform: 'translate(8px, 2px) rotate(4deg)' }],
    [TOTAL_MS, { transform: 'translate(8px, 2px) rotate(4deg)' }],
  ]),
  'arm-up': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'rotate(60deg)', opacity: 0 }],
    [LEAN_MS, { transform: 'rotate(60deg)', opacity: 0 }],
    [LEAN_MS + 300, { transform: 'rotate(-8deg)', opacity: 1 }],
    [TOTAL_MS, { transform: 'rotate(-8deg)', opacity: 1 }],
  ]),
  jab: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(8px)', offset: 0.35 },
      { transform: 'translateX(0)' },
    ],
    options: { duration: 360, easing: 'ease-out' },
  },
  scream: {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-2px, 1px)', offset: 0.25 },
      { transform: 'translate(2px, -1px)', offset: 0.5 },
      { transform: 'translate(-1px, -2px)', offset: 0.75 },
      { transform: 'translate(0, 0)' },
    ],
    options: { duration: 110, easing: 'linear' },
  },
  'tv-celebrate': {
    keyframes: [
      { transform: 'translateY(0) rotate(-6deg)' },
      { transform: 'translateY(-6px) rotate(6deg)', offset: 0.5 },
      { transform: 'translateY(0) rotate(-6deg)' },
    ],
    options: { duration: 560, iterations: Infinity, easing: 'ease-in-out' },
  },
  'tv-confetti': {
    keyframes: [
      { transform: 'translateY(-8px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1, offset: 0.2 },
      { transform: 'translateY(60px)', opacity: 0.8 },
    ],
    options: { duration: 1400, iterations: Infinity, easing: 'linear' },
  },
  'tv-glow': {
    keyframes: [
      { opacity: 0.7 },
      { opacity: 1 },
      { opacity: 0.6 },
      { opacity: 0.9 },
    ],
    options: { duration: 900, iterations: Infinity, easing: 'linear' },
  },
};

const TV_CONFETTI = [
  { cls: 'left-[12%] bg-amber-300', delay: 0 },
  { cls: 'left-[30%] bg-red-400', delay: -500 },
  { cls: 'left-[70%] bg-sky-300', delay: -900 },
  { cls: 'left-[86%] bg-amber-300', delay: -300 },
];

export default function TvRageScene({
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
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900"
        floor="bg-gradient-to-b from-stone-800 to-stone-900"
      >
        <div
          data-anim="tv-glow"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_45%,rgba(125,211,252,0.18),transparent_60%)]"
        />
        <div className="absolute bottom-[18%] left-[2%] h-[26%] w-[34%] rounded-t-2xl bg-gradient-to-b from-rose-950 to-stone-950">
          <span className="absolute inset-x-[6%] top-[22%] h-[30%] rounded-lg bg-rose-900/60" />
        </div>

        <div className="absolute bottom-[18%] left-[56%] h-[14%] w-[36%] rounded-t-sm bg-gradient-to-b from-stone-700 to-stone-800 shadow-lg" />
        <div className="absolute bottom-[32%] left-[54%] h-[52%] w-[40%] rounded-lg border-4 border-slate-800 bg-slate-950 shadow-[0_0_30px_rgba(125,211,252,0.25)]">
          <div className="absolute inset-1 overflow-hidden rounded-sm bg-gradient-to-b from-blue-900 to-slate-900">
            {TV_CONFETTI.map((piece) => (
              <span
                key={piece.cls}
                data-anim="tv-confetti"
                data-anim-delay={piece.delay}
                className={`absolute top-0 h-1.5 w-1 ${piece.cls}`}
              />
            ))}
            <div
              data-anim="tv-celebrate"
              className="absolute left-1/2 top-[10%] -ml-7"
            >
              <PortraitHead
                character={winner}
                className="h-14 w-14 ring-2 ring-amber-300/80"
              />
              <span className="absolute -right-3 -top-2 text-amber-300">
                <Icon name="trophy" className="h-5 w-5" />
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-1 flex h-4 items-stretch">
              <span className="flex items-center bg-red-600 px-1 text-[7px] font-black uppercase tracking-wider text-slate-50">
                {GAMES_UI.career.quoteCutscene.tvWinner}
              </span>
              <span className="flex min-w-0 flex-1 items-center truncate bg-stone-100 px-1 text-[8px] font-black uppercase text-slate-950">
                {winner.name}
              </span>
            </div>
            <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgba(0,0,0,0.18)_2px,rgba(0,0,0,0.18)_3px)]" />
          </div>
        </div>

        <div
          data-anim="lean"
          className="absolute bottom-[18%] left-[22%] h-[118px] w-24 origin-bottom"
        >
          <span className="absolute bottom-0 left-6 h-8 w-3 rounded-b-md bg-slate-800" />
          <span className="absolute bottom-0 left-11 h-8 w-3 rounded-b-md bg-slate-800" />
          <span className="absolute bottom-7 left-3 h-11 w-[52px] rounded-t-2xl bg-gradient-to-b from-emerald-800 to-emerald-900" />
          <span
            data-anim="arm-up"
            className="absolute bottom-[68px] left-[44px] z-30 h-3 w-12 origin-left rounded-full bg-emerald-800 opacity-0"
          >
            <span
              data-anim={Array.from({ length: 8 }, () => 'jab').join(' ')}
              data-anim-delay={Array.from(
                { length: 8 },
                (_, index) => QUOTE_LINE_START_MS + index * 520,
              ).join(' ')}
              className="absolute -right-3 -top-1 flex items-center"
            >
              <span className="h-4 w-4 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              <span className="-ml-0.5 h-1.5 w-3 rounded-full bg-orange-200" />
            </span>
          </span>
          <SceneActor
            character={lead}
            className="bottom-[68px] left-[8px]"
            anim="talk scream"
            animDelay={`${QUOTE_LINE_START_MS} ${SCREAM_MS}`}
            animIterations={`${TALK_ITERATIONS} ${Math.round((SCREAM_END_MS - SCREAM_MS) / 110)}`}
            pose="origin-bottom"
            size="h-14 w-14 sm:h-16 sm:w-16"
          >
            <span className="absolute -inset-3 -z-10 rounded-full bg-sky-300/20 blur-md" />
          </SceneActor>
        </div>
      </SceneFrame>
    </div>
  );
}
