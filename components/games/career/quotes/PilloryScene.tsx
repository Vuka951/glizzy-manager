'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import {
  TALK_BEAT_MS,
  type SceneAnimationSpec,
} from '@/lib/constants/sceneAnimations';
import {
  QUOTE_LINE_START_MS,
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 2800;
const TOTAL_MS = QUOTE_LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
const FLIGHT_MS = 380;
const ARC_STEPS = 6;

// The hit-paint-splat cues of this scene's definition land on each `at` and
// the throw-whoosh cues one flight earlier. dx and dy run from the thrower's
// hand to the spot the tomato bursts on, peak is how high the arc climbs
const THROWS = [
  {
    at: 1350,
    face: false,
    dx: -233,
    dy: 11,
    peak: 46,
    splat: 'bottom-[75px] left-[11px] h-[22px] w-[22px]',
  },
  {
    at: 2000,
    face: true,
    dx: -179,
    dy: 3,
    peak: 40,
    splat: 'left-[10px] top-[8px] h-5 w-5',
  },
  {
    at: 2700,
    face: false,
    dx: -105,
    dy: 19,
    peak: 30,
    splat: 'bottom-[67px] left-[139px] h-[22px] w-[22px]',
  },
  {
    at: 3400,
    face: true,
    dx: -160,
    dy: 21,
    peak: 38,
    splat: 'left-[29px] top-[26px] h-5 w-5',
  },
  {
    at: 4250,
    face: true,
    dx: -171,
    dy: 11,
    peak: 52,
    splat: 'left-[13px] top-[10px] h-[30px] w-[30px]',
  },
];
const LAST_HIT_MS = THROWS[THROWS.length - 1].at;

type Throw = (typeof THROWS)[number];

const onEachThrow = (
  rest: Keyframe,
  beat: (at: number) => [number, Keyframe][],
): SceneAnimationSpec =>
  sceneTimeline(TOTAL_MS, [
    [0, rest],
    ...THROWS.flatMap(({ at }) => beat(at)),
    [TOTAL_MS, rest],
  ]);

const flight = ({ at, dx, dy, peak }: Throw): SceneAnimationSpec => {
  const launch = at - FLIGHT_MS;
  const arc = Array.from({ length: ARC_STEPS + 1 }, (_, step) => {
    const t = step / ARC_STEPS;
    const x = Math.round(dx * t);
    const y = Math.round(dy * t - peak * 4 * t * (1 - t));
    return `translate(${x}px, ${y}px) rotate(${Math.round(-360 * t)}deg)`;
  });
  return sceneTimeline(
    TOTAL_MS,
    [
      [0, { opacity: 0, transform: arc[0] }],
      [launch - 1, { opacity: 0, transform: arc[0] }],
      ...arc.map((transform, step): [number, Keyframe] => [
        launch + (FLIGHT_MS * step) / ARC_STEPS,
        { opacity: 1, transform },
      ]),
      [at + 1, { opacity: 0, transform: arc[ARC_STEPS] }],
      [TOTAL_MS, { opacity: 0, transform: arc[ARC_STEPS] }],
    ],
    'linear',
  );
};

const splat = (at: number): SceneAnimationSpec =>
  sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scale(0.3)' }],
    [at - 1, { opacity: 0, transform: 'scale(0.3)' }],
    [at + 60, { opacity: 1, transform: 'scale(1.3)' }],
    [at + 220, { opacity: 1, transform: 'scale(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scale(1)' }],
  ]);

const drip = (at: number): SceneAnimationSpec =>
  sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scaleY(0)' }],
    [at + 200, { transform: 'scaleY(0)' }],
    [at + 1200, { transform: 'scaleY(1)' }],
    [TOTAL_MS, { transform: 'scaleY(1)' }],
  ]);

const ARM_REST: Keyframe = { transform: 'rotate(-60deg)' };
const HEAD_STILL: Keyframe = { transform: 'translate(0, 0) rotate(0deg)' };
const HEAD_DROOP: Keyframe = { transform: 'translate(0, 4px) rotate(-9deg)' };
const UPRIGHT: Keyframe = { transform: 'rotate(0deg)' };
const GROUNDED: Keyframe = { transform: 'translateY(0)' };
const AIRBORNE: Keyframe = { transform: 'translateY(-10px)' };

const CUSTOM: Record<string, SceneAnimationSpec> = {
  ...Object.fromEntries(
    THROWS.flatMap((item, index) => [
      [`tomato-${index}`, flight(item)],
      [`splat-${index}`, splat(item.at)],
      [`drip-${index}`, drip(item.at)],
    ]),
  ),
  'throw-arm': onEachThrow(ARM_REST, (at) => [
    [at - FLIGHT_MS - 320, ARM_REST],
    [at - FLIGHT_MS - 80, { transform: 'rotate(130deg)' }],
    [at - FLIGHT_MS, { transform: 'rotate(20deg)' }],
    [at - FLIGHT_MS + 110, { transform: 'rotate(-30deg)' }],
    [at - FLIGHT_MS + 280, ARM_REST],
  ]),
  'in-hand': onEachThrow({ opacity: 0 }, (at) => [
    [at - FLIGHT_MS - 320, { opacity: 0 }],
    [at - FLIGHT_MS - 300, { opacity: 1 }],
    [at - FLIGHT_MS - 1, { opacity: 1 }],
    [at - FLIGHT_MS, { opacity: 0 }],
  ]),
  'throw-lean': onEachThrow(UPRIGHT, (at) => [
    [at - FLIGHT_MS - 320, UPRIGHT],
    [at - FLIGHT_MS - 80, { transform: 'rotate(5deg)' }],
    [at - FLIGHT_MS + 60, { transform: 'rotate(-7deg)' }],
    [at - FLIGHT_MS + 280, UPRIGHT],
  ]),
  gloat: sceneTimeline(TOTAL_MS, [
    [0, GROUNDED],
    [LAST_HIT_MS + 150, GROUNDED],
    [LAST_HIT_MS + 300, AIRBORNE],
    [LAST_HIT_MS + 450, GROUNDED],
    [LAST_HIT_MS + 600, AIRBORNE],
    [LAST_HIT_MS + 750, GROUNDED],
    [LAST_HIT_MS + 900, AIRBORNE],
    [LAST_HIT_MS + 1050, GROUNDED],
    [TOTAL_MS, GROUNDED],
  ]),
  rattle: onEachThrow(HEAD_STILL, (at) => [
    [at - 1, HEAD_STILL],
    [at + 50, { transform: 'translate(-3px, 0) rotate(-1.2deg)' }],
    [at + 240, HEAD_STILL],
  ]),
  flinch: sceneTimeline(TOTAL_MS, [
    [0, HEAD_STILL],
    ...THROWS.flatMap(({ at, face }): [number, Keyframe][] => [
      [at - 1, HEAD_STILL],
      [
        at + 50,
        {
          transform: face
            ? 'translate(-6px, 2px) rotate(-12deg)'
            : 'translate(0, -3px) rotate(3deg)',
        },
      ],
      [at + 380, at === LAST_HIT_MS ? HEAD_DROOP : HEAD_STILL],
    ]),
    [TOTAL_MS, HEAD_DROOP],
  ]),
  grasp: onEachThrow({ transform: 'scale(1)' }, (at) => [
    [at - 1, { transform: 'scale(1)' }],
    [at + 60, { transform: 'scale(1.35)' }],
    [at + 300, { transform: 'scale(1)' }],
  ]),
  smug: {
    keyframes: [
      { transform: 'rotate(-4deg) translateY(0)' },
      { transform: 'rotate(-10deg) translateY(-2px)', offset: 0.5 },
      { transform: 'rotate(-4deg) translateY(0)' },
    ],
    options: { duration: 1400, iterations: Infinity, easing: 'ease-in-out' },
  },
};

const HOUSES = [
  'left-[2%] h-[36%] w-28',
  'left-[30%] h-[42%] w-24',
  'left-[62%] h-[34%] w-28',
  'left-[86%] h-[40%] w-24',
];

const SUNFLOWERS = [
  'left-[5%] h-9',
  'left-[8%] h-7',
  'left-[54%] h-8',
  'left-[93%] h-9',
  'left-[96%] h-6',
];

const CRATE_TOMATOES = [
  'left-0.5 -top-2',
  'left-3 -top-3',
  'left-[22px] -top-2',
];

const TOMATO =
  'rounded-full bg-red-500 ring-1 ring-red-900/70 shadow-[inset_-2px_-2px_0_rgba(127,29,29,0.45)]';
const SPLAT_DROPLETS = [
  'left-0 top-[8%] h-[24%] w-[24%]',
  'right-0 top-0 h-[20%] w-[20%]',
  'right-[2%] bottom-[8%] h-[22%] w-[22%]',
  'left-[4%] bottom-[2%] h-[18%] w-[18%]',
];
const HAND_HOLE =
  'absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-amber-950';
const HAND =
  'absolute inset-[2px] rounded-full bg-orange-200 ring-1 ring-slate-950/40';

export default function PilloryScene({
  speaker,
  other,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const winner = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other]);

  const splatOf = (index: number) => (
    <span
      key={index}
      data-anim={`splat-${index}`}
      className={`absolute z-10 opacity-0 ${THROWS[index].splat}`}
    >
      <span
        data-anim={`drip-${index}`}
        className="absolute left-[42%] top-[60%] h-[65%] w-[18%] origin-top rounded-full bg-red-500"
      />
      {SPLAT_DROPLETS.map((cls) => (
        <span key={cls} className={`absolute rounded-full bg-red-500 ${cls}`} />
      ))}
      <span className="absolute inset-[10%] rounded-[46%_54%_42%_58%/55%_45%_55%_45%] bg-red-500 ring-1 ring-red-800/60" />
      <span className="absolute inset-[28%] rounded-full bg-orange-400" />
      <span className="absolute left-[36%] top-[34%] h-[13%] w-[13%] rounded-full bg-yellow-100" />
      <span className="absolute left-[54%] top-[48%] h-[13%] w-[13%] rounded-full bg-yellow-100" />
      <span className="absolute left-[38%] top-[56%] h-[11%] w-[11%] rounded-full bg-yellow-100" />
    </span>
  );

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-sky-900 via-sky-700 to-amber-200"
        floor="bg-gradient-to-b from-stone-500 to-stone-700"
      >
        {HOUSES.map((cls) => (
          <div key={cls} className={`absolute bottom-[18%] ${cls}`}>
            <span className="absolute inset-x-0 bottom-0 h-[60%] bg-stone-400" />
            <span className="absolute -inset-x-2 top-0 h-[46%] bg-red-950 [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
            <span className="absolute bottom-[26%] left-[16%] h-[18%] w-[18%] bg-amber-200/90 ring-1 ring-stone-700" />
            <span className="absolute bottom-[26%] right-[16%] h-[18%] w-[18%] bg-amber-200/90 ring-1 ring-stone-700" />
            <span className="absolute bottom-0 left-1/2 h-[30%] w-[16%] -translate-x-1/2 rounded-t-sm bg-amber-950" />
          </div>
        ))}
        <span className="absolute inset-x-0 bottom-[18%] h-[10%] bg-[repeating-linear-gradient(90deg,#92400e_0,#92400e_7px,transparent_7px,transparent_11px)]" />
        <span className="absolute inset-x-0 bottom-[23%] h-0.5 bg-amber-950" />
        {SUNFLOWERS.map((cls) => (
          <span
            key={cls}
            className={`absolute bottom-[18%] w-0.5 bg-green-700 ${cls}`}
          >
            <span className="absolute -left-[7px] -top-2 h-4 w-4 rounded-full bg-yellow-400 ring-1 ring-yellow-600">
              <span className="absolute inset-1 rounded-full bg-amber-900" />
            </span>
          </span>
        ))}
        <span className="absolute inset-x-0 bottom-0 h-[18%] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_26px,rgba(28,25,23,0.22)_26px,rgba(28,25,23,0.22)_28px)]" />

        <div className="absolute bottom-[10%] left-1/2 h-[160px] w-[340px] -translate-x-1/2">
          <div
            data-anim="rattle"
            className="absolute bottom-0 left-0 h-[124px] w-[168px] origin-bottom"
          >
            <span className="absolute -bottom-1 left-2 h-2 w-[152px] rounded-[50%] bg-stone-950/40" />
            <span className="absolute bottom-0 left-[13px] h-[116px] w-[10px] rounded-t-sm bg-gradient-to-r from-amber-950 to-amber-900" />
            <span className="absolute bottom-0 left-[145px] h-[116px] w-[10px] rounded-t-sm bg-gradient-to-r from-amber-950 to-amber-900" />
            <span className="absolute bottom-0 left-[7px] h-2 w-[22px] rounded-sm bg-amber-950" />
            <span className="absolute bottom-0 left-[139px] h-2 w-[22px] rounded-sm bg-amber-950" />

            <span className="absolute bottom-0 left-[70px] h-8 w-3 rounded-b-md bg-slate-700" />
            <span className="absolute bottom-0 left-[86px] h-8 w-3 rounded-b-md bg-slate-700" />
            <span className="absolute bottom-7 left-[60px] h-10 w-12 rounded-t-2xl bg-gradient-to-b from-sky-800 to-sky-900" />

            <div className="absolute bottom-[58px] left-1 z-10 h-[46px] w-[160px] rounded-md bg-gradient-to-b from-amber-600 to-amber-800 shadow-lg ring-1 ring-amber-950/70">
              <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-amber-950/80" />
              <span className="absolute inset-y-0 left-1 w-1.5 bg-slate-600" />
              <span className="absolute inset-y-0 right-1 w-1.5 bg-slate-600" />
              <span className="absolute right-0 top-1/2 h-3 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-sm bg-slate-300 ring-1 ring-slate-800" />
              <span className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-950" />
              <span className={`left-[33px] ${HAND_HOLE}`}>
                <span data-anim="grasp" className={HAND} />
              </span>
              <span className={`left-[121px] ${HAND_HOLE}`}>
                <span data-anim="grasp" className={HAND} />
              </span>
            </div>
            {THROWS.map((item, index) => (item.face ? null : splatOf(index)))}

            <SceneActor
              character={lead}
              className="bottom-[56px] left-[56px]"
              anim="flinch talk"
              animDelay={`0 ${QUOTE_LINE_START_MS}`}
              animIterations={`1 ${TALK_ITERATIONS}`}
              pose="origin-bottom"
              size="h-14 w-14"
            >
              <span
                data-anim="spotlight"
                data-anim-delay={QUOTE_LINE_START_MS}
                data-anim-duration={LINE_MS}
                className="absolute -inset-3 -z-10 rounded-full bg-amber-100/25 opacity-0 blur-md"
              />
              {THROWS.map((item, index) => (item.face ? splatOf(index) : null))}
            </SceneActor>
          </div>

          <div className="absolute bottom-0 left-[238px] h-4 w-9 rounded-sm bg-amber-800 ring-1 ring-amber-950">
            <span className="absolute inset-x-0 top-1/2 h-px bg-amber-950" />
            {CRATE_TOMATOES.map((cls) => (
              <span
                key={cls}
                className={`absolute -z-10 h-3.5 w-3.5 ${TOMATO} ${cls}`}
              />
            ))}
          </div>

          <div
            data-anim="throw-lean gloat"
            className="absolute bottom-0 left-[276px] h-[150px] w-16 origin-bottom"
          >
            <span className="absolute bottom-0 left-4 h-12 w-3.5 rounded-b-md bg-slate-900" />
            <span className="absolute bottom-0 left-9 h-12 w-3.5 rounded-b-md bg-slate-900" />
            <span className="absolute bottom-11 left-2 h-12 w-12 rounded-t-2xl bg-gradient-to-b from-stone-600 to-stone-700" />
            <div
              data-anim="throw-arm"
              className="absolute bottom-[84px] left-[10px] z-30 h-0 w-0"
            >
              <span className="absolute -top-1.5 right-0 h-3 w-8 rounded-full bg-stone-600" />
              <span className="absolute -left-[36px] -top-2 h-4 w-4 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              <span
                data-anim="in-hand"
                className={`absolute -left-[40px] -top-[11px] h-3.5 w-3.5 opacity-0 ${TOMATO}`}
              />
            </div>
            <SceneActor
              character={winner}
              className="bottom-[88px] left-1"
              anim="smug"
              pose="origin-bottom"
              size="h-14 w-14"
            />
          </div>

          {THROWS.map((item, index) => (
            <span
              key={item.at}
              data-anim={`tomato-${index}`}
              className={`absolute bottom-[90px] left-[248px] z-40 h-3.5 w-3.5 opacity-0 ${TOMATO}`}
            >
              <span className="absolute -top-0.5 left-1/2 h-1 w-2 -translate-x-1/2 rounded-sm bg-green-600" />
            </span>
          ))}
        </div>
      </SceneFrame>
    </div>
  );
}
