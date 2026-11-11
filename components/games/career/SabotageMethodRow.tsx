'use client';

import ActionIcon from '@/components/icons/ActionIcon';
import HandcuffsIcon from '@/components/icons/HandcuffsIcon';
import HeartbreakIcon from '@/components/icons/HeartbreakIcon';
import Icon from '@/components/icons/Icon';
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
    return <ActionIcon kind="sabotage" className="h-5 w-5 text-red-300" />;
  if (tier === 2) return <HeartbreakIcon className="h-5 w-5" />;
  return <HandcuffsIcon className="h-5 w-5" />;
}

// One line of the order form: a box to cross, the name and its price over a
// dotted leader, the story, the base odds stamped and the side effects typed
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
      className={`flex w-full items-start gap-2.5 border-b border-[#1c1408]/30 px-1.5 py-3 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1e3a8a] motion-reduce:transition-none ${
        selected ? 'bg-[#fde047]/55' : 'hover:bg-[#1c1408]/[0.06]'
      }`}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[1px] border-2 border-[#1c1408] bg-[#fbf6e9]"
      >
        {selected && <Icon name="close" className="h-5 w-5 text-[#b91c1c]" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline gap-2">
          <span className="self-center">
            <TierIcon tier={tier} />
          </span>
          <span className="font-serif text-[16px] font-bold leading-tight text-slate-100">
            {strings.name}
          </span>
          <span
            aria-hidden="true"
            className="min-w-3 flex-1 -translate-y-1 border-b-2 border-dotted border-slate-500"
          />
          <span className="whitespace-nowrap font-sign text-[16px] font-bold tabular-nums text-emerald-300">
            {plural(OS.cost, price, { cost: price })}
          </span>
        </span>
        <span className="text-[12px] leading-snug text-slate-300">
          {strings.desc}
        </span>
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-sign text-[13px] font-semibold leading-tight">
          <span className="rounded-[2px] border-2 border-[#b91c1c] px-1 font-bold text-[#b91c1c]">
            {fmt(SAB.baseChance, { pct: Math.round(baseChance * 100) })}
          </span>
          {strings.effects.map((effect) => (
            <span
              key={effect}
              className={effect.includes('+') ? 'text-amber-300' : 'text-red-300'}
            >
              {effect}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}
