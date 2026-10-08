import ActionIcon, { type ActionIconKind } from '@/components/icons/ActionIcon';
import ShopCard, { type ShopChip } from '@/components/games/career/ShopCard';
import {
  ASSISTANT_SESSIONS,
  INVESTMENT_DEFS,
  SECURITY_CHANCE,
  SPA_STRESS_DROP,
  investmentCost,
  type InvestmentId,
} from '@/data/games/careerInvestments';
import { GAMES_UI } from '@/data/games/locale';
import { fmt, plural, signedPct } from '@/lib/utils/format';

const OS = GAMES_UI.career.offseason;
const SP = GAMES_UI.career.offseason.seasonPrices;
const INV = GAMES_UI.career.investments;

export const INVESTMENT_ICON_BY_ID: Record<InvestmentId, ActionIconKind> = {
  security: 'guard',
  spa: 'rest',
  assistant: 'training',
  scout: 'scout',
};

// What one level of a contract buys, spelled out in the same words the shop
// and the receipt use
function effectAt(id: InvestmentId, level: number): string {
  const strings = INV.effects as Record<string, string>;
  if (id === 'security') {
    return fmt(strings.security, {
      pct: Math.round(SECURITY_CHANCE[level - 1] * 100),
    });
  }
  if (id === 'spa') {
    return fmt(strings.spa, { drop: SPA_STRESS_DROP[level - 1] });
  }
  if (id === 'scout') return strings[`scout${level}`];
  return fmt(strings.assistant, { n: ASSISTANT_SESSIONS[level - 1] });
}

export default function InvestmentCard({
  id,
  level,
  balance,
  priceScale = 1,
  gliziPct = 0,
  onBuy,
}: {
  id: InvestmentId;
  level: number;
  balance: number;
  priceScale?: number;
  gliziPct?: number;
  onBuy: () => void;
}) {
  const def = INVESTMENT_DEFS[id];
  const listPrice = investmentCost(id, level);
  const cost = listPrice === null ? null : Math.round(listPrice * priceScale);
  const atMax = cost === null;
  const chips: ShopChip[] = atMax
    ? [{ label: OS.maxLevel, tone: 'warn' }]
    : gliziPct !== 0
      ? [
          {
            label: fmt(SP.gliziChip, { pct: signedPct(gliziPct) }),
            tone: gliziPct < 0 ? 'good' : 'danger',
          },
        ]
      : [];
  const affordable = cost !== null && balance >= cost;
  return (
    <ShopCard
      tone="amber"
      icon={
        <ActionIcon
          kind={INVESTMENT_ICON_BY_ID[id]}
          className="h-8 w-8 text-amber-300"
        />
      }
      title={(INV.names as Record<string, string>)[id]}
      desc={(INV.descs as Record<string, string>)[id]}
      price={cost ?? undefined}
      pips={{ level, max: def.maxLevel }}
      chips={chips}
      highlight={level > 0 ? fmt(INV.current, { effect: effectAt(id, level) }) : undefined}
      note={
        atMax ? undefined : fmt(INV.next, { effect: effectAt(id, level + 1) })
      }
      disabled={atMax}
      action={
        atMax
          ? undefined
          : {
              label: affordable ? plural(OS.buy, cost as number, { cost: cost as number }) : OS.noFunds,
              disabled: !affordable,
              onClick: onBuy,
            }
      }
    />
  );
}
