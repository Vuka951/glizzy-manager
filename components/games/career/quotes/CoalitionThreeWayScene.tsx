'use client';

import { useRef } from 'react';
import CoalitionArm from '@/components/games/career/quotes/CoalitionArm';
import CoalitionAudience from '@/components/games/career/quotes/CoalitionAudience';
import CoalitionArmKnot from '@/components/games/career/quotes/CoalitionArmKnot';
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
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import {
  SIGNATURE_INK,
  type SceneAnimationSpec,
} from '@/lib/constants/sceneAnimations';
import { SUIT_COLORS } from '@/lib/constants/sponsorThemes';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import type { SponsorId } from '@/lib/utils/careerSave';
import { governmentOfVariant } from '@/lib/utils/careerElectionScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 4500;
// Matches the lineStartMs of this scene's definition
const LINE_START_MS = 3000;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The definition's cues land on these: the two handshakes that knot the
// arms, the three pens, the seal and the group photo
const REACH_MS = 800;
const CLASP_MS = 1200;
const KNOT_MS = 1500;
const TUG_MS = 2200;
const TUG_END_MS = 2650;
const LEFT_SIGN_MS = 2800;
const MIDDLE_SIGN_MS = 3600;
const RIGHT_SIGN_MS = 4200;
const STAMP_MS = 4800;
const PHOTO_MS = 5400;
const HOLD_FLASH_MS = 6400;

const TUG_BEAT_MS = 150;

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

// Everyone pulls his own way while the knot holds: alternating jerks
const tug = (at: (beat: number) => Keyframe): [number, Keyframe][] =>
  Array.from(
    { length: Math.floor((TUG_END_MS - TUG_MS) / TUG_BEAT_MS) },
    (_, beat): [number, Keyframe] => [TUG_MS + TUG_BEAT_MS * (beat + 0.5), at(beat)],
  );

const reach = (rest: string, out: string, jiggle: [string, string]) =>
  t([
    [0, { transform: rest }],
    [REACH_MS, { transform: rest }],
    [CLASP_MS - 50, { transform: out }],
    [CLASP_MS + 80, { transform: jiggle[0] }],
    [CLASP_MS + 160, { transform: jiggle[1] }],
    [CLASP_MS + 240, { transform: jiggle[0] }],
    [KNOT_MS, { transform: out }],
    [TOTAL_MS, { transform: out }],
  ]);

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
  'reach-arms': shown(0, KNOT_MS),
  'left-reach': reach(
    'rotate(95deg) scaleX(0.5)',
    'rotate(14deg) scaleX(1)',
    ['rotate(8deg) scaleX(1)', 'rotate(20deg) scaleX(1)'],
  ),
  'middle-reach': reach(
    'rotate(85deg) scaleX(0.9)',
    'rotate(138deg) scaleX(0.9)',
    ['rotate(130deg) scaleX(0.9)', 'rotate(146deg) scaleX(0.9)'],
  ),
  'right-reach': reach(
    'rotate(85deg) scaleX(0.5)',
    'rotate(166deg) scaleX(1)',
    ['rotate(172deg) scaleX(1)', 'rotate(160deg) scaleX(1)'],
  ),
  knot: t([
    [0, { opacity: 0, transform: 'rotate(-25deg) scale(0.85)' }],
    [KNOT_MS - 1, { opacity: 0, transform: 'rotate(-25deg) scale(0.85)' }],
    [KNOT_MS, { opacity: 1, transform: 'rotate(-25deg) scale(0.85)' }],
    [KNOT_MS + 150, { opacity: 1, transform: 'rotate(10deg) scale(1.06)' }],
    [KNOT_MS + 300, { opacity: 1, transform: 'rotate(0deg) scale(1)' }],
    [TUG_MS, { opacity: 1, transform: 'rotate(0deg) scale(1)' }],
    ...tug((beat) => ({
      opacity: 1,
      transform: `rotate(${beat % 2 ? -5 : 5}deg) scale(${beat % 2 ? 1.06 : 0.96}, 1)`,
    })),
    [TUG_END_MS, { opacity: 1, transform: 'rotate(0deg) scale(1)' }],
    [MIDDLE_SIGN_MS - 200, { opacity: 1, transform: 'rotate(0deg) scale(1)' }],
    [MIDDLE_SIGN_MS, { opacity: 1, transform: 'rotate(0deg) scale(1, 0.85)' }],
    [MIDDLE_SIGN_MS + 300, { opacity: 1, transform: 'rotate(0deg) scale(1, 0.85)' }],
    [MIDDLE_SIGN_MS + 450, { opacity: 1, transform: 'rotate(0deg) scale(1)' }],
    [RIGHT_SIGN_MS - 150, { opacity: 1, transform: 'rotate(0deg) scale(1)' }],
    [RIGHT_SIGN_MS, { opacity: 1, transform: 'rotate(-6deg) scale(1.04, 1)' }],
    [RIGHT_SIGN_MS + 500, { opacity: 1, transform: 'rotate(-6deg) scale(1.04, 1)' }],
    [RIGHT_SIGN_MS + 650, { opacity: 1, transform: 'rotate(0deg) scale(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'rotate(0deg) scale(1)' }],
  ]),
  'left-body': t([
    [0, { transform: 'rotate(0deg)' }],
    [TUG_MS, { transform: 'rotate(0deg)' }],
    ...tug((beat) => ({ transform: `rotate(${beat % 2 ? -3 : -9}deg)` })),
    [TUG_END_MS, { transform: 'rotate(0deg)' }],
    [LEFT_SIGN_MS - 50, { transform: 'rotate(12deg)' }],
    [LEFT_SIGN_MS + 450, { transform: 'rotate(12deg)' }],
    [LEFT_SIGN_MS + 650, { transform: 'rotate(0deg)' }],
    [TOTAL_MS, { transform: 'rotate(0deg)' }],
  ]),
  'right-body': t([
    [0, { transform: 'rotate(0deg)' }],
    [TUG_MS, { transform: 'rotate(0deg)' }],
    ...tug((beat) => ({ transform: `rotate(${beat % 2 ? 9 : 3}deg)` })),
    [TUG_END_MS, { transform: 'rotate(0deg)' }],
    [RIGHT_SIGN_MS - 300, { transform: 'rotate(0deg)' }],
    [RIGHT_SIGN_MS - 150, { transform: 'rotate(16deg)' }],
    [RIGHT_SIGN_MS + 450, { transform: 'rotate(16deg)' }],
    [RIGHT_SIGN_MS + 600, { transform: 'rotate(0deg)' }],
    [TOTAL_MS, { transform: 'rotate(0deg)' }],
  ]),
  // He ducks behind the table with his head, so the body goes down with it
  'middle-body': t([
    [0, { transform: 'translateY(0px)' }],
    [MIDDLE_SIGN_MS - 300, { transform: 'translateY(0px)' }],
    [MIDDLE_SIGN_MS - 60, { transform: 'translateY(32px)' }],
    [MIDDLE_SIGN_MS + 480, { transform: 'translateY(32px)' }],
    [MIDDLE_SIGN_MS + 680, { transform: 'translateY(0px)' }],
    [TOTAL_MS, { transform: 'translateY(0px)' }],
  ]),
  'left-head': t([
    [0, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [REACH_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [CLASP_MS, { transform: 'translate(2px, 0px) rotate(8deg)' }],
    [KNOT_MS + 100, { transform: 'translate(0px, -3px) rotate(-6deg)' }],
    [TUG_MS, { transform: 'translate(0px, -3px) rotate(-6deg)' }],
    ...tug((beat) => ({
      transform: `translate(${beat % 2 ? -2 : -6}px, 0px) rotate(${beat % 2 ? -6 : -14}deg)`,
    })),
    [TUG_END_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [LEFT_SIGN_MS - 50, { transform: 'translate(12px, 4px) rotate(16deg)' }],
    [LEFT_SIGN_MS + 450, { transform: 'translate(12px, 4px) rotate(16deg)' }],
    [LEFT_SIGN_MS + 650, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PHOTO_MS - 100, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PHOTO_MS, { transform: 'translate(0px, -3px) rotate(-8deg)' }],
    [TOTAL_MS, { transform: 'translate(0px, -3px) rotate(-8deg)' }],
  ]),
  'middle-head': t([
    [0, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [CLASP_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [KNOT_MS, { transform: 'translate(0px, 2px) rotate(-8deg)' }],
    [KNOT_MS + 200, { transform: 'translate(0px, 2px) rotate(8deg)' }],
    [TUG_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    ...tug((beat) => ({
      transform: `translate(0px, ${beat % 2 ? -4 : 0}px) rotate(${beat % 2 ? 5 : -5}deg)`,
    })),
    [TUG_END_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [MIDDLE_SIGN_MS - 300, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [MIDDLE_SIGN_MS - 60, { transform: 'translate(0px, 32px) rotate(0deg)' }],
    [MIDDLE_SIGN_MS + 100, { transform: 'translate(-3px, 32px) rotate(-6deg)' }],
    [MIDDLE_SIGN_MS + 200, { transform: 'translate(3px, 32px) rotate(6deg)' }],
    [MIDDLE_SIGN_MS + 300, { transform: 'translate(-3px, 32px) rotate(-6deg)' }],
    [MIDDLE_SIGN_MS + 400, { transform: 'translate(3px, 32px) rotate(6deg)' }],
    [MIDDLE_SIGN_MS + 480, { transform: 'translate(0px, 32px) rotate(0deg)' }],
    [MIDDLE_SIGN_MS + 680, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PHOTO_MS - 100, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PHOTO_MS, { transform: 'translate(0px, -4px) rotate(3deg)' }],
    [TOTAL_MS, { transform: 'translate(0px, -4px) rotate(3deg)' }],
  ]),
  'right-head': t([
    [0, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [REACH_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [CLASP_MS, { transform: 'translate(-2px, 0px) rotate(-8deg)' }],
    [KNOT_MS + 100, { transform: 'translate(0px, -3px) rotate(6deg)' }],
    [TUG_MS, { transform: 'translate(0px, -3px) rotate(6deg)' }],
    ...tug((beat) => ({
      transform: `translate(${beat % 2 ? 6 : 2}px, 0px) rotate(${beat % 2 ? 14 : 6}deg)`,
    })),
    [TUG_END_MS, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [RIGHT_SIGN_MS - 300, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [RIGHT_SIGN_MS - 150, { transform: 'translate(12px, 6px) rotate(22deg)' }],
    [RIGHT_SIGN_MS + 450, { transform: 'translate(12px, 6px) rotate(22deg)' }],
    [RIGHT_SIGN_MS + 600, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PHOTO_MS - 100, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [PHOTO_MS, { transform: 'translate(0px, -3px) rotate(8deg)' }],
    [TOTAL_MS, { transform: 'translate(0px, -3px) rotate(8deg)' }],
  ]),
  'wrong-arm': t([
    [0, { opacity: 0, transform: 'rotate(95deg) scaleX(0.35)' }],
    [LEFT_SIGN_MS - 300, { opacity: 0, transform: 'rotate(95deg) scaleX(0.35)' }],
    [LEFT_SIGN_MS - 290, { opacity: 1, transform: 'rotate(95deg) scaleX(0.35)' }],
    [LEFT_SIGN_MS - 50, { opacity: 1, transform: 'rotate(30deg) scaleX(1)' }],
    [LEFT_SIGN_MS + 100, { opacity: 1, transform: 'rotate(26deg) scaleX(1)' }],
    [LEFT_SIGN_MS + 200, { opacity: 1, transform: 'rotate(33deg) scaleX(1)' }],
    [LEFT_SIGN_MS + 300, { opacity: 1, transform: 'rotate(27deg) scaleX(1)' }],
    [LEFT_SIGN_MS + 400, { opacity: 1, transform: 'rotate(32deg) scaleX(1)' }],
    [LEFT_SIGN_MS + 500, { opacity: 1, transform: 'rotate(30deg) scaleX(1)' }],
    [LEFT_SIGN_MS + 700, { opacity: 1, transform: 'rotate(95deg) scaleX(0.35)' }],
    [LEFT_SIGN_MS + 710, { opacity: 0, transform: 'rotate(95deg) scaleX(0.35)' }],
    [TOTAL_MS, { opacity: 0, transform: 'rotate(95deg) scaleX(0.35)' }],
  ]),
  'knot-jiggle': {
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(4deg) scale(1.03, 1)', offset: 0.08 },
      { transform: 'rotate(-4deg) scale(0.97, 1)', offset: 0.16 },
      { transform: 'rotate(0deg)', offset: 0.24 },
      { transform: 'rotate(0deg)' },
    ],
    options: { duration: 1500, iterations: Infinity, easing: 'ease-in-out' },
  },
  'teeth-pen': shown(MIDDLE_SIGN_MS - 300, MIDDLE_SIGN_MS + 680),
  'signing-leg': t([
    [0, { opacity: 0, transform: 'rotate(250deg)' }],
    [RIGHT_SIGN_MS - 300, { opacity: 0, transform: 'rotate(250deg)' }],
    [RIGHT_SIGN_MS - 290, { opacity: 1, transform: 'rotate(250deg)' }],
    [RIGHT_SIGN_MS - 30, { opacity: 1, transform: 'rotate(178deg)' }],
    [RIGHT_SIGN_MS + 100, { opacity: 1, transform: 'rotate(182deg)' }],
    [RIGHT_SIGN_MS + 200, { opacity: 1, transform: 'rotate(176deg)' }],
    [RIGHT_SIGN_MS + 300, { opacity: 1, transform: 'rotate(182deg)' }],
    [RIGHT_SIGN_MS + 400, { opacity: 1, transform: 'rotate(177deg)' }],
    [RIGHT_SIGN_MS + 450, { opacity: 1, transform: 'rotate(180deg)' }],
    [RIGHT_SIGN_MS + 550, { opacity: 1, transform: 'rotate(250deg)' }],
    [RIGHT_SIGN_MS + 560, { opacity: 0, transform: 'rotate(250deg)' }],
    [TOTAL_MS, { opacity: 0, transform: 'rotate(250deg)' }],
  ]),
  official: t([
    [0, { transform: 'translateY(-190px)' }],
    [STAMP_MS - 300, { transform: 'translateY(-190px)' }],
    [STAMP_MS - 80, { transform: 'translateY(-14px)' }],
    [STAMP_MS, { transform: 'translateY(0px)' }],
    [STAMP_MS + 200, { transform: 'translateY(0px)' }],
    [STAMP_MS + 450, { transform: 'translateY(-190px)' }],
    [TOTAL_MS, { transform: 'translateY(-190px)' }],
  ]),
  thump: t([
    [0, { transform: 'translateY(0px)' }],
    [STAMP_MS, { transform: 'translateY(0px)' }],
    [STAMP_MS + 50, { transform: 'translateY(2px)' }],
    [STAMP_MS + 160, { transform: 'translateY(0px)' }],
    [TOTAL_MS, { transform: 'translateY(0px)' }],
  ]),
};

const SEATS = [
  { name: 'left', body: 'left-[79px]', head: 'left-[75px]' },
  { name: 'middle', body: 'left-[149px]', head: 'left-[145px]' },
  { name: 'right', body: 'left-[219px]', head: 'left-[215px]' },
] as const;

// The step-and-repeat wall behind a signing: every party's mark, over and
// over, as far as the frame reaches
const BACKDROP_ROWS = [0, 1, 2, 3];
const BACKDROP_TILES = Array.from({ length: 28 }, (_, index) => index);

const FLAG_SPOTS = ['left-[168px] h-[196px]', 'left-[22px] h-[150px]', 'left-[290px] h-[150px]'];

export default function CoalitionThreeWayScene({
  speaker,
  other,
  third = other,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const government = governmentOfVariant(variant);
  const parties = [
    ...government,
    ...SPONSOR_IDS.filter((id) => !government.includes(id)),
  ].slice(0, 3) as [SponsorId, SponsorId, SponsorId];
  const [leaderParty, otherParty, thirdParty] = parties;
  // The leader takes the middle chair under his own flag
  const seated = [
    { party: otherParty, slug: other },
    { party: leaderParty, slug: speaker },
    { party: thirdParty, slug: third },
  ];
  useSceneAnimation(root, CUSTOM, [speaker, other, third, variant]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-sky-950/70 via-slate-900 to-slate-900"
        floor="bg-gradient-to-b from-slate-700 to-slate-800"
      >
        <div className="absolute inset-x-0 top-[14%] flex flex-col items-center gap-[12px] opacity-10">
          {BACKDROP_ROWS.map((row) => (
            <div key={row} className={`flex shrink-0 gap-[26px] ${row % 2 ? 'translate-x-[24px]' : ''}`}>
              {BACKDROP_TILES.map((tile) => (
                <SponsorEmblem
                  key={tile}
                  sponsorId={parties[(tile + row) % parties.length]}
                  className="h-[22px] w-[22px] shrink-0"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-1/2 h-full w-[340px] -translate-x-1/2">
          {parties.map((party, index) => (
            <CoalitionPartyFlag key={party} party={party} className={`bottom-[22px] ${FLAG_SPOTS[index]}`} />
          ))}

          {SEATS.map((seat, index) => (
            <div
              key={seat.name}
              data-anim={`${seat.name}-body`}
              className={`absolute bottom-[64px] z-10 h-[42px] w-[42px] origin-bottom ${seat.body}`}
            >
              <CoalitionSuit party={seated[index].party} className="inset-0" />
            </div>
          ))}

          <div data-anim="reach-arms" className="absolute inset-0 z-20">
            <CoalitionArm party={otherParty} anim="left-reach" className="bottom-[94px] left-[114px] w-[52px] [transform:rotate(95deg)_scaleX(0.5)]" />
            <CoalitionArm party={leaderParty} anim="middle-reach" className="bottom-[94px] left-[184px] w-[30px] [transform:rotate(85deg)_scaleX(0.9)]" />
            <CoalitionArm party={thirdParty} anim="right-reach" className="bottom-[94px] left-[218px] w-[52px] [transform:rotate(85deg)_scaleX(0.5)]" />
          </div>

          <div data-anim="thump" className="absolute bottom-[18px] left-[55px] z-[25] h-[60px] w-[230px]">
            <span className="absolute inset-x-0 bottom-0 top-[14px] rounded-b-[30px] bg-slate-100 bg-[repeating-linear-gradient(90deg,rgba(2,6,23,0)_0px,rgba(2,6,23,0.09)_10px,rgba(2,6,23,0)_20px)] ring-1 ring-slate-950/30">
              <span className="absolute inset-x-0 top-[18px] flex items-center justify-center gap-2">
                {parties.map((party) => (
                  <SponsorEmblem key={party} sponsorId={party} className="h-5 w-5" />
                ))}
              </span>
            </span>
            <span className="absolute inset-x-0 top-0 h-[28px] rounded-[50%] bg-amber-50 ring-1 ring-slate-400" />
          </div>

          <div data-anim="thump" className="absolute bottom-[58px] left-[148px] z-[26] h-[13px] w-[44px]">
            <CoalitionFolder className="inset-0">
              <CoalitionSignature stroke={0} animDelay={LEFT_SIGN_MS} className="left-[1px] top-0 h-[6px] w-[14px]" />
              <CoalitionSignature stroke={1} animDelay={MIDDLE_SIGN_MS} className="bottom-0 left-[12px] h-[6px] w-[14px]" />
              <CoalitionSignature stroke={2} animDelay={RIGHT_SIGN_MS} className="right-[1px] top-0 h-[6px] w-[14px]" />
              <CoalitionStampMark animDelay={STAMP_MS} className="right-[4px] top-[-1px] h-[12px] w-[12px]" />
            </CoalitionFolder>
          </div>

          <span data-anim="knot" className="absolute bottom-[64px] left-[100px] z-[27] block h-[50px] w-[140px] origin-[70px_28px] opacity-0">
            <span data-anim="knot-jiggle" data-anim-delay={PHOTO_MS + 700} className="absolute inset-0 block origin-[70px_28px]">
              <CoalitionArmKnot parties={[otherParty, leaderParty, thirdParty]} className="inset-0 h-full w-full" />
            </span>
          </span>

          <CoalitionArm party={otherParty} anim="wrong-arm" className="bottom-[94px] left-[78px] z-[28] w-[84px] opacity-0 [transform:rotate(95deg)_scaleX(0.35)]">
            <span className="absolute left-[-2px] top-[-12px] block h-[13px] w-[3px] rotate-[25deg] rounded-full bg-slate-900 ring-1 ring-amber-300" />
          </CoalitionArm>

          <span data-anim="signing-leg" className={`absolute bottom-[62px] left-[236px] z-[28] block h-[11px] w-[58px] origin-[4px_50%] rounded-full opacity-0 ring-1 ring-slate-500/60 [transform:rotate(250deg)] ${SUIT_COLORS[thirdParty].jacket}`}>
            <span className="absolute right-[2px] top-[1px] h-[9px] w-[6px] rounded-[2px] bg-slate-100" />
            <span className="absolute right-[-10px] top-[-4px] h-[14px] w-[18px] rounded-[40%_60%_30%_30%] border-b-[3px] border-slate-300 bg-slate-950" />
            <span className="absolute right-[-2px] top-[8px] h-[14px] w-[3px] rotate-[-20deg] rounded-full bg-slate-900 ring-1 ring-amber-300" />
          </span>

          <div className="absolute inset-0 z-30">
            {SEATS.map((seat, index) => (
              <SceneActor
                key={seat.name}
                character={characterBySlug(seated[index].slug)}
                className={`bottom-[98px] ${seat.head}`}
                anim={`${seat.name}-head`}
                pose="origin-bottom"
                size="h-[50px] w-[50px]"
              >
                {seat.name === 'middle' && (
                  <span data-anim="teeth-pen" className="absolute bottom-[4px] left-[14px] block h-[3px] w-[22px] rounded-full bg-slate-900 opacity-0 ring-1 ring-amber-300" />
                )}
              </SceneActor>
            ))}
          </div>

          <div data-anim="official" className="absolute bottom-[64px] left-[176px] z-40 h-[220px] w-[18px] [transform:translateY(-190px)]">
            <span className="absolute inset-x-[2px] bottom-[22px] top-0 bg-slate-600 ring-1 ring-slate-950/50" />
            <span className="absolute inset-x-0 bottom-[22px] h-[5px] bg-slate-100" />
            <span className="absolute bottom-[12px] left-[3px] h-[12px] w-[12px] rounded-full bg-amber-200 ring-1 ring-slate-950/40" />
            <span className="absolute bottom-[6px] left-[6px] h-[8px] w-[6px] bg-amber-800" />
            <span className="absolute bottom-0 left-[-1px] h-[7px] w-[20px] rounded-[2px] bg-slate-700 ring-1 ring-red-600" />
          </div>
        </div>
        <CoalitionAudience />
        <CoalitionPressCorps barrages={[PHOTO_MS]} holdFrom={HOLD_FLASH_MS} />
      </SceneFrame>
    </div>
  );
}
