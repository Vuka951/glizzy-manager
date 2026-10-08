'use client';

import { useRef } from 'react';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import SponsorUniform from '@/components/games/career/quotes/SponsorUniform';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import { GAMES_UI } from '@/data/games/locale';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from '@/lib/types/quoteScenes';
import type { SponsorId } from '@/lib/utils/careerSave';
import { isSponsorId } from '@/lib/utils/careerSponsors';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const LINE_MS = 900;
// Matches the lineStartMs of this scene's definition: the line lands on the
// handshake
const LINE_START_MS = 1900;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const WALK_MS = 900;
const REACH_MS = LINE_START_MS - 250;
// The shutter cues of the definition land on the first two flashes
const FLASHES = [2950, 3350, 3800];

const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'walk-up': sceneTimeline(TOTAL_MS, [
    [0, { left: '-18%' }],
    [WALK_MS, { left: '-18%' }],
    [REACH_MS - 100, { left: '22%' }],
    [TOTAL_MS, { left: '22%' }],
  ]),
  step: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-4px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 230, iterations: 3, easing: 'ease-in-out' },
  },
  'arm-out': sceneTimeline(TOTAL_MS, [
    [0, { transform: 'scaleX(0)', opacity: 0 }],
    [REACH_MS, { transform: 'scaleX(0)', opacity: 0 }],
    [REACH_MS + 200, { transform: 'scaleX(1)', opacity: 1 }],
    [TOTAL_MS, { transform: 'scaleX(1)', opacity: 1 }],
  ]),
  shake: {
    keyframes: [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-6px)', offset: 0.5 },
      { transform: 'translateY(0)' },
    ],
    options: { duration: 220, iterations: 5, easing: 'ease-in-out' },
  },
  nod: {
    keyframes: [
      { transform: 'rotate(0deg) translateY(0)' },
      { transform: 'rotate(4deg) translateY(3px)', offset: 0.4 },
      { transform: 'rotate(0deg) translateY(0)' },
    ],
    options: { duration: 500, easing: 'ease-in-out' },
  },
  'camera-flash': {
    keyframes: [
      { opacity: 0, transform: 'scale(0.4)' },
      { opacity: 1, transform: 'scale(1.2)', offset: 0.2 },
      { opacity: 0, transform: 'scale(1)' },
    ],
    options: { duration: 320, easing: 'ease-out', fill: 'both' },
  },
  'screen-flash': {
    keyframes: [
      { opacity: 0 },
      { opacity: 0.35, offset: 0.15 },
      { opacity: 0 },
    ],
    options: { duration: 260, easing: 'ease-out', fill: 'both' },
  },
};

const CAMERAS = [
  'left-[4%] top-[30%]',
  'left-[90%] top-[24%]',
  'left-[46%] top-[6%]',
];

export default function SponsorDealScene({
  speaker,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const sponsor: SponsorId = isSponsorId(variant) ? variant : SPONSOR_IDS[0];
  const theme = SPONSOR_THEMES[sponsor];
  useSceneAnimation(root, CUSTOM, [speaker, sponsor]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-800"
        floor="bg-gradient-to-b from-slate-700 to-slate-800"
      >
        <div className={`absolute inset-0 ${theme.wash}`} />
        <div
          className={`absolute left-[34%] top-[8%] flex h-[20%] w-[58%] items-center justify-center gap-2 overflow-hidden rounded-sm border ${theme.plaque}`}
        >
          <SponsorEmblem sponsorId={sponsor} className="h-6 w-6 shrink-0" />
          <span className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-slate-100 sm:text-xs">
            {SPONSOR_NAMES[sponsor]}
          </span>
          <span className={`absolute inset-x-0 bottom-0 h-1 ${theme.stripe}`} />
        </div>

        <div className="absolute bottom-[18%] left-[56%] z-10 h-[74px] w-11">
          <SponsorUniform sponsor={sponsor} flip />
        </div>
        <div className="absolute bottom-[18%] left-[74%] z-10 h-[74px] w-11">
          <SponsorUniform sponsor={sponsor} flip />
        </div>

        <div className="absolute bottom-[18%] left-[30%] z-20 h-[20%] w-[44%]">
          <span className="absolute inset-x-0 top-0 h-2.5 rounded-sm bg-gradient-to-b from-stone-600 to-stone-700 shadow-lg" />
          <span className="absolute inset-x-[4%] bottom-0 top-2.5 bg-gradient-to-b from-stone-800 to-stone-900" />
          <span className="absolute -top-2 left-[34%] h-2.5 w-12 -skew-x-12 rounded-[1px] bg-stone-100 shadow">
            <span className="absolute inset-x-1 top-0.5 h-px bg-slate-400" />
            <span className="absolute bottom-0.5 left-1 h-0.5 w-7 rounded-full bg-blue-700" />
          </span>
        </div>

        <div
          data-anim="walk-up"
          className="absolute bottom-[18%] left-[-18%] z-30 h-[120px] w-16"
        >
          <div
            data-anim="step"
            data-anim-delay={WALK_MS}
            className="absolute inset-0"
          >
            <span className="absolute bottom-0 left-3 h-9 w-3.5 rounded-b-md bg-slate-800" />
            <span className="absolute bottom-0 right-3 h-9 w-3.5 rounded-b-md bg-slate-800" />
            <span className="absolute bottom-8 left-1 h-11 w-14 rounded-t-2xl bg-gradient-to-b from-amber-700 to-amber-900" />
            <span
              data-anim="arm-out"
              className="absolute bottom-[62px] left-[48px] h-3 w-[72px] origin-left rounded-full bg-amber-800 opacity-0"
            >
              <span
                data-anim="shake"
                data-anim-delay={LINE_START_MS}
                className="absolute -right-2 -top-1 flex"
              >
                <span className="h-4 w-4 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
                <span className="-ml-2 h-4 w-4 rounded-full bg-amber-200 ring-1 ring-slate-950/40" />
              </span>
            </span>
            <SceneActor
              character={lead}
              className="bottom-[72px] left-1"
              anim="nod"
              animDelay={LINE_START_MS}
              pose="origin-bottom"
              size="h-14 w-14 sm:h-16 sm:w-16"
            >
              <span
                data-anim="spotlight"
                data-anim-delay={LINE_START_MS}
                data-anim-duration={LINE_MS}
                className={`absolute -inset-3 -z-10 rounded-full opacity-0 blur-md ${theme.actorGlow}`}
              />
            </SceneActor>
          </div>
        </div>

        {CAMERAS.map((cls, index) => (
          <span
            key={cls}
            data-anim="camera-flash"
            data-anim-delay={FLASHES[index]}
            className={`absolute z-40 h-8 w-8 bg-stone-50 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)] ${cls}`}
          />
        ))}
        {FLASHES.map((at) => (
          <span
            key={at}
            data-anim="screen-flash"
            data-anim-delay={at}
            className="pointer-events-none absolute inset-0 z-40 bg-stone-50 opacity-0"
          />
        ))}
      </SceneFrame>
    </div>
  );
}
