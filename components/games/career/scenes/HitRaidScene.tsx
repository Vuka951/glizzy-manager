'use client';

import { useRef } from 'react';
import PoliceOfficer from '@/components/games/career/PoliceOfficer';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import type { SabotageHitSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

export type RaidVariant = 'tax' | 'stash' | 'island' | 'smuggling';

const MARCH_MS = 300;
const THUD_MS = 1300;
const THUD_TWO_MS = 1700;
const PAPERS_MS = 2600;
const PRESS_MS = 3200;
const SEIZE_MS = 3800;

// The room is a fixed-width composition centered on the stage, so every
// walk and hand-off is measured in pixels that hold on any screen
const CUSTOM: Record<string, SceneAnimationSpec> = {
  'door-open': {
    keyframes: [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.12)' }],
    options: { duration: 350, easing: 'ease-out', fill: 'both' },
  },
  'march-far': {
    keyframes: [
      { transform: 'translateX(380px)', opacity: 0 },
      { transform: 'translateX(360px)', opacity: 1, offset: 0.06 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    options: { duration: 1100, easing: 'ease-in-out', fill: 'both' },
  },
  'march-near': {
    keyframes: [
      { transform: 'translateX(170px)', opacity: 0 },
      { transform: 'translateX(160px)', opacity: 1, offset: 0.06 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    options: { duration: 1100, easing: 'ease-in-out', fill: 'both' },
  },
  stomp: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-5px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 240, iterations: 5, easing: 'ease-in-out' },
  },
  'door-shake': {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-3px, 1px)', offset: 0.25 },
      { transform: 'translate(3px, -1px)', offset: 0.5 },
      { transform: 'translate(-2px, 0)', offset: 0.75 },
      { transform: 'translate(0, 0)' },
    ],
    options: { duration: 320, easing: 'linear', fill: 'both' },
  },
  startle: {
    keyframes: [
      { transform: 'translate(0, 0) scale(1)' },
      { transform: 'translate(-3px, -6px) scale(1.06)', offset: 0.2 },
      { transform: 'translate(3px, -6px) scale(1.06)', offset: 0.5 },
      { transform: 'translate(-2px, -3px) scale(1.03)', offset: 0.8 },
      { transform: 'translate(0, 0) scale(1)' },
    ],
    options: { duration: 480, easing: 'ease-out', fill: 'both' },
  },
  'locker-open': {
    keyframes: [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.1)' }],
    options: { duration: 300, easing: 'ease-out', fill: 'both' },
  },
  'fly-card': {
    keyframes: [
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 0 },
      {
        transform: 'translate(26px, -26px) rotate(-30deg)',
        opacity: 1,
        offset: 0.2,
      },
      {
        transform: 'translate(52px, 10px) rotate(40deg)',
        opacity: 1,
        offset: 0.6,
      },
      { transform: 'translate(70px, 70px) rotate(75deg)', opacity: 1 },
    ],
    options: { duration: 1300, easing: 'ease-in', fill: 'both' },
  },
  'flash-once': {
    keyframes: [{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 0 }],
    options: { duration: 900, easing: 'ease-out', fill: 'both' },
  },
  reach: {
    keyframes: [
      { transform: 'translateX(0) rotate(0deg)' },
      { transform: 'translateX(-10px) rotate(-12deg)', offset: 0.5 },
      { transform: 'translateX(0) rotate(0deg)' },
    ],
    options: { duration: 700, easing: 'ease-in-out', fill: 'both' },
  },
  'hold-up': {
    keyframes: [
      { transform: 'translate(-14px, 40px) scale(0.5)', opacity: 0 },
      {
        transform: 'translate(-8px, 20px) scale(0.9)',
        opacity: 1,
        offset: 0.4,
      },
      { transform: 'translate(0, -6px) scale(1.2)', opacity: 1, offset: 0.8 },
      { transform: 'translate(0, 0) scale(1.1)', opacity: 1 },
    ],
    options: {
      duration: 700,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  'arm-up': {
    keyframes: [
      { transform: 'rotate(0deg)', opacity: 0 },
      { transform: 'rotate(0deg)', opacity: 1, offset: 0.3 },
      { transform: 'rotate(-160deg)', opacity: 1 },
    ],
    options: { duration: 600, easing: 'ease-out', fill: 'both' },
  },
};

const CARDS = [0, 220, 440];
const FLASHES = [
  { cls: 'right-[-10px] top-[10%]', delay: 0 },
  { cls: 'right-[40px] top-[30%]', delay: 260 },
  { cls: 'right-[-6px] top-[52%]', delay: 520 },
];

function SeizedItem({ variant }: { variant: RaidVariant }) {
  if (variant === 'tax') {
    return (
      <svg
        viewBox="0 0 32 22"
        className="h-7 w-auto drop-shadow"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="12"
          width="28"
          height="8"
          rx="1.5"
          className="fill-emerald-700"
        />
        <rect
          x="3"
          y="7"
          width="28"
          height="8"
          rx="1.5"
          className="fill-emerald-600"
        />
        <rect
          x="2"
          y="2"
          width="28"
          height="8"
          rx="1.5"
          className="fill-emerald-500"
        />
        <rect
          x="12"
          y="2"
          width="8"
          height="8"
          className="fill-emerald-200/70"
        />
      </svg>
    );
  }
  if (variant === 'stash') {
    return (
      <svg
        viewBox="0 0 32 26"
        className="h-7 w-auto drop-shadow"
        aria-hidden="true"
      >
        <rect x="4" y="9" width="9.5" height="4.6" rx="2.3" className="fill-amber-500" />
        <rect x="4.8" y="7.4" width="8" height="3.4" rx="1.7" className="fill-red-400" />
        <rect x="18.5" y="9" width="9.5" height="4.6" rx="2.3" className="fill-amber-500" />
        <rect x="19.3" y="7.4" width="8" height="3.4" rx="1.7" className="fill-red-400" />
        <rect x="11.2" y="4.4" width="9.5" height="4.6" rx="2.3" className="fill-amber-500" />
        <rect x="12" y="2.8" width="8" height="3.4" rx="1.7" className="fill-red-400" />
        <rect x="2" y="12" width="28" height="12" rx="1.5" className="fill-amber-700" />
        <path
          d="M2 16h28M11.3 12v12M20.6 12v12"
          className="fill-none stroke-amber-900"
          strokeWidth="1.2"
        />
      </svg>
    );
  }
  if (variant === 'island') {
    return (
      <svg
        viewBox="0 0 30 24"
        className="h-7 w-auto drop-shadow"
        aria-hidden="true"
      >
        <path d="M2 4h10l2 3h14v15H2z" className="fill-amber-500" />
        <rect
          x="2"
          y="9"
          width="26"
          height="13"
          rx="1"
          className="fill-amber-400"
        />
        <circle cx="22" cy="16" r="4" className="fill-red-700" />
        <circle cx="22" cy="16" r="2" className="fill-red-500" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 26 30"
      className="h-8 w-auto drop-shadow"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="8"
        width="20"
        height="21"
        rx="3"
        className="fill-yellow-400"
      />
      <rect
        x="6"
        y="12"
        width="14"
        height="10"
        rx="1.5"
        className="fill-yellow-300"
      />
      <rect
        x="8"
        y="2"
        width="10"
        height="7"
        rx="2"
        className="fill-yellow-500"
      />
      <rect
        x="19"
        y="4"
        width="6"
        height="4"
        rx="1"
        className="fill-yellow-500"
      />
    </svg>
  );
}

export default function HitRaidScene({
  character,
  variant,
}: SabotageHitSceneProps & { variant: RaidVariant }) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM, [variant]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900"
        floor="bg-slate-700"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(148,163,184,0.18),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-[18%] h-[40%] bg-slate-800/60" />
        <div className="absolute inset-x-0 bottom-[58%] h-1 bg-slate-600/60" />

        <div className="absolute bottom-[18%] left-1/2 h-[82%] w-[440px] origin-bottom -translate-x-1/2 scale-[0.78] sm:scale-100">
          {/* the door on the right wall, then the frame it swings in */}
          <div
            data-anim="door-shake door-shake"
            data-anim-delay={`${THUD_MS} ${THUD_TWO_MS}`}
            className="absolute bottom-0 right-0 z-10 h-[76%] w-16 rounded-t-md border-4 border-b-0 border-slate-500 bg-slate-950"
          >
            <span
              data-anim="door-open"
              data-anim-delay={MARCH_MS}
              className="absolute inset-0 origin-right bg-slate-800"
            >
              <span className="absolute left-2 top-1/2 h-2 w-2 rounded-full bg-amber-300" />
              <span className="absolute inset-x-3 top-3 h-[30%] rounded-sm border border-slate-600/70" />
            </span>
          </div>
          {[THUD_MS, THUD_TWO_MS].map((delay) => (
            <span
              key={delay}
              data-anim="ring-out"
              data-anim-delay={delay}
              className="absolute bottom-[34%] right-1 z-20 h-14 w-14 rounded-full border-4 border-slate-50/80 opacity-0"
            />
          ))}
          {FLASHES.map((f) => (
            <span
              key={f.cls}
              data-anim="flash-once"
              data-anim-delay={PRESS_MS + f.delay}
              className={`absolute z-40 h-14 w-14 rounded-full bg-slate-50 opacity-0 blur-md ${f.cls}`}
            />
          ))}

          {/* the locker, shoulder to shoulder with its owner */}
          <div className="absolute bottom-0 left-[74px] z-10 h-[70%] w-12 rounded-t-sm bg-slate-500 shadow-lg">
            <span className="absolute inset-0 bg-slate-700/70" />
            {CARDS.map((delay) => (
              <span
                key={delay}
                data-anim="fly-card"
                data-anim-delay={PAPERS_MS + delay}
                className="absolute left-2 top-[30%] z-30 h-5 w-4 rounded-sm bg-slate-50 opacity-0 shadow"
              >
                <span className="absolute inset-x-0.5 top-1 h-px bg-slate-400" />
                <span className="absolute inset-x-0.5 top-2 h-px bg-slate-400" />
                <span className="absolute inset-x-0.5 top-3 h-px bg-slate-400" />
              </span>
            ))}
            <span
              data-anim="locker-open"
              data-anim-delay={PAPERS_MS - 150}
              className="absolute inset-0 z-20 origin-left rounded-t-sm bg-slate-500"
            >
              <span className="absolute inset-x-1.5 top-2 h-1 rounded-full bg-slate-800" />
              <span className="absolute inset-x-1.5 top-4 h-1 rounded-full bg-slate-800" />
              <span className="absolute right-1.5 top-[45%] h-3 w-1 rounded-full bg-slate-300" />
            </span>
          </div>
          <div className="absolute bottom-0 left-[250px] h-3 w-24 rounded-sm bg-amber-900 shadow" />
          <div className="absolute -bottom-3 left-[254px] h-3 w-1.5 bg-amber-950" />
          <div className="absolute -bottom-3 left-[338px] h-3 w-1.5 bg-amber-950" />

          {/* the man in question, caught half awake */}
          <SceneActor
            character={character}
            className="bottom-1 left-[122px]"
            anim="startle gray-out shake"
            animDelay={`${THUD_MS} ${SEIZE_MS} ${SEIZE_MS}`}
            animIterations={`1 1 6`}
            pose="origin-bottom"
          />

          {/* the officers: in through the door, one to each side of him */}
          <div
            data-anim="march-far"
            data-anim-delay={MARCH_MS}
            className="absolute bottom-0 left-[12px] z-30 opacity-0"
          >
            <div
              data-anim="stomp reach"
              data-anim-delay={`${MARCH_MS} ${SEIZE_MS - 500}`}
              className="relative origin-bottom [&>svg]:h-20 [&>svg]:w-auto sm:[&>svg]:h-24"
            >
              <PoliceOfficer />
              <span
                data-anim="arm-up"
                data-anim-delay={SEIZE_MS - 200}
                className="absolute right-0 top-[40%] h-9 w-3 origin-top rounded-full bg-blue-900 opacity-0"
              />
              <span
                data-anim="hold-up"
                data-anim-delay={SEIZE_MS}
                className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0"
              >
                <SeizedItem variant={variant} />
              </span>
            </div>
          </div>
          <div
            data-anim="march-near"
            data-anim-delay={MARCH_MS + 80}
            className="absolute bottom-0 left-[224px] z-30 opacity-0"
          >
            <div
              data-anim="stomp"
              data-anim-delay={MARCH_MS + 80}
              className="[&>svg]:h-20 [&>svg]:w-auto sm:[&>svg]:h-24"
            >
              <PoliceOfficer flip />
            </div>
          </div>
        </div>

        <span
          data-anim="flash-once"
          data-anim-delay={PRESS_MS}
          className="pointer-events-none absolute inset-0 z-40 bg-slate-50/25 opacity-0"
        />
      </SceneFrame>
    </div>
  );
}
