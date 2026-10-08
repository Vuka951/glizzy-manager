'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import MoonIcon from '@/components/icons/MoonIcon';
import NoseIcon from '@/components/icons/NoseIcon';
import type { SabotageHitSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const LAPS = [300, 1500, 2700];
const LAP_MS = 1200;
const SPILL_MS = 3300;
const CAT_MS = 3900;
const WAKE_MS = 4300;

// The laps move `left` inside the house box, so a pass covers the whole
// house whatever width the stage renders at
const CUSTOM: Record<string, SceneAnimationSpec> = {
  'lap-back': {
    keyframes: [
      { left: '-8%', opacity: 0 },
      { left: '0%', opacity: 1, offset: 0.1 },
      { left: '96%', opacity: 1, offset: 0.9 },
      { left: '104%', opacity: 0 },
    ],
    options: { duration: LAP_MS / 2, easing: 'linear', fill: 'both' },
  },
  'lap-front': {
    keyframes: [
      { left: '104%', opacity: 0 },
      { left: '96%', opacity: 1, offset: 0.1 },
      { left: '-4%', opacity: 1, offset: 0.9 },
      { left: '-12%', opacity: 0 },
    ],
    options: { duration: LAP_MS / 2, easing: 'linear', fill: 'both' },
  },
  waddle: {
    keyframes: [
      { transform: 'rotate(-4deg) translateY(0)' },
      { transform: 'rotate(4deg) translateY(-3px)' },
      { transform: 'rotate(-4deg) translateY(0)' },
    ],
    options: { duration: 320, iterations: Infinity, easing: 'ease-in-out' },
  },
  'stop-at-door': {
    keyframes: [
      { left: '80%', opacity: 0 },
      { left: '72%', opacity: 1, offset: 0.4 },
      { left: '72%', opacity: 1 },
    ],
    options: { duration: 700, easing: 'ease-out', fill: 'both' },
  },
  'bottle-tip': {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-125deg)', offset: 0.6 },
      { transform: 'rotate(-125deg)' },
    ],
    options: { duration: 900, easing: 'ease-in-out', fill: 'both' },
  },
  stream: {
    keyframes: [
      { transform: 'scaleY(0)', opacity: 0 },
      { transform: 'scaleY(1)', opacity: 1, offset: 0.3 },
      { transform: 'scaleY(1)', opacity: 1, offset: 0.8 },
      { transform: 'scaleY(1)', opacity: 0 },
    ],
    options: { duration: 1100, easing: 'ease-out', fill: 'both' },
  },
  puddle: {
    keyframes: [
      { transform: 'scaleX(0)', opacity: 0 },
      { transform: 'scaleX(1)', opacity: 1 },
    ],
    options: { duration: 900, easing: 'ease-out', fill: 'both' },
  },
  'curse-smoke': {
    keyframes: [
      { transform: 'translateY(0) scale(0.6)', opacity: 0 },
      { transform: 'translateY(-30px) scale(1)', opacity: 0.8, offset: 0.3 },
      { transform: 'translateY(-95px) scale(1.6)', opacity: 0 },
    ],
    options: { duration: 2200, iterations: Infinity, easing: 'ease-out' },
  },
  'cat-cross': {
    keyframes: [
      { left: '-12%', opacity: 0 },
      { left: '-6%', opacity: 1, offset: 0.08 },
      { left: '104%', opacity: 1, offset: 0.95 },
      { left: '110%', opacity: 0 },
    ],
    options: { duration: 2200, easing: 'linear', fill: 'both' },
  },
  'stop-drift': {
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: { duration: 300, easing: 'ease-out', fill: 'forwards' },
  },
  flicker: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0.2, offset: 0.1 },
      { opacity: 1, offset: 0.2 },
      { opacity: 0.4, offset: 0.35 },
      { opacity: 1, offset: 0.5 },
      { opacity: 0.7 },
    ],
    options: { duration: 700, easing: 'linear', fill: 'forwards' },
  },
  jolt: {
    keyframes: [
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-10px) rotate(-6deg)', offset: 0.3 },
      { transform: 'translateY(0) rotate(4deg)', offset: 0.6 },
      { transform: 'translateY(0) rotate(0deg)' },
    ],
    options: { duration: 600, easing: 'ease-out', fill: 'forwards' },
  },
  'haze-pulse': {
    keyframes: [
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 0.9, transform: 'scale(1.15)', offset: 0.5 },
      { opacity: 0.55, transform: 'scale(1)' },
    ],
    options: { duration: 1400, iterations: Infinity, easing: 'ease-in-out' },
  },
};

const STARS = [
  'left-[6%] top-[8%]',
  'left-[14%] top-[26%]',
  'left-[46%] top-[6%]',
  'left-[70%] top-[14%]',
  'left-[84%] top-[30%]',
  'left-[94%] top-[8%]',
];

const SMOKE = [
  { cls: 'left-0', delay: 0 },
  { cls: 'left-3', delay: 700 },
  { cls: 'left-6', delay: 1400 },
];

function Witch({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 60"
      className={`w-auto drop-shadow-xl ${className}`}
      aria-hidden="true"
    >
      <path d="M6 60 L20 26 L34 60 Z" className="fill-slate-950" />
      <path
        d="M12 46 q-8 -6 -2 -18"
        className="fill-none stroke-slate-950"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M28 44 q8 -4 6 -16"
        className="fill-none stroke-slate-950"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="7" className="fill-emerald-900" />
      <path d="M24 19 l6 3 -5 1z" className="fill-emerald-800" />
      <circle cx="18" cy="18" r="1.3" className="fill-amber-300" />
      <rect
        x="6"
        y="14"
        width="28"
        height="3"
        rx="1.5"
        className="fill-slate-950"
      />
      <path d="M11 14 L22 0 L26 14 Z" className="fill-slate-950" />
      <rect x="12" y="11" width="10" height="3" className="fill-purple-700" />
    </svg>
  );
}

function SleepMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path
        d="M2 2h8L2 10h8"
        className="fill-none stroke-sky-100"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HitCurseScene({ character }: SabotageHitSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-indigo-950 to-indigo-900"
        floor="bg-slate-950"
      >
        {STARS.map((cls, i) => (
          <span
            key={cls}
            data-anim="blink"
            data-anim-delay={i * 420}
            data-anim-duration={1500 + i * 180}
            className={`absolute h-1 w-1 rounded-full bg-slate-100 ${cls}`}
          />
        ))}
        <span className="absolute right-[6%] top-[6%]">
          <MoonIcon className="h-10 w-10 text-amber-100 drop-shadow-[0_0_16px_rgba(254,243,199,0.6)]" />
        </span>
        <div className="absolute inset-x-0 bottom-[18%] h-[10%] bg-indigo-950/70" />

        {/* the house: everything that touches it lives inside this box */}
        <div className="absolute bottom-[18%] left-[16%] h-[58%] w-[46%]">
          {/* laps behind the house */}
          {LAPS.map((delay) => (
            <div
              key={`back-${delay}`}
              data-anim="lap-back"
              data-anim-delay={delay}
              className="absolute bottom-3 z-0 opacity-0"
            >
              <div data-anim="waddle" className="origin-bottom">
                <Witch className="h-10 opacity-70 sm:h-12" />
              </div>
            </div>
          ))}

          <div className="absolute inset-x-0 bottom-0 top-[22%] z-10 rounded-t-sm bg-slate-700 shadow-2xl">
            <span className="absolute inset-x-0 top-0 h-1 bg-slate-600" />
            <span className="absolute inset-y-3 left-[6%] w-px bg-slate-800/60" />
            <span className="absolute inset-y-3 right-[6%] w-px bg-slate-800/60" />
          </div>
          <div className="absolute inset-x-[-6%] top-0 z-10 h-[26%] bg-slate-600 [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
          <div className="absolute inset-x-[-4%] top-[3%] z-10 h-[24%] bg-slate-800 [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
          <span className="absolute right-[18%] top-[2%] z-10 h-[16%] w-[7%] bg-slate-700" />

          {/* the lit window with the sleeper */}
          <div
            data-anim="flicker"
            data-anim-delay={WAKE_MS}
            className="absolute left-[10%] top-[30%] z-10 h-[40%] w-[30%] rounded-sm border-4 border-slate-800 bg-amber-200/90 shadow-[0_0_28px_rgba(252,211,77,0.55)]"
          >
            <span className="absolute inset-x-0 top-1/2 h-1 bg-slate-800/70" />
            <span className="absolute inset-y-0 left-1/2 w-1 bg-slate-800/70" />
          </div>
          <SceneActor
            character={character}
            className="left-[11%] top-[30%]"
            anim="jolt"
            animDelay={WAKE_MS}
            size="h-14 w-14 sm:h-16 sm:w-16"
            pose="origin-bottom"
          >
            <span
              data-anim="haze-pulse"
              data-anim-delay={WAKE_MS + 200}
              className="absolute inset-x-0 top-[55%] h-7 rounded-full bg-slate-400/80 opacity-0 blur-[3px]"
            />
          </SceneActor>
          <div
            data-anim="stop-drift"
            data-anim-delay={WAKE_MS}
            className="absolute left-[30%] top-[22%] z-30"
          >
            {[0, 900, 1800].map((delay, i) => (
              <span
                key={delay}
                data-anim="drift"
                data-anim-delay={delay}
                className="absolute"
              >
                <SleepMark className={i === 0 ? 'h-5 w-5' : 'h-3.5 w-3.5'} />
              </span>
            ))}
          </div>
          <div
            data-anim="pop-in"
            data-anim-delay={WAKE_MS + 400}
            className="absolute left-[14%] top-[2%] z-40 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/80 opacity-0 ring-2 ring-red-500/70"
          >
            <NoseIcon className="h-8 w-8 text-slate-200" />
            <span className="absolute h-1.5 w-11 rotate-45 rounded-full bg-red-500" />
          </div>

          {/* the front door with its step */}
          <div className="absolute bottom-0 left-[64%] z-10 h-[38%] w-[16%] rounded-t-md border-4 border-b-0 border-slate-800 bg-amber-950">
            <span className="absolute right-1.5 top-1/2 h-1.5 w-1.5 rounded-full bg-amber-300" />
          </div>
          <div className="absolute -bottom-1.5 left-[61%] z-10 h-2 w-[22%] rounded-sm bg-slate-600" />

          {/* the spill on the step, and the smoke that climbs to the window */}
          <span
            data-anim="puddle"
            data-anim-delay={SPILL_MS + 700}
            className="absolute -bottom-1 left-[58%] z-20 h-2.5 w-[28%] origin-left rounded-full bg-purple-500 opacity-0 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
          />
          {SMOKE.map((s) => (
            <span
              key={s.cls}
              data-anim="curse-smoke"
              data-anim-delay={SPILL_MS + 1000 + s.delay}
              className={`absolute bottom-1 left-[66%] z-20 h-6 w-6 rounded-full bg-gradient-to-t from-purple-500/70 to-emerald-400/60 opacity-0 blur-[2px] ${s.cls}`}
            />
          ))}

          {/* laps in front of the house */}
          {LAPS.map((delay) => (
            <div
              key={`front-${delay}`}
              data-anim="lap-front"
              data-anim-delay={delay + LAP_MS / 2}
              className="absolute -bottom-1 z-30 opacity-0"
            >
              <div data-anim="waddle" className="origin-bottom">
                <Witch className="h-16 sm:h-20" />
              </div>
            </div>
          ))}

          {/* the stop at the door: bottle tipped over the step */}
          <div
            data-anim="stop-at-door"
            data-anim-delay={SPILL_MS}
            className="absolute -bottom-1 z-30 opacity-0"
          >
            <Witch className="h-16 sm:h-20" />
            <span
              data-anim="bottle-tip"
              data-anim-delay={SPILL_MS + 300}
              className="absolute -left-2 bottom-5 h-7 w-3 origin-bottom-right rounded-sm bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
            >
              <span className="absolute inset-x-0.5 top-0 h-2 rounded-t-sm bg-purple-700" />
            </span>
            <span
              data-anim="stream"
              data-anim-delay={SPILL_MS + 700}
              className="absolute -left-3 bottom-0 h-7 w-1 origin-top rounded-full bg-purple-300 opacity-0"
            />
          </div>
        </div>

        {/* the black cat crossing the yard */}
        <div
          data-anim="cat-cross"
          data-anim-delay={CAT_MS}
          className="absolute bottom-[13%] z-40 opacity-0"
        >
          <svg viewBox="0 0 40 20" className="h-9 w-auto" aria-hidden="true">
            <ellipse
              cx="18"
              cy="13"
              rx="14"
              ry="6"
              className="fill-slate-950"
            />
            <circle cx="31" cy="9" r="5" className="fill-slate-950" />
            <path
              d="M27 6 l1 -5 3 4z M33 5 l3 -4 1 5z"
              className="fill-slate-950"
            />
            <path
              d="M4 12 q-6 -6 -2 -11"
              className="fill-none stroke-slate-950"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="29.5" cy="9" r="1.1" className="fill-amber-300" />
            <circle cx="33" cy="9" r="1.1" className="fill-amber-300" />
          </svg>
        </div>
      </SceneFrame>
    </div>
  );
}
