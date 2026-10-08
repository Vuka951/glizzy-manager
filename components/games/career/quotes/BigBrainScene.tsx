"use client";

import { useRef } from "react";
import PortraitHead from "@/components/games/PortraitHead";
import SceneActor from "@/components/games/career/scenes/SceneActor";
import SceneFrame from "@/components/games/career/scenes/SceneFrame";
import { useSceneAnimation } from "@/components/games/career/scenes/useSceneAnimation";
import GlizzyIcon from "@/components/icons/GlizzyIcon";
import Icon from "@/components/icons/Icon";
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

const QUOTE = GAMES_UI.career.quoteCutscene;

const LINE_MS = 807;
// Matches the lineStartMs of this scene's definition: the cup, the board and
// the paper from his sleeve all read before the line
const LINE_START_MS = 3800;
const TOTAL_MS = LINE_START_MS + LINE_MS + QUOTE_SCENE_TAIL_MS;
const TALK_ITERATIONS = Math.round(LINE_MS / TALK_BEAT_MS);
// The cheer, paper-flutter, stamp-thud, crowd-gasp and ding cues of the
// definition land on these
const WHISTLE_MS = 950;
const PULL_MS = 1900;
const OUT_MS = 2150;
const SNAP_MS = 2450;
const DOUBLE_TAKE_MS = 3180;
const REACH_MS = 3450;
const TEMPLE_MS = 3750;
const TAP_TWO_MS = LINE_START_MS + 350;
const SLUMP_MS = LINE_START_MS + LINE_MS + 100;
const SPARK_MS = 4700;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  "board-winner": sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: "scale(0.4)" }],
    [WHISTLE_MS + 150, { opacity: 0, transform: "scale(0.4)" }],
    [WHISTLE_MS + 300, { opacity: 1, transform: "scale(1.25)" }],
    [WHISTLE_MS + 450, { opacity: 1, transform: "scale(1)" }],
    [TOTAL_MS, { opacity: 1, transform: "scale(1)" }],
  ]),
  "trophy-pump": {
    keyframes: [
      { transform: "translateY(0) rotate(-8deg)" },
      { transform: "translateY(-3px) rotate(8deg)", offset: 0.5 },
      { transform: "translateY(0) rotate(-8deg)" },
    ],
    options: { duration: 400, iterations: 4, easing: "ease-in-out" },
  },
  "sleeve-hand": sceneTimeline(TOTAL_MS, [
    [0, { left: "50px", top: "-10px", transform: "translateX(0)" }],
    [PULL_MS - 400, { left: "50px", top: "-10px", transform: "translateX(0)" }],
    [PULL_MS - 150, { left: "48px", top: "62px", transform: "translateX(0)" }],
    [PULL_MS, { left: "48px", top: "62px", transform: "translateX(0)" }],
    [OUT_MS, { left: "60px", top: "30px", transform: "translateX(0)" }],
    [REACH_MS, { left: "60px", top: "30px", transform: "translateX(0)" }],
    [TEMPLE_MS, { left: "46px", top: "12px", transform: "translateX(0)" }],
    [
      LINE_START_MS,
      { left: "46px", top: "12px", transform: "translateX(-4px)" },
    ],
    [
      LINE_START_MS + 110,
      { left: "46px", top: "12px", transform: "translateX(0)" },
    ],
    [TAP_TWO_MS, { left: "46px", top: "12px", transform: "translateX(-4px)" }],
    [
      TAP_TWO_MS + 110,
      { left: "46px", top: "12px", transform: "translateX(-2px)" },
    ],
    [TOTAL_MS, { left: "46px", top: "12px", transform: "translateX(-2px)" }],
  ]),
  finger: sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0 }],
    [REACH_MS + 150, { opacity: 0 }],
    [REACH_MS + 250, { opacity: 1 }],
    [TOTAL_MS, { opacity: 1 }],
  ]),
  "scroll-out": sceneTimeline(TOTAL_MS, [
    [0, { opacity: 0, transform: "translate(-8px, 40px) scale(0.4)" }],
    [
      PULL_MS - 60,
      { opacity: 0, transform: "translate(-8px, 40px) scale(0.4)" },
    ],
    [PULL_MS, { opacity: 1, transform: "translate(-8px, 40px) scale(0.4)" }],
    [
      PULL_MS + 90,
      { opacity: 1, transform: "translate(4px, 36px) scale(0.5)" },
    ],
    [OUT_MS, { opacity: 1, transform: "translate(0, 0) scale(1)" }],
    [TOTAL_MS, { opacity: 1, transform: "translate(0, 0) scale(1)" }],
  ]),
  "scroll-sheet": sceneTimeline(TOTAL_MS, [
    [0, { clipPath: "inset(0 92% 0 0)" }],
    [OUT_MS, { clipPath: "inset(0 92% 0 0)" }],
    [SNAP_MS, { clipPath: "inset(0 0% 0 0)" }],
    [TOTAL_MS, { clipPath: "inset(0 0% 0 0)" }],
  ]),
  "scroll-roll": sceneTimeline(TOTAL_MS, [
    [0, { left: "0%" }],
    [OUT_MS, { left: "0%" }],
    [SNAP_MS, { left: "93%" }],
    [TOTAL_MS, { left: "93%" }],
  ]),
  "seal-pop": sceneTimeline(TOTAL_MS, [
    [0, { transform: "scale(1.7) rotate(-20deg)" }],
    [SNAP_MS - 40, { transform: "scale(1.7) rotate(-20deg)" }],
    [SNAP_MS + 80, { transform: "scale(0.9) rotate(0deg)" }],
    [SNAP_MS + 220, { transform: "scale(1) rotate(0deg)" }],
    [TOTAL_MS, { transform: "scale(1) rotate(0deg)" }],
  ]),
  smug: sceneTimeline(TOTAL_MS, [
    [0, { transform: "rotate(0deg)" }],
    [REACH_MS, { transform: "rotate(0deg)" }],
    [TEMPLE_MS, { transform: "rotate(7deg)" }],
    [TOTAL_MS, { transform: "rotate(7deg)" }],
  ]),
  "finalist-look": sceneTimeline(TOTAL_MS, [
    [0, { transform: "translateY(-2px) rotate(12deg) scale(1)" }],
    [SNAP_MS + 100, { transform: "translateY(-2px) rotate(12deg) scale(1)" }],
    [SNAP_MS + 250, { transform: "translateY(0) rotate(-12deg) scale(1)" }],
    [
      DOUBLE_TAKE_MS - 330,
      { transform: "translateY(0) rotate(-12deg) scale(1)" },
    ],
    [
      DOUBLE_TAKE_MS - 200,
      { transform: "translateY(-2px) rotate(12deg) scale(1)" },
    ],
    [
      DOUBLE_TAKE_MS - 100,
      { transform: "translateY(-2px) rotate(12deg) scale(1)" },
    ],
    [
      DOUBLE_TAKE_MS,
      { transform: "translateY(-5px) rotate(-16deg) scale(1.1)" },
    ],
    [
      DOUBLE_TAKE_MS + 180,
      { transform: "translateY(0) rotate(-12deg) scale(1)" },
    ],
    [TOTAL_MS, { transform: "translateY(0) rotate(-12deg) scale(1)" }],
  ]),
  sparkle: {
    keyframes: [
      { transform: "scale(0.3) rotate(0deg)", opacity: 0 },
      { transform: "scale(1) rotate(45deg)", opacity: 1, offset: 0.4 },
      { transform: "scale(0.3) rotate(90deg)", opacity: 0 },
    ],
    options: { duration: 1000, iterations: Infinity, easing: "ease-in-out" },
  },
  confetti: {
    keyframes: [
      { transform: "translateY(-20px) rotate(0deg)", opacity: 0 },
      {
        transform: "translateY(10px) rotate(120deg)",
        opacity: 1,
        offset: 0.15,
      },
      { transform: "translateY(190px) rotate(620deg)", opacity: 0.9 },
    ],
    options: { duration: 2400, iterations: Infinity, easing: "linear" },
  },
};

const CONFETTI = [
  { cls: "left-[6%] bg-amber-300", delay: 0 },
  { cls: "left-[18%] bg-red-400", delay: -900 },
  { cls: "left-[30%] bg-sky-300", delay: -1700 },
  { cls: "left-[42%] bg-amber-300", delay: -500 },
  { cls: "left-[54%] bg-cyan-200", delay: -1300 },
  { cls: "left-[66%] bg-red-400", delay: -2100 },
  { cls: "left-[78%] bg-sky-300", delay: -300 },
  { cls: "left-[90%] bg-amber-300", delay: -1500 },
];

const BRACKET_PAIRS = ["top-[8%] h-[24%]", "top-[64%] h-[24%]"];
const BRACKET_SLOTS = [
  "left-[4%] top-[8%]",
  "left-[4%] top-[32%]",
  "left-[4%] top-[64%]",
  "left-[4%] top-[88%]",
  "left-[38%] top-[20%]",
  "left-[38%] top-[76%]",
];

const SPARKS = [
  { cls: "-right-3 -top-2", delay: SPARK_MS },
  { cls: "right-[-18px] top-4", delay: SPARK_MS + 300 },
  { cls: "-right-1 -top-5", delay: SPARK_MS + 600 },
];

const BRAIN_FOLDS = [
  "left-[10%] top-[18%] h-[34%] w-[30%] rotate-12",
  "left-[30%] top-[46%] h-[30%] w-[26%] -rotate-12",
  "left-[56%] top-[16%] h-[36%] w-[30%] -rotate-6",
  "left-[62%] top-[50%] h-[26%] w-[24%] rotate-12",
];

const BRAIN_RAYS = [
  "-left-2.5 top-[20%] h-px w-2 rotate-[20deg]",
  "left-1/2 -top-3 h-2 w-px",
  "-right-2.5 top-[20%] h-px w-2 -rotate-[20deg]",
];

// Inked on the parchment, so every stroke is the same dark ink as the labels
function Brain({ className, rays }: { className: string; rays?: boolean }) {
  return (
    <span className={`relative block ${className}`}>
      <span className="absolute left-[40%] top-[78%] h-[26%] w-[20%] rounded-b-md border border-t-0 border-rose-950/70 bg-rose-300" />
      <span className="absolute inset-0 overflow-hidden rounded-[48%_52%_44%_46%/58%_60%_40%_42%] border border-rose-950/80 bg-gradient-to-b from-pink-200 to-rose-300">
        <span className="absolute bottom-[18%] left-1/2 top-[6%] w-px -rotate-3 bg-rose-950/60" />
        {BRAIN_FOLDS.map((cls) => (
          <span
            key={cls}
            className={`absolute rounded-full border-t border-rose-950/50 ${cls}`}
          />
        ))}
      </span>
      {rays &&
        BRAIN_RAYS.map((cls) => (
          <span key={cls} className={`absolute bg-amber-950/70 ${cls}`} />
        ))}
    </span>
  );
}

function Bracket({
  line,
  bar,
  children,
}: {
  line: string;
  bar: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-x-[8%] inset-y-[12%]">
      {BRACKET_PAIRS.map((cls) => (
        <span
          key={cls}
          className={`absolute left-0 w-[34%] border-y border-r ${line} ${cls}`}
        />
      ))}
      {BRACKET_SLOTS.map((cls) => (
        <span
          key={cls}
          className={`absolute h-[3px] w-[22%] -translate-y-[5px] rounded-full ${bar} ${cls}`}
        />
      ))}
      <span
        className={`absolute left-[34%] top-[20%] h-[56%] w-[33%] border-y border-r ${line}`}
      />
      <span
        className={`absolute left-[67%] top-[48%] w-[33%] border-t ${line}`}
      />
      <div className="absolute left-[67%] top-[48%] flex w-[33%] -translate-y-full justify-center pb-0.5">
        {children}
      </div>
    </div>
  );
}

export default function BigBrainScene({
  speaker,
  other,
}: QuoteSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const lead = characterBySlug(speaker);
  const finalist = characterBySlug(other);
  useSceneAnimation(root, CUSTOM, [speaker, other]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800"
        floor="bg-slate-800"
      >
        <div className="absolute inset-x-0 bottom-[40%] flex justify-around px-1">
          {Array.from({ length: 14 }, (_, index) => (
            <span
              key={index}
              className={`h-5 w-7 rounded-t-full bg-slate-800/70 ${index % 2 ? "mb-2" : ""}`}
            />
          ))}
        </div>
        <div className="absolute left-[2%] top-0 h-[84%] w-[44%] bg-gradient-to-b from-amber-200/20 to-amber-200/0 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />

        <div className="absolute right-[2%] top-[15%] h-[40%] w-[30%] sm:w-[34%]">
          <span className="absolute left-[16%] top-full h-[68%] w-1.5 bg-slate-700" />
          <span className="absolute right-[16%] top-full h-[68%] w-1.5 bg-slate-700" />
          <div className="absolute inset-0 overflow-hidden rounded-md border-4 border-slate-700 bg-slate-950 shadow-[0_0_24px_rgba(125,211,252,0.18)]">
            <span className="absolute inset-x-0 top-0 h-1 bg-red-600" />
            <Bracket line="border-sky-200/60" bar="bg-sky-200/30">
              <span
                data-anim="board-winner"
                className="relative rounded-full opacity-0 shadow-[0_0_12px_rgba(252,211,77,0.9)]"
              >
                <PortraitHead
                  character={lead}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </span>
            </Bracket>
          </div>
        </div>

        {CONFETTI.map((piece) => (
          <span
            key={piece.cls}
            data-anim="confetti"
            data-anim-delay={piece.delay}
            className={`absolute top-0 z-10 h-2 w-1 rounded-[1px] ${piece.cls}`}
          />
        ))}

        <div
          data-anim="gray-out"
          data-anim-delay={SLUMP_MS}
          className="absolute bottom-[40%] left-[74%] z-20 h-12 w-12 origin-bottom sm:left-[66%]"
        >
          <span className="absolute left-1/2 top-[calc(100%-4px)] h-9 w-11 -translate-x-1/2 rounded-t-2xl bg-gradient-to-b from-slate-500 to-slate-700">
            <span className="absolute left-[18%] top-full h-3 w-[28%] rounded-b-md bg-slate-800" />
            <span className="absolute right-[18%] top-full h-3 w-[28%] rounded-b-md bg-slate-800" />
          </span>
          <SceneActor
            character={finalist}
            className="left-0 top-0"
            anim="finalist-look"
            pose="origin-bottom"
            size="h-12 w-12"
          />
        </div>

        <div className="absolute bottom-[40%] left-[9%] h-14 w-14 sm:bottom-[44%] sm:left-[14%]">
          <span className="absolute left-1/2 top-[calc(100%-4px)] z-10 h-9 w-12 -translate-x-1/2 rounded-t-2xl bg-gradient-to-b from-orange-600 to-orange-800">
            <span className="absolute right-0 top-3 h-4 w-2 rounded-l-sm bg-orange-900/70" />
            <span className="absolute left-[18%] top-full h-5 w-[28%] rounded-b-md bg-slate-700" />
            <span className="absolute right-[18%] top-full h-5 w-[28%] rounded-b-md bg-slate-700" />
          </span>

          <span className="absolute left-[-12px] top-[-10px] z-30 h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40" />
          <span
            data-anim="trophy-pump"
            className="absolute left-[-14px] top-[-42px] z-30 text-amber-300 sm:left-[-24px] sm:top-[-46px]"
          >
            <Icon
              name="trophy"
              className="h-8 w-8 drop-shadow-[0_0_12px_rgba(252,211,77,0.85)] sm:h-9 sm:w-9"
            />
          </span>

          <div
            data-anim="scroll-out"
            className="absolute left-[64px] top-[-8px] z-20 h-24 w-36 origin-left opacity-0"
          >
            <div
              data-anim="scroll-sheet"
              className="absolute inset-y-1 left-1 right-1 rounded-sm bg-gradient-to-b from-amber-100 to-amber-200 shadow-lg"
            >
              <div className="absolute inset-x-1.5 bottom-1.5 top-3 flex items-end justify-around text-center text-[9px] font-black uppercase leading-[1.05] tracking-tight text-amber-950">
                <span className="flex w-[55%] -rotate-2 flex-col items-center gap-1">
                  <Brain className="h-[42px] w-[56px]" rays />
                  {QUOTE.brainBig.replaceAll("{name}", lead.name)}
                </span>
                <span className="flex w-[45%] rotate-3 flex-col items-center gap-1">
                  <Brain className="h-[16px] w-[21px]" />
                  {QUOTE.brainNormal}
                </span>
              </div>
              <span
                data-anim="seal-pop"
                className="absolute right-2 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-700 shadow-md ring-2 ring-red-900"
              >
                <GlizzyIcon
                  variant={0}
                  className="h-2.5 w-4 opacity-60 brightness-50 saturate-0"
                />
              </span>
            </div>
            <span className="absolute inset-y-0 left-0 w-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow" />
            <span
              data-anim="scroll-roll"
              className="absolute inset-y-0 left-0 w-2 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow"
            />
          </div>

          <SceneActor
            character={lead}
            className="left-0 top-0"
            anim="smug talk"
            animDelay={`0 ${LINE_START_MS}`}
            animIterations={`1 ${TALK_ITERATIONS}`}
            pose="origin-bottom"
            size="h-14 w-14"
          >
            <span
              data-anim="spotlight"
              data-anim-delay={LINE_START_MS}
              data-anim-duration={LINE_MS + QUOTE_SCENE_TAIL_MS}
              className="absolute -inset-3 -z-10 rounded-full bg-amber-100/30 opacity-0 blur-md"
            />
            <span
              data-anim="ring-out"
              data-anim-delay={LINE_START_MS}
              className="absolute left-[40px] top-[6px] h-6 w-6 rounded-full border-2 border-cyan-200 opacity-0"
            />
            <span
              data-anim="ring-out"
              data-anim-delay={TAP_TWO_MS}
              className="absolute left-[40px] top-[6px] h-6 w-6 rounded-full border-2 border-cyan-200 opacity-0"
            />
            {SPARKS.map((spark) => (
              <span
                key={spark.cls}
                data-anim="sparkle"
                data-anim-delay={spark.delay}
                className={`absolute h-3 w-3 bg-cyan-100 opacity-0 [clip-path:polygon(50%_0,60%_40%,100%_50%,60%_60%,50%_100%,40%_60%,0_50%,40%_40%)] ${spark.cls}`}
              />
            ))}
            <span
              data-anim="sleeve-hand"
              className="absolute left-[50px] top-[-10px] h-3.5 w-3.5 rounded-full bg-orange-200 ring-1 ring-slate-950/40"
            >
              <span
                data-anim="finger"
                className="absolute -left-1.5 top-0.5 h-1.5 w-2.5 rounded-full bg-orange-200 opacity-0 ring-1 ring-slate-950/30"
              />
            </span>
          </SceneActor>
        </div>
      </SceneFrame>
    </div>
  );
}
