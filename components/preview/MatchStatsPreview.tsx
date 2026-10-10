"use client";

import PreviewCase from "@/components/preview/PreviewCase";
import PreviewSpectateTable from "@/components/preview/PreviewSpectateTable";
import { CHARACTER_ROSTER } from "@/data/games/roster";
import type { ScoutReveal } from "@/lib/utils/careerScouting";
import type { CharacterCareerState } from "@/lib/utils/careerSave";

const pick = (slug: string, index: number) =>
  CHARACTER_ROSTER.find((character) => character.slug === slug) ??
  CHARACTER_ROSTER[index];

const veteran = pick("vuka", 0);
const wreck = pick("steva", 1);
const plainA = pick("kosta", 2);
const plainB = pick("dax", 3);

const skill = (level: number) => ({ level, progress: 0 });

function state(over: Partial<CharacterCareerState> = {}): CharacterCareerState {
  return {
    livesCap: skill(1),
    njuh: skill(1),
    nutrition: skill(1),
    fanSkill: skill(1),
    stress: 45,
    appetite: 50,
    ambition: 50,
    ego: 45,
    fame: 45,
    wins: 6,
    losses: 4,
    titles: 0,
    titleStreak: 0,
    meltdowns: 0,
    forfeits: 0,
    withdrawals: 0,
    lastTraining: null,
    sameTrainingStreak: 0,
    sponsor: null,
    fineRecency: 0,
    punishments: 0,
    ...over,
  };
}

// The finished article: everything trained, calm, and the hall is his
const veteranState = state({
  livesCap: skill(3),
  njuh: skill(3),
  nutrition: skill(2),
  fanSkill: skill(2),
  stress: 14,
  appetite: 52,
  fame: 84,
  ego: 60,
});

// About to come apart: almost nothing trained, cholesterol through the roof,
// and he ate before he came
const wreckState = state({
  livesCap: skill(1),
  njuh: skill(0),
  nutrition: skill(0),
  fanSkill: skill(1),
  stress: 93,
  appetite: 12,
  ambition: 40,
  ego: 30,
  fame: 38,
});

// Two ordinary competitors on an ordinary night, so the quiet case is visible
const plainStateA = state({ livesCap: skill(1), njuh: skill(1) });
const plainStateB = state({ nutrition: skill(1), fanSkill: skill(1) });

const SKILLS_ONLY: ScoutReveal = { skills: true, meters: false, detail: false };
const NOTHING: ScoutReveal = { skills: false, meters: false, detail: false };

export default function MatchStatsPreview() {
  return (
    <>
      <section className="flex flex-wrap justify-center gap-10 rounded-3xl border border-sky-200/15 bg-slate-900/40 p-5">
        <PreviewCase
          label="Extremes"
          note="Top: everything trained and calm. Bottom: nothing trained and coming apart at the seams."
        >
          <PreviewSpectateTable
            top={veteran}
            bottom={wreck}
            topState={veteranState}
            bottomState={wreckState}
          />
        </PreviewCase>
        <PreviewCase
          label="An ordinary night"
          note="Two average characters with no skill above level 1: the strip is nearly empty and stays out of the way."
        >
          <PreviewSpectateTable
            top={plainA}
            bottom={plainB}
            topState={plainStateA}
            bottomState={plainStateB}
          />
        </PreviewCase>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-sky-200/15 bg-slate-900/40 p-5">
        <div className="flex flex-col gap-1 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-400">
            Informant
          </span>
          <h2 className="text-lg font-bold text-white">
            How much shows at each investment level
          </h2>
          <p className="mx-auto max-w-lg text-xs leading-relaxed text-slate-400">
            Your character on top always shows in full. The opponent below depends
            on the informant: the question mark is clickable and says what the next
            level opens.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-10 pt-2">
          <PreviewCase
            label="No informant"
            note="Only a question mark. A click or a hover says you need an informant."
          >
            <PreviewSpectateTable
              top={veteran}
              bottom={wreck}
              topState={veteranState}
              bottomState={wreckState}
              bottomReveal={NOTHING}
            />
          </PreviewCase>
          <PreviewCase
            label="Informant level 1"
            note="The skills show, the chart does not yet. The question mark stays where the warnings go."
          >
            <PreviewSpectateTable
              top={veteran}
              bottom={wreck}
              topState={veteranState}
              bottomState={wreckState}
              bottomReveal={SKILLS_ONLY}
            />
          </PreviewCase>
          <PreviewCase
            label="Informant level 2"
            note="Everything open: cholesterol has blown and he is stuffed, both warnings red."
          >
            <PreviewSpectateTable
              top={veteran}
              bottom={wreck}
              topState={veteranState}
              bottomState={wreckState}
            />
          </PreviewCase>
        </div>
      </section>
    </>
  );
}
