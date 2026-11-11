'use client';

import { useRef } from 'react';
import CoalitionArm from '@/components/games/career/quotes/CoalitionArm';
import CoalitionAudience from '@/components/games/career/quotes/CoalitionAudience';
import CoalitionPartyFlag from '@/components/games/career/quotes/CoalitionPartyFlag';
import CoalitionPressCorps from '@/components/games/career/quotes/CoalitionPressCorps';
import CoalitionSignatory, {
  type SignatorySide as Side,
} from '@/components/games/career/quotes/CoalitionSignatory';
import CoalitionSignature from '@/components/games/career/quotes/CoalitionSignature';
import CoalitionStampMark from '@/components/games/career/quotes/CoalitionStampMark';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { GAMES_UI } from '@/data/games/locale';
import {
  SIGNATURE_INK,
  type SceneAnimationSpec,
} from '@/lib/constants/sceneAnimations';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { governmentOfVariant } from '@/lib/utils/careerElectionScenes';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 5500;
// Matches the lineStartMs of this scene's definition
const LINE_START_MS = 3000;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The definition's cues land on these: the stomp in, the gasp at the stare
// down, the handshake, the kisses, the pens, the seal, the band and the cap
const ENTER_MS = 400;
const FACE_OFF_MS = 1100;
const GASP_MS = 1200;
const STEP_BACK_MS = 1600;
const SHAKE_MS = 1800;
const HUG_MS = 2000;
const KISS_MS = [2200, 2400, 2600];
const UNHUG_MS = 2800;
const SIGN_MS = 3000;
const LIFT_MS = 3500;
const STAMP_MS = 3800;
const BAND_MS = 4200;
const CAP_MS = 4400;
const FLASH_MS = 4600;
const HOLD_FLASH_MS = 5600;

const STOMP_MS = 175;
const ENTER_PX = 230;
const BACK_PX = 14;
const HUG_PX = 12;
const PAL_PX = 6;
const SWAY_MS = 1800;

const t = (frames: [number, Keyframe][], easing?: string) =>
  sceneTimeline(TOTAL_MS, frames, easing);

const shown = (from: number, to = TOTAL_MS - 1) =>
  t(
    [
      [0, { opacity: 0 }],
      [from, { opacity: 0 }],
      [from + 1, { opacity: 1 }],
      [to, { opacity: 1 }],
      [to + 1, { opacity: 0 }],
      [TOTAL_MS, { opacity: 0 }],
    ],
    'step-end',
  );

// Each move is laid out for the leader on the left and mirrored for the
// partner coming in from the right
const stride = (side: Side) =>
  t([
    [0, { transform: `translate(${-side * ENTER_PX}px, 0px)` }],
    [ENTER_MS, { transform: `translate(${-side * ENTER_PX}px, 0px)` }],
    ...Array.from(
      { length: Math.floor((FACE_OFF_MS - ENTER_MS) / STOMP_MS) },
      (_, step): [number, Keyframe] => {
        const at = ENTER_MS + STOMP_MS * (step + 0.5);
        const x = -side * ENTER_PX * (1 - (at - ENTER_MS) / (FACE_OFF_MS - ENTER_MS));
        return [at, { transform: `translate(${x}px, -4px)` }];
      },
    ),
    [FACE_OFF_MS, { transform: 'translate(0px, 0px)' }],
    [STEP_BACK_MS, { transform: 'translate(0px, 0px)' }],
    [SHAKE_MS - 100, { transform: `translate(${-side * BACK_PX}px, 0px)` }],
    [HUG_MS - 40, { transform: `translate(${-side * BACK_PX}px, 0px)` }],
    [HUG_MS + 80, { transform: `translate(${side * HUG_PX}px, -3px)` }],
    [UNHUG_MS - 100, { transform: `translate(${side * HUG_PX}px, -3px)` }],
    [UNHUG_MS + 100, { transform: `translate(${-side * BACK_PX}px, 0px)` }],
    [BAND_MS - 100, { transform: `translate(${-side * BACK_PX}px, 0px)` }],
    [BAND_MS + 50, { transform: `translate(${side * PAL_PX}px, 0px)` }],
    [TOTAL_MS, { transform: `translate(${side * PAL_PX}px, 0px)` }],
  ]);

const head = (side: Side) => {
  const pose = (x: number, y: number, deg: number): Keyframe => ({
    transform: `translate(${side * x}px, ${y}px) rotate(${side * deg}deg)`,
  });
  return t([
    [0, pose(0, 0, 10)],
    [FACE_OFF_MS, pose(0, 0, 10)],
    [GASP_MS - 60, pose(3, 2, 16)],
    [GASP_MS + 100, pose(2, 2, 13)],
    [GASP_MS + 200, pose(4, 2, 16)],
    [GASP_MS + 300, pose(2, 2, 13)],
    [GASP_MS + 400, pose(4, 2, 16)],
    [STEP_BACK_MS, pose(0, 0, 8)],
    [SHAKE_MS, pose(-2, -2, -12)],
    [HUG_MS - 40, pose(-2, -2, -12)],
    [HUG_MS + 80, pose(0, 0, 6)],
    ...KISS_MS.flatMap((at, index): [number, Keyframe][] => {
      const lead = (index % 2 === 0) === (side === 1);
      return [
        [at - 60, pose(lead ? 5 : 1, lead ? -6 : 2, lead ? 14 : -4)],
        [at + 60, pose(0, 0, 4)],
      ];
    }),
    [UNHUG_MS, pose(0, 0, 4)],
    [SIGN_MS - 100, pose(1, 5, 12)],
    [LIFT_MS, pose(1, 5, 12)],
    [STAMP_MS - 100, pose(0, -2, 0)],
    [STAMP_MS, pose(1, 4, 10)],
    [BAND_MS, pose(1, 4, 10)],
    [BAND_MS + 150, pose(2, -3, 10)],
    [TOTAL_MS, pose(2, -3, 10)],
  ]);
};

// The arm on the side that faces the other man: it shakes, signs and
// carries the seal. Angles are the leader's, mirrored for the partner
const innerArm = (side: Side) => {
  const pose = (deg: number, scale = 1): Keyframe => ({
    transform: `rotate(${side === 1 ? deg : 180 - deg}deg) scaleX(${scale})`,
  });
  return t([
    [0, pose(95)],
    [SHAKE_MS - 150, pose(95)],
    [SHAKE_MS - 30, pose(12, 0.86)],
    [SHAKE_MS + 50, pose(2, 0.86)],
    [SHAKE_MS + 100, pose(20, 0.86)],
    [SHAKE_MS + 150, pose(2, 0.86)],
    [HUG_MS - 40, pose(12, 0.86)],
    [HUG_MS + 40, pose(95)],
    [UNHUG_MS + 50, pose(95)],
    [SIGN_MS - 60, pose(62)],
    [SIGN_MS + 90, pose(54)],
    [SIGN_MS + 180, pose(66)],
    [SIGN_MS + 270, pose(54)],
    [SIGN_MS + 360, pose(66)],
    [SIGN_MS + 450, pose(60)],
    [LIFT_MS, pose(60)],
    [LIFT_MS + 200, pose(-32, 0.94)],
    [STAMP_MS - 80, pose(-40, 0.98)],
    [STAMP_MS, pose(38)],
    [STAMP_MS + 200, pose(38)],
    [BAND_MS - 120, pose(95)],
    [TOTAL_MS, pose(95)],
  ]);
};

// The other arm only comes up with a tumbler or the bottle
const outerArm = (side: Side) => {
  const pose = (deg: number): Keyframe => ({
    transform: `rotate(${side === 1 ? deg : 180 - deg}deg)`,
  });
  return t([
    [0, pose(85)],
    [BAND_MS, pose(85)],
    [BAND_MS + 180, pose(-140)],
    [TOTAL_MS, pose(-140)],
  ]);
};

const CUSTOM: Record<string, SceneAnimationSpec> = {
  ink: SIGNATURE_INK,
  seal: {
    keyframes: [
      { opacity: 0, transform: 'scale(1.8)' },
      { opacity: 1, transform: 'scale(0.9)', offset: 0.5 },
      { opacity: 1, transform: 'scale(1)' },
    ],
    options: { duration: 160, easing: 'ease-out', fill: 'both' },
  },
  'leader-stride': stride(1),
  'partner-stride': stride(-1),
  'leader-head': head(1),
  'partner-head': head(-1),
  'leader-inner': innerArm(1),
  'partner-inner': innerArm(-1),
  'leader-outer': outerArm(1),
  'partner-outer': outerArm(-1),
  fury: shown(ENTER_MS, STEP_BACK_MS + 200),
  bolt: t(
    [
      [0, { opacity: 0, transform: 'scale(0.6)' }],
      [GASP_MS - 40, { opacity: 0, transform: 'scale(0.6)' }],
      [GASP_MS, { opacity: 1, transform: 'scale(1.2)' }],
      [GASP_MS + 120, { opacity: 0.4, transform: 'scale(0.9)' }],
      [GASP_MS + 200, { opacity: 1, transform: 'scale(1.1)' }],
      [GASP_MS + 330, { opacity: 0.5, transform: 'scale(0.9)' }],
      [GASP_MS + 360, { opacity: 1, transform: 'scale(1.1)' }],
      [STEP_BACK_MS, { opacity: 0, transform: 'scale(0.6)' }],
      [TOTAL_MS, { opacity: 0, transform: 'scale(0.6)' }],
    ],
    'linear',
  ),
  gasp: t([
    [0, { transform: 'translateY(0px)' }],
    [GASP_MS - 30, { transform: 'translateY(0px)' }],
    [GASP_MS + 70, { transform: 'translateY(-12px)' }],
    [GASP_MS + 500, { transform: 'translateY(-9px)' }],
    [HUG_MS + 100, { transform: 'translateY(-9px)' }],
    [HUG_MS + 400, { transform: 'translateY(0px)' }],
    [TOTAL_MS, { transform: 'translateY(0px)' }],
  ]),
  'hug-arms': shown(HUG_MS + 40, UNHUG_MS - 80),
  pat: {
    keyframes: [
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-3px)' },
      { transform: 'translateY(0px)' },
    ],
    options: { duration: 260, iterations: 5, easing: 'ease-in-out' },
  },
  smack: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.3)' },
      { opacity: 1, transform: 'scale(1.3)', offset: 0.25 },
      { opacity: 1, transform: 'scale(1)', offset: 0.6 },
      { opacity: 0, transform: 'scale(1.1) translateY(-8px)' },
    ],
    options: { duration: 420, easing: 'ease-out', fill: 'both' },
  },
  'seal-tool': t([
    [0, { opacity: 0, transform: 'translateY(0px)' }],
    [LIFT_MS + 100, { opacity: 0, transform: 'translateY(0px)' }],
    [LIFT_MS + 200, { opacity: 1, transform: 'translateY(0px)' }],
    [STAMP_MS - 80, { opacity: 1, transform: 'translateY(-8px)' }],
    [STAMP_MS, { opacity: 1, transform: 'translateY(30px)' }],
    [STAMP_MS + 200, { opacity: 1, transform: 'translateY(30px)' }],
    [STAMP_MS + 260, { opacity: 0, transform: 'translateY(16px)' }],
    [TOTAL_MS, { opacity: 0, transform: 'translateY(16px)' }],
  ]),
  thump: t([
    [0, { transform: 'translateY(0px)' }],
    [STAMP_MS, { transform: 'translateY(0px)' }],
    [STAMP_MS + 50, { transform: 'translateY(2px)' }],
    [STAMP_MS + 160, { transform: 'translateY(0px)' }],
    [TOTAL_MS, { transform: 'translateY(0px)' }],
  ]),
  toast: shown(BAND_MS),
  pen: shown(SIGN_MS - 200, LIFT_MS),
  steam: {
    keyframes: [
      { opacity: 0, transform: 'translateY(4px) scale(0.5)' },
      { opacity: 1, transform: 'translateY(-4px) scale(1)', offset: 0.3 },
      { opacity: 0, transform: 'translateY(-22px) scale(1.5)' },
    ],
    options: { duration: 600, iterations: Infinity, easing: 'ease-out' },
  },
  cap: t([
    [0, { opacity: 0, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [CAP_MS - 1, { opacity: 0, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [CAP_MS, { opacity: 1, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [CAP_MS + 500, { opacity: 1, transform: 'translate(0px, -150px) rotate(720deg)' }],
    [CAP_MS + 501, { opacity: 0, transform: 'translate(0px, -150px) rotate(720deg)' }],
    [TOTAL_MS, { opacity: 0, transform: 'translate(0px, -150px) rotate(720deg)' }],
  ], 'ease-out'),
  'cap-on': shown(BAND_MS, CAP_MS - 1),
  fizz: {
    keyframes: [
      { opacity: 0, transform: 'translate(0px, 0px) scale(0.4)' },
      { opacity: 1, transform: 'translate(0px, -10px) scale(1)', offset: 0.3 },
      { opacity: 0, transform: 'translate(0px, -26px) scale(0.6)' },
    ],
    options: { duration: 700, iterations: 3, easing: 'ease-out', fill: 'backwards' },
  },
  'duo-sway': {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(4deg)', offset: 0.25 },
      { transform: 'rotate(0deg)', offset: 0.5 },
      { transform: 'rotate(-4deg)', offset: 0.75 },
      { transform: 'rotate(0deg)' },
    ],
    options: { duration: SWAY_MS * 2, iterations: Infinity, easing: 'ease-in-out' },
  },
  singing: shown(BAND_MS + 150),
  mouth: {
    keyframes: [
      { transform: 'scaleY(0.35)' },
      { transform: 'scaleY(1)' },
      { transform: 'scaleY(0.5)' },
      { transform: 'scaleY(1.1)' },
      { transform: 'scaleY(0.35)' },
    ],
    options: { duration: SWAY_MS, iterations: Infinity, easing: 'ease-in-out' },
  },
};

const NOTES = [
  { cls: 'left-[112px] bottom-[128px]', glyph: '♪', delay: BAND_MS + 300 },
  { cls: 'left-[222px] bottom-[134px]', glyph: '♫', delay: BAND_MS + 650 },
  { cls: 'left-[136px] bottom-[142px]', glyph: '♫', delay: BAND_MS + 1100 },
  { cls: 'left-[198px] bottom-[124px]', glyph: '♪', delay: BAND_MS + 1450 },
  { cls: 'left-[166px] bottom-[150px]', glyph: '♪', delay: BAND_MS + 1800 },
];

const LIPS = [
  'left-[160px] bottom-[128px] -rotate-12',
  'left-[168px] bottom-[110px] rotate-12',
  'left-[158px] bottom-[132px] -rotate-6',
];

export default function CoalitionReconciliationScene({
  speaker,
  other = speaker,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const government = governmentOfVariant(variant);
  const [leaderParty = 'red', partnerParty = 'blue'] = government;
  const flags = government.length > 0 ? government : [leaderParty, partnerParty];
  useSceneAnimation(root, CUSTOM, [speaker, other, variant]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-red-950/60 via-slate-900 to-slate-900"
        floor="bg-gradient-to-b from-red-950 to-slate-900"
      >
        <span className="absolute inset-x-0 bottom-[18%] top-0 bg-[repeating-linear-gradient(90deg,rgba(127,29,29,0.3)_0px,rgba(127,29,29,0.08)_13px,rgba(127,29,29,0.3)_26px)]" />
        <span className="absolute inset-y-0 left-[3%] w-[5%] bg-gradient-to-r from-slate-800 to-slate-700/60" />
        <span className="absolute inset-y-0 right-[3%] w-[5%] bg-gradient-to-l from-slate-800 to-slate-700/60" />
        <div className="absolute bottom-0 left-1/2 h-full w-[340px] -translate-x-1/2">
          <div className="absolute left-[84px] top-[10px] flex h-[30px] w-[202px] items-center justify-between gap-1 rounded-[3px] border-2 border-red-700 bg-amber-50 px-1 shadow-lg">
            <SponsorEmblem sponsorId={leaderParty} className="h-[18px] w-[18px] shrink-0" />
            <span className="text-center text-[10px] font-black uppercase leading-none text-red-800">
              {GAMES_UI.career.quoteCutscene.reconciliationBanner}
            </span>
            <SponsorEmblem sponsorId={partnerParty} className="h-[18px] w-[18px] shrink-0" />
          </div>
          <span className="absolute left-[90px] top-[38px] h-[6px] w-[190px] bg-[repeating-linear-gradient(90deg,var(--color-amber-300)_0px,var(--color-amber-300)_3px,transparent_3px,transparent_6px)]" />

          {flags.map((party, index) => (
            <CoalitionPartyFlag
              key={party}
              party={party}
              className={`bottom-[22px] h-[150px] ${
                index === 0
                  ? 'left-[28px]'
                  : index === 1
                    ? 'left-[276px]'
                    : 'left-[62px]'
              }`}
            />
          ))}

          <div className="absolute inset-0">
            <div data-anim="duo-sway" data-anim-delay={BAND_MS} className="absolute inset-0 origin-[170px_calc(100%-60px)]">
              <CoalitionSignatory side={1} party={leaderParty} slug={speaker} enterMs={ENTER_MS} capMs={CAP_MS} swayMs={SWAY_MS} />
              <CoalitionSignatory side={-1} party={partnerParty} slug={other} enterMs={ENTER_MS} capMs={CAP_MS} swayMs={SWAY_MS} />

              <div data-anim="hug-arms" className="absolute inset-0 z-30 opacity-0">
                <span data-anim="pat" data-anim-delay={HUG_MS + 100} className="absolute inset-0">
                  <CoalitionArm party={leaderParty} className="bottom-[94px] left-[190px] w-[20px] [transform:rotate(-35deg)]" />
                </span>
                <span data-anim="pat" data-anim-delay={HUG_MS + 230} className="absolute inset-0">
                  <CoalitionArm party={partnerParty} className="bottom-[94px] left-[146px] w-[20px] [transform:rotate(215deg)]" />
                </span>
              </div>

              {NOTES.map((note) => (
                <span
                  key={note.cls}
                  data-anim="float-up"
                  data-anim-delay={note.delay}
                  className={`absolute z-40 text-xl font-black text-amber-200 opacity-0 drop-shadow ${note.cls}`}
                >
                  {note.glyph}
                </span>
              ))}
            </div>

            <span data-anim="bolt" className="absolute bottom-[112px] left-[160px] z-40 h-[34px] w-[20px] bg-amber-300 opacity-0 shadow-[0_0_14px_rgba(252,211,77,0.9)] [clip-path:polygon(55%_0,20%_52%,48%_52%,30%_100%,85%_40%,55%_40%,75%_0)]" />
            {LIPS.map((cls, index) => (
              <svg
                key={cls}
                viewBox="0 0 14 9"
                aria-hidden="true"
                data-anim="smack"
                data-anim-delay={KISS_MS[index]}
                className={`absolute z-40 h-[11px] w-[18px] opacity-0 ${cls}`}
              >
                <path d="M1 4.5Q4 0 7 2.5 10 0 13 4.5 7 10 1 4.5Z" className="fill-red-500" />
                <path d="M2 4.5Q7 6 12 4.5" className="fill-none stroke-red-900" strokeWidth="0.8" />
              </svg>
            ))}
          </div>

          <div data-anim="thump" className="absolute bottom-[18px] left-[70px] z-30 h-[50px] w-[200px]">
            <span className="absolute inset-x-[-4px] top-0 h-[9px] rounded-[2px] bg-slate-200 ring-1 ring-slate-950/30" />
            <span className="absolute inset-x-0 bottom-0 top-[8px] bg-slate-100 bg-[repeating-linear-gradient(90deg,rgba(2,6,23,0)_0px,rgba(2,6,23,0.08)_9px,rgba(2,6,23,0)_18px)]">
              <span className="absolute inset-x-0 top-[6px] flex items-center justify-center gap-1.5">
                <SponsorEmblem sponsorId={leaderParty} className="h-5 w-5" />
                <span className="h-[3px] w-[10px] rounded-full bg-amber-400" />
                <SponsorEmblem sponsorId={partnerParty} className="h-5 w-5" />
              </span>
            </span>
            <span className="absolute left-[78px] top-[-4px] block h-[12px] w-[44px] rounded-[1px] bg-amber-50 shadow ring-1 ring-slate-400">
              <span className="absolute left-[3px] right-[3px] top-[2px] h-px bg-slate-400" />
              <CoalitionSignature stroke={0} animDelay={SIGN_MS} className="bottom-0 left-[1px] h-[7px] w-[17px]" />
              <CoalitionSignature stroke={2} animDelay={SIGN_MS + 80} className="bottom-0 right-[1px] h-[7px] w-[17px]" />
              <CoalitionStampMark animDelay={STAMP_MS} className="left-[15px] top-[-2px] h-[14px] w-[14px]" />
            </span>
          </div>

          <span data-anim="seal-tool" className="absolute bottom-[96px] left-[160px] z-40 block h-[26px] w-[20px] opacity-0">
            <span className="absolute left-[6px] top-0 h-[10px] w-[8px] rounded-full bg-amber-700 ring-1 ring-slate-950/50" />
            <span className="absolute left-[8px] top-[9px] h-[8px] w-[4px] bg-amber-800" />
            <span className="absolute bottom-0 left-0 h-[9px] w-[20px] rounded-[2px] bg-slate-700 ring-1 ring-red-600" />
          </span>
        </div>

        <CoalitionAudience anim="gasp" />
        <CoalitionPressCorps barrages={[FLASH_MS]} holdFrom={HOLD_FLASH_MS} />
      </SceneFrame>
    </div>
  );
}
