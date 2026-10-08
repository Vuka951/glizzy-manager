import ActionIcon from '@/components/icons/ActionIcon';
import HandcuffsIcon from '@/components/icons/HandcuffsIcon';
import HeartbreakIcon from '@/components/icons/HeartbreakIcon';
import { GAMES_UI } from '@/data/games/locale';
import type { SabotageTier } from '@/lib/utils/careerSave';
import { fmt, plural } from '@/lib/utils/format';

const SAB = GAMES_UI.career.sabotage;
const OS = GAMES_UI.career.offseason;
const TIER_STRINGS = SAB.tiers as Record<
  string,
  { name: string; desc: string; effects: string[] }
>;

// One glyph per method: skill hit, catfish heartbreak, handcuffs
function TierIcon({ tier }: { tier: SabotageTier }) {
  if (tier === 1)
    return <ActionIcon kind="sabotage" className="h-6 w-6 text-red-300" />;
  if (tier === 2) return <HeartbreakIcon />;
  return <HandcuffsIcon />;
}

// One method as a single row: the glyph, the name and its price on one line,
// the base odds, the story in one sentence, the side effects as chips
export default function SabotageMethodRow({
  tier,
  price,
  baseChance,
  selected,
  onSelect,
}: {
  tier: SabotageTier;
  price: number;
  baseChance: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const strings = TIER_STRINGS[String(tier)];
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
        selected
          ? 'border-red-400/70 bg-red-500/15'
          : 'border-sky-200/10 bg-slate-950/40 hover:border-red-400/40 hover:bg-slate-800/60'
      }`}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
        <TierIcon tier={tier} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className="text-xs font-bold text-white">{strings.name}</span>
          <span className="flex items-baseline gap-2 font-mono text-[10px] font-bold">
            <span className="text-red-300">
              {fmt(SAB.baseChance, { pct: Math.round(baseChance * 100) })}
            </span>
            <span className="text-emerald-300">
              {plural(OS.cost, price, { cost: price })}
            </span>
          </span>
        </span>
        <span className="text-[10px] leading-snug text-slate-400">
          {strings.desc}
        </span>
        <span className="flex flex-wrap gap-1">
          {strings.effects.map((effect) => (
            <span
              key={effect}
              className={`rounded-full border px-1.5 py-px text-[8px] font-bold uppercase tracking-widest ${
                effect.includes('+')
                  ? 'border-amber-400/40 bg-amber-500/10 text-amber-300'
                  : 'border-red-500/40 bg-red-500/10 text-red-300'
              }`}
            >
              {effect}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}
