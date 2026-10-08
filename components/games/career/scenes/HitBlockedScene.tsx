'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import type { SabotageHitSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const CREEP_MS = 300;
const DOOR_MS = 1400;
const STOMP_MS = 2200;
const FLING_MS = 2900;
const DUST_MS = 3600;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  creep: {
    keyframes: [
      { transform: 'translateX(220px) rotate(0deg)', opacity: 0 },
      { transform: 'translateX(170px) rotate(-3deg)', opacity: 1, offset: 0.2 },
      { transform: 'translateX(70px) rotate(3deg)', opacity: 1, offset: 0.6 },
      { transform: 'translateX(0) rotate(-2deg)', opacity: 1 },
    ],
    options: {
      duration: 1100,
      easing: 'ease-in-out',
      fill: 'both',
      delay: CREEP_MS,
    },
  },
  fling: {
    keyframes: [
      { transform: 'translate(0, 0) rotate(0deg)' },
      { transform: 'translate(380px, -50px) rotate(400deg)' },
    ],
    options: {
      duration: 700,
      easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)',
      fill: 'forwards',
      delay: FLING_MS,
    },
  },
  // The parcel lands, bounces twice and settles in the gutter
  tumble: {
    keyframes: [
      { transform: 'translate(0, 0) rotate(0deg)' },
      { transform: 'translate(90px, -70px) rotate(300deg)', offset: 0.3 },
      { transform: 'translate(170px, 30px) rotate(560deg)', offset: 0.5 },
      { transform: 'translate(200px, 6px) rotate(640deg)', offset: 0.65 },
      { transform: 'translate(226px, 30px) rotate(700deg)', offset: 0.78 },
      { transform: 'translate(238px, 20px) rotate(720deg)', offset: 0.88 },
      { transform: 'translate(250px, 30px) rotate(730deg)' },
    ],
    options: {
      duration: 1500,
      easing: 'linear',
      fill: 'forwards',
      delay: FLING_MS,
    },
  },
  snore: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)', offset: 0.5 },
      { transform: 'scale(1)' },
    ],
    options: { duration: 2000, iterations: Infinity, easing: 'ease-in-out' },
  },
  'door-open': {
    keyframes: [{ transform: 'scaleX(0.08)' }, { transform: 'scaleX(1)' }],
    options: {
      duration: 400,
      easing: 'ease-out',
      fill: 'both',
      delay: DOOR_MS,
    },
  },
  'step-out': {
    keyframes: [
      { transform: 'translateY(8px) scale(0.8)', opacity: 0 },
      { transform: 'translateY(0) scale(1)', opacity: 1 },
    ],
    options: {
      duration: 500,
      easing: 'ease-out',
      fill: 'both',
      delay: DOOR_MS + 200,
    },
  },
  stomp: {
    keyframes: [
      { transform: 'scale(1) translateY(0)' },
      { transform: 'scale(1.12, 0.94) translateY(3px)', offset: 0.5 },
      { transform: 'scale(1) translateY(0)' },
    ],
    options: { duration: 300, easing: 'ease-out', delay: STOMP_MS },
  },
  'hand-bump': {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-4px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 260, iterations: 3, easing: 'ease-in-out' },
  },
  brighten: {
    keyframes: [{ opacity: 0.45 }, { opacity: 1 }],
    options: {
      duration: 500,
      easing: 'ease-out',
      fill: 'forwards',
      delay: DUST_MS,
    },
  },
};

function Prowler() {
  return (
    <svg
      viewBox="0 0 40 56"
      className="h-24 w-auto drop-shadow-xl sm:h-28"
      aria-hidden="true"
    >
      <rect
        x="7"
        y="26"
        width="26"
        height="30"
        rx="6"
        className="fill-slate-950"
      />
      <path d="M9 28q11-34 22 0z" className="fill-slate-950" />
      <path d="M12 26q8-22 16 0z" className="fill-slate-900" />
      <ellipse cx="20" cy="19" rx="6" ry="5" className="fill-slate-800" />
      <circle cx="17.5" cy="18" r="1.4" className="fill-amber-200" />
      <circle cx="22.5" cy="18" r="1.4" className="fill-amber-200" />
      <rect
        x="9"
        y="48"
        width="8"
        height="8"
        rx="2"
        className="fill-slate-950"
      />
      <rect
        x="23"
        y="48"
        width="8"
        height="8"
        rx="2"
        className="fill-slate-950"
      />
      <path
        d="M8 34q-5 6 0 12"
        className="fill-none stroke-slate-950"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Bouncer() {
  return (
    <div
      data-anim="step-out stomp breathe"
      className="relative origin-bottom opacity-0"
    >
      <svg
        viewBox="0 0 34 50"
        className="h-28 w-auto drop-shadow-xl sm:h-32"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="18"
          width="28"
          height="26"
          rx="5"
          className="fill-slate-900"
        />
        <rect
          x="8"
          y="20"
          width="18"
          height="4"
          rx="2"
          className="fill-slate-800"
        />
        <circle cx="17" cy="11" r="6" className="fill-amber-200" />
        <path
          d="M13 12h8"
          className="stroke-slate-900"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path d="M9 10q8-11 16 0z" className="fill-yellow-400" />
        <rect
          x="6"
          y="9"
          width="22"
          height="2.6"
          rx="1.3"
          className="fill-yellow-500"
        />
        <rect x="8" y="44" width="7" height="6" className="fill-slate-950" />
        <rect x="19" y="44" width="7" height="6" className="fill-slate-950" />
      </svg>
      <span
        data-anim="hand-bump"
        data-anim-delay={DUST_MS}
        className="absolute left-1 top-[44%] h-4 w-10 rotate-[-12deg] rounded-full bg-slate-800 ring-1 ring-slate-950"
      >
        <span className="absolute -right-0.5 top-0 h-4 w-4 rounded-full bg-amber-200" />
      </span>
      <span
        data-anim="hand-bump"
        data-anim-delay={DUST_MS + 130}
        className="absolute right-1 top-[49%] h-4 w-10 rotate-[12deg] rounded-full bg-slate-800 ring-1 ring-slate-950"
      >
        <span className="absolute -left-0.5 top-0 h-4 w-4 rounded-full bg-amber-200" />
      </span>
    </div>
  );
}

export default function HitBlockedScene({ character }: SabotageHitSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900"
        floor="bg-slate-900"
      >
        {/* the house front: the lit window upstairs, the door below */}
        <div className="absolute inset-x-[18%] bottom-[18%] top-0 bg-slate-800/80" />
        <div className="absolute left-[26%] top-[8%] h-[36%] w-[20%] rounded-sm border-4 border-slate-700 bg-amber-100/80 shadow-[0_0_24px_rgba(252,211,77,0.35)]" />
        <SceneActor
          character={character}
          className="left-[27%] top-[13%]"
          anim="snore"
          size="h-16 w-16 sm:h-20 sm:w-20"
          pose="origin-center rotate-[-70deg]"
        />
        {[
          { cls: 'left-[38%] top-[10%] text-xl', delay: 0 },
          { cls: 'left-[41%] top-[4%] text-base', delay: 900 },
          { cls: 'left-[44%] top-[1%] text-sm', delay: 1800 },
        ].map((z) => (
          <span
            key={z.cls}
            data-anim="drift"
            data-anim-delay={z.delay}
            className={`absolute z-30 font-black text-sky-50 drop-shadow-[0_0_5px_rgba(186,230,253,0.65)] ${z.cls}`}
          >
            Z
          </span>
        ))}

        <div className="absolute left-[56%] top-[40%] h-2.5 w-8 rounded-b-md bg-slate-600" />
        <span className="absolute left-[59%] top-[42%] h-2 w-3 rounded-b-full bg-amber-200 shadow-[0_0_10px_rgba(252,211,77,0.9)]" />
        <span
          data-anim="brighten"
          className="absolute left-[42%] top-[44%] h-[38%] w-[38%] bg-gradient-to-b from-amber-200/45 via-amber-100/15 to-transparent opacity-45 [clip-path:polygon(46%_0,54%_0,100%_100%,0_100%)]"
        />
        <div className="absolute bottom-[18%] left-[52%] h-[36%] w-[16%] rounded-t-md border-4 border-b-0 border-slate-700 bg-slate-950">
          <span
            data-anim="door-open"
            className="absolute inset-0 origin-left bg-amber-200/30"
          />
        </div>

        <div className="absolute bottom-[18%] left-[54%] z-30">
          <Bouncer />
        </div>

        {/* the prowler and his parcel come in together and leave apart */}
        <div
          data-anim="creep fling"
          className="absolute bottom-[18%] left-[72%] z-20 opacity-0"
        >
          <Prowler />
        </div>
        <div
          data-anim="creep tumble"
          className="absolute bottom-[24%] left-[71%] z-30 opacity-0"
        >
          <span className="block h-6 w-8 rounded-sm border border-amber-900 bg-amber-700 shadow-lg">
            <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-amber-950/70" />
          </span>
        </div>
      </SceneFrame>
    </div>
  );
}
