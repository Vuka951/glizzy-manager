'use client';

import { useRef } from 'react';
import ElectionLossFlagCloth from '@/components/games/career/quotes/ElectionLossFlagCloth';
import XEyes from '@/components/games/career/quotes/XEyes';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { GAMES_UI } from '@/data/games/locale';
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

// Matches the lineStartMs of this scene's definition: the line comes once
// the card is stamped and the chalk is down
const LINE_START_MS = 6000;
const LINE_MS = 4200;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The sneak-steps, skid-crash, thud, brake, flutter, slide, stamp, whoosh
// and scribble cues of the definition land on these. The skid-crash cue goes
// out 1350 ms before the hit so its crash lands on it
const WALK_MS = 450;
const STOP_MS = 1250;
const FLARE_MS = 1500;
const HANDS_UP_MS = 1750;
const HIT_MS = 2950;
const LAND_MS = 3550;
const GONE_MS = 3600;
const BRAKE_MS = 3750;
const FLICK_MS = 4100;
const CARD_MS = 4700;
const DRIVE_OFF_MS = 5000;
const STAMP_MS = 5200;
const CHALK_MS = 5450;
const WINDOW_MS = 5600;
const TWITCH_MS = LINE_START_MS + 3400;

const WALK_PX = 140;
const STEP_MS = (STOP_MS - WALK_MS) / 4;
// Where he comes to rest, from the spot he was standing on, flat on his
// back with his head toward the way the car went
const FLUNG_X = -110;
const FLUNG_Y = 33;
const FLAT_SCALE = 0.85;
// Spread-eagle on the crossing; the chalk path below traces these angles
const ARM_SPREAD = 145;
const LEG_SPREAD = 18;

const TOWER_SIGN = GAMES_UI.career.sponsors.names.yellow;
const STAMP_TEXT = GAMES_UI.career.quoteCutscene.runOverStamp;

const tl = (frames: [number, Keyframe][], easing?: string) =>
  sceneTimeline(TOTAL_MS, frames, easing);
const at = (ms: number, transform: string): [number, Keyframe] => [
  ms,
  { transform },
];
const turn = (ms: number, deg: number) => at(ms, `rotate(${deg}deg)`);
const shown = (ms: number, opacity: number): [number, Keyframe] => [
  ms,
  { opacity },
];
const fling = (ms: number, x: number, y: number, deg: number, scale = 1) =>
  at(ms, `translate(${x}px, ${y}px) rotate(${deg}deg) scale(${scale})`);
const toss = (
  ms: number,
  left: string,
  bottom: string,
  deg: number,
  opacity = 1
): [number, Keyframe] => [
  ms,
  { left, bottom, transform: `rotate(${deg}deg)`, opacity },
];

// Over his chest once he lies flat, clear of the face
const CARD_REST_LEFT = 'calc(42% - 74px)';
const CARD_REST_BOTTOM = 'calc(16% + 19px)';

// One pair of arms through every beat: the walk swing, hands up in the
// headlights, flailing in the air, spread on the asphalt. side 1 is the arm
// on the left of the screen
const arm = (side: 1 | -1, twitch: boolean) =>
  tl([
    turn(0, side * 8),
    turn(WALK_MS, side * 8),
    turn(WALK_MS + STEP_MS * 0.5, -side * 14),
    turn(WALK_MS + STEP_MS * 1.5, side * 22),
    turn(WALK_MS + STEP_MS * 2.5, -side * 14),
    turn(WALK_MS + STEP_MS * 3.5, side * 22),
    turn(STOP_MS, side * 8),
    turn(HANDS_UP_MS - 100, side * 8),
    turn(HANDS_UP_MS, side * 165),
    turn(HIT_MS, side * 160),
    turn(HIT_MS + 150, side * 100),
    turn(HIT_MS + 350, side * 175),
    turn(LAND_MS, side * ARM_SPREAD),
    turn(TWITCH_MS, side * ARM_SPREAD),
    turn(TWITCH_MS + 150, side * (ARM_SPREAD - (twitch ? 30 : 0))),
    turn(TWITCH_MS + 400, side * ARM_SPREAD),
    turn(TOTAL_MS, side * ARM_SPREAD),
  ]);

const leg = (side: 1 | -1) =>
  tl([
    turn(0, 0),
    turn(WALK_MS, 0),
    turn(WALK_MS + STEP_MS * 0.5, side * 18),
    turn(WALK_MS + STEP_MS * 1.5, -side * 18),
    turn(WALK_MS + STEP_MS * 2.5, side * 18),
    turn(WALK_MS + STEP_MS * 3.5, -side * 18),
    turn(STOP_MS, 0),
    turn(HIT_MS, 0),
    turn(HIT_MS + 150, side * 34),
    turn(HIT_MS + 350, -side * 10),
    turn(LAND_MS, side * LEG_SPREAD),
    turn(TOTAL_MS, side * LEG_SPREAD),
  ]);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  walk: tl([
    at(0, `translateX(${-WALK_PX}px)`),
    at(WALK_MS, `translateX(${-WALK_PX}px)`),
    at(STOP_MS, 'translateX(0)'),
    at(TOTAL_MS, 'translateX(0)'),
  ]),
  'walk-bob': {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-3px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: STEP_MS, iterations: 4, easing: 'ease-in-out' },
  },
  tumble: tl([
    fling(0, 0, 0, 0),
    fling(HIT_MS, 0, 0, 0),
    fling(HIT_MS + 80, -14, -26, -60),
    fling(HIT_MS + 320, -60, -80, -260),
    fling(LAND_MS, FLUNG_X, FLUNG_Y, -450, FLAT_SCALE),
    fling(LAND_MS + 100, FLUNG_X - 4, FLUNG_Y - 8, -444, FLAT_SCALE),
    fling(LAND_MS + 220, FLUNG_X, FLUNG_Y, -450, FLAT_SCALE),
    fling(TOTAL_MS, FLUNG_X, FLUNG_Y, -450, FLAT_SCALE),
  ]),
  head: tl([
    turn(0, -4),
    turn(STOP_MS, -4),
    turn(STOP_MS + 150, -14),
    turn(FLARE_MS, -14),
    turn(FLARE_MS + 120, 16),
    turn(HANDS_UP_MS, 10),
    turn(HANDS_UP_MS + 120, 16),
    turn(HANDS_UP_MS + 240, 10),
    turn(HIT_MS, 12),
    turn(LAND_MS, 0),
    turn(TOTAL_MS, 0),
  ]),
  'arm-a': arm(1, false),
  'arm-b': arm(-1, true),
  'leg-a': leg(1),
  'leg-b': leg(-1),
  'shoe-on': tl([shown(0, 1), shown(HIT_MS, 1), shown(HIT_MS + 20, 0), shown(TOTAL_MS, 0)]),
  'shoe-off': tl([shown(0, 0), shown(HIT_MS, 0), shown(HIT_MS + 20, 1), shown(TOTAL_MS, 1)]),
  alarm: tl([
    [0, { transform: 'scale(0.3)', opacity: 0 }],
    [FLARE_MS + 40, { transform: 'scale(0.3)', opacity: 0 }],
    [FLARE_MS + 160, { transform: 'scale(1.2)', opacity: 1 }],
    [FLARE_MS + 260, { transform: 'scale(1)', opacity: 1 }],
    [HIT_MS - 20, { transform: 'scale(1)', opacity: 1 }],
    [HIT_MS, { transform: 'scale(1)', opacity: 0 }],
    [TOTAL_MS, { transform: 'scale(1)', opacity: 0 }],
  ]),
  dazed: tl([shown(0, 0), shown(LAND_MS - 20, 0), shown(LAND_MS, 1), shown(TOTAL_MS, 1)]),
  'car-path': tl(
    [
      [0, { left: '125%' }],
      [FLARE_MS, { left: '125%' }],
      [FLARE_MS + 400, { left: '104%' }],
      [HIT_MS, { left: 'calc(42% + 26px)' }],
      [GONE_MS, { left: '-260px' }],
      [TOTAL_MS, { left: '-260px' }],
    ],
    'linear'
  ),
  'car-skid': tl([
    turn(0, 0),
    turn(FLARE_MS + 400, 0),
    turn(FLARE_MS + 700, -2),
    turn(HIT_MS - 300, 1),
    turn(HIT_MS, -3),
    turn(HIT_MS + 120, 1),
    turn(GONE_MS, 0),
    turn(TOTAL_MS, 0),
  ]),
  beam: tl([shown(0, 0), shown(FLARE_MS, 0), shown(FLARE_MS + 160, 1), shown(TOTAL_MS, 1)]),
  glare: tl([
    shown(0, 0),
    shown(FLARE_MS, 0),
    shown(FLARE_MS + 200, 0.3),
    shown(HIT_MS - 60, 0.5),
    shown(HIT_MS + 150, 0),
    shown(TOTAL_MS, 0),
  ]),
  'skid-marks': tl([
    [0, { clipPath: 'inset(0 0 0 100%)' }],
    [FLARE_MS + 600, { clipPath: 'inset(0 0 0 100%)' }],
    [HIT_MS, { clipPath: 'inset(0 0 0 0)' }],
    [TOTAL_MS, { clipPath: 'inset(0 0 0 0)' }],
  ]),
  'wheel-spin': {
    keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }],
    options: { duration: 220, iterations: Infinity, easing: 'linear' },
  },
  'impact-burst': tl([
    [0, { opacity: 0, transform: 'scale(0.3)' }],
    [HIT_MS, { opacity: 0, transform: 'scale(0.3)' }],
    [HIT_MS + 60, { opacity: 0.85, transform: 'scale(1)' }],
    [HIT_MS + 220, { opacity: 0, transform: 'scale(1.3)' }],
    [TOTAL_MS, { opacity: 0, transform: 'scale(1.3)' }],
  ]),
  'impact-flash': tl([
    shown(0, 0),
    shown(HIT_MS, 0),
    shown(HIT_MS + 30, 0.3),
    shown(HIT_MS + 160, 0),
    shown(TOTAL_MS, 0),
  ]),
  'impact-jolt': {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-5px, 3px)' },
      { transform: 'translate(5px, -3px)' },
      { transform: 'translate(-3px, -2px)' },
      { transform: 'translate(3px, 2px)' },
      { transform: 'translate(0, 0)' },
    ],
    options: { duration: 320, delay: HIT_MS, easing: 'linear' },
  },
  brake: tl([
    shown(0, 0),
    shown(BRAKE_MS, 0),
    shown(BRAKE_MS + 120, 1),
    shown(DRIVE_OFF_MS, 1),
    shown(DRIVE_OFF_MS + 250, 0),
    shown(TOTAL_MS, 0),
  ]),
  card: tl([
    toss(0, '-8%', '40%', 0, 0),
    toss(FLICK_MS, '-8%', '40%', 0, 0),
    toss(FLICK_MS + 40, '-4%', '44%', -20),
    toss(FLICK_MS + 320, 'calc(20% - 40px)', '66%', -200),
    toss(CARD_MS, CARD_REST_LEFT, CARD_REST_BOTTOM, -372),
    toss(CARD_MS + 90, CARD_REST_LEFT, 'calc(16% + 23px)', -369),
    toss(CARD_MS + 180, CARD_REST_LEFT, CARD_REST_BOTTOM, -372),
    toss(TOTAL_MS, CARD_REST_LEFT, CARD_REST_BOTTOM, -372),
  ]),
  stamp: tl([
    [0, { transform: 'rotate(-14deg) scale(2.6)', opacity: 0 }],
    [STAMP_MS - 60, { transform: 'rotate(-14deg) scale(2.6)', opacity: 0 }],
    [STAMP_MS, { transform: 'rotate(-14deg) scale(1)', opacity: 1 }],
    [STAMP_MS + 80, { transform: 'rotate(-14deg) scale(1.1)', opacity: 1 }],
    [STAMP_MS + 160, { transform: 'rotate(-14deg) scale(1)', opacity: 1 }],
    [TOTAL_MS, { transform: 'rotate(-14deg) scale(1)', opacity: 1 }],
  ]),
  chalk: tl([
    [0, { strokeDashoffset: '1' }],
    [CHALK_MS, { strokeDashoffset: '1' }],
    [CHALK_MS + 600, { strokeDashoffset: '0' }],
    [TOTAL_MS, { strokeDashoffset: '0' }],
  ]),
  penthouse: tl([shown(0, 0), shown(WINDOW_MS, 0), shown(WINDOW_MS + 90, 1), shown(TOTAL_MS, 1)]),
};

// The landed body traced 6 px out, in the body's own upright box (56 by
// 128): head, both arms up at ARM_SPREAD, torso, legs out at LEG_SPREAD
const CHALK_PATH =
  'M1 27 A30 30 0 0 1 55 27 L57 24 L66 14 L76 18 L79 30 L75 36 L58 62 L58 88 L53 90 L62 118 L60 130 L52 134 L44 128 L31 102 L22 126 L16 134 L6 132 L0 124 L0 118 L9 90 L-2 88 L-2 62 L-19 36 L-21 26 L-12 16 L-3 16 L-1 24 Z';

const STARS = [
  'left-[8%] top-[9%] h-1 w-1',
  'left-[22%] top-[22%] h-0.5 w-0.5',
  'left-[36%] top-[7%] h-1 w-1',
  'left-[52%] top-[16%] h-0.5 w-0.5',
  'left-[61%] top-[5%] h-0.5 w-0.5',
];
// The tower's office floors, a few still lit at this hour
const WINDOWS = Array.from({ length: 25 }, (_, index) => index);
const LIT = new Set([2, 6, 7, 13, 19, 21]);
const ZEBRA = [0, 1, 2, 3, 4, 5, 6];
const RAILING = [0, 1, 2, 3, 4, 5, 6];
const TIRE_SMOKE = [0, 260, 520];
const SHOE_SMOKE = [0, 900];
// Where each shoe stands, under its leg
const SHOES = ['left-[12px]', 'left-[28px]'];
const WHEELS = ['left-[30px]', 'left-[152px]'];

export default function YellowRunOverScene({ speaker }: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const debtor = characterBySlug(speaker);
  useSceneAnimation(root, CUSTOM, [speaker]);

  const shoe =
    'h-[7px] w-[16px] rounded-t-full rounded-b-sm bg-amber-950 ring-1 ring-slate-950/60';
  const hand =
    'absolute h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40';

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900"
        floor={null}
      >
        <div data-anim="impact-jolt" className="absolute inset-0">
          {STARS.map((cls) => (
            <span
              key={cls}
              className={`absolute rounded-full bg-slate-200/60 ${cls}`}
            />
          ))}
          <span className="absolute left-[14%] top-[10%] h-6 w-6 rounded-full bg-amber-50/70 shadow-[0_0_20px_6px_rgba(254,243,199,0.2)]" />
          <div className="absolute inset-x-0 bottom-[38%] h-[24%] bg-slate-950/70 [clip-path:polygon(0_100%,0_50%,8%_50%,8%_20%,16%_20%,16%_60%,26%_60%,26%_10%,34%_10%,34%_45%,46%_45%,46%_30%,54%_30%,54%_100%)]" />

          <div className="absolute bottom-[38%] right-[14%] h-[52%] w-[26%] max-w-40 rounded-t-sm bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_0_30px_rgba(2,6,23,0.8)] ring-1 ring-slate-700/60">
            <span className="absolute -top-[10px] left-1/2 h-[10px] w-[40%] -translate-x-1/2 rounded-t-sm bg-slate-900 ring-1 ring-slate-700/60" />
            <span
              data-anim="glow-pulse"
              className="absolute -top-[30px] left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-yellow-300/30 blur-md"
            />
            <SponsorEmblem
              sponsorId="yellow"
              className="absolute -top-[26px] left-1/2 h-9 w-9 -translate-x-1/2 drop-shadow-[0_0_6px_rgba(253,224,71,0.6)]"
            />
            <span className="absolute inset-x-0 top-[16px] text-center text-[7px] font-black uppercase tracking-[0.2em] text-yellow-300">
              {TOWER_SIGN}
            </span>
            <div className="absolute left-1/2 top-[30px] h-[16px] w-[34px] -translate-x-1/2 overflow-hidden rounded-[1px] bg-slate-800 ring-1 ring-yellow-300/30">
              <span
                data-anim="penthouse"
                className="absolute inset-0 bg-yellow-200 opacity-0"
              />
            </div>
            <div className="absolute inset-x-[12%] bottom-[6%] top-[56px] grid grid-cols-5 content-start gap-x-[5px] gap-y-[7px] overflow-hidden">
              {WINDOWS.map((index) => (
                <span
                  key={index}
                  className={`h-[7px] rounded-[1px] ${
                    LIT.has(index) ? 'bg-yellow-200/60' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <span className="absolute -left-[46px] top-[82px] z-30 h-[3px] w-[64px] rounded-full bg-slate-400" />
            <div className="absolute -left-[44px] top-[85px] z-30 flex h-[11px] w-[60px] justify-between px-[2px]">
              {RAILING.map((index) => (
                <span key={index} className="h-full w-[2px] bg-slate-500" />
              ))}
            </div>
            <span className="absolute -left-[48px] top-[96px] z-30 h-[4px] w-[68px] rounded-[1px] bg-slate-600 shadow-[0_3px_6px_rgba(2,6,23,0.7)]" />
          </div>

          <div className="absolute bottom-[38%] left-[10%] h-[44%] w-1 bg-slate-600">
            <span className="absolute -left-0.5 top-0 h-1.5 w-6 rounded-full bg-slate-500" />
            <span
              data-anim="blink"
              className="absolute left-3 top-1 h-2 w-3 rounded-b-full bg-yellow-100 shadow-[0_0_20px_6px_rgba(254,240,138,0.4)]"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-slate-700 to-slate-900 shadow-[0_-8px_24px_rgba(2,6,23,0.6)]" />
          <span className="absolute inset-x-0 bottom-[38%] h-[4px] bg-slate-500" />
          <span className="absolute bottom-[12%] left-[2%] h-[20%] w-[26%] rounded-full bg-yellow-100/10 blur-md" />
          <div className="absolute bottom-0 left-[calc(42%-52px)] flex h-[38%] w-[170px] justify-between">
            {ZEBRA.map((index) => (
              <span key={index} className="h-full w-[12px] -skew-x-[24deg] bg-slate-100/35" />
            ))}
          </div>
          <div
            data-anim="skid-marks"
            className="absolute bottom-[7%] left-[calc(42%+40px)] right-0 h-[10px]"
          >
            <span className="absolute inset-x-0 top-0 h-[3px] rounded-full bg-slate-950/80" />
            <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-slate-950/80" />
          </div>

          <span
            data-anim="glare"
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-l from-amber-50/30 via-amber-50/10 to-transparent opacity-0"
          />
          <span
            data-anim="brake"
            className="absolute bottom-[4%] left-0 z-10 h-[40%] w-[26%] bg-[radial-gradient(ellipse_at_left,rgba(239,68,68,0.6),transparent_70%)] opacity-0"
          />

          <div
            data-anim="walk"
            className="absolute bottom-[16%] left-[42%] z-20 h-32 w-14"
          >
            {SHOES.map((cls) => (
              <span
                key={cls}
                data-anim="shoe-off"
                className={`absolute bottom-0 opacity-0 ${shoe} ${cls}`}
              />
            ))}
            {SHOE_SMOKE.map((delay) => (
              <span
                key={delay}
                data-anim="drift"
                data-anim-delay={HIT_MS + 300 + delay}
                className="absolute bottom-[4px] left-[22px] h-3 w-3 rounded-full bg-slate-400/50 opacity-0 blur-[2px]"
              />
            ))}
          </div>

          <div
            data-anim="walk"
            className="absolute bottom-[16%] left-[42%] z-40 h-32 w-14"
          >
            <div
              data-anim="walk-bob"
              data-anim-delay={WALK_MS}
              className="absolute inset-0"
            >
              <div data-anim="tumble" className="absolute inset-0 origin-center">
                <svg
                  viewBox="-40 0 136 136"
                  className="absolute left-[-40px] top-0 h-[136px] w-[136px] overflow-visible"
                  aria-hidden="true"
                >
                  <path
                    data-anim="chalk"
                    d={CHALK_PATH}
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    className="fill-none stroke-slate-100/85"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  data-anim="leg-a"
                  className="absolute bottom-[4px] left-[14px] h-[30px] w-3 origin-top rounded-b-md bg-gradient-to-b from-blue-800 to-blue-950"
                >
                  <span
                    data-anim="shoe-on"
                    className={`absolute -bottom-[4px] -left-[2px] ${shoe}`}
                  />
                </span>
                <span
                  data-anim="leg-b"
                  className="absolute bottom-[4px] right-[14px] h-[30px] w-3 origin-top rounded-b-md bg-gradient-to-b from-blue-800 to-blue-950"
                >
                  <span
                    data-anim="shoe-on"
                    className={`absolute -bottom-[4px] -left-[2px] ${shoe}`}
                  />
                </span>
                <span className="absolute bottom-[30px] left-1 h-11 w-12 overflow-hidden rounded-t-2xl bg-gradient-to-b from-stone-500 to-stone-700">
                  <span className="absolute left-1/2 top-0 h-[14px] w-[12px] -translate-x-1/2 bg-slate-200 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                  <span className="absolute bottom-[6px] left-[8px] h-[8px] w-[9px] rounded-[2px] bg-stone-600" />
                </span>
                <SceneActor
                  character={debtor}
                  className="bottom-[64px] left-1/2 -translate-x-1/2"
                  anim="head talk"
                  animDelay={`0 ${LINE_START_MS}`}
                  animIterations={`1 ${TALK_ITERATIONS}`}
                  pose="origin-bottom"
                  size="h-12 w-12"
                >
                  <XEyes anim="dazed" />
                  <span
                    data-anim="alarm"
                    className="absolute -right-3 -top-4 z-10 text-lg font-black leading-none text-yellow-300 opacity-0 drop-shadow-[0_1px_0_rgba(2,6,23,0.8)]"
                  >
                    {'!'}
                  </span>
                </SceneActor>
                <span
                  data-anim="arm-a"
                  className="absolute bottom-[40px] left-[2px] z-30 h-[32px] w-3 origin-top rounded-full bg-stone-600"
                >
                  <span className={`${hand} -bottom-1.5 left-1/2 -translate-x-1/2`} />
                </span>
                <span
                  data-anim="arm-b"
                  className="absolute bottom-[40px] right-[2px] z-30 h-[32px] w-3 origin-top rounded-full bg-stone-600"
                >
                  <span className={`${hand} -bottom-1.5 left-1/2 -translate-x-1/2`} />
                </span>
              </div>
            </div>
          </div>

          <div
            data-anim="car-path"
            className="absolute bottom-[6%] left-[125%] z-30 h-[78px] w-[210px]"
          >
            <span
              data-anim="beam"
              className="absolute bottom-[14px] right-[calc(100%-8px)] h-[70px] w-[300px] bg-gradient-to-l from-amber-50/60 via-amber-50/15 to-transparent opacity-0 [clip-path:polygon(0_0,100%_70%,100%_84%,0_100%)]"
            />
            <div data-anim="car-skid" className="absolute inset-0 origin-bottom">
              <svg
                viewBox="0 0 210 78"
                className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_6px_10px_rgba(2,6,23,0.8)]"
                aria-hidden="true"
              >
                <path
                  d="M6 50 Q4 39 16 37 L56 33 Q70 13 96 11 L148 11 Q166 12 180 31 L198 34 Q207 36 207 46 L207 58 Q207 63 202 63 L9 63 Q4 63 4 58 Z"
                  className="fill-slate-900 stroke-slate-500"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 44 L206 44 L206 58 Q206 62 202 62 L9 62 Q5 62 5 58 Z"
                  className="fill-slate-950"
                />
                <path d="M62 33 Q74 17 96 16 L113 16 L113 33 Z" className="fill-slate-600" />
                <path d="M119 16 L147 16 Q162 17 172 33 L119 33 Z" className="fill-slate-600" />
                <path d="M70 31 L86 18 L92 18 L76 31 Z" className="fill-slate-300/30" />
                <path d="M126 31 L138 18 L142 18 L130 31 Z" className="fill-slate-300/25" />
                <circle cx="102" cy="24" r="5" className="fill-slate-950" />
                <path d="M93 33 Q94 27 102 27 Q110 27 111 33 Z" className="fill-slate-950" />
                <rect x="98" y="22.5" width="8" height="2" rx="1" className="fill-yellow-300/80" />
                <path d="M14 41 L204 41" className="stroke-yellow-300" strokeWidth="1.5" />
                <path d="M116 34 L116 61 M62 34 L64 61" className="stroke-slate-700" strokeWidth="1" />
                <rect x="96" y="45" width="10" height="2" rx="1" className="fill-slate-400" />
                <rect x="146" y="45" width="10" height="2" rx="1" className="fill-slate-400" />
                <rect x="2" y="52" width="20" height="5" rx="2" className="fill-slate-300" />
                <rect x="190" y="52" width="18" height="5" rx="2" className="fill-slate-300" />
                <ellipse cx="9" cy="44" rx="5" ry="3.5" className="fill-amber-50" />
                <rect x="202" y="38" width="5" height="7" rx="1" className="fill-red-500" />
                <circle cx="44" cy="63" r="17" className="fill-slate-950" />
                <circle cx="166" cy="63" r="17" className="fill-slate-950" />
              </svg>
              <span className="absolute bottom-[31px] left-[3px] h-[8px] w-[10px] rounded-full bg-amber-50/60 blur-[3px]" />
              <SponsorEmblem
                sponsorId="yellow"
                className="absolute bottom-[18px] left-[124px] h-[18px] w-[18px]"
              />
              <span className="absolute bottom-[38px] left-[28px] h-[18px] w-px bg-slate-300">
                <ElectionLossFlagCloth
                  party="yellow"
                  emblem={false}
                  className="absolute left-px top-0 h-[8px] w-[12px] origin-left animate-[flagwave_0.6s_ease-in-out_infinite]"
                />
              </span>
              {WHEELS.map((cls) => (
                <span
                  key={cls}
                  data-anim="wheel-spin"
                  className={`absolute bottom-0 h-[28px] w-[28px] rounded-full bg-slate-950 ring-2 ring-slate-700 ${cls}`}
                >
                  <span className="absolute inset-[5px] rounded-full bg-gradient-to-br from-slate-200 to-slate-500" />
                  <span className="absolute inset-x-[6px] top-1/2 h-[2px] -translate-y-1/2 bg-slate-600" />
                  <span className="absolute inset-y-[6px] left-1/2 w-[2px] -translate-x-1/2 bg-slate-600" />
                  <span className="absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300" />
                </span>
              ))}
            </div>
            {TIRE_SMOKE.map((delay) => (
              <span
                key={delay}
                data-anim="drift"
                data-anim-delay={FLARE_MS + 600 + delay}
                className="absolute bottom-0 right-[24px] h-5 w-5 rounded-full bg-slate-400/50 opacity-0 blur-[2px]"
              />
            ))}
          </div>

          <span
            data-anim="impact-burst"
            className="absolute bottom-[30%] left-[calc(42%+22px)] z-40 h-10 w-10 bg-yellow-200 opacity-0 [clip-path:polygon(50%_0,61%_24%,88%_6%,78%_36%,100%_48%,76%_62%,90%_94%,60%_76%,48%_100%,38%_76%,8%_92%,22%_60%,0_46%,22%_34%,12%_6%,38%_24%)]"
          />

          <div
            data-anim="card"
            className="absolute bottom-[40%] left-[-8%] z-50 h-[24px] w-[36px] opacity-0"
          >
            <span className="absolute inset-0 overflow-hidden rounded-[2px] bg-slate-50 shadow-[0_2px_6px_rgba(2,6,23,0.6)]">
              <span className="absolute inset-x-0 top-0 h-[4px] bg-slate-950" />
              <span className="absolute inset-x-0 top-[4px] h-[2px] bg-yellow-300" />
              <SponsorEmblem
                sponsorId="yellow"
                className="absolute left-[3px] top-[9px] h-[10px] w-[10px]"
              />
              <span className="absolute left-[16px] right-[4px] top-[11px] h-px bg-slate-400" />
              <span className="absolute left-[16px] right-[8px] top-[15px] h-px bg-slate-400" />
              <span className="absolute left-[16px] right-[11px] top-[19px] h-px bg-slate-400" />
            </span>
            <span
              data-anim="stamp"
              className="absolute left-1/2 top-1/2 -ml-[23px] -mt-[7px] flex h-[14px] w-[46px] items-center justify-center rounded-[2px] border-2 border-red-600 bg-slate-50/70 text-[8px] font-black tracking-[0.12em] text-red-600 opacity-0"
            >
              {STAMP_TEXT}
            </span>
          </div>
        </div>

        <span
          data-anim="impact-flash"
          className="pointer-events-none absolute inset-0 z-50 bg-slate-50 opacity-0"
        />
      </SceneFrame>
    </div>
  );
}
