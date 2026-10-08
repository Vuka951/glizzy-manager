import { GAMES_UI } from '@/data/games/locale';

// The row of chips every bet is sized with: one tap picks what the next
// wager costs, and anything the wallet cannot cover greys out
export default function StakePicker({
  options,
  value,
  balance,
  onPick,
}: {
  options: number[];
  value: number;
  balance?: number;
  onPick: (stake: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const unaffordable = balance !== undefined && option > balance;
        return (
          <button
            key={option}
            onClick={() => onPick(option)}
            disabled={unaffordable}
            className={`rounded-lg border px-2 py-0.5 font-mono text-xs font-bold transition disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-900/50 disabled:text-slate-600 ${
              value === option
                ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                : 'border-sky-200/15 bg-slate-800/50 text-slate-400 hover:border-sky-200/40 hover:text-slate-200'
            }`}
          >
            {option === 0 ? GAMES_UI.cup.chips.noStake : option}
          </button>
        );
      })}
    </div>
  );
}
