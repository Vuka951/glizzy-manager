'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import HeartIcon from '@/components/icons/HeartIcon';
import HeartbreakIcon from '@/components/icons/HeartbreakIcon';
import type { SabotageHitSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

export type CatfishVariant = 'date' | 'zeka' | 'demons';

const DATE_SEAT_MS = 500;
const DATE_FLASH_MS = 2300;
const DATE_REVEAL_MS = 2500;
const DATE_BREAK_MS = 2900;
const ZEKA_WALK_MS = 400;
const ZEKA_EYES_MS = 1600;
const ZEKA_LUNGE_MS = 2600;
const ZEKA_CLAW_MS = 2900;
const ZEKA_TOSS_MS = 3000;
const ZEKA_PAINT_MS = 3200;
const ZEKA_EYES_OUT_MS = 3900;
const DEMON_IN_MS = 300;
const DEMON_SALT_MS = 2400;
const DEMON_CHAIN_MS = 2600;
const DEMON_LUNGE_MS = 3000;
const DEMON_DAWN_MS = 4200;

// Every set hangs its props off one anchor in px, so the table, the beast
// and the door land on the player at any stage width
const CUSTOM: Record<string, SceneAnimationSpec> = {
  'lean-then-back': {
    keyframes: [
      { transform: 'rotate(0deg) translateX(0)' },
      { transform: 'rotate(8deg) translateX(8px)', offset: 0.2 },
      { transform: 'rotate(8deg) translateX(8px)', offset: 0.82 },
      { transform: 'rotate(-12deg) translateX(-14px)', offset: 1 },
    ],
    options: {
      duration: DATE_BREAK_MS + 400,
      easing: 'ease-in-out',
      fill: 'forwards',
    },
  },
  'flash-once': {
    keyframes: [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 0 }],
    options: { duration: 500, easing: 'ease-out', fill: 'both' },
  },
  candle: {
    keyframes: [
      { transform: 'scale(1) rotate(-6deg)' },
      { transform: 'scale(1.2) rotate(6deg)' },
      { transform: 'scale(0.9) rotate(-4deg)' },
      { transform: 'scale(1) rotate(-6deg)' },
    ],
    options: { duration: 700, iterations: Infinity, easing: 'ease-in-out' },
  },
  gutter: {
    keyframes: [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
    options: { duration: 500, easing: 'ease-in', fill: 'forwards' },
  },
  'fade-out': {
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: { duration: 350, easing: 'ease-out', fill: 'forwards' },
  },
  'card-drop': {
    keyframes: [
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: 'translateY(60px) rotate(40deg)', opacity: 0 },
    ],
    options: { duration: 500, easing: 'ease-in', fill: 'forwards' },
  },
  'roll-in': {
    keyframes: [
      { transform: 'translateX(320px)', opacity: 0 },
      { transform: 'translateX(300px)', opacity: 1, offset: 0.08 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    options: {
      duration: 700,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  'walk-in': {
    keyframes: [
      { transform: 'translateX(-150px)', opacity: 0 },
      { transform: 'translateX(-130px)', opacity: 1, offset: 0.1 },
      { transform: 'translateX(0)', opacity: 1 },
    ],
    options: {
      duration: ZEKA_EYES_MS - ZEKA_WALK_MS,
      easing: 'ease-in-out',
      fill: 'both',
    },
  },
  // Open in the dark, hold through the lunge, blink out at the retreat
  'eyes-life': {
    keyframes: [
      { transform: 'scale(0)', opacity: 0, offset: 0 },
      { transform: 'scale(1.2)', opacity: 1, offset: 0.14 },
      { transform: 'scale(1)', opacity: 1, offset: 0.2 },
      { transform: 'scale(1)', opacity: 1, offset: 0.92 },
      { transform: 'scaleY(0.1)', opacity: 0, offset: 1 },
    ],
    options: {
      duration: ZEKA_EYES_OUT_MS - ZEKA_EYES_MS,
      easing: 'ease-out',
      fill: 'both',
    },
  },
  'body-show': {
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: { duration: 250, easing: 'ease-out', fill: 'both' },
  },
  lunge: {
    keyframes: [
      { transform: 'translateX(0) scale(0.9)', opacity: 1, offset: 0 },
      { transform: 'translateX(-20px) scale(1.05)', opacity: 1, offset: 0.15 },
      { transform: 'translateX(-150px) scale(1.15)', opacity: 1, offset: 0.35 },
      { transform: 'translateX(-150px) scale(1.15)', opacity: 1, offset: 0.6 },
      { transform: 'translateX(30px) scale(0.85)', opacity: 1, offset: 0.9 },
      { transform: 'translateX(40px) scale(0.8)', opacity: 0, offset: 1 },
    ],
    options: {
      duration: ZEKA_EYES_OUT_MS - ZEKA_LUNGE_MS,
      easing: 'ease-in-out',
      fill: 'both',
    },
  },
  swipe: {
    keyframes: [
      { transform: 'rotate(-20deg) scale(0.6)', opacity: 0 },
      { transform: 'rotate(0deg) scale(1)', opacity: 1, offset: 0.35 },
      { transform: 'rotate(10deg) scale(1.1)', opacity: 0 },
    ],
    options: { duration: 550, easing: 'ease-out', fill: 'both' },
  },
  toss: {
    keyframes: [
      { transform: 'translateX(0) translateY(0) rotate(0deg)' },
      {
        transform: 'translateX(-60px) translateY(-46px) rotate(-200deg)',
        offset: 0.5,
      },
      { transform: 'translateX(-100px) translateY(0) rotate(-360deg)' },
    ],
    options: { duration: 650, easing: 'ease-out', fill: 'forwards' },
  },
  splat: {
    keyframes: [
      { transform: 'scale(0) rotate(-30deg)', opacity: 0 },
      { transform: 'scale(1.25) rotate(5deg)', opacity: 1, offset: 0.6 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
    ],
    options: {
      duration: 380,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  drip: {
    keyframes: [
      { transform: 'scaleY(0)', opacity: 0 },
      { transform: 'scaleY(0.2)', opacity: 1, offset: 0.2 },
      { transform: 'scaleY(1)', opacity: 1 },
    ],
    options: { duration: 700, easing: 'ease-in', fill: 'both' },
  },
  fling: {
    keyframes: [
      { transform: 'translate(0, 0) scale(1)', opacity: 0 },
      { transform: 'translate(0, 0) scale(1)', opacity: 1, offset: 0.1 },
      { transform: 'translate(var(--fx), var(--fy)) scale(0.4)', opacity: 0 },
    ],
    options: { duration: 600, easing: 'ease-out', fill: 'both' },
  },
  creep: {
    keyframes: [
      { transform: 'translateX(-30px)', opacity: 0 },
      { transform: 'translateX(-24px)', opacity: 1, offset: 0.1 },
      { transform: 'translateX(var(--creep))', opacity: 1 },
    ],
    options: { duration: 1500, easing: 'ease-in-out', fill: 'both' },
  },
  // Added on top of the creep: a last push at the door, then the salt line
  // throws them back
  'lunge-recoil': {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(28px)', offset: 0.3 },
      { transform: 'translateX(-40px)', offset: 0.7 },
      { transform: 'translateX(-40px)' },
    ],
    options: { duration: 900, easing: 'ease-in-out', fill: 'forwards' },
  },
  'door-bulge': {
    keyframes: [
      { transform: 'scaleX(1) skewY(0deg)' },
      { transform: 'scaleX(1.12) skewY(-3deg)', offset: 0.25 },
      { transform: 'scaleX(0.98) skewY(1deg)', offset: 0.5 },
      { transform: 'scaleX(1.06) skewY(-1.5deg)', offset: 0.75 },
      { transform: 'scaleX(1) skewY(0deg)' },
    ],
    options: { duration: 450, easing: 'ease-in-out', fill: 'both' },
  },
  'lean-on-door': {
    keyframes: [
      { transform: 'rotate(0deg) translateX(0)' },
      { transform: 'rotate(-14deg) translateX(-8px)', offset: 0.2 },
      { transform: 'rotate(-14deg) translateX(-8px)', offset: 0.9 },
      { transform: 'rotate(-4deg) translateX(-4px) translateY(12px)' },
    ],
    options: {
      duration: DEMON_DAWN_MS + 500,
      easing: 'ease-in-out',
      fill: 'forwards',
    },
  },
  'draw-line': {
    keyframes: [
      { transform: 'scaleX(0)', opacity: 1 },
      { transform: 'scaleX(1)', opacity: 1 },
    ],
    options: { duration: 600, easing: 'ease-out', fill: 'both' },
  },
  'chain-drop': {
    keyframes: [
      { transform: 'translateY(-60px) rotate(-8deg)', opacity: 0 },
      { transform: 'translateY(6px) rotate(-8deg)', opacity: 1, offset: 0.7 },
      { transform: 'translateY(0) rotate(-8deg)', opacity: 1 },
    ],
    options: { duration: 500, easing: 'ease-in', fill: 'both' },
  },
  smoke: {
    keyframes: [
      { transform: 'translateY(0) scale(0.5)', opacity: 0 },
      { transform: 'translateY(-14px) scale(1)', opacity: 0.7, offset: 0.3 },
      { transform: 'translateY(-44px) scale(1.8)', opacity: 0 },
    ],
    options: { duration: 1800, easing: 'ease-out', fill: 'both' },
  },
  mist: {
    keyframes: [
      { transform: 'translateX(-6%)', opacity: 0.35 },
      { transform: 'translateX(6%)', opacity: 0.55 },
      { transform: 'translateX(-6%)', opacity: 0.35 },
    ],
    options: { duration: 5200, iterations: Infinity, easing: 'ease-in-out' },
  },
  'eye-glow': {
    keyframes: [{ opacity: 0.7 }, { opacity: 1 }, { opacity: 0.7 }],
    options: { duration: 900, iterations: Infinity, easing: 'ease-in-out' },
  },
};

const SPLATS = [
  { cls: 'left-[8%] top-[4%] h-[46%] w-[46%] text-red-500', delay: 0 },
  { cls: 'right-[4%] top-[18%] h-[42%] w-[42%] text-sky-400', delay: 180 },
  { cls: 'left-[26%] bottom-[2%] h-[44%] w-[44%] text-yellow-300', delay: 360 },
  { cls: 'left-[-2%] top-[46%] h-[36%] w-[36%] text-emerald-400', delay: 540 },
  { cls: 'right-[12%] bottom-[10%] h-[32%] w-[32%] text-pink-500', delay: 720 },
];

const SPLATTER_DOTS = [
  { cls: 'left-1/2 top-0 bg-red-500', fx: '-34px', fy: '-30px', delay: 0 },
  { cls: 'right-0 top-1/3 bg-sky-400', fx: '36px', fy: '-18px', delay: 180 },
  {
    cls: 'left-1/3 bottom-0 bg-yellow-300',
    fx: '-30px',
    fy: '28px',
    delay: 360,
  },
  { cls: 'left-0 top-1/2 bg-emerald-400', fx: '-38px', fy: '6px', delay: 540 },
  { cls: 'right-1/4 bottom-0 bg-pink-500', fx: '30px', fy: '30px', delay: 720 },
];

// Measured back from the door, which is the house's left edge at mid stage
const DEMONS = [
  { cls: 'right-[70px]', creep: '54px', delay: 0, height: 'h-20 sm:h-24' },
  { cls: 'right-[150px]', creep: '70px', delay: 220, height: 'h-16 sm:h-20' },
  { cls: 'right-[224px]', creep: '90px', delay: 440, height: 'h-14 sm:h-16' },
];

function PaintSplat({
  className,
  delay,
}: {
  className: string;
  delay: number;
}) {
  return (
    <span
      data-anim="splat"
      data-anim-delay={ZEKA_PAINT_MS + delay}
      className={`absolute opacity-0 ${className}`}
    >
      <svg
        viewBox="0 0 40 40"
        className="h-full w-full drop-shadow"
        aria-hidden="true"
      >
        <path
          d="M20 3c4 0 6 3 9 4s8 2 8 8c0 4-3 5-3 9s2 6-1 9-7 1-11 2-7 3-10 0-1-7-4-10-6-4-5-9 4-5 6-8 5-5 11-5z"
          className="fill-current"
        />
      </svg>
      <span
        data-anim="drip"
        data-anim-delay={ZEKA_PAINT_MS + delay + 200}
        className="absolute bottom-[-40%] left-[30%] h-[40%] w-[10%] origin-top rounded-full bg-current opacity-0"
      />
      <span
        data-anim="drip"
        data-anim-delay={ZEKA_PAINT_MS + delay + 320}
        className="absolute bottom-[-55%] left-[58%] h-[55%] w-[8%] origin-top rounded-full bg-current opacity-0"
      />
    </span>
  );
}

function Beast() {
  return (
    <svg
      viewBox="0 0 120 90"
      className="h-24 w-auto sm:h-28"
      aria-hidden="true"
    >
      <path
        d="M14 84 6 70l10-6-6-12 12-4-2-14 12 4 2-16 10 8 8-18 8 18 10-8 4 14 12-2-2 12 12 4-6 10 10 8-8 8 4 12z"
        className="fill-slate-950"
      />
      <path
        d="M22 40 14 12l18 18z M98 40l8-28-18 18z"
        className="fill-slate-950"
      />
      <path
        d="M22 38 17 20l11 14z M98 38l5-18-11 14z"
        className="fill-red-900/70"
      />
      <path
        d="M40 62q4 8 10 0l-2 12zM56 64q3 8 8 0l-1 11zM70 62q4 8 10 0l-2 12z"
        className="fill-slate-100"
      />
      <path
        d="M10 84l-6 4 8 2zM26 86l-6 4 8 2zM94 86l6 4-8 2zM110 84l6 4-8 2z"
        className="fill-slate-200"
      />
    </svg>
  );
}

function Demon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 60 100"
      className={`w-auto ${className}`}
      aria-hidden="true"
    >
      <path
        d="M18 30 8 4l14 18zM42 30l10-26-14 18z"
        className="fill-slate-950"
      />
      <path
        d="M30 18c12 0 18 10 18 22 0 6-4 9-6 14 8 4 12 10 12 22v24H6V76c0-12 4-18 12-22-2-5-6-8-6-14 0-12 6-22 18-22z"
        className="fill-slate-950"
      />
      <path
        d="M12 56 2 86l6 4 8-24zM48 56l10 30-6 4-8-24z"
        className="fill-slate-950"
      />
      <path
        d="M2 86l-2 8 4-2 1 6 3-6 3 5zM58 86l2 8-4-2-1 6-3-6-3 5z"
        className="fill-slate-900"
      />
      <circle
        cx="23"
        cy="36"
        r="3.2"
        className="fill-red-500"
        data-anim="eye-glow"
      />
      <circle
        cx="37"
        cy="36"
        r="3.2"
        className="fill-red-500"
        data-anim="eye-glow"
      />
    </svg>
  );
}

function DateSet({
  character,
}: {
  character: SabotageHitSceneProps['character'];
}) {
  return (
    <SceneFrame
      indoor="bg-gradient-to-b from-red-950 via-slate-950 to-slate-900"
      floor="bg-amber-950"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_45%_55%,rgba(251,191,36,0.16),transparent_55%)]" />
      <div className="absolute inset-x-0 top-[12%] flex justify-around opacity-40">
        {['h-10', 'h-14', 'h-10'].map((h, i) => (
          <span key={i} className={`w-px bg-amber-200/60 ${h}`}>
            <span className="absolute -ml-2 mt-[100%] block h-4 w-4 rounded-full bg-amber-300/40 blur-sm" />
          </span>
        ))}
      </div>

      {/* one anchor for the whole table: the player at its left, the date at its right */}
      <div className="absolute bottom-[18%] left-[14%] z-10 h-[150px] w-[320px]">
        <span className="absolute bottom-0 left-[132px] h-8 w-2 bg-amber-950" />
        <span className="absolute bottom-0 left-[178px] h-8 w-2 bg-amber-950" />
        <span className="absolute bottom-[30px] left-[92px] h-4 w-[130px] rounded-full bg-red-800 shadow-[0_6px_10px_rgba(2,6,23,0.6)]" />
        <span className="absolute bottom-[34px] left-[100px] h-1.5 w-[114px] rounded-full bg-red-100/70" />
        {/* candle */}
        <span className="absolute bottom-[46px] left-[154px] h-7 w-1.5 rounded-sm bg-amber-100" />
        <span
          data-anim="gutter"
          data-anim-delay={DATE_BREAK_MS}
          className="absolute bottom-[74px] left-[152px] origin-bottom"
        >
          <span
            data-anim="candle"
            className="block h-3.5 w-2.5 origin-bottom rounded-full bg-gradient-to-t from-orange-500 to-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.9)]"
          />
        </span>
        <span
          data-anim="smoke"
          data-anim-delay={DATE_BREAK_MS + 300}
          className="absolute bottom-[76px] left-[150px] h-4 w-4 rounded-full bg-slate-400/60 opacity-0 blur-sm"
        />
        {/* glasses */}
        {['left-[118px]', 'left-[196px]'].map((cls) => (
          <span key={cls} className={`absolute bottom-[46px] ${cls}`}>
            <span className="block h-2.5 w-3.5 rounded-b-full border border-slate-300/70 bg-red-600/80" />
            <span className="mx-auto block h-3 w-px bg-slate-300/70" />
            <span className="mx-auto block h-px w-3 bg-slate-300/70" />
          </span>
        ))}
        {/* the heart between the two chairs */}
        <span
          data-anim="float-up"
          data-anim-delay={DATE_SEAT_MS + 200}
          data-anim-iterations={1}
          className="absolute bottom-[96px] left-[150px] text-pink-400 opacity-0"
        >
          <HeartIcon className="h-6 w-6 drop-shadow" />
        </span>

        {/* the mark, leaning in for love, then away from the lens */}
        <SceneActor
          character={character}
          className="bottom-[26px] left-0"
          anim="lean-then-back"
          pose="origin-bottom"
        >
          <span
            data-anim="pop-in"
            data-anim-delay={DATE_BREAK_MS}
            className="absolute -right-3 -top-5 opacity-0"
          >
            <HeartbreakIcon className="h-8 w-8 drop-shadow" />
          </span>
        </SceneActor>

        {/* the date: a pink hood behind a menu, until the flash */}
        <div
          data-anim="fade-out"
          data-anim-delay={DATE_REVEAL_MS}
          className="absolute bottom-[26px] left-[222px] z-10"
        >
          <div
            data-anim="pop-in"
            data-anim-delay={DATE_SEAT_MS}
            className="opacity-0"
          >
            <svg
              viewBox="0 0 44 60"
              className="h-20 w-auto sm:h-24"
              aria-hidden="true"
            >
              <path
                d="M6 60V34C6 18 14 8 22 8s16 10 16 26v26z"
                className="fill-pink-500"
              />
              <ellipse
                cx="22"
                cy="26"
                rx="9"
                ry="11"
                className="fill-pink-900"
              />
              <path d="M8 60v-8l14-10 14 10v8z" className="fill-pink-600" />
            </svg>
            <span
              data-anim="card-drop"
              data-anim-delay={DATE_REVEAL_MS - 150}
              className="absolute -left-2 bottom-[14px] h-14 w-12 rotate-[-6deg] rounded-sm border border-amber-200 bg-amber-50 shadow-lg"
            >
              <span className="absolute inset-x-2 top-2 h-1 rounded bg-slate-900/70" />
              <span className="absolute inset-x-2 top-5 h-px bg-slate-400" />
              <span className="absolute inset-x-2 top-7 h-px bg-slate-400" />
              <span className="absolute inset-x-2 top-9 h-px bg-slate-400" />
              <span className="absolute inset-x-2 top-11 h-px bg-slate-400" />
            </span>
          </div>
        </div>

        {/* who was really sitting there, mic pointed at the mark */}
        <div
          data-anim="pop-in"
          data-anim-delay={DATE_REVEAL_MS}
          className="absolute bottom-0 left-[214px] z-20 opacity-0"
        >
          <svg
            viewBox="0 0 60 100"
            className="h-28 w-auto overflow-visible drop-shadow-xl sm:h-32"
            aria-hidden="true"
          >
            <rect
              x="14"
              y="40"
              width="32"
              height="60"
              rx="6"
              className="fill-slate-900"
            />
            <path d="M24 40h12l-6 22z" className="fill-slate-100" />
            <path d="M28 44h4l-2 16z" className="fill-red-600" />
            <circle cx="30" cy="22" r="13" className="fill-amber-200" />
            <path
              d="M17 18q13-12 26 0v-5q-13-8-26 0z"
              className="fill-slate-800"
            />
            <path
              d="M14 60 0 44"
              className="stroke-slate-900"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M4 46 -6 32"
              className="stroke-slate-500"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="-6" cy="31" r="5" className="fill-slate-300" />
            <rect
              x="18"
              y="98"
              width="10"
              height="2"
              className="fill-slate-950"
            />
            <rect
              x="32"
              y="98"
              width="10"
              height="2"
              className="fill-slate-950"
            />
          </svg>
        </div>

        {/* the camera rolls up behind him, lens on the mark */}
        <div
          data-anim="roll-in"
          data-anim-delay={DATE_REVEAL_MS}
          className="absolute bottom-0 left-[262px] z-10 opacity-0"
        >
          <svg
            viewBox="0 0 60 100"
            className="h-28 w-auto drop-shadow-xl sm:h-32"
            aria-hidden="true"
          >
            <rect
              x="16"
              y="18"
              width="40"
              height="26"
              rx="4"
              className="fill-slate-800"
            />
            <rect
              x="2"
              y="24"
              width="16"
              height="14"
              rx="3"
              className="fill-slate-700"
            />
            <circle
              cx="4"
              cy="31"
              r="6"
              className="fill-slate-950 stroke-slate-500"
              strokeWidth="1.5"
            />
            <circle cx="4" cy="31" r="2.5" className="fill-sky-900" />
            <rect
              x="24"
              y="8"
              width="20"
              height="10"
              rx="2"
              className="fill-slate-700"
            />
            <circle
              cx="50"
              cy="24"
              r="2.5"
              className="fill-red-500"
              data-anim="blink"
            />
            <rect
              x="32"
              y="44"
              width="6"
              height="12"
              className="fill-slate-600"
            />
            <path
              d="M35 56 16 98M35 56l19 42M35 56v42"
              className="stroke-slate-500"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <span
        data-anim="flash-once"
        data-anim-delay={DATE_FLASH_MS}
        className="pointer-events-none absolute inset-0 z-40 bg-slate-50 opacity-0"
      />
    </SceneFrame>
  );
}

function ZekaSet({
  character,
}: {
  character: SabotageHitSceneProps['character'];
}) {
  return (
    <SceneFrame
      indoor="bg-gradient-to-b from-slate-950 via-emerald-950 to-emerald-950"
      floor="bg-emerald-950"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(148,163,184,0.12),transparent_50%)]" />
      {['left-[4%]', 'left-[20%]', 'left-[82%]'].map((cls) => (
        <span key={cls} className={`absolute bottom-[16%] ${cls}`}>
          <span className="block h-28 w-4 rounded-t-md bg-slate-950 sm:h-32" />
          <span className="absolute -top-10 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-emerald-950 shadow-[0_0_20px_rgba(2,6,23,0.8)]" />
        </span>
      ))}

      {/* the blue hut with a light on */}
      <div className="absolute bottom-[18%] right-[6%] z-10">
        <span className="block h-14 w-20 bg-sky-800" />
        <span className="absolute -top-7 left-1/2 h-7 w-24 -translate-x-1/2 bg-sky-950 [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
        <span className="absolute left-3 top-3 h-5 w-5 bg-amber-200 shadow-[0_0_14px_rgba(253,230,138,0.9)]" />
        <span className="absolute bottom-0 right-3 h-8 w-4 bg-slate-950" />
      </div>

      {/* the lair sits still in the same frame the walk lands in, so the
          trunks never move and the beast's lunge still ends on the player */}
      <div className="absolute bottom-[18%] left-[36%] z-20 h-[140px] w-[300px]">
        {/* two trunks flanking the lair, so the beast waits between them */}
        {['left-[134px]', 'left-[222px]'].map((cls) => (
          <span key={cls} className={`absolute bottom-[-4px] ${cls}`}>
            <span className="block h-28 w-4 rounded-t-md bg-slate-950 sm:h-32" />
            <span className="absolute -top-10 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-emerald-950 shadow-[0_0_20px_rgba(2,6,23,0.8)]" />
          </span>
        ))}

        <div
          data-anim="lunge"
          data-anim-delay={ZEKA_LUNGE_MS}
          className="absolute bottom-0 left-[150px] z-30 origin-bottom"
        >
          <span
            data-anim="body-show"
            data-anim-delay={ZEKA_LUNGE_MS}
            className="block opacity-0 drop-shadow-[0_0_18px_rgba(2,6,23,0.9)]"
          >
            <Beast />
          </span>
          <span
            data-anim="eyes-life"
            data-anim-delay={ZEKA_EYES_MS}
            className="absolute left-[38px] top-[34px] flex gap-4 opacity-0 sm:left-[44px] sm:top-[40px]"
          >
            <span className="h-4 w-4 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,1)]" />
            <span className="h-4 w-4 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,1)]" />
          </span>
        </div>
      </div>

      {/* the walk and everything that jumps him hang off one anchor */}
      <div
        data-anim="walk-in"
        data-anim-delay={ZEKA_WALK_MS}
        className="absolute bottom-[18%] left-[36%] z-20 h-[140px] w-[300px] opacity-0"
      >
        <div
          data-anim="toss"
          data-anim-delay={ZEKA_TOSS_MS}
          className="absolute bottom-[8px] left-0"
        >
          <SceneActor
            character={character}
            className="relative"
            anim="bob"
            pose="origin-bottom"
          >
            <span
              data-anim="float-up"
              data-anim-delay={ZEKA_WALK_MS + 200}
              data-anim-iterations={1}
              className="absolute -right-2 -top-3 text-pink-400 opacity-0"
            >
              <HeartIcon className="h-6 w-6 drop-shadow" />
            </span>
            {/* the claws across the face */}
            <svg
              data-anim="swipe"
              data-anim-delay={ZEKA_CLAW_MS}
              viewBox="0 0 40 40"
              className="absolute inset-[-10%] z-30 h-[120%] w-[120%] opacity-0"
              aria-hidden="true"
            >
              <path
                d="M8 6q14 8 22 30M14 3q14 8 22 30M2 12q14 8 22 30"
                className="fill-none stroke-slate-50"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8 6q14 8 22 30M14 3q14 8 22 30M2 12q14 8 22 30"
                className="fill-none stroke-red-500/70"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </svg>
            {/* pale under the paint */}
            <span
              data-anim="fade-in"
              data-anim-delay={ZEKA_TOSS_MS + 300}
              className="absolute inset-0 rounded-full bg-slate-200/50 opacity-0"
            />
            <span className="absolute inset-0 overflow-hidden rounded-full">
              {SPLATS.map((s) => (
                <PaintSplat key={s.cls} className={s.cls} delay={s.delay} />
              ))}
            </span>
            {SPLATTER_DOTS.map((d) => (
              <span
                key={d.cls}
                data-anim="fling"
                data-anim-delay={ZEKA_PAINT_MS + d.delay}
                style={{ '--fx': d.fx, '--fy': d.fy } as React.CSSProperties}
                className={`absolute h-2 w-2 rounded-full opacity-0 ${d.cls}`}
              />
            ))}
          </SceneActor>
        </div>
      </div>
      <span
        data-anim="mist"
        className="absolute inset-x-0 bottom-[20%] z-30 h-6 bg-slate-300/20 blur-md"
      />
    </SceneFrame>
  );
}

function DemonsSet({
  character,
}: {
  character: SabotageHitSceneProps['character'];
}) {
  return (
    <SceneFrame
      indoor="bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900"
      floor="bg-slate-900"
    >
      <span
        data-anim="fade-in"
        data-anim-delay={DEMON_DAWN_MS}
        data-anim-duration={900}
        className="absolute inset-x-0 top-0 z-30 h-[45%] bg-gradient-to-b from-amber-200/45 to-transparent opacity-0"
      />
      <span
        data-anim="mist"
        className="absolute inset-x-0 top-[30%] h-10 bg-slate-300/25 blur-lg"
      />
      <span
        data-anim="mist"
        data-anim-delay={-2600}
        className="absolute inset-x-0 top-[58%] h-8 bg-slate-300/20 blur-lg"
      />

      {/* what came out of the mist, creeping at the door */}
      <div className="absolute bottom-[18%] right-1/2 z-10 w-0">
        {DEMONS.map((d) => (
          <span
            key={d.cls}
            data-anim="fade-out"
            data-anim-delay={DEMON_DAWN_MS + d.delay}
            className={`absolute bottom-0 ${d.cls}`}
          >
            <span
              data-anim="creep lunge-recoil"
              data-anim-delay={`${DEMON_IN_MS + d.delay} ${DEMON_LUNGE_MS + d.delay}`}
              style={{ '--creep': d.creep } as React.CSSProperties}
              className="block opacity-0 drop-shadow-[0_0_14px_rgba(239,68,68,0.45)]"
            >
              <Demon className={d.height} />
            </span>
          </span>
        ))}
      </div>

      {/* the house: the door is its left edge, the player right inside it */}
      <div className="absolute bottom-[18%] right-0 z-20 h-[64%] w-1/2 bg-slate-800 shadow-[-12px_0_30px_rgba(2,6,23,0.7)]">
        <span className="absolute -top-8 left-0 h-8 w-full bg-slate-950 [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
        <span className="absolute right-8 top-6 h-6 w-6 bg-amber-200/80 shadow-[0_0_12px_rgba(253,230,138,0.6)]" />
        <span className="absolute inset-x-0 bottom-0 h-1 bg-slate-950/60" />
        {/* door frame and the door on its hinge */}
        <span className="absolute bottom-0 left-0 h-[72%] w-14 rounded-t-lg bg-slate-950" />
        <div
          data-anim="door-bulge door-bulge"
          data-anim-delay="1200 1800"
          className="absolute bottom-0 left-1 h-[70%] w-12 origin-left rounded-t-md bg-amber-950 shadow-[inset_-4px_0_8px_rgba(2,6,23,0.6)]"
        >
          <span className="absolute right-2 top-1/2 h-2 w-2 rounded-full bg-amber-400" />
          {[1300, 1900].map((at, i) => (
            <svg
              key={at}
              data-anim="fade-in"
              data-anim-delay={at}
              data-anim-duration={200}
              viewBox="0 0 24 40"
              className={`absolute ${i === 0 ? 'left-1 top-4' : 'left-4 top-12'} h-10 w-6 opacity-0`}
              aria-hidden="true"
            >
              <path
                d="M4 4l6 30M10 2l6 30M16 6l6 26"
                className="fill-none stroke-amber-700"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          ))}
          <span
            data-anim="chain-drop"
            data-anim-delay={DEMON_CHAIN_MS}
            className="absolute inset-x-[-8px] top-[38%] flex justify-between opacity-0"
          >
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={i}
                className="h-3 w-2.5 rounded-sm border-2 border-slate-400 bg-slate-800 shadow"
              />
            ))}
          </span>
        </div>
        <span
          data-anim="draw-line"
          data-anim-delay={DEMON_SALT_MS}
          className="absolute -left-4 bottom-0 z-30 h-1.5 w-20 origin-left border-t-4 border-dotted border-slate-100 opacity-0 drop-shadow-[0_0_4px_rgba(248,250,252,0.9)]"
        />
        <SceneActor
          character={character}
          className="bottom-[10px] left-[52px] z-30"
          anim="lean-on-door"
          pose="origin-bottom"
        />
      </div>
    </SceneFrame>
  );
}

export default function HitCatfishScene({
  character,
  variant,
}: SabotageHitSceneProps & { variant: CatfishVariant }) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM, [variant]);

  return (
    <div ref={root}>
      {variant === 'date' && <DateSet character={character} />}
      {variant === 'zeka' && <ZekaSet character={character} />}
      {variant === 'demons' && <DemonsSet character={character} />}
    </div>
  );
}
