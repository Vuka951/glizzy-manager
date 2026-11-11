"use client";

import PreviewCase from "@/components/preview/PreviewCase";
import PreviewSection from "@/components/preview/PreviewSection";
import PreviewSpectateTable from "@/components/preview/PreviewSpectateTable";
import { previewRoster } from "@/components/preview/previewRoster";
import type { ScoutReveal } from "@/lib/utils/careerScouting";
import type { CharacterCareerState } from "@/lib/utils/careerSave";

const [veteran, wreck, plainA, plainB] = previewRoster();

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
      <PreviewSection
        title="Stats at the table"
        note="The strip under the name carries four skills and up to two warnings from the card. An untrained skill fades, an average card says nothing, and what you have not paid for stands as a question mark that tells you what you need."
      >
        <div className="flex flex-wrap justify-center gap-10">
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
        </div>
      </PreviewSection>

      <PreviewSection
        title="Stats by informant level"
        note="Your character on top always shows in full. The opponent below depends on the informant: the question mark is clickable and says what the next level opens."
      >
        <div className="flex flex-wrap justify-center gap-10">
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
      </PreviewSection>
    </>
  );
}
