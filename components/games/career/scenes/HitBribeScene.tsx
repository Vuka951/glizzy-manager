'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import type { SabotageHitSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const ENVELOPE_MS = 400;
const COIN_MS = 700;
const PEN_MS = 1200;
const PLATE_MS = 2200;
const BITE_MS = 3200;
const SAG_MS = 3900;

// The patient sits at the desk on the left; each plate rides the desk lane
// until it parks just past his shoulder, then its bites hop onto the mouth
const ACTOR = 'bottom-[24%] left-[22%]';
const PLATE_LANE = 'left-[calc(22%+74px)] sm:left-[calc(22%+88px)]';
const SECOND_LANE = 'left-[calc(22%+160px)] sm:left-[calc(22%+180px)]';

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'slide-in': {
    keyframes: [
      { transform: 'translateX(0)', opacity: 0 },
      { transform: 'translateX(-6%)', opacity: 1, offset: 0.1 },
      { transform: 'translateX(-100%)', opacity: 1 },
    ],
    options: { duration: 600, easing: 'ease-in-out', fill: 'both' },
  },
  'push-arm': {
    keyframes: [
      { transform: 'translateX(0)', opacity: 0 },
      { transform: 'translateX(-4%)', opacity: 1, offset: 0.1 },
      { transform: 'translateX(-100%)', opacity: 1, offset: 0.55 },
      { transform: 'translateX(-100%)', opacity: 1, offset: 0.7 },
      { transform: 'translateX(0)', opacity: 0 },
    ],
    options: { duration: 1300, easing: 'ease-in-out', fill: 'both' },
  },
  'lift-bite': {
    keyframes: [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      {
        transform: 'translate(-18px, -30px) scale(1)',
        opacity: 1,
        offset: 0.55,
      },
      { transform: 'translate(-22px, -32px) scale(0.1)', opacity: 0 },
    ],
    options: { duration: 520, easing: 'ease-in-out', fill: 'forwards' },
  },
  chomp: {
    keyframes: [
      { transform: 'scaleY(1)' },
      { transform: 'scaleY(0.88) scaleX(1.05)', offset: 0.5 },
      { transform: 'scaleY(1)' },
    ],
    options: { duration: 400, easing: 'ease-in-out' },
  },
  'pen-tick': {
    keyframes: [
      { transform: 'rotate(0deg) translate(0, 0)' },
      { transform: 'rotate(-12deg) translate(-3px, 4px)', offset: 0.5 },
      { transform: 'rotate(0deg) translate(0, 0)' },
    ],
    options: { duration: 450, iterations: 3, easing: 'ease-in-out' },
  },
  'coin-drop': {
    keyframes: [
      { transform: 'translateY(-14px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1, offset: 0.5 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    options: { duration: 400, easing: 'ease-in', fill: 'both' },
  },
  sweat: {
    keyframes: [
      { transform: 'translateY(0) scale(0.4)', opacity: 0 },
      { transform: 'translateY(4px) scale(1)', opacity: 1, offset: 0.3 },
      { transform: 'translateY(16px) scale(0.9)', opacity: 0 },
    ],
    options: { duration: 1100, iterations: Infinity, easing: 'ease-in' },
  },
  sag: {
    keyframes: [
      { transform: 'rotate(0deg) translateY(0)' },
      { transform: 'rotate(-10deg) translateY(6px)' },
    ],
    options: { duration: 700, easing: 'ease-in-out', fill: 'forwards' },
  },
  'grease-smoke': {
    keyframes: [
      { transform: 'translateY(0) scale(0.5)', opacity: 0 },
      { transform: 'translateY(-12px) scale(1)', opacity: 0.6, offset: 0.3 },
      { transform: 'translateY(-34px) scale(1.6)', opacity: 0 },
    ],
    options: { duration: 1800, iterations: Infinity, easing: 'ease-out' },
  },
};

function Nutritionist() {
  return (
    <div data-anim="nod" className="relative origin-bottom">
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
        <circle cx="20" cy="15" r="9" className="fill-amber-200" />
        <path d="M11 13q9-12 18 0v-4q-9-8-18 0z" className="fill-amber-900" />
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
          d="M17 21q3-1 6 0"
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
      <div className="absolute -left-10 top-14 flex h-14 w-11 flex-col gap-1.5 rounded-sm border-2 border-amber-800 bg-amber-50 p-1.5 pt-2.5 shadow-lg">
        <span className="absolute -top-1.5 left-1/2 h-2 w-4 -translate-x-1/2 rounded-sm bg-slate-600" />
        {['w-8', 'w-6', 'w-7'].map((w, i) => (
          <span
            key={w}
            data-anim="pop-in"
            data-anim-delay={PEN_MS + i * 300}
            className={`h-0.5 rounded-full bg-red-700 opacity-0 ${w}`}
          />
        ))}
      </div>
      <span
        data-anim="pen-tick"
        data-anim-delay={PEN_MS}
        className="absolute -left-4 top-[4.4rem] block h-6 w-1 origin-top rounded-full bg-sky-800"
      />
    </div>
  );
}

function GreasyPlate({ delay, bites }: { delay: number; bites?: number[] }) {
  const blobs = [
    { cls: 'left-2 h-4 w-7 rounded-[50%] bg-amber-900', bite: bites?.[1] },
    { cls: 'left-8 h-4 w-8 rounded-[45%] bg-yellow-700', bite: bites?.[0] },
    { cls: 'left-14 h-3.5 w-6 rounded-full bg-amber-800', bite: undefined },
  ];
  return (
    <div className="relative h-8 w-24">
      <span className="absolute inset-x-0 bottom-0 h-3.5 rounded-full border-2 border-slate-300/60 bg-slate-100/80 shadow-md" />
      {blobs.map((blob) => (
        <span
          key={blob.cls}
          data-anim={blob.bite !== undefined ? 'lift-bite' : undefined}
          data-anim-delay={blob.bite}
          className={`absolute bottom-2 shadow-[0_0_6px_rgba(120,53,15,0.8)] ${blob.cls}`}
        >
          <span className="absolute left-1.5 top-0.5 h-1 w-2.5 rounded-full bg-orange-300/90" />
        </span>
      ))}
      {['left-5', 'left-12', 'left-17'].map((cls, i) => (
        <span
          key={cls}
          data-anim="grease-smoke"
          data-anim-delay={delay + i * 600}
          className={`absolute bottom-6 h-2.5 w-2.5 rounded-full bg-slate-400/50 opacity-0 blur-[1px] ${cls}`}
        />
      ))}
    </div>
  );
}

export default function HitBribeScene({ character }: SabotageHitSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900"
        floor="bg-emerald-950/80"
      >
        <div className="absolute inset-x-0 bottom-[18%] h-[30%] border-t-2 border-slate-600/60 bg-slate-800/70" />
        {/* the eye chart and the scale on the wall */}
        <div className="absolute right-[26%] top-[10%] flex h-14 w-10 flex-col items-center gap-1.5 rounded-sm bg-slate-100 p-1.5 shadow">
          {['w-5 h-1.5', 'w-4 h-1', 'w-6 h-1', 'w-3 h-0.5'].map((cls) => (
            <span key={cls} className={`rounded-sm bg-slate-800 ${cls}`} />
          ))}
        </div>

        {/* the nutritionist behind the desk on the right */}
        <div className="absolute bottom-[22%] right-[8%] z-0">
          <Nutritionist />
        </div>
        {/* the desk top runs from under his chin to the doctor */}
        <div className="absolute bottom-[18%] left-[26%] right-[6%] z-10 h-[8%] rounded-t-md bg-amber-900/90 shadow-lg" />

        {/* the envelope and coins land on the desk by the doctor, briefly */}
        <div
          data-anim="pop-in"
          data-anim-delay={ENVELOPE_MS}
          className="absolute bottom-[26%] right-[26%] z-20 h-6 w-10 rounded-sm bg-amber-50 opacity-0 shadow-md"
        >
          <span className="absolute inset-x-0 top-0 h-3 bg-amber-100 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        </div>
        {['right-[24%]', 'right-[30%]', 'right-[27%]'].map((cls, i) => (
          <span
            key={cls}
            data-anim="coin-drop"
            data-anim-delay={COIN_MS + i * 140}
            className={`absolute z-20 h-3 w-3 rounded-full border-2 border-amber-500 bg-amber-300 opacity-0 shadow ${cls} ${
              i === 2 ? 'bottom-[31%]' : 'bottom-[27%]'
            }`}
          />
        ))}

        {/* the doctor's sleeve pushes the plates down the desk to the patient */}
        <div
          data-anim="push-arm"
          data-anim-delay={PLATE_MS}
          className={`absolute bottom-[30%] right-[20%] z-30 h-6 opacity-0 ${PLATE_LANE}`}
        >
          <span className="absolute left-full top-0.5 h-5 w-20 rounded-r-full bg-slate-100 shadow-md" />
        </div>
        <div
          data-anim="slide-in"
          data-anim-delay={PLATE_MS}
          className={`absolute bottom-[26%] right-[20%] z-30 opacity-0 ${PLATE_LANE}`}
        >
          <div className="absolute bottom-0 left-full">
            <GreasyPlate
              delay={PLATE_MS + 600}
              bites={[BITE_MS, BITE_MS + 450]}
            />
          </div>
        </div>
        <div
          data-anim="slide-in"
          data-anim-delay={PLATE_MS + 400}
          className={`absolute bottom-[26%] right-[20%] z-20 opacity-0 ${SECOND_LANE}`}
        >
          <div className="absolute bottom-0 left-full">
            <GreasyPlate delay={PLATE_MS + 1000} />
          </div>
        </div>

        {/* the patient: chews, glistens, then sags over the desk */}
        <SceneActor
          character={character}
          className={ACTOR}
          anim="chomp chomp sag"
          animDelay={`${BITE_MS + 200} ${BITE_MS + 650} ${SAG_MS}`}
          pose="origin-bottom"
        >
          <span
            data-anim="fade-in"
            data-anim-delay={BITE_MS + 600}
            className="absolute inset-0 rounded-full bg-amber-300/40 opacity-0 mix-blend-color"
          />
          <span
            data-anim="glow-pulse"
            data-anim-delay={BITE_MS + 900}
            className="absolute inset-1 rounded-full bg-orange-200/30 opacity-0 blur-[2px]"
          />
          {['-right-1 top-2', '-left-1 top-4', 'right-1 -top-1'].map(
            (cls, i) => (
              <span
                key={cls}
                data-anim="sweat"
                data-anim-delay={BITE_MS + 700 + i * 350}
                className={`absolute h-2.5 w-1.5 rounded-b-full rounded-t-[40%] bg-sky-200 opacity-0 ${cls}`}
              />
            ),
          )}
        </SceneActor>
      </SceneFrame>
    </div>
  );
}
