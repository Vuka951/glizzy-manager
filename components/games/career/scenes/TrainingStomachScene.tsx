'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import LevelUpBurst from '@/components/games/career/scenes/LevelUpBurst';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const CONVEYOR_MS = 2400;
const FIRST_BITE_MS = 1500;
const LEVEL_MS = 3600;
const PUKE_MS = 3700;
const GLIZZY_COUNT = 5;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  // A glizzy rides the belt in from the right edge to the mouth: the lane is
  // exactly that wide, so a full-width slide lands on the bite every time
  conveyor: {
    keyframes: [
      { transform: 'translateX(0)', opacity: 1, offset: 0 },
      { transform: 'translateX(-100%)', opacity: 1, offset: 0.62 },
      { transform: 'translateX(-104%)', opacity: 0, offset: 0.7 },
      { transform: 'translateX(-104%)', opacity: 0, offset: 1 },
    ],
    options: { duration: CONVEYOR_MS, iterations: Infinity, easing: 'linear' },
  },
  bite: {
    keyframes: [
      { transform: 'scale(1) rotate(0deg)', offset: 0 },
      { transform: 'scale(1) rotate(0deg)', offset: 0.6 },
      { transform: 'scale(0.2) rotate(-40deg)', offset: 0.7 },
      { transform: 'scale(0.2)', offset: 1 },
    ],
    options: { duration: CONVEYOR_MS, iterations: Infinity, easing: 'linear' },
  },
  chew: {
    keyframes: [
      { transform: 'scaleY(1) scaleX(1)' },
      { transform: 'scaleY(0.88) scaleX(1.06)', offset: 0.5 },
      { transform: 'scaleY(1) scaleX(1)' },
    ],
    options: { duration: 420, iterations: Infinity, easing: 'ease-in-out' },
  },
  belt: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-24px)' },
    ],
    options: { duration: 500, iterations: Infinity, easing: 'linear' },
  },
  'fill-up': {
    keyframes: [{ transform: 'scaleY(0.12)' }, { transform: 'scaleY(1)' }],
    options: {
      duration: 5000,
      easing: 'ease-in-out',
      fill: 'both',
      delay: FIRST_BITE_MS,
    },
  },
  swell: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.12)', offset: 0.7 },
      { transform: 'scale(1.1)' },
    ],
    options: {
      duration: 4000,
      easing: 'ease-in-out',
      fill: 'both',
      delay: FIRST_BITE_MS,
    },
  },
  'big-swell': {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)', offset: 0.4 },
      { transform: 'scale(1.18)' },
    ],
    options: {
      duration: 900,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
};

const CRUMB_OFFSETS = [
  'left-[30%] top-[52%]',
  'left-[33%] top-[46%]',
  'left-[31%] top-[58%]',
];

export default function TrainingStomachScene({
  character,
  outcome,
}: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const bad = outcome === 'bad';
  const levelUp = outcome === 'level-up';
  useSceneAnimation(root, CUSTOM, [outcome]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40"
        floor="bg-slate-800"
      >
        {/* gym wall stripes and the neon capacity sign */}
        <div className="absolute inset-x-0 top-0 h-[40%] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_28px,rgba(148,163,184,0.06)_28px,rgba(148,163,184,0.06)_30px)]" />

        {/* the belly gauge on the left wall */}
        <div className="absolute left-3 top-6 flex h-[58%] w-3 flex-col justify-end overflow-hidden rounded-full border border-slate-600/70 bg-slate-950/70">
          <div
            data-anim="fill-up"
            data-anim-duration={levelUp ? LEVEL_MS : undefined}
            className={`h-full w-full origin-bottom rounded-full ${
              bad
                ? 'bg-gradient-to-t from-lime-500 to-emerald-300'
                : levelUp
                  ? 'bg-gradient-to-t from-amber-500 via-yellow-300 to-amber-100'
                  : 'bg-gradient-to-t from-amber-500 to-red-400'
            }`}
          />
        </div>

        {/* the conveyor belt */}
        <div className="absolute left-[30%] right-[22%] bottom-[24%] h-5 overflow-hidden rounded-sm border border-slate-600/60 bg-slate-700">
          <div
            data-anim="belt"
            className="absolute inset-y-0 -left-6 w-[140%] bg-[repeating-linear-gradient(90deg,rgba(15,23,42,0.6)_0,rgba(15,23,42,0.6)_12px,transparent_12px,transparent_24px)]"
          />
        </div>
        <div className="absolute bottom-[18%] left-[31%] h-3 w-3 rounded-full bg-slate-600" />
        <div className="absolute bottom-[18%] right-[24%] h-3 w-3 rounded-full bg-slate-600" />

        {Array.from({ length: GLIZZY_COUNT }, (_, i) => (
          <div
            key={i}
            data-anim="conveyor"
            data-anim-delay={(i * CONVEYOR_MS) / GLIZZY_COUNT}
            className="absolute bottom-[31%] left-[30%] right-[20%] opacity-0"
          >
            <span
              data-anim="bite"
              data-anim-delay={(i * CONVEYOR_MS) / GLIZZY_COUNT}
              className="absolute right-0 bottom-0 block"
            >
              <GlizzyIcon variant={i % 3} className="h-6 w-10 drop-shadow-md" />
            </span>
          </div>
        ))}

        {/* the eater, squashing with every bite */}
        <SceneActor
          character={character}
          className="bottom-[22%] left-[14%]"
          anim={levelUp ? 'chew swell big-swell' : 'chew swell'}
          animDelay={
            levelUp ? `${FIRST_BITE_MS} 0 ${LEVEL_MS}` : `${FIRST_BITE_MS}`
          }
          pose="origin-bottom"
        >
          {levelUp && <LevelUpBurst delay={LEVEL_MS} />}
          {bad && (
            <>
              <span
                data-anim="fade-in"
                data-anim-delay={FIRST_BITE_MS + 900}
                data-anim-duration={1400}
                className="absolute inset-0 rounded-full bg-emerald-400/40 opacity-0 mix-blend-color"
              />
              <span
                data-anim="drip"
                data-anim-delay={PUKE_MS}
                className="absolute bottom-1 left-1/2 h-3 w-2 rounded-b-full bg-lime-300/90 opacity-0"
              />
              <span
                data-anim="drip"
                data-anim-delay={PUKE_MS + 500}
                className="absolute bottom-2 left-[62%] h-2.5 w-1.5 rounded-b-full bg-lime-200/80 opacity-0"
              />
            </>
          )}
        </SceneActor>

        {/* crumbs off the bite */}
        {CRUMB_OFFSETS.map((cls, i) => (
          <span
            key={cls}
            data-anim="float-up"
            data-anim-delay={FIRST_BITE_MS + i * 300}
            data-anim-duration={900}
            className={`absolute h-1.5 w-1.5 rounded-full bg-amber-300/90 ${cls}`}
          />
        ))}
      </SceneFrame>
    </div>
  );
}
