'use client';

import { useRef } from 'react';
import ElectionWinMilkCarton from '@/components/games/career/quotes/ElectionWinMilkCarton';
import ElectionWinPennant from '@/components/games/career/quotes/ElectionWinPennant';
import ElectionWinSuit from '@/components/games/career/quotes/ElectionWinSuit';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import PortraitHead from '@/components/games/PortraitHead';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import { electionWinPalette } from '@/lib/constants/electionWinPalette';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { governmentOfVariant } from '@/lib/utils/careerElectionScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 4200;
// Matches the lineStartMs of this scene's definition: he is out of the
// fridge and face to face with the citizen when the hold begins
const LINE_START_MS = 2800;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The sneak steps, both fridge-open cues, the brass, the gasp and the
// fridge-close of the definition land on these
const SNEAK_MS = 200;
const ARRIVE_MS = 950;
const OPEN_MS = 1000;
const OPENED_MS = 1250;
const GRAB_MS = 1450;
const GRABBED_MS = 1650;
const STEP_BACK_MS = 1750;
const POP_MS = 2000;
const DRINK_MS = 2150;
const OUT_MS = 2800;
const DROP_MS = 3100;
const LAND_MS = 3330;
const GASP_MS = 3400;
const SLAM_MS = 4400;
const SLAM_FROM_MS = SLAM_MS - 220;
const REOPEN_MS = 5200;
const REOPENED_MS = 5650;
const JOLT_MS = 5300;
const LEAN_AGAIN_MS = 5700;
const MAGNET_MS = 6200;
const MAGNET_STEP_MS = 220;

const SNEAK_STEPS = 6;
const SNEAK_PX = 190;
const BACK_PX = 34;

const DOOR_SHUT = 'perspective(800px) rotateY(0deg)';
const DOOR_OPEN = 'perspective(800px) rotateY(118deg)';

const ARM_DOWN = 'rotate(84deg)';
const ARM_SNEAK = 'rotate(18deg)';
const ARM_HANDLE = 'rotate(-28deg)';
const ARM_SHELF = 'rotate(-38deg) scaleX(1.35)';
const ARM_HOLD = 'rotate(28deg)';
const ARM_DRINK = 'rotate(-48deg)';
const ARM_FROZEN = 'rotate(22deg)';
const ARM_SHOVE = 'rotate(-8deg) scaleX(1.25)';
const ARM_SHOCK = 'rotate(-70deg)';

const CROUCH = 'translate(0px, 16px) scale(1)';
const STAND = 'translate(0px, 0px) scale(1)';
const HALF_OUT = 'translate(-42px, -4px) scale(1.12)';
const LEAN_OUT = 'translate(-40px, -3px) scale(1.08)';

const timeline = (frames: [number, Keyframe][], easing?: string) =>
  sceneTimeline(TOTAL_MS, frames, easing);

const sneakLeg = (side: 1 | -1) =>
  timeline([
    [0, { transform: 'rotate(0deg)' }],
    [SNEAK_MS, { transform: 'rotate(0deg)' }],
    ...Array.from({ length: SNEAK_STEPS }, (_, step): [number, Keyframe] => [
      SNEAK_MS + ((ARRIVE_MS - SNEAK_MS) / SNEAK_STEPS) * (step + 0.5),
      { transform: `rotate(${side * (step % 2 ? -22 : 22)}deg)` },
    ]),
    [ARRIVE_MS, { transform: 'rotate(0deg)' }],
    [STEP_BACK_MS, { transform: 'rotate(0deg)' }],
    [STEP_BACK_MS + 100, { transform: `rotate(${side * 16}deg)` }],
    [STEP_BACK_MS + 200, { transform: 'rotate(0deg)' }],
    [SLAM_FROM_MS, { transform: 'rotate(0deg)' }],
    [SLAM_MS - 60, { transform: `rotate(${side * -20}deg)` }],
    [SLAM_MS + 300, { transform: 'rotate(0deg)' }],
    [TOTAL_MS, { transform: 'rotate(0deg)' }],
  ]);

// One confetti piece thrown out of the fridge on the brass and again when
// the door swings back open
const confetti = (dx: number, dy: number, spin: number) => {
  const flight = (at: number, scale: number): [number, Keyframe][] => [
    [at, { opacity: 0, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [at + 20, { opacity: 1, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [
      at + 320,
      {
        opacity: 1,
        transform: `translate(${dx * scale}px, ${dy * scale}px) rotate(${spin}deg)`,
      },
    ],
    [
      at + 1500,
      {
        opacity: 1,
        transform: `translate(${dx * scale * 1.3}px, ${-dy * 0.4 + 40}px) rotate(${spin * 3}deg)`,
      },
    ],
    [
      at + 1700,
      {
        opacity: 0,
        transform: `translate(${dx * scale * 1.3}px, ${-dy * 0.4 + 44}px) rotate(${spin * 3}deg)`,
      },
    ],
  ];
  return timeline(
    [
      [0, { opacity: 0, transform: 'translate(0px, 0px) rotate(0deg)' }],
      ...flight(POP_MS, 1),
      ...flight(REOPENED_MS - 200, 0.7),
      [TOTAL_MS, { opacity: 0, transform: 'translate(0px, 0px) rotate(0deg)' }],
    ],
    'ease-out',
  );
};

const CONFETTI = [
  { dx: -120, dy: -70, spin: 260, cls: 'left-[-2px]' },
  { dx: -90, dy: -100, spin: -200, cls: 'left-0' },
  { dx: -60, dy: -84, spin: 320, cls: 'left-[2px]' },
  { dx: -30, dy: -110, spin: -280, cls: 'left-[-1px]' },
  { dx: 10, dy: -96, spin: 240, cls: 'left-[1px]' },
  { dx: 44, dy: -80, spin: -300, cls: 'left-0' },
  { dx: 76, dy: -60, spin: 220, cls: 'left-[-2px]' },
  { dx: -140, dy: -40, spin: -240, cls: 'left-[2px]' },
  { dx: 96, dy: -30, spin: 300, cls: 'left-0' },
  { dx: -76, dy: -50, spin: 180, cls: 'left-[1px]' },
];

const magnet = (index: number, face: boolean) => {
  const at = MAGNET_MS + index * MAGNET_STEP_MS;
  return timeline([
    [0, { opacity: face ? 0 : 1 }],
    [at + 90, { opacity: face ? 0 : 1 }],
    [at + 100, { opacity: face ? 1 : 0 }],
    [TOTAL_MS, { opacity: face ? 1 : 0 }],
  ]);
};

const magnetFlip = (index: number) => {
  const at = MAGNET_MS + index * MAGNET_STEP_MS;
  return timeline([
    [0, { transform: 'scaleX(1) scale(1)' }],
    [at, { transform: 'scaleX(1) scale(1)' }],
    [at + 100, { transform: 'scaleX(0) scale(1.2)' }],
    [at + 200, { transform: 'scaleX(1) scale(1.25)' }],
    [at + 320, { transform: 'scaleX(1) scale(1)' }],
    [TOTAL_MS, { transform: 'scaleX(1) scale(1)' }],
  ]);
};

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'citizen-walk': timeline([
    [0, { transform: `translate(-${SNEAK_PX}px, 0px)` }],
    [SNEAK_MS, { transform: `translate(-${SNEAK_PX}px, 0px)` }],
    ...Array.from({ length: SNEAK_STEPS }, (_, step): [number, Keyframe] => [
      SNEAK_MS + ((ARRIVE_MS - SNEAK_MS) / SNEAK_STEPS) * (step + 0.5),
      {
        transform: `translate(-${SNEAK_PX - (SNEAK_PX / SNEAK_STEPS) * (step + 0.5)}px, -5px)`,
      },
    ]),
    [ARRIVE_MS, { transform: 'translate(0px, 0px)' }],
    [STEP_BACK_MS, { transform: 'translate(0px, 0px)' }],
    [STEP_BACK_MS + 200, { transform: `translate(-${BACK_PX}px, 0px)` }],
    [SLAM_FROM_MS, { transform: `translate(-${BACK_PX}px, 0px)` }],
    [SLAM_MS - 60, { transform: 'translate(-4px, 0px)' }],
    [SLAM_MS + 300, { transform: `translate(-${BACK_PX + 6}px, 0px)` }],
    [JOLT_MS - 20, { transform: `translate(-${BACK_PX + 6}px, 0px)` }],
    [JOLT_MS + 120, { transform: `translate(-${BACK_PX + 12}px, -14px)` }],
    [JOLT_MS + 300, { transform: `translate(-${BACK_PX + 14}px, 0px)` }],
    [TOTAL_MS, { transform: `translate(-${BACK_PX + 14}px, 0px)` }],
  ]),
  'citizen-tremble': {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-1.5px)' },
      { transform: 'translateX(1.5px)' },
      { transform: 'translateX(0)' },
    ],
    options: { duration: 140, iterations: Infinity, easing: 'linear' },
  },
  'citizen-leg-front': sneakLeg(1),
  'citizen-leg-back': sneakLeg(-1),
  'citizen-arm': timeline([
    [0, { transform: ARM_SNEAK }],
    [ARRIVE_MS - 150, { transform: ARM_SNEAK }],
    [OPEN_MS, { transform: ARM_HANDLE }],
    [OPENED_MS, { transform: ARM_HANDLE }],
    [GRAB_MS, { transform: ARM_SHELF }],
    [GRABBED_MS, { transform: ARM_SHELF }],
    [STEP_BACK_MS + 150, { transform: ARM_HOLD }],
    [DRINK_MS, { transform: ARM_HOLD }],
    [DRINK_MS + 200, { transform: ARM_DRINK }],
    [OUT_MS, { transform: ARM_DRINK }],
    [OUT_MS + 200, { transform: ARM_FROZEN }],
    [DROP_MS, { transform: ARM_FROZEN }],
    [DROP_MS + 150, { transform: 'rotate(34deg)' }],
    [SLAM_FROM_MS, { transform: 'rotate(34deg)' }],
    [SLAM_MS - 60, { transform: ARM_SHOVE }],
    [SLAM_MS + 300, { transform: ARM_DOWN }],
    [JOLT_MS - 20, { transform: ARM_DOWN }],
    [JOLT_MS + 120, { transform: ARM_SHOCK }],
    [TOTAL_MS, { transform: ARM_SHOCK }],
  ]),
  'citizen-head': timeline([
    [0, { transform: 'rotate(0deg)' }],
    [GRABBED_MS, { transform: 'rotate(0deg)' }],
    [STEP_BACK_MS + 150, { transform: 'rotate(10deg)' }],
    [DRINK_MS, { transform: 'rotate(10deg)' }],
    [DRINK_MS + 200, { transform: 'rotate(-24deg)' }],
    [OUT_MS, { transform: 'rotate(-24deg)' }],
    [OUT_MS + 150, { transform: 'rotate(2deg)' }],
    [SLAM_FROM_MS, { transform: 'rotate(2deg)' }],
    [SLAM_MS, { transform: 'rotate(8deg)' }],
    [SLAM_MS + 400, { transform: 'rotate(-4deg)' }],
    [JOLT_MS, { transform: 'rotate(-4deg)' }],
    [JOLT_MS + 120, { transform: 'rotate(4deg)' }],
    [MAGNET_MS, { transform: 'rotate(4deg)' }],
    [MAGNET_MS + 300, { transform: 'rotate(-10deg)' }],
    [TOTAL_MS, { transform: 'rotate(-10deg)' }],
  ]),
  'citizen-eyes-open': timeline([
    [0, { opacity: 1 }],
    [DRINK_MS + 150, { opacity: 1 }],
    [DRINK_MS + 160, { opacity: 0 }],
    [OUT_MS + 100, { opacity: 0 }],
    [OUT_MS + 110, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'citizen-eyes-shut': timeline([
    [0, { opacity: 0 }],
    [DRINK_MS + 150, { opacity: 0 }],
    [DRINK_MS + 160, { opacity: 1 }],
    [OUT_MS + 100, { opacity: 1 }],
    [OUT_MS + 110, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'citizen-eyes-wide': timeline([
    [0, { opacity: 0, transform: 'scale(0.4)' }],
    [OUT_MS + 100, { opacity: 0, transform: 'scale(0.4)' }],
    [OUT_MS + 180, { opacity: 1, transform: 'scale(1.25)' }],
    [OUT_MS + 300, { opacity: 1, transform: 'scale(1)' }],
    [SLAM_MS + 300, { opacity: 1, transform: 'scale(1)' }],
    [SLAM_MS + 400, { opacity: 0, transform: 'scale(0.4)' }],
    [JOLT_MS, { opacity: 0, transform: 'scale(0.4)' }],
    [JOLT_MS + 80, { opacity: 1, transform: 'scale(1.3)' }],
    [JOLT_MS + 200, { opacity: 1, transform: 'scale(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scale(1)' }],
  ]),
  'citizen-mouth': timeline([
    [0, { transform: 'scale(1, 1)' }],
    [GASP_MS - 40, { transform: 'scale(1, 1)' }],
    [GASP_MS + 60, { transform: 'scale(0.9, 4)' }],
    [SLAM_FROM_MS, { transform: 'scale(0.9, 4)' }],
    [SLAM_FROM_MS + 100, { transform: 'scale(1, 1)' }],
    [JOLT_MS, { transform: 'scale(1, 1)' }],
    [JOLT_MS + 100, { transform: 'scale(0.9, 4)' }],
    [TOTAL_MS, { transform: 'scale(0.9, 4)' }],
  ]),
  'citizen-cap': timeline([
    [0, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [OUT_MS + 100, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [OUT_MS + 220, { transform: 'translate(0px, -6px) rotate(8deg)' }],
    [OUT_MS + 400, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [JOLT_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [JOLT_MS + 150, { transform: 'translate(2px, -16px) rotate(22deg)' }],
    [JOLT_MS + 400, { transform: 'translate(1px, -2px) rotate(12deg)' }],
    [TOTAL_MS, { transform: 'translate(1px, -2px) rotate(12deg)' }],
  ]),
  'milk-shelf': timeline([
    [0, { opacity: 1 }],
    [GRABBED_MS - 20, { opacity: 1 }],
    [GRABBED_MS, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'milk-hand': timeline([
    [0, { opacity: 0 }],
    [GRABBED_MS - 20, { opacity: 0 }],
    [GRABBED_MS, { opacity: 1 }],
    [DROP_MS, { opacity: 1 }],
    [DROP_MS + 10, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'milk-fall': timeline(
    [
      [0, { opacity: 0, transform: 'translate(0px, 0px) rotate(-6deg)' }],
      [DROP_MS, { opacity: 0, transform: 'translate(0px, 0px) rotate(-6deg)' }],
      [
        DROP_MS + 10,
        { opacity: 1, transform: 'translate(0px, 0px) rotate(-6deg)' },
      ],
      [
        LAND_MS,
        { opacity: 1, transform: 'translate(6px, 38px) rotate(40deg)' },
      ],
      [
        LAND_MS + 140,
        { opacity: 1, transform: 'translate(10px, 40px) rotate(90deg)' },
      ],
      [
        TOTAL_MS,
        { opacity: 1, transform: 'translate(10px, 40px) rotate(90deg)' },
      ],
    ],
    'ease-in',
  ),
  'milk-puddle': timeline([
    [0, { opacity: 0, transform: 'scale(0.1, 0.5)' }],
    [LAND_MS + 60, { opacity: 0, transform: 'scale(0.1, 0.5)' }],
    [LAND_MS + 500, { opacity: 1, transform: 'scale(1, 1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scale(1.2, 1)' }],
  ]),
  door: timeline([
    [0, { transform: DOOR_SHUT }],
    [OPEN_MS, { transform: DOOR_SHUT }],
    [OPENED_MS, { transform: DOOR_OPEN }],
    [SLAM_FROM_MS + 40, { transform: DOOR_OPEN }],
    [SLAM_MS, { transform: DOOR_SHUT }],
    [SLAM_MS + 60, { transform: 'perspective(800px) rotateY(6deg)' }],
    [SLAM_MS + 120, { transform: DOOR_SHUT }],
    [REOPEN_MS, { transform: DOOR_SHUT }],
    [REOPEN_MS + 150, { transform: 'perspective(800px) rotateY(24deg)' }],
    [REOPENED_MS, { transform: DOOR_OPEN }],
    [TOTAL_MS, { transform: DOOR_OPEN }],
  ]),
  'fridge-jolt': timeline([
    [0, { transform: 'translate(0px, 0px)' }],
    [SLAM_MS - 10, { transform: 'translate(0px, 0px)' }],
    [SLAM_MS + 40, { transform: 'translate(2px, -2px)' }],
    [SLAM_MS + 120, { transform: 'translate(-1px, 0px)' }],
    [SLAM_MS + 200, { transform: 'translate(0px, 0px)' }],
    [TOTAL_MS, { transform: 'translate(0px, 0px)' }],
  ]),
  'cold-light': timeline([
    [0, { opacity: 0 }],
    [OPEN_MS, { opacity: 0 }],
    [OPENED_MS, { opacity: 1 }],
    [SLAM_MS - 60, { opacity: 1 }],
    [SLAM_MS, { opacity: 0 }],
    [REOPEN_MS + 100, { opacity: 0 }],
    [REOPENED_MS, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'winner-move': timeline([
    [0, { transform: CROUCH }],
    [POP_MS - 60, { transform: CROUCH }],
    [POP_MS + 80, { transform: 'translate(0px, -4px) scale(1)' }],
    [POP_MS + 180, { transform: STAND }],
    [OUT_MS, { transform: STAND }],
    [OUT_MS + 250, { transform: HALF_OUT }],
    [SLAM_FROM_MS, { transform: HALF_OUT }],
    [SLAM_MS - 80, { transform: STAND }],
    [LEAN_AGAIN_MS, { transform: STAND }],
    [LEAN_AGAIN_MS + 250, { transform: LEAN_OUT }],
    [TOTAL_MS, { transform: LEAN_OUT }],
  ]),
  'winner-peek': timeline([
    [0, { transform: 'translateX(0px)' }],
    [OPENED_MS + 150, { transform: 'translateX(0px)' }],
    [OPENED_MS + 300, { transform: 'translateX(-3px) rotate(-6deg)' }],
    [GRABBED_MS + 50, { transform: 'translateX(-3px) rotate(-6deg)' }],
    [POP_MS - 160, { transform: 'translateX(2px) rotate(4deg)' }],
    [POP_MS - 60, { transform: 'translateX(0px) rotate(0deg)' }],
    [TOTAL_MS, { transform: 'translateX(0px) rotate(0deg)' }],
  ]),
  'winner-arm': timeline([
    [0, { opacity: 0, transform: 'rotate(-70deg)' }],
    [POP_MS + 40, { opacity: 0, transform: 'rotate(-70deg)' }],
    [POP_MS + 50, { opacity: 1, transform: 'rotate(-70deg)' }],
    [POP_MS + 160, { opacity: 1, transform: 'rotate(-125deg)' }],
    [TOTAL_MS, { opacity: 1, transform: 'rotate(-125deg)' }],
  ]),
  'winner-wave': {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-22deg)' },
      { transform: 'rotate(0deg)' },
    ],
    options: { duration: 420, iterations: Infinity, easing: 'ease-in-out' },
  },
  'party-burst': timeline([
    [0, { opacity: 0, transform: 'scale(0.2)' }],
    [POP_MS - 20, { opacity: 0, transform: 'scale(0.2)' }],
    [POP_MS + 150, { opacity: 1, transform: 'scale(1.5)' }],
    [POP_MS + 600, { opacity: 0.85, transform: 'scale(1)' }],
    [TOTAL_MS, { opacity: 0.85, transform: 'scale(1)' }],
  ]),
  'shelf-bump': timeline([
    [0, { transform: 'translateY(0px) rotate(0deg)' }],
    [POP_MS + 60, { transform: 'translateY(0px) rotate(0deg)' }],
    [POP_MS + 110, { transform: 'translateY(-3px) rotate(-2deg)' }],
    [POP_MS + 260, { transform: 'translateY(0px) rotate(1deg)' }],
    [POP_MS + 400, { transform: 'translateY(0px) rotate(0deg)' }],
    [TOTAL_MS, { transform: 'translateY(0px) rotate(0deg)' }],
  ]),
  ...Object.fromEntries(
    CONFETTI.map((piece, index) => [
      `confetti-${index}`,
      confetti(piece.dx, piece.dy, piece.spin),
    ]),
  ),
  ...Object.fromEntries(
    [0, 1, 2].flatMap((index) => [
      [`magnet-old-${index}`, magnet(index, false)],
      [`magnet-face-${index}`, magnet(index, true)],
      [`magnet-flip-${index}`, magnetFlip(index)],
    ]),
  ),
};

const MAGNETS = [
  'left-[8px] top-[8px]',
  'left-[38px] top-[18px]',
  'left-[68px] top-[6px]',
];

const PAJAMA =
  'bg-[repeating-linear-gradient(90deg,var(--color-sky-200)_0_3px,var(--color-sky-400)_3px_6px)]';
const PAJAMA_DARK =
  'bg-[repeating-linear-gradient(90deg,var(--color-sky-300)_0_3px,var(--color-sky-600)_3px_6px)]';

export default function ElectionFridgeScene({
  speaker,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const winner = characterBySlug(speaker);
  const party = governmentOfVariant(variant)[0] ?? 'red';
  const palette = electionWinPalette[party];
  useSceneAnimation(root, CUSTOM, [speaker, variant]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900"
        floor="bg-gradient-to-b from-slate-800 to-slate-900"
      >
        <div className="absolute inset-x-0 bottom-[18%] h-px bg-slate-700/60" />
        <div className="absolute inset-x-0 bottom-[calc(11%+52px)] h-[34px] bg-[linear-gradient(90deg,rgba(51,65,85,0.25)_1px,transparent_1px),linear-gradient(0deg,rgba(51,65,85,0.25)_1px,transparent_1px)] bg-[size:14px_14px]" />
        <div className="absolute inset-x-0 bottom-[11%] h-[52px] bg-[repeating-linear-gradient(90deg,var(--color-slate-800)_0_43px,var(--color-slate-950)_43px_44px)] shadow-[0_6px_14px_rgba(2,6,23,0.6)]">
          <span className="absolute inset-x-0 top-[-4px] h-[5px] bg-slate-600" />
          <span className="absolute inset-x-0 top-[16px] h-[2px] bg-[repeating-linear-gradient(90deg,transparent_0_30px,var(--color-slate-500)_30px_36px,transparent_36px_44px)]" />
        </div>
        <div className="absolute bottom-[11%] left-1/2 h-[200px] w-[320px] -translate-x-1/2 origin-bottom sm:scale-[1.12]">
          <div className="absolute bottom-[96px] left-[8px] h-[64px] w-[58px] overflow-hidden rounded-[3px] bg-gradient-to-b from-indigo-950 to-slate-900 ring-2 ring-slate-700">
            <span className="absolute right-[8px] top-[8px] h-[14px] w-[14px] rounded-full bg-amber-100 shadow-[0_0_14px_rgba(254,243,199,0.6)]" />
            <span className="absolute right-[5px] top-[6px] h-[12px] w-[12px] rounded-full bg-indigo-950" />
            <span className="absolute left-[14px] top-[30px] h-px w-px bg-slate-200" />
            <span className="absolute left-[34px] top-[16px] h-px w-px bg-slate-200" />
            <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-slate-700" />
            <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-slate-700" />
          </div>
          <span className="absolute bottom-[56px] left-[2px] h-[110px] w-[86px] bg-gradient-to-b from-indigo-300/5 to-transparent [clip-path:polygon(10%_0,80%_0,100%_100%,30%_100%)]" />

          <div className="absolute bottom-[53px] left-[50px] h-[16px] w-[24px] rounded-t-[6px] rounded-b-[2px] bg-slate-500 ring-1 ring-slate-950/60">
            <span className="absolute left-[5px] top-[-2px] h-[3px] w-[5px] rounded-[1px] bg-slate-950" />
            <span className="absolute left-[13px] top-[-2px] h-[3px] w-[5px] rounded-[1px] bg-slate-950" />
          </div>

          <div className="absolute bottom-[150px] left-[128px] h-[22px] w-[22px] rounded-full bg-slate-300 ring-2 ring-slate-600">
            <span className="absolute bottom-1/2 left-1/2 h-[7px] w-[2px] -translate-x-1/2 rounded-full bg-slate-900" />
            <span className="absolute bottom-1/2 left-1/2 h-[2px] w-[8px] translate-y-1/2 rounded-full bg-slate-900" />
          </div>

          <span
            data-anim="cold-light"
            className="absolute bottom-[-18px] left-[20px] z-10 h-[150px] w-[160px] bg-gradient-to-l from-cyan-100/30 via-cyan-100/10 to-transparent opacity-0 [clip-path:polygon(100%_10%,100%_100%,0_100%,0_75%)]"
          />
          <span
            data-anim="cold-light"
            className="absolute bottom-[-14px] left-[90px] z-10 h-[22px] w-[200px] rounded-[50%] bg-cyan-100/20 opacity-0 blur-sm"
          />

          <div
            data-anim="fridge-jolt"
            className="absolute bottom-0 left-[176px] h-[160px] w-[100px]"
          >
            <span className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500 shadow-[0_10px_24px_rgba(2,6,23,0.7)] ring-1 ring-slate-950/70" />
            <span className="absolute inset-x-[3px] top-[3px] h-[46px] rounded-t-[8px] rounded-b-[2px] bg-gradient-to-b from-slate-300 to-slate-400 ring-1 ring-slate-950/40">
              <span className="absolute bottom-[5px] left-[5px] h-[16px] w-[3px] rounded-full bg-slate-600" />
              {MAGNETS.map((cls, index) => (
                <span
                  key={cls}
                  data-anim={`magnet-flip-${index}`}
                  className={`absolute h-[22px] w-[22px] ${cls}`}
                >
                  <span
                    data-anim={`magnet-old-${index}`}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {index === 0 && (
                      <span className="relative h-[12px] w-[12px] rounded-full bg-red-500 ring-1 ring-slate-950/40">
                        <span className="absolute left-[5px] top-[-3px] h-[4px] w-[3px] rounded-full bg-green-600" />
                      </span>
                    )}
                    {index === 1 && (
                      <span className="relative h-[14px] w-[13px] rotate-6 bg-amber-200 ring-1 ring-slate-950/30">
                        <span className="absolute inset-x-[2px] top-[4px] h-px bg-slate-500" />
                        <span className="absolute inset-x-[2px] top-[7px] h-px bg-slate-500" />
                        <span className="absolute left-[2px] right-[5px] top-[10px] h-px bg-slate-500" />
                      </span>
                    )}
                    {index === 2 && (
                      <GlizzyIcon className="h-[11px] w-[17px] -rotate-12" />
                    )}
                  </span>
                  <span
                    data-anim={`magnet-face-${index}`}
                    className="absolute inset-0 opacity-0"
                  >
                    <PortraitHead
                      character={winner}
                      className={`h-[22px] w-[22px] border ring-2 ${SPONSOR_THEMES[party].actorRing}`}
                    />
                  </span>
                </span>
              ))}
            </span>

            <div className="absolute bottom-[5px] left-[5px] right-[5px] top-[54px] overflow-hidden rounded-[3px] bg-gradient-to-b from-cyan-50 via-sky-100 to-sky-200 shadow-[inset_0_0_10px_rgba(14,116,144,0.35)]">
              <span className="absolute left-1/2 top-[2px] h-[6px] w-[30px] -translate-x-1/2 rounded-full bg-white blur-[3px]" />
              <span
                data-anim="party-burst"
                className={`absolute left-[0px] top-[10px] h-[90px] w-[90px] rounded-full opacity-0 blur-lg ${palette.burst}`}
              />
              <div
                data-anim="shelf-bump"
                className="absolute inset-x-0 top-0 h-[29px]"
              >
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-slate-50 shadow-[0_2px_3px_rgba(15,23,42,0.25)]" />
                <span data-anim="milk-shelf" className="absolute inset-0">
                  <ElectionWinMilkCarton className="bottom-[3px] left-[8px]" />
                </span>
                <span className="absolute bottom-[3px] left-[26px] h-[12px] w-[13px] rounded-t-[3px] rounded-b-[2px] bg-red-400/80 ring-1 ring-slate-950/30">
                  <span className="absolute inset-x-[-1px] top-[-3px] h-[4px] rounded-[1px] bg-slate-500" />
                </span>
                <span className="absolute bottom-[3px] right-[8px] h-[9px] w-[26px] rounded-[2px] bg-amber-200 ring-1 ring-slate-950/30 [clip-path:polygon(0_100%,0_30%,100%_0,100%_100%)]" />
              </div>
              <span className="absolute inset-x-[2px] bottom-0 h-[14px] rounded-t-[2px] bg-sky-200/70 ring-1 ring-sky-400/60" />
            </div>
          </div>

          <div
            data-anim="winner-move"
            className="absolute bottom-[19px] left-[204px] z-20 h-[62px] w-[44px] origin-bottom"
          >
            <ElectionWinSuit
              party={party}
              className="bottom-0 left-[4px] h-[26px] w-[36px]"
            />
            <span
              data-anim="winner-arm"
              className="absolute bottom-[16px] left-[8px] h-[7px] w-[24px] origin-[3px_50%] rounded-full bg-slate-700 opacity-0 ring-1 ring-slate-950/60"
            >
              <span
                data-anim="winner-wave"
                data-anim-delay={POP_MS + 120}
                className="absolute left-[2px] top-0 h-[7px] w-[24px] origin-[1px_50%]"
              >
                <span className="absolute right-[-4px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                <span className="absolute right-[-2px] top-[-10px] h-[26px] w-[2px] rotate-90 bg-slate-300">
                  <ElectionWinPennant
                    party={party}
                    className="absolute left-[2px] top-0 h-[13px] w-[19px]"
                  />
                </span>
              </span>
            </span>
            <SceneActor
              character={winner}
              className="bottom-[20px] left-[4px]"
              anim="winner-peek"
              pose="origin-bottom"
              size="h-9 w-9"
            />
          </div>

          <span className="absolute bottom-[5px] left-[183px] z-30 h-[14px] w-[86px] rounded-t-[2px] bg-sky-200 ring-1 ring-sky-400/70" />
          <div className="absolute bottom-[19px] left-[194px] z-30 h-[24px] w-[66px]">
            <span className="absolute inset-x-0 bottom-0 h-[6px] rounded-[50%] bg-slate-50 ring-1 ring-slate-400" />
            <GlizzyIcon className="absolute bottom-[2px] left-[2px] h-[13px] w-[22px]" />
            <GlizzyIcon className="absolute bottom-[2px] left-[22px] h-[13px] w-[22px]" />
            <GlizzyIcon className="absolute bottom-[2px] left-[42px] h-[13px] w-[22px]" />
            <GlizzyIcon className="absolute bottom-[10px] left-[11px] h-[13px] w-[22px] -rotate-6" />
            <GlizzyIcon className="absolute bottom-[10px] left-[32px] h-[13px] w-[22px] rotate-6" />
          </div>

          <div className="absolute bottom-[3px] left-[176px] z-40 h-[105px] w-[100px]">
            <div
              data-anim="door"
              className="absolute inset-0 origin-right [transform-style:preserve-3d]"
            >
              <span className="absolute inset-0 rounded-b-[9px] rounded-t-[2px] bg-gradient-to-b from-slate-300 to-slate-400 ring-1 ring-slate-950/60 [backface-visibility:hidden]">
                <span className="absolute left-[5px] top-[6px] h-[26px] w-[3px] rounded-full bg-slate-600" />
              </span>
              <span className="absolute inset-0 rounded-b-[9px] rounded-t-[2px] bg-gradient-to-b from-slate-200 to-slate-300 ring-1 ring-slate-950/60 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <span className="absolute inset-x-[8px] top-[34px] h-[4px] rounded-[1px] bg-slate-400" />
                <span className="absolute inset-x-[8px] top-[72px] h-[4px] rounded-[1px] bg-slate-400" />
                <span className="absolute left-[16px] top-[16px] h-[19px] w-[9px] rounded-t-[4px] bg-red-500" />
                <span className="absolute left-[30px] top-[20px] h-[15px] w-[9px] rounded-t-[4px] bg-yellow-400" />
                <span className="absolute left-[60px] top-[54px] h-[19px] w-[14px] rounded-t-[3px] bg-emerald-600/80" />
              </span>
            </div>
          </div>

          {CONFETTI.map((piece, index) => (
            <span
              key={index}
              data-anim={`confetti-${index}`}
              className={`absolute bottom-[64px] z-50 ml-[226px] h-[7px] w-[4px] rounded-[1px] opacity-0 ${piece.cls} ${palette.sparks[index % 3]}`}
            />
          ))}

          <span
            data-anim="milk-puddle"
            className="absolute bottom-[-6px] left-[130px] z-10 h-[8px] w-[46px] rounded-[50%] bg-slate-50/90 opacity-0"
          />
          <span
            data-anim="milk-fall"
            className="absolute bottom-[38px] left-[136px] z-30 h-[20px] w-[12px] opacity-0"
          >
            <ElectionWinMilkCarton className="inset-0" />
          </span>

          <div
            data-anim="citizen-walk"
            className="absolute bottom-0 left-[124px] z-20 h-[112px] w-[48px]"
          >
            <div
              data-anim="citizen-tremble"
              data-anim-delay={GASP_MS}
              className="absolute inset-0"
            >
              <span
                className={`absolute bottom-[54px] left-[14px] h-[7px] w-[24px] origin-[3px_50%] rotate-[100deg] rounded-full ring-1 ring-slate-950/50 ${PAJAMA_DARK}`}
              />
              <span
                data-anim="citizen-leg-back"
                className={`absolute bottom-[4px] left-[14px] h-[28px] w-[9px] origin-top rounded-b-[2px] ring-1 ring-slate-950/50 ${PAJAMA_DARK}`}
              >
                <span className="absolute bottom-[-4px] left-[-1px] h-[6px] w-[14px] rounded-full bg-rose-300 ring-1 ring-slate-950/40" />
              </span>
              <span
                data-anim="citizen-leg-front"
                className={`absolute bottom-[4px] left-[22px] h-[28px] w-[9px] origin-top rounded-b-[2px] ring-1 ring-slate-950/50 ${PAJAMA}`}
              >
                <span className="absolute bottom-[-4px] left-[-1px] h-[6px] w-[14px] rounded-full bg-rose-300 ring-1 ring-slate-950/40" />
              </span>
              <span
                className={`absolute bottom-[28px] left-[9px] h-[38px] w-[30px] rounded-b-[6px] rounded-t-[14px] ring-1 ring-slate-950/50 ${PAJAMA}`}
              >
                <span className="absolute left-[20px] top-[10px] h-[3px] w-[3px] rounded-full bg-slate-50" />
                <span className="absolute left-[20px] top-[20px] h-[3px] w-[3px] rounded-full bg-slate-50" />
              </span>
              <span
                data-anim="citizen-head"
                className="absolute bottom-[62px] left-[10px] h-[30px] w-[30px] origin-bottom"
              >
                <span className="absolute inset-0 rounded-full bg-orange-200 ring-1 ring-slate-950/50" />
                <span className="absolute right-[-3px] top-[13px] h-[7px] w-[7px] rounded-full bg-orange-300 ring-1 ring-slate-950/30" />
                <span className="absolute left-[6px] top-[12px] h-[7px] w-[5px] rounded-full bg-orange-300" />
                <span className="absolute left-[-2px] top-[4px] h-[12px] w-[10px] -rotate-12 rounded-full bg-amber-800" />
                <span
                  data-anim="citizen-eyes-open"
                  className="absolute inset-0"
                >
                  <span className="absolute left-[19px] top-[11px] h-[4px] w-[3px] rounded-full bg-slate-950" />
                </span>
                <span
                  data-anim="citizen-eyes-shut"
                  className="absolute inset-0 opacity-0"
                >
                  <span className="absolute left-[17px] top-[12px] h-[2px] w-[6px] rounded-full bg-slate-950" />
                </span>
                <span
                  data-anim="citizen-eyes-wide"
                  className="absolute left-[15px] top-[6px] h-[10px] w-[10px] rounded-full bg-slate-50 opacity-0 ring-1 ring-slate-950/60"
                >
                  <span className="absolute left-[5px] top-[3px] h-[3px] w-[3px] rounded-full bg-slate-950" />
                </span>
                <span
                  data-anim="citizen-mouth"
                  className="absolute left-[19px] top-[21px] h-[2px] w-[6px] rounded-full bg-slate-950"
                />
                <span
                  data-anim="citizen-cap"
                  className="absolute left-[-6px] top-[-14px] h-[22px] w-[36px] origin-bottom"
                >
                  <span className="absolute bottom-0 left-[6px] h-[8px] w-[30px] rounded-t-[10px] bg-sky-500 ring-1 ring-slate-950/40" />
                  <span className="absolute bottom-[6px] left-[2px] h-[16px] w-[28px] bg-sky-500 [clip-path:polygon(25%_100%,100%_100%,40%_10%,0_0)]" />
                  <span className="absolute left-[-3px] top-[-3px] h-[8px] w-[8px] rounded-full bg-slate-50 ring-1 ring-slate-950/30" />
                </span>
              </span>
              <span
                data-anim="citizen-arm"
                className={`absolute bottom-[52px] left-[22px] h-[8px] w-[28px] origin-[4px_50%] rounded-full ring-1 ring-slate-950/50 ${PAJAMA} [transform:rotate(18deg)]`}
              >
                <span className="absolute right-[-4px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                <span
                  data-anim="milk-hand"
                  className="absolute right-[-6px] top-1/2 h-0 w-0 opacity-0"
                >
                  <span className="absolute bottom-[-4px] left-[-6px] h-[20px] w-[12px] -rotate-[28deg]">
                    <ElectionWinMilkCarton className="inset-0" />
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
