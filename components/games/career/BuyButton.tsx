const TONES = {
  buy: 'border-amber-400/40 bg-amber-500/15 text-amber-200 hover:border-amber-400/70 hover:bg-amber-500/25 hover:text-white',
  danger:
    'border-red-500/40 bg-red-500/15 text-red-200 hover:border-red-500/70 hover:bg-red-500/25 hover:text-white',
  neutral:
    'border-sky-200/25 bg-sky-500/10 text-sky-200 hover:border-sky-200/55 hover:bg-sky-500/20 hover:text-white',
} as const;

// The one button every purchase in the career ends on, so paying for a
// training session, a contract, a guard shift and a plot all look the same
export default function BuyButton({
  label,
  tone = 'buy',
  disabled = false,
  full = false,
  onClick,
}: {
  label: string;
  tone?: keyof typeof TONES;
  disabled?: boolean;
  full?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/40 disabled:text-slate-500 disabled:hover:bg-slate-800/40 ${
        full ? 'w-full' : 'self-start'
      } ${TONES[tone]}`}
    >
      {label}
    </button>
  );
}
