import CareerButton from '@/components/games/career/CareerButton';
import TrainingIcon from '@/components/icons/TrainingIcon';
import {
  TRAININGS_PER_LEVEL,
  trainingCost,
  type TrainingDef,
} from '@/data/games/careerTraining';
import { GAMES_UI } from '@/data/games/locale';
import { fmt, plural, signedPct } from '@/lib/utils/format';
import type { TrainedStat } from '@/lib/utils/careerSave';

const OS = GAMES_UI.career.offseason;
const SP = OS.seasonPrices;
const T = GAMES_UI.career.trainings;

type ChipTone = 'good' | 'warn' | 'danger';

const CHIP_INK: Record<ChipTone, string> = {
  good: 'border-[#86efac]/60 text-[#86efac]',
  warn: 'border-[#fcd34d]/60 text-[#fcd34d]',
  danger: 'border-[#fca5a5]/60 text-[#fca5a5]',
};

// One drill written on the training center's board: the glyph circled, the
// name, the session's price underlined, the level as tally strokes with the
// sessions toward the next one as dots, the price swings and the overtraining
// risk boxed beside it, and the key that books it. A finished drill gets
// MAX stamped where the price was
export default function TrainingCard({
  def,
  stat,
  maxLevel,
  overtrainPct,
  priceScale = 1,
  partyPct = 0,
  gliziPct = 0,
  seasonPct = 0,
  affordable,
  disabled,
  onTrain,
}: {
  def: TrainingDef;
  stat: TrainedStat | null;
  maxLevel: number | null;
  overtrainPct: number;
  // The season's swing on training prices, and the rolled percent behind it
  priceScale?: number;
  partyPct?: number;
  gliziPct?: number;
  seasonPct?: number;
  affordable: boolean;
  disabled: boolean;
  onTrain: () => void;
}) {
  const strings = T[def.id];
  const level = stat ? stat.level : null;
  const atMax = level !== null && maxLevel !== null && level >= maxLevel;
  const cost = trainingCost(def, level ?? 0, priceScale);
  const chips: { label: string; tone: ChipTone }[] = [];
  if (!atMax) {
    if (seasonPct !== 0) {
      chips.push({
        label: fmt(SP.cardChip, { pct: signedPct(seasonPct) }),
        tone: seasonPct < 0 ? 'good' : 'danger',
      });
    }
    if (gliziPct !== 0) {
      chips.push({
        label: fmt(SP.gliziChip, { pct: signedPct(gliziPct) }),
        tone: gliziPct < 0 ? 'good' : 'danger',
      });
    }
    if (partyPct !== 0) {
      chips.push({
        label: fmt(OS.partyChip, { pct: signedPct(partyPct) }),
        tone: partyPct < 0 ? 'good' : 'danger',
      });
    }
    if (overtrainPct > 0) {
      chips.push({
        label: fmt(OS.overtrainWarning, { pct: overtrainPct }),
        tone: overtrainPct >= 50 ? 'danger' : 'warn',
      });
    }
  }
  return (
    <div
      className={`flex flex-col gap-2.5 rounded-[3px] border-2 border-[#e7efe9]/30 p-3 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#e7efe9]/45">
          <TrainingIcon id={def.id} className="h-8 w-8" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
          <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className="font-sign text-[17px] font-bold leading-tight text-[#f8fafc] [overflow-wrap:anywhere]">
              {strings.name}
            </span>
            {atMax ? (
              <span className="-rotate-6 rounded-[3px] border-2 border-[#fcd34d] px-2 font-sign text-[14px] font-bold tracking-[0.1em] text-[#fcd34d]">
                {OS.maxLevel}
              </span>
            ) : (
              <span className="border-b-2 border-current font-sign text-[15px] font-bold leading-tight tabular-nums text-[#fde68a]">
                {plural(OS.cost, cost, { cost })}
              </span>
            )}
          </span>
          {stat && maxLevel !== null && (
            <span className="flex items-center gap-2.5">
              <span className="flex items-center gap-[5px]">
                {Array.from({ length: maxLevel }, (_, i) => (
                  <span
                    key={i}
                    className={`h-4 w-[3px] rotate-12 rounded-full ${
                      i < stat.level ? 'bg-[#f8fafc]' : 'bg-[#f8fafc]/15'
                    }`}
                  />
                ))}
              </span>
              <span className="flex items-center gap-1">
                {Array.from({ length: TRAININGS_PER_LEVEL }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      stat.level < maxLevel && i < stat.progress
                        ? 'bg-[#fde68a]'
                        : 'bg-[#f8fafc]/15'
                    }`}
                  />
                ))}
              </span>
              <span className="font-sign text-[13px] font-semibold tabular-nums text-[#c9d6cc]">
                {fmt(OS.level, { level: stat.level })}
              </span>
            </span>
          )}
        </span>
      </div>
      {chips.length > 0 && (
        <span className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`rounded-[3px] border px-1.5 font-sign text-[13px] font-semibold tabular-nums ${CHIP_INK[chip.tone]}`}
            >
              {chip.label}
            </span>
          ))}
        </span>
      )}
      {!atMax && (
        <CareerButton
          tone="buy"
          full
          disabled={disabled || !affordable}
          className="mt-auto min-h-11"
          onClick={onTrain}
        >
          {affordable ? plural(OS.buy, cost, { cost }) : OS.noFunds}
        </CareerButton>
      )}
    </div>
  );
}
