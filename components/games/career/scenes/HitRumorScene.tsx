'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import type { SabotageHitSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const PHONE_MS = 400;
const PHONE_STEP_MS = 320;
const PAGE_MS = 2000;
const TURN_MS = 2800;
const SULK_MS = 3000;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'phone-on': {
    keyframes: [
      { opacity: 0.2, transform: 'translateY(0)' },
      { opacity: 1, transform: 'translateY(-5px)' },
    ],
    options: { duration: 250, easing: 'ease-out', fill: 'forwards' },
  },
  whisper: {
    keyframes: [
      { transform: 'scale(0)', opacity: 0 },
      { transform: 'scale(1.1)', opacity: 1, offset: 0.2 },
      { transform: 'scale(1)', opacity: 1, offset: 0.75 },
      { transform: 'scale(0.8) translateY(-10px)', opacity: 0 },
    ],
    options: { duration: 1100, easing: 'ease-out', fill: 'forwards' },
  },
  // The page starts off the right edge and lands at the player's feet, so
  // the element itself sits where it ends
  'page-land': {
    keyframes: [
      { transform: 'translate(260px, -110px) rotate(-40deg)', opacity: 0 },
      {
        transform: 'translate(200px, -70px) rotate(10deg)',
        opacity: 1,
        offset: 0.2,
      },
      {
        transform: 'translate(110px, -90px) rotate(-25deg)',
        opacity: 1,
        offset: 0.5,
      },
      {
        transform: 'translate(30px, -20px) rotate(15deg)',
        opacity: 1,
        offset: 0.85,
      },
      { transform: 'translate(0, 0) rotate(-6deg)', opacity: 1 },
    ],
    options: { duration: 1500, easing: 'ease-in-out', fill: 'both' },
  },
  'turn-left': {
    keyframes: [
      { transform: 'scaleX(1) translateX(0)' },
      { transform: 'scaleX(-1) translateX(14px)' },
    ],
    options: { duration: 400, easing: 'ease-in-out', fill: 'forwards' },
  },
  'turn-right': {
    keyframes: [
      { transform: 'scaleX(1) translateX(0)' },
      { transform: 'scaleX(-1) translateX(-14px)' },
    ],
    options: { duration: 400, easing: 'ease-in-out', fill: 'forwards' },
  },
  'boo-rise': {
    keyframes: [
      { transform: 'translateY(6px) scale(0.4)', opacity: 0 },
      { transform: 'translateY(-6px) scale(1.3)', opacity: 1, offset: 0.3 },
      { transform: 'translateY(-4px) scale(1)', opacity: 1, offset: 0.5 },
      { transform: 'translateY(-4px) scale(1.15)', opacity: 1, offset: 0.75 },
      { transform: 'translateY(-4px) scale(1)', opacity: 1 },
    ],
    options: { duration: 1600, easing: 'ease-out', fill: 'forwards' },
  },
  sulk: {
    keyframes: [
      { transform: 'rotate(0deg) translateY(0) scale(1)' },
      { transform: 'rotate(9deg) translateY(8px) scale(0.92)' },
    ],
    options: { duration: 900, easing: 'ease-in-out', fill: 'forwards' },
  },
};

// Left to right; the phones light up from the edges in toward the player
const FANS = [
  { cls: 'left-[3%]', side: 'left', order: 0, boo: true },
  { cls: 'left-[17%]', side: 'left', order: 1, boo: false },
  { cls: 'left-[31%]', side: 'left', order: 2, boo: true },
  { cls: 'left-[59%]', side: 'right', order: 2, boo: false },
  { cls: 'left-[73%]', side: 'right', order: 1, boo: true },
  { cls: 'left-[87%]', side: 'right', order: 0, boo: false },
] as const;

function Whisper({ delay, flip }: { delay: number; flip: boolean }) {
  return (
    <span
      data-anim="whisper"
      data-anim-delay={delay}
      className={`absolute -top-9 flex h-8 w-11 flex-col items-center justify-center gap-1 rounded-2xl bg-slate-50 opacity-0 shadow-lg ${flip ? '-left-8' : 'left-6'}`}
    >
      <span
        className={`absolute -bottom-1 h-2.5 w-2.5 rotate-45 bg-slate-50 ${flip ? 'right-2' : 'left-2'}`}
      />
      <span className="h-0.5 w-6 rounded-full bg-slate-500" />
      <span className="h-0.5 w-4 rounded-full bg-slate-500" />
      <span className="h-0.5 w-6 rounded-full bg-slate-500" />
    </span>
  );
}

function Fan({ fan }: { fan: (typeof FANS)[number] }) {
  const phoneAt = PHONE_MS + fan.order * PHONE_STEP_MS;
  const flip = fan.side === 'right';
  return (
    <div
      data-anim={flip ? 'turn-right' : 'turn-left'}
      data-anim-delay={TURN_MS}
      className={`absolute bottom-0 z-10 ${fan.cls}`}
    >
      <span className="relative block h-16 w-10">
        <span className="absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2 rounded-full bg-slate-400 ring-2 ring-slate-950" />
        <span className="absolute inset-x-0 bottom-0 h-9 rounded-t-2xl bg-slate-700 ring-2 ring-slate-950" />
        <span
          className={`absolute bottom-3 h-5 w-2 rounded-full bg-slate-700 ${flip ? 'left-0' : 'right-0'}`}
        />
        <span
          data-anim="phone-on"
          data-anim-delay={phoneAt}
          className={`absolute bottom-6 h-5 w-3 rounded-[3px] bg-sky-300 opacity-20 shadow-[0_0_10px_rgba(125,211,252,0.95)] ${flip ? '-left-1' : '-right-1'}`}
        />
        <Whisper delay={phoneAt + 150} flip={flip} />
        {fan.boo && (
          <span
            data-anim="boo-rise"
            data-anim-delay={TURN_MS + fan.order * 200}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-lg font-black leading-none text-red-400 opacity-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]"
          >
            !?!
          </span>
        )}
      </span>
    </div>
  );
}

export default function HitRumorScene({
  character,
  season,
}: SabotageHitSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM);

  return (
    <div ref={root}>
      <SceneFrame season={season} floor="bg-slate-800">
        {/* a dark ground band so the crowd reads on any season */}
        <div className="absolute inset-x-0 bottom-[14%] h-[30%] bg-gradient-to-t from-slate-950/85 via-slate-950/55 to-transparent" />

        {/* the square, everyone in the foreground */}
        <div className="absolute inset-x-0 bottom-[18%] h-16">
          {FANS.map((fan) => (
            <Fan key={fan.cls} fan={fan} />
          ))}
        </div>

        <SceneActor
          character={character}
          className="bottom-[18%] left-1/2 -translate-x-1/2"
          anim="gray-out sulk"
          animDelay={`${SULK_MS} ${SULK_MS}`}
          animDuration={900}
          pose="origin-bottom"
        >
          <span
            data-anim="page-land"
            data-anim-delay={PAGE_MS}
            className="absolute -bottom-3 -right-8 z-30 h-9 w-7 rounded-sm bg-amber-50 opacity-0 shadow-md"
          >
            <span className="absolute inset-x-1 top-1 h-1.5 bg-slate-900" />
            <span className="absolute inset-x-1 top-3.5 h-px bg-slate-400" />
            <span className="absolute inset-x-1 top-4.5 h-px bg-slate-400" />
            <span className="absolute inset-x-1 top-5.5 h-px bg-slate-400" />
            <span className="absolute bottom-1 left-1 h-2 w-2 rounded-sm bg-slate-700" />
          </span>
        </SceneActor>
      </SceneFrame>
    </div>
  );
}
