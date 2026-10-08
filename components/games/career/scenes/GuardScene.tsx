'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import ActionIcon from '@/components/icons/ActionIcon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const CREEP_MS = 1400;
const BOUNCE_MS = 3200;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  creep: {
    keyframes: [
      { transform: 'translateX(200px) rotate(0deg)', opacity: 0 },
      { transform: 'translateX(150px) rotate(-4deg)', opacity: 1, offset: 0.2 },
      { transform: 'translateX(60px) rotate(4deg)', opacity: 1, offset: 0.6 },
      { transform: 'translateX(0) rotate(-3deg)', opacity: 1 },
    ],
    options: {
      duration: BOUNCE_MS - CREEP_MS,
      easing: 'ease-in-out',
      fill: 'both',
      delay: CREEP_MS,
    },
  },
  'bounce-out': {
    keyframes: [
      { transform: 'translateX(0) rotate(0deg)' },
      {
        transform: 'translateX(360px) translateY(-30px) rotate(380deg)',
        offset: 1,
      },
    ],
    options: {
      duration: 700,
      easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)',
      fill: 'forwards',
      delay: BOUNCE_MS,
    },
  },
  step: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-14px)' },
    ],
    options: {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards',
      delay: BOUNCE_MS - 200,
    },
  },
  'step-mirror': {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(14px)' },
    ],
    options: {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards',
      delay: BOUNCE_MS - 200,
    },
  },
  'lamp-swing': {
    keyframes: [
      { transform: 'rotate(-3deg)' },
      { transform: 'rotate(3deg)' },
      { transform: 'rotate(-3deg)' },
    ],
    options: { duration: 3000, iterations: Infinity, easing: 'ease-in-out' },
  },
};

function Bouncer({ flip = false, anim }: { flip?: boolean; anim: string }) {
  return (
    <div
      data-anim={`${anim} breathe`}
      className={`relative origin-bottom ${flip ? '-scale-x-100' : ''}`}
    >
      <svg
        viewBox="0 0 30 48"
        className="h-24 w-auto drop-shadow-xl sm:h-28"
        aria-hidden="true"
      >
        <rect
          x="6"
          y="19"
          width="18"
          height="24"
          rx="4"
          className="fill-slate-950"
        />
        <rect x="12" y="19" width="6" height="14" className="fill-slate-100" />
        <path d="M15 19l-2 3 2 8 2-8z" className="fill-red-700" />
        <circle cx="15" cy="11" r="7" className="fill-amber-200" />
        <rect
          x="8"
          y="8.5"
          width="14"
          height="3.4"
          rx="1.2"
          className="fill-slate-950"
        />
        <rect
          x="1"
          y="21"
          width="6"
          height="14"
          rx="3"
          className="fill-slate-950"
        />
        <rect
          x="23"
          y="21"
          width="6"
          height="14"
          rx="3"
          className="fill-slate-950"
        />
        <rect
          x="3"
          y="27"
          width="24"
          height="5"
          rx="2.5"
          className="fill-slate-900"
        />
        <rect x="9" y="42" width="5" height="6" className="fill-slate-900" />
        <rect x="16" y="42" width="5" height="6" className="fill-slate-900" />
        <path
          d="M23 13q3 1 3 4"
          className="fill-none stroke-slate-100"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function GuardScene({ character }: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900"
        floor="bg-slate-800"
      >
        {/* the front door with a swinging lamp over it */}
        <div className="absolute bottom-[18%] left-1/2 h-[62%] w-[26%] -translate-x-1/2 rounded-t-xl border-4 border-amber-900 bg-gradient-to-b from-amber-800 to-amber-950 shadow-2xl">
          <span className="absolute right-3 top-1/2 h-2 w-2 rounded-full bg-amber-300" />
          <span className="absolute inset-x-3 top-3 h-[30%] rounded-md border-2 border-amber-900/60" />
        </div>
        <div
          data-anim="lamp-swing"
          className="absolute left-1/2 top-0 origin-top -translate-x-1/2"
        >
          <div className="mx-auto h-5 w-px bg-slate-500" />
          <div className="h-3 w-10 rounded-b-full bg-amber-200 shadow-[0_0_20px_rgba(253,230,138,0.7)]" />
          <div className="mx-auto -mt-1 h-40 w-40 bg-gradient-to-b from-amber-100/20 to-transparent [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />
        </div>

        {/* the velvet rope */}
        <div className="absolute bottom-[16%] left-[18%] h-10 w-1.5 rounded-full bg-amber-400" />
        <div className="absolute bottom-[16%] right-[18%] h-10 w-1.5 rounded-full bg-amber-400" />
        <svg
          viewBox="0 0 200 20"
          preserveAspectRatio="none"
          className="absolute bottom-[28%] left-[18%] h-4 w-[64%]"
          aria-hidden="true"
        >
          <path
            d="M0 2q100 24 200 0"
            className="fill-none stroke-red-600"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        {/* the client, safe behind the line */}
        <SceneActor
          character={character}
          className="bottom-[36%] left-1/2 -translate-x-1/2"
          anim="bob"
          size="h-16 w-16 sm:h-20 sm:w-20"
        >
          <span
            data-anim="glow-pulse"
            className="absolute -top-5 left-1/2 -translate-x-1/2"
          >
            <ActionIcon
              kind="guard"
              className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]"
            />
          </span>
        </SceneActor>

        {/* two bouncers step in and close ranks */}
        <div
          data-anim="slide-in-left"
          className="absolute bottom-[14%] left-[8%] z-30 opacity-0"
        >
          <Bouncer anim="step-mirror" />
        </div>
        <div
          data-anim="slide-in-right"
          data-anim-delay={150}
          className="absolute bottom-[14%] right-[8%] z-30 opacity-0"
        >
          <Bouncer flip anim="step" />
        </div>

        {/* the intruder creeps in from the right and gets launched */}
        <div
          data-anim="creep"
          className="absolute bottom-[12%] right-[30%] z-40 opacity-0"
        >
          <div data-anim="bounce-out" className="relative">
            <svg
              viewBox="0 0 24 40"
              className="h-16 w-auto drop-shadow-lg"
              aria-hidden="true"
            >
              <path
                d="M12 3c-6 0-8 6-8 11v12h16V14c0-5-2-11-8-11z"
                className="fill-slate-700 stroke-slate-400"
                strokeWidth="0.8"
              />
              <circle cx="12" cy="12" r="4" className="fill-slate-950" />
              <circle cx="10.5" cy="12" r="0.8" className="fill-red-400" />
              <circle cx="13.5" cy="12" r="0.8" className="fill-red-400" />
              <rect
                x="7"
                y="26"
                width="4"
                height="12"
                className="fill-slate-800"
              />
              <rect
                x="13"
                y="26"
                width="4"
                height="12"
                className="fill-slate-800"
              />
              <rect
                x="17"
                y="16"
                width="6"
                height="8"
                rx="1"
                className="fill-amber-500"
              />
            </svg>
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
