'use client';

import { useRef } from 'react';
import ElectionLossBanner from '@/components/games/career/quotes/ElectionLossBanner';
import ElectionLossFlagCloth from '@/components/games/career/quotes/ElectionLossFlagCloth';
import PortraitHead from '@/components/games/PortraitHead';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import { GAMES_UI } from '@/data/games/locale';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import type { SponsorId } from '@/lib/utils/careerSave';
import { lossOfVariant } from '@/lib/utils/careerElectionScenes';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_START_MS = 3000;
const LINE_MS = 4000;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
// The tv-click, footsteps, flag-rustle, sob, violin, sniff, deflate-hiss and
// second sob cues of the definition land on these
const CLICK_MS = 1000;
const TURN_MS = 1300;
const PULL_MS = 2000;
const KNEEL_MS = 2700;
const VIOLIN_MS = 3000;
const WIPE_MS = 4200;
const DEFLATE_MS = 5200;
const SOB_AGAIN_MS = 6000;

const WALK_PX = 96;
const BANNER_TEXT = GAMES_UI.career.quoteCutscene.flagSobBanner;

const BAR: Record<SponsorId, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-400',
  yellow: 'bg-yellow-300',
  red: 'bg-red-500',
};

const tl = (frames: [number, Keyframe][]) => sceneTimeline(TOTAL_MS, frames);
const at = (ms: number, transform: string): [number, Keyframe] => [
  ms,
  { transform },
];
const shown = (ms: number, opacity: number): [number, Keyframe] => [
  ms,
  { opacity },
];

const heave = (lift: number, beat: number): SceneAnimationSpec => ({
  keyframes: [
    { transform: 'translateY(0)' },
    { transform: `translateY(${-lift}px)`, offset: 0.25 },
    { transform: 'translateY(0)', offset: 0.45 },
    { transform: `translateY(${-lift * 0.7}px)`, offset: 0.65 },
    { transform: 'translateY(0)' },
  ],
  options: { duration: beat, iterations: Infinity, easing: 'ease-in-out' },
});

const step = (side: 1 | -1) =>
  tl([
    at(0, 'rotate(0deg)'),
    at(TURN_MS, 'rotate(0deg)'),
    at(TURN_MS + 150, `rotate(${side * 16}deg)`),
    at(TURN_MS + 300, `rotate(${-side * 16}deg)`),
    at(TURN_MS + 450, `rotate(${side * 16}deg)`),
    at(PULL_MS - 200, `rotate(${-side * 10}deg)`),
    at(PULL_MS, 'rotate(0deg)'),
    at(TOTAL_MS, 'rotate(0deg)'),
  ]);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  walk: tl([
    at(0, 'translate(0, 0)'),
    at(TURN_MS, 'translate(0, 0)'),
    at(TURN_MS + 150, `translate(${WALK_PX * 0.25}px, -3px)`),
    at(TURN_MS + 300, `translate(${WALK_PX * 0.5}px, 0)`),
    at(TURN_MS + 450, `translate(${WALK_PX * 0.75}px, -3px)`),
    at(PULL_MS - 100, `translate(${WALK_PX}px, 0)`),
    at(TOTAL_MS, `translate(${WALK_PX}px, 0)`),
  ]),
  'leg-a': step(1),
  'leg-b': step(-1),
  legs: tl([
    at(0, 'scaleY(1)'),
    at(KNEEL_MS - 150, 'scaleY(1)'),
    at(KNEEL_MS + 100, 'scaleY(0.38)'),
    at(TOTAL_MS, 'scaleY(0.38)'),
  ]),
  kneel: tl([
    at(0, 'translateY(0) rotate(0deg)'),
    at(CLICK_MS - 40, 'translateY(1px) rotate(0deg)'),
    at(CLICK_MS + 80, 'translateY(-2px) rotate(0deg)'),
    at(CLICK_MS + 250, 'translateY(2px) rotate(-3deg)'),
    at(TURN_MS, 'translateY(2px) rotate(-3deg)'),
    at(TURN_MS + 200, 'translateY(3px) rotate(4deg)'),
    at(PULL_MS - 200, 'translateY(3px) rotate(4deg)'),
    at(PULL_MS, 'translateY(-3px) rotate(-6deg)'),
    at(PULL_MS + 250, 'translateY(1px) rotate(3deg)'),
    at(KNEEL_MS - 150, 'translateY(1px) rotate(3deg)'),
    at(KNEEL_MS + 100, 'translateY(19px) rotate(6deg)'),
    at(TOTAL_MS, 'translateY(19px) rotate(6deg)'),
  ]),
  sob: heave(2, 640),
  'sob-hard': heave(4, 520),
  head: tl([
    at(0, 'translate(-2px, 3px) rotate(-10deg)'),
    at(CLICK_MS - 40, 'translate(-2px, 3px) rotate(-10deg)'),
    at(CLICK_MS + 100, 'translate(-3px, 0) rotate(-14deg)'),
    at(CLICK_MS + 250, 'translate(-2px, 5px) rotate(-6deg)'),
    at(TURN_MS, 'translate(-2px, 5px) rotate(-6deg)'),
    at(TURN_MS + 300, 'translate(1px, 5px) rotate(8deg)'),
    at(PULL_MS - 250, 'translate(1px, 4px) rotate(8deg)'),
    at(PULL_MS - 100, 'translate(2px, -2px) rotate(12deg)'),
    at(PULL_MS + 200, 'translate(0, 4px) rotate(-4deg)'),
    at(KNEEL_MS, 'translate(0, 5px) rotate(-2deg)'),
    at(KNEEL_MS + 200, 'translate(0, 9px) rotate(4deg)'),
    at(WIPE_MS, 'translate(0, 9px) rotate(4deg)'),
    at(WIPE_MS + 150, 'translate(-3px, 9px) rotate(-6deg)'),
    at(WIPE_MS + 300, 'translate(3px, 9px) rotate(8deg)'),
    at(WIPE_MS + 450, 'translate(-3px, 9px) rotate(-6deg)'),
    at(WIPE_MS + 600, 'translate(3px, 9px) rotate(8deg)'),
    at(WIPE_MS + 850, 'translate(0, 6px) rotate(2deg)'),
    at(DEFLATE_MS + 650, 'translate(0, 6px) rotate(2deg)'),
    at(DEFLATE_MS + 750, 'translate(0, 10px) rotate(-3deg)'),
    at(SOB_AGAIN_MS, 'translate(0, 10px) rotate(-3deg)'),
    at(SOB_AGAIN_MS + 200, 'translate(0, 12px) rotate(5deg)'),
    at(TOTAL_MS, 'translate(0, 12px) rotate(5deg)'),
  ]),
  'reach-arm': tl([
    at(0, 'rotate(4deg)'),
    at(PULL_MS - 350, 'rotate(4deg)'),
    at(PULL_MS - 120, 'rotate(-168deg)'),
    at(PULL_MS + 20, 'rotate(-160deg)'),
    at(PULL_MS + 200, 'rotate(-40deg)'),
    shown(PULL_MS + 200, 1),
    [PULL_MS + 220, { transform: 'rotate(-40deg)', opacity: 0 }],
    [TOTAL_MS, { transform: 'rotate(-40deg)', opacity: 0 }],
  ]),
  'idle-arm': tl([
    [0, { opacity: 1 }],
    [PULL_MS + 200, { opacity: 1 }],
    [PULL_MS + 220, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  'pole-cloth': tl([
    [0, { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 }],
    [PULL_MS - 120, { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 }],
    [PULL_MS, { transform: 'translate(-2px, 8px) rotate(-8deg) scale(1)', opacity: 1 }],
    [PULL_MS + 200, { transform: 'translate(-16px, 46px) rotate(-30deg) scale(0.8)', opacity: 1 }],
    [PULL_MS + 220, { transform: 'translate(-16px, 46px) rotate(-30deg) scale(0.8)', opacity: 0 }],
    [TOTAL_MS, { transform: 'translate(-16px, 46px) rotate(-30deg) scale(0.8)', opacity: 0 }],
  ]),
  'held-cloth': tl([
    [0, { transform: 'translate(0, 0) rotate(-8deg)', opacity: 0 }],
    [PULL_MS + 200, { transform: 'translate(0, 0) rotate(-8deg)', opacity: 0 }],
    [PULL_MS + 220, { transform: 'translate(0, 0) rotate(-8deg)', opacity: 1 }],
    [KNEEL_MS, { transform: 'translate(0, 0) rotate(-8deg)', opacity: 1 }],
    [KNEEL_MS + 200, { transform: 'translate(0, -4px) rotate(4deg)', opacity: 1 }],
    [WIPE_MS - 150, { transform: 'translate(0, -4px) rotate(4deg)', opacity: 1 }],
    [WIPE_MS, { transform: 'translate(0, -22px) rotate(0deg)', opacity: 1 }],
    [WIPE_MS + 150, { transform: 'translate(5px, -24px) rotate(6deg)', opacity: 1 }],
    [WIPE_MS + 300, { transform: 'translate(-5px, -22px) rotate(-6deg)', opacity: 1 }],
    [WIPE_MS + 450, { transform: 'translate(5px, -24px) rotate(6deg)', opacity: 1 }],
    [WIPE_MS + 600, { transform: 'translate(-5px, -22px) rotate(-6deg)', opacity: 1 }],
    [WIPE_MS + 850, { transform: 'translate(0, -4px) rotate(4deg)', opacity: 1 }],
    [TOTAL_MS, { transform: 'translate(0, -4px) rotate(4deg)', opacity: 1 }],
  ]),
  'tv-chart': tl([shown(0, 1), shown(CLICK_MS, 1), shown(CLICK_MS + 20, 0), shown(TOTAL_MS, 0)]),
  'tv-crowd': tl([shown(0, 0), shown(CLICK_MS + 60, 0), shown(CLICK_MS + 80, 1), shown(TOTAL_MS, 1)]),
  'tv-static': tl([shown(0, 0), shown(CLICK_MS, 0), shown(CLICK_MS + 20, 0.9), shown(CLICK_MS + 140, 0), shown(TOTAL_MS, 0)]),
  'tv-glow': tl([
    [0, { opacity: 0.25 }],
    [CLICK_MS + 80, { opacity: 0.25 }],
    [CLICK_MS + 140, { opacity: 0.7 }],
    [TOTAL_MS, { opacity: 0.55 }],
  ]),
  bounce: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-4px)' },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 420, iterations: Infinity, easing: 'ease-out' },
  },
  'tv-confetti': {
    keyframes: [
      { transform: 'translateY(-8px) rotate(0deg)', opacity: 1 },
      { transform: 'translateY(60px) rotate(360deg)', opacity: 1 },
    ],
    options: { duration: 1300, iterations: Infinity, easing: 'linear' },
  },
  tears: tl([
    [0, { transform: 'scaleY(0)', opacity: 0 }],
    [KNEEL_MS, { transform: 'scaleY(0)', opacity: 0 }],
    [KNEEL_MS + 100, { transform: 'scaleY(0.3)', opacity: 1 }],
    [KNEEL_MS + 500, { transform: 'scaleY(1)', opacity: 1 }],
    [TOTAL_MS, { transform: 'scaleY(1)', opacity: 1 }],
  ]),
  'cold-light': tl([shown(0, 0), shown(VIOLIN_MS, 0), shown(VIOLIN_MS + 900, 1), shown(TOTAL_MS, 1)]),
  balloon: tl([
    at(0, 'translate(0, 0) rotate(-4deg) scale(1, 1)'),
    at(DEFLATE_MS, 'translate(0, 0) rotate(4deg) scale(1, 1)'),
    at(DEFLATE_MS + 120, 'translate(-14px, -10px) rotate(-40deg) scale(0.85, 0.9)'),
    at(DEFLATE_MS + 240, 'translate(10px, -16px) rotate(50deg) scale(0.75, 0.8)'),
    at(DEFLATE_MS + 360, 'translate(-12px, -6px) rotate(-60deg) scale(0.65, 0.7)'),
    at(DEFLATE_MS + 480, 'translate(6px, 4px) rotate(30deg) scale(0.6, 0.55)'),
    at(DEFLATE_MS + 750, 'translate(2px, 56px) rotate(-20deg) scale(0.62, 0.42)'),
    at(DEFLATE_MS + 800, 'translate(0, 72px) rotate(10deg) scale(1, 0.4)'),
    at(TOTAL_MS, 'translate(0, 72px) rotate(10deg) scale(1, 0.4)'),
  ]),
  'balloon-string': tl([
    shown(0, 1),
    shown(DEFLATE_MS, 1),
    shown(DEFLATE_MS + 100, 0),
    shown(TOTAL_MS, 0),
  ]),
};

const CONFETTI = [
  'bottom-[-6px] left-[20px] rotate-12 bg-amber-300',
  'bottom-[-14px] left-[52px] -rotate-45 bg-red-400',
  'bottom-[-4px] left-[88px] rotate-90 bg-sky-300',
  'bottom-[-22px] left-[110px] rotate-45 bg-cyan-200',
  'bottom-[-9px] left-[146px] -rotate-12 bg-amber-300',
  'bottom-[-26px] left-[176px] rotate-45 bg-red-400',
  'bottom-[-12px] left-[214px] rotate-90 bg-emerald-300',
  'bottom-[-30px] left-[240px] -rotate-45 bg-sky-300',
  'bottom-[-18px] left-[268px] rotate-12 bg-amber-300',
  'bottom-[-6px] left-[330px] -rotate-12 bg-cyan-200',
  'bottom-[-24px] left-[316px] rotate-90 bg-red-400',
  'bottom-[-32px] left-[70px] rotate-12 bg-emerald-300',
  'bottom-[-30px] left-[136px] rotate-90 bg-amber-300',
];

const DEAD_BALLOONS = [
  'bottom-[-14px] left-[34px] -rotate-12',
  'bottom-[-24px] left-[196px] rotate-[24deg]',
  'bottom-[-8px] left-[338px] rotate-[70deg]',
];

// The back rows nobody sat in, one knocked over, across the whole hall
const CHAIRS = Array.from({ length: 36 }, (_, index) => index);
const FALLEN_CHAIR = 17;
// Campaign posters of the man himself along the wall, the odd one torn
const POSTERS = Array.from({ length: 8 }, (_, index) => index);
// Only past the set, so on a wide stage the hall goes on and on a narrow
// one nothing crowds the man
const POSTER_WALLS = [
  'left-0 right-[calc(50%+214px)] flex-row-reverse',
  'left-[calc(50%+214px)] right-0',
];
const POSTER_TILT = ['rotate-2', '-rotate-1', 'rotate-0', '-rotate-3'];

const FANS = Array.from({ length: 10 }, (_, index) => index);
const TV_CONFETTI = [
  'left-[12%] bg-amber-300',
  'left-[30%] bg-sky-300',
  'left-[52%] bg-red-400',
  'left-[70%] bg-emerald-300',
  'left-[88%] bg-amber-200',
];

export default function ElectionFlagSobScene({
  speaker,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const loser = characterBySlug(speaker);
  const { loser: party, winner } = lossOfVariant(variant);
  const others = SPONSOR_IDS.filter((id) => id !== party && id !== winner);
  useSceneAnimation(root, CUSTOM, [speaker, variant]);

  const chart = [
    { id: winner, h: 'h-[38px]' },
    { id: others[0], h: 'h-[20px]' },
    { id: others[1], h: 'h-[14px]' },
    { id: party, h: 'h-[3px]' },
  ];

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor="bg-gradient-to-b from-stone-800 to-stone-900"
      >
        <span className="absolute inset-x-0 bottom-[18%] h-1.5 bg-slate-950/70" />
        <span
          data-anim="cold-light"
          className="absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_60%_55%,transparent_18%,rgba(2,6,23,0.55)_70%)] opacity-0"
        />

        {POSTER_WALLS.map((wall) => (
        <div
          key={wall}
          className={`absolute bottom-[44%] flex gap-[38px] overflow-hidden opacity-50 ${wall}`}
        >
          {POSTERS.map((index) => (
            <span
              key={index}
              className={`relative h-[44px] w-[32px] shrink-0 overflow-hidden rounded-[2px] bg-slate-200 shadow-md ${
                POSTER_TILT[index % POSTER_TILT.length]
              } ${index % 5 === 2 ? '[clip-path:polygon(0_0,100%_0,100%_38%,62%_56%,30%_44%,0_62%)]' : ''}`}
            >
              <PortraitHead
                character={loser}
                className="absolute left-[4px] top-[3px] h-[24px] w-[24px] border-0"
              />
              <span
                className={`absolute inset-x-0 bottom-0 flex h-[13px] items-center justify-center ${BAR[party]}`}
              >
                <SponsorEmblem sponsorId={party} className="h-[9px] w-[9px]" />
              </span>
            </span>
          ))}
        </div>
        ))}
        <div className="absolute inset-x-0 bottom-[19%] flex justify-center gap-[9px]">
          {CHAIRS.map((index) => (
            <span
              key={index}
              className={`relative h-[30px] w-[18px] shrink-0 ${
                index === FALLEN_CHAIR
                  ? 'origin-bottom-left translate-y-[3px] rotate-[78deg]'
                  : ''
              }`}
            >
              <span className="absolute left-[2px] top-0 h-[14px] w-[14px] rounded-t-[3px] bg-slate-500/70" />
              <span className="absolute bottom-[11px] left-0 h-[3px] w-[18px] rounded-[1px] bg-slate-500/80" />
              <span className="absolute bottom-0 left-[2px] h-[12px] w-[2px] -rotate-12 bg-slate-600" />
              <span className="absolute bottom-0 right-[2px] h-[12px] w-[2px] rotate-12 bg-slate-600" />
            </span>
          ))}
        </div>

        <div className="absolute bottom-[16%] left-1/2 h-0 w-[360px] origin-bottom -translate-x-1/2 scale-[0.9] sm:scale-[1.14]">
          <div className="absolute bottom-[84px] left-[6px] h-[78px] w-[128px] rounded-md bg-slate-950 p-[5px] shadow-[0_6px_20px_rgba(2,6,23,0.7)] ring-1 ring-slate-600">
            <span className="absolute -bottom-[10px] left-1/2 h-[10px] w-[6px] -translate-x-1/2 bg-slate-700" />
            <div className="relative h-full w-full overflow-hidden rounded-sm bg-slate-800">
              <div
                data-anim="tv-chart"
                className="absolute inset-0 flex items-end justify-center gap-[7px] bg-gradient-to-b from-sky-950 to-slate-900 pb-[6px]"
              >
                {chart.map((bar) => (
                  <span key={bar.id} className="flex flex-col items-center gap-[2px]">
                    <span className={`w-[14px] rounded-t-[1px] ${BAR[bar.id]} ${bar.h}`} />
                    <SponsorEmblem sponsorId={bar.id} className="h-[11px] w-[11px]" />
                  </span>
                ))}
              </div>
              <div
                data-anim="tv-crowd"
                className="absolute inset-0 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900 opacity-0"
              >
                <span className="absolute left-1/2 top-[6%] h-[34px] w-[54px] -translate-x-1/2 bg-amber-100/15 blur-md" />
                <ElectionLossFlagCloth
                  party={winner}
                  className="absolute left-1/2 top-[8%] h-[22px] w-[34px] -translate-x-1/2 shadow-md"
                />
                {TV_CONFETTI.map((cls, index) => (
                  <span
                    key={cls}
                    data-anim="tv-confetti"
                    data-anim-delay={index * 260}
                    className={`absolute top-0 h-[3px] w-[2px] ${cls}`}
                  />
                ))}
                <div className="absolute inset-x-[-4px] bottom-[14px] flex justify-between">
                  {FANS.map((index) => (
                    <span
                      key={index}
                      data-anim="bounce"
                      data-anim-delay={(index * 137) % 420}
                      className="relative h-[16px] w-[11px]"
                    >
                      <span className="absolute left-[1px] top-0 h-[9px] w-[9px] rounded-full bg-orange-200/90" />
                      <span className="absolute bottom-0 left-0 h-[8px] w-[11px] rounded-t-[4px] bg-slate-950/80" />
                      {index % 3 === 1 && (
                        <span className="absolute -top-[9px] left-[7px] h-[12px] w-px bg-slate-200">
                          <ElectionLossFlagCloth
                            party={winner}
                            emblem={false}
                            className="absolute left-px top-0 h-[6px] w-[9px] animate-[flagwave_1.4s_ease-in-out_infinite]"
                          />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex h-[13px] items-center gap-[3px] bg-slate-950/90 px-[4px]">
                  <SponsorEmblem sponsorId={winner} className="h-[9px] w-[9px] shrink-0" />
                  <span className={`h-[5px] w-[44px] rounded-r-[1px] ${BAR[winner]}`} />
                  <span className="w-[6px]" />
                  <SponsorEmblem sponsorId={party} className="h-[9px] w-[9px] shrink-0" />
                  <span className={`h-[5px] w-[3px] rounded-r-[1px] ${BAR[party]}`} />
                </div>
              </div>
              <span
                data-anim="tv-static"
                className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(226,232,240,0.9)_0,rgba(226,232,240,0.9)_1px,rgba(15,23,42,0.9)_1px,rgba(15,23,42,0.9)_3px)] opacity-0"
              />
            </div>
          </div>
          <span
            data-anim="tv-glow"
            className="absolute bottom-[40px] left-[110px] h-[90px] w-[150px] rounded-full bg-sky-300/20 opacity-25 blur-2xl"
          />

          <div className="absolute bottom-[150px] left-[150px] h-[16px] w-[150px] origin-right [transform:rotate(-14deg)]">
            <ElectionLossBanner
              party={party}
              text={BANNER_TEXT}
              className="absolute inset-0 text-[10px]"
            />
            <span className="absolute -top-[16px] right-[-1px] h-[17px] w-px bg-slate-500" />
          </div>
          <span className="absolute bottom-[166px] right-[58px] h-[4px] w-[4px] rounded-full bg-slate-500" />


          {CONFETTI.map((cls) => (
            <span
              key={cls}
              className={`absolute h-[6px] w-[3px] rounded-[1px] opacity-60 ${cls}`}
            />
          ))}
          {DEAD_BALLOONS.map((cls) => (
            <span
              key={cls}
              className={`absolute h-[7px] w-[13px] rounded-[45%_55%_40%_60%] opacity-70 ${BAR[party]} ${cls}`}
            >
              <span className="absolute right-[-5px] top-[3px] h-px w-[6px] bg-slate-400" />
            </span>
          ))}

          <div className="absolute bottom-0 left-[306px] h-[146px] w-[24px]">
            <span className="absolute bottom-0 left-0 h-[4px] w-[24px] rounded-full bg-slate-700" />
            <span className="absolute bottom-0 left-[3px] h-[10px] w-[3px] rotate-[35deg] bg-slate-600" />
            <span className="absolute bottom-0 right-[3px] h-[10px] w-[3px] -rotate-[35deg] bg-slate-600" />
            <span className="absolute bottom-0 left-[11px] top-[4px] w-[3px] rounded-full bg-gradient-to-r from-slate-300 to-slate-500" />
            <span className="absolute left-[10px] top-0 h-[6px] w-[6px] rounded-full bg-amber-300" />
          </div>
          <div
            data-anim="pole-cloth"
            className="absolute bottom-[104px] left-[270px] z-10 h-[32px] w-[46px] origin-right"
          >
            <ElectionLossFlagCloth
              party={party}
              className="absolute inset-0 animate-[flagwave_2.6s_ease-in-out_infinite] rounded-l-sm shadow-md"
            />
          </div>

          <span
            data-anim="cold-light"
            className="absolute bottom-[-6px] left-[214px] z-10 h-[190px] w-[120px] bg-gradient-to-b from-sky-100/0 via-sky-100/10 to-sky-100/20 opacity-0 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]"
          />

          <div
            data-anim="walk"
            className="absolute bottom-0 left-[150px] z-20 h-32 w-14"
          >
            <span
              data-anim="legs"
              className="absolute inset-x-0 bottom-0 h-7 origin-bottom"
            >
              <span
                data-anim="leg-a"
                className="absolute bottom-0 left-[14px] h-7 w-3 origin-top rounded-b-md bg-slate-900"
              />
              <span
                data-anim="leg-b"
                className="absolute bottom-0 right-[14px] h-7 w-3 origin-top rounded-b-md bg-slate-900"
              />
            </span>
            <div
              data-anim="kneel sob sob-hard"
              data-anim-delay={`0 ${KNEEL_MS} ${SOB_AGAIN_MS}`}
              className="absolute inset-0 origin-bottom"
            >
              <span
                data-anim="idle-arm"
                className="absolute bottom-[32px] left-[2px] h-[32px] w-3 origin-top rotate-[8deg] rounded-full bg-slate-700"
              >
                <span className="absolute -bottom-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              </span>
              <span className="absolute bottom-6 left-1 h-11 w-12 overflow-hidden rounded-t-2xl bg-gradient-to-b from-slate-700 to-slate-800">
                <span className="absolute left-1/2 top-0 h-[16px] w-[12px] -translate-x-1/2 bg-slate-100 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                <span className={`absolute left-1/2 top-[2px] h-[14px] w-[4px] -translate-x-1/2 rounded-b-full ${BAR[party]}`} />
              </span>
              <SponsorEmblem
                sponsorId={party}
                className="absolute bottom-[50px] left-[8px] h-[10px] w-[10px]"
              />
              <SceneActor
                character={loser}
                className="bottom-[58px] left-1/2 -translate-x-1/2"
                anim="head"
                pose="origin-bottom"
                size="h-12 w-12"
              >
                <span
                  data-anim="tears"
                  className="absolute left-[26%] top-[46%] z-10 h-[22px] w-[3px] origin-top rounded-full bg-sky-300/90 opacity-0"
                />
                <span
                  data-anim="tears"
                  className="absolute right-[26%] top-[46%] z-10 h-[22px] w-[3px] origin-top rounded-full bg-sky-300/90 opacity-0"
                />
                {[0, 1, 2].map((drop) => (
                  <span
                    key={drop}
                    data-anim="drip"
                    data-anim-delay={KNEEL_MS + 300 + drop * 470}
                    className={`absolute top-[86%] z-10 h-[5px] w-[4px] rounded-full bg-sky-300 opacity-0 ${
                      drop === 1 ? 'right-[24%]' : 'left-[24%]'
                    }`}
                  />
                ))}
              </SceneActor>
              <span
                data-anim="reach-arm"
                className="absolute bottom-[32px] right-[2px] z-30 h-[32px] w-3 origin-top rotate-[4deg] rounded-full bg-slate-700"
              >
                <span className="absolute -bottom-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              </span>
              <div
                data-anim="held-cloth"
                className="absolute bottom-[26px] left-[4px] z-30 h-[30px] w-[48px] opacity-0"
              >
                <ElectionLossFlagCloth
                  party={party}
                  className="absolute inset-0 rounded-[40%_30%_45%_35%] shadow-lg ring-1 ring-slate-950/30"
                />
                <span className="absolute left-[-4px] top-[10px] h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                <span className="absolute right-[-4px] top-[8px] h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              </div>
            </div>
          </div>

          <div
            data-anim="sob sob-hard"
            data-anim-delay={`${KNEEL_MS} ${SOB_AGAIN_MS}`}
            className="absolute bottom-[150px] left-[262px] z-40 h-[30px] w-[24px]"
          >
            <span
              data-anim="balloon-string"
              className="absolute left-[11px] top-[29px] h-[34px] w-px bg-slate-400/70"
            />
            <span
              data-anim="balloon"
              className={`absolute inset-0 origin-bottom rounded-[50%_50%_46%_46%] shadow-[inset_-4px_-5px_0_rgba(2,6,23,0.25)] ${BAR[party]}`}
            >
              <span className="absolute left-[5px] top-[5px] h-[6px] w-[4px] rotate-[20deg] rounded-full bg-white/50" />
              <span className={`absolute bottom-[-3px] left-1/2 h-[4px] w-[5px] -translate-x-1/2 [clip-path:polygon(50%_0,100%_100%,0_100%)] ${BAR[party]}`} />
            </span>
          </div>
        </div>
      </SceneFrame>
    </div>
  );
}
