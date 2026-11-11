import { useState } from 'react';
import DialogActions from '@/components/games/career/DialogActions';
import TownGuardConsole from '@/components/games/career/town/TownGuardConsole';
import TownGuardRoster from '@/components/games/career/town/TownGuardRoster';
import TownGuardStamp from '@/components/games/career/town/TownGuardStamp';
import {
  APPETITE_REGROWTH,
  GUARD_BLOCK_CHANCE,
  GUARD_MAX_CHANCE,
  PLOTTING_EGO_GAIN,
} from '@/data/games/careerEconomy';
import { GAMES_UI } from '@/data/games/locale';
import {
  guardChance,
  guardCost,
  guardMaxSteps,
  guardMinSteps,
  guardStepCost,
} from '@/lib/utils/careerSabotage';
import { fmt, ordinal, plural, signedPct } from '@/lib/utils/format';

const G = GAMES_UI.career.guard;
const OS = GAMES_UI.career.offseason;
const SP = OS.seasonPrices;

// The security firm's booth: the duty roster on its clipboard, then the
// console the coverage is dialled up on
export default function GuardDialog({
  balance,
  standingPct,
  priceScale = 1,
  seasonPct = 0,
  gliziPct = 0,
  place = 0,
  positionPct = 0,
  maxChance = GUARD_MAX_CHANCE,
  onConfirm,
  onCancel,
}: {
  balance: number;
  standingPct: number;
  priceScale?: number;
  seasonPct?: number;
  gliziPct?: number;
  place?: number;
  positionPct?: number;
  maxChance?: number;
  onConfirm: (steps: number) => void;
  onCancel: () => void;
}) {
  const [steps, setSteps] = useState(0);
  const cost = guardCost(steps, priceScale);
  const chance = Math.round(guardChance(steps, maxChance) * 100);
  const affordable = balance >= cost;
  const minSteps = guardMinSteps();
  const maxSteps = guardMaxSteps(maxChance);
  const roster =
    standingPct > 0 || positionPct > 0 || gliziPct !== 0 || seasonPct !== 0;

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <TownGuardRoster title={G.title}>
        {roster && (
          <>
            {standingPct > 0 && (
              <p className="text-[11px] font-semibold leading-relaxed text-[#065f46]">
                {fmt(G.standing, { pct: standingPct })}
              </p>
            )}
            {positionPct > 0 && (
              <p className="text-[11px] font-semibold leading-relaxed text-[#92400e]">
                {fmt(G.topSurcharge, { place: ordinal(place), pct: positionPct })}
              </p>
            )}
            {(gliziPct !== 0 || seasonPct !== 0) && (
              <div className="flex flex-wrap gap-2 py-0.5">
                {gliziPct !== 0 && (
                  <TownGuardStamp
                    label={fmt(SP.gliziChip, { pct: signedPct(gliziPct) })}
                    cheaper={gliziPct < 0}
                  />
                )}
                {seasonPct !== 0 && (
                  <TownGuardStamp
                    label={fmt(SP.cardChip, { pct: signedPct(seasonPct) })}
                    cheaper={seasonPct < 0}
                  />
                )}
              </div>
            )}
          </>
        )}
      </TownGuardRoster>
      <TownGuardConsole
        label={G.fund}
        caption={G.chanceLabel}
        note={plural(G.stepNote, guardStepCost(priceScale), { cost: guardStepCost(priceScale) })}
        hint={fmt(G.fundHint, {
          base: Math.round(GUARD_BLOCK_CHANCE * 100),
          max: Math.round(maxChance * 100),
          ego: PLOTTING_EGO_GAIN,
          appetite: APPETITE_REGROWTH,
        })}
        pct={chance}
        steps={maxSteps - minSteps + 1}
        filled={steps - minSteps + 1}
        onLess={() => setSteps((s) => Math.max(minSteps, s - 1))}
        onMore={() => setSteps((s) => Math.min(maxSteps, s + 1))}
      />
      <DialogActions
        confirmLabel={affordable ? plural(OS.buy, cost, { cost }) : OS.noFunds}
        confirmDisabled={!affordable}
        onConfirm={() => onConfirm(steps)}
        onCancel={onCancel}
      />
    </div>
  );
}
