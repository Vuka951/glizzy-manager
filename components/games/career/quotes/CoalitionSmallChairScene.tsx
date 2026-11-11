'use client';

import { useRef } from 'react';
import CoalitionArm from '@/components/games/career/quotes/CoalitionArm';
import CoalitionFolder from '@/components/games/career/quotes/CoalitionFolder';
import CoalitionPartyFlag from '@/components/games/career/quotes/CoalitionPartyFlag';
import CoalitionPressCorps from '@/components/games/career/quotes/CoalitionPressCorps';
import CoalitionSignature from '@/components/games/career/quotes/CoalitionSignature';
import CoalitionStampMark from '@/components/games/career/quotes/CoalitionStampMark';
import CoalitionSuit from '@/components/games/career/quotes/CoalitionSuit';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import PortraitHead from '@/components/games/PortraitHead';
import {
  SIGNATURE_INK,
  type SceneAnimationSpec,
} from '@/lib/constants/sceneAnimations';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { governmentOfVariant } from '@/lib/utils/careerElectionScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 4500;
// Matches the lineStartMs of this scene's definition
const LINE_START_MS = 3000;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The definition's cues land on these: footsteps on the walk in, the creak
// as he sits, the flashes and the music, the leader's pen, the folder
// sliding over the floor, the pen on the knee, the handshake, the seal
const WALK_IN_MS = 300;
const ARRIVE_MS = 1000;
const LOOK_MS = 1050;
const SIT_MS = 1400;
const FLASH_MS = 2000;
const PEN_OUT_MS = 2600;
const SIGN_MS = 3000;
const FLOURISH_MS = 3500;
const REACH_MS = 3100;
const PUSH_MS = 4500;
const LANDED_MS = 4950;
const KNEE_SIGN_MS = 5000;
const RISE_MS = 5450;
const WALK_OVER_MS = 5500;
const AT_DESK_MS = 5950;
const SHAKE_MS = 6000;
const PHOTO_MS = 6100;
const RELEASE_MS = 6400;
const STAMP_MS = 6600;
const REGRIP_MS = 6900;
const HOLD_FLASH_MS = 7000;

const STEP_MS = 140;
// Where his box stands: walked in, slid onto the little chair, at the desk
const IN_X = -170;
const CHAIR_X = -34;
const DESK_X = 76;
const SEAT_DROP_PX = 10;

const t = (frames: [number, Keyframe][], easing?: string) =>
  sceneTimeline(TOTAL_MS, frames, easing);

const steps = (from: number, to: number, side: 1 | -1) => {
  const count = Math.floor((to - from) / STEP_MS);
  return Array.from({ length: count }, (_, step): [number, Keyframe] => [
    from + STEP_MS * (step + 0.5),
    { transform: `rotate(${side * (step % 2 ? -22 : 22)}deg)` },
  ]);
};

const leg = (side: 1 | -1) =>
  t([
    [0, { transform: 'rotate(0deg)' }],
    [WALK_IN_MS, { transform: 'rotate(0deg)' }],
    ...steps(WALK_IN_MS, ARRIVE_MS, side),
    [ARRIVE_MS, { transform: 'rotate(0deg)' }],
    [LOOK_MS + 250, { transform: 'rotate(0deg)' }],
    [LOOK_MS + 300, { transform: `rotate(${side * -14}deg)` }],
    [SIT_MS - 50, { transform: 'rotate(0deg)' }],
    [WALK_OVER_MS, { transform: 'rotate(0deg)' }],
    ...steps(WALK_OVER_MS, AT_DESK_MS, side),
    [AT_DESK_MS, { transform: 'rotate(0deg)' }],
    [TOTAL_MS, { transform: 'rotate(0deg)' }],
  ]);

const shown = (spans: [number, number][]) =>
  t(
    [
      [0, { opacity: 0 }],
      ...spans.flatMap(([from, to]): [number, Keyframe][] => [
        [from, { opacity: 0 }],
        [from + 1, { opacity: 1 }],
        [to, { opacity: 1 }],
        [to + 1, { opacity: 0 }],
      ]),
      [TOTAL_MS, { opacity: 0 }],
    ],
    'step-end',
  );

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
  'partner-walk': t([
    [0, { transform: `translateX(${IN_X}px)` }],
    [WALK_IN_MS, { transform: `translateX(${IN_X}px)` }],
    [ARRIVE_MS, { transform: 'translateX(0px)' }],
    [LOOK_MS + 250, { transform: 'translateX(0px)' }],
    [SIT_MS - 60, { transform: `translateX(${CHAIR_X}px)` }],
    [WALK_OVER_MS, { transform: `translateX(${CHAIR_X}px)` }],
    [AT_DESK_MS, { transform: `translateX(${DESK_X}px)` }],
    [TOTAL_MS, { transform: `translateX(${DESK_X}px)` }],
  ], 'linear'),
  'leg-lead': leg(1),
  'leg-trail': leg(-1),
  'legs-standing': shown([
    [0, SIT_MS - 40],
    [RISE_MS, TOTAL_MS - 1],
  ]),
  'legs-seated': shown([[SIT_MS - 40, RISE_MS]]),
  'partner-body': t([
    [0, { transform: 'translateY(0px) rotate(0deg)' }],
    [SIT_MS - 120, { transform: 'translateY(0px) rotate(0deg)' }],
    [SIT_MS, { transform: `translateY(${SEAT_DROP_PX + 2}px) rotate(0deg)` }],
    [SIT_MS + 120, { transform: `translateY(${SEAT_DROP_PX}px) rotate(0deg)` }],
    [REACH_MS, { transform: `translateY(${SEAT_DROP_PX}px) rotate(0deg)` }],
    [REACH_MS + 300, { transform: `translateY(${SEAT_DROP_PX}px) rotate(14deg)` }],
    [PUSH_MS, { transform: `translateY(${SEAT_DROP_PX}px) rotate(16deg)` }],
    [PUSH_MS + 250, { transform: `translateY(${SEAT_DROP_PX}px) rotate(0deg)` }],
    [LANDED_MS - 80, { transform: `translateY(${SEAT_DROP_PX}px) rotate(0deg)` }],
    [LANDED_MS, { transform: `translateY(${SEAT_DROP_PX}px) rotate(22deg)` }],
    [KNEE_SIGN_MS + 60, { transform: `translateY(${SEAT_DROP_PX}px) rotate(6deg)` }],
    [RISE_MS - 30, { transform: `translateY(${SEAT_DROP_PX}px) rotate(6deg)` }],
    [RISE_MS + 40, { transform: 'translateY(0px) rotate(0deg)' }],
    [TOTAL_MS, { transform: 'translateY(0px) rotate(0deg)' }],
  ]),
  'partner-head': t([
    [0, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [ARRIVE_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [LOOK_MS, { transform: 'translate(-3px, 0px) rotate(-14deg)' }],
    [LOOK_MS + 160, { transform: 'translate(-3px, 0px) rotate(-14deg)' }],
    [LOOK_MS + 260, { transform: 'translate(3px, 0px) rotate(12deg)' }],
    [SIT_MS - 20, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [SIT_MS + 60, { transform: 'translate(0px, 3px) rotate(-6deg)' }],
    [SIT_MS + 220, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [FLASH_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [FLASH_MS + 80, { transform: 'translate(-3px, 1px) rotate(-12deg)' }],
    [FLASH_MS + 600, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [REACH_MS + 300, { transform: 'translate(2px, -2px) rotate(8deg)' }],
    [REACH_MS + 500, { transform: 'translate(4px, -2px) rotate(12deg)' }],
    [REACH_MS + 700, { transform: 'translate(2px, -2px) rotate(8deg)' }],
    [REACH_MS + 900, { transform: 'translate(4px, -2px) rotate(12deg)' }],
    [REACH_MS + 1100, { transform: 'translate(2px, -2px) rotate(8deg)' }],
    [PUSH_MS, { transform: 'translate(4px, -2px) rotate(12deg)' }],
    [PUSH_MS + 200, { transform: 'translate(0px, 0px) rotate(-4deg)' }],
    [LANDED_MS, { transform: 'translate(0px, 0px) rotate(10deg)' }],
    [RISE_MS, { transform: 'translate(0px, 0px) rotate(6deg)' }],
    [RISE_MS + 100, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PHOTO_MS - 40, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PHOTO_MS + 100, { transform: 'translate(-2px, -2px) rotate(-8deg)' }],
    [TOTAL_MS, { transform: 'translate(-2px, -2px) rotate(-8deg)' }],
  ]),
  'partner-arm': t([
    [0, { transform: 'rotate(80deg) scaleX(1)' }],
    [PEN_OUT_MS, { transform: 'rotate(80deg) scaleX(1)' }],
    [PEN_OUT_MS + 200, { transform: 'rotate(20deg) scaleX(1)' }],
    [REACH_MS, { transform: 'rotate(20deg) scaleX(1)' }],
    [REACH_MS + 300, { transform: 'rotate(-8deg) scaleX(1.3)' }],
    [REACH_MS + 500, { transform: 'rotate(-4deg) scaleX(1.38)' }],
    [REACH_MS + 700, { transform: 'rotate(-8deg) scaleX(1.32)' }],
    [REACH_MS + 900, { transform: 'rotate(-4deg) scaleX(1.4)' }],
    [REACH_MS + 1100, { transform: 'rotate(-8deg) scaleX(1.32)' }],
    [PUSH_MS, { transform: 'rotate(-6deg) scaleX(1.4)' }],
    [PUSH_MS + 250, { transform: 'rotate(30deg) scaleX(1)' }],
    [LANDED_MS - 80, { transform: 'rotate(30deg) scaleX(1)' }],
    [LANDED_MS, { transform: 'rotate(34deg) scaleX(1.35)' }],
    [KNEE_SIGN_MS, { transform: 'rotate(10deg) scaleX(1)' }],
    [KNEE_SIGN_MS + 100, { transform: 'rotate(4deg) scaleX(1)' }],
    [KNEE_SIGN_MS + 200, { transform: 'rotate(14deg) scaleX(1)' }],
    [KNEE_SIGN_MS + 300, { transform: 'rotate(4deg) scaleX(1)' }],
    [KNEE_SIGN_MS + 400, { transform: 'rotate(10deg) scaleX(1)' }],
    [RISE_MS, { transform: 'rotate(30deg) scaleX(1)' }],
    [AT_DESK_MS - 150, { transform: 'rotate(30deg) scaleX(1)' }],
    [AT_DESK_MS, { transform: 'rotate(-34deg) scaleX(1.05)' }],
    [SHAKE_MS + 80, { transform: 'rotate(-30deg) scaleX(1.05)' }],
    [SHAKE_MS + 160, { transform: 'rotate(-38deg) scaleX(1.05)' }],
    [SHAKE_MS + 240, { transform: 'rotate(-30deg) scaleX(1.05)' }],
    [RELEASE_MS, { transform: 'rotate(-34deg) scaleX(1.05)' }],
    [REGRIP_MS, { transform: 'rotate(-34deg) scaleX(1.05)' }],
    [REGRIP_MS + 80, { transform: 'rotate(-30deg) scaleX(1.05)' }],
    [REGRIP_MS + 160, { transform: 'rotate(-36deg) scaleX(1.05)' }],
    [REGRIP_MS + 240, { transform: 'rotate(-34deg) scaleX(1.05)' }],
    [TOTAL_MS, { transform: 'rotate(-34deg) scaleX(1.05)' }],
  ]),
  'partner-pen': shown([[PEN_OUT_MS + 100, RISE_MS]]),
  'knee-folder': shown([[KNEE_SIGN_MS - 30, RISE_MS]]),
  'hand-folder': shown([[RISE_MS, AT_DESK_MS]]),
  'chair-creak': t([
    [0, { transform: 'scaleY(1) rotate(0deg)' }],
    [SIT_MS - 20, { transform: 'scaleY(1) rotate(0deg)' }],
    [SIT_MS + 40, { transform: 'scaleY(0.8) rotate(0deg)' }],
    [SIT_MS + 140, { transform: 'scaleY(1.05) rotate(-4deg)' }],
    [SIT_MS + 260, { transform: 'scaleY(1) rotate(3deg)' }],
    [SIT_MS + 380, { transform: 'scaleY(1) rotate(0deg)' }],
    [REACH_MS + 300, { transform: 'scaleY(1) rotate(0deg)' }],
    [REACH_MS + 500, { transform: 'scaleY(1) rotate(9deg)' }],
    [PUSH_MS, { transform: 'scaleY(1) rotate(10deg)' }],
    [PUSH_MS + 200, { transform: 'scaleY(1) rotate(0deg)' }],
    [TOTAL_MS, { transform: 'scaleY(1) rotate(0deg)' }],
  ]),
  'leader-head': t([
    [0, { transform: 'translateY(0px) rotate(0deg)' }],
    [SIT_MS, { transform: 'translateY(0px) rotate(0deg)' }],
    [SIT_MS + 200, { transform: 'translateY(0px) rotate(-8deg)' }],
    [FLASH_MS, { transform: 'translateY(0px) rotate(-8deg)' }],
    [FLASH_MS + 150, { transform: 'translateY(-3px) rotate(4deg)' }],
    [SIGN_MS, { transform: 'translateY(2px) rotate(-4deg)' }],
    [FLOURISH_MS, { transform: 'translateY(2px) rotate(-4deg)' }],
    [FLOURISH_MS + 200, { transform: 'translateY(-4px) rotate(8deg)' }],
    [PUSH_MS, { transform: 'translateY(-4px) rotate(8deg)' }],
    [PUSH_MS + 150, { transform: 'translateY(0px) rotate(-6deg)' }],
    [SHAKE_MS - 100, { transform: 'translateY(0px) rotate(-6deg)' }],
    [PHOTO_MS, { transform: 'translateY(-3px) rotate(6deg)' }],
    [TOTAL_MS, { transform: 'translateY(-3px) rotate(6deg)' }],
  ]),
  'leader-pen-arm': t([
    [0, { transform: 'rotate(76deg) scaleX(1)' }],
    [PEN_OUT_MS, { transform: 'rotate(76deg) scaleX(1)' }],
    [SIGN_MS - 100, { transform: 'rotate(128deg) scaleX(1.2)' }],
    [SIGN_MS + 75, { transform: 'rotate(134deg) scaleX(1.25)' }],
    [SIGN_MS + 150, { transform: 'rotate(124deg) scaleX(1.2)' }],
    [SIGN_MS + 225, { transform: 'rotate(132deg) scaleX(1.25)' }],
    [SIGN_MS + 300, { transform: 'rotate(122deg) scaleX(1.18)' }],
    [SIGN_MS + 375, { transform: 'rotate(130deg) scaleX(1.22)' }],
    [FLOURISH_MS - 50, { transform: 'rotate(104deg) scaleX(1.15)' }],
    [FLOURISH_MS + 120, { transform: 'rotate(-70deg) scaleX(1)' }],
    [FLOURISH_MS + 600, { transform: 'rotate(-62deg) scaleX(1)' }],
    [FLOURISH_MS + 900, { transform: 'rotate(76deg) scaleX(1)' }],
    [TOTAL_MS, { transform: 'rotate(76deg) scaleX(1)' }],
  ]),
  'leader-free-arm': t([
    [0, { transform: 'rotate(104deg) scaleX(1)' }],
    [PUSH_MS - 250, { transform: 'rotate(104deg) scaleX(1)' }],
    [PUSH_MS - 60, { transform: 'rotate(108deg) scaleX(1.05)' }],
    [PUSH_MS + 120, { transform: 'rotate(170deg) scaleX(1.25)' }],
    [PUSH_MS + 400, { transform: 'rotate(104deg) scaleX(1)' }],
    [AT_DESK_MS - 100, { transform: 'rotate(104deg) scaleX(1)' }],
    [AT_DESK_MS, { transform: 'rotate(152deg) scaleX(1.2)' }],
    [SHAKE_MS + 80, { transform: 'rotate(148deg) scaleX(1.2)' }],
    [SHAKE_MS + 160, { transform: 'rotate(156deg) scaleX(1.2)' }],
    [SHAKE_MS + 240, { transform: 'rotate(148deg) scaleX(1.2)' }],
    [RELEASE_MS, { transform: 'rotate(152deg) scaleX(1.2)' }],
    [STAMP_MS - 120, { transform: 'rotate(110deg) scaleX(0.9)' }],
    [STAMP_MS, { transform: 'rotate(134deg) scaleX(1.1)' }],
    [STAMP_MS + 200, { transform: 'rotate(134deg) scaleX(1.1)' }],
    [REGRIP_MS - 60, { transform: 'rotate(150deg) scaleX(1.2)' }],
    [REGRIP_MS + 80, { transform: 'rotate(148deg) scaleX(1.2)' }],
    [REGRIP_MS + 160, { transform: 'rotate(156deg) scaleX(1.2)' }],
    [REGRIP_MS + 240, { transform: 'rotate(152deg) scaleX(1.2)' }],
    [TOTAL_MS, { transform: 'rotate(152deg) scaleX(1.2)' }],
  ]),
  'leader-pen': shown([[PEN_OUT_MS, FLOURISH_MS + 900]]),
  'leader-stamp': shown([[RELEASE_MS + 40, STAMP_MS + 250]]),
  'desk-folder': t([
    [0, { opacity: 1, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PUSH_MS, { opacity: 1, transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PUSH_MS + 130, { opacity: 1, transform: 'translate(-56px, 0px) rotate(0deg)' }],
    [PUSH_MS + 230, { opacity: 1, transform: 'translate(-84px, 44px) rotate(-30deg)' }],
    [PUSH_MS + 270, { opacity: 1, transform: 'translate(-90px, 44px) rotate(0deg)' }],
    [LANDED_MS, { opacity: 1, transform: 'translate(-150px, 44px) rotate(0deg)' }],
    [KNEE_SIGN_MS - 31, { opacity: 1, transform: 'translate(-150px, 44px) rotate(0deg)' }],
    [KNEE_SIGN_MS - 30, { opacity: 0, transform: 'translate(-150px, 44px) rotate(0deg)' }],
    [TOTAL_MS, { opacity: 0, transform: 'translate(-150px, 44px) rotate(0deg)' }],
  ], 'ease-out'),
  'signed-folder': shown([[AT_DESK_MS, TOTAL_MS - 1]]),
};

const PANES = Array.from({ length: 8 }, (_, index) => index);

// Spread the government's standards behind the desk, leader's first
const FLAG_SPOTS = [
  ['left-[178px]'],
  ['left-[178px]', 'left-[290px]'],
  ['left-[170px]', 'left-[290px]', 'left-[310px]'],
];

export default function CoalitionSmallChairScene({
  speaker,
  other = speaker,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const leader = characterBySlug(speaker);
  const partner = characterBySlug(other);
  const government = governmentOfVariant(variant);
  const [leaderParty = 'red', partnerParty = 'blue'] = government;
  const flags = government.length > 0 ? government : [leaderParty, partnerParty];
  useSceneAnimation(root, CUSTOM, [speaker, other, variant]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-900"
        floor="bg-gradient-to-b from-sky-950 to-slate-900"
      >
        <span className="absolute inset-x-0 bottom-[44%] top-0 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_86px,rgba(251,191,36,0.07)_86px,rgba(251,191,36,0.07)_100px)] bg-center" />
        <span className="absolute inset-x-0 bottom-[18%] h-[26%] border-t-2 border-amber-200/20 bg-amber-950/30" />
        <div className="absolute bottom-0 left-1/2 h-full w-[340px] -translate-x-1/2">
          <span className="absolute bottom-[2px] left-[6px] h-[30px] w-[326px] rounded-[50%] bg-amber-100/10 ring-2 ring-amber-200/20" />

          <div className="absolute bottom-[70px] left-[206px] h-[118px] w-[112px]">
            <span className="absolute inset-x-[14px] bottom-0 top-[6px] grid grid-cols-4 gap-[3px] rounded-t-[40px] bg-gradient-to-b from-sky-300/30 to-sky-900/40 p-[3px] ring-2 ring-amber-200/30">
              {PANES.map((pane) => (
                <span key={pane} className="rounded-[2px] bg-sky-200/10" />
              ))}
            </span>
            <span className="absolute bottom-0 left-0 top-0 w-[22px] rounded-b-lg bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 [clip-path:polygon(0_0,100%_0,70%_100%,0_100%)]" />
            <span className="absolute bottom-0 right-0 top-0 w-[22px] rounded-b-lg bg-gradient-to-l from-amber-700 via-amber-800 to-amber-950 [clip-path:polygon(0_0,100%_0,100%_100%,30%_100%)]" />
          </div>

          <div className="absolute bottom-[122px] left-[86px] h-[44px] w-[38px] rounded-[3px] bg-gradient-to-br from-amber-300 to-amber-600 p-[3px] shadow-lg">
            <span className="relative block h-full w-full overflow-hidden bg-slate-800">
              <PortraitHead
                character={leader}
                className="absolute left-1/2 top-[3px] h-[28px] w-[28px] -translate-x-1/2 border-0"
              />
            </span>
          </div>

          {flags.map((party, index) => (
            <CoalitionPartyFlag
              key={party}
              party={party}
              className={`bottom-[22px] h-[156px] ${FLAG_SPOTS[flags.length - 1]?.[index] ?? 'hidden'}`}
            />
          ))}

          <span className="absolute bottom-[56px] left-[228px] h-[96px] w-[72px] rounded-t-[26px] bg-gradient-to-b from-amber-900 to-amber-950 ring-1 ring-slate-950/70" />
          <div className="absolute bottom-[70px] left-[232px] z-10 h-[100px] w-[64px]">
            <CoalitionSuit party={leaderParty} className="bottom-0 left-[6px] h-[44px] w-[52px]" />
            <SceneActor
              character={leader}
              className="bottom-[36px] left-[4px]"
              anim="leader-head"
              pose="origin-bottom"
              size="h-14 w-14"
            />
          </div>

          <div className="absolute bottom-[18px] left-[186px] z-20 h-[60px] w-[144px]">
            <span className="absolute inset-x-[-4px] top-0 h-[14px] rounded-[3px] bg-gradient-to-b from-amber-700 to-amber-800 ring-1 ring-slate-950/50" />
            <span className="absolute inset-x-0 bottom-0 top-[14px] bg-gradient-to-b from-amber-800 to-amber-950 ring-1 ring-slate-950/60">
              <span className="absolute bottom-[5px] left-[6px] top-[5px] w-[36px] rounded-[2px] border border-amber-500/40" />
              <span className="absolute bottom-[5px] right-[6px] top-[5px] w-[36px] rounded-[2px] border border-amber-500/40" />
              <span className="absolute bottom-0 left-1/2 top-[5px] w-[44px] -translate-x-1/2 rounded-t-[6px] border border-b-0 border-amber-500/40 bg-amber-950/60">
                <span className="absolute left-1/2 top-[6px] grid h-[24px] w-[24px] -translate-x-1/2 place-items-center rounded-full bg-amber-900 ring-2 ring-amber-400/70">
                  <SponsorEmblem sponsorId={leaderParty} className="h-4 w-4" />
                </span>
              </span>
            </span>
          </div>

          <div data-anim="desk-folder" className="absolute bottom-[64px] left-[236px] z-30 h-[12px] w-[40px]">
            <CoalitionFolder className="inset-0">
              <CoalitionSignature
                stroke={0}
                animDelay={SIGN_MS}
                className="right-[2px] top-[1px] h-[7px] w-[16px]"
              />
            </CoalitionFolder>
          </div>
          <div data-anim="signed-folder" className="absolute bottom-[64px] left-[196px] z-30 h-[12px] w-[40px] opacity-0">
            <CoalitionFolder className="inset-0">
              <span className="absolute right-[2px] top-[1px] h-[7px] w-[16px]">
                <CoalitionSignature stroke={0} drawn className="inset-0" />
              </span>
              <CoalitionSignature stroke={1} drawn className="bottom-0 left-[3px] h-[5px] w-[12px]" />
              <CoalitionStampMark animDelay={STAMP_MS} className="left-[8px] top-[-2px] h-[12px] w-[12px]" />
            </CoalitionFolder>
          </div>

          <CoalitionArm
            party={leaderParty}
            anim="leader-free-arm"
            className="bottom-[100px] left-[240px] z-40 w-[36px] [transform:rotate(104deg)]"
          >
            <span data-anim="leader-stamp" className="absolute left-[-6px] top-[-4px] block h-[18px] w-[12px] opacity-0">
              <span className="absolute left-[3px] top-0 h-[10px] w-[6px] rounded-full bg-amber-800" />
              <span className="absolute bottom-0 left-0 h-[8px] w-[12px] rounded-[2px] bg-slate-700 ring-1 ring-red-600" />
            </span>
          </CoalitionArm>
          <CoalitionArm
            party={leaderParty}
            anim="leader-pen-arm"
            className="bottom-[100px] left-[280px] z-40 w-[36px] [transform:rotate(76deg)]"
          >
            <span data-anim="leader-pen" className="absolute left-[-2px] top-[-12px] block h-[14px] w-[3px] rotate-[20deg] rounded-full bg-slate-900 opacity-0 ring-1 ring-amber-300" />
          </CoalitionArm>

          <div className="absolute bottom-[22px] left-[40px] z-10 h-[34px] w-[28px] origin-bottom" data-anim="chair-creak">
            <span className="absolute bottom-[10px] left-0 h-[24px] w-[4px] rounded-t-full bg-amber-500" />
            <span className="absolute bottom-[24px] left-0 h-[4px] w-[8px] rounded-r-full bg-amber-500" />
            <span className="absolute bottom-[10px] left-0 h-[4px] w-[28px] rounded-[1px] bg-amber-500" />
            <span className="absolute bottom-[13px] left-[3px] h-[3px] w-[22px] rounded-t-full bg-red-700" />
            <span className="absolute bottom-0 left-[2px] h-[10px] w-[3px] bg-amber-600" />
            <span className="absolute bottom-0 right-[2px] h-[10px] w-[3px] bg-amber-600" />
          </div>

          <div data-anim="partner-walk" className="absolute bottom-[22px] left-[78px] z-30 h-[120px] w-[44px]">
            <div data-anim="legs-standing" className="absolute bottom-0 left-0 h-[24px] w-[44px]">
              <span data-anim="leg-trail" className="absolute bottom-0 left-[12px] h-[24px] w-[8px] origin-top rounded-b-[3px] bg-slate-800">
                <span className="absolute bottom-[-2px] left-[-1px] h-[5px] w-[12px] rounded-full bg-slate-950" />
              </span>
              <span data-anim="leg-lead" className="absolute bottom-0 left-[22px] h-[24px] w-[8px] origin-top rounded-b-[3px] bg-slate-700">
                <span className="absolute bottom-[-2px] left-[-1px] h-[5px] w-[12px] rounded-full bg-slate-950" />
              </span>
            </div>
            <div data-anim="partner-body" className="absolute bottom-[22px] left-0 h-[90px] w-[44px] origin-bottom">
              <CoalitionSuit party={partnerParty} className="bottom-0 left-[5px] h-[34px] w-[34px]" />
              <svg data-anim="legs-seated" viewBox="0 0 44 50" aria-hidden="true" className="absolute bottom-[-12px] left-0 h-[50px] w-[44px] opacity-0">
                <path d="M14 38 30 6 31 47" className="fill-none stroke-slate-800" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 38 35 7 36 47" className="fill-none stroke-slate-700" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="38" cy="48" rx="6" ry="2.5" className="fill-slate-950" />
              </svg>
              <span data-anim="knee-folder" className="absolute bottom-[30px] left-[22px] h-[9px] w-[30px] rotate-[-40deg] opacity-0">
                <CoalitionFolder className="inset-0">
                  <CoalitionSignature stroke={0} drawn className="right-[2px] top-0 h-[5px] w-[12px]" />
                  <CoalitionSignature stroke={1} animDelay={KNEE_SIGN_MS} animDuration={400} className="bottom-0 left-[2px] h-[4px] w-[10px]" />
                </CoalitionFolder>
              </span>
              <SceneActor
                character={partner}
                className="bottom-[28px] left-[-2px]"
                anim="partner-head"
                pose="origin-bottom"
                size="h-12 w-12"
              />
              <CoalitionArm
                party={partnerParty}
                anim="partner-arm"
                className="bottom-[22px] left-[26px] z-30 w-[28px] [transform:rotate(80deg)]"
              >
                <span data-anim="partner-pen" className="absolute left-[-1px] top-[-11px] block h-[12px] w-[3px] rotate-[25deg] rounded-full bg-slate-300 opacity-0 ring-1 ring-slate-950/50" />
                <span data-anim="hand-folder" className="absolute left-[-14px] top-[-6px] block h-[12px] w-[28px] opacity-0">
                  <CoalitionFolder className="inset-0" />
                </span>
              </CoalitionArm>
            </div>
          </div>
        </div>
        <CoalitionPressCorps barrages={[FLASH_MS, PHOTO_MS]} holdFrom={HOLD_FLASH_MS} />
      </SceneFrame>
    </div>
  );
}
