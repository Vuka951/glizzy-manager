"use client";

import { useRef } from "react";
import SceneActor from "@/components/games/career/scenes/SceneActor";
import SceneFrame from "@/components/games/career/scenes/SceneFrame";
import { useSceneAnimation } from "@/components/games/career/scenes/useSceneAnimation";
import GlizzyIcon from "@/components/icons/GlizzyIcon";
import { GAMES_UI } from "@/data/games/locale";
import {
  TALK_BEAT_MS,
  type SceneAnimationSpec,
} from "@/lib/constants/sceneAnimations";
import {
  QUOTE_SCENE_TAIL_MS,
  type QuoteSceneProps,
} from "@/lib/types/quoteScenes";
import { characterBySlug } from "@/lib/utils/duelCharacters";
import { sceneTimeline } from "@/lib/utils/sceneTimeline";

const LINE_MS = 2420;
// Matches the lineStartMs of this scene's definition: he gets up, combs,
// fixes the bow tie and dusts off the crumbs before the line
const LINE_START_MS = 3700;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The slide-wood, dust-hands, shutter and thud cues of the definition land
// on these beats
const STAND_MS = 950;
const WALK_END_MS = 1650;
const COMB_MS = 1750;
const COMB_END_MS = 2500;
const TIE_MS = 2550;
const DUST_MS = 2950;
const POSE_MS = 3400;
const FLASHES = [3400, 3580];
const LOOK_MS = LINE_START_MS + LINE_MS - 100;
const DROP_MS = LOOK_MS + 900;

const HAND_REST = "translate(48px, -40px)";
const HAND_COMB = "translate(22px, -122px)";
const HAND_TIE = "translate(36px, -64px)";
const HAND_DUST = "translate(36px, -46px)";
const HAND_POSE = "translate(56px, -86px)";

const SLUMPED = "translate(10px, -20px) rotate(84deg)";
const LIFTED = "translate(2px, -6px) rotate(14deg)";

const CUSTOM: Record<string, SceneAnimationSpec> = {
  "lead-move": sceneTimeline(TOTAL_MS, [
    [0, { left: "38%", transform: "translateY(26px) scale(1)" }],
    [STAND_MS, { left: "38%", transform: "translateY(26px) scale(1)" }],
    [STAND_MS + 300, { left: "38%", transform: "translateY(0) scale(1)" }],
    [WALK_END_MS, { left: "66%", transform: "translateY(0) scale(1)" }],
    [POSE_MS - 250, { left: "66%", transform: "translateY(0) scale(1)" }],
    [POSE_MS, { left: "64%", transform: "translateY(0) scale(1.12)" }],
    [TOTAL_MS, { left: "64%", transform: "translateY(0) scale(1.12)" }],
  ]),
  step: {
    keyframes: [
      { transform: "translateY(0)" },
      { transform: "translateY(-4px)", offset: 0.5 },
      { transform: "translateY(0)" },
    ],
    options: { duration: 200, iterations: 2, easing: "ease-in-out" },
  },
  "head-tilt": sceneTimeline(TOTAL_MS, [
    [0, { transform: "rotate(0deg)" }],
    [COMB_MS, { transform: "rotate(0deg)" }],
    [COMB_MS + 150, { transform: "rotate(-9deg)" }],
    [COMB_END_MS, { transform: "rotate(-9deg)" }],
    [TIE_MS, { transform: "rotate(4deg)" }],
    [DUST_MS, { transform: "rotate(8deg)" }],
    [POSE_MS - 150, { transform: "rotate(0deg)" }],
    [POSE_MS, { transform: "rotate(-5deg)" }],
    [TOTAL_MS, { transform: "rotate(-5deg)" }],
  ]),
  "right-hand": sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: HAND_REST }],
    [COMB_MS - 100, { opacity: 0, transform: HAND_REST }],
    [COMB_MS, { opacity: 1, transform: HAND_COMB }],
    [COMB_END_MS, { opacity: 1, transform: HAND_COMB }],
    [TIE_MS, { opacity: 1, transform: HAND_TIE }],
    [DUST_MS - 100, { opacity: 1, transform: HAND_TIE }],
    [DUST_MS, { opacity: 1, transform: HAND_DUST }],
    [POSE_MS - 200, { opacity: 1, transform: HAND_DUST }],
    [POSE_MS, { opacity: 1, transform: HAND_POSE }],
    [TOTAL_MS, { opacity: 1, transform: HAND_POSE }],
  ]),
  "comb-stroke": {
    keyframes: [
      { transform: "translateX(-10px)" },
      { transform: "translateX(10px)", offset: 0.5 },
      { transform: "translateX(-10px)" },
    ],
    options: { duration: 240, iterations: 3, easing: "ease-in-out" },
  },
  brush: {
    keyframes: [
      { transform: "translateY(0)" },
      { transform: "translateY(14px)", offset: 0.5 },
      { transform: "translateY(0)" },
    ],
    options: { duration: 150, iterations: 3, easing: "ease-in-out" },
  },
  "comb-show": sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [COMB_MS - 60, { opacity: 0 }],
    [COMB_MS, { opacity: 1 }],
    [COMB_END_MS, { opacity: 1 }],
    [COMB_END_MS + 40, { opacity: 0 }],
    [TOTAL_MS, { opacity: 0 }],
  ]),
  "mirror-hand": sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: "translate(-6px, -60px)" }],
    [COMB_MS - 100, { opacity: 0, transform: "translate(-6px, -60px)" }],
    [COMB_MS, { opacity: 1, transform: "translate(-16px, -96px)" }],
    [COMB_END_MS, { opacity: 1, transform: "translate(-16px, -96px)" }],
    [COMB_END_MS + 150, { opacity: 0, transform: "translate(-6px, -60px)" }],
    [TOTAL_MS, { opacity: 0, transform: "translate(-6px, -60px)" }],
  ]),
  "tie-fix": sceneTimeline(TOTAL_MS, [
    [0, { transform: "rotate(-18deg)" }],
    [TIE_MS + 50, { transform: "rotate(-18deg)" }],
    [TIE_MS + 160, { transform: "rotate(12deg)" }],
    [TIE_MS + 260, { transform: "rotate(-5deg)" }],
    [TIE_MS + 340, { transform: "rotate(0deg)" }],
    [TOTAL_MS, { transform: "rotate(0deg)" }],
  ]),
  "crumb-fall": {
    keyframes: [
      { opacity: 1, transform: "translate(0, 0)" },
      { opacity: 0, transform: "translate(4px, 36px)" },
    ],
    options: { duration: 420, easing: "ease-in", fill: "both" },
  },
  glint: {
    keyframes: [
      { transform: "scale(0.2) rotate(0deg)", opacity: 0 },
      { transform: "scale(1.2) rotate(45deg)", opacity: 1, offset: 0.35 },
      { transform: "scale(0.2) rotate(90deg)", opacity: 0 },
    ],
    options: { duration: 700, easing: "ease-out", fill: "both" },
  },
  "camera-flash": {
    keyframes: [
      { opacity: 0, transform: "scale(0.4)" },
      { opacity: 1, transform: "scale(1.2)", offset: 0.2 },
      { opacity: 0, transform: "scale(1)" },
    ],
    options: { duration: 320, easing: "ease-out", fill: "both" },
  },
  "screen-flash": {
    keyframes: [{ opacity: 0 }, { opacity: 0.4, offset: 0.15 }, { opacity: 0 }],
    options: { duration: 260, easing: "ease-out", fill: "both" },
  },
  "look-up": sceneTimeline(TOTAL_MS, [
    [0, { transform: SLUMPED }],
    [LOOK_MS, { transform: SLUMPED }],
    [LOOK_MS + 280, { transform: LIFTED }],
    [DROP_MS, { transform: LIFTED }],
    [DROP_MS + 120, { transform: SLUMPED }],
    [TOTAL_MS, { transform: SLUMPED }],
  ]),
};

const CRUMBS = [
  "left-[14px] top-[14px]",
  "left-[40px] top-[20px]",
  "left-[22px] top-[28px]",
  "left-[46px] top-[32px]",
];

const CAMERAS = ["left-[6%] top-[22%]", "left-[88%] top-[16%]"];

export default function DressedUpScene({
  speaker,
  other,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const loser = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900"
        floor="bg-gradient-to-b from-slate-700 to-slate-800"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_20%,rgba(254,240,138,0.12),transparent_60%)]" />
        <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-slate-950 px-2 py-0.5 text-[9px] font-black tracking-[0.25em] text-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.4)]">
          {GAMES_UI.cup.studio.title}
        </span>
        <div className="absolute left-[4%] top-[12%] h-[70%] w-[56%] bg-gradient-to-b from-yellow-100/15 to-yellow-100/0 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />
        <div className="absolute left-[54%] top-[12%] h-[70%] w-[30%] bg-gradient-to-b from-amber-100/20 to-amber-100/0 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
        <span className="absolute bottom-[14%] left-[62%] h-[6%] w-[22%] rounded-[50%] bg-amber-100/15 blur-sm" />

        <span className="absolute bottom-[18%] left-[40%] z-10 h-[40%] w-12 rounded-t-lg border-4 border-b-0 border-amber-900" />

        <div className="absolute bottom-[40%] left-[8%] z-20 h-6 w-16 rounded-t-2xl bg-gradient-to-b from-emerald-800 to-emerald-900" />

        <div
          data-anim="lead-move"
          className="absolute bottom-[18%] left-[38%] z-20 h-[120px] w-16 origin-bottom"
        >
          <div
            data-anim="step"
            data-anim-delay={STAND_MS + 300}
            className="absolute inset-0"
          >
            <span className="absolute bottom-0 left-3 h-9 w-3.5 rounded-b-md bg-slate-900">
              <span className="absolute -left-0.5 bottom-0 h-1.5 w-4.5 rounded-sm bg-slate-950 ring-1 ring-slate-500/60" />
            </span>
            <span className="absolute bottom-0 right-3 h-9 w-3.5 rounded-b-md bg-slate-900">
              <span className="absolute -right-0.5 bottom-0 h-1.5 w-4.5 rounded-sm bg-slate-950 ring-1 ring-slate-500/60" />
            </span>
            <span className="absolute bottom-8 left-1 h-11 w-14 rounded-t-2xl bg-gradient-to-b from-slate-800 to-slate-950 shadow-lg">
              <span className="absolute left-1/2 top-0 h-7 w-5 -translate-x-1/2 bg-stone-100 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              <span className="absolute left-[18%] top-0 h-6 w-2 -skew-x-12 bg-slate-700" />
              <span className="absolute right-[18%] top-0 h-6 w-2 skew-x-12 bg-slate-700" />
              <span
                data-anim="tie-fix"
                className="absolute left-1/2 top-1.5 -ml-2.5 h-2 w-5 bg-red-600 [clip-path:polygon(0_0,50%_40%,100%_0,100%_100%,50%_60%,0_100%)]"
              />
              <span className="absolute left-2 top-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-red-800">
                <span className="absolute -bottom-2 left-1 h-2 w-0.5 bg-emerald-600" />
              </span>
              <span className="absolute right-2 top-3.5 h-1.5 w-2.5 bg-stone-100 [clip-path:polygon(0_100%,25%_0,50%_60%,75%_0,100%_100%)]" />
              {CRUMBS.map((cls, index) => (
                <span
                  key={cls}
                  data-anim="crumb-fall"
                  data-anim-delay={DUST_MS + index * 110}
                  className={`absolute h-1 w-1.5 rounded-full bg-amber-400 ${cls}`}
                />
              ))}
            </span>

            <SceneActor
              character={lead}
              className="bottom-[72px] left-1"
              anim="head-tilt talk"
              animDelay={`0 ${LINE_START_MS}`}
              animIterations={`1 ${TALK_ITERATIONS}`}
              pose="origin-bottom"
              size="h-14 w-14 sm:h-16 sm:w-16"
            >
              <span
                data-anim="spotlight"
                data-anim-delay={LINE_START_MS}
                data-anim-duration={LINE_MS}
                className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
              />
            </SceneActor>

            <span
              data-anim="glint"
              data-anim-delay={POSE_MS}
              className="absolute bottom-[118px] left-[46px] z-30 h-4 w-4 bg-amber-100 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)]"
            />

            <span
              data-anim="mirror-hand"
              className="absolute bottom-0 left-0 z-30 h-4 w-4 opacity-0"
            >
              <span className="absolute bottom-3 left-0.5 h-6 w-5 rounded-[50%] border-2 border-amber-300 bg-gradient-to-br from-sky-100 to-sky-300">
                <span className="absolute left-1 top-1 h-2 w-0.5 rotate-12 rounded-full bg-slate-50" />
              </span>
              <span className="absolute inset-0 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
            </span>

            <span
              data-anim="right-hand"
              className="absolute bottom-0 left-0 z-30 h-4 w-4 opacity-0"
            >
              <span
                data-anim="comb-stroke brush"
                data-anim-delay={`${COMB_MS + 20} ${DUST_MS + 20}`}
                className="absolute inset-0"
              >
                <span
                  data-anim="comb-show"
                  className="absolute -left-1 -top-1 h-2 w-6 rounded-t-sm bg-[repeating-linear-gradient(90deg,rgba(2,6,23,1)_0,rgba(2,6,23,1)_1px,transparent_1px,transparent_2px)] opacity-0"
                >
                  <span className="absolute inset-x-0 top-0 h-1 rounded-t-sm bg-slate-950" />
                </span>
                <span className="absolute inset-0 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
              </span>
            </span>
          </div>
        </div>

        <div className="absolute bottom-[18%] left-[4%] z-30 h-[22%] w-[58%]">
          <span className="absolute inset-x-0 top-0 h-2 rounded-sm bg-amber-800" />
          <span className="absolute inset-x-1 bottom-0 top-2 bg-gradient-to-b from-red-800 to-red-950 [clip-path:polygon(0_0,100%_0,96%_100%,4%_100%)]">
            <span className="absolute inset-x-0 top-1 h-1 bg-amber-300/70" />
          </span>
          <span className="absolute -top-1 left-[58%] h-1.5 w-12 rounded-[50%] bg-stone-100 ring-1 ring-stone-400">
            <span className="absolute left-3 top-0 h-1 w-1 rounded-full bg-amber-400" />
            <span className="absolute right-4 top-0.5 h-0.5 w-1 rounded-full bg-amber-400" />
          </span>
          <span className="absolute -top-1 left-[30%] h-1.5 w-14 rounded-[50%] bg-stone-100 ring-1 ring-stone-400" />
          <span className="absolute -top-8 left-[32%] flex flex-col items-center">
            <GlizzyIcon variant={2} className="-mb-2.5 h-4 w-7 rotate-6" />
            <GlizzyIcon variant={0} className="-mb-2.5 h-4 w-7 -rotate-3" />
            <GlizzyIcon variant={0} className="h-4 w-8" />
          </span>
        </div>

        <div className="absolute bottom-[40%] left-[8%] z-40 h-14 w-14 sm:h-16 sm:w-16">
          <SceneActor
            character={loser}
            className="bottom-0 left-0"
            anim="look-up"
            pose="origin-bottom saturate-50 brightness-90"
            size="h-14 w-14 sm:h-16 sm:w-16"
          />
        </div>

        {CAMERAS.map((cls, index) => (
          <span
            key={cls}
            data-anim="camera-flash"
            data-anim-delay={FLASHES[index]}
            className={`absolute z-50 h-8 w-8 bg-stone-50 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)] ${cls}`}
          />
        ))}
        {FLASHES.map((at) => (
          <span
            key={at}
            data-anim="screen-flash"
            data-anim-delay={at}
            className="pointer-events-none absolute inset-0 z-50 bg-stone-50 opacity-0"
          />
        ))}
      </SceneFrame>
    </div>
  );
}
