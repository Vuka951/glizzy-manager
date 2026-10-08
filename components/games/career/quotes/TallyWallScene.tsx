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
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 1600;
// Matches the lineStartMs of this scene's definition: the walk, the mark and
// the snapped chalk come first, the line once the forehead is on the wall
const LINE_START_MS = 3200;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The cues of the definition land on these: the shuffle under the walk, the
// tick on the stroke, the snap as it ends, a tick as the broken half hits
// the floor and the thud on the forehead
const WALK_MS = 800;
const STEP_MS = 200;
const STEPS = 4;
const ARRIVE_MS = WALK_MS + STEPS * STEP_MS;
const REACH_MS = 1650;
const DRAW_MS = 1950;
const SNAP_MS = 2350;
const LOOK_MS = 2450;
const HALF_DOWN_MS = SNAP_MS + 430;
const LEAN_MS = 2850;
const REST_MS = 3150;

const WALK_PX = 86;
const TIPTOE_PX = 8;
const LEG_PX = 28;
const TIPTOE_STRETCH = (LEG_PX + TIPTOE_PX) / LEG_PX;
// The chalk arm hangs at this share of the length it stretches to for the
// mark
const ARM_PX = 44;
const ARM_SLACK = 0.8;
const HAND_SLACK_PX = ARM_PX * (1 - ARM_SLACK);
const STANDING = 'translate(0px, 0px) rotate(0deg)';
const RESTING = 'translate(40px, 0px) rotate(9deg)';

const timeline = (frames: [number, Keyframe][], easing?: string) =>
  sceneTimeline(TOTAL_MS, frames, easing);

// Four steps to the wall, and one more into it on the lean
const leg = (side: 1 | -1) =>
  timeline([
    [0, { transform: 'rotate(0deg)' }],
    [WALK_MS, { transform: 'rotate(0deg)' }],
    ...Array.from({ length: STEPS }, (_, step): [number, Keyframe] => [
      WALK_MS + STEP_MS * (step + 0.5),
      { transform: `rotate(${side * (step % 2 ? -18 : 18)}deg)` },
    ]),
    [ARRIVE_MS, { transform: 'rotate(0deg)' }],
    [LEAN_MS, { transform: 'rotate(0deg)' }],
    [LEAN_MS + 130, { transform: `rotate(${side * -16}deg)` }],
    [REST_MS - 30, { transform: 'rotate(0deg)' }],
    [TOTAL_MS, { transform: 'rotate(0deg)' }],
  ]);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  walk: timeline([
    [0, { transform: 'translate(0px, 0px)' }],
    ...Array.from({ length: STEPS + 1 }, (_, step): [number, Keyframe] => [
      WALK_MS + STEP_MS * step,
      {
        transform: `translate(${(WALK_PX / STEPS) * step}px, ${step % 2 ? -3 : 0}px)`,
      },
    ]),
    [TOTAL_MS, { transform: `translate(${WALK_PX}px, 0px)` }],
  ]),
  'leg-lead': leg(1),
  'leg-trail': leg(-1),
  // Up on his toes for the mark, back down on the snap
  'tiptoe-legs': timeline([
    [0, { transform: 'scaleY(1)' }],
    [REACH_MS, { transform: 'scaleY(1)' }],
    [DRAW_MS - 50, { transform: `scaleY(${TIPTOE_STRETCH})` }],
    [SNAP_MS, { transform: `scaleY(${TIPTOE_STRETCH})` }],
    [LOOK_MS, { transform: 'scaleY(1)' }],
    [TOTAL_MS, { transform: 'scaleY(1)' }],
  ]),
  'tiptoe-body': timeline([
    [0, { transform: 'translateY(0px)' }],
    [REACH_MS, { transform: 'translateY(0px)' }],
    [DRAW_MS - 50, { transform: `translateY(-${TIPTOE_PX}px)` }],
    [SNAP_MS, { transform: `translateY(-${TIPTOE_PX}px)` }],
    [LOOK_MS, { transform: 'translateY(0px)' }],
    [TOTAL_MS, { transform: 'translateY(0px)' }],
  ]),
  // The whole man tips over from the feet until the wall stops his forehead
  lean: timeline([
    [0, { transform: STANDING }],
    [LEAN_MS, { transform: STANDING }],
    [REST_MS, { transform: RESTING }],
    [REST_MS + 90, { transform: 'translate(39px, 0px) rotate(7.5deg)' }],
    [REST_MS + 200, { transform: RESTING }],
    [TOTAL_MS, { transform: RESTING }],
  ]),
  // Swings with the walk, sweeps the stroke across the four standing marks,
  // comes down to show him the stub and hangs once he gives up
  'chalk-arm': timeline([
    [0, { transform: 'rotate(0deg)' }],
    [WALK_MS, { transform: 'rotate(0deg)' }],
    [WALK_MS + STEP_MS, { transform: 'rotate(-10deg)' }],
    [WALK_MS + STEP_MS * 2, { transform: 'rotate(6deg)' }],
    [WALK_MS + STEP_MS * 3, { transform: 'rotate(-10deg)' }],
    [ARRIVE_MS, { transform: 'rotate(0deg)' }],
    [REACH_MS, { transform: 'rotate(0deg)' }],
    [DRAW_MS - 50, { transform: 'rotate(-168deg)' }],
    [DRAW_MS, { transform: 'rotate(-168deg)' }],
    [SNAP_MS, { transform: 'rotate(-143deg)' }],
    [SNAP_MS + 70, { transform: 'rotate(-132deg)' }],
    [LOOK_MS + 250, { transform: 'rotate(-120deg)' }],
    [LEAN_MS, { transform: 'rotate(-120deg)' }],
    [LEAN_MS + 150, { transform: 'rotate(-14deg)' }],
    [REST_MS, { transform: 'rotate(-9deg)' }],
    [TOTAL_MS, { transform: 'rotate(-9deg)' }],
  ]),
  'sleeve-stretch': timeline([
    [0, { transform: `scaleY(${ARM_SLACK})` }],
    [REACH_MS, { transform: `scaleY(${ARM_SLACK})` }],
    [DRAW_MS - 50, { transform: 'scaleY(1)' }],
    [SNAP_MS + 70, { transform: 'scaleY(1)' }],
    [LOOK_MS + 250, { transform: `scaleY(${ARM_SLACK})` }],
    [TOTAL_MS, { transform: `scaleY(${ARM_SLACK})` }],
  ]),
  'hand-stretch': timeline([
    [0, { transform: `translateY(-${HAND_SLACK_PX}px)` }],
    [REACH_MS, { transform: `translateY(-${HAND_SLACK_PX}px)` }],
    [DRAW_MS - 50, { transform: 'translateY(0px)' }],
    [SNAP_MS + 70, { transform: 'translateY(0px)' }],
    [LOOK_MS + 250, { transform: `translateY(-${HAND_SLACK_PX}px)` }],
    [TOTAL_MS, { transform: `translateY(-${HAND_SLACK_PX}px)` }],
  ]),
  'idle-arm': timeline([
    [0, { transform: 'rotate(0deg)' }],
    [WALK_MS, { transform: 'rotate(0deg)' }],
    [WALK_MS + STEP_MS, { transform: 'rotate(8deg)' }],
    [WALK_MS + STEP_MS * 2, { transform: 'rotate(-6deg)' }],
    [WALK_MS + STEP_MS * 3, { transform: 'rotate(8deg)' }],
    [ARRIVE_MS, { transform: 'rotate(0deg)' }],
    [LEAN_MS, { transform: 'rotate(0deg)' }],
    [REST_MS, { transform: 'rotate(-9deg)' }],
    [TOTAL_MS, { transform: 'rotate(-9deg)' }],
  ]),
  // Eyes up at the mark, down at the stub, then the forehead leads the lean
  'head-follow': timeline([
    [0, { transform: 'rotate(0deg)' }],
    [REACH_MS, { transform: 'rotate(0deg)' }],
    [DRAW_MS - 50, { transform: 'rotate(8deg)' }],
    [SNAP_MS, { transform: 'rotate(8deg)' }],
    [LOOK_MS + 250, { transform: 'rotate(18deg)' }],
    [LEAN_MS, { transform: 'rotate(18deg)' }],
    [REST_MS, { transform: 'rotate(32deg)' }],
    [TOTAL_MS, { transform: 'rotate(32deg)' }],
  ]),
  stroke: timeline(
    [
      [0, { transform: 'scaleX(0)' }],
      [DRAW_MS, { transform: 'scaleX(0)' }],
      [SNAP_MS, { transform: 'scaleX(1)' }],
      [TOTAL_MS, { transform: 'scaleX(1)' }],
    ],
    'linear',
  ),
  'chalk-snap': timeline([
    [0, { transform: 'scaleY(1)' }],
    [SNAP_MS, { transform: 'scaleY(1)' }],
    [SNAP_MS + 1, { transform: 'scaleY(0.6)' }],
    [TOTAL_MS, { transform: 'scaleY(0.6)' }],
  ]),
  // The broken half jumps off the wall, drops, bounces once and stays
  'chalk-half': timeline([
    [0, { opacity: 0, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [SNAP_MS, { opacity: 0, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [SNAP_MS + 1, { opacity: 1, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [
      SNAP_MS + 120,
      { opacity: 1, transform: 'translate(5px, -14px) rotate(140deg)' },
    ],
    [HALF_DOWN_MS, { opacity: 1, transform: 'translate(10px, 120px) rotate(420deg)' }],
    [
      HALF_DOWN_MS + 90,
      { opacity: 1, transform: 'translate(12px, 111px) rotate(480deg)' },
    ],
    [
      HALF_DOWN_MS + 180,
      { opacity: 1, transform: 'translate(14px, 120px) rotate(540deg)' },
    ],
    [TOTAL_MS, { opacity: 1, transform: 'translate(14px, 120px) rotate(540deg)' }],
  ]),
  puff: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.4)' },
      { opacity: 0.8, transform: 'scale(1)', offset: 0.25 },
      { opacity: 0, transform: 'scale(1.9)' },
    ],
    options: { duration: 550, easing: 'ease-out', fill: 'both' },
  },
  bonk: {
    keyframes: [
      { opacity: 0, transform: 'scaleX(0.3)' },
      { opacity: 1, transform: 'scaleX(1)', offset: 0.3 },
      { opacity: 0, transform: 'scaleX(1.2)' },
    ],
    options: { duration: 380, easing: 'ease-out', fill: 'both' },
  },
  'dust-fall': {
    keyframes: [
      { opacity: 0, transform: 'translate(0px, 0px)' },
      { opacity: 0.9, transform: 'translate(0px, 3px)', offset: 0.15 },
      { opacity: 0, transform: 'translate(3px, 34px)' },
    ],
    options: { duration: 800, easing: 'ease-in', fill: 'both' },
  },
};

const STROKES = [
  'left-[2px] rotate-2',
  'left-[7px] -rotate-3',
  'left-[12px] rotate-1',
  'left-[17px] -rotate-2',
];

const TILTS = ['rotate-1', '-rotate-2', 'rotate-0', 'rotate-2', '-rotate-1'];

const CHALK = 'rounded-full bg-slate-200/70';
const SLASH = 'absolute -left-0.5 top-[8px] h-0.5 w-[26px] rotate-[28deg]';

const OLD_BLOCK_GROUPS = 12;
// The block being filled: every five before the one on the wall tonight
const FULL_GROUPS = 11;

const LOCKERS = 3;

const STUBS = [
  'left-[156px] bottom-[3px] rotate-12',
  'left-[171px] bottom-[1px] -rotate-[20deg]',
  'left-[192px] bottom-[4px] rotate-45',
  'left-[236px] bottom-[2px] -rotate-6',
  'left-[251px] bottom-[5px] rotate-[70deg]',
  'left-[264px] bottom-[1px] rotate-[24deg]',
];

const SNAP_DUST = [
  { cls: 'left-[254px] bottom-[118px]', delay: SNAP_MS },
  { cls: 'left-[260px] bottom-[122px]', delay: SNAP_MS + 90 },
  { cls: 'left-[265px] bottom-[116px]', delay: SNAP_MS + 180 },
];

const THUD_DUST = [
  { cls: 'left-[214px] bottom-[140px]', delay: REST_MS + 40 },
  { cls: 'left-[238px] bottom-[124px]', delay: REST_MS + 120 },
  { cls: 'left-[270px] bottom-[150px]', delay: REST_MS + 200 },
  { cls: 'left-[190px] bottom-[122px]', delay: REST_MS + 260 },
];

const BONKS = [
  'left-[273px] bottom-[110px] rotate-[40deg]',
  'left-[270px] bottom-[120px] rotate-[65deg]',
];

function TallyGroup({ index }: { index: number }) {
  return (
    <span
      className={`relative h-[18px] w-[22px] ${TILTS[index % TILTS.length]}`}
    >
      {STROKES.map((cls) => (
        <span
          key={cls}
          className={`absolute top-0 h-full w-0.5 ${CHALK} ${cls}`}
        />
      ))}
      <span className={`${SLASH} ${CHALK}`} />
    </span>
  );
}

export default function TallyWallScene({ speaker }: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  useSceneAnimation(root, CUSTOM, [speaker]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-800 via-slate-700 to-slate-700"
        floor="bg-gradient-to-b from-stone-700 to-stone-800"
      >
        <span className="absolute inset-x-0 bottom-[18%] h-1.5 bg-slate-900/70" />

        <div className="absolute bottom-[16%] left-1/2 h-0 w-[340px] origin-bottom -translate-x-1/2 sm:scale-[1.14]">
          <div className="absolute bottom-[6px] left-0 flex">
            {Array.from({ length: LOCKERS }, (_, index) => (
              <span
                key={index}
                className="relative h-[128px] w-7 border border-slate-800/70 bg-slate-600/40"
              >
                <span className="absolute inset-x-1.5 top-2 h-0.5 bg-slate-800/60" />
                <span className="absolute inset-x-1.5 top-3.5 h-0.5 bg-slate-800/60" />
                <span className="absolute right-1 top-1/2 h-2.5 w-0.5 rounded-full bg-slate-400/60" />
              </span>
            ))}
          </div>
          <div className="absolute bottom-0 left-[4px] z-10 h-[22px] w-[72px]">
            <span className="absolute inset-x-0 top-0 h-1.5 rounded-sm bg-amber-800 shadow-md" />
            <span className="absolute bottom-0 left-2 top-1.5 w-1 bg-slate-900" />
            <span className="absolute bottom-0 right-2 top-1.5 w-1 bg-slate-900" />
            <span className="absolute -top-1 left-7 h-2.5 w-8 rounded-sm bg-stone-200" />
          </div>

          <div className="absolute bottom-[66px] left-[94px] grid grid-cols-2 gap-x-[10px] gap-y-[9px]">
            {Array.from({ length: OLD_BLOCK_GROUPS }, (_, index) => (
              <TallyGroup key={index} index={index} />
            ))}
          </div>
          <div className="absolute bottom-[120px] left-[172px] grid grid-cols-3 gap-x-[10px] gap-y-[9px]">
            {Array.from({ length: FULL_GROUPS }, (_, index) => (
              <TallyGroup key={index} index={index + 2} />
            ))}
            <span className="relative h-[18px] w-[22px]">
              {STROKES.map((cls) => (
                <span
                  key={cls}
                  className={`absolute top-0 h-full w-0.5 ${CHALK} ${cls}`}
                />
              ))}
              <span className={SLASH}>
                <span
                  data-anim="stroke"
                  className="absolute inset-0 origin-left rounded-full bg-slate-50"
                />
              </span>
            </span>
          </div>

          {STUBS.map((cls) => (
            <span
              key={cls}
              className={`absolute h-1 w-1.5 rounded-[1px] bg-slate-300/80 ${cls}`}
            />
          ))}

          <span
            data-anim="puff"
            data-anim-delay={SNAP_MS}
            className="absolute bottom-[116px] left-[254px] h-3.5 w-3.5 rounded-full bg-slate-100/60 opacity-0 blur-[1px]"
          />
          {BONKS.map((cls) => (
            <span
              key={cls}
              data-anim="bonk"
              data-anim-delay={REST_MS}
              className={`absolute z-30 h-0.5 w-2.5 origin-right rounded-full bg-slate-50 opacity-0 ${cls}`}
            />
          ))}
          {[...SNAP_DUST, ...THUD_DUST].map((speck) => (
            <span
              key={speck.cls}
              data-anim="dust-fall"
              data-anim-delay={speck.delay}
              className={`absolute z-30 h-[3px] w-[3px] rounded-full bg-slate-200 opacity-0 ${speck.cls}`}
            />
          ))}
          <span
            data-anim="chalk-half"
            className="absolute bottom-[120px] left-[259px] z-30 h-1.5 w-1 rounded-[1px] bg-slate-50 opacity-0"
          />

          <div
            data-anim="walk"
            className="absolute bottom-0 left-[86px] z-20 h-32 w-16"
          >
            <div data-anim="lean" className="absolute inset-0 origin-bottom">
              <span
                data-anim="tiptoe-legs"
                className="absolute inset-x-0 bottom-0 h-7 origin-bottom"
              >
                <span
                  data-anim="leg-trail"
                  className="absolute bottom-0 left-[14px] h-7 w-3 origin-top rounded-b-md bg-slate-900"
                />
                <span
                  data-anim="leg-lead"
                  className="absolute bottom-0 right-[14px] h-7 w-3 origin-top rounded-b-md bg-slate-900"
                />
              </span>
              <div data-anim="tiptoe-body" className="absolute inset-0">
                <span
                  data-anim="idle-arm"
                  className="absolute bottom-[30px] left-[4px] h-[36px] w-3 origin-top rounded-full bg-emerald-700"
                >
                  <span className="absolute -bottom-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                </span>
                <span className="absolute bottom-6 left-2 h-11 w-12 rounded-t-2xl bg-gradient-to-b from-emerald-600 to-emerald-800" />
                <SceneActor
                  character={lead}
                  className="bottom-[60px] left-1/2 -translate-x-1/2"
                  anim="head-follow talk"
                  animDelay={`0 ${LINE_START_MS}`}
                  animIterations={`1 ${TALK_ITERATIONS}`}
                  size="h-14 w-14"
                >
                  <span
                    data-anim="spotlight"
                    data-anim-delay={LINE_START_MS}
                    data-anim-duration={LINE_MS}
                    className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
                  />
                </SceneActor>
                <span
                  data-anim="chalk-arm"
                  className="absolute bottom-[20px] left-[46px] z-30 h-[44px] w-3 origin-top"
                >
                  <span
                    data-anim="sleeve-stretch"
                    className="absolute inset-0 origin-top rounded-full bg-emerald-700"
                  />
                  <span
                    data-anim="hand-stretch"
                    className="absolute inset-x-0 top-full h-0"
                  >
                    <span
                      data-anim="chalk-snap"
                      className="absolute left-1/2 top-1 h-3 w-1 origin-top -translate-x-1/2 rounded-[1px] bg-slate-50"
                    />
                    <span className="absolute -top-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-[286px] z-30 h-[240px] w-[54px] border-l-2 border-slate-500 bg-gradient-to-r from-slate-600 to-slate-700 shadow-[-8px_0_12px_rgba(2,6,23,0.35)]">
            <span className="absolute inset-x-0 bottom-0 h-2 bg-slate-800/70" />
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
