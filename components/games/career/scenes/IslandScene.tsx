'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import ActionIcon from '@/components/icons/ActionIcon';
import SunIcon from '@/components/icons/SunIcon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const CUSTOM: Record<string, SceneAnimationSpec> = {
  sail: {
    keyframes: [
      { transform: 'translateX(-60%) rotate(-3deg)', offset: 0 },
      { transform: 'translateX(-20%) rotate(3deg)', offset: 0.3 },
      { transform: 'translateX(20%) rotate(-3deg)', offset: 0.6 },
      { transform: 'translateX(52%) rotate(2deg)', offset: 0.9 },
      { transform: 'translateX(52%) rotate(0deg)', offset: 1 },
    ],
    options: { duration: 7000, easing: 'ease-in-out', fill: 'both' },
  },
  rock: {
    keyframes: [
      { transform: 'translateY(0) rotate(-2deg)' },
      { transform: 'translateY(-4px) rotate(2deg)' },
      { transform: 'translateY(0) rotate(-2deg)' },
    ],
    options: { duration: 1900, iterations: Infinity, easing: 'ease-in-out' },
  },
  'wave-slow': {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-80px)' },
    ],
    options: { duration: 4200, iterations: Infinity, easing: 'linear' },
  },
  'wave-fast': {
    keyframes: [
      { transform: 'translateX(-80px)' },
      { transform: 'translateX(0)' },
    ],
    options: { duration: 2600, iterations: Infinity, easing: 'linear' },
  },
  gull: {
    keyframes: [
      { transform: 'translate(0, 0) scaleY(1)', opacity: 0 },
      {
        transform: 'translate(30px, -6px) scaleY(0.4)',
        opacity: 1,
        offset: 0.25,
      },
      { transform: 'translate(70px, -4px) scaleY(1)', opacity: 1, offset: 0.6 },
      { transform: 'translate(120px, -12px) scaleY(0.4)', opacity: 0 },
    ],
    options: { duration: 5200, iterations: Infinity, easing: 'linear' },
  },
  'island-in': {
    keyframes: [
      { transform: 'translateX(60px) scale(0.6)', opacity: 0 },
      { transform: 'translateX(0) scale(1)', opacity: 1 },
    ],
    options: { duration: 2400, easing: 'ease-out', fill: 'both', delay: 2500 },
  },
};

const WAVE_PATH =
  'M0 10q10-8 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0v20H0z';

export default function IslandScene({ character }: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-sky-800 via-sky-600 to-cyan-500"
        floor={null}
      >
        <span data-anim="glow-pulse" className="absolute left-[12%] top-[8%]">
          <SunIcon className="h-12 w-12 text-amber-200 drop-shadow-[0_0_24px_rgba(253,230,138,0.9)]" />
        </span>
        <span
          data-anim="gull"
          className="absolute left-[30%] top-[18%] text-[10px] font-black text-slate-100"
        >
          v
        </span>
        <span
          data-anim="gull"
          data-anim-delay={1800}
          className="absolute left-[50%] top-[12%] text-[12px] font-black text-slate-100/90"
        >
          v
        </span>

        {/* the island sailing into view on the right */}
        <div
          data-anim="island-in"
          className="absolute bottom-[26%] right-[4%] z-10 opacity-0"
        >
          <div className="absolute -bottom-2 left-1/2 h-6 w-28 -translate-x-1/2 rounded-[50%] bg-amber-200" />
          <ActionIcon
            kind="island"
            className="relative h-16 w-16 text-emerald-500 drop-shadow-lg"
          />
        </div>

        {/* three layers of sea */}
        <svg
          data-anim="wave-slow"
          viewBox="0 0 320 30"
          preserveAspectRatio="none"
          className="absolute -left-20 bottom-[22%] z-[5] h-8 w-[160%]"
          aria-hidden="true"
        >
          <path d={WAVE_PATH} className="fill-cyan-600/80" />
        </svg>
        <svg
          data-anim="wave-fast"
          viewBox="0 0 320 30"
          preserveAspectRatio="none"
          className="absolute -left-20 bottom-[10%] z-30 h-8 w-[160%]"
          aria-hidden="true"
        >
          <path d={WAVE_PATH} className="fill-cyan-400/90" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 z-30 h-[12%] bg-cyan-400" />
        <svg
          data-anim="wave-slow"
          data-anim-delay={-1400}
          viewBox="0 0 320 30"
          preserveAspectRatio="none"
          className="absolute -left-20 bottom-0 z-40 h-7 w-[160%]"
          aria-hidden="true"
        >
          <path d={WAVE_PATH} className="fill-cyan-300/70" />
        </svg>

        {/* the boat, rocking and crossing */}
        <div
          data-anim="sail"
          className="absolute bottom-[18%] left-1/2 z-20 w-40 -translate-x-1/2"
        >
          <div data-anim="rock" className="relative origin-bottom">
            <div className="absolute bottom-10 left-1/2 h-16 w-1 -translate-x-1/2 bg-amber-900" />
            <div className="absolute bottom-14 left-1/2 h-12 w-14 bg-slate-100 [clip-path:polygon(0_0,100%_100%,0_100%)] drop-shadow" />
            <SceneActor
              character={character}
              className="bottom-8 left-[18%]"
              size="h-14 w-14 sm:h-16 sm:w-16"
              pose="-rotate-6"
            >
              <span className="absolute left-2 top-4 h-2.5 w-9 rounded-full bg-slate-950 shadow" />
            </SceneActor>
            <div className="relative h-10 w-full rounded-b-[2.5rem] bg-gradient-to-b from-amber-700 to-amber-900 shadow-xl" />
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
