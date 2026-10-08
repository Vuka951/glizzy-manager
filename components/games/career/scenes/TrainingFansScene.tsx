'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import LevelUpBurst from '@/components/games/career/scenes/LevelUpBurst';
import HeartIcon from '@/components/icons/HeartIcon';
import Icon from '@/components/icons/Icon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const CUSTOM: Record<string, SceneAnimationSpec> = {
  wave: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-10px)', offset: 0.35 },
      { transform: 'translateY(0)', offset: 0.7 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 1500, iterations: Infinity, easing: 'ease-in-out' },
  },
  shout: {
    keyframes: [
      { transform: 'rotate(-10deg) scale(1)' },
      { transform: 'rotate(-4deg) scale(1.15)', offset: 0.5 },
      { transform: 'rotate(-10deg) scale(1)' },
    ],
    options: { duration: 700, iterations: Infinity, easing: 'ease-in-out' },
  },
  spotlight: {
    keyframes: [
      { transform: 'rotate(-14deg)' },
      { transform: 'rotate(14deg)' },
      { transform: 'rotate(-14deg)' },
    ],
    options: { duration: 4200, iterations: Infinity, easing: 'ease-in-out' },
  },
};

const CROWD_FRONT = 9;
const CROWD_BACK = 8;
const HEART_SPOTS = [
  'left-[30%] bottom-[40%]',
  'left-[64%] bottom-[44%]',
  'left-[46%] bottom-[36%]',
  'left-[72%] bottom-[38%]',
];
const FIREWORKS = [
  'left-[14%] top-[16%]',
  'left-[78%] top-[12%]',
  'left-[50%] top-[8%]',
  'left-[30%] top-[26%]',
  'left-[66%] top-[28%]',
];
const RAYS = [
  'rotate-0',
  'rotate-[60deg]',
  'rotate-[120deg]',
  'rotate-180',
  'rotate-[240deg]',
  'rotate-[300deg]',
];
const LEVEL_MS = 2400;

export default function TrainingFansScene({
  character,
  season,
  outcome,
}: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const bad = outcome === 'bad';
  const levelUp = outcome === 'level-up';
  useSceneAnimation(root, CUSTOM, [outcome]);

  return (
    <div ref={root}>
      <SceneFrame season={season} floor="bg-slate-900">
        {/* two spotlights sweeping the stage */}
        <div
          data-anim="spotlight"
          className="absolute -top-10 left-[12%] h-[120%] w-24 origin-top bg-gradient-to-b from-sky-100/25 to-transparent [clip-path:polygon(45%_0,55%_0,100%_100%,0_100%)]"
        />
        <div
          data-anim="spotlight"
          data-anim-delay={-2100}
          className="absolute -top-10 right-[12%] h-[120%] w-24 origin-top bg-gradient-to-b from-amber-100/25 to-transparent [clip-path:polygon(45%_0,55%_0,100%_100%,0_100%)]"
        />

        {/* the podium */}
        <div className="absolute bottom-[16%] left-1/2 h-9 w-32 -translate-x-1/2 rounded-t-md bg-gradient-to-b from-slate-600 to-slate-800 shadow-xl" />

        <SceneActor
          character={character}
          className="bottom-[30%] left-1/2 -translate-x-1/2"
          anim={bad ? 'shake' : 'bob'}
          pose="origin-bottom"
        >
          {levelUp && <LevelUpBurst delay={LEVEL_MS} />}
          <span
            data-anim="shout"
            className="absolute -right-6 top-6 origin-left"
          >
            <Icon
              name="megaphone"
              className="h-8 w-8 text-sky-300 drop-shadow-md"
            />
          </span>
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              data-anim="ring-out"
              data-anim-delay={200 + k * 260}
              data-anim-iterations={Infinity}
              className={`absolute -right-9 top-5 h-8 w-8 rounded-full border-2 opacity-0 ${bad ? 'border-red-400/70' : 'border-sky-200/80'}`}
            />
          ))}
        </SceneActor>

        {levelUp &&
          FIREWORKS.map((cls, i) => (
            <span key={cls} className={`absolute z-20 ${cls}`}>
              {RAYS.map((ray, k) => (
                <span key={ray} className={`absolute inset-0 ${ray}`}>
                  <span
                    data-anim="spark-out"
                    data-anim-delay={LEVEL_MS + i * 380 + k * 30}
                    className={`absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 ${
                      i % 3 === 0
                        ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]'
                        : i % 3 === 1
                          ? 'bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.9)]'
                          : 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]'
                    }`}
                  />
                </span>
              ))}
            </span>
          ))}
        {!bad &&
          HEART_SPOTS.map((cls, i) => (
            <span
              key={cls}
              data-anim="float-up"
              data-anim-delay={i * 450}
              className={`absolute ${cls}`}
            >
              <HeartIcon className="h-3.5 w-3.5 text-red-400 drop-shadow" />
            </span>
          ))}

        {/* the crowd, two rows of heads doing the wave (or not) */}
        <div className="absolute inset-x-0 bottom-[6%] z-30 flex justify-around px-2">
          {Array.from({ length: CROWD_BACK }, (_, i) => (
            <span
              key={i}
              data-anim={bad ? undefined : 'wave'}
              data-anim-delay={i * 120}
              className="h-5 w-5 rounded-full bg-slate-600 ring-2 ring-slate-950/60"
            />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 z-30 flex justify-around px-1">
          {Array.from({ length: CROWD_FRONT }, (_, i) => (
            <span
              key={i}
              data-anim={bad ? undefined : 'wave'}
              data-anim-delay={i * 120 + 250}
              className={`h-7 w-7 rounded-full ring-2 ring-slate-950/70 ${i % 2 ? 'bg-slate-500' : 'bg-slate-400'}`}
            >
              {bad && i % 3 === 1 && (
                <span className="block h-full w-full rounded-full bg-[radial-gradient(circle_at_50%_60%,rgba(15,23,42,0.9)_0,rgba(15,23,42,0.9)_18%,transparent_20%)]" />
              )}
            </span>
          ))}
        </div>
      </SceneFrame>
    </div>
  );
}
