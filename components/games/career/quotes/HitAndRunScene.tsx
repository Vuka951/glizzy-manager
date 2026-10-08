'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import SponsorUniform from '@/components/games/career/quotes/SponsorUniform';
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
import type { SponsorId } from '@/lib/utils/careerSave';
import { isSponsorId } from '@/lib/utils/careerSponsors';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 2400;
// Matches the lineStartMs of this scene's definition: the run-over, the
// call and the police arriving all happen before the line
const LINE_START_MS = 4200;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The skid-crash, phone-beep and police-siren cues land on these beats
const CAR_IN_MS = 950;
const HIT_MS = 1350;
const CAR_STOP_MS = 1800;
const EXIT_MS = 1900;
const CALL_MS = 2250;
const HANG_UP_MS = 3300;
const POLICE_IN_MS = 2900;
const POLICE_STOP_MS = 3500;
const OFFICERS_OUT_MS = 3600;
const REACH_MS = 4100;
const CUFF_MS = 4400;
const DRAG_MS = 5200;
const GONE_MS = 6100;

const officerPath = (from: number, to: number, out: number) =>
  sceneTimeline(TOTAL_MS, [
    [0, { left: `${from}%`, opacity: 0 }],
    [OFFICERS_OUT_MS, { left: `${from}%`, opacity: 0 }],
    [OFFICERS_OUT_MS + 100, { left: `${from}%`, opacity: 1 }],
    [REACH_MS, { left: `${to}%`, opacity: 1 }],
    [DRAG_MS, { left: `${to}%`, opacity: 1 }],
    [GONE_MS, { left: `${out}%`, opacity: 1 }],
    [TOTAL_MS, { left: `${out}%`, opacity: 1 }],
  ]);

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'car-in': sceneTimeline(TOTAL_MS, [
    [0, { left: '-48%' }],
    [CAR_IN_MS, { left: '-48%' }],
    [HIT_MS, { left: '-6%' }],
    [CAR_STOP_MS, { left: '60%' }],
    [TOTAL_MS, { left: '60%' }],
  ]),
  'car-skid': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'rotate(0deg)' }],
    [CAR_STOP_MS - 150, { transform: 'rotate(0deg)' }],
    [CAR_STOP_MS, { transform: 'rotate(-3deg)' }],
    [CAR_STOP_MS + 200, { transform: 'rotate(0deg)' }],
    [TOTAL_MS, { transform: 'rotate(0deg)' }],
  ]),
  flatten: sceneTimeline(TOTAL_MS, [
    [0, { transform: 'translateY(0) scale(1, 1) rotate(0deg)' }],
    [HIT_MS, { transform: 'translateY(0) scale(1, 1) rotate(0deg)' }],
    [
      HIT_MS + 90,
      { transform: 'translateY(56px) scale(1.3, 0.2) rotate(0deg)' },
    ],
    [REACH_MS, { transform: 'translateY(56px) scale(1.3, 0.2) rotate(0deg)' }],
    [
      REACH_MS + 250,
      { transform: 'translateY(4px) scale(0.95, 0.85) rotate(-12deg)' },
    ],
    [
      TOTAL_MS,
      { transform: 'translateY(4px) scale(0.95, 0.85) rotate(-12deg)' },
    ],
  ]),
  'drag-off': sceneTimeline(TOTAL_MS, [
    [0, { left: '30%' }],
    [DRAG_MS, { left: '30%' }],
    [GONE_MS, { left: '-22%' }],
    [TOTAL_MS, { left: '-22%' }],
  ]),
  'cuffs-on': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'scale(1.6)' }],
    [CUFF_MS, { opacity: 0, transform: 'scale(1.6)' }],
    [CUFF_MS + 150, { opacity: 1, transform: 'scale(1)' }],
    [TOTAL_MS, { opacity: 1, transform: 'scale(1)' }],
  ]),
  'police-in': sceneTimeline(TOTAL_MS, [
    [0, { left: '-40%' }],
    [POLICE_IN_MS, { left: '-40%' }],
    [POLICE_STOP_MS, { left: '-6%' }],
    [TOTAL_MS, { left: '-6%' }],
  ]),
  'officer-one': officerPath(4, 20, -30),
  'officer-two': officerPath(8, 40, -12),
  'step-out': sceneTimeline(TOTAL_MS, [
    [0, { left: '66%', opacity: 0 }],
    [EXIT_MS, { left: '66%', opacity: 0 }],
    [EXIT_MS + 100, { left: '66%', opacity: 1 }],
    [EXIT_MS + 400, { left: '50%', opacity: 1 }],
    [TOTAL_MS, { left: '50%', opacity: 1 }],
  ]),
  'phone-up': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: 'translateY(16px)' }],
    [CALL_MS - 150, { opacity: 0, transform: 'translateY(16px)' }],
    [CALL_MS, { opacity: 1, transform: 'translateY(0)' }],
    [HANG_UP_MS, { opacity: 1, transform: 'translateY(0)' }],
    [HANG_UP_MS + 200, { opacity: 0, transform: 'translateY(16px)' }],
    [TOTAL_MS, { opacity: 0, transform: 'translateY(16px)' }],
  ]),
  'siren-wash': sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [POLICE_IN_MS, { opacity: 0 }],
    [POLICE_IN_MS + 400, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  'flash-red': {
    keyframes: [
      { opacity: 1 },
      { opacity: 1, offset: 0.45 },
      { opacity: 0.15, offset: 0.5 },
      { opacity: 0.15 },
    ],
    options: { duration: 500, iterations: Infinity, easing: 'linear' },
  },
  'flash-blue': {
    keyframes: [
      { opacity: 0.15 },
      { opacity: 0.15, offset: 0.45 },
      { opacity: 1, offset: 0.5 },
      { opacity: 1 },
    ],
    options: { duration: 500, iterations: Infinity, easing: 'linear' },
  },
  'walk-bob': {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-3px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 240, iterations: Infinity, easing: 'ease-in-out' },
  },
};

type Livery = 'own' | 'police' | SponsorId;

const LIVERY_BODY: Record<Livery, string> = {
  own: 'from-red-600 to-red-800',
  police: 'from-slate-100 to-slate-300',
  zidari: 'from-stone-400 to-stone-600',
  ostrvo: 'from-emerald-500 to-emerald-700',
  korporacija: 'from-zinc-800 to-zinc-950',
  stranka: 'from-rose-800 to-rose-950',
};

const LIVERY_STRIPE: Partial<Record<Livery, string>> = {
  police: 'bg-blue-800',
  zidari: 'bg-orange-800 text-stone-50',
  ostrvo: 'bg-amber-200 text-emerald-900',
  korporacija: 'bg-yellow-300 text-zinc-950',
  stranka: 'bg-amber-300 text-rose-950',
};

const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

function Car({ livery }: { livery: Livery }) {
  const body = LIVERY_BODY[livery];
  const stripe = LIVERY_STRIPE[livery];
  return (
    <>
      <span
        className={`absolute bottom-[38%] left-[20%] h-[42%] w-[50%] rounded-t-[45%] bg-gradient-to-b ${body}`}
      >
        <span className="absolute bottom-[12%] left-[10%] h-[58%] w-[36%] rounded-tl-[60%] bg-sky-950/80" />
        <span className="absolute bottom-[12%] right-[10%] h-[58%] w-[36%] rounded-tr-[60%] bg-sky-950/80" />
        {livery === 'police' && (
          <span className="absolute -top-2 left-1/2 flex h-2 w-8 -translate-x-1/2 overflow-hidden rounded-t-sm">
            <span data-anim="flash-red" className="h-full w-1/2 bg-red-500" />
            <span data-anim="flash-blue" className="h-full w-1/2 bg-blue-500" />
          </span>
        )}
      </span>
      <span
        className={`absolute bottom-[14%] inset-x-0 h-[36%] rounded-xl bg-gradient-to-b ${body} shadow-lg`}
      >
        {stripe && (
          <span
            className={`absolute inset-x-[8%] top-[34%] flex h-[34%] items-center gap-1 overflow-hidden px-1 ${stripe}`}
          >
            {isSponsorId(livery) && (
              <>
                <SponsorEmblem
                  sponsorId={livery}
                  className="h-3 w-3 shrink-0"
                />
                <span className="truncate text-[6px] font-black uppercase leading-none tracking-wide">
                  {SPONSOR_NAMES[livery]}
                </span>
              </>
            )}
          </span>
        )}
        <span className="absolute right-0.5 top-[20%] h-1.5 w-2 rounded-sm bg-yellow-100" />
      </span>
      <span className="absolute bottom-0 left-[12%] aspect-square h-[36%] rounded-full bg-slate-950 ring-2 ring-slate-500" />
      <span className="absolute bottom-0 right-[12%] aspect-square h-[36%] rounded-full bg-slate-950 ring-2 ring-slate-500" />
    </>
  );
}

function Officer({
  anim,
  sponsor,
}: {
  anim: string;
  sponsor: SponsorId | null;
}) {
  return (
    <div
      data-anim={anim}
      className="absolute bottom-[16%] z-20 h-[74px] w-11 opacity-0"
    >
      <div data-anim="walk-bob" className="absolute inset-0">
        {sponsor ? (
          <SponsorUniform sponsor={sponsor} />
        ) : (
          <>
            <span className="absolute bottom-0 left-2 h-5 w-2.5 rounded-b-sm bg-slate-900" />
            <span className="absolute bottom-0 right-2 h-5 w-2.5 rounded-b-sm bg-slate-900" />
            <span className="absolute bottom-4 left-0.5 h-8 w-10 rounded-t-xl bg-blue-900">
              <span className="absolute left-2 top-2 h-2 w-1.5 rounded-sm bg-amber-300" />
            </span>
            <span className="absolute bottom-11 left-2 h-7 w-7 rounded-full bg-orange-200 ring-2 ring-slate-950/40" />
            <span className="absolute bottom-[68px] left-1.5 h-2.5 w-8 rounded-t-md bg-blue-950" />
            <span className="absolute bottom-[66px] left-4 h-1 w-6 rounded-full bg-slate-950" />
          </>
        )}
      </div>
    </div>
  );
}

export default function HitAndRunScene({
  speaker,
  other,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const sponsor = isSponsorId(variant) ? variant : null;
  const lead = characterBySlug(speaker);
  const victim = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other, sponsor]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900"
        floor="bg-gradient-to-b from-slate-700 to-slate-800"
      >
        <div className="absolute bottom-[18%] left-[6%] h-[52%] w-[62%] rounded-t-md bg-slate-900 shadow-[0_0_30px_rgba(2,6,23,0.8)]">
          <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-slate-950 px-2 py-0.5 text-[9px] font-black tracking-[0.25em] text-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.4)]">
            {GAMES_UI.cup.studio.title}
          </span>
          <span className="absolute inset-x-[8%] top-[40%] h-[14%] bg-[repeating-linear-gradient(90deg,rgba(254,240,138,0.35)_0,rgba(254,240,138,0.35)_10px,transparent_10px,transparent_18px)]" />
        </div>
        <div className="absolute bottom-[18%] right-[8%] h-[64%] w-1 bg-slate-600">
          <span className="absolute -left-2 top-0 h-1.5 w-5 rounded-full bg-slate-500" />
          <span className="absolute -left-1 top-1 h-2 w-3 rounded-b-full bg-yellow-100 shadow-[0_0_20px_6px_rgba(254,240,138,0.45)]" />
        </div>
        <div className="absolute bottom-[18%] right-[0%] h-[62%] w-[26%] bg-gradient-to-b from-yellow-100/15 to-yellow-100/0 [clip-path:polygon(60%_0,72%_0,100%_100%,20%_100%)]" />
        <span className="absolute bottom-[8%] inset-x-0 h-1 bg-[repeating-linear-gradient(90deg,rgba(231,229,228,0.5)_0,rgba(231,229,228,0.5)_22px,transparent_22px,transparent_40px)]" />

        {!sponsor && (
          <div
            data-anim="siren-wash"
            className="pointer-events-none absolute inset-0 z-40 opacity-0"
          >
            <span
              data-anim="flash-red"
              className="absolute inset-0 bg-red-500/10"
            />
            <span
              data-anim="flash-blue"
              className="absolute inset-0 bg-blue-500/10"
            />
          </div>
        )}

        <div
          data-anim="drag-off"
          className="absolute bottom-[36%] left-[30%] z-20 h-14 w-14"
        >
          <SceneActor
            character={victim}
            className="bottom-0 left-0"
            anim="flatten"
            pose="origin-bottom"
            size="h-14 w-14"
          >
            <span className="absolute left-1/2 top-[calc(100%-4px)] -z-10 h-[30px] w-11 -translate-x-1/2 rounded-t-2xl bg-gradient-to-b from-emerald-700 to-emerald-900">
              <span className="absolute left-[18%] top-full h-[14px] w-[28%] rounded-b-md bg-slate-800" />
              <span className="absolute right-[18%] top-full h-[14px] w-[28%] rounded-b-md bg-slate-800" />
              <span
                data-anim="cuffs-on"
                className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-0.5 opacity-0"
              >
                <span className="h-3 w-3 rounded-full border-2 border-slate-300" />
                <span className="h-3 w-3 rounded-full border-2 border-slate-300" />
              </span>
            </span>
          </SceneActor>
        </div>

        <Officer anim="officer-one" sponsor={sponsor} />
        <Officer anim="officer-two" sponsor={sponsor} />

        <div
          data-anim="police-in"
          className="absolute bottom-[14%] left-[-40%] z-30 h-[26%] w-[34%]"
        >
          <Car livery={sponsor ?? 'police'} />
        </div>

        <div
          data-anim="car-in"
          className="absolute bottom-[14%] left-[-48%] z-30 h-[26%] w-[36%]"
        >
          <div data-anim="car-skid" className="absolute inset-0 origin-bottom">
            <Car livery="own" />
          </div>
        </div>

        <div
          data-anim="step-out"
          className="absolute bottom-[36%] left-[66%] z-40 h-14 w-14 opacity-0"
        >
          <SceneActor
            character={lead}
            className="bottom-0 left-0"
            anim="talk"
            animDelay={LINE_START_MS}
            animIterations={TALK_ITERATIONS}
            pose="origin-bottom"
            size="h-14 w-14"
          >
            <span
              data-anim="spotlight"
              data-anim-delay={LINE_START_MS}
              data-anim-duration={LINE_MS}
              className="absolute -inset-3 -z-10 rounded-full bg-amber-100/25 opacity-0 blur-md"
            />
            <span className="absolute left-1/2 top-[calc(100%-4px)] -z-10 h-[30px] w-11 -translate-x-1/2 rounded-t-2xl bg-gradient-to-b from-slate-800 to-slate-950">
              <span className="absolute left-[18%] top-full h-[14px] w-[28%] rounded-b-md bg-slate-900" />
              <span className="absolute right-[18%] top-full h-[14px] w-[28%] rounded-b-md bg-slate-900" />
            </span>
            <span
              data-anim="phone-up"
              className="absolute -right-2 top-5 opacity-0"
            >
              <span className="absolute left-0 top-0 h-4 w-4 rounded-full bg-orange-200 ring-1 ring-slate-950/50" />
              <span className="absolute -top-2 left-1 h-5 w-2.5 rounded-sm bg-slate-950 ring-1 ring-sky-300/60" />
            </span>
          </SceneActor>
        </div>
      </SceneFrame>
    </div>
  );
}
