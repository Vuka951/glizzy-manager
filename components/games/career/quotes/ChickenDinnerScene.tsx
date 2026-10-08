'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
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

const LINE_MS = 1400;
// Matches the lineStartMs of this scene's definition: the platter is served
// and the cloche is off before the line
const LINE_START_MS = 1900;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The plate-slide, cymbal-crash, stomach-growl and gulp cues of the
// definition land on these
const SERVE_MS = 1000;
const SERVED_MS = SERVE_MS + 340;
const LIFT_MS = 1500;
const LIFTED_MS = LIFT_MS + 300;
const GROWL_MS = 2800;
const BITE_MS = 3800;

const PLATTER_HELD = 'translate(16px, -50px) rotate(-4deg)';
const PLATTER_SERVED = 'translate(0, 0) rotate(0deg)';

const CLOCHE_ON = 'translate(0, 0) rotate(0deg)';
const CLOCHE_OFF = 'translate(10px, -52px) rotate(-16deg)';

const HAND_REST = 'translate(0, 0)';
const HAND_KNOB = 'translate(-52px, -42px)';
const HAND_OFF = 'translate(-42px, -94px)';

const LEAD_TALL = 'translate(0, 0) rotate(0deg)';
const LEAD_BOW = 'translate(-6px, 4px) rotate(-12deg)';
const LEAD_TADA = 'translate(0, -2px) rotate(5deg)';
const LEAD_GLOAT = 'translate(1px, -4px) rotate(10deg)';

const RUNNER_SULK = 'translate(-2px, 3px) rotate(-9deg)';
const RUNNER_LOOK = 'translate(2px, 0) rotate(6deg)';
const RUNNER_RECOIL = 'translate(-7px, -3px) rotate(-14deg)';
const RUNNER_TEMPTED = 'translate(2px, 1px) rotate(6deg)';
const RUNNER_CHOMP = 'translate(13px, 3px) rotate(18deg)';
const RUNNER_CHEW = 'translate(2px, 4px) rotate(4deg)';

const RUMBLE_STEPS = [1, 2, 3, 4, 5, 6, 7];

const appearAt = (ms: number, from: number, to: number) =>
  sceneTimeline(TOTAL_MS, [
    [0, { opacity: from }],
    [ms, { opacity: from }],
    [ms + 20, { opacity: to }],
    [TOTAL_MS, { opacity: to }],
  ]);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  serve: sceneTimeline(TOTAL_MS, [
    [0, { transform: PLATTER_HELD }],
    [SERVE_MS, { transform: PLATTER_HELD }],
    [SERVE_MS + 240, { transform: 'translate(-2px, 4px) rotate(2deg)' }],
    [SERVED_MS, { transform: PLATTER_SERVED }],
    [BITE_MS, { transform: PLATTER_SERVED }],
    [BITE_MS + 70, { transform: 'translate(-3px, 2px) rotate(-4deg)' }],
    [BITE_MS + 240, { transform: PLATTER_SERVED }],
    [TOTAL_MS, { transform: PLATTER_SERVED }],
  ]),
  cloche: sceneTimeline(TOTAL_MS, [
    [0, { transform: CLOCHE_ON }],
    [LIFT_MS, { transform: CLOCHE_ON }],
    [LIFTED_MS, { transform: CLOCHE_OFF }],
    [TOTAL_MS, { transform: CLOCHE_OFF }],
  ]),
  'lift-hand': sceneTimeline(TOTAL_MS, [
    [0, { transform: HAND_REST }],
    [SERVED_MS, { transform: HAND_REST }],
    [LIFT_MS, { transform: HAND_KNOB }],
    [LIFTED_MS, { transform: HAND_OFF }],
    [TOTAL_MS, { transform: HAND_OFF }],
  ]),
  'lead-head': sceneTimeline(TOTAL_MS, [
    [0, { transform: LEAD_TALL }],
    [SERVE_MS, { transform: LEAD_TALL }],
    [SERVED_MS, { transform: LEAD_BOW }],
    [LIFT_MS, { transform: LEAD_BOW }],
    [LIFTED_MS, { transform: LEAD_TADA }],
    [BITE_MS + 200, { transform: LEAD_TADA }],
    [BITE_MS + 450, { transform: LEAD_GLOAT }],
    [TOTAL_MS, { transform: LEAD_GLOAT }],
  ]),
  'runner-head': sceneTimeline(TOTAL_MS, [
    [0, { transform: RUNNER_SULK }],
    [SERVE_MS + 200, { transform: RUNNER_SULK }],
    [SERVED_MS + 100, { transform: RUNNER_LOOK }],
    [LIFT_MS + 120, { transform: RUNNER_LOOK }],
    [LIFTED_MS + 60, { transform: RUNNER_RECOIL }],
    [GROWL_MS + 250, { transform: RUNNER_RECOIL }],
    [GROWL_MS + 650, { transform: RUNNER_TEMPTED }],
    [BITE_MS - 160, { transform: RUNNER_TEMPTED }],
    [BITE_MS, { transform: RUNNER_CHOMP }],
    [BITE_MS + 140, { transform: RUNNER_CHOMP }],
    [BITE_MS + 420, { transform: RUNNER_CHEW }],
    [TOTAL_MS, { transform: RUNNER_CHEW }],
  ]),
  'belly-rumble': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateX(0)' }],
    [GROWL_MS, { transform: 'translateX(0)' }],
    ...RUMBLE_STEPS.map((step): [number, Keyframe] => [
      GROWL_MS + step * 90,
      { transform: `translateX(${step % 2 ? -2 : 2}px)` },
    ]),
    [GROWL_MS + 720, { transform: 'translateX(0)' }],
    [TOTAL_MS, { transform: 'translateX(0)' }],
  ]),
  'drumstick': appearAt(BITE_MS + 40, 1, 0),
  'bitten-leg': appearAt(BITE_MS + 40, 0, 1),
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
    options: { duration: 2600, iterations: Infinity, easing: 'linear' },
  },
};

const CONFETTI = [
  { cls: 'left-[24%] bg-amber-300', delay: 0 },
  { cls: 'left-[36%] bg-red-400', delay: -900 },
  { cls: 'left-[50%] bg-sky-300', delay: -1700 },
  { cls: 'left-[64%] bg-amber-300', delay: -500 },
  { cls: 'left-[76%] bg-cyan-200', delay: -1300 },
];

const CROWD = Array.from({ length: 14 }, (_, index) => index);

// The podium is laid out in pixels so the platter's reach from the top step
// to the second one stays the same at every stage width
const PODIUM = [
  { place: 2, cls: 'left-0 h-[34px] w-[104px]' },
  { place: 1, cls: 'left-[104px] h-[54px] w-[120px]' },
  { place: 3, cls: 'left-[224px] h-[22px] w-[80px]' },
];

const STEAM = [
  { cls: 'left-[16px]', delay: LIFT_MS + 150 },
  { cls: 'left-[27px]', delay: LIFT_MS + 750 },
  { cls: 'left-[38px]', delay: LIFT_MS + 1350 },
];

const RUMBLE_RING_MS = 700;
const RUMBLE_RINGS = [GROWL_MS, GROWL_MS + 300];

export default function ChickenDinnerScene({
  speaker,
  other,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const runnerUp = characterBySlug(other);
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
        <div className="absolute left-[26%] top-0 h-[84%] w-[48%] bg-gradient-to-b from-amber-200/20 to-amber-200/0 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />
        {CONFETTI.map((piece) => (
          <span
            key={piece.cls}
            data-anim="confetti"
            data-anim-delay={piece.delay}
            className={`absolute top-0 z-10 h-2 w-1 rounded-[1px] ${piece.cls}`}
          />
        ))}

        <div className="absolute bottom-[18%] left-1/2 h-[170px] w-[304px] -translate-x-1/2">
          {PODIUM.map((step) => (
            <div
              key={step.place}
              className={`absolute bottom-0 z-10 flex items-start justify-center rounded-t-sm border-t-4 border-slate-400 bg-gradient-to-b from-slate-600 to-slate-700 pt-1 shadow-lg ${step.cls}`}
            >
              <span className="text-sm font-black text-slate-300">
                {step.place}
              </span>
            </div>
          ))}
          <span className="absolute bottom-[54px] left-[190px] z-10 text-amber-300">
            <Icon
              name="trophy"
              className="h-7 w-7 drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]"
            />
          </span>

          <div className="absolute bottom-[34px] left-[4px] z-20 h-[84px] w-12">
            <span
              data-anim="belly-rumble"
              className="absolute bottom-0 left-1 h-9 w-10 rounded-t-2xl bg-gradient-to-b from-slate-500 to-slate-600 saturate-50"
            />
            {RUMBLE_RINGS.map((delay) => (
              <span
                key={delay}
                data-anim="ring-out"
                data-anim-delay={delay}
                data-anim-duration={RUMBLE_RING_MS}
                className="absolute bottom-[6px] left-[14px] z-30 h-5 w-5 rounded-full border-2 border-amber-200/80 opacity-0"
              />
            ))}
            <SceneActor
              character={runnerUp}
              className="bottom-[32px] left-0"
              anim="runner-head"
              pose="origin-bottom saturate-50 brightness-90"
              size="h-12 w-12"
            >
              <span
                data-anim="bitten-leg"
                className="absolute left-[26px] top-[25px] z-10 h-[10px] w-[24px] -rotate-[14deg] opacity-0"
              >
                <span className="absolute left-[11px] top-[3.5px] h-[3px] w-[10px] rounded-full bg-stone-100" />
                <span className="absolute right-0 top-[2px] h-[6px] w-[4px] rounded-full bg-stone-50" />
                <span className="absolute left-0 top-0 h-[10px] w-[13px] rounded-full bg-gradient-to-b from-amber-500 to-amber-700 ring-1 ring-amber-950/50" />
              </span>
            </SceneActor>
          </div>

          <div className="absolute bottom-[54px] left-[128px] z-20 h-[84px] w-12">
            <span className="absolute bottom-0 left-1 h-9 w-10 overflow-hidden rounded-t-2xl bg-gradient-to-b from-stone-50 to-stone-300">
              <span className="absolute left-1/2 top-[10px] h-1 w-1 -translate-x-1/2 rounded-full bg-slate-500" />
              <span className="absolute left-1/2 top-[18px] h-1 w-1 -translate-x-1/2 rounded-full bg-slate-500" />
              <span className="absolute left-1/2 top-[26px] h-1 w-1 -translate-x-1/2 rounded-full bg-slate-500" />
            </span>
            <SceneActor
              character={lead}
              className="bottom-[32px] left-0"
              anim="lead-head talk"
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
            <span className="absolute bottom-[25px] left-[16px] z-30 h-[8px] w-[16px] bg-slate-950 [clip-path:polygon(0_0,50%_35%,100%_0,100%_100%,50%_65%,0_100%)]" />
          </div>

          <div
            data-anim="serve"
            className="absolute bottom-[62px] left-[50px] z-30 h-[60px] w-[56px] origin-bottom-right"
          >
            {STEAM.map((wisp) => (
              <span
                key={wisp.cls}
                data-anim="float-up"
                data-anim-delay={wisp.delay}
                className={`absolute bottom-[26px] h-4 w-2 rounded-full bg-slate-50/80 opacity-0 blur-[1px] ${wisp.cls}`}
              />
            ))}

            <span className="absolute bottom-0 left-[-3px] h-[7px] w-[62px] rounded-[50%] bg-gradient-to-b from-slate-50 to-slate-400 ring-1 ring-slate-500" />
            <span className="absolute bottom-[4px] left-[2px] h-[5px] w-[10px] -rotate-12 rounded-full bg-emerald-500" />
            <span className="absolute bottom-[3px] left-[8px] h-[5px] w-[9px] rotate-12 rounded-full bg-emerald-600" />
            <span className="absolute bottom-[3px] right-[2px] h-[8px] w-[8px] rounded-full bg-orange-400 ring-1 ring-orange-200" />

            <span className="absolute bottom-[14px] left-[16px] h-[17px] w-[9px] rotate-[10deg]">
              <span className="absolute left-[3px] top-[2px] h-[7px] w-[3px] rounded-full bg-stone-200" />
              <span className="absolute left-[1.5px] top-0 h-[4px] w-[6px] rounded-full bg-stone-100" />
              <span className="absolute bottom-0 left-0 h-[11px] w-[9px] rounded-full bg-gradient-to-b from-amber-500 to-amber-700 ring-1 ring-amber-950/50" />
            </span>
            <span className="absolute bottom-[4px] left-[10px] h-[21px] w-[36px] rounded-[50%] bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 ring-1 ring-amber-950/50">
              <span className="absolute left-[10px] top-[3px] h-[4px] w-[14px] -rotate-6 rounded-full bg-amber-200/70" />
              <span className="absolute bottom-[4px] left-[12px] h-[8px] w-[14px] rounded-[50%] border-b-2 border-amber-900/70" />
              <span className="absolute bottom-[6px] right-[3px] h-[8px] w-[13px] -rotate-[18deg] rounded-[50%] bg-amber-700 ring-1 ring-amber-950/40" />
            </span>
            <span
              data-anim="drumstick"
              className="absolute bottom-[12px] left-[5px] h-[18px] w-[10px] -rotate-[26deg]"
            >
              <span className="absolute left-[3.5px] top-[2px] h-[7px] w-[3px] rounded-full bg-stone-100" />
              <span className="absolute left-[2px] top-0 h-[4px] w-[6px] rounded-full bg-stone-50" />
              <span className="absolute bottom-0 left-0 h-[13px] w-[10px] rounded-full bg-gradient-to-b from-amber-500 to-amber-700 ring-1 ring-amber-950/50" />
            </span>

            <span
              data-anim="glint"
              data-anim-delay={LIFTED_MS}
              className="absolute bottom-[20px] left-[18px] h-4 w-4 bg-amber-100 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
            />
            <span
              data-anim="burst"
              data-anim-delay={BITE_MS}
              className="absolute bottom-[22px] left-[-4px] z-10 h-5 w-5 bg-amber-100 opacity-0 [clip-path:polygon(50%_0,58%_38%,95%_20%,64%_48%,100%_60%,58%_62%,60%_100%,44%_64%,10%_85%,38%_52%,0_30%,42%_40%)]"
            />

            <span
              data-anim="cloche"
              className="absolute bottom-[4px] left-[-1px] z-10 h-[40px] w-[58px] origin-top"
            >
              <span className="absolute left-1/2 top-[-5px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-slate-200 ring-1 ring-slate-500" />
              <span className="absolute inset-0 rounded-t-full bg-gradient-to-br from-slate-50 via-slate-300 to-slate-500 ring-1 ring-slate-500">
                <span className="absolute left-[9px] top-[6px] h-[12px] w-[4px] rotate-[24deg] rounded-full bg-white/80" />
              </span>
              <span className="absolute inset-x-[-2px] bottom-0 h-[3px] rounded-full bg-slate-400 ring-1 ring-slate-500" />
            </span>

            <span className="absolute bottom-[-9px] left-[40px] h-3 w-3 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
          </div>

          <span
            data-anim="lift-hand"
            className="absolute bottom-[60px] left-[124px] z-40 h-3 w-3 rounded-full bg-orange-200 ring-1 ring-slate-950/40"
          />
        </div>
      </SceneFrame>
    </div>
  );
}
