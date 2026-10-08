import ShopCard, { type ShopChip } from '@/components/games/career/ShopCard';
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
  const chips: ShopChip[] = [];
  if (atMax) chips.push({ label: OS.maxLevel, tone: 'warn' });
  if (seasonPct !== 0 && !atMax) {
    chips.push({
      label: fmt(SP.cardChip, { pct: signedPct(seasonPct) }),
      tone: seasonPct < 0 ? 'good' : 'danger',
    });
  }
  if (gliziPct !== 0 && !atMax) {
    chips.push({
      label: fmt(SP.gliziChip, { pct: signedPct(gliziPct) }),
      tone: gliziPct < 0 ? 'good' : 'danger',
    });
  }
  if (partyPct !== 0 && !atMax) {
    chips.push({
      label: fmt(OS.partyChip, { pct: signedPct(partyPct) }),
      tone: partyPct < 0 ? 'good' : 'danger',
    });
  }
  if (overtrainPct > 0 && !atMax) {
    chips.push({
      label: fmt(OS.overtrainWarning, { pct: overtrainPct }),
      tone: overtrainPct >= 50 ? 'danger' : 'warn',
    });
  }
  return (
    <ShopCard
      icon={<TrainingIcon id={def.id} className="h-9 w-9" />}
      title={strings.name}
      price={atMax ? undefined : cost}
      pips={
        stat && maxLevel !== null
          ? {
              level: stat.level,
              max: maxLevel,
              progress: stat.progress,
              progressMax: TRAININGS_PER_LEVEL,
              tone: 'amber',
            }
          : undefined
      }
      chips={chips}
      disabled={disabled || atMax}
      action={{
        label: affordable ? plural(OS.buy, cost, { cost }) : OS.noFunds,
        disabled: disabled || atMax || !affordable,
        onClick: onTrain,
      }}
    />
  );
}
