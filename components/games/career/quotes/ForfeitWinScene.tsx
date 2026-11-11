"use client";

import { useRef } from "react";
import GlizzyPlate from "@/components/games/career/quotes/GlizzyPlate";
import SceneExtra from "@/components/games/career/quotes/SceneExtra";
import TableCollapse from "@/components/games/career/quotes/TableCollapse";
import SceneActor from "@/components/games/career/scenes/SceneActor";
import SceneFrame from "@/components/games/career/scenes/SceneFrame";
import { useSceneAnimation } from "@/components/games/career/scenes/useSceneAnimation";
import GlizzyIcon from "@/components/icons/GlizzyIcon";
import { GAMES_UI } from '@/data/games/locale';
import type { SceneAnimationSpec } from "@/lib/constants/sceneAnimations";
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from "@/lib/types/quoteScenes";
import { characterBySlug } from "@/lib/utils/duelCharacters";
import { sceneTimeline } from "@/lib/utils/sceneTimeline";
import {
  tableCollapseAnimations,
  tableCollapseOf,
} from "@/lib/utils/tableCollapse";

const LINE_MS = 1800;
// Matches the lineStartMs of this scene's definition: the collapse and the
// referee's walk-on play out before the arm goes up
const LINE_START_MS = 4200;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const REF_IN_MS = 3200;
const REF_SET_MS = 3800;
const RAISE_MS = LINE_START_MS;
const HOPS_MS = [300, 750, 1200];
const REFEREE_STRIPES =
  "bg-[repeating-linear-gradient(90deg,rgba(248,250,252,1)_0,rgba(248,250,252,1)_5px,rgba(15,23,42,1)_5px,rgba(15,23,42,1)_10px)]";

const CONFETTI = [
  { cls: "left-[52%] bg-amber-300", delay: 0 },
  { cls: "left-[58%] bg-sky-300", delay: 180 },
  { cls: "left-[63%] bg-red-400", delay: 90 },
  { cls: "left-[69%] bg-lime-300", delay: 260 },
  { cls: "left-[74%] bg-amber-200", delay: 40 },
  { cls: "left-[80%] bg-pink-300", delay: 320 },
  { cls: "left-[86%] bg-sky-200", delay: 140 },
  { cls: "left-[91%] bg-amber-400", delay: 220 },
];

const CUSTOM: Record<string, SceneAnimationSpec> = {
  ...tableCollapseAnimations(TOTAL_MS),
  "push-in": sceneTimeline(TOTAL_MS, [
    [0, { transform: "scale(1)" }],
    [REF_SET_MS, { transform: "scale(1)" }],
    [RAISE_MS + 300, { transform: "scale(1.18)" }],
    [TOTAL_MS, { transform: "scale(1.22)" }],
  ]),
  "ref-walk": sceneTimeline(TOTAL_MS, [
    [0, { transform: "translateX(180px)" }],
    [REF_IN_MS, { transform: "translateX(180px)" }],
    [REF_SET_MS, { transform: "translateX(0)" }],
    [TOTAL_MS, { transform: "translateX(0)" }],
  ]),
  "ref-arm": sceneTimeline(TOTAL_MS, [
    [0, { transform: "rotate(-80deg)" }],
    [RAISE_MS - 150, { transform: "rotate(-80deg)" }],
    [RAISE_MS, { transform: "rotate(68deg)" }],
    [RAISE_MS + 120, { transform: "rotate(62deg)" }],
    [TOTAL_MS, { transform: "rotate(64deg)" }],
  ]),
  "winner-arm": sceneTimeline(TOTAL_MS, [
    [0, { transform: "translate(0, 0) rotate(0deg)" }],
    [RAISE_MS - 150, { transform: "translate(0, 0) rotate(0deg)" }],
    [RAISE_MS, { transform: "translate(66px, -86px) rotate(-20deg)" }],
    [RAISE_MS + 120, { transform: "translate(64px, -80px) rotate(-14deg)" }],
    [TOTAL_MS, { transform: "translate(64px, -82px) rotate(-16deg)" }],
  ]),
  "winner-hop": sceneTimeline(TOTAL_MS, [
    [0, { transform: "translateY(0)" }],
    [RAISE_MS, { transform: "translateY(0)" }],
    ...HOPS_MS.flatMap((hop): [number, Keyframe][] => [
      [RAISE_MS + hop, { transform: "translateY(0)" }],
      [RAISE_MS + hop + 140, { transform: "translateY(-7px)" }],
      [RAISE_MS + hop + 300, { transform: "translateY(0)" }],
    ]),
    [TOTAL_MS, { transform: "translateY(0)" }],
  ]),
  "ref-whistle": sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: "scale(0.4)" }],
    [REF_SET_MS, { opacity: 0, transform: "scale(0.4)" }],
    [REF_SET_MS + 80, { opacity: 1, transform: "scale(1.1)" }],
    [REF_SET_MS + 380, { opacity: 0, transform: "scale(1.3)" }],
    [TOTAL_MS, { opacity: 0, transform: "scale(1.3)" }],
  ]),
  confetti: {
    keyframes: [
      { transform: "translate(0, -20px) rotate(0deg)", opacity: 0 },
      {
        transform: "translate(-4px, 10px) rotate(120deg)",
        opacity: 1,
        offset: 0.15,
      },
      {
        transform: "translate(6px, 90px) rotate(320deg)",
        opacity: 1,
        offset: 0.7,
      },
      { transform: "translate(-2px, 130px) rotate(420deg)", opacity: 0 },
    ],
    options: { duration: 2200, easing: "ease-in", fill: "both" },
  },
};

// A win handed over by the other man's body: he bursts or throws up, the
// hall clears him off, and a referee walks on to raise the winner's arm.
// The winner's side sits behind the table so the referee's hanging arm and
// the hops never draw over it, and the referee stands in front of the
// winner so the arm he raises crosses over the winner's head
export default function ForfeitWinScene({
  speaker,
  other,
  variant,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const winner = characterBySlug(speaker);
  const loser = characterBySlug(other);
  const collapse = tableCollapseOf(variant);
  useSceneAnimation(root, CUSTOM, [speaker, other, collapse]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor="bg-slate-800"
      >
        <div data-anim="push-in" className="absolute inset-0 origin-[88%_46%]">
          <TableCollapse loser={loser} collapse={collapse} />
          <span className="absolute bottom-[29%] right-[calc(22%+72px)] z-20 sm:right-[calc(16%+72px)]">
            <GlizzyPlate eatable />
          </span>

          <div className="absolute bottom-[30%] right-[22%] z-10 h-28 w-20 sm:right-[16%]">
            <div data-anim="winner-hop" className="absolute inset-0">
              <span
                data-anim="spotlight"
                data-anim-delay={RAISE_MS}
                data-anim-duration={LINE_MS + QUOTE_SCENE_TAIL_MS}
                className="absolute -inset-4 rounded-full bg-amber-100/25 opacity-0 blur-md"
              />
              <span className="absolute -bottom-2 left-2 h-14 w-16 rounded-t-2xl bg-gradient-to-b from-zinc-700 to-zinc-900" />
              <SceneActor
                character={winner}
                className="bottom-[40px] left-2"
                anim="gobble"
                pose="origin-bottom"
                size="h-14 w-14 sm:h-16 sm:w-16"
              />
              <span
                data-anim="winner-arm"
                className="absolute bottom-[30px] -left-2 z-30"
              >
                <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-orange-200 ring-2 ring-slate-950/50" />
                <GlizzyIcon
                  variant={1}
                  className="absolute -top-1 left-0 h-5 w-8 -rotate-12"
                />
              </span>
            </div>
            <div
              data-anim="ref-walk"
              className="absolute bottom-0 left-[72px] h-28 w-16"
            >
              <SceneExtra torso={REFEREE_STRIPES} hair="bg-slate-900" />
              <span
                data-anim="ref-whistle"
                className="absolute -left-4 bottom-[96px] text-[10px] font-black text-slate-50 opacity-0"
              >
                {GAMES_UI.career.quoteCutscene.whistle}
              </span>
              <span
                data-anim="ref-arm"
                className={`absolute bottom-[40px] left-[-64px] h-3 w-[74px] origin-[100%_50%] rounded-full ring-1 ring-slate-950/50 [transform:rotate(-80deg)] ${REFEREE_STRIPES}`}
              />
            </div>
          </div>

          {CONFETTI.map((piece) => (
            <span
              key={piece.cls}
              data-anim="confetti"
              data-anim-delay={RAISE_MS + piece.delay}
              className={`absolute top-[8%] z-50 h-2 w-1 rounded-[1px] opacity-0 ${piece.cls}`}
            />
          ))}
        </div>
      </SceneFrame>
    </div>
  );
}
