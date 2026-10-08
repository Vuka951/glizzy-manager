'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const SWING_MS = 2600;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  pendulum: {
    keyframes: [
      { transform: 'rotate(-22deg)' },
      { transform: 'rotate(22deg)' },
      { transform: 'rotate(-22deg)' },
    ],
    options: {
      duration: SWING_MS,
      iterations: Infinity,
      easing: 'ease-in-out',
    },
  },
  // Eyes on the glizzy: the head tracks the swing a hair behind it
  track: {
    keyframes: [
      { transform: 'rotate(-7deg)' },
      { transform: 'rotate(7deg)' },
      { transform: 'rotate(-7deg)' },
    ],
    options: {
      duration: SWING_MS,
      iterations: Infinity,
      easing: 'ease-in-out',
      delay: 120,
    },
  },
  ripple: {
    keyframes: [
      { transform: 'scale(0.5)', opacity: 0.8 },
      { transform: 'scale(1.7)', opacity: 0 },
    ],
    options: { duration: 1500, iterations: Infinity, easing: 'ease-out' },
  },
  growl: {
    keyframes: [
      { transform: 'translate(0, 0)', offset: 0 },
      { transform: 'translate(0, 0)', offset: 0.7 },
      { transform: 'translate(-2px, 1px)', offset: 0.75 },
      { transform: 'translate(2px, -1px)', offset: 0.8 },
      { transform: 'translate(-2px, 0)', offset: 0.85 },
      { transform: 'translate(2px, 1px)', offset: 0.9 },
      { transform: 'translate(0, 0)', offset: 1 },
    ],
    options: { duration: 3000, iterations: Infinity, easing: 'linear' },
  },
  'appetite-up': {
    keyframes: [{ transform: 'scaleY(0.2)' }, { transform: 'scaleY(1)' }],
    options: { duration: 7000, easing: 'ease-in-out', fill: 'both' },
  },
};

export default function FastScene({ character }: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800"
        floor="bg-slate-800"
      >
        {/* the kitchen tiles */}
        <div className="absolute inset-x-0 top-0 h-[55%] bg-[repeating-linear-gradient(0deg,transparent_0,transparent_22px,rgba(148,163,184,0.08)_22px,rgba(148,163,184,0.08)_24px),repeating-linear-gradient(90deg,transparent_0,transparent_22px,rgba(148,163,184,0.08)_22px,rgba(148,163,184,0.08)_24px)]" />

        {/* appetite gauge */}
        <div className="absolute left-3 top-3 flex items-end gap-1.5">
          <div className="flex h-20 w-3 flex-col justify-end overflow-hidden rounded-full border border-slate-600/70 bg-slate-950/70">
            <div
              data-anim="appetite-up"
              className="h-full w-full origin-bottom rounded-full bg-gradient-to-t from-amber-500 to-orange-300"
            />
          </div>
        </div>

        {/* the table with an empty plate */}
        <div className="absolute inset-x-[18%] bottom-[18%] h-4 rounded-md bg-amber-900/80 shadow-lg" />
        <div className="absolute bottom-[24%] left-1/2 h-4 w-24 -translate-x-1/2 rounded-full border-2 border-slate-300/70 bg-slate-100/80 shadow-md">
          <span className="absolute inset-1 rounded-full border border-slate-300/60" />
        </div>
        <span className="absolute bottom-[31%] left-[44%] h-1.5 w-1 rounded-full bg-slate-400/70" />

        {/* the glizzy on a string, swinging just out of reach */}
        <div
          data-anim="pendulum"
          className="absolute left-1/2 top-0 z-30 origin-top"
        >
          <div className="h-24 w-px bg-slate-400/70" />
          <span className="-ml-5 block">
            <GlizzyIcon
              variant={1}
              className="h-6 w-10 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]"
            />
          </span>
        </div>

        {/* the faster, stomach rumbling, eyes on the prize */}
        <SceneActor
          character={character}
          className="bottom-[28%] left-1/2 -translate-x-1/2"
          anim="track growl"
          pose="origin-bottom"
        >
          <span
            data-anim="ripple"
            className="absolute inset-0 rounded-full border-2 border-amber-300/60"
          />
          <span
            data-anim="ripple"
            data-anim-delay={700}
            className="absolute inset-0 rounded-full border-2 border-amber-300/40"
          />
          <span
            data-anim="drip"
            className="absolute bottom-3 right-3 h-3.5 w-2 rounded-b-full rounded-t-[70%] bg-sky-200/90"
          />
        </SceneActor>
      </SceneFrame>
    </div>
  );
}
