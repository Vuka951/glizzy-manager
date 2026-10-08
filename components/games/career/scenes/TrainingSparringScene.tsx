'use client';

import { useRef } from 'react';
import LevelUpBurst from '@/components/games/career/scenes/LevelUpBurst';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import SpotIcon from '@/components/icons/SpotIcon';
import type { HidingSpotId } from '@/data/games/glizzyDuel';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

// One practice round of the table game: the partner tucks a glizzy under
// the middle spot, the spots do a little shuffle, and the trainee lifts one.
// A good session lifts the right one and eats; a bad one lifts the wrong one
const HIDE_MS = 300;
const SHUFFLE_MS = 1400;
const LIFT_MS = 2700;
const REVEAL_MS = 2950;
const EAT_MS = 3500;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  hide: {
    keyframes: [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      {
        transform: 'translate(-60px, -18px) scale(1)',
        opacity: 1,
        offset: 0.5,
      },
      { transform: 'translate(-118px, 2px) scale(0.35)', opacity: 0 },
    ],
    options: {
      duration: 1000,
      easing: 'ease-in-out',
      fill: 'forwards',
      delay: HIDE_MS,
    },
  },
  'shuffle-left': {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-22px, -8px)', offset: 0.3 },
      { transform: 'translate(-22px, 0)', offset: 0.5 },
      { transform: 'translate(0, -8px)', offset: 0.8 },
      { transform: 'translate(0, 0)' },
    ],
    options: {
      duration: 1000,
      easing: 'ease-in-out',
      fill: 'forwards',
      delay: SHUFFLE_MS,
    },
  },
  'shuffle-mid': {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(0, -12px)', offset: 0.25 },
      { transform: 'translate(0, 0)', offset: 0.5 },
      { transform: 'translate(0, -12px)', offset: 0.75 },
      { transform: 'translate(0, 0)' },
    ],
    options: {
      duration: 1000,
      easing: 'ease-in-out',
      fill: 'forwards',
      delay: SHUFFLE_MS,
    },
  },
  'shuffle-right': {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(22px, -8px)', offset: 0.3 },
      { transform: 'translate(22px, 0)', offset: 0.5 },
      { transform: 'translate(0, -8px)', offset: 0.8 },
      { transform: 'translate(0, 0)' },
    ],
    options: {
      duration: 1000,
      easing: 'ease-in-out',
      fill: 'forwards',
      delay: SHUFFLE_MS,
    },
  },
  peek: {
    keyframes: [
      { transform: 'translateX(0) rotate(0deg)' },
      { transform: 'translateX(26px) rotate(10deg)' },
    ],
    options: {
      duration: 500,
      easing: 'ease-out',
      fill: 'forwards',
      delay: LIFT_MS - 200,
    },
  },
  lift: {
    keyframes: [
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-40px) rotate(-18deg)' },
    ],
    options: {
      duration: 450,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'forwards',
      delay: LIFT_MS,
    },
  },
  reveal: {
    keyframes: [
      { transform: 'scale(0.3)', opacity: 0 },
      { transform: 'scale(1.2)', opacity: 1, offset: 0.6 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    options: {
      duration: 400,
      easing: 'ease-out',
      fill: 'both',
      delay: REVEAL_MS,
    },
  },
  eat: {
    keyframes: [
      { transform: 'translate(0, 0) scale(1)' },
      { transform: 'translate(-90px, -34px) scale(1)', offset: 0.7 },
      { transform: 'translate(-110px, -30px) scale(0)' },
    ],
    options: {
      duration: 600,
      easing: 'ease-in',
      fill: 'forwards',
      delay: EAT_MS,
    },
  },
  laugh: {
    keyframes: [
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-6px) rotate(-6deg)' },
      { transform: 'translateY(0) rotate(0deg)' },
    ],
    options: {
      duration: 320,
      iterations: 6,
      easing: 'ease-in-out',
      delay: REVEAL_MS + 200,
    },
  },
};

const SPOTS: { id: HidingSpotId; cls: string; shuffle: string }[] = [
  { id: 'hat', cls: 'left-[36%]', shuffle: 'shuffle-left' },
  { id: 'box', cls: 'left-1/2', shuffle: 'shuffle-mid' },
  { id: 'sock', cls: 'left-[64%]', shuffle: 'shuffle-right' },
];

export default function TrainingSparringScene({
  character,
  outcome,
}: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const bad = outcome === 'bad';
  const liftedIndex = bad ? 0 : 1;
  useSceneAnimation(root, CUSTOM, [outcome]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/30"
        floor="bg-slate-800"
      >
        <div className="absolute inset-x-0 top-0 h-[40%] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_28px,rgba(148,163,184,0.06)_28px,rgba(148,163,184,0.06)_30px)]" />
        {/* the chalkboard tally on the back wall */}
        <div className="absolute left-3 top-3 flex h-10 w-16 items-center justify-center gap-1 rounded-sm border-2 border-amber-900 bg-emerald-950">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-5 w-0.5 rounded-full bg-slate-100/80" />
          ))}
          <span className="absolute h-0.5 w-8 rotate-[-20deg] rounded-full bg-slate-100/80" />
        </div>

        {/* the practice table */}
        <div className="absolute inset-x-[24%] bottom-[20%] h-4 rounded-md bg-amber-900 shadow-lg" />
        <div className="absolute bottom-[8%] left-[27%] h-[14%] w-2 bg-amber-950" />
        <div className="absolute bottom-[8%] right-[27%] h-[14%] w-2 bg-amber-950" />

        {/* the partner's glizzy, tucked under the middle spot */}
        <span
          data-anim="hide"
          className="absolute bottom-[29%] right-[24%] z-10"
        >
          <GlizzyIcon variant={2} className="h-5 w-8" />
        </span>
        {/* the same glizzy, found again under the lifted spot and eaten */}
        {!bad && (
          <span
            data-anim="reveal eat"
            className="absolute bottom-[27%] left-1/2 z-10 -translate-x-1/2 opacity-0"
          >
            <GlizzyIcon
              variant={2}
              className="h-5 w-8 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]"
            />
          </span>
        )}

        {SPOTS.map((spot, i) => (
          <span
            key={spot.id}
            data-anim={
              i === liftedIndex ? `${spot.shuffle} lift` : spot.shuffle
            }
            className={`absolute bottom-[25%] z-20 -translate-x-1/2 origin-bottom-left ${spot.cls}`}
          >
            <SpotIcon
              spot={spot.id}
              variant={0}
              className="h-12 w-12 drop-shadow-lg"
            />
          </span>
        ))}

        {/* the trainee, leaning over to lift */}
        <SceneActor
          character={character}
          className="bottom-[26%] left-[6%]"
          anim={bad ? 'peek shake' : 'peek'}
          animDelay={bad ? `0 ${REVEAL_MS + 200}` : undefined}
          animIterations={bad ? '1 4' : undefined}
          pose="origin-bottom"
        >
          {!bad && <LevelUpBurst delay={EAT_MS + 500} />}
        </SceneActor>

        {/* the sparring partner across the table */}
        <div
          data-anim={bad ? 'bob laugh' : 'bob'}
          className="absolute bottom-[26%] right-[6%] z-20 origin-bottom"
        >
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-slate-500 to-slate-700 shadow-xl ring-2 ring-slate-950/50 sm:h-24 sm:w-24">
            <span className="text-3xl font-black text-slate-200">?</span>
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
