import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const BRACKET = GAMES_UI.cup.bracket;

// The bookmaker's rubber stamp across a settled slip
export default function CupBetStamp({
  won,
  payout,
  stake,
}: {
  won: boolean;
  payout: number;
  stake: number;
}) {
  return (
    <span
      className={`-rotate-6 whitespace-nowrap rounded-[2px] border-2 border-current px-1 font-sign text-[12px] font-bold uppercase leading-tight tracking-[0.03em] sm:text-[13px] ${
        won ? 'text-emerald-300' : 'text-red-300'
      }`}
    >
      {won
        ? fmt(BRACKET.betWon, { payout })
        : fmt(BRACKET.betLost, { stake })}
    </span>
  );
}
