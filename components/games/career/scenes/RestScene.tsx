'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import MoonIcon from '@/components/icons/MoonIcon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const CUSTOM: Record<string, SceneAnimationSpec> = {
  drain: {
    keyframes: [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.28)' }],
    options: { duration: 7000, easing: 'ease-in-out', fill: 'both' },
  },
  'lie-down': {
    keyframes: [
      { transform: 'translateY(-30px) rotate(0deg)', opacity: 0 },
      { transform: 'translateY(0) rotate(-78deg)', opacity: 1 },
    ],
    options: {
      duration: 1100,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  snore: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)', offset: 0.4 },
      { transform: 'scale(1)' },
    ],
    options: { duration: 3200, iterations: Infinity, easing: 'ease-in-out' },
  },
};

const STARS = [
  'left-[8%] top-[10%]',
  'left-[20%] top-[22%]',
  'left-[70%] top-[8%]',
  'left-[86%] top-[26%]',
  'left-[54%] top-[14%]',
  'left-[40%] top-[6%]',
];

export default function RestScene({ character }: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-indigo-950/70 to-slate-900"
        floor="bg-slate-900"
      >
        {STARS.map((cls, i) => (
          <span
            key={cls}
            data-anim="blink"
            data-anim-delay={i * 380}
            data-anim-duration={1600 + i * 200}
            className={`absolute h-1 w-1 rounded-full bg-slate-100 ${cls}`}
          />
        ))}
        <span className="absolute right-[10%] top-[8%]">
          <MoonIcon className="h-9 w-9 text-amber-100 drop-shadow-[0_0_14px_rgba(254,243,199,0.6)]" />
        </span>

        {/* the window frame */}
        <div className="absolute left-[8%] top-[10%] h-[36%] w-[24%] rounded-md border-2 border-slate-700 bg-slate-900/40">
          <span className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-700" />
          <span className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-700" />
        </div>

        {/* holesterol gauge on the wall, draining */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          <div className="h-2 w-24 overflow-hidden rounded-full border border-slate-600/60 bg-slate-950/70">
            <div
              data-anim="drain"
              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-red-400"
            />
          </div>
        </div>

        {/* the couch */}
        <div className="absolute inset-x-[22%] bottom-[18%] h-10 rounded-t-2xl bg-gradient-to-b from-red-900 to-red-950 shadow-xl" />
        <div className="absolute bottom-[18%] left-[18%] h-14 w-7 rounded-t-2xl bg-red-950" />
        <div className="absolute bottom-[18%] right-[18%] h-14 w-7 rounded-t-2xl bg-red-950" />
        <div className="absolute bottom-[30%] left-[22%] h-6 w-16 rounded-md bg-amber-100/90 shadow-md" />

        {/* candle on the side table */}
        <div className="absolute bottom-[18%] right-[6%] h-6 w-6 rounded-sm bg-slate-700" />
        <div className="absolute bottom-[26%] right-[8%] h-4 w-2 rounded-sm bg-amber-50" />
        <span
          data-anim="candle"
          className="absolute bottom-[34%] right-[8.5%] h-3 w-1.5 origin-bottom rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.9)]"
        />

        {/* the sleeper, laid out on the couch */}
        <SceneActor
          character={character}
          className="bottom-[33%] left-[24%]"
          anim="lie-down snore"
          pose="origin-center"
        />
        <span
          data-anim="drift"
          className="absolute bottom-[58%] left-[17%] z-30 text-2xl font-black text-sky-50 drop-shadow-[0_0_5px_rgba(186,230,253,0.65)]"
        >
          Z
        </span>
        <span
          data-anim="drift"
          data-anim-delay={900}
          className="absolute bottom-[64%] left-[21%] z-30 text-xl font-black text-sky-100/90"
        >
          Z
        </span>
        <span
          data-anim="drift"
          data-anim-delay={1800}
          className="absolute bottom-[69%] left-[25%] z-30 text-base font-black text-sky-200/85"
        >
          z
        </span>

        {/* the blanket over him */}
        <div className="absolute bottom-[26%] left-[42%] z-30 h-6 w-[30%] rounded-t-xl bg-gradient-to-b from-sky-900 to-sky-950 opacity-90" />
      </SceneFrame>
    </div>
  );
}
