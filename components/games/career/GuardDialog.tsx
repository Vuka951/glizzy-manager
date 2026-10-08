import { useState } from 'react';
import ChanceStepper from '@/components/games/career/ChanceStepper';
import DialogActions from '@/components/games/career/DialogActions';
import ActionIcon from '@/components/icons/ActionIcon';
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

export default function GuardDialog({
  balance,
  standingPct,
  priceScale = 1,
  seasonPct = 0,
  gliziPct = 0,
  place = 0,
  positionPct = 0,
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
  onConfirm: (steps: number) => void;
  onCancel: () => void;
}) {
  const [steps, setSteps] = useState(0);
  const cost = guardCost(steps, priceScale);
  const chance = Math.round(guardChance(steps) * 100);
  const affordable = balance >= cost;
  const minSteps = guardMinSteps();
  const maxSteps = guardMaxSteps();

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <div className="flex items-center gap-2.5">
        <ActionIcon kind="guard" className="h-6 w-6 shrink-0 text-amber-300" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">
          {G.title}
        </span>
      </div>
      {standingPct > 0 && (
        <p className="text-[10px] leading-relaxed text-emerald-300">
          {fmt(G.standing, { pct: standingPct })}
        </p>
      )}
      {positionPct > 0 && (
        <p className="text-[10px] leading-relaxed text-amber-200">
          {fmt(G.topSurcharge, { place: ordinal(place), pct: positionPct })}
        </p>
      )}
      {gliziPct !== 0 && (
        <span
          className={`self-start rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest ${
            gliziPct < 0
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
        >
          {fmt(SP.gliziChip, { pct: signedPct(gliziPct) })}
        </span>
      )}
      {seasonPct !== 0 && (
        <span
          className={`self-start rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest ${
            seasonPct < 0
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
        >
          {fmt(SP.cardChip, { pct: signedPct(seasonPct) })}
        </span>
      )}
      <ChanceStepper
        label={G.fund}
        caption={G.chanceLabel}
        note={plural(G.stepNote, guardStepCost(priceScale), { cost: guardStepCost(priceScale) })}
        hint={fmt(G.fundHint, {
          base: Math.round(GUARD_BLOCK_CHANCE * 100),
          max: Math.round(GUARD_MAX_CHANCE * 100),
          ego: PLOTTING_EGO_GAIN,
          appetite: APPETITE_REGROWTH,
        })}
        pct={chance}
        steps={maxSteps - minSteps + 1}
        filled={steps - minSteps + 1}
        tone="amber"
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
