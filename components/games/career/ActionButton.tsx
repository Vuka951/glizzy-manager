import ActionIcon, { type ActionIconKind } from '@/components/icons/ActionIcon';

const TONES = {
  default: {
    idle: 'border-sky-200/15 bg-slate-800/70 text-sky-200 hover:border-sky-200/45',
    icon: 'text-sky-300',
  },
  danger: {
    idle: 'border-red-500/25 bg-slate-800/70 text-red-200 hover:border-red-500/55',
    icon: 'text-red-300',
  },
  gold: {
    idle: 'border-amber-400/25 bg-slate-800/70 text-amber-200 hover:border-amber-400/55',
    icon: 'text-amber-300',
  },
  green: {
    idle: 'border-emerald-400/25 bg-slate-800/70 text-emerald-200 hover:border-emerald-400/55',
    icon: 'text-emerald-300',
  },
} as const;

// Big thumb-friendly action tile for the scene UI
export default function ActionButton({
  icon,
  label,
  sub,
  tone = 'default',
  disabled = false,
  compact = false,
  onClick,
}: {
  icon: ActionIconKind;
  label: string;
  sub?: string | null;
  tone?: keyof typeof TONES;
  disabled?: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  const t = TONES[tone];
  const shape = compact
    ? 'h-12 w-12 justify-center gap-0 p-0 text-left sm:h-auto sm:min-h-11 sm:w-full sm:justify-start sm:gap-2 sm:px-3 sm:py-2 xl:min-h-13 xl:gap-2.5 xl:px-3.5 xl:py-2.5'
    : 'min-h-20 flex-col justify-center gap-1 px-2 py-2.5 xl:min-h-24 xl:px-3 xl:py-3';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex items-center rounded-2xl border backdrop-blur-sm transition-all duration-200 ${shape} ${
        disabled
          ? 'cursor-not-allowed border-sky-200/10 bg-slate-900/50 text-slate-600 opacity-60'
          : `${t.idle} hover:-translate-y-0.5 active:translate-y-0 active:scale-95`
      }`}
    >
      <ActionIcon
        kind={icon}
        className={`shrink-0 ${compact ? 'h-5 w-5 xl:h-6 xl:w-6' : 'h-7 w-7 xl:h-8 xl:w-8'} ${
          disabled ? 'text-slate-600' : t.icon
        }`}
      />
      <span
        className={`min-w-0 ${
          compact ? 'hidden sm:flex sm:flex-col' : 'flex flex-col items-center'
        }`}
      >
        <span
          className={`whitespace-nowrap font-bold uppercase tracking-widest ${
            compact ? 'text-[9px] xl:text-[11px]' : 'text-[10px] xl:text-xs'
          }`}
        >
          {label}
        </span>
        {sub && (
          <span className="font-mono text-[9px] font-bold text-slate-500 xl:text-[10px]">
            {sub}
          </span>
        )}
      </span>
    </button>
  );
}
