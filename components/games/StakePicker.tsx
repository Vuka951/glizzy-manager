import CareerToggle from '@/components/games/career/CareerToggle';
import { useCareerFrames } from '@/components/games/career/careerFrames';
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
  const street = useCareerFrames() === 'street';
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const unaffordable = balance !== undefined && option > balance;
        return (
          <CareerToggle
            selected={value === option}
            tone="amber"
            size="sm"
            key={option}
            onClick={() => onPick(option)}
            disabled={unaffordable}
            className={street ? 'min-h-11 min-w-11 tabular-nums' : 'font-mono text-xs'}
          >
            {option === 0 ? GAMES_UI.cup.chips.noStake : option}
          </CareerToggle>
        );
      })}
    </div>
  );
}
