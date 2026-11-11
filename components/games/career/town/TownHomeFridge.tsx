'use client';

import TownHomeNote from '@/components/games/career/town/TownHomeNote';
import ActionIcon from '@/components/icons/ActionIcon';
import BowlIcon from '@/components/icons/BowlIcon';
import {
  APPETITE_REGROWTH,
  FASTING_AMBITION_GAIN,
  FASTING_APPETITE_GAIN,
  FASTING_STRESS,
  REST_DRIFT,
  REST_EGO_TARGET,
  REST_FAME_DROP,
  REST_SIDE_DRIFT,
  REST_STRESS_DROP,
} from '@/data/games/careerEconomy';
import { GAMES_UI } from '@/data/games/locale';
import { greenWeekendEveryWindow } from '@/lib/utils/careerElections';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const A = GAMES_UI.career.actions;
const OS = GAMES_UI.career.offseason;
const T = GAMES_UI.career.trainings;

// The house's fridge door, where the month at home is decided: rest, the
// fast, and while the Green Party still owes one, the island weekend. An old enamel
// fridge filling the board, with paper under magnets
export default function TownHomeFridge({
  ch,
  islandAvailable,
  slotsFull,
  onRest,
  onIsland,
}: {
  ch: CharacterCareerState;
  islandAvailable: boolean;
  slotsFull: boolean;
  onRest: (fasting: boolean) => void;
  onIsland: () => void;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#e3ece1] to-[#bccbbb] p-3 pr-7 text-left shadow-[inset_0_3px_8px_rgb(0_0_0/0.35)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgb(255_255_255/0.55),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="relative -mx-3 -mr-7 -mt-3 mb-4 flex h-7 items-center justify-center border-b-2 border-[#8a9c8b]"
      >
        <span className="h-2 w-12 rounded-full bg-gradient-to-b from-[#f8fafc] via-[#94a3b8] to-[#e2e8f0] shadow-[0_1px_0_rgb(0_0_0/0.3)]" />
      </div>
      <span
        aria-hidden="true"
        className="absolute right-2.5 top-1.5 h-4 w-2 rounded-full bg-gradient-to-r from-[#f8fafc] via-[#94a3b8] to-[#e2e8f0]"
      />
      <span
        aria-hidden="true"
        className="absolute right-2.5 top-12 h-16 w-2 rounded-full bg-gradient-to-r from-[#f8fafc] via-[#94a3b8] to-[#e2e8f0] shadow-[0_2px_0_rgb(0_0_0/0.3)]"
      />
      <div className="relative flex flex-col gap-5 pb-1 pt-1">
        <TownHomeNote
          kind="sticky"
          icon={<ActionIcon kind="rest" className="h-8 w-8 text-[#047857]" />}
          title={T.rest.name}
          desc={fmt(A.restDesc, {
            stressMin: REST_STRESS_DROP - REST_DRIFT,
            stressMax: REST_STRESS_DROP + REST_DRIFT,
            appetiteMin: APPETITE_REGROWTH - REST_SIDE_DRIFT,
            appetiteMax: APPETITE_REGROWTH + REST_SIDE_DRIFT,
            drift: REST_SIDE_DRIFT,
            ego: REST_EGO_TARGET,
            fame: REST_FAME_DROP,
          })}
          action={{
            label: OS.spendMonth,
            disabled: slotsFull,
            onClick: () => onRest(false),
          }}
        />
        <TownHomeNote
          kind="pad"
          icon={<BowlIcon className="h-8 w-8" />}
          title={A.fast}
          desc={fmt(A.fastDesc, {
            gain: FASTING_APPETITE_GAIN,
            amb: FASTING_AMBITION_GAIN,
            stress: FASTING_STRESS,
          })}
          action={{
            label: OS.spendMonth,
            disabled: slotsFull,
            onClick: () => onRest(true),
          }}
        />
        {islandAvailable && (
          <TownHomeNote
            kind="postcard"
            icon={<ActionIcon kind="island" className="h-8 w-8" />}
            title={A.island}
            desc={
              greenWeekendEveryWindow(ch) ? A.islandDescEveryWindow : A.islandDesc
            }
            action={{ label: A.islandFree, onClick: onIsland }}
          />
        )}
      </div>
    </div>
  );
}
