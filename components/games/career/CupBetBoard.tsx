import BrassPlate from '@/components/games/career/street/BrassPlate';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import CupBetRow from '@/components/games/career/CupBetRow';
import StakePicker from '@/components/games/StakePicker';
import { CAREER_BET_STAKES } from '@/data/games/careerEconomy';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { STREET_TRAY } from '@/lib/utils/careerFrameClasses';
import type { MatchOdds } from '@/lib/utils/careerOdds';
import {
  cupBetKey,
  type CupMatch,
  type CupMatchBet,
} from '@/lib/utils/tournamentSim';

// Two columns on a wide screen, filled top to bottom so the left column holds
// the bracket's left half and the right column its right half
const HALF_ROWS: Record<number, string> = {
  8: 'lg:grid-rows-4',
  4: 'lg:grid-rows-2',
  2: 'lg:grid-rows-1',
};

// The bookmaker's counter in the hall, next to the bracket rather than inside
// it: the stake on a brass rail and a carbon slip per match of the round
export default function CupBetBoard({
  matches,
  round,
  characterBySlug,
  matchBets,
  playerSlug,
  stake,
  balance,
  oddsFor,
  onPickStake,
  onToggleBet,
  onWatch,
}: {
  matches: CupMatch[];
  round: number;
  characterBySlug: Map<string, DuelCharacter>;
  matchBets: Record<string, CupMatchBet>;
  playerSlug: string;
  stake: number;
  balance: number;
  oddsFor: (a: string, b: string) => MatchOdds;
  onPickStake: (stake: number) => void;
  onToggleBet: (index: number, side: 'a' | 'b') => void;
  onWatch: (index: number) => void;
}) {
  const split = HALF_ROWS[matches.length];

  return (
    <StreetBoard
      className={`flex w-full flex-col gap-2 ${
        split ? 'max-w-md lg:max-w-4xl' : 'max-w-md'
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 px-2 pb-0.5 pt-1">
        <BrassPlate>{GAMES_UI.career.cup.stake}</BrassPlate>
        <StakePicker
          options={CAREER_BET_STAKES}
          value={stake}
          balance={balance}
          onPick={onPickStake}
        />
      </div>
      <div
        className={`grid grid-cols-1 gap-2 p-2 ${STREET_TRAY} ${
          split ? `lg:grid-flow-col lg:grid-cols-2 lg:gap-x-3 ${split}` : ''
        }`}
      >
        {matches.map((match) => {
          const a = match.a ? characterBySlug.get(match.a) : undefined;
          const b = match.b ? characterBySlug.get(match.b) : undefined;
          if (!a || !b) return null;
          const bet = matchBets[cupBetKey(round, match.index)] ?? null;
          const refund = bet && bet.won === undefined ? bet.stake : 0;
          return (
            <CupBetRow
              key={match.index}
              match={match}
              a={a}
              b={b}
              bet={bet}
              odds={oddsFor(a.slug, b.slug)}
              playerSlug={playerSlug}
              affordable={balance + refund >= stake}
              onToggleBet={(side) => onToggleBet(match.index, side)}
              onWatch={() => onWatch(match.index)}
            />
          );
        })}
      </div>
    </StreetBoard>
  );
}
