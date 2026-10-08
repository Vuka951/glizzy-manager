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
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';

const LINE_MS = 2100;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The spoon-bonk cues of this scene's definition land on each swing's
// IMPACT, 1000 + 126 + 280 * n
const HIT_START_MS = 1000;
const HIT_MS = 280;
const HITS = 11;
const HITS_END_MS = HIT_START_MS + HIT_MS * HITS;
const IMPACT = 0.45;

// Easing sits on the segments, not the whole swing, so the spoon, the
// flinch, the star and the bonk cue all meet at IMPACT
const CUSTOM: Record<string, SceneAnimationSpec> = {
  'spoon-swing': {
    keyframes: [
      { rotate: '-50deg', easing: 'ease-in' },
      { rotate: '4deg', offset: IMPACT, easing: 'ease-out' },
      { rotate: '-50deg' },
    ],
    options: { duration: HIT_MS },
  },
  flinch: {
    keyframes: [
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(0) scale(1)', offset: IMPACT - 0.05 },
      {
        transform: 'translateY(7px) rotate(-7deg) scale(1.04, 0.9)',
        offset: IMPACT + 0.05,
        easing: 'ease-out',
      },
      { transform: 'translateY(0) scale(1)' },
    ],
    options: { duration: HIT_MS },
  },
  bonk: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.4)' },
      { opacity: 0, transform: 'scale(0.4)', offset: IMPACT },
      {
        opacity: 1,
        transform: 'scale(1.1)',
        offset: IMPACT + 0.1,
        easing: 'ease-out',
      },
      { opacity: 0, transform: 'scale(1.4)', offset: 0.85 },
      { opacity: 0, transform: 'scale(1.4)' },
    ],
    options: { duration: HIT_MS },
  },
  lean: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(8px)' },
    ],
    options: { duration: 400, easing: 'ease-out', fill: 'both' },
  },
};

const DAZE = ['left-0 top-0', 'right-0 top-1', 'bottom-0 left-1/2'];

export default function SpoonBonkScene({
  speaker,
  other,
}: QuoteSceneProps) {
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
        <div className="absolute inset-x-0 bottom-[40%] flex justify-around px-1">
          {Array.from({ length: 14 }, (_, index) => (
            <span
              key={index}
              className={`h-5 w-7 rounded-t-full bg-slate-800/70 ${index % 2 ? 'mb-2' : ''}`}
            />
          ))}
        </div>
        <span className="absolute inset-x-0 bottom-[40%] h-1 bg-slate-950/80" />
        <div className="absolute left-[14%] top-0 h-[84%] w-[60%] bg-gradient-to-b from-sky-100/15 to-sky-100/0 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />

        <div className="absolute bottom-[18%] left-1/2 h-28 w-64 -translate-x-1/2">
          <SceneActor
            character={loser}
            className="bottom-0 left-[140px]"
            anim="flinch"
            animDelay={HIT_START_MS}
            animIterations={HITS}
            pose="origin-bottom -rotate-6"
            size="h-16 w-16"
          >
            <span className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-orange-200 ring-2 ring-slate-950/60" />
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-orange-200 ring-2 ring-slate-950/60" />
            <span
              data-anim="bonk"
              data-anim-delay={HIT_START_MS}
              data-anim-iterations={HITS}
              className="absolute -top-5 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center opacity-0"
            >
              <span className="absolute h-full w-1 rounded-full bg-amber-200" />
              <span className="absolute h-1 w-full rounded-full bg-amber-200" />
              <span className="absolute h-full w-1 rotate-45 rounded-full bg-amber-300" />
              <span className="absolute h-full w-1 -rotate-45 rounded-full bg-amber-300" />
            </span>
            <span
              data-anim="fade-in spin"
              data-anim-delay={`${HITS_END_MS} ${HITS_END_MS}`}
              className="absolute -top-4 left-1/2 h-6 w-12 -translate-x-1/2 opacity-0"
            >
              {DAZE.map((cls) => (
                <span
                  key={cls}
                  className={`absolute h-1.5 w-1.5 rounded-full bg-amber-300 ${cls}`}
                />
              ))}
            </span>
          </SceneActor>

          <SceneActor
            character={winner}
            className="bottom-[10px] left-0"
            anim="lean talk"
            animDelay={`${HIT_START_MS - 300} ${QUOTE_LINE_START_MS}`}
            animIterations={`1 ${TALK_ITERATIONS}`}
            pose="origin-bottom"
            size="h-20 w-20"
          >
            <span
              data-anim="spotlight"
              data-anim-delay={QUOTE_LINE_START_MS}
              data-anim-duration={LINE_MS}
              className="absolute -inset-3 -z-10 rounded-full bg-sky-100/25 opacity-0 blur-md"
            />
            <div
              data-anim="spoon-swing"
              data-anim-delay={HIT_START_MS}
              data-anim-iterations={HITS}
              className="absolute left-[62px] top-[18px] z-30 h-4 w-[110px] origin-left -translate-y-1/2 -rotate-[50deg]"
            >
              <span className="absolute left-0 top-1/2 h-3 w-[70px] -translate-y-1/2 rounded-full bg-slate-700 ring-1 ring-slate-950/60" />
              <span className="absolute left-[64px] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-orange-200 ring-2 ring-slate-950/60" />
              <svg
                viewBox="0 0 40 14"
                className="absolute left-[74px] top-1/2 h-4 w-9 -translate-y-1/2 drop-shadow"
                aria-hidden="true"
              >
                <rect
                  x="0"
                  y="5.5"
                  width="26"
                  height="3"
                  rx="1.5"
                  className="fill-slate-300"
                />
                <ellipse
                  cx="31"
                  cy="7"
                  rx="8"
                  ry="5.5"
                  className="fill-slate-200"
                />
                <ellipse
                  cx="31"
                  cy="7"
                  rx="5"
                  ry="3"
                  className="fill-slate-400/60"
                />
              </svg>
            </div>
          </SceneActor>
        </div>
      </SceneFrame>
    </div>
  );
}
