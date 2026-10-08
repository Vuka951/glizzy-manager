import { useState } from 'react';
import ChanceStepper from '@/components/games/career/ChanceStepper';
import DialogActions from '@/components/games/career/DialogActions';
import PortraitHead from '@/components/games/PortraitHead';
import SabotageMethodRow from '@/components/games/career/SabotageMethodRow';
import SabotageTargetGrid from '@/components/games/career/SabotageTargetGrid';
import { PLOTTING_EGO_GAIN } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SabotageTier, SavedCareer } from '@/lib/utils/careerSave';
import {
  indictmentChance,
  sabotageBoostStepCost,
  sabotageChance,
  sabotageCost,
  sabotageFine,
  sabotageMaxBoostSteps,
  sabotageRepeatScale,
  sabotageTotalCost,
  visibleGuardBlock,
} from '@/lib/utils/careerSabotage';
import { isOstrvoClient } from '@/lib/utils/careerSponsors';
import { scoutReveal } from '@/lib/utils/careerScouting';
import { fmt, ordinal, plural, signedPct } from '@/lib/utils/format';

const SAB = GAMES_UI.career.sabotage;
const OS = GAMES_UI.career.offseason;
const SP = OS.seasonPrices;
const TIER_STRINGS = SAB.tiers as Record<string, { name: string }>;
const TIERS = [1, 2, 3] as const;

type Step = 'target' | 'method' | 'stake';
const STEPS: Step[] = ['target', 'method', 'stake'];

// Three decisions in a row, one screen each: who, how, and how much. The
// strip at the top keeps every answer in view and takes you back to change
// it; the footer keeps the price and the pay button in reach the whole time
export default function SabotageDialog({
  career,
  characters,
  priceScale = 1,
  seasonPct = 0,
  gliziPct = 0,
  plotsBooked = 0,
  onConfirm,
  onCancel,
}: {
  career: SavedCareer;
  characters: DuelCharacter[];
  priceScale?: number;
  seasonPct?: number;
  gliziPct?: number;
  plotsBooked?: number;
  onConfirm: (
    targetSlug: string,
    tier: SabotageTier,
    boostSteps: number,
  ) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<Step>('target');
  const [target, setTarget] = useState<string | null>(null);
  const [tier, setTier] = useState<SabotageTier | null>(null);
  const [boostSteps, setBoostSteps] = useState(0);

  const selectedCharacter = characters.find((c) => c.slug === target) ?? null;
  const revealDetail = scoutReveal(
    career.characters[career.playerSlug],
    false,
  ).detail;
  const guard = target ? visibleGuardBlock(career, target, revealDetail) : null;
  const block = guard?.known ?? 0;
  const guardUnknown = guard?.unknown ?? false;
  const chance = tier ? sabotageChance(tier, boostSteps) : 0;
  const realChance = Math.round(chance * (1 - block) * 100);
  const cost = tier ? sabotageTotalCost(tier, boostSteps, priceScale) : 0;
  const plotter = career.characters[career.playerSlug];
  const repeatPct = Math.round((sabotageRepeatScale(plotsBooked) - 1) * 100);
  const affordable = career.balance >= cost;
  const ready = Boolean(target && tier);

  const pickTarget = (slug: string) => {
    setTarget(slug);
    setStep('method');
  };
  const pickTier = (t: SabotageTier) => {
    setTier(t);
    setBoostSteps(0);
    setStep('stake');
  };

  const stepLabel = (s: Step) =>
    s === 'target'
      ? SAB.steps.target
      : s === 'method'
        ? SAB.steps.method
        : SAB.steps.stake;
  const stepValue = (s: Step): React.ReactNode => {
    if (s === 'target') {
      return selectedCharacter ? (
        <span className="inline-flex items-center gap-1">
          <PortraitHead character={selectedCharacter} className="h-4 w-4" />
          {selectedCharacter.name}
        </span>
      ) : null;
    }
    if (s === 'method') return tier ? TIER_STRINGS[String(tier)].name : null;
    return tier ? `${Math.round(chance * 100)}%` : null;
  };
  const stepEnabled = (s: Step) =>
    s === 'target' || (s === 'method' && target) || (s === 'stake' && ready);

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <div className="grid grid-cols-3 gap-1.5">
        {STEPS.map((s, i) => {
          const active = step === s;
          const value = stepValue(s);
          const enabled = Boolean(stepEnabled(s));
          return (
            <button
              key={s}
              disabled={!enabled}
              onClick={() => setStep(s)}
              aria-current={active ? 'step' : undefined}
              className={`flex min-w-0 flex-col gap-0.5 rounded-xl border px-2.5 py-1.5 text-left transition disabled:opacity-40 ${
                active
                  ? 'border-red-400/70 bg-red-500/10'
                  : 'border-sky-200/10 bg-slate-950/40 enabled:hover:border-sky-200/30'
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {i + 1}. {stepLabel(s)}
              </span>
              <span
                className={`truncate text-[11px] font-semibold ${
                  value ? 'text-white' : 'text-slate-600'
                }`}
              >
                {value ?? SAB.steps.empty}
              </span>
            </button>
          );
        })}
      </div>

      {step === 'target' && (
        <div className="flex flex-col gap-2">
          <SabotageTargetGrid
            career={career}
            characters={characters}
            selected={target}
            onSelect={pickTarget}
          />
        </div>
      )}

      {step === 'method' && (
        <div className="flex flex-col gap-2">
          {TIERS.map((t) => (
            <SabotageMethodRow
              key={t}
              tier={t}
              price={sabotageCost(t, priceScale)}
              baseChance={sabotageChance(t, 0)}
              selected={tier === t}
              onSelect={() => pickTier(t)}
            />
          ))}
          {(seasonPct !== 0 || gliziPct !== 0 || repeatPct !== 0) && (
            <p className="flex flex-wrap gap-x-2 text-[10px] font-semibold">
              {repeatPct !== 0 && (
                <span className="text-red-300">
                  {fmt(SAB.repeatChip, {
                    n: ordinal(plotsBooked + 1),
                    pct: signedPct(repeatPct),
                  })}
                </span>
              )}
              {seasonPct !== 0 && (
                <span
                  className={seasonPct < 0 ? 'text-emerald-300' : 'text-red-300'}
                >
                  {fmt(SP.cardChip, { pct: signedPct(seasonPct) })}
                </span>
              )}
              {gliziPct !== 0 && (
                <span
                  className={gliziPct < 0 ? 'text-emerald-300' : 'text-red-300'}
                >
                  {fmt(SP.gliziChip, { pct: signedPct(gliziPct) })}
                </span>
              )}
            </p>
          )}
          <p className="text-[10px] leading-relaxed text-slate-400">
            {SAB.repeatHint}
          </p>
        </div>
      )}

      {step === 'stake' && tier && (
        <div className="flex flex-col gap-2.5">
          <ChanceStepper
            label={SAB.fund}
            caption={SAB.chanceLabel}
            note={plural(SAB.stepNote, sabotageBoostStepCost(tier, priceScale), {
              cost: sabotageBoostStepCost(tier, priceScale),
            })}
            hint={SAB.fundHint}
            pct={Math.round(chance * 100)}
            steps={sabotageMaxBoostSteps(tier) + 1}
            filled={boostSteps + 1}
            tone="red"
            onLess={() => setBoostSteps((s) => Math.max(0, s - 1))}
            onMore={() =>
              setBoostSteps((s) => Math.min(sabotageMaxBoostSteps(tier), s + 1))
            }
          />
          <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-sky-200/10 bg-slate-950/40 p-2.5 text-center">
            <span className="flex flex-col">
              <span className="font-mono text-lg font-black text-red-300">
                {Math.round(chance * 100)}%
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {SAB.summary.job}
              </span>
            </span>
            <span className="flex flex-col">
              <span
                className={`font-mono text-lg font-black ${
                  block > 0 ? 'text-amber-300' : 'text-slate-500'
                }`}
              >
                {Math.round(block * 100)}%
                {guardUnknown && (
                  <span className="ml-0.5 text-sm text-slate-500">
                    {SAB.guardMore}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {SAB.summary.guard}
              </span>
            </span>
            <span className="flex flex-col">
              <span className="font-mono text-lg font-black text-white">
                {guardUnknown
                  ? fmt(SAB.realUpTo, { pct: realChance })
                  : `${realChance}%`}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {SAB.summary.real}
              </span>
            </span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            {SAB.summary.hint}
          </p>
          {tier === 3 && (
            <p className="text-[10px] leading-relaxed text-sky-200">
              {fmt(SAB.judgeLine, {
                pct: Math.round(indictmentChance(3, chance) * 100),
              })}
            </p>
          )}
          <p
            className={`text-[10px] leading-relaxed ${
              isOstrvoClient(plotter) ? 'text-emerald-300' : 'text-red-200'
            }`}
          >
            {isOstrvoClient(plotter)
              ? SAB.fineHushed
              : fmt(SAB.fineLine, {
                  fine: sabotageFine(plotter),
                })}
          </p>
          <p className="text-[10px] leading-relaxed text-slate-400">
            {fmt(SAB.egoLine, { ego: PLOTTING_EGO_GAIN })}
          </p>
        </div>
      )}

      <DialogActions
        left={
          ready ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-300">
              <span className="font-mono font-bold text-white">
                {guardUnknown
                  ? fmt(SAB.realUpTo, { pct: realChance })
                  : `${realChance}%`}
              </span>
              {SAB.summary.real.toLowerCase()}
            </span>
          ) : undefined
        }
        confirmLabel={
          !target
            ? SAB.pickTarget
            : !tier
              ? SAB.pickMethod
              : affordable
                ? plural(OS.buy, cost, { cost })
                : OS.noFunds
        }
        confirmTone="danger"
        confirmDisabled={!ready || !affordable}
        onConfirm={() => target && tier && onConfirm(target, tier, boostSteps)}
        onCancel={onCancel}
      />
    </div>
  );
}
