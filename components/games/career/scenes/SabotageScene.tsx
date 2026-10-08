'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import ActionIcon from '@/components/icons/ActionIcon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import type { SabotageTier } from '@/lib/utils/careerSave';

const HANDOVER_MS = 1800;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'hand-over': {
    keyframes: [
      { transform: 'translateX(0)', offset: 0 },
      { transform: 'translateX(0)', offset: 0.1 },
      { transform: 'translateX(84px)', offset: 1 },
    ],
    options: {
      duration: 1400,
      easing: 'ease-in-out',
      fill: 'forwards',
      delay: HANDOVER_MS,
    },
  },
  rain: {
    keyframes: [
      { transform: 'translateY(-40px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 0.6, offset: 0.2 },
      { transform: 'translateY(200px)', opacity: 0 },
    ],
    options: { duration: 900, iterations: Infinity, easing: 'linear' },
  },
  lean: {
    keyframes: [
      { transform: 'rotate(0deg) translateX(0)' },
      { transform: 'rotate(8deg) translateX(10px)', offset: 0.5 },
      { transform: 'rotate(8deg) translateX(10px)', offset: 1 },
    ],
    options: { duration: 2400, easing: 'ease-in-out', fill: 'forwards' },
  },
  'lean-back': {
    keyframes: [
      { transform: 'rotate(0deg) translateX(0)' },
      { transform: 'rotate(-8deg) translateX(-10px)', offset: 0.5 },
      { transform: 'rotate(-8deg) translateX(-10px)', offset: 1 },
    ],
    options: { duration: 2400, easing: 'ease-in-out', fill: 'forwards' },
  },
  'eyes-blink': {
    keyframes: [
      { transform: 'scaleY(1)' },
      { transform: 'scaleY(1)', offset: 0.9 },
      { transform: 'scaleY(0.1)', offset: 0.95 },
      { transform: 'scaleY(1)' },
    ],
    options: { duration: 3600, iterations: Infinity, easing: 'ease-in-out' },
  },
};

const RAIN = [
  'left-[4%]',
  'left-[14%]',
  'left-[24%]',
  'left-[36%]',
  'left-[48%]',
  'left-[60%]',
  'left-[72%]',
  'left-[84%]',
  'left-[94%]',
];

function Package({ tier }: { tier: SabotageTier }) {
  if (tier === 1) {
    return (
      <span className="flex h-9 w-12 items-center justify-center rounded-sm border border-amber-900 bg-amber-800 shadow-lg">
        <ActionIcon kind="sabotage" className="h-6 w-6 text-slate-200" />
      </span>
    );
  }
  if (tier === 2) {
    return (
      <svg
        viewBox="0 0 20 30"
        className="h-9 w-6 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]"
        aria-hidden="true"
      >
        <rect
          x="6"
          y="1"
          width="8"
          height="5"
          rx="1"
          className="fill-slate-700"
        />
        <path
          d="M7 6h6v6l4 6v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-9l4-6z"
          className="fill-slate-300/40 stroke-slate-200/70"
          strokeWidth="1"
        />
        <path
          d="M4 20v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6z"
          className="fill-purple-500"
        />
        <circle cx="9" cy="22" r="1" className="fill-purple-200" />
      </svg>
    );
  }
  return (
    <span className="relative flex h-9 w-12 items-center justify-center rounded-sm bg-amber-200 shadow-lg">
      <span className="absolute inset-x-0 top-0 h-4 bg-amber-300 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      <span className="relative mt-2 h-3.5 w-3.5 rounded-full bg-red-700 shadow-[inset_0_0_0_2px_rgba(127,29,29,0.9)]" />
    </span>
  );
}

export default function SabotageScene({
  character,
  tier,
}: ActionSceneProps & { tier: SabotageTier }) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM, [tier]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900"
        floor="bg-slate-900"
      >
        {/* rain under a single streetlamp */}
        <div className="absolute left-[74%] top-0 h-[40%] w-1 bg-slate-700" />
        <div className="absolute left-[71%] top-[38%] h-3 w-7 rounded-b-md bg-slate-600" />
        <div className="absolute left-[54%] top-[42%] h-[60%] w-[40%] bg-gradient-to-b from-amber-100/20 to-transparent [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
        {RAIN.map((cls, i) => (
          <span
            key={cls}
            data-anim="rain"
            data-anim-delay={i * 130}
            className={`absolute top-0 h-6 w-px bg-sky-200/50 ${cls}`}
          />
        ))}

        {/* a cat on the bins, watching */}
        <div className="absolute bottom-[18%] left-[4%] h-10 w-8 rounded-t-md bg-slate-800" />
        <div className="absolute bottom-[34%] left-[6%] flex gap-1.5">
          <span
            data-anim="eyes-blink"
            className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.9)]"
          />
          <span
            data-anim="eyes-blink"
            className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.9)]"
          />
        </div>

        {/* the kafana table */}
        <div className="absolute inset-x-[30%] bottom-[18%] h-4 rounded-md bg-amber-950 shadow-lg" />
        <div className="absolute bottom-[26%] left-[36%] z-20">
          <div data-anim="hand-over">
            <Package tier={tier} />
          </div>
        </div>

        {/* the client, hood up, leaning in */}
        <SceneActor
          character={character}
          className="bottom-[26%] left-[12%]"
          anim="lean"
          pose="origin-bottom"
        >
          <span className="absolute -inset-1 rounded-t-full bg-slate-950/95 [clip-path:polygon(0_0,100%_0,100%_34%,50%_50%,0_34%)]" />
          <span className="absolute inset-0 rounded-full bg-slate-950/20" />
        </SceneActor>

        {/* the contact: hat, glasses, and not much else */}
        <div
          data-anim="lean-back"
          className="absolute bottom-[26%] right-[12%] z-20 origin-bottom"
        >
          <svg
            viewBox="0 0 40 44"
            className="h-24 w-auto drop-shadow-xl sm:h-28"
            aria-hidden="true"
          >
            <rect
              x="6"
              y="24"
              width="28"
              height="20"
              rx="5"
              className="fill-slate-950"
            />
            <circle cx="20" cy="15" r="10" className="fill-slate-900" />
            <rect
              x="4"
              y="9"
              width="32"
              height="3"
              rx="1.5"
              className="fill-slate-950"
            />
            <path
              d="M10 9V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5z"
              className="fill-slate-950"
            />
            <rect
              x="10"
              y="13"
              width="8"
              height="5"
              rx="1"
              className="fill-slate-700"
            />
            <rect
              x="22"
              y="13"
              width="8"
              height="5"
              rx="1"
              className="fill-slate-700"
            />
            <path d="M18 15h4" className="stroke-slate-700" strokeWidth="1.5" />
            <path
              d="M15 22q5 3 10 0"
              className="fill-none stroke-slate-600"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </SceneFrame>
    </div>
  );
}
