'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import {
  TALK_BEAT_MS,
  type SceneAnimationSpec,
} from '@/lib/constants/sceneAnimations';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 951;
// Matches the lineStartMs of this scene's definition: the wrecked final, the
// cup, the egg on its rim and the shrug all read before the line
const LINE_START_MS = 4000;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The cheer lands as the bumper clears; the plate-slide, stamp-thud,
// vial-clink and body-thud cues of the definition land on these
const TOPPLE_MS = 1400;
const SHINE_MS = 1650;
const DROP_MS = 2100;
const LAND_MS = 2300;
const EGG_MS = 2550;
const TAP_MS = 2950;
const EGG_BACK_MS = 3200;
const GRAB_MS = 3400;
const LIFT_MS = 3650;
const SHRUG_MS = 3800;
const LOOK_MS = LINE_START_MS + 120;
const DROP_HEAD_MS = LINE_START_MS + LINE_MS + 350;

const HAND_REST = 'translate(46px, 0px)';
const HAND_EGG = 'translate(59px, -1px)';
const HAND_WIND = 'translate(65px, -21px)';
const HAND_TAP = 'translate(71px, -15px)';
const HAND_STEM = 'translate(85px, -3px)';
const HAND_LIFT = 'translate(75px, -37px)';
const HAND_SHRUG = 'translate(77px, -41px)';

const EGG_REST = 'translate(0, 0)';
const EGG_WIND = 'translate(6px, -22px)';
const EGG_TAP = 'translate(12px, -16px)';

const CUP_HIGH = 'translate(0, -220px) scaleY(1)';
const CUP_SET = 'translate(0, 0) scaleY(1)';
const CUP_LIFT = 'translate(-10px, -34px) scaleY(1)';
const CUP_SHRUG = 'translate(-8px, -38px) scaleY(1)';

const SLUMPED = 'translate(14px, 6px) rotate(96deg)';
const LIFTED = 'translate(2px, -8px) rotate(-4deg) scale(1.1)';

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'plate-topple': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' }],
    [TOPPLE_MS, { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' }],
    [
      TOPPLE_MS + 180,
      { opacity: 1, transform: 'translate(14px, -2px) rotate(28deg)' },
    ],
    [
      TOPPLE_MS + 520,
      { opacity: 0, transform: 'translate(34px, 70px) rotate(160deg)' },
    ],
    [
      TOTAL_MS,
      { opacity: 0, transform: 'translate(34px, 70px) rotate(160deg)' },
    ],
  ]),
  'finalist-head': sceneTimeline(TOTAL_MS, [
    [0, { transform: SLUMPED }],
    [LOOK_MS, { transform: SLUMPED }],
    [LOOK_MS + 260, { transform: LIFTED }],
    [DROP_HEAD_MS, { transform: LIFTED }],
    [DROP_HEAD_MS + 120, { transform: SLUMPED }],
    [TOTAL_MS, { transform: SLUMPED }],
  ]),
  'cup-drop': sceneTimeline(TOTAL_MS, [
    [0, { transform: CUP_HIGH }],
    [DROP_MS, { transform: CUP_HIGH }],
    [LAND_MS, { transform: 'translate(0, 0) scaleY(0.8)' }],
    [LAND_MS + 120, { transform: CUP_SET }],
    [GRAB_MS, { transform: CUP_SET }],
    [LIFT_MS, { transform: CUP_LIFT }],
    [SHRUG_MS, { transform: CUP_LIFT }],
    [SHRUG_MS + 180, { transform: CUP_SHRUG }],
    [TOTAL_MS, { transform: CUP_SHRUG }],
  ]),
  'right-hand': sceneTimeline(TOTAL_MS, [
    [0, { transform: HAND_REST }],
    [EGG_MS - 200, { transform: HAND_REST }],
    [EGG_MS, { transform: HAND_EGG }],
    [TAP_MS - 150, { transform: HAND_WIND }],
    [TAP_MS, { transform: HAND_TAP }],
    [TAP_MS + 120, { transform: HAND_WIND }],
    [EGG_BACK_MS, { transform: HAND_EGG }],
    [GRAB_MS - 60, { transform: HAND_STEM }],
    [GRAB_MS, { transform: HAND_STEM }],
    [LIFT_MS, { transform: HAND_LIFT }],
    [SHRUG_MS, { transform: HAND_LIFT }],
    [SHRUG_MS + 180, { transform: HAND_SHRUG }],
    [TOTAL_MS, { transform: HAND_SHRUG }],
  ]),
  egg: sceneTimeline(TOTAL_MS, [
    [0, { transform: EGG_REST }],
    [EGG_MS, { transform: EGG_REST }],
    [TAP_MS - 150, { transform: EGG_WIND }],
    [TAP_MS, { transform: EGG_TAP }],
    [TAP_MS + 120, { transform: EGG_WIND }],
    [EGG_BACK_MS, { transform: EGG_REST }],
    [TOTAL_MS, { transform: EGG_REST }],
  ]),
  'egg-crack': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [TAP_MS, { opacity: 0 }],
    [TAP_MS + 20, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'left-hand': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translate(4px, 0px) rotate(0deg) scaleY(1)' }],
    [SHRUG_MS, { transform: 'translate(4px, 0px) rotate(0deg) scaleY(1)' }],
    [
      SHRUG_MS + 200,
      { transform: 'translate(-16px, -26px) rotate(-20deg) scaleY(0.7)' },
    ],
    [
      TOTAL_MS,
      { transform: 'translate(-16px, -26px) rotate(-20deg) scaleY(0.7)' },
    ],
  ]),
  shoulders: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0)' }],
    [SHRUG_MS, { transform: 'translateY(0)' }],
    [SHRUG_MS + 180, { transform: 'translateY(-4px)' }],
    [TOTAL_MS, { transform: 'translateY(-4px)' }],
  ]),
  'lead-head': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0) rotate(0deg)' }],
    [EGG_MS, { transform: 'translateY(0) rotate(0deg)' }],
    [TAP_MS - 150, { transform: 'translateY(0) rotate(6deg)' }],
    [EGG_BACK_MS, { transform: 'translateY(0) rotate(6deg)' }],
    [GRAB_MS, { transform: 'translateY(0) rotate(0deg)' }],
    [SHRUG_MS, { transform: 'translateY(0) rotate(0deg)' }],
    [SHRUG_MS + 180, { transform: 'translateY(-4px) rotate(-8deg)' }],
    [TOTAL_MS, { transform: 'translateY(-4px) rotate(-8deg)' }],
  ]),
  burst: {
    keyframes: [
      { transform: 'scale(0.3) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1.2) rotate(30deg)', opacity: 1, offset: 0.25 },
      { transform: 'scale(0.6) rotate(60deg)', opacity: 0 },
    ],
    options: { duration: 380, easing: 'ease-out', fill: 'both' },
  },
  glint: {
    keyframes: [
      { transform: 'scale(0.2) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1.2) rotate(45deg)', opacity: 1, offset: 0.35 },
      { transform: 'scale(0.2) rotate(90deg)', opacity: 0 },
    ],
    options: { duration: 700, easing: 'ease-out', fill: 'both' },
  },
  confetti: {
    keyframes: [
      { transform: 'translateY(-20px) rotate(0deg)', opacity: 0 },
      {
        transform: 'translateY(10px) rotate(120deg)',
        opacity: 1,
        offset: 0.15,
      },
      { transform: 'translateY(190px) rotate(620deg)', opacity: 0.9 },
    ],
    options: { duration: 2400, iterations: Infinity, easing: 'linear' },
  },
};

const CONFETTI = [
  { cls: 'left-[6%] bg-amber-300', delay: 0 },
  { cls: 'left-[18%] bg-red-400', delay: -900 },
  { cls: 'left-[30%] bg-sky-300', delay: -1700 },
  { cls: 'left-[42%] bg-amber-300', delay: -500 },
  { cls: 'left-[54%] bg-cyan-200', delay: -1300 },
  { cls: 'left-[66%] bg-red-400', delay: -2100 },
  { cls: 'left-[78%] bg-sky-300', delay: -300 },
  { cls: 'left-[90%] bg-amber-300', delay: -1500 },
];

// Every stack is the finalist's; the offsets keep the piles leaning
const STACKS = [
  { cls: 'left-[18%]', plates: [0, 1, -1, 2, 0, -2, 1, 3, 0] },
  {
    cls: 'left-[27%]',
    plates: [0, -1, 1, 0, 2, -1, 1, 0, -2, 1, 2, 0, -1, 1, 0, 2],
  },
  { cls: 'left-[36%]', plates: [0, 1, 0, -1, 2, 1] },
];

const SMEARS = [
  'left-[20%] bottom-[41%] bg-red-500',
  'left-[30%] bottom-[43%] bg-yellow-400',
  'left-[38%] bottom-[41%] bg-red-500',
  'left-[24%] bottom-[40%] bg-amber-500',
];

const SWEAT = [
  { cls: 'left-[9%] bottom-[52%]', delay: 0 },
  { cls: 'left-[13%] bottom-[56%]', delay: -500 },
  { cls: 'left-[16%] bottom-[50%]', delay: -950 },
];

const CROWD = Array.from({ length: 14 }, (_, index) => index);

export default function EggOnTrophyScene({
  speaker,
  other,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const finalist = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor="bg-slate-800"
      >
        <div className="absolute inset-x-0 bottom-[40%] flex justify-around px-1">
          {CROWD.map((index) => (
            <span
              key={index}
              className={`h-5 w-7 rounded-t-full bg-slate-800/70 ${index % 2 ? 'mb-2' : ''}`}
            />
          ))}
        </div>
        <div className="absolute left-[44%] top-0 h-[84%] w-[50%] bg-gradient-to-b from-amber-200/25 to-amber-200/0 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />

        {CONFETTI.map((piece) => (
          <span
            key={piece.cls}
            data-anim="confetti"
            data-anim-delay={piece.delay}
            className={`absolute top-0 z-10 h-2 w-1 rounded-[1px] ${piece.cls}`}
          />
        ))}

        <span className="absolute bottom-[40%] left-[3%] z-10 h-6 w-16 rounded-t-2xl bg-gradient-to-b from-slate-500 to-slate-700 saturate-50" />

        <div className="absolute bottom-[18%] left-[2%] z-20 h-[22%] w-[96%]">
          <span className="absolute inset-x-0 top-0 h-2 rounded-sm bg-amber-800" />
          <span className="absolute inset-x-1 bottom-0 top-2 bg-gradient-to-b from-red-800 to-red-950 [clip-path:polygon(0_0,100%_0,97%_100%,3%_100%)]">
            <span className="absolute inset-x-0 top-1 h-1 bg-amber-300/70" />
          </span>
        </div>

        {STACKS.map((stack, stackIndex) => (
          <div
            key={stack.cls}
            className={`absolute bottom-[40%] z-30 flex w-12 flex-col-reverse items-center ${stack.cls}`}
          >
            {stack.plates.map((shift, index) => (
              <span
                key={index}
                data-anim={
                  stackIndex === 1 && index === stack.plates.length - 1
                    ? 'plate-topple'
                    : undefined
                }
                className={`-mt-0.5 h-1.5 w-11 shrink-0 rounded-[50%] bg-stone-100 ring-1 ring-stone-400 ${shift > 0 ? 'translate-x-0.5' : shift < 0 ? '-translate-x-0.5' : ''} ${Math.abs(shift) > 1 ? 'rotate-3' : ''}`}
              />
            ))}
          </div>
        ))}
        {SMEARS.map((cls) => (
          <span
            key={cls}
            className={`absolute z-30 h-1 w-1.5 rounded-full ${cls}`}
          />
        ))}
        <span className="absolute bottom-[39%] left-[45%] z-30 rotate-12 saturate-50">
          <GlizzyIcon variant={0} className="h-3 w-5" />
        </span>

        <div className="absolute bottom-[40%] left-[5%] z-40 h-12 w-12">
          <SceneActor
            character={finalist}
            className="bottom-0 left-0"
            anim="finalist-head"
            pose="origin-bottom saturate-50 brightness-90"
            size="h-12 w-12"
          />
        </div>
        {SWEAT.map((drop) => (
          <span
            key={drop.cls}
            data-anim="drip"
            data-anim-delay={drop.delay}
            className={`absolute z-50 h-2 w-1.5 rounded-full bg-sky-200/90 opacity-0 ${drop.cls}`}
          />
        ))}

        <div className="absolute bottom-[40%] left-[58%] z-40 h-[82px] w-16">
          <span
            data-anim="shoulders"
            className="absolute bottom-0 left-1 h-7 w-14 rounded-t-2xl bg-gradient-to-b from-amber-700 to-amber-900"
          />
          <SceneActor
            character={lead}
            className="bottom-[22px] left-1"
            anim="lead-head talk"
            animDelay={`0 ${LINE_START_MS}`}
            animIterations={`1 ${TALK_ITERATIONS}`}
            pose="origin-bottom"
            size="h-14 w-14"
          >
            <span
              data-anim="spotlight"
              data-anim-delay={LINE_START_MS}
              data-anim-duration={LINE_MS + QUOTE_SCENE_TAIL_MS}
              className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
            />
          </SceneActor>

          <span className="absolute bottom-[-3px] left-2 h-2 w-12 rounded-[50%] bg-stone-50 ring-1 ring-stone-300">
            <span className="absolute inset-x-3 top-0.5 h-0.5 rounded-full bg-stone-200" />
          </span>
          <span
            data-anim="glint"
            data-anim-delay={SHINE_MS}
            className="absolute bottom-[-2px] left-[40px] h-3.5 w-3.5 bg-stone-50 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
          />

          <span className="absolute bottom-[-3px] left-[61px] flex h-2.5 w-3 flex-col items-center">
            <span className="h-1.5 w-3 rounded-b-full bg-stone-300" />
            <span className="h-1 w-1 bg-stone-400" />
          </span>
          <span
            data-anim="egg"
            className="absolute bottom-[4px] left-[62px] z-10 h-3.5 w-2.5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-amber-50 ring-1 ring-amber-200/70"
          >
            <span
              data-anim="egg-crack"
              className="absolute inset-x-0 top-1 h-1 bg-amber-900/70 opacity-0 [clip-path:polygon(0_40%,25%_0,50%_60%,75%_0,100%_40%,100%_70%,75%_30%,50%_100%,25%_30%,0_70%)]"
            />
          </span>
          <span
            data-anim="burst"
            data-anim-delay={TAP_MS}
            className="absolute bottom-[20px] left-[78px] z-20 h-4 w-4 bg-amber-50 opacity-0 [clip-path:polygon(50%_0,58%_38%,95%_20%,64%_48%,100%_60%,58%_62%,60%_100%,44%_64%,10%_85%,38%_52%,0_30%,42%_40%)]"
          />

          <span
            data-anim="cup-drop"
            className="absolute bottom-[-5px] left-[74px] text-amber-300"
          >
            <Icon
              name="trophy"
              className="h-9 w-9 drop-shadow-[0_0_12px_rgba(252,211,77,0.85)]"
            />
          </span>
          <span
            data-anim="glint"
            data-anim-delay={LAND_MS}
            className="absolute bottom-[26px] left-[98px] h-4 w-4 bg-amber-100 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
          />

          <span
            data-anim="left-hand"
            className="absolute bottom-0 left-0 z-30 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40"
          />
          <span
            data-anim="right-hand"
            className="absolute bottom-0 left-0 z-30 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40"
          />
        </div>
      </SceneFrame>
    </div>
  );
}
