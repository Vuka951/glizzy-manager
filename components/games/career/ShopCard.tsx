import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import { GAMES_UI } from '@/data/games/locale';
import { fmt, plural } from '@/lib/utils/format';

const OS = GAMES_UI.career.offseason;

const STAMP_TONES = {
  good: 'border-[#166534] text-[#166534]',
  warn: 'border-[#92400e] text-[#92400e]',
  danger: 'border-[#b91c1c] text-[#b91c1c]',
} as const;

export type ShopChip = { label: string; tone: keyof typeof STAMP_TONES };

// An offer as a typed contract sheet from the folder: the emblem and the name
// over a double rule with the price stamped beside them, the terms, what the
// current level gives and the next one would, levels ticked off in ink, rubber
// stamps for what bears on the price, and the key that signs it
export default function ShopCard({
  icon,
  title,
  desc,
  price,
  pips,
  chips = [],
  highlight,
  note,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  price?: number;
  pips: { level: number; max: number };
  chips?: ShopChip[];
  highlight?: string;
  note?: string;
  action?: { label: string; disabled: boolean; onClick: () => void };
}) {
  return (
    <PaperSheet className="flex flex-col gap-2 p-3 text-left odd:-rotate-[0.4deg] even:rotate-[0.3deg]">
      <div className="flex items-center gap-2.5 border-b-[3px] border-double border-slate-100 pb-1.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center">
          {icon}
        </span>
        <span className="min-w-0 flex-1 font-serif text-[15px] font-bold leading-tight text-slate-100">
          {title}
        </span>
        {price !== undefined && (
          <span className="shrink-0 -rotate-2 rounded-[3px] border-2 border-[#166534] px-1.5 font-sign text-[14px] font-bold tabular-nums text-[#166534]">
            {plural(OS.cost, price, { cost: price })}
          </span>
        )}
      </div>
      <p className="text-[11px] leading-snug text-slate-300">{desc}</p>
      {(highlight || note) && (
        <span className="flex flex-col gap-0.5 font-sign text-[14px] leading-tight">
          {highlight && (
            <span className="font-bold text-[#166534]">{highlight}</span>
          )}
          {note && <span className="text-slate-400">{note}</span>}
        </span>
      )}
      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <span className="flex items-center gap-1">
          {Array.from({ length: pips.max }, (_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-[1px] border border-slate-300 ${
                i < pips.level ? 'bg-slate-200' : ''
              }`}
            />
          ))}
        </span>
        <span className="font-sign text-[13px] font-semibold tabular-nums text-slate-400">
          {fmt(OS.level, { level: pips.level })}
        </span>
        {chips.map((chip) => (
          <span
            key={chip.label}
            className={`-rotate-2 rounded-[3px] border-2 px-1.5 font-sign text-[13px] font-bold uppercase tabular-nums tracking-[0.06em] ${STAMP_TONES[chip.tone]}`}
          >
            {chip.label}
          </span>
        ))}
      </span>
      {action && (
        <CareerButton
          tone="buy"
          full
          disabled={action.disabled}
          className="mt-auto min-h-11"
          onClick={action.onClick}
        >
          {action.label}
        </CareerButton>
      )}
    </PaperSheet>
  );
}
