'use client';

import { useRef } from 'react';
import LevelUpBurst from '@/components/games/career/scenes/LevelUpBurst';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import LeafIcon from '@/components/icons/LeafIcon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

// A visit to the nutritionist: the greasy plate gets pushed off the table,
// a proper one slides in, the meal plan gets ticked line by line and the
// scale under him settles. A bad session is him sneaking the grease back
const SWAP_MS = 1300;
const PLAN_MS = 1800;
const BITE_MS = 3200;
const RELAPSE_MS = 3000;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'greasy-out': {
    keyframes: [
      { transform: 'translateX(0) rotate(0deg)', opacity: 1 },
      { transform: 'translateX(-90px) rotate(-30deg)', opacity: 0 },
    ],
    options: {
      duration: 600,
      easing: 'ease-in',
      fill: 'forwards',
      delay: SWAP_MS,
    },
  },
  'greasy-back': {
    keyframes: [
      { transform: 'translateX(-90px) rotate(-30deg)', opacity: 0 },
      { transform: 'translateX(0) rotate(0deg)', opacity: 1 },
    ],
    options: {
      duration: 500,
      easing: 'ease-out',
      fill: 'forwards',
      delay: RELAPSE_MS,
    },
  },
  'healthy-in': {
    keyframes: [
      { transform: 'translateX(120px)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    options: {
      duration: 600,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
      delay: SWAP_MS + 300,
    },
  },
  'healthy-out': {
    keyframes: [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(120px)', opacity: 0 },
    ],
    options: {
      duration: 500,
      easing: 'ease-in',
      fill: 'forwards',
      delay: RELAPSE_MS,
    },
  },
  push: {
    keyframes: [
      { transform: 'translateX(0) rotate(0deg)' },
      { transform: 'translateX(-26px) rotate(-6deg)', offset: 0.5 },
      { transform: 'translateX(0) rotate(0deg)' },
    ],
    options: {
      duration: 700,
      easing: 'ease-in-out',
      fill: 'forwards',
      delay: SWAP_MS - 200,
    },
  },
  'needle-good': {
    keyframes: [
      { transform: 'rotate(-70deg)' },
      { transform: 'rotate(40deg)', offset: 0.3 },
      { transform: 'rotate(-20deg)', offset: 0.55 },
      { transform: 'rotate(5deg)', offset: 0.8 },
      { transform: 'rotate(-8deg)' },
    ],
    options: { duration: 2600, easing: 'ease-out', fill: 'both', delay: 400 },
  },
  'needle-bad': {
    keyframes: [
      { transform: 'rotate(-70deg)' },
      { transform: 'rotate(10deg)', offset: 0.3 },
      { transform: 'rotate(-8deg)', offset: 0.6 },
      { transform: 'rotate(-8deg)', offset: 0.75 },
      { transform: 'rotate(62deg)' },
    ],
    options: { duration: 3600, easing: 'ease-out', fill: 'both', delay: 400 },
  },
  chew: {
    keyframes: [
      { transform: 'scaleY(1)' },
      { transform: 'scaleY(0.9) scaleX(1.05)', offset: 0.5 },
      { transform: 'scaleY(1)' },
    ],
    options: {
      duration: 420,
      iterations: 5,
      easing: 'ease-in-out',
      delay: BITE_MS,
    },
  },
  bite: {
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1)', opacity: 1, offset: 0.4 },
      { transform: 'scale(0.55)', opacity: 1, offset: 0.7 },
      { transform: 'scale(0.2)', opacity: 0 },
    ],
    options: {
      duration: 1400,
      easing: 'ease-in',
      fill: 'forwards',
      delay: BITE_MS,
    },
  },
  sneak: {
    keyframes: [
      { transform: 'rotate(0deg) translateX(0)' },
      { transform: 'rotate(-10deg) translateX(-12px)' },
    ],
    options: {
      duration: 500,
      easing: 'ease-out',
      fill: 'forwards',
      delay: RELAPSE_MS - 300,
    },
  },
  'turn-away': {
    keyframes: [{ transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }],
    options: {
      duration: 350,
      easing: 'ease-in-out',
      fill: 'forwards',
      delay: RELAPSE_MS - 600,
    },
  },
  'pen-tick': {
    keyframes: [
      { transform: 'rotate(0deg) translate(0, 0)' },
      { transform: 'rotate(-12deg) translate(-3px, 4px)', offset: 0.5 },
      { transform: 'rotate(0deg) translate(0, 0)' },
    ],
    options: {
      duration: 500,
      iterations: 3,
      easing: 'ease-in-out',
      delay: PLAN_MS,
    },
  },
};

const PLAN_ROWS = ['w-9', 'w-7', 'w-8'];

function Nutritionist({ bad }: { bad: boolean }) {
  return (
    <div
      data-anim={bad ? 'nod turn-away' : 'nod'}
      className="relative origin-bottom"
    >
      <svg
        viewBox="0 0 40 64"
        className="h-32 w-auto drop-shadow-xl sm:h-36"
        aria-hidden="true"
      >
        <rect
          x="8"
          y="26"
          width="24"
          height="32"
          rx="5"
          className="fill-slate-100"
        />
        <path d="M20 26l-4 4 4 14 4-14z" className="fill-sky-300" />
        <rect x="11" y="30" width="4" height="10" className="fill-slate-300" />
        <rect x="25" y="30" width="4" height="10" className="fill-slate-300" />
        <circle cx="20" cy="15" r="9" className="fill-amber-200" />
        <path d="M11 13q9-12 18 0v-4q-9-8-18 0z" className="fill-amber-900" />
        <circle cx="20" cy="4" r="3.5" className="fill-amber-900" />
        <rect
          x="12"
          y="13"
          width="6"
          height="4"
          rx="1"
          className="fill-none stroke-slate-800"
          strokeWidth="1.2"
        />
        <rect
          x="22"
          y="13"
          width="6"
          height="4"
          rx="1"
          className="fill-none stroke-slate-800"
          strokeWidth="1.2"
        />
        <path d="M18 15h4" className="stroke-slate-800" strokeWidth="1.2" />
        <path
          d="M17 21q3 2 6 0"
          className="fill-none stroke-amber-900"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect
          x="2"
          y="30"
          width="7"
          height="12"
          rx="3.5"
          className="fill-slate-100"
        />
        <rect
          x="31"
          y="30"
          width="7"
          height="12"
          rx="3.5"
          className="fill-slate-100"
        />
        <rect x="11" y="58" width="6" height="6" className="fill-slate-700" />
        <rect x="23" y="58" width="6" height="6" className="fill-slate-700" />
      </svg>
      {/* the clipboard with the meal plan */}
      <div className="absolute -left-10 top-14 flex h-14 w-11 flex-col gap-1.5 rounded-sm border-2 border-amber-800 bg-amber-50 p-1.5 pt-2.5 shadow-lg">
        <span className="absolute -top-1.5 left-1/2 h-2 w-4 -translate-x-1/2 rounded-sm bg-slate-600" />
        {PLAN_ROWS.map((w, i) => (
          <span key={w} className="flex items-center gap-1">
            <span
              data-anim="pop-in"
              data-anim-delay={PLAN_MS + i * 480}
              className={`flex h-2.5 w-2.5 items-center justify-center rounded-sm text-[7px] font-black leading-none opacity-0 ${
                bad && i === 2
                  ? 'bg-red-500 text-red-50'
                  : 'bg-emerald-500 text-emerald-50'
              }`}
            >
              {bad && i === 2 ? (
                <span className="block h-0.5 w-1.5 bg-red-50" />
              ) : (
                '✓'
              )}
            </span>
            <span className={`h-0.5 rounded-full bg-slate-400 ${w}`} />
          </span>
        ))}
      </div>
      <span
        data-anim="pen-tick"
        className="absolute -left-4 top-[4.4rem] block h-6 w-1 origin-top rounded-full bg-sky-800"
      />
    </div>
  );
}

function GreasyPlate() {
  return (
    <div className="relative h-8 w-20">
      <span className="absolute inset-x-0 bottom-0 h-3.5 rounded-full border-2 border-slate-300/60 bg-slate-100/80 shadow-md" />
      <span className="absolute bottom-2 left-3 h-4 w-6 rounded-[50%] bg-amber-900 shadow-[0_0_6px_rgba(120,53,15,0.8)]" />
      <span className="absolute bottom-2.5 left-7 h-4 w-7 rounded-[45%] bg-yellow-700" />
      <span className="absolute bottom-2 left-12 h-3.5 w-5 rounded-full bg-amber-800" />
      <span className="absolute bottom-4 left-5 h-1 w-1 rounded-full bg-amber-200/80" />
      <span className="absolute bottom-5 left-10 h-1 w-1.5 rounded-full bg-amber-200/70" />
      <span
        data-anim="drift"
        className="absolute -top-1 left-8 h-2 w-2 rounded-full bg-slate-500/50 blur-[1px]"
      />
    </div>
  );
}

function HealthyPlate() {
  return (
    <div className="relative h-8 w-20">
      <span className="absolute inset-x-0 bottom-0 h-3.5 rounded-full border-2 border-slate-300/60 bg-slate-100/90 shadow-md" />
      <span data-anim="bite" className="absolute bottom-2 left-2 origin-right">
        <GlizzyIcon variant={2} className="h-4 w-7" />
      </span>
      <span className="absolute bottom-2 left-10 flex">
        <LeafIcon className="h-4 w-4 text-emerald-400" />
        <LeafIcon className="-ml-1.5 h-3 w-3 -rotate-12 text-lime-400" />
      </span>
      <span className="absolute -top-1 right-0 h-6 w-3 rounded-b-sm rounded-t-[2px] border border-sky-200/70 bg-sky-300/40" />
    </div>
  );
}

export default function TrainingNutritionScene({
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
        indoor="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900"
        floor="bg-emerald-950/80"
      >
        {/* the clinic: pale wainscot and a food pyramid poster */}
        <div className="absolute inset-x-0 bottom-[18%] h-[26%] border-t-2 border-slate-600/60 bg-slate-800/70" />
        <div className="absolute left-[30%] top-[7%] flex h-[34%] w-[20%] flex-col items-center justify-end gap-0.5 rounded-sm border-2 border-slate-500/60 bg-slate-100/95 px-2 pb-2 pt-1.5 shadow-lg">
          <span className="flex h-2.5 w-[30%] items-center justify-center rounded-t-sm bg-red-400">
            <GlizzyIcon variant={0} className="h-1.5 w-3" />
          </span>
          <span className="flex h-3 w-[58%] items-center justify-center gap-0.5 bg-amber-400">
            <GlizzyIcon variant={1} className="h-1.5 w-3" />
            <GlizzyIcon variant={1} className="h-1.5 w-3" />
          </span>
          <span className="flex h-3.5 w-[86%] items-center justify-center gap-0.5 rounded-b-sm bg-emerald-400">
            <LeafIcon className="h-2 w-2 text-emerald-900" />
            <GlizzyIcon variant={2} className="h-1.5 w-3" />
            <LeafIcon className="h-2 w-2 text-emerald-900" />
          </span>
          {levelUp && (
            <span
              data-anim="pop-in"
              data-anim-delay={BITE_MS + 600}
              className="absolute -right-2 -top-2 h-4 w-4 rotate-12 bg-amber-300 opacity-0 shadow-[0_0_10px_rgba(252,211,77,0.9)] [clip-path:polygon(50%_0,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]"
            />
          )}
        </div>

        {/* the desk and the two plates that trade places */}
        <div className="absolute inset-x-[10%] bottom-[18%] h-4 rounded-t-md bg-amber-900/90 shadow-lg" />
        <div
          data-anim={bad ? 'greasy-out greasy-back' : 'greasy-out'}
          className="absolute bottom-[24%] left-[30%] z-20"
        >
          <GreasyPlate />
        </div>
        <div
          data-anim={bad ? 'healthy-in healthy-out' : 'healthy-in'}
          className="absolute bottom-[24%] left-[30%] z-20 opacity-0"
        >
          <HealthyPlate />
        </div>

        {/* the patient on his stool, over the scale */}
        <SceneActor
          character={character}
          className="bottom-[27%] left-[9%]"
          anim={bad ? 'nod sneak' : 'nod chew'}
          pose="origin-bottom"
        >
          {levelUp && <LevelUpBurst delay={BITE_MS + 400} />}
          {bad && (
            <>
              <span
                data-anim="fade-in"
                data-anim-delay={RELAPSE_MS + 400}
                className="absolute inset-0 rounded-full bg-emerald-400/30 opacity-0 mix-blend-color"
              />
              <span
                data-anim="drip"
                data-anim-delay={RELAPSE_MS + 300}
                className="absolute right-3 top-3 h-2.5 w-1.5 rounded-b-full rounded-t-[70%] bg-sky-200/90 opacity-0"
              />
            </>
          )}
        </SceneActor>
        <div className="absolute bottom-[16%] left-[9%] z-10 flex h-7 w-24 items-end justify-center rounded-t-lg border-2 border-b-0 border-slate-500 bg-slate-700 shadow-md">
          <span className="relative mb-1 h-4 w-14 overflow-hidden rounded-t-full border border-slate-500 bg-slate-100">
            <span className="absolute inset-y-0 left-0 w-1/3 bg-emerald-300/70" />
            <span className="absolute inset-y-0 left-1/3 w-1/3 bg-amber-300/70" />
            <span className="absolute inset-y-0 right-0 w-1/3 bg-red-400/70" />
            <span
              data-anim={bad ? 'needle-bad' : 'needle-good'}
              className="absolute bottom-0 left-1/2 h-4 w-0.5 origin-bottom -translate-x-1/2 rounded-full bg-slate-900"
            />
          </span>
        </div>

        {/* the nutritionist, pushing the grease away first */}
        <div
          data-anim="slide-in-right push"
          className="absolute bottom-[18%] right-[8%] z-30 opacity-0"
        >
          <Nutritionist bad={bad} />
        </div>
      </SceneFrame>
    </div>
  );
}
