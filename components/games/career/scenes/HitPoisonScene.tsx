'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import type { SabotageHitSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

export type PoisonVariant = 'glizimaker' | 'kafana';

// Beat sheet per variant, matched to the soundtrack cues
const BEATS: Record<
  PoisonVariant,
  {
    serve: number;
    vial: number;
    bites: number[];
    sick: number;
    puke: number;
    drip: number;
    dim: number;
  }
> = {
  glizimaker: {
    serve: 1400,
    vial: 900,
    bites: [1900, 2400],
    sick: 2900,
    puke: 3500,
    drip: 0,
    dim: 4100,
  },
  kafana: {
    serve: 300,
    vial: 0,
    bites: [1300, 1800],
    sick: 2400,
    puke: 3200,
    drip: 3800,
    dim: 4600,
  },
};

// The eater sits at the counter on the left; the food lane starts at the far
// end of the counter and ends exactly on his mouth, so a full-width slide
// lands every serving on the bite
const ACTOR = 'bottom-[24%] left-[22%]';
const LANE = 'left-[calc(22%+56px)] sm:left-[calc(22%+68px)]';
const MOUTH_Y = 'bottom-[calc(24%+18px)] sm:bottom-[calc(24%+22px)]';
const BASIN = 'left-[calc(22%+22px)] sm:left-[calc(22%+30px)]';
// A plate parks just past his shoulder instead of on the mouth
const PLATE_LANE = 'left-[calc(22%+74px)] sm:left-[calc(22%+88px)]';

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'slide-to-mouth': {
    keyframes: [
      { transform: 'translateX(0)', opacity: 0 },
      { transform: 'translateX(-6%)', opacity: 1, offset: 0.1 },
      { transform: 'translateX(-100%)', opacity: 1 },
    ],
    options: { duration: 600, easing: 'ease-in-out', fill: 'both' },
  },
  bite: {
    keyframes: [
      { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      { transform: 'scale(0.55) rotate(-20deg)', opacity: 1, offset: 0.5 },
      { transform: 'scale(0.1) rotate(-40deg)', opacity: 0 },
    ],
    options: { duration: 380, easing: 'ease-in', fill: 'forwards' },
  },
  // A chunk hops off the plate up and left onto the mouth
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
      { transform: 'scaleY(0.86) scaleX(1.06)', offset: 0.5 },
      { transform: 'scaleY(1)' },
    ],
    options: { duration: 400, easing: 'ease-in-out' },
  },
  swell: {
    keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }],
    options: { duration: 900, easing: 'ease-in-out', fill: 'forwards' },
  },
  'sick-tint': {
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: { duration: 900, easing: 'ease-out', fill: 'forwards' },
  },
  sweat: {
    keyframes: [
      { transform: 'translateY(0) scale(0.4)', opacity: 0 },
      { transform: 'translateY(4px) scale(1)', opacity: 1, offset: 0.3 },
      { transform: 'translateY(16px) scale(0.9)', opacity: 0 },
    ],
    options: { duration: 1100, iterations: Infinity, easing: 'ease-in' },
  },
  // A small forward tilt keeps the chin over the basin on the floor
  'double-over': {
    keyframes: [
      { transform: 'rotate(0deg) translateY(0)' },
      { transform: 'rotate(-12deg) translateY(4px)' },
    ],
    options: { duration: 600, easing: 'ease-in', fill: 'forwards' },
  },
  'puke-drip': {
    keyframes: [
      { transform: 'translateY(0) scale(0.6)', opacity: 0 },
      { transform: 'translateY(6px) scale(1)', opacity: 1, offset: 0.25 },
      { transform: 'translateY(16px) scale(0.9)', opacity: 0.9, offset: 0.8 },
      { transform: 'translateY(18px) scale(0.6)', opacity: 0 },
    ],
    options: { duration: 700, iterations: Infinity, easing: 'ease-in' },
  },
  splash: {
    keyframes: [
      { transform: 'scale(0.3)', opacity: 0.9 },
      { transform: 'scale(1.4)', opacity: 0 },
    ],
    options: { duration: 700, iterations: Infinity, easing: 'ease-out' },
  },
  'vial-tip': {
    keyframes: [
      { transform: 'translateY(-26px) rotate(0deg)', opacity: 0 },
      { transform: 'translateY(0) rotate(0deg)', opacity: 1, offset: 0.3 },
      { transform: 'translateY(0) rotate(-120deg)', opacity: 1, offset: 0.7 },
      { transform: 'translateY(-26px) rotate(-120deg)', opacity: 0 },
    ],
    options: { duration: 1200, easing: 'ease-in-out', fill: 'both' },
  },
  'vial-drop': {
    keyframes: [
      { transform: 'translateY(0)', opacity: 0 },
      { transform: 'translateY(4px)', opacity: 1, offset: 0.2 },
      { transform: 'translateY(22px)', opacity: 0 },
    ],
    options: { duration: 500, easing: 'ease-in', fill: 'both' },
  },
  'coin-toss': {
    keyframes: [
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 0 },
      {
        transform: 'translate(-24px, -22px) rotate(180deg)',
        opacity: 1,
        offset: 0.5,
      },
      { transform: 'translate(-46px, 0) rotate(360deg)', opacity: 1 },
    ],
    options: { duration: 500, easing: 'ease-out', fill: 'both' },
  },
  'arm-serve': {
    keyframes: [
      { transform: 'translateX(0)', opacity: 0 },
      { transform: 'translateX(-4%)', opacity: 1, offset: 0.1 },
      { transform: 'translateX(-100%)', opacity: 1, offset: 0.55 },
      { transform: 'translateX(-100%)', opacity: 1, offset: 0.7 },
      { transform: 'translateX(0)', opacity: 0 },
    ],
    options: { duration: 1400, easing: 'ease-in-out', fill: 'both' },
  },
  'rise-up': {
    keyframes: [
      { transform: 'translateY(60px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    options: { duration: 700, easing: 'ease-out', fill: 'both' },
  },
  'tube-drip': {
    keyframes: [
      { transform: 'translateY(0)', opacity: 0 },
      { transform: 'translateY(3px)', opacity: 1, offset: 0.2 },
      { transform: 'translateY(18px)', opacity: 0 },
    ],
    options: { duration: 900, iterations: Infinity, easing: 'ease-in' },
  },
  'dim-out': {
    keyframes: [{ opacity: 0 }, { opacity: 0.5 }],
    options: { duration: 900, easing: 'ease-out', fill: 'forwards' },
  },
  stink: {
    keyframes: [
      { transform: 'translateY(0) scaleX(1)', opacity: 0 },
      { transform: 'translateY(-12px) scaleX(-1)', opacity: 0.7, offset: 0.4 },
      { transform: 'translateY(-28px) scaleX(1)', opacity: 0 },
    ],
    options: { duration: 1600, iterations: Infinity, easing: 'ease-out' },
  },
};

function Vendor() {
  return (
    <svg
      viewBox="0 0 40 48"
      className="h-24 w-auto drop-shadow-xl sm:h-28"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="24"
        width="24"
        height="24"
        rx="5"
        className="fill-stone-700"
      />
      <rect
        x="11"
        y="28"
        width="18"
        height="20"
        rx="3"
        className="fill-stone-200"
      />
      <circle cx="20" cy="15" r="9" className="fill-amber-200" />
      <path d="M11 11q9-8 18 0v-6H11z" className="fill-stone-100" />
      <rect
        x="10"
        y="4"
        width="20"
        height="3"
        rx="1.5"
        className="fill-stone-100"
      />
      <path
        d="M15 18q5 4 10 0"
        className="fill-none stroke-amber-900"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="13" r="1.2" className="fill-slate-900" />
      <circle cx="24" cy="13" r="1.2" className="fill-slate-900" />
      <rect
        x="2"
        y="27"
        width="7"
        height="12"
        rx="3.5"
        className="fill-stone-700"
      />
      <rect
        x="31"
        y="27"
        width="7"
        height="12"
        rx="3.5"
        className="fill-stone-700"
      />
    </svg>
  );
}

function MeatPlate({ bites, serve }: { bites: number[]; serve: number }) {
  return (
    <div className="relative h-7 w-24">
      <span className="absolute inset-x-0 bottom-0 h-3.5 rounded-full border-2 border-stone-300/50 bg-stone-100/90 shadow-md" />
      {['left-4', 'left-10', 'left-16'].map((cls, i) => (
        <span
          key={cls}
          data-anim="stink"
          data-anim-delay={serve + 700 + i * 450}
          className={`absolute bottom-5 h-4 w-1 rounded-full bg-lime-300/70 opacity-0 blur-[1px] ${cls}`}
        />
      ))}
      {[
        { cls: 'left-3', delay: bites[1] },
        { cls: 'left-12', delay: bites[0] },
      ].map((chunk) => (
        <span
          key={chunk.cls}
          data-anim="lift-bite"
          data-anim-delay={chunk.delay}
          className={`absolute bottom-2 h-4 w-9 rounded-[45%] bg-stone-600 shadow ${chunk.cls}`}
        >
          <span className="absolute left-1.5 top-1 h-1.5 w-4 rounded-full bg-lime-700/80" />
          <span className="absolute right-1.5 top-0.5 h-1 w-2 rounded-full bg-lime-500/70" />
        </span>
      ))}
    </div>
  );
}

export default function HitPoisonScene({
  character,
  variant,
}: SabotageHitSceneProps & { variant: PoisonVariant }) {
  const root = useRef<HTMLDivElement | null>(null);
  const beat = BEATS[variant];
  const kafana = variant === 'kafana';
  useSceneAnimation(root, CUSTOM, [variant]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor={
          kafana
            ? 'bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950'
            : 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900'
        }
        floor={kafana ? 'bg-stone-950' : 'bg-slate-900'}
      >
        {kafana ? (
          <>
            <div className="absolute inset-x-0 top-0 h-[42%] bg-[repeating-linear-gradient(0deg,transparent_0,transparent_18px,rgba(120,53,15,0.25)_18px,rgba(120,53,15,0.25)_20px)]" />
            <div className="absolute right-[8%] top-[8%] h-9 w-9 rounded-full bg-amber-200/80 shadow-[0_0_28px_rgba(251,191,36,0.55)]" />
            {/* the table under his chin, checkered cloth and two legs */}
            <div className="absolute bottom-[18%] left-[26%] right-[8%] z-10 h-[8%] rounded-md bg-[repeating-linear-gradient(90deg,#fef3c7_0,#fef3c7_10px,#b91c1c_10px,#b91c1c_20px)] shadow-lg" />
            <div className="absolute bottom-[10%] left-[32%] h-[10%] w-2 bg-amber-950" />
            <div className="absolute bottom-[10%] right-[14%] h-[10%] w-2 bg-amber-950" />
          </>
        ) : (
          <>
            <div className="absolute inset-x-0 top-0 h-[44%] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_26px,rgba(148,163,184,0.07)_26px,rgba(148,163,184,0.07)_28px)]" />
            {/* the stall: awning, lamp cone, counter and the glizzy tray */}
            <div className="absolute inset-x-[24%] top-0 h-4 bg-[repeating-linear-gradient(90deg,#b91c1c_0,#b91c1c_14px,#fef3c7_14px,#fef3c7_28px)]" />
            <div className="absolute left-[52%] top-[8%] h-3 w-14 rounded-b-md bg-slate-500" />
            <div className="absolute left-[40%] top-[12%] h-[50%] w-[38%] bg-gradient-to-b from-amber-100/20 to-transparent [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)]" />
            <div className="absolute bottom-[18%] left-[26%] right-[8%] z-10 h-[8%] rounded-t-md bg-slate-600 shadow-lg" />
            <div className="absolute bottom-[26%] right-[16%] z-10 h-2.5 w-20 rounded-sm bg-slate-400" />
            <span className="absolute bottom-[27%] right-[18%] z-10">
              <GlizzyIcon variant={2} className="h-4 w-7 drop-shadow" />
            </span>
          </>
        )}

        {kafana ? (
          <>
            {/* the waiter's arm pushes the plate along the table until it
                sits right in front of him; the chunks then hop to the mouth */}
            <div
              data-anim="arm-serve"
              data-anim-delay={beat.serve}
              className={`absolute bottom-[30%] right-[6%] z-30 h-6 opacity-0 ${PLATE_LANE}`}
            >
              <span className="absolute left-full top-0.5 h-5 w-24 rounded-r-full bg-stone-100 shadow-md" />
            </div>
            <div
              data-anim="slide-to-mouth"
              data-anim-delay={beat.serve + 120}
              className={`absolute bottom-[26%] right-[8%] z-30 opacity-0 ${PLATE_LANE}`}
            >
              <div className="absolute bottom-0 left-full">
                <MeatPlate bites={beat.bites} serve={beat.serve} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* the vendor behind the counter: a coin, the vial, then the serving */}
            <div className="absolute bottom-[22%] right-[10%] z-0">
              <Vendor />
            </div>
            <span
              data-anim="coin-toss"
              data-anim-delay={400}
              className="absolute bottom-[27%] right-[12%] z-20 h-2.5 w-4 rounded-full bg-amber-300 opacity-0 shadow"
            />
            <span
              data-anim="vial-tip"
              data-anim-delay={beat.vial}
              className="absolute bottom-[34%] right-[20%] z-30 h-6 w-2.5 origin-bottom rounded-sm bg-purple-400/90 opacity-0 shadow-[0_0_8px_rgba(168,85,247,0.7)]"
            />
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                data-anim="vial-drop"
                data-anim-delay={beat.vial + 650 + i * 200}
                className="absolute bottom-[32%] right-[19%] z-20 h-2 w-1.5 rounded-b-full bg-purple-400 opacity-0"
              />
            ))}
            {beat.bites.map((bite, i) => (
              <div
                key={bite}
                data-anim="slide-to-mouth"
                data-anim-delay={beat.serve + i * 500}
                className={`absolute right-[18%] z-30 opacity-0 ${LANE} ${MOUTH_Y}`}
              >
                <span
                  data-anim="bite"
                  data-anim-delay={bite}
                  className="absolute bottom-0 right-0 block origin-right"
                >
                  <GlizzyIcon variant={i} className="h-5 w-8 drop-shadow-md" />
                </span>
              </div>
            ))}
          </>
        )}

        {/* the eater: bites, the green turn, then the basin */}
        <SceneActor
          character={character}
          className={ACTOR}
          anim="chomp chomp swell double-over"
          animDelay={`${beat.bites[0] + 200} ${beat.bites[1] + 200} ${beat.sick} ${beat.puke}`}
          pose="origin-bottom"
        >
          <span
            data-anim="sick-tint"
            data-anim-delay={beat.sick}
            className="absolute inset-0 rounded-full bg-emerald-400/50 opacity-0 mix-blend-color"
          />
          {['-right-1 top-2', '-left-1 top-4', 'right-1 -top-1'].map(
            (cls, i) => (
              <span
                key={cls}
                data-anim="sweat"
                data-anim-delay={beat.sick + 200 + i * 350}
                className={`absolute h-2.5 w-1.5 rounded-b-full rounded-t-[40%] bg-sky-200 opacity-0 ${cls}`}
              />
            ),
          )}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              data-anim="puke-drip"
              data-anim-delay={beat.puke + 400 + i * 230}
              className={`absolute -bottom-1 h-3 w-2 rounded-b-full bg-lime-300/90 opacity-0 ${
                i === 1 ? 'left-[58%]' : i === 2 ? 'left-[42%]' : 'left-1/2'
              }`}
            />
          ))}
        </SceneActor>
        {/* the basin on the floor right under the chin */}
        <div
          className={`absolute bottom-[18%] z-10 h-3 w-14 rounded-b-xl border-t-2 border-slate-400 bg-slate-500 shadow-lg ${BASIN}`}
        >
          <span
            data-anim="fade-in"
            data-anim-delay={beat.puke + 700}
            className="absolute inset-x-2 top-0 h-1 rounded-full bg-lime-300/80 opacity-0"
          />
          <span
            data-anim="splash"
            data-anim-delay={beat.puke + 800}
            className="absolute left-1/2 top-0 h-2 w-4 -translate-x-1/2 rounded-full border border-lime-200/80 opacity-0"
          />
        </div>

        {kafana && (
          <div
            data-anim="rise-up"
            data-anim-delay={beat.drip}
            className="absolute bottom-[18%] left-[calc(22%-34px)] z-30 h-[64%] w-16 opacity-0"
          >
            {/* the drip stand, its tube ending on the side of his head */}
            <svg
              viewBox="0 0 64 160"
              preserveAspectRatio="none"
              className="h-full w-full"
              aria-hidden="true"
            >
              <rect
                x="8"
                y="0"
                width="14"
                height="30"
                rx="3"
                className="fill-sky-100/90 stroke-slate-300"
                strokeWidth="1"
              />
              <rect
                x="10"
                y="18"
                width="10"
                height="10"
                className="fill-sky-300/70"
              />
              <rect
                x="13.5"
                y="30"
                width="3"
                height="130"
                className="fill-slate-400"
              />
              <rect
                x="2"
                y="155"
                width="26"
                height="5"
                rx="2.5"
                className="fill-slate-500"
              />
              <path
                d="M22 12 C 40 12, 44 30, 44 60 S 48 96, 64 100"
                className="fill-none stroke-sky-100"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span
              data-anim="tube-drip"
              data-anim-delay={beat.drip + 700}
              className="absolute left-[64%] top-[20%] h-1.5 w-1.5 rounded-full bg-sky-100 opacity-0"
            />
          </div>
        )}
        {kafana && (
          <span
            data-anim="fade-in"
            data-anim-delay={beat.drip + 400}
            className="absolute z-30 h-3 w-4 rounded-sm bg-sky-100 opacity-0 shadow bottom-[calc(24%+24px)] left-[calc(22%-2px)] sm:bottom-[calc(24%+30px)]"
          />
        )}

        <span
          data-anim="dim-out"
          data-anim-delay={beat.dim}
          className="absolute inset-0 z-40 bg-slate-950 opacity-0"
        />
      </SceneFrame>
    </div>
  );
}
