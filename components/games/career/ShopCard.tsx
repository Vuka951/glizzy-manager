import BuyButton from '@/components/games/career/BuyButton';
import { GAMES_UI } from '@/data/games/locale';
import { fmt, plural } from '@/lib/utils/format';

const OS = GAMES_UI.career.offseason;

const CHIP_TONES = {
  muted: 'border-slate-600/50 bg-slate-800/60 text-slate-400',
  good: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  warn: 'border-amber-400/40 bg-amber-500/10 text-amber-300',
  danger: 'border-red-500/40 bg-red-500/10 text-red-300',
} as const;

const TONES = {
  sky: {
    idle: 'border-sky-200/15 hover:border-sky-200/45',
    selected: 'border-sky-300/70 bg-sky-500/10',
    pip: 'bg-sky-300',
  },
  amber: {
    idle: 'border-amber-400/20 hover:border-amber-400/50',
    selected: 'border-amber-300/70 bg-amber-500/10',
    pip: 'bg-amber-400',
  },
  red: {
    idle: 'border-red-500/20 hover:border-red-500/50',
    selected: 'border-red-400/70 bg-red-500/15',
    pip: 'bg-red-400',
  },
} as const;

export type ShopChip = { label: string; tone?: keyof typeof CHIP_TONES };

// Every offer in the career reads the same way: a glyph, a name, a price, one
// line of what it does, then the pips and chips that say where it stands and
// the single button that commits it. Cards that are one option inside a bigger
// dialog swap the button for a selected state and let the dialog commit
export default function ShopCard({
  icon,
  title,
  desc,
  price,
  earn,
  pips,
  chips = [],
  highlight,
  note,
  tone = 'sky',
  selected,
  disabled = false,
  onSelect,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  price?: number;
  earn?: number;
  pips?: {
    level: number;
    max: number;
    progress?: number;
    progressMax?: number;
    tone?: keyof typeof TONES;
  };
  chips?: ShopChip[];
  highlight?: string;
  note?: string;
  tone?: keyof typeof TONES;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  action?: { label: string; disabled?: boolean; tone?: 'buy' | 'danger' | 'neutral'; onClick: () => void };
}) {
  const T = TONES[tone];
  const body = (
    <>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center">
          {icon}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <span className="text-xs font-bold text-white">{title}</span>
            {price !== undefined && (
              <span className="font-mono text-[10px] font-bold text-emerald-300">
                {plural(OS.cost, price, { cost: price })}
              </span>
            )}
            {earn !== undefined && (
              <span className="font-mono text-[10px] font-bold text-amber-300">
                +{plural(OS.cost, earn, { cost: earn })}
              </span>
            )}
          </span>
          {desc && (
            <span className="text-[10px] leading-snug text-slate-400">{desc}</span>
          )}
        </span>
      </div>
      {(highlight || note) && (
        <span className="flex flex-col gap-0.5">
          {highlight && (
            <span className="font-mono text-[10px] font-bold text-emerald-300">
              {highlight}
            </span>
          )}
          {note && (
            <span className="font-mono text-[10px] text-slate-400">{note}</span>
          )}
        </span>
      )}
      {(pips || chips.length > 0) && (
        <span className="flex flex-wrap items-center gap-1.5">
          {pips && (
            <span className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: pips.max }, (_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i < pips.level
                        ? TONES[pips.tone ?? tone].pip
                        : 'border border-slate-600'
                    }`}
                  />
                ))}
              </span>
              {pips.progressMax !== undefined && (
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: pips.progressMax }, (_, i) => (
                    <span
                      key={i}
                      className={`h-1 w-2 rounded-sm ${
                        pips.level < pips.max && i < (pips.progress ?? 0)
                          ? 'bg-sky-400'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </span>
              )}
              <span className="font-mono text-[9px] font-bold text-slate-500">
                {fmt(OS.level, { level: pips.level })}
              </span>
            </span>
          )}
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest ${
                CHIP_TONES[chip.tone ?? 'muted']
              }`}
            >
              {chip.label}
            </span>
          ))}
        </span>
      )}
    </>
  );

  const shell = `flex flex-col gap-2.5 rounded-2xl border p-3.5 text-left transition ${
    disabled ? 'border-sky-200/10 bg-slate-900/30 opacity-50' : 'bg-slate-800/40'
  }`;

  if (onSelect) {
    return (
      <button
        onClick={onSelect}
        disabled={disabled}
        aria-pressed={selected}
        className={`${shell} ${
          disabled ? '' : selected ? T.selected : `${T.idle} hover:bg-slate-800/70`
        }`}
      >
        {body}
      </button>
    );
  }

  return (
    <div className={`${shell} ${disabled ? '' : T.idle}`}>
      {body}
      {action && (
        <BuyButton
          label={action.label}
          tone={action.tone ?? 'buy'}
          disabled={action.disabled}
          onClick={action.onClick}
        />
      )}
    </div>
  );
}
