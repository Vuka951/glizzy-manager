'use client';

import { useRef } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
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

const LINE_MS = 1700;
// Matches the lineStartMs of this scene's definition: the replay runs, the
// magnifier finds the crumb and the finger goes up before the line
const LINE_START_MS = 3400;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The drum-roll, throw-whoosh, discover-ding and cymbal-crash cues of the
// definition land on these beats
const RUN_MS = 950;
const RUN_END_MS = 2300;
const LENS_MS = 2400;
const CRUMB_MS = 2850;
const RAISE_MS = 3050;
const FINGER_MS = 3350;

const RUN_START = 'translateX(-58px)';
const AT_LINE = 'translateX(0)';
const ARM_DOWN = 'translateY(100%)';
const ARM_UP = 'translateY(0)';

// The loser leads the replay until the last stretch, so the two tips meet
// the line together and only the magnifier can split them
const CUSTOM: Record<string, SceneAnimationSpec> = {
  'run-winner': sceneTimeline(
    TOTAL_MS,
    [
      [0, { transform: RUN_START }],
      [RUN_MS, { transform: RUN_START }],
      [RUN_MS + 700, { transform: 'translateX(-26px)' }],
      [RUN_END_MS, { transform: AT_LINE }],
      [TOTAL_MS, { transform: AT_LINE }],
    ],
    'linear',
  ),
  'run-loser': sceneTimeline(
    TOTAL_MS,
    [
      [0, { transform: RUN_START }],
      [RUN_MS, { transform: RUN_START }],
      [RUN_MS + 700, { transform: 'translateX(-12px)' }],
      [RUN_END_MS, { transform: AT_LINE }],
      [TOTAL_MS, { transform: AT_LINE }],
    ],
    'linear',
  ),
  scrub: sceneTimeline(
    TOTAL_MS,
    [
      [0, { transform: 'scaleX(0)' }],
      [RUN_MS, { transform: 'scaleX(0)' }],
      [RUN_END_MS, { transform: 'scaleX(1)' }],
      [TOTAL_MS, { transform: 'scaleX(1)' }],
    ],
    'linear',
  ),
  'crumb-pulse': {
    keyframes: [
      { transform: 'rotate(12deg) scale(1)' },
      { transform: 'rotate(12deg) scale(1.6)', offset: 0.4 },
      { transform: 'rotate(12deg) scale(1)' },
    ],
    options: { duration: 450, iterations: 2, easing: 'ease-in-out' },
  },
  'arm-raise': sceneTimeline(TOTAL_MS, [
    [0, { transform: ARM_DOWN }],
    [RAISE_MS, { transform: ARM_DOWN }],
    [FINGER_MS - 80, { transform: 'translateY(8%)' }],
    [FINGER_MS, { transform: ARM_UP }],
    [TOTAL_MS, { transform: ARM_UP }],
  ]),
  tremble: {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-4deg)', offset: 0.3 },
      { transform: 'rotate(3deg)', offset: 0.7 },
      { transform: 'rotate(0deg)' },
    ],
    options: { duration: 520, iterations: 6, easing: 'ease-in-out' },
  },
  finger: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scaleY(0)' }],
    [FINGER_MS, { transform: 'scaleY(0)' }],
    [FINGER_MS + 110, { transform: 'scaleY(1.2)' }],
    [FINGER_MS + 200, { transform: 'scaleY(1)' }],
    [TOTAL_MS, { transform: 'scaleY(1)' }],
  ]),
  glint: {
    keyframes: [
      { transform: 'scale(0.2) rotate(0deg)', opacity: 0 },
      { transform: 'scale(1.2) rotate(45deg)', opacity: 1, offset: 0.35 },
      { transform: 'scale(0.2) rotate(90deg)', opacity: 0 },
    ],
    options: { duration: 700, easing: 'ease-out', fill: 'both' },
  },
};

const CHECKERED =
  'bg-[repeating-linear-gradient(0deg,rgba(248,250,252,1)_0,rgba(248,250,252,1)_4px,rgba(30,41,59,1)_4px,rgba(30,41,59,1)_8px)]';

// Both sides ate their way to the last glizzy; the offsets keep the piles
// leaning
const STACKS = [
  { cls: 'left-[98px]', plates: [0, 1, -1, 2, 0, -2, 1] },
  { cls: 'left-[132px]', plates: [0, -1, 1, 0] },
  { cls: 'left-[172px]', plates: [0, 1, 0, -1] },
  { cls: 'left-[206px]', plates: [0, -1, 2, 0, 1, -2] },
];

const SMEARS = [
  'left-[112px] bg-red-500',
  'left-[160px] bg-yellow-400',
  'left-[190px] bg-amber-500',
  'left-[228px] bg-red-500',
];

const SWEAT = [
  { cls: 'left-[52px] bottom-[26px]', delay: 0 },
  { cls: 'left-[78px] bottom-[30px]', delay: -600 },
  { cls: 'left-[270px] bottom-[28px]', delay: -1000 },
];

const CROWD = Array.from({ length: 14 }, (_, index) => index);

export default function PhotoFinishScene({ speaker, other }: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const winner = characterBySlug(speaker);
  const loser = characterBySlug(other);
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

        <div className="absolute bottom-[18%] left-[2%] z-20 h-[22%] w-[96%]">
          <span className="absolute inset-x-0 top-0 h-2 rounded-sm bg-amber-800" />
          <span className="absolute inset-x-1 bottom-0 top-2 bg-gradient-to-b from-red-800 to-red-950 [clip-path:polygon(0_0,100%_0,97%_100%,3%_100%)]">
            <span className="absolute inset-x-0 top-1 h-1 bg-amber-300/70" />
          </span>
        </div>

        <div className="absolute bottom-[40%] left-1/2 z-30 h-[60%] w-[336px] -translate-x-1/2">
          <span className="absolute left-[96px] top-0 h-1.5 w-0.5 bg-slate-600" />
          <span className="absolute left-[222px] top-0 h-1.5 w-0.5 bg-slate-600" />
          <div className="absolute left-[72px] top-1.5 h-[92px] w-[176px] rounded-md border-2 border-slate-600 bg-slate-800 shadow-[0_0_28px_rgba(125,211,252,0.25)]">
            <div className="absolute inset-0.5 overflow-hidden rounded-sm bg-slate-950">
              <span
                data-anim="fade-in"
                data-anim-delay={CRUMB_MS}
                className="absolute inset-x-0 top-0 h-[42px] bg-amber-300/20 opacity-0"
              />
              <span className="absolute inset-x-0 top-[42px] h-px bg-sky-200/25" />
              <span
                className={`absolute bottom-2 left-[124px] top-1 w-1 ${CHECKERED}`}
              />

              <span className="absolute left-1.5 top-[11px] h-[22px] w-[22px]">
                <span className="absolute left-0 top-0 origin-top-left scale-50">
                  <PortraitHead character={winner} className="h-11 w-11" />
                </span>
              </span>
              <span
                data-anim="gray-out"
                data-anim-delay={CRUMB_MS}
                className="absolute left-1.5 top-[51px] h-[22px] w-[22px]"
              >
                <span className="absolute left-0 top-0 origin-top-left scale-50">
                  <PortraitHead character={loser} className="h-11 w-11" />
                </span>
              </span>
              <span
                data-anim="pop-in"
                data-anim-delay={CRUMB_MS + 200}
                className="absolute left-[32px] top-[14px] text-amber-300 opacity-0"
              >
                <Icon name="trophy" className="h-4 w-4" />
              </span>

              <span
                data-anim="run-winner"
                className="absolute left-[91px] top-[11px]"
              >
                <GlizzyIcon variant={0} className="h-[22px] w-[35px]" />
              </span>
              <span
                data-anim="run-loser"
                className="absolute left-[90px] top-[51px]"
              >
                <GlizzyIcon variant={0} className="h-[22px] w-[35px]" />
              </span>

              <span
                data-anim="blink"
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500"
              />
              <span className="absolute right-4 top-1.5 flex gap-px">
                <span className="h-1.5 w-1.5 bg-sky-200/80 [clip-path:polygon(100%_0,0_50%,100%_100%)]" />
                <span className="h-1.5 w-1.5 bg-sky-200/80 [clip-path:polygon(100%_0,0_50%,100%_100%)]" />
              </span>
              <span className="absolute inset-x-1.5 bottom-1 h-0.5 rounded-full bg-slate-700">
                <span
                  data-anim="scrub"
                  className="absolute inset-0 origin-left rounded-full bg-red-500"
                />
              </span>
            </div>

            <div
              data-anim="pop-in"
              data-anim-delay={LENS_MS}
              className="absolute left-[90px] top-[6px] h-[76px] w-[76px] opacity-0"
            >
              <span className="absolute left-[66px] top-[60px] h-5 w-2 -rotate-45 rounded-full bg-amber-700 ring-1 ring-slate-950/60" />
              <div className="absolute inset-0 overflow-hidden rounded-full border-[3px] border-amber-300 bg-slate-900 shadow-[0_0_14px_rgba(252,211,77,0.5)]">
                <span
                  className={`absolute inset-y-0 left-[33px] w-1 ${CHECKERED}`}
                />
                <span className="absolute left-[-6px] top-[16px] h-4 w-[32px] rounded-r-full bg-amber-500" />
                <span className="absolute left-[-6px] top-[10px] h-3 w-[36px] rounded-r-full bg-red-400" />
                <span className="absolute left-0.5 top-[13px] h-0.5 w-6 rounded-full bg-yellow-400" />
                <span className="absolute left-[-6px] top-[48px] h-4 w-[32px] rounded-r-full bg-amber-500" />
                <span className="absolute left-[-6px] top-[42px] h-3 w-[36px] rounded-r-full bg-red-400" />
                <span className="absolute left-0.5 top-[45px] h-0.5 w-6 rounded-full bg-yellow-400" />
                <span
                  data-anim="crumb-pulse"
                  data-anim-delay={CRUMB_MS}
                  className="absolute left-[29px] top-[11px] z-10 h-[9px] w-[11px] rotate-12 rounded-[40%] bg-amber-300 ring-1 ring-amber-700"
                />
                {[0, 450].map((delay) => (
                  <span
                    key={delay}
                    data-anim="ring-out"
                    data-anim-delay={CRUMB_MS + delay}
                    className="absolute left-[24px] top-[4px] z-10 h-6 w-6 rounded-full border-2 border-slate-50 opacity-0"
                  />
                ))}
              </div>
            </div>
          </div>

          <span
            data-anim="breathe"
            data-anim-delay={-1600}
            className="absolute bottom-0 left-[8px] h-6 w-14 origin-bottom rounded-t-2xl bg-gradient-to-b from-slate-500 to-slate-700 saturate-50"
          />
          <span
            data-anim="breathe"
            className="absolute bottom-0 left-[272px] h-6 w-14 origin-bottom rounded-t-2xl bg-gradient-to-b from-amber-700 to-amber-900"
          />

          {STACKS.map((stack) => (
            <div
              key={stack.cls}
              className={`absolute bottom-0 flex w-8 flex-col-reverse items-center ${stack.cls}`}
            >
              {stack.plates.map((shift, index) => (
                <span
                  key={index}
                  className={`-mt-0.5 h-1.5 w-8 shrink-0 rounded-[50%] bg-stone-100 ring-1 ring-stone-400 ${shift > 0 ? 'translate-x-0.5' : shift < 0 ? '-translate-x-0.5' : ''} ${Math.abs(shift) > 1 ? 'rotate-3' : ''}`}
                />
              ))}
            </div>
          ))}
          {SMEARS.map((cls) => (
            <span
              key={cls}
              className={`absolute bottom-[-4px] h-1 w-1.5 rounded-full ${cls}`}
            />
          ))}

          <SceneActor
            character={loser}
            className="bottom-[-14px] left-[44px]"
            pose="rotate-[96deg] saturate-50 brightness-90"
            size="h-12 w-12"
          />
          <SceneActor
            character={winner}
            className="bottom-[-14px] left-[244px]"
            anim="talk"
            animDelay={LINE_START_MS}
            animIterations={TALK_ITERATIONS}
            pose="-rotate-[96deg]"
            size="h-12 w-12"
          >
            <span
              data-anim="spotlight"
              data-anim-delay={LINE_START_MS}
              data-anim-duration={LINE_MS + QUOTE_SCENE_TAIL_MS}
              className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
            />
          </SceneActor>
          {SWEAT.map((drop) => (
            <span
              key={drop.cls}
              data-anim="drip"
              data-anim-delay={drop.delay}
              className={`absolute z-30 h-2 w-1.5 rounded-full bg-sky-200/90 opacity-0 ${drop.cls}`}
            />
          ))}

          <div className="absolute bottom-0 left-[296px] z-30 h-[72px] w-9 overflow-hidden">
            <div
              data-anim="arm-raise tremble"
              data-anim-delay={`0 ${FINGER_MS + 200}`}
              className="absolute inset-0 origin-bottom"
            >
              <span className="absolute bottom-0 left-2.5 h-9 w-4 rounded-t-sm bg-gradient-to-b from-amber-700 to-amber-900" />
              <span className="absolute bottom-[34px] left-3 h-2 w-3 bg-orange-200" />
              <span className="absolute bottom-[40px] left-1.5 h-4 w-6 rounded-md bg-orange-200 ring-1 ring-slate-950/40" />
              <span
                data-anim="finger"
                className="absolute bottom-[54px] left-2 h-[18px] w-2 origin-bottom rounded-full bg-orange-200 ring-1 ring-slate-950/40"
              />
            </div>
          </div>
          <span
            data-anim="glint"
            data-anim-delay={FINGER_MS + 60}
            className="absolute bottom-[66px] left-[300px] z-30 h-4 w-4 bg-amber-100 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
          />

          <span
            data-anim="sway"
            className="absolute bottom-[-30px] left-[24px] h-[30px] w-3.5 origin-top saturate-50"
          >
            <span className="absolute inset-x-0 top-0 h-5 rounded-b-sm bg-gradient-to-b from-slate-500 to-slate-700" />
            <span className="absolute inset-x-0 bottom-0 h-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
          </span>
        </div>
      </SceneFrame>
    </div>
  );
}
