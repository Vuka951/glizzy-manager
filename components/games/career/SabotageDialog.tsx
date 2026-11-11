import { useState } from 'react';
import ChanceStepper from '@/components/games/career/ChanceStepper';
import InfoTip from '@/components/games/career/InfoTip';
import DialogActions from '@/components/games/career/DialogActions';
import PortraitHead from '@/components/games/PortraitHead';
import SabotageMethodRow from '@/components/games/career/SabotageMethodRow';
import SabotageTargetGrid from '@/components/games/career/SabotageTargetGrid';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import { PLOTTING_EGO_GAIN } from '@/data/games/careerEconomy';
import {
  CURFEW_CHANCE_DROP,
  PUBLIC_ORDER_SCALE,
  type LawId,
} from '@/data/games/careerLaws';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { shieldedFromIndictment } from '@/lib/utils/careerElections';
import {
  lawActive,
  lawName,
  punishmentsCostVotes,
  sabotageLawChance,
} from '@/lib/utils/careerLaws';
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
import { isGreenClient } from '@/lib/utils/careerSponsors';
import { scoutReveal } from '@/lib/utils/careerScouting';
import { PAPER_PAINT, STREET_TRAY } from '@/lib/utils/careerFrameClasses';
import { fmt, ordinal, plural, signedPct } from '@/lib/utils/format';

const SAB = GAMES_UI.career.sabotage;
const OS = GAMES_UI.career.offseason;
const SP = OS.seasonPrices;
const TIER_STRINGS = SAB.tiers as Record<string, { name: string }>;
const TIERS = [1, 2, 3] as const;

type Step = 'target' | 'method' | 'stake';
const STEPS: Step[] = ['target', 'method', 'stake'];
const SUMMARY_LABEL =
  'font-sign text-[12px] font-semibold uppercase leading-tight tracking-[0.03em] text-slate-300';

// A job dossier in a manila folder, three decisions, one sheet each: who, how,
// and how much. The folder tabs keep every answer in view and take you back to
// change it; the sheet keeps one size between them, and the footer keeps the
// price and the pay button in reach the whole time
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
  // The laws on the books move the odds for everyone, exactly as the job is
  // rolled
  const parliament = career.parliament;
  const targetState = target ? career.characters[target] : undefined;
  const rawChance = tier ? sabotageChance(tier, boostSteps) : 0;
  const chance = sabotageLawChance(rawChance, parliament);
  const realChance = Math.round(chance * (1 - block) * 100);
  const cost = tier ? sabotageTotalCost(tier, boostSteps, priceScale) : 0;
  const plotter = career.characters[career.playerSlug];
  const judgePct =
    targetState && shieldedFromIndictment(targetState, parliament)
      ? 0
      : Math.round(indictmentChance(3, rawChance) * 100);
  const lawChips: { law: LawId; value: string; good: boolean }[] = [
    ...(lawActive(parliament, 'public-order')
      ? [{ law: 'public-order' as const, value: `×${PUBLIC_ORDER_SCALE}`, good: false }]
      : []),
    ...(lawActive(parliament, 'curfew')
      ? [
          {
            law: 'curfew' as const,
            value: signedPct(-Math.round(CURFEW_CHANCE_DROP * 100)),
            good: false,
          },
        ]
      : []),
  ];
  const hushed = isGreenClient(plotter);
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
      <div className="flex min-w-0 flex-col">
        <div
          className={`relative z-10 flex items-end gap-1 px-1 ${PAPER_PAINT}`}
        >
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
                className={`flex min-h-11 min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-t-[5px] px-2 py-1 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1e3a8a] disabled:cursor-not-allowed motion-reduce:transition-none ${
                  active
                    ? '-mb-px bg-[#f7efdc] pb-1.5 pt-1.5'
                    : value
                      ? 'bg-[#dcc99c] enabled:hover:bg-[#e8d8b2]'
                      : 'bg-[#c4b189] enabled:hover:bg-[#d4c29d]'
                }`}
              >
                <span className="font-sign text-[13px] font-bold uppercase leading-none tracking-[0.06em] text-slate-100">
                  {i + 1}. {stepLabel(s)}
                </span>
                <span
                  className={`truncate text-[11px] leading-tight ${
                    value ? 'font-serif font-bold text-slate-100' : 'text-slate-300'
                  }`}
                >
                  {value ?? SAB.steps.empty}
                </span>
              </button>
            );
          })}
        </div>
        <PaperSheet className="h-[min(calc(80vh/var(--game-zoom,1)_-_16rem),29rem)] overflow-y-auto sm:h-[min(calc(80vh/var(--game-zoom,1)_-_13rem),29rem)] overflow-x-hidden p-3 sm:p-4 phone-landscape:h-auto phone-landscape:overflow-visible">
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
        <div className="flex flex-col">
          {TIERS.map((t) => (
            <SabotageMethodRow
              key={t}
              tier={t}
              price={sabotageCost(t, priceScale)}
              baseChance={sabotageLawChance(sabotageChance(t, 0), parliament)}
              selected={tier === t}
              onSelect={() => pickTier(t)}
            />
          ))}
          {(seasonPct !== 0 ||
            gliziPct !== 0 ||
            repeatPct !== 0 ||
            lawChips.length > 0) && (
            <p className="flex flex-wrap gap-x-3 pt-3 font-sign text-[14px] font-semibold tabular-nums">
              {lawChips.map((chip) => (
                <span
                  key={chip.law}
                  className={chip.good ? 'text-emerald-300' : 'text-red-300'}
                >
                  {fmt(SAB.lawChip, {
                    law: lawName(chip.law),
                    value: chip.value,
                  })}
                </span>
              ))}
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
        </div>
      )}

      {step === 'stake' && tier && (
        <div className="flex min-h-full flex-col justify-center gap-2.5">
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
            onLess={() => setBoostSteps((s) => Math.max(0, s - 1))}
            onMore={() =>
              setBoostSteps((s) => Math.min(sabotageMaxBoostSteps(tier), s + 1))
            }
          />
          <div className="grid grid-cols-3 divide-x divide-dashed divide-slate-500 border-y-[3px] border-double border-[#1c1408]/70 py-2 text-center">
            <span className="flex flex-col items-center gap-1 px-1">
              <span className="font-sign text-[26px] font-bold leading-none tabular-nums text-red-300">
                {Math.round(chance * 100)}%
              </span>
              <span className={SUMMARY_LABEL}>{SAB.summary.job}</span>
            </span>
            <span className="flex flex-col items-center gap-1 px-1">
              <span
                className={`font-sign text-[26px] font-bold leading-none tabular-nums ${
                  block > 0 ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                {Math.round(block * 100)}%
                {guardUnknown && (
                  <span className="ml-0.5 text-[18px] text-slate-400">
                    {SAB.guardMore}
                  </span>
                )}
              </span>
              <span className={SUMMARY_LABEL}>{SAB.summary.guard}</span>
            </span>
            <span className="flex flex-col items-center gap-1 px-1">
              <span className="font-sign text-[26px] font-bold leading-none tabular-nums text-slate-100">
                {guardUnknown
                  ? fmt(SAB.realUpTo, { pct: realChance })
                  : `${realChance}%`}
              </span>
              <span className={`flex items-center justify-center gap-1.5 ${SUMMARY_LABEL}`}>
                {SAB.summary.real}
                <InfoTip text={SAB.summary.hint} />
              </span>
            </span>
          </div>
          {tier === 3 && (
            <p className="text-[12px] leading-snug text-sky-200">
              {fmt(SAB.judgeLine, { pct: judgePct })}
            </p>
          )}
          <p
            className={`text-[12px] leading-snug ${
              hushed ? 'text-emerald-300' : 'text-red-200'
            }`}
          >
            {isGreenClient(plotter)
              ? SAB.fineHushed
              : hushed
                ? SAB.fineLifted
                : fmt(
                    punishmentsCostVotes(parliament)
                      ? SAB.fineLine
                      : SAB.fineAmnesty,
                    { fine: sabotageFine(plotter) },
                  )}
          </p>
        </div>
      )}

        </PaperSheet>
      </div>

      <DialogActions
        left={
          ready ? (
            <span className={`px-2 py-1.5 font-sign text-[14px] font-semibold tabular-nums text-[#f0dca8] ${STREET_TRAY}`}>
              {fmt(SAB.egoLine, { ego: PLOTTING_EGO_GAIN })}
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
