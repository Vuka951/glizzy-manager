'use client';

import { useRef } from 'react';
import WoodenSpoon from '@/components/games/career/quotes/WoodenSpoon';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
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
import { CUP_BRACKET_SIZE } from '@/lib/utils/tournamentSim';

const LINE_MS = 1800;
// Matches the lineStartMs of this scene's definition: the ribbon is pinned
// on and the spoon is over the head before the line
const LINE_START_MS = 3200;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The stamp-thud, sting-fail, discover-ding and hit-dust-hands cues of the
// definition land on the pin, the spoon coming out, the hoist and each clap
const PIN_REACH_MS = 1000;
const PIN_MS = 1250;
const SPOON_OUT_MS = 1500;
const OFFERED_MS = 1900;
const HANDOVER_MS = 2300;
const HOIST_MS = 2700;
const HOISTED_MS = 3050;
const YAWN_MS = 2750;
const CONFETTI_MS = 2600;
const CONFETTI_LANDED_MS = CONFETTI_MS + 3000;
const CLAP_MS = 3600;
const CLAP_BEAT_MS = 900;
// A clap meets in the middle of its beat
const CLAP_DELAY_MS = CLAP_MS - CLAP_BEAT_MS / 2;

const ARM_REST = 'rotate(84deg)';
const ARM_PIN = 'rotate(-5deg)';
const ARM_OFFER = 'rotate(-14deg)';

// The spoon leaves the official's hand in the pose the character takes it in
const SPOON_OFFERED = 'translate(-19px, 3px) rotate(-14deg)';
const SPOON_CHEST = 'translate(0, 0) rotate(-8deg)';
const SPOON_DIP = 'translate(0, 5px) rotate(-4deg)';
const SPOON_OVER = 'translate(0, -55px) rotate(4deg)';
const SPOON_UP = 'translate(0, -50px) rotate(0deg)';

const HEAD_WAIT = 'translate(0, 2px) rotate(-5deg)';
const HEAD_FLINCH = 'translate(4px, 0) rotate(7deg)';
const HEAD_LOOK = 'translate(-2px, 1px) rotate(-9deg)';
const HEAD_PROUD = 'translate(0, -3px) rotate(6deg)';

const YAWN_SHUT = 'scale(1, 1)';
const YAWN_OPEN = 'scale(0.9, 4)';
const OFFICIAL_LEVEL = 'translate(0, 0) rotate(0deg)';
const OFFICIAL_BACK = 'translate(0, -1px) rotate(-12deg)';

// The one piece comes down from above the frame and lies flat on the floor
// beside the crate
const CONFETTI_ABOVE = 'translate(0, -70px) rotate(0deg)';
const CONFETTI_LANDED = 'translate(14px, 163px) rotate(630deg)';

const clapHand = (side: 1 | -1): SceneAnimationSpec => ({
  keyframes: [
    { transform: 'translateX(0)', easing: 'ease-in' },
    { transform: `translateX(${side * 3.5}px)`, offset: 0.5 },
    { transform: `translateX(${side * 3.5}px)`, offset: 0.58 },
    { transform: 'translateX(0)' },
  ],
  options: { duration: CLAP_BEAT_MS, iterations: Infinity, easing: 'ease-out' },
});

const CUSTOM: Record<string, SceneAnimationSpec> = {
  arm: sceneTimeline(TOTAL_MS, [
    [0, { transform: ARM_REST }],
    [PIN_REACH_MS, { transform: ARM_REST }],
    [PIN_MS, { transform: ARM_PIN }],
    [PIN_MS + 80, { transform: ARM_PIN }],
    [PIN_MS + 270, { transform: ARM_REST }],
    [SPOON_OUT_MS + 60, { transform: ARM_REST }],
    [OFFERED_MS, { transform: ARM_OFFER }],
    [HANDOVER_MS + 50, { transform: ARM_OFFER }],
    [HANDOVER_MS + 350, { transform: ARM_REST }],
    [TOTAL_MS, { transform: ARM_REST }],
  ]),
  offered: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scale(0.2)' }],
    [SPOON_OUT_MS + 200, { opacity: 0, transform: 'scale(0.2)' }],
    [OFFERED_MS - 60, { opacity: 1, transform: 'scale(1.15)' }],
    [OFFERED_MS + 40, { opacity: 1, transform: 'scale(1)' }],
    [HANDOVER_MS, { opacity: 1, transform: 'scale(1)' }],
    [HANDOVER_MS + 20, { opacity: 0, transform: 'scale(1)' }],
    [TOTAL_MS, { opacity: 0, transform: 'scale(1)' }],
  ]),
  hoist: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: SPOON_OFFERED }],
    [HANDOVER_MS, { opacity: 0, transform: SPOON_OFFERED }],
    [HANDOVER_MS + 20, { opacity: 1, transform: SPOON_OFFERED }],
    [HANDOVER_MS + 250, { opacity: 1, transform: SPOON_CHEST }],
    [HOIST_MS, { opacity: 1, transform: SPOON_CHEST }],
    [HOIST_MS + 120, { opacity: 1, transform: SPOON_DIP }],
    [HOISTED_MS - 50, { opacity: 1, transform: SPOON_OVER }],
    [HOISTED_MS + 100, { opacity: 1, transform: SPOON_UP }],
    [TOTAL_MS, { opacity: 1, transform: SPOON_UP }],
  ]),
  pump: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-3px)' },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 620, iterations: Infinity, easing: 'ease-in-out' },
  },
  halo: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [HOISTED_MS - 50, { opacity: 0 }],
    [HOISTED_MS + 150, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  glint: {
    keyframes: [
      { transform: 'scale(0.2) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1.2) rotate(45deg)', opacity: 1, offset: 0.35 },
      { transform: 'scale(0.2) rotate(90deg)', opacity: 0 },
    ],
    options: { duration: 700, easing: 'ease-out', fill: 'both' },
  },
  head: sceneTimeline(TOTAL_MS, [
    [0, { transform: HEAD_WAIT }],
    [PIN_MS - 40, { transform: HEAD_WAIT }],
    [PIN_MS + 60, { transform: HEAD_FLINCH }],
    [PIN_MS + 300, { transform: HEAD_WAIT }],
    [SPOON_OUT_MS + 200, { transform: HEAD_WAIT }],
    [OFFERED_MS, { transform: HEAD_LOOK }],
    [HOIST_MS + 120, { transform: HEAD_LOOK }],
    [HOISTED_MS, { transform: HEAD_PROUD }],
    [TOTAL_MS, { transform: HEAD_PROUD }],
  ]),
  jolt: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateX(0)' }],
    [PIN_MS - 40, { transform: 'translateX(0)' }],
    [PIN_MS + 60, { transform: 'translateX(3px)' }],
    [PIN_MS + 300, { transform: 'translateX(0)' }],
    [TOTAL_MS, { transform: 'translateX(0)' }],
  ]),
  ribbon: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scale(0.3)' }],
    [PIN_MS, { opacity: 0, transform: 'scale(0.3)' }],
    [PIN_MS + 60, { opacity: 1, transform: 'scale(1.5)' }],
    [PIN_MS + 220, { opacity: 1, transform: 'scale(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scale(1)' }],
  ]),
  'yawn-head': sceneTimeline(TOTAL_MS, [
    [0, { transform: OFFICIAL_LEVEL }],
    [YAWN_MS, { transform: OFFICIAL_LEVEL }],
    [YAWN_MS + 300, { transform: OFFICIAL_BACK }],
    [YAWN_MS + 900, { transform: OFFICIAL_BACK }],
    [YAWN_MS + 1200, { transform: OFFICIAL_LEVEL }],
    [TOTAL_MS, { transform: OFFICIAL_LEVEL }],
  ]),
  'yawn-mouth': sceneTimeline(TOTAL_MS, [
    [0, { transform: YAWN_SHUT }],
    [YAWN_MS, { transform: YAWN_SHUT }],
    [YAWN_MS + 300, { transform: YAWN_OPEN }],
    [YAWN_MS + 900, { transform: YAWN_OPEN }],
    [YAWN_MS + 1200, { transform: YAWN_SHUT }],
    [TOTAL_MS, { transform: YAWN_SHUT }],
  ]),
  'yawn-eyes': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 1 }],
    [YAWN_MS + 100, { opacity: 1 }],
    [YAWN_MS + 250, { opacity: 0 }],
    [YAWN_MS + 950, { opacity: 0 }],
    [YAWN_MS + 1100, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'clap-left': clapHand(1),
  'clap-right': clapHand(-1),
  'clap-flash': {
    keyframes: [
      { opacity: 0 },
      { opacity: 0, offset: 0.48 },
      { opacity: 1, offset: 0.52 },
      { opacity: 0, offset: 0.8 },
      { opacity: 0 },
    ],
    options: { duration: CLAP_BEAT_MS, iterations: Infinity, easing: 'linear' },
  },
  'lone-confetti': sceneTimeline(TOTAL_MS, [
    [0, { transform: CONFETTI_ABOVE }],
    [CONFETTI_MS, { transform: CONFETTI_ABOVE }],
    [CONFETTI_MS + 600, { transform: 'translate(-8px, -10px) rotate(110deg)' }],
    [CONFETTI_MS + 1200, { transform: 'translate(6px, 40px) rotate(220deg)' }],
    [CONFETTI_MS + 1800, { transform: 'translate(-6px, 85px) rotate(330deg)' }],
    [CONFETTI_MS + 2400, { transform: 'translate(8px, 128px) rotate(440deg)' }],
    [CONFETTI_LANDED_MS, { transform: CONFETTI_LANDED }],
    [TOTAL_MS, { transform: CONFETTI_LANDED }],
  ]),
};

// The winners' podium next door, laid out in pixels like everything else in
// the group so the handover reaches the same at every stage width
const PODIUM = [
  { place: 2, cls: 'left-0 h-[30px] w-[48px]' },
  { place: 1, cls: 'left-[48px] h-[46px] w-[54px]' },
  { place: 3, cls: 'left-[102px] h-[20px] w-[48px]' },
];

// What the real ceremony left behind
const LITTER = [
  'bottom-[30px] left-[14px] rotate-12 bg-amber-300',
  'bottom-[46px] left-[62px] -rotate-45 bg-red-400',
  'bottom-[46px] left-[88px] rotate-90 bg-sky-300',
  'bottom-[20px] left-[126px] rotate-45 bg-cyan-200',
  'bottom-0 left-[30px] rotate-90 bg-red-400',
  'bottom-0 left-[158px] -rotate-12 bg-amber-300',
];

const SEAT_ROWS = [
  'bottom-[54px] left-1/2',
  'bottom-[72px] left-[calc(50%+13px)]',
  'bottom-[90px] left-1/2',
];
const SEATS = Array.from({ length: 40 }, (_, index) => index);

const CLAP_TICKS = [
  'left-0 top-[2px] -rotate-45',
  'left-[5px] top-0',
  'left-[10px] top-[2px] rotate-45',
];

export default function WoodenSpoonScene({ speaker }: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const last = characterBySlug(speaker);
  useSceneAnimation(root, CUSTOM, [speaker]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900"
        floor="bg-slate-800"
      >
        <div className="absolute inset-x-0 bottom-[18%] h-[170px]">
          {SEAT_ROWS.map((cls) => (
            <div
              key={cls}
              className={`absolute flex -translate-x-1/2 gap-[6px] ${cls}`}
            >
              {SEATS.map((index) => (
                <span
                  key={index}
                  className="h-[14px] w-[20px] rounded-t-[5px] bg-slate-800/80"
                />
              ))}
            </div>
          ))}
          <span className="absolute inset-x-0 bottom-[50px] h-1 bg-slate-950/80" />

          <div className="absolute bottom-0 left-1/2 h-full w-[304px] -translate-x-1/2">
            <div className="absolute bottom-0 left-[176px] h-[230px] w-[132px] bg-gradient-to-b from-amber-100/20 via-amber-100/10 to-amber-100/5 [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)]" />
            <span className="absolute bottom-[-7px] left-[178px] h-[14px] w-[128px] rounded-[50%] bg-amber-100/10" />

            <div className="absolute bottom-[72px] left-[114px] h-[30px] w-[24px]">
              <span className="absolute bottom-[13px] left-[5px] h-[14px] w-[14px] rounded-full bg-orange-200/60" />
              <span className="absolute bottom-0 left-0 h-[15px] w-[24px] rounded-t-[9px] bg-slate-600" />
              <span
                data-anim="clap-left"
                data-anim-delay={CLAP_DELAY_MS}
                className="absolute bottom-[5px] left-[18px] h-[6px] w-[6px] rounded-full bg-orange-200"
              />
              <span
                data-anim="clap-right"
                data-anim-delay={CLAP_DELAY_MS}
                className="absolute bottom-[5px] left-[31px] h-[6px] w-[6px] rounded-full bg-orange-200"
              />
              <span
                data-anim="clap-flash"
                data-anim-delay={CLAP_DELAY_MS}
                className="absolute bottom-[13px] left-[21px] h-[7px] w-[12px] opacity-0"
              >
                {CLAP_TICKS.map((cls) => (
                  <span
                    key={cls}
                    className={`absolute h-[5px] w-[2px] rounded-full bg-amber-100 ${cls}`}
                  />
                ))}
              </span>
            </div>

            {PODIUM.map((step) => (
              <div
                key={step.place}
                className={`absolute bottom-0 z-10 flex items-start justify-center rounded-t-sm border-t-4 border-slate-600 bg-gradient-to-b from-slate-700 to-slate-800 pt-0.5 shadow-lg ${step.cls}`}
              >
                <span className="text-xs font-black text-slate-500">
                  {step.place}
                </span>
              </div>
            ))}
            {LITTER.map((cls) => (
              <span
                key={cls}
                className={`absolute z-10 h-[6px] w-[3px] rounded-[1px] opacity-50 ${cls}`}
              />
            ))}

            <div className="absolute bottom-0 left-[212px] z-10 h-[26px] w-[60px] rounded-[2px] bg-gradient-to-b from-amber-700 to-amber-800 shadow-lg ring-1 ring-amber-950/70">
              <span className="absolute inset-x-0 top-[8px] h-px bg-amber-950/50" />
              <span className="absolute inset-x-0 top-[17px] h-px bg-amber-950/50" />
              <span className="absolute inset-y-0 left-0 w-[5px] bg-amber-900/80" />
              <span className="absolute inset-y-0 right-0 w-[5px] bg-amber-900/80" />
              <span className="absolute inset-0 flex items-center justify-center gap-1.5">
                <span className="text-[15px] font-black leading-none text-amber-950/80">
                  {CUP_BRACKET_SIZE}
                </span>
                <span className="h-[11px] w-[8px] bg-amber-950/60 [clip-path:polygon(32%_0,68%_0,68%_52%,100%_52%,50%_100%,0_52%,32%_52%)]" />
              </span>
            </div>

            <div className="absolute bottom-[26px] left-[218px] z-20 h-[84px] w-12">
              <span
                data-anim="jolt"
                className="absolute bottom-0 left-1 h-9 w-10 rounded-t-2xl bg-gradient-to-b from-slate-500 to-slate-600"
              >
                <span
                  data-anim="ribbon"
                  className="absolute left-[4px] top-[10px] h-[16px] w-[10px] opacity-0"
                >
                  <span className="absolute bottom-0 left-[1px] h-[8px] w-[4px] -rotate-12 bg-sky-500 [clip-path:polygon(0_0,100%_0,100%_100%,50%_70%,0_100%)]" />
                  <span className="absolute bottom-0 right-[1px] h-[8px] w-[4px] rotate-12 bg-sky-500 [clip-path:polygon(0_0,100%_0,100%_100%,50%_70%,0_100%)]" />
                  <span className="absolute left-0 top-0 h-[10px] w-[10px] rounded-full bg-sky-300 ring-1 ring-sky-600">
                    <span className="absolute inset-[3px] rounded-full bg-sky-100" />
                  </span>
                </span>
              </span>
              <SceneActor
                character={last}
                className="bottom-[30px] left-0"
                anim="head talk"
                animDelay={`0 ${LINE_START_MS}`}
                animIterations={`1 ${TALK_ITERATIONS}`}
                pose="origin-bottom"
                size="h-12 w-12"
              >
                <span
                  data-anim="spotlight"
                  data-anim-delay={LINE_START_MS}
                  data-anim-duration={LINE_MS + QUOTE_SCENE_TAIL_MS}
                  className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
                />
              </SceneActor>
            </div>

            <span
              data-anim="halo"
              className="absolute bottom-[118px] left-[224px] z-30 h-9 w-9 rounded-full bg-amber-200/50 opacity-0 blur-md"
            />
            <div className="absolute bottom-[50px] left-[242px] z-40 h-0 w-0">
              <div
                data-anim="hoist pump"
                data-anim-delay={`0 ${LINE_START_MS}`}
                className="absolute bottom-0 left-[-8px] h-[46px] w-[16px] origin-bottom opacity-0"
              >
                <WoodenSpoon />
                <span className="absolute bottom-[-2px] left-[-4px] h-[10px] w-[10px] rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                <span className="absolute bottom-[5px] right-[-4px] h-[10px] w-[10px] rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              </div>
            </div>
            <span
              data-anim="glint"
              data-anim-delay={HOISTED_MS}
              className="absolute bottom-[128px] left-[234px] z-40 h-4 w-4 bg-amber-50 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
            />

            <div className="absolute bottom-0 left-[172px] z-30 h-[76px] w-[36px]">
              <span className="absolute bottom-0 left-[8px] h-[16px] w-[9px] rounded-b-sm bg-slate-950" />
              <span className="absolute bottom-0 left-[19px] h-[16px] w-[9px] rounded-b-sm bg-slate-950" />
              <span className="absolute bottom-[14px] left-[4px] h-[32px] w-[28px] overflow-hidden rounded-t-xl bg-gradient-to-b from-slate-600 to-slate-700 ring-1 ring-slate-950/50">
                <span className="absolute left-1/2 top-0 h-[15px] w-[10px] -translate-x-1/2 bg-slate-100 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                <span className="absolute left-1/2 top-[1px] h-[12px] w-[3px] -translate-x-1/2 rounded-b-full bg-red-600" />
              </span>
              <span className="absolute bottom-[20px] left-[-5px] h-[17px] w-[13px] -rotate-12 rounded-[2px] bg-amber-100 ring-1 ring-slate-950/50">
                <span className="absolute left-1/2 top-[-2px] h-[3px] w-[6px] -translate-x-1/2 rounded-[1px] bg-slate-400" />
                <span className="absolute inset-x-[2px] top-[5px] h-px bg-slate-500" />
                <span className="absolute inset-x-[2px] top-[9px] h-px bg-slate-500" />
                <span className="absolute inset-x-[2px] top-[13px] h-px bg-slate-500" />
              </span>
              <span
                data-anim="yawn-head"
                className="absolute bottom-[44px] left-[3px] h-[30px] w-[30px] origin-bottom rounded-full bg-orange-200 ring-1 ring-slate-950/50"
              >
                <span className="absolute inset-x-0 top-0 h-[9px] rounded-t-full bg-slate-400" />
                <span className="absolute left-[4px] top-[13px] h-[2px] w-[8px] bg-slate-800" />
                <span className="absolute left-[15px] top-[13px] h-[2px] w-[8px] bg-slate-800" />
                <span data-anim="yawn-eyes" className="absolute inset-0">
                  <span className="absolute left-[5px] top-[15px] h-[3px] w-[4px] rounded-b-full bg-slate-950" />
                  <span className="absolute left-[16px] top-[15px] h-[3px] w-[4px] rounded-b-full bg-slate-950" />
                </span>
                <span
                  data-anim="yawn-mouth"
                  className="absolute left-[10px] top-[22px] h-[2px] w-[8px] rounded-full bg-slate-950"
                />
              </span>
              <span
                data-anim="arm"
                className="absolute bottom-[38px] left-[24px] h-[7px] w-[30px] origin-[3px_50%] rounded-full bg-slate-600 ring-1 ring-slate-950/50 [transform:rotate(84deg)]"
              >
                <span className="absolute left-[27.5px] top-1/2 h-0 w-0">
                  <span
                    data-anim="offered"
                    className="absolute bottom-0 left-[-8px] h-[46px] w-[16px] origin-bottom opacity-0"
                  >
                    <WoodenSpoon />
                  </span>
                </span>
                <span className="absolute right-[-2px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              </span>
            </div>

            <span
              data-anim="lone-confetti"
              className="absolute left-[268px] top-0 z-40 h-[9px] w-[5px] rounded-[1px] bg-amber-300 [transform:translate(0,-70px)]"
            />
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
