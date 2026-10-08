'use client';

import { useRef } from 'react';
import BangBurst from '@/components/games/career/quotes/BangBurst';
import XEyes from '@/components/games/career/quotes/XEyes';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 1800;
// Matches the lineStartMs of this scene's definition: the collapse and the
// exit play out before he laughs
const LINE_START_MS = 4200;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The chomp, heart-crack, retch and puke cues land on these beats
const BITES_MS = [500, 900, 1300];
const BURST_MS = 1900;
const FACEPLANT_MS = 2150;
const HEAVE_MS = 1850;
const SPRAY_MS = 1950;
const SLIDE_MS = 2600;
const STRETCHER_IN_MS = 2600;
const LIFT_MS = 3000;
const CARRY_MS = 3200;
const GONE_MS = 3900;
const RISE_MS = 3300;
const DARK_MS = 3900;
// Where each "ha" of the cackle lands inside the line window
const HA_MS = [105, 444, 736, 1014, 1235, 1645];

type Collapse = 'cholesterol' | 'puke';

const cackle = sceneTimeline(TOTAL_MS, [
  [0, { transform: 'rotate(0deg) translateY(0)' }],
  [LINE_START_MS - 200, { transform: 'rotate(0deg) translateY(0)' }],
  [LINE_START_MS, { transform: 'rotate(-10deg) translateY(0)' }],
  ...HA_MS.flatMap((ha): [number, Keyframe][] => [
    [LINE_START_MS + ha, { transform: 'rotate(-10deg) translateY(0)' }],
    [LINE_START_MS + ha + 70, { transform: 'rotate(-15deg) translateY(-5px)' }],
    [LINE_START_MS + ha + 150, { transform: 'rotate(-10deg) translateY(0)' }],
  ]),
  [TOTAL_MS, { transform: 'rotate(-10deg) translateY(0)' }],
]);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'push-in': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scale(1)' }],
    [DARK_MS, { transform: 'scale(1)' }],
    [LINE_START_MS + 200, { transform: 'scale(1.3)' }],
    [TOTAL_MS, { transform: 'scale(1.38)' }],
  ]),
  'lights-out': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [DARK_MS, { opacity: 0 }],
    [LINE_START_MS - 80, { opacity: 0.9 }],
    [TOTAL_MS, { opacity: 0.9 }],
  ]),
  uplight: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [LINE_START_MS - 150, { opacity: 0 }],
    [LINE_START_MS, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'evil-brows': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [LINE_START_MS - 100, { opacity: 0 }],
    [LINE_START_MS, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  cackle,
  'lead-rise': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0)' }],
    [RISE_MS, { transform: 'translate(0, 0)' }],
    [RISE_MS + 400, { transform: 'translate(-12px, -18px)' }],
    [TOTAL_MS, { transform: 'translate(-12px, -18px)' }],
  ]),
  'stand-up': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [RISE_MS, { opacity: 0 }],
    [RISE_MS + 150, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'glizzy-raise': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0) rotate(0deg)' }],
    [RISE_MS + 200, { transform: 'translate(0, 0) rotate(0deg)' }],
    [RISE_MS + 600, { transform: 'translate(-6px, -52px) rotate(-35deg)' }],
    [TOTAL_MS, { transform: 'translate(-6px, -52px) rotate(-35deg)' }],
  ]),
  gobble: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0)' }],
    ...BITES_MS.flatMap((bite): [number, Keyframe][] => [
      [bite - 120, { transform: 'translateY(0) rotate(0deg)' }],
      [bite, { transform: 'translateY(4px) rotate(6deg)' }],
      [bite + 160, { transform: 'translateY(0) rotate(0deg)' }],
    ]),
    [TOTAL_MS, { transform: 'translateY(0)' }],
  ]),
  ...Object.fromEntries(
    BITES_MS.map((bite, i) => [
      `eaten-${i}`,
      sceneTimeline(TOTAL_MS, [
        [0, { opacity: 1 }],
        [bite - 40, { opacity: 1 }],
        [bite, { opacity: 0 }],
        [TOTAL_MS, { opacity: 0 }],
      ]),
    ]),
  ),

  'gauge-fill': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scaleY(0.3)' }],
    [BURST_MS - 100, { transform: 'scaleY(1)' }],
    [TOTAL_MS, { transform: 'scaleY(1)' }],
  ]),
  'gauge-burst': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 1, transform: 'translateX(0) scale(1)' }],
    [1400, { opacity: 1, transform: 'translateX(0) scale(1)' }],
    [1500, { opacity: 1, transform: 'translateX(-2px) scale(1)' }],
    [1600, { opacity: 1, transform: 'translateX(2px) scale(1.05)' }],
    [1700, { opacity: 1, transform: 'translateX(-2px) scale(1.05)' }],
    [1800, { opacity: 1, transform: 'translateX(2px) scale(1.1)' }],
    [BURST_MS, { opacity: 1, transform: 'translateX(0) scale(1.2)' }],
    [BURST_MS + 40, { opacity: 0, transform: 'translateX(0) scale(1.6)' }],
    [TOTAL_MS, { opacity: 0, transform: 'translateX(0) scale(1.6)' }],
  ]),
  'bang-pop': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scale(0.4)' }],
    [BURST_MS, { opacity: 0, transform: 'scale(0.4)' }],
    [BURST_MS + 100, { opacity: 1, transform: 'scale(1.1)' }],
    [BURST_MS + 700, { opacity: 1, transform: 'scale(1)' }],
    [BURST_MS + 900, { opacity: 0, transform: 'scale(1)' }],
    [TOTAL_MS, { opacity: 0, transform: 'scale(1)' }],
  ]),
  'red-flush': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [600, { opacity: 0 }],
    [BURST_MS, { opacity: 0.7 }],
    [TOTAL_MS, { opacity: 0.7 }],
  ]),
  tremble: sceneTimeline(
    TOTAL_MS,
    [
      [0, { transform: 'translateX(0)' }],
      [1400, { transform: 'translateX(0)' }],
      ...[0, 1, 2, 3, 4].map((i): [number, Keyframe] => [
        1460 + i * 90,
        { transform: `translateX(${i % 2 ? 2 : -2}px)` },
      ]),
      [BURST_MS, { transform: 'translateX(0)' }],
      [TOTAL_MS, { transform: 'translateX(0)' }],
    ],
    'linear',
  ),
  'x-in': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [BURST_MS + 50, { opacity: 0 }],
    [BURST_MS + 100, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  carried: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0) rotate(0deg)' }],
    [BURST_MS, { transform: 'translate(0, 0) rotate(0deg)' }],
    [FACEPLANT_MS, { transform: 'translate(6px, 10px) rotate(58deg)' }],
    [LIFT_MS, { transform: 'translate(6px, 10px) rotate(58deg)' }],
    [LIFT_MS + 150, { transform: 'translate(-28px, -14px) rotate(-90deg)' }],
    [CARRY_MS, { transform: 'translate(-28px, -14px) rotate(-90deg)' }],
    [GONE_MS, { transform: 'translate(-340px, -14px) rotate(-90deg)' }],
    [TOTAL_MS, { transform: 'translate(-340px, -14px) rotate(-90deg)' }],
  ]),
  stretcher: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateX(-340px)' }],
    [STRETCHER_IN_MS, { transform: 'translateX(-340px)' }],
    [LIFT_MS, { transform: 'translateX(0)' }],
    [CARRY_MS, { transform: 'translateX(0)' }],
    [GONE_MS, { transform: 'translateX(-340px)' }],
    [TOTAL_MS, { transform: 'translateX(-340px)' }],
  ]),
  'medic-walk': {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-3px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 240, iterations: Infinity, easing: 'ease-in-out' },
  },

  'belly-swell': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scaleX(1)' }],
    [HEAVE_MS, { transform: 'scaleX(1.45)' }],
    [SPRAY_MS + 400, { transform: 'scaleX(1.15)' }],
    [TOTAL_MS, { transform: 'scaleX(1.15)' }],
  ]),
  'green-flush': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [700, { opacity: 0 }],
    [HEAVE_MS, { opacity: 0.6 }],
    [TOTAL_MS, { opacity: 0.6 }],
  ]),
  bloat: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scale(1, 1)' }],
    [1450, { transform: 'scale(1, 1)' }],
    [HEAVE_MS - 50, { transform: 'scale(1.14, 0.94)' }],
    [SPRAY_MS, { transform: 'scale(0.96, 1.04)' }],
    [SPRAY_MS + 200, { transform: 'scale(1, 1)' }],
    [TOTAL_MS, { transform: 'scale(1, 1)' }],
  ]),
  heave: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(0, 0) rotate(0deg)' }],
    [HEAVE_MS - 100, { transform: 'translate(0, 0) rotate(0deg)' }],
    [HEAVE_MS, { transform: 'translate(0, 0) rotate(-6deg)' }],
    [SPRAY_MS, { transform: 'translate(4px, 2px) rotate(20deg)' }],
    [SPRAY_MS + 450, { transform: 'translate(4px, 2px) rotate(20deg)' }],
    [SLIDE_MS, { transform: 'translate(0, 0) rotate(4deg)' }],
    [SLIDE_MS + 300, { transform: 'translate(-4px, 110px) rotate(-14deg)' }],
    [TOTAL_MS, { transform: 'translate(-4px, 110px) rotate(-14deg)' }],
  ]),
  spray: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'rotate(28deg) scaleX(0)' }],
    [SPRAY_MS, { opacity: 1, transform: 'rotate(28deg) scaleX(0)' }],
    [SPRAY_MS + 150, { opacity: 1, transform: 'rotate(28deg) scaleX(1)' }],
    [SPRAY_MS + 450, { opacity: 1, transform: 'rotate(34deg) scaleX(1)' }],
    [SLIDE_MS, { opacity: 0, transform: 'rotate(40deg) scaleX(0.6)' }],
    [TOTAL_MS, { opacity: 0, transform: 'rotate(40deg) scaleX(0.6)' }],
  ]),
  puddle: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scale(0.2, 0.4)' }],
    [SPRAY_MS + 100, { opacity: 0, transform: 'scale(0.2, 0.4)' }],
    [SPRAY_MS + 200, { opacity: 1, transform: 'scale(0.5, 0.7)' }],
    [SLIDE_MS, { opacity: 1, transform: 'scale(1, 1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scale(1.15, 1)' }],
  ]),
};

const CROWD = Array.from({ length: 16 }, (_, index) => index);

const PLATE_GLIZZIES = ['left-0 -rotate-6', 'left-3 rotate-3', 'left-6 -rotate-3'];

function isCollapse(value: string | undefined): value is Collapse {
  return value === 'cholesterol' || value === 'puke';
}

function Plate({ eatable }: { eatable: boolean }) {
  return (
    <span className="relative block h-5 w-14">
      <span className="absolute inset-x-0 bottom-0 h-2 rounded-[50%] bg-slate-200 shadow" />
      {PLATE_GLIZZIES.map((cls, i) => (
        <span
          key={cls}
          data-anim={eatable ? `eaten-${i}` : undefined}
          className={`absolute bottom-1 ${cls}`}
        >
          <GlizzyIcon variant={i} className="h-3 w-6" />
        </span>
      ))}
    </span>
  );
}

function Medic({ className }: { className: string }) {
  return (
    <span data-anim="medic-walk" className={`absolute bottom-0 h-16 w-8 ${className}`}>
      <span className="absolute bottom-0 left-0 h-10 w-8 rounded-t-xl bg-gradient-to-b from-slate-50 to-slate-300">
        <span className="absolute left-1/2 top-2 h-4 w-1 -translate-x-1/2 bg-red-600" />
        <span className="absolute left-1/2 top-3.5 h-1 w-4 -translate-x-1/2 bg-red-600" />
      </span>
      <span className="absolute bottom-10 left-1.5 h-5 w-5 rounded-full bg-orange-200 ring-1 ring-slate-950/40">
        <span className="absolute -top-1 inset-x-0 h-2 rounded-t-full bg-slate-50" />
      </span>
    </span>
  );
}

export default function VillainLaughScene({
  speaker,
  other,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const loser = characterBySlug(other);
  const collapse: Collapse = isCollapse(variant) ? variant : 'cholesterol';
  const burst = collapse === 'cholesterol';
  useSceneAnimation(root, CUSTOM, [speaker, other, collapse]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor="bg-slate-800"
      >
        <div
          data-anim="push-in"
          className="absolute inset-0 origin-[76%_46%]"
        >
          <div className="absolute inset-x-0 bottom-[52%] flex justify-around px-1">
            {CROWD.map((index) => (
              <span
                key={index}
                className={`h-5 w-6 rounded-t-full bg-slate-800/80 ${index % 2 ? 'mb-2' : ''}`}
              />
            ))}
          </div>
          <div className="absolute left-[4%] top-0 h-[82%] w-[44%] bg-gradient-to-b from-amber-200/15 to-amber-200/0 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
          <div className="absolute right-[4%] top-0 h-[82%] w-[44%] bg-gradient-to-b from-amber-200/15 to-amber-200/0 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />

          {burst && (
            <div
              data-anim="stretcher"
              className="absolute bottom-[30%] left-[6%] z-10 h-16 w-36"
            >
              <Medic className="left-0" />
              <span className="absolute bottom-7 left-6 h-2 w-24 rounded-sm bg-slate-300 shadow">
                <span className="absolute -top-1 inset-x-2 h-1.5 rounded-t-sm bg-slate-50" />
              </span>
              <Medic className="left-[112px]" />
            </div>
          )}

          <div
            data-anim={burst ? 'carried' : 'heave'}
            className="absolute bottom-[30%] left-[16%] z-10 h-28 w-20 origin-bottom"
          >
            <span
              data-anim={burst ? undefined : 'belly-swell'}
              className="absolute bottom-0 left-2 h-12 w-16 rounded-t-2xl bg-gradient-to-b from-sky-700 to-sky-900"
            />
            <SceneActor
              character={loser}
              className="bottom-[40px] left-2"
              anim={burst ? 'gobble tremble' : 'gobble bloat'}
              pose="origin-bottom"
              size="h-14 w-14 sm:h-16 sm:w-16"
            >
              <span
                data-anim={burst ? 'red-flush' : 'green-flush'}
                className={`absolute inset-0 rounded-full opacity-0 mix-blend-multiply ${burst ? 'bg-red-600' : 'bg-lime-500'}`}
              />
              {burst && <XEyes anim="x-in" />}
            </SceneActor>
            {!burst && (
              <span
                data-anim="spray"
                className="absolute bottom-[48px] left-[58px] h-5 w-16 origin-left bg-gradient-to-r from-lime-300 via-lime-500 to-lime-600 opacity-0 [clip-path:polygon(0_40%,100%_0,90%_50%,100%_100%,0_60%)] sm:bottom-[56px] sm:left-[64px]"
              />
            )}
          </div>
          {burst && (
            <span className="absolute bottom-[calc(30%+100px)] left-[calc(16%+62px)] z-10 h-12 w-7 sm:bottom-[calc(30%+108px)]">
              <span
                data-anim="gauge-burst"
                className="absolute inset-x-1.5 bottom-0 top-0 overflow-hidden rounded-full border-2 border-slate-400 bg-slate-900"
              >
                <span
                  data-anim="gauge-fill"
                  className="absolute inset-0 origin-bottom rounded-full bg-gradient-to-t from-red-700 to-red-500"
                />
              </span>
            </span>
          )}
          {burst && (
            <span className="absolute bottom-[calc(30%+64px)] left-[calc(16%+36px)] z-40">
              <BangBurst anim="bang-pop" />
            </span>
          )}

          <div className="absolute inset-x-[6%] bottom-0 z-20 h-[30%] rounded-t-md bg-gradient-to-b from-amber-800 to-amber-950 shadow-lg">
            <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-md bg-amber-600" />
            <span className="absolute inset-x-[10%] top-[24%] h-px bg-amber-950/60" />
          </div>
          <span className="absolute bottom-[29%] left-[calc(16%+40px)] z-20">
            <Plate eatable />
          </span>
          {!burst && (
            <span
              data-anim="puddle"
              className="absolute bottom-[28.5%] left-[calc(16%+64px)] z-20 h-2.5 w-24 origin-left rounded-[50%] bg-lime-600/90 opacity-0"
            >
              <span className="absolute left-[20%] top-[25%] h-1 w-2 rounded-full bg-amber-200/70" />
              <span className="absolute left-[60%] top-[35%] h-1 w-1.5 rounded-full bg-amber-200/60" />
            </span>
          )}

          <span className="absolute bottom-[29%] right-[calc(16%+72px)] z-20">
            <Plate eatable={false} />
          </span>

          <div
            data-anim="lights-out"
            className="absolute inset-0 z-30 bg-gradient-to-t from-red-950 via-slate-950 to-slate-950 opacity-0"
          />

          <div
            data-anim="lead-rise"
            className="absolute bottom-[30%] right-[16%] z-40 h-28 w-20"
          >
            <span
              data-anim="uplight"
              className="absolute -inset-x-8 -bottom-6 top-0 rounded-full bg-[radial-gradient(ellipse_at_50%_90%,rgba(220,38,38,0.7),transparent_70%)] opacity-0 blur-md"
            />
            <span className="absolute bottom-0 left-2 h-12 w-16 rounded-t-2xl bg-gradient-to-b from-zinc-700 to-zinc-900" />
            <span
              data-anim="stand-up"
              className="absolute left-2 top-full h-7 w-16 bg-gradient-to-b from-zinc-900 to-zinc-900/0 opacity-0"
            />
            <SceneActor
              character={lead}
              className="bottom-[40px] left-2"
              anim="cackle"
              pose="origin-bottom"
              size="h-14 w-14 sm:h-16 sm:w-16"
            >
              <span
                data-anim="evil-brows"
                className="absolute inset-x-[22%] top-[24%] z-10 flex justify-between opacity-0"
              >
                <span className="h-1 w-3.5 rotate-[22deg] rounded-full bg-slate-950" />
                <span className="h-1 w-3.5 -rotate-[22deg] rounded-full bg-slate-950" />
              </span>
              <span
                data-anim="uplight"
                className="absolute inset-0 rounded-full bg-gradient-to-t from-red-500/60 to-transparent opacity-0 mix-blend-screen"
              />
            </SceneActor>
            <span
              data-anim="glizzy-raise"
              className="absolute bottom-[30px] -left-2 z-30"
            >
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-orange-200 ring-2 ring-slate-950/50" />
              <GlizzyIcon
                variant={1}
                className="absolute -top-1 left-0 h-5 w-8 -rotate-12"
              />
            </span>
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
