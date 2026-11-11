'use client';

import { useRef } from 'react';
import ElectionWinStateBroadcast from '@/components/games/career/quotes/ElectionWinStateBroadcast';
import ElectionWinTelevision from '@/components/games/career/quotes/ElectionWinTelevision';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import PortraitHead from '@/components/games/PortraitHead';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import { GAMES_UI } from '@/data/games/locale';
import { electionWinPalette } from '@/lib/constants/electionWinPalette';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import { governmentOfVariant } from '@/lib/utils/careerElectionScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 4600;
// Matches the lineStartMs of this scene's definition: the camera is pulling
// back off the last channel onto the whole wall when the hold begins
const LINE_START_MS = 2400;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The three remote clicks, the brass, the deflate hiss and the failed sting
// of the definition land on these
const CLICKS_MS = [1150, 1700, 2250];
const REVEAL_MS = 2800;
const PULLED_MS = 3450;
const POWER_ON_STEP_MS = 45;
const AIM_MS = 3450;
const REACH_MS = 3700;
const YANK_MS = 4000;
const FAIL_MS = 4300;
const PORTRAIT_MS = 5200;
const BLANKET_MS = 5600;
const COVERED_MS = 6000;

const CLOSE_UP = 'translateY(24px) scale(2.6)';

const timeline = (frames: [number, Keyframe][], easing?: string) =>
  sceneTimeline(TOTAL_MS, frames, easing);

// One channel on the close-up set, on between the click that brings it and
// the click that takes it away
const channel = (from: number, to: number) =>
  timeline([
    [0, { opacity: from === 0 ? 1 : 0 }],
    ...(from === 0
      ? []
      : ([
          [from - 1, { opacity: 0 }],
          [from + 60, { opacity: 1 }],
        ] as [number, Keyframe][])),
    [to, { opacity: 1 }],
    [to + 1, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]);

const osd = (at: number) =>
  timeline([
    [0, { opacity: 0 }],
    [at, { opacity: 0 }],
    [at + 40, { opacity: 1 }],
    [at + 500, { opacity: 1 }],
    [at + 560, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]);

const powerOn = (at: number) =>
  timeline([
    [0, { opacity: 0, transform: 'scaleY(0.04)' }],
    [at, { opacity: 0, transform: 'scaleY(0.04)' }],
    [at + 30, { opacity: 1, transform: 'scaleY(0.04)' }],
    [at + 160, { opacity: 1, transform: 'scaleY(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scaleY(1)' }],
  ]);

const CHANNELS_ON = [0, ...CLICKS_MS];
const CHANNELS_OFF = [...CLICKS_MS, REVEAL_MS];

// The order the rest of the wall switches on in, outward from the set he
// was watching
const WALL = [
  { cls: 'left-[77px] bottom-[156px]', order: 4 },
  { cls: 'left-[141px] bottom-[156px]', order: 1 },
  { cls: 'left-[205px] bottom-[156px]', order: 5 },
  { cls: 'left-[77px] bottom-[110px]', order: 2 },
  { cls: 'left-[205px] bottom-[110px]', order: 3 },
  { cls: 'left-[77px] bottom-[64px]', order: 6 },
  { cls: 'left-[141px] bottom-[64px]', order: 7 },
  { cls: 'left-[205px] bottom-[64px]', order: 8 },
];

const CUSTOM: Record<string, SceneAnimationSpec> = {
  camera: timeline([
    [0, { transform: CLOSE_UP }],
    [REVEAL_MS, { transform: CLOSE_UP }],
    [PULLED_MS, { transform: 'translateY(0px) scale(1)' }],
    [TOTAL_MS, { transform: 'translateY(0px) scale(1)' }],
  ]),
  ...Object.fromEntries(
    CHANNELS_ON.map((on, index) => [
      `channel-${index}`,
      channel(on, CHANNELS_OFF[index]),
    ]),
  ),
  ...Object.fromEntries(
    CLICKS_MS.map((at, index) => [`osd-${index}`, osd(at)]),
  ),
  static: timeline([
    [0, { opacity: 0 }],
    ...[...CLICKS_MS, REVEAL_MS].flatMap((at): [number, Keyframe][] => [
      [at - 1, { opacity: 0 }],
      [at, { opacity: 1 }],
      [at + 70, { opacity: 0 }],
    ]),
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'tv-center': powerOn(REVEAL_MS),
  ...Object.fromEntries(
    WALL.map((tv) => [
      `tv-on-${tv.order}`,
      powerOn(REVEAL_MS + tv.order * POWER_ON_STEP_MS),
    ]),
  ),
  'wall-glow': timeline([
    [0, { opacity: 0 }],
    [REVEAL_MS, { opacity: 0 }],
    [PULLED_MS, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'wall-flicker': timeline(
    [
      [0, { filter: 'brightness(1)' }],
      [FAIL_MS - 300, { filter: 'brightness(1)' }],
      [FAIL_MS - 260, { filter: 'brightness(0.25)' }],
      [FAIL_MS - 160, { filter: 'brightness(0.6)' }],
      [FAIL_MS - 100, { filter: 'brightness(0.2)' }],
      [FAIL_MS, { filter: 'brightness(1.25)' }],
      [FAIL_MS + 200, { filter: 'brightness(1)' }],
      [TOTAL_MS, { filter: 'brightness(1)' }],
    ],
    'linear',
  ),
  'pov-hand': timeline([
    [0, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    ...CLICKS_MS.flatMap((at): [number, Keyframe][] => [
      [at - 120, { transform: 'translate(0px, 0px) rotate(0deg)' }],
      [at, { transform: 'translate(-2px, 3px) rotate(-4deg)' }],
      [at + 120, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    ]),
    [REVEAL_MS - 100, { transform: 'translate(0px, 0px) rotate(0deg)' }],
    [REVEAL_MS + 250, { transform: 'translate(30px, 120px) rotate(10deg)' }],
    [TOTAL_MS, { transform: 'translate(30px, 120px) rotate(10deg)' }],
  ]),
  'pov-ir': timeline([
    [0, { opacity: 0 }],
    ...CLICKS_MS.flatMap((at): [number, Keyframe][] => [
      [at - 1, { opacity: 0 }],
      [at, { opacity: 1 }],
      [at + 160, { opacity: 0 }],
    ]),
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'citizen-lean': timeline([
    [0, { transform: 'rotate(0deg) translateX(0px)' }],
    [REACH_MS, { transform: 'rotate(0deg) translateX(0px)' }],
    [YANK_MS - 60, { transform: 'rotate(24deg) translateX(8px)' }],
    [YANK_MS + 120, { transform: 'rotate(-8deg) translateX(0px)' }],
    [YANK_MS + 350, { transform: 'rotate(0deg) translateX(0px)' }],
    [TOTAL_MS, { transform: 'rotate(0deg) translateX(0px)' }],
  ]),
  'citizen-arm': timeline([
    [0, { transform: 'rotate(-118deg)' }],
    [AIM_MS, { transform: 'rotate(-118deg)' }],
    [AIM_MS + 60, { transform: 'rotate(-126deg)' }],
    [AIM_MS + 120, { transform: 'rotate(-112deg)' }],
    [AIM_MS + 180, { transform: 'rotate(-126deg)' }],
    [REACH_MS, { transform: 'rotate(-118deg)' }],
    [YANK_MS - 60, { transform: 'rotate(-58deg)' }],
    [YANK_MS + 120, { transform: 'rotate(-85deg)' }],
    [PORTRAIT_MS - 300, { transform: 'rotate(-85deg)' }],
    [PORTRAIT_MS - 80, { transform: 'rotate(80deg)' }],
    [TOTAL_MS, { transform: 'rotate(80deg)' }],
  ]),
  'remote-hand': timeline([
    [0, { opacity: 1 }],
    [REACH_MS + 100, { opacity: 1 }],
    [REACH_MS + 110, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'remote-dropped': timeline([
    [0, { opacity: 0 }],
    [REACH_MS + 100, { opacity: 0 }],
    [REACH_MS + 110, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'plug-socket': timeline([
    [0, { opacity: 1 }],
    [YANK_MS, { opacity: 1 }],
    [YANK_MS + 10, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'cable-taut': timeline([
    [0, { opacity: 1 }],
    [YANK_MS, { opacity: 1 }],
    [YANK_MS + 10, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'cable-slack': timeline([
    [0, { opacity: 0, transform: 'scaleY(0.3)' }],
    [YANK_MS, { opacity: 0, transform: 'scaleY(0.3)' }],
    [YANK_MS + 10, { opacity: 1, transform: 'scaleY(0.3)' }],
    [YANK_MS + 250, { opacity: 1, transform: 'scaleY(1.1)' }],
    [YANK_MS + 400, { opacity: 1, transform: 'scaleY(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scaleY(1)' }],
  ]),
  'plug-hand': timeline([
    [0, { opacity: 0 }],
    [YANK_MS, { opacity: 0 }],
    [YANK_MS + 10, { opacity: 1 }],
    [PORTRAIT_MS, { opacity: 1 }],
    [PORTRAIT_MS + 10, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'plug-sparks': timeline([
    [0, { opacity: 0, transform: 'scale(0.2)' }],
    [YANK_MS, { opacity: 0, transform: 'scale(0.2)' }],
    [YANK_MS + 60, { opacity: 1, transform: 'scale(1.3)' }],
    [YANK_MS + 300, { opacity: 0, transform: 'scale(1.6)' }],
    [TOTAL_MS, { opacity: 0, transform: 'scale(1.6)' }],
  ]),
  'citizen-head': timeline([
    [0, { transform: 'rotate(0deg)' }],
    [FAIL_MS, { transform: 'rotate(0deg)' }],
    [FAIL_MS + 150, { transform: 'rotate(12deg)' }],
    [PORTRAIT_MS, { transform: 'rotate(12deg)' }],
    [PORTRAIT_MS + 200, { transform: 'rotate(-16deg) translateX(-2px)' }],
    [TOTAL_MS, { transform: 'rotate(-16deg) translateX(-2px)' }],
  ]),
  blanket: timeline([
    [0, { transform: 'scaleY(0.32)' }],
    [BLANKET_MS, { transform: 'scaleY(0.32)' }],
    [COVERED_MS - 80, { transform: 'scaleY(1.06)' }],
    [COVERED_MS, { transform: 'scaleY(1)' }],
    [TOTAL_MS, { transform: 'scaleY(1)' }],
  ]),
  'blanket-tremble': {
    keyframes: [
      { transform: 'translateX(0px)' },
      { transform: 'translateX(-1px)' },
      { transform: 'translateX(1px)' },
      { transform: 'translateX(0px)' },
    ],
    options: {
      duration: 160,
      delay: COVERED_MS,
      iterations: Infinity,
      easing: 'linear',
    },
  },
  'portrait-flip': timeline([
    [0, { transform: 'scaleX(1)' }],
    [PORTRAIT_MS, { transform: 'scaleX(1)' }],
    [PORTRAIT_MS + 110, { transform: 'scaleX(0)' }],
    [PORTRAIT_MS + 220, { transform: 'scaleX(1.15)' }],
    [PORTRAIT_MS + 340, { transform: 'scaleX(1)' }],
    [TOTAL_MS, { transform: 'scaleX(1)' }],
  ]),
  'portrait-face': timeline([
    [0, { opacity: 0 }],
    [PORTRAIT_MS + 105, { opacity: 0 }],
    [PORTRAIT_MS + 115, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
};

const OSD = ['2', '3', '4'];

export default function ElectionAllChannelsScene({
  speaker,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const winner = characterBySlug(speaker);
  const party = governmentOfVariant(variant)[0] ?? 'red';
  const palette = electionWinPalette[party];
  useSceneAnimation(root, CUSTOM, [speaker, variant]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"
        floor="bg-gradient-to-b from-slate-800 to-slate-900"
      >
        <div className="absolute bottom-[6%] left-1/2 ml-[-170px] h-[200px] w-[340px] origin-bottom sm:scale-[1.12]">
          <div
            data-anim="camera"
            className="absolute inset-0 origin-[170px_70px] [transform:translateY(24px)_scale(2.6)]"
          >
            <span
              data-anim="wall-glow"
              className={`absolute bottom-[40px] left-[40px] h-[170px] w-[260px] rounded-full opacity-0 blur-2xl ${palette.burst}`}
            />

            <div className="absolute bottom-[92px] left-[4px] h-[44px] w-[70px]">
              <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-[1px] bg-amber-900 ring-1 ring-slate-950/60" />
              <span className="absolute bottom-[3px] left-[48px] h-[9px] w-[10px] rounded-b-[3px] bg-amber-700" />
              <span className="absolute bottom-[11px] left-[46px] h-[9px] w-[14px] rounded-full bg-green-800" />
              <div
                data-anim="portrait-flip"
                className="absolute bottom-[3px] left-[8px] h-[36px] w-[30px] rounded-[2px] bg-amber-800 p-[2px] ring-1 ring-slate-950/60"
              >
                <span className="relative block h-full w-full overflow-hidden bg-sky-300">
                  <span className="absolute inset-x-0 bottom-0 h-[10px] bg-green-700 [clip-path:polygon(0_100%,0_40%,35%_0,60%_45%,80%_20%,100%_50%,100%_100%)]" />
                  <span className="absolute right-[2px] top-[2px] h-[4px] w-[4px] rounded-full bg-amber-200" />
                  <span
                    data-anim="portrait-face"
                    className={`absolute inset-0 opacity-0 ${palette.cloth}`}
                  >
                    <span className="absolute left-1/2 top-[3px] h-[24px] w-[24px] -translate-x-1/2">
                      <PortraitHead
                        character={winner}
                        className="h-full w-full border"
                      />
                    </span>
                  </span>
                </span>
              </div>
            </div>

            <div data-anim="wall-flicker" className="absolute inset-0">
              {WALL.map((tv) => (
                <ElectionWinTelevision
                  key={tv.cls}
                  className={`h-[40px] w-[58px] ${tv.cls}`}
                >
                  <div
                    data-anim={`tv-on-${tv.order}`}
                    className="absolute inset-0 opacity-0"
                  >
                    <ElectionWinStateBroadcast winner={winner} party={party} />
                  </div>
                </ElectionWinTelevision>
              ))}

              <ElectionWinTelevision className="bottom-[110px] left-[141px] h-[40px] w-[58px]">
                <div
                  data-anim="channel-0"
                  className="absolute inset-0 bg-gradient-to-b from-sky-800 to-blue-950"
                >
                  <span className="absolute inset-x-0 top-[5px] h-px bg-sky-400/40" />
                  <span className="absolute left-1/2 top-[4px] h-[20px] w-[20px] -translate-x-1/2">
                    <PortraitHead
                      character={winner}
                      className="h-full w-full border"
                    />
                  </span>
                  <span className="absolute inset-x-[6px] bottom-[5px] h-[6px] rounded-t-[2px] bg-slate-300" />
                  <span className="absolute bottom-0 left-0 flex h-[6px] items-center bg-red-600 px-[2px] text-[4px] font-black uppercase leading-none tracking-wide text-slate-50">
                    {GAMES_UI.career.quoteCutscene.newsStrap}
                  </span>
                  <span className="absolute bottom-0 left-[16px] right-0 h-[6px] bg-slate-100" />
                  <SponsorEmblem
                    sponsorId={party}
                    className="absolute right-[2px] top-[2px] aspect-square h-[7px] w-auto"
                  />
                </div>
                <div
                  data-anim="channel-1"
                  className="absolute inset-0 bg-amber-50 bg-[linear-gradient(90deg,rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.35)_1px,transparent_1px)] bg-[size:6px_6px] opacity-0"
                >
                  <span className="absolute left-[19px] top-[9px] h-[17px] w-[17px]">
                    <PortraitHead
                      character={winner}
                      className="h-full w-full border"
                    />
                  </span>
                  <span className="absolute left-[18px] top-[1px] h-[9px] w-[19px] rounded-t-full rounded-b-[2px] bg-white ring-1 ring-slate-300" />
                  <span className="absolute bottom-[2px] left-[25px] h-[6px] w-[22px] rounded-[50%] bg-slate-700 ring-1 ring-slate-950/60" />
                  <span className="absolute bottom-[4px] left-[45px] h-[2px] w-[7px] rounded-full bg-slate-800" />
                  <GlizzyIcon className="absolute bottom-[3px] left-[28px] h-[9px] w-[15px]" />
                  <span className="absolute bottom-[10px] left-[30px] h-[5px] w-px bg-slate-400/60" />
                  <span className="absolute bottom-[11px] left-[36px] h-[6px] w-px bg-slate-400/60" />
                  <SponsorEmblem
                    sponsorId={party}
                    className="absolute right-[2px] top-[2px] aspect-square h-[7px] w-auto"
                  />
                </div>
                <div
                  data-anim="channel-2"
                  className="absolute inset-0 bg-sky-700 opacity-0"
                >
                  <span className="absolute left-[3px] top-[5px] h-[26px] w-[30px] bg-green-600 [clip-path:polygon(20%_0,60%_5%,90%_25%,100%_60%,75%_100%,30%_90%,0_55%,8%_20%)]" />
                  <span className="absolute left-[8px] top-[8px] h-[7px] w-[7px] rounded-full bg-amber-300" />
                  <span className="absolute left-[17px] top-[18px] h-[5px] w-[10px] rounded-full bg-slate-100" />
                  <span className="absolute left-[6px] top-[22px] text-[6px] font-black leading-none text-slate-50">
                    +38°
                  </span>
                  <span className="absolute right-[3px] top-[16px] h-[17px] w-[17px]">
                    <PortraitHead
                      character={winner}
                      className="h-full w-full border"
                    />
                  </span>
                  <span className="absolute right-[17px] top-[26px] h-[2px] w-[9px] -rotate-12 rounded-full bg-orange-200" />
                  <SponsorEmblem
                    sponsorId={party}
                    className="absolute right-[2px] top-[2px] aspect-square h-[7px] w-auto"
                  />
                </div>
                <div
                  data-anim="channel-3"
                  className="absolute inset-0 bg-green-700 opacity-0"
                >
                  <span className="absolute inset-y-0 left-1/2 w-px bg-slate-50/60" />
                  <span className="absolute left-1/2 top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-slate-50/60" />
                  <span className="absolute left-1/2 top-[3px] h-[19px] w-[19px] -translate-x-1/2">
                    <PortraitHead
                      character={winner}
                      className="h-full w-full border"
                    />
                  </span>
                  <span className="absolute left-1/2 top-[22px] h-[5px] w-[6px] -translate-x-1/2 bg-red-600 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                  <span className="absolute left-1/2 top-[26px] h-[6px] w-[6px] -translate-x-1/2 rounded-full bg-amber-400 ring-1 ring-amber-700" />
                  <span className="absolute left-[2px] top-[2px] bg-slate-950 px-[2px] text-[5px] font-black leading-[7px] text-slate-50">
                    3:0
                  </span>
                </div>
                <div
                  data-anim="tv-center"
                  className="absolute inset-0 opacity-0"
                >
                  <ElectionWinStateBroadcast winner={winner} party={party} />
                </div>
                {OSD.map((number, index) => (
                  <span
                    key={number}
                    data-anim={`osd-${index}`}
                    className="absolute right-[3px] top-[8px] text-[7px] font-black leading-none text-green-400 opacity-0"
                  >
                    {number}
                  </span>
                ))}
                <span
                  data-anim="static"
                  className="absolute inset-0 bg-slate-400 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.7)_0_1px,transparent_1px_2px)] opacity-0"
                />
              </ElectionWinTelevision>
            </div>

            <span
              data-anim="cable-taut"
              className="absolute bottom-[66px] left-[262px] h-[3px] w-[16px] rounded-full bg-slate-950"
            />
            <span
              data-anim="cable-slack"
              className="absolute bottom-[34px] left-[261px] h-[34px] w-[10px] origin-top rounded-b-full border-x-[3px] border-b-[3px] border-slate-950 opacity-0"
            />
            <div className="absolute bottom-[58px] left-[276px] h-[18px] w-[15px] rounded-[2px] bg-slate-200 ring-1 ring-slate-950/60">
              <span className="absolute left-[4px] top-[7px] h-[4px] w-[2px] rounded-full bg-slate-600" />
              <span className="absolute right-[4px] top-[7px] h-[4px] w-[2px] rounded-full bg-slate-600" />
              <span
                data-anim="plug-socket"
                className="absolute left-[2px] top-[4px] h-[10px] w-[11px] rounded-[2px] bg-slate-800 ring-1 ring-slate-950"
              />
              <span
                data-anim="plug-sparks"
                className="absolute left-[-6px] top-[-6px] h-[28px] w-[28px] bg-amber-200 opacity-0 [clip-path:polygon(50%_0,60%_38%,100%_30%,64%_55%,85%_100%,50%_68%,15%_100%,36%_55%,0_30%,40%_38%)]"
              />
            </div>

            <div
              data-anim="citizen-lean"
              className="absolute bottom-[24px] left-[214px] h-[56px] w-[36px] origin-bottom"
            >
              <span
                data-anim="citizen-arm"
                className="absolute bottom-[22px] left-[28px] h-[8px] w-[32px] origin-[3px_50%] rounded-full bg-[repeating-linear-gradient(90deg,var(--color-sky-200)_0_3px,var(--color-sky-400)_3px_6px)] ring-1 ring-slate-950/50 [transform:rotate(-118deg)]"
              >
                <span className="absolute right-[-4px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                <span
                  data-anim="remote-hand"
                  className="absolute right-[-12px] top-[-1px] h-[5px] w-[14px] rounded-[2px] bg-slate-950 ring-1 ring-slate-600"
                >
                  <span className="absolute right-[2px] top-[1px] h-[2px] w-[2px] rounded-full bg-red-500" />
                </span>
                <span
                  data-anim="plug-hand"
                  className="absolute right-[-12px] top-[-1px] h-[9px] w-[9px] rounded-[1px] bg-slate-700 opacity-0 ring-1 ring-slate-950"
                >
                  <span className="absolute left-[-14px] top-[4px] h-[2px] w-[14px] bg-slate-500" />
                  <span className="absolute right-[-3px] top-[1px] h-px w-[3px] bg-slate-300" />
                  <span className="absolute right-[-3px] bottom-[1px] h-px w-[3px] bg-slate-300" />
                </span>
              </span>
              <span className="absolute bottom-0 left-0 h-[26px] w-[36px] rounded-t-[14px] bg-[repeating-linear-gradient(90deg,var(--color-sky-200)_0_3px,var(--color-sky-400)_3px_6px)] ring-1 ring-slate-950/50" />
              <span
                data-anim="citizen-head"
                className="absolute bottom-[20px] left-[4px] h-[28px] w-[28px] origin-bottom"
              >
                <span className="absolute left-[-3px] top-[11px] h-[8px] w-[6px] rounded-full bg-orange-300 ring-1 ring-slate-950/40" />
                <span className="absolute right-[-3px] top-[11px] h-[8px] w-[6px] rounded-full bg-orange-300 ring-1 ring-slate-950/40" />
                <span className="absolute inset-0 rounded-full bg-orange-200 ring-1 ring-slate-950/50" />
                <span className="absolute inset-x-0 top-0 h-[20px] rounded-t-full rounded-b-[40%] bg-amber-800" />
                <span className="absolute left-[8px] top-[-3px] h-[6px] w-[4px] rotate-[-20deg] rounded-full bg-amber-800" />
                <span className="absolute left-[15px] top-[-2px] h-[5px] w-[3px] rotate-[25deg] rounded-full bg-amber-800" />
              </span>
              <div data-anim="blanket-tremble" className="absolute inset-0">
                <span
                  data-anim="blanket"
                  className="absolute bottom-[2px] left-[-5px] h-[52px] w-[46px] origin-bottom rounded-t-[22px] bg-red-800 bg-[repeating-linear-gradient(90deg,transparent_0_6px,rgba(22,101,52,0.7)_6px_9px),repeating-linear-gradient(0deg,transparent_0_6px,rgba(22,101,52,0.7)_6px_9px)] ring-1 ring-slate-950/60 [transform:scaleY(0.32)]"
                />
              </div>
            </div>

            <div className="absolute bottom-0 left-[110px] h-[40px] w-[160px]">
              <span className="absolute inset-x-[10px] bottom-0 top-[4px] rounded-t-[10px] bg-gradient-to-b from-rose-900 to-rose-950 ring-1 ring-slate-950/70" />
              <span className="absolute bottom-0 left-0 h-[30px] w-[16px] rounded-t-[8px] bg-rose-900 ring-1 ring-slate-950/70" />
              <span className="absolute bottom-0 right-0 h-[30px] w-[16px] rounded-t-[8px] bg-rose-900 ring-1 ring-slate-950/70" />
              <span className="absolute bottom-[6px] left-1/2 h-[26px] w-px bg-slate-950/50" />
              <span
                data-anim="remote-dropped"
                className="absolute left-[70px] top-[1px] h-[5px] w-[14px] rotate-6 rounded-[2px] bg-slate-950 opacity-0 ring-1 ring-slate-600"
              />
            </div>
          </div>
        </div>

        <div
          data-anim="pov-hand"
          className="absolute bottom-[6px] right-[14%] z-30 h-[80px] w-[70px]"
        >
          <span className="absolute bottom-0 right-0 h-[40px] w-[34px] origin-bottom-right -rotate-[32deg] rounded-t-[10px] bg-[repeating-linear-gradient(90deg,var(--color-sky-200)_0_5px,var(--color-sky-400)_5px_10px)] ring-1 ring-slate-950/50" />
          <span className="absolute bottom-[30px] right-[28px] h-[26px] w-[26px] rounded-[10px] bg-orange-200 ring-1 ring-slate-950/50" />
          <span className="absolute bottom-[40px] right-[22px] h-[12px] w-[40px] origin-right -rotate-[28deg] rounded-[4px] bg-slate-900 ring-1 ring-slate-600">
            <span className="absolute left-[4px] top-[3px] h-[5px] w-[5px] rounded-full bg-red-500" />
            <span className="absolute left-[13px] top-[4px] h-[3px] w-[3px] rounded-full bg-slate-500" />
            <span className="absolute left-[19px] top-[4px] h-[3px] w-[3px] rounded-full bg-slate-500" />
          </span>
          <span className="absolute bottom-[44px] right-[30px] h-[9px] w-[16px] -rotate-[28deg] rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
          <span
            data-anim="pov-ir"
            className="absolute bottom-[58px] left-[-6px] h-[14px] w-[14px] rounded-full bg-red-500/70 opacity-0 blur-[3px]"
          />
        </div>
      </SceneFrame>
    </div>
  );
}
