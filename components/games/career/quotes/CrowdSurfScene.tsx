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
  QUOTE_LINE_START_MS,
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 3800;
const TOTAL_MS = QUOTE_LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The crowd-cheer cue of this scene's definition swells on the lift
const LIFT_MS = 1250;
const CARRY_OFF_MS = QUOTE_LINE_START_MS + LINE_MS;

type Fan = {
  cls: string;
  skin: string;
  shirt: string;
  // A scarf in the other accent, held up once the champion is in the air
  scarf?: string;
  from: 'left' | 'right';
  delay: number;
  back?: boolean;
};

const FANS: Fan[] = [
  {
    cls: 'left-[26%]',
    skin: 'bg-orange-200',
    shirt: 'bg-sky-700',
    from: 'left',
    delay: 760,
    back: true,
  },
  {
    cls: 'left-[56%]',
    skin: 'bg-amber-200',
    shirt: 'bg-slate-500',
    scarf: 'bg-red-400',
    from: 'right',
    delay: 800,
    back: true,
  },
  {
    cls: 'left-[14%]',
    skin: 'bg-orange-200',
    shirt: 'bg-red-600',
    scarf: 'bg-sky-300',
    from: 'left',
    delay: 620,
  },
  {
    cls: 'left-[25%]',
    skin: 'bg-amber-700',
    shirt: 'bg-cyan-700',
    from: 'left',
    delay: 700,
  },
  {
    cls: 'left-[36%]',
    skin: 'bg-orange-300',
    shirt: 'bg-slate-300',
    scarf: 'bg-red-400',
    from: 'left',
    delay: 840,
  },
  {
    cls: 'left-[47%]',
    skin: 'bg-amber-900',
    shirt: 'bg-red-500',
    from: 'right',
    delay: 880,
  },
  {
    cls: 'left-[58%]',
    skin: 'bg-orange-200',
    shirt: 'bg-sky-600',
    scarf: 'bg-cyan-200',
    from: 'right',
    delay: 720,
  },
  {
    cls: 'left-[69%]',
    skin: 'bg-amber-300',
    shirt: 'bg-slate-600',
    scarf: 'bg-sky-300',
    from: 'right',
    delay: 640,
  },
];

const CONFETTI = [
  { cls: 'left-[8%] bg-amber-300', delay: 0 },
  { cls: 'left-[20%] bg-red-400', delay: -700 },
  { cls: 'left-[32%] bg-cyan-200', delay: -1500 },
  { cls: 'left-[44%] bg-sky-400', delay: -300 },
  { cls: 'left-[56%] bg-amber-300', delay: -1900 },
  { cls: 'left-[68%] bg-red-400', delay: -1100 },
  { cls: 'left-[80%] bg-cyan-200', delay: -2100 },
  { cls: 'left-[92%] bg-sky-400', delay: -900 },
];

const CROWD = [
  'left-[2%] bottom-[44%]',
  'left-[9%] bottom-[47%]',
  'left-[16%] bottom-[44%]',
  'left-[23%] bottom-[47%]',
  'left-[30%] bottom-[44%]',
  'left-[37%] bottom-[47%]',
  'left-[44%] bottom-[44%]',
  'left-[51%] bottom-[47%]',
  'left-[58%] bottom-[44%]',
  'left-[65%] bottom-[47%]',
  'left-[72%] bottom-[44%]',
  'left-[79%] bottom-[47%]',
  'left-[86%] bottom-[44%]',
  'left-[93%] bottom-[47%]',
];

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'rush-left': {
    keyframes: [
      { transform: 'translateX(-260px)' },
      { transform: 'translateX(0)' },
    ],
    options: {
      duration: 520,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  'rush-right': {
    keyframes: [
      { transform: 'translateX(260px)' },
      { transform: 'translateX(0)' },
    ],
    options: {
      duration: 520,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  jostle: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-6px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 460, iterations: Infinity, easing: 'ease-in-out' },
  },
  'hands-up': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(14px)', opacity: 0 }],
    [LIFT_MS - 100, { transform: 'translateY(14px)', opacity: 0 }],
    [LIFT_MS + 250, { transform: 'translateY(0)', opacity: 1 }],
    [TOTAL_MS, { transform: 'translateY(0)', opacity: 1 }],
  ]),
  lift: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0) rotate(0deg)' }],
    [LIFT_MS, { transform: 'translateY(0) rotate(0deg)' }],
    [LIFT_MS + 400, { transform: 'translateY(-52px) rotate(-12deg)' }],
    [TOTAL_MS, { transform: 'translateY(-52px) rotate(-12deg)' }],
  ]),
  surf: {
    keyframes: [
      { transform: 'translateY(0) rotate(-5deg)' },
      { transform: 'translateY(-10px) rotate(5deg)', offset: 0.5 },
      { transform: 'translateY(0) rotate(-5deg)' },
    ],
    options: { duration: 520, iterations: Infinity, easing: 'ease-in-out' },
  },
  'trophy-pump': {
    keyframes: [
      { transform: 'translateY(0) rotate(-8deg)' },
      { transform: 'translateY(-6px) rotate(8deg)', offset: 0.5 },
      { transform: 'translateY(0) rotate(-8deg)' },
    ],
    options: { duration: 400, iterations: Infinity, easing: 'ease-in-out' },
  },
  'carry-off': sceneTimeline(
    TOTAL_MS,
    [
      [0, { left: '0%' }],
      [CARRY_OFF_MS, { left: '0%' }],
      [TOTAL_MS - 150, { left: '112%' }],
      [TOTAL_MS, { left: '112%' }],
    ],
    'ease-in',
  ),
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

function CrowdFan({ fan }: { fan: Fan }) {
  return (
    <div
      data-anim={fan.from === 'left' ? 'rush-left' : 'rush-right'}
      data-anim-delay={fan.delay}
      className={`absolute h-16 w-10 ${fan.back ? 'bottom-[22%] z-10 scale-90 brightness-75' : 'bottom-[16%] z-30'} ${fan.cls}`}
    >
      <div
        data-anim="jostle"
        data-anim-delay={-fan.delay}
        className="absolute inset-0"
      >
        <span
          className={`absolute bottom-0 left-1/2 h-8 w-10 -translate-x-1/2 rounded-t-2xl ${fan.shirt}`}
        />
        <span
          className={`absolute bottom-7 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full ring-2 ring-slate-950/40 ${fan.skin}`}
        />
        <span
          data-anim="hands-up"
          className="absolute -top-3 inset-x-0 opacity-0"
        >
          {fan.scarf && (
            <span
              className={`absolute inset-x-1 top-0.5 h-2 rounded-sm ring-1 ring-slate-950/40 ${fan.scarf}`}
            />
          )}
          <span
            className={`absolute left-0 top-0 h-3 w-3 rounded-full ring-1 ring-slate-950/40 ${fan.skin}`}
          />
          <span
            className={`absolute right-0 top-0 h-3 w-3 rounded-full ring-1 ring-slate-950/40 ${fan.skin}`}
          />
        </span>
      </div>
    </div>
  );
}

export default function CrowdSurfScene({ speaker }: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const champion = characterBySlug(speaker);
  useSceneAnimation(root, CUSTOM, [speaker]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor="bg-slate-800"
      >
        {CROWD.map((cls) => (
          <span
            key={cls}
            className={`absolute h-5 w-7 rounded-t-full bg-slate-800/70 ${cls}`}
          />
        ))}
        <span className="absolute inset-x-0 bottom-[40%] h-1 bg-slate-950/80" />
        <div className="absolute left-[16%] top-0 h-[84%] w-[60%] bg-gradient-to-b from-amber-200/25 to-amber-200/0 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />
        <div className="absolute left-[0%] top-0 h-[84%] w-[30%] -skew-x-12 bg-gradient-to-b from-sky-100/10 to-transparent" />
        <div className="absolute right-[0%] top-0 h-[84%] w-[30%] skew-x-12 bg-gradient-to-b from-sky-100/10 to-transparent" />

        {CONFETTI.map((piece) => (
          <span
            key={piece.cls}
            data-anim="confetti"
            data-anim-delay={piece.delay}
            className={`absolute top-0 z-10 h-2 w-1 rounded-[1px] ${piece.cls}`}
          />
        ))}

        <div data-anim="carry-off" className="absolute inset-y-0 left-0 w-full">
          <div className="absolute bottom-[34%] left-[40%] h-14 w-14 sm:h-16 sm:w-16">
            <SceneActor
              character={champion}
              className="bottom-0 left-0"
              anim="lift surf talk"
              animDelay={`0 ${LIFT_MS + 400} ${QUOTE_LINE_START_MS}`}
              animIterations={`1 Infinity ${TALK_ITERATIONS}`}
              pose="origin-bottom"
              size="h-14 w-14 sm:h-16 sm:w-16"
            >
              <span
                data-anim="spotlight"
                data-anim-delay={QUOTE_LINE_START_MS}
                data-anim-duration={LINE_MS}
                className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
              />
              <span className="absolute left-1/2 top-[calc(100%-4px)] -z-10 h-10 w-12 -translate-x-1/2 rounded-t-2xl bg-gradient-to-b from-emerald-600 to-emerald-800" />
              <span
                data-anim="trophy-pump"
                className="absolute -top-9 left-[60%] text-amber-300"
              >
                <Icon
                  name="trophy"
                  className="h-9 w-9 drop-shadow-[0_0_12px_rgba(252,211,77,0.85)]"
                />
              </span>
              <span className="absolute -top-2 left-[74%] h-4 w-4 rounded-full bg-orange-200 ring-2 ring-slate-950/50" />
            </SceneActor>
          </div>

          {FANS.map((fan) => (
            <CrowdFan key={`${fan.cls}-${fan.delay}`} fan={fan} />
          ))}
        </div>
      </SceneFrame>
    </div>
  );
}
