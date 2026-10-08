"use client";

import type { ReactNode } from "react";
import MatchStatsStrip from "@/components/games/match/MatchStatsStrip";
import SpectateTable from "@/components/games/match/SpectateTable";
import type { DuelCharacter, HidingSpotId } from "@/data/games/glizzyDuel";
import { CHARACTER_ROSTER } from "@/data/games/roster";
import { FULL_REVEAL, type ScoutReveal } from "@/lib/utils/careerScouting";
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

const spotVariants: Record<HidingSpotId, number> = { box: 0, hat: 1, sock: 2 };

function Table({
  top,
  bottom,
  topState,
  bottomState,
  topReveal = FULL_REVEAL,
  bottomReveal = FULL_REVEAL,
}: {
  top: DuelCharacter;
  bottom: DuelCharacter;
  topState: CharacterCareerState;
  bottomState: CharacterCareerState;
  topReveal?: ScoutReveal;
  bottomReveal?: ScoutReveal;
}) {
  return (
    <SpectateTable
      top={top}
      bottom={bottom}
      topLives={3}
      bottomLives={2}
      topCap={4}
      bottomCap={3}
      topMood={topState}
      bottomMood={bottomState}
      topFame={topState.fame}
      bottomFame={bottomState.fame}
      spotVariants={spotVariants}
      glizzyVariant={0}
      phase={{ kind: "think", seeker: "bottom" }}
      outcome={null}
      betSlug={top.slug}
      topStats={<MatchStatsStrip ch={topState} reveal={topReveal} seat="top" />}
      bottomStats={
        <MatchStatsStrip ch={bottomState} reveal={bottomReveal} seat="bottom" />
      }
    />
  );
}

function Case({
  label,
  note,
  children,
}: {
  label: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-[26rem] max-w-full flex-col items-center gap-3">
      <span className="rounded-full border border-sky-200/20 bg-slate-950/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-sky-200">
        {label}
      </span>
      <p className="max-w-xs text-center text-[11px] leading-relaxed text-slate-400">
        {note}
      </p>
      {children}
    </div>
  );
}

export default function MatchStatsPreview() {
  return (
    <>
      <section className="flex flex-wrap justify-center gap-10 rounded-3xl border border-sky-200/15 bg-slate-900/40 p-5">
        <Case
          label="Krajnosti"
          note="Gore sve istrenirano i miran, dole ništa istrenirano i puca po šavovima."
        >
          <Table
            top={veteran}
            bottom={wreck}
            topState={veteranState}
            bottomState={wreckState}
          />
        </Case>
        <Case
          label="Obična večer"
          note="Dva prosečna lika bez ijedne veštine preko prvog nivoa: traka je skoro prazna i ne odvlači pažnju."
        >
          <Table
            top={plainA}
            bottom={plainB}
            topState={plainStateA}
            bottomState={plainStateB}
          />
        </Case>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-sky-200/15 bg-slate-900/40 p-5">
        <div className="flex flex-col gap-1 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-400">
            Doušnik
          </span>
          <h2 className="text-lg font-bold text-white">
            Koliko se vidi po nivou ulaganja
          </h2>
          <p className="mx-auto max-w-lg text-xs leading-relaxed text-slate-400">
            Tvoj lik gore se uvek vidi ceo. Protivnik dole zavisi od doušnika:
            znak pitanja se može kliknuti i kaže šta otvara sledeći nivo.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-10 pt-2">
          <Case
            label="Bez doušnika"
            note="Samo znak pitanja. Klik ili prelazak mišem kaže da treba doušnik."
          >
            <Table
              top={veteran}
              bottom={wreck}
              topState={veteranState}
              bottomState={wreckState}
              bottomReveal={NOTHING}
            />
          </Case>
          <Case
            label="Doušnik 1. nivo"
            note="Veštine se vide, karton još ne. Znak pitanja ostaje na mestu upozorenja."
          >
            <Table
              top={veteran}
              bottom={wreck}
              topState={veteranState}
              bottomState={wreckState}
              bottomReveal={SKILLS_ONLY}
            />
          </Case>
          <Case
            label="Doušnik 2. nivo"
            note="Sve otvoreno: holesterol pukao i prejeden je, oba upozorenja crvena."
          >
            <Table
              top={veteran}
              bottom={wreck}
              topState={veteranState}
              bottomState={wreckState}
            />
          </Case>
        </div>
      </section>
    </>
  );
}
