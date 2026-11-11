import CareerButton from '@/components/games/career/CareerButton';
import CupBetSide from '@/components/games/career/CupBetSide';
import CupBetStamp from '@/components/games/career/CupBetStamp';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import MatchEndBadge from '@/components/games/tournament/MatchEndBadge';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { MatchOdds } from '@/lib/utils/careerOdds';
import type { CupMatch, CupMatchBet } from '@/lib/utils/tournamentSim';

const BRACKET = GAMES_UI.cup.bracket;

// One match of the round as a bookmaker's slip: punched along its edge, a
// printed line per side and the watch key between them, or the result and the
// bookmaker's stamp once it is played
export default function CupBetRow({
  match,
  a,
  b,
  bet,
  odds,
  playerSlug,
  affordable,
  onToggleBet,
  onWatch,
}: {
  match: CupMatch;
  a: DuelCharacter;
  b: DuelCharacter;
  bet: CupMatchBet | null;
  odds: MatchOdds;
  playerSlug: string;
  affordable: boolean;
  onToggleBet: (side: 'a' | 'b') => void;
  onWatch: () => void;
}) {
  const result = match.result;
  const mine = match.a === playerSlug || match.b === playerSlug;

  const side = (key: 'a' | 'b') => {
    const wagered = bet?.side === key ? bet : null;
    return (
      <CupBetSide
        character={key === 'a' ? a : b}
        odds={result ? null : key === 'a' ? odds.a : odds.b}
        wager={result ? null : wagered}
        state={
          result ? (result.winner === key ? 'winner' : 'loser') : 'pending'
        }
        isPlayer={(key === 'a' ? match.a : match.b) === playerSlug}
        mirrored={key === 'b'}
        disabled={!wagered && !affordable}
        onBet={result ? undefined : () => onToggleBet(key)}
      />
    );
  };

  const center = !result ? (
    <CareerButton
      tone={mine ? 'danger' : 'neutral'}
      size="sm"
      full
      onClick={onWatch}
      className="min-h-11 whitespace-nowrap"
    >
      {mine ? BRACKET.yourMatch : BRACKET.watch}
    </CareerButton>
  ) : bet ? (
    <CupBetStamp
      won={Boolean(bet.won)}
      payout={bet.payout ?? 0}
      stake={bet.stake}
    />
  ) : result.reason ? (
    <MatchEndBadge
      ending={result.reason}
      label={GAMES_UI.cup.viewer.reasons[result.reason]}
      removedBy={result.removedBy}
      dense={false}
    />
  ) : (
    <span className="whitespace-nowrap font-sign text-[17px] font-bold tabular-nums text-slate-200">
      {result.livesA} : {result.livesB}
    </span>
  );

  return (
    <PaperSheet className="overflow-hidden">
      <div
        className={`grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 py-0.5 pl-3 pr-1 ${
          mine ? 'bg-[#fde047]/45' : ''
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1 w-1.5 bg-[radial-gradient(circle,#1f140b_2px,transparent_2.5px)] bg-[length:6px_11px] bg-center"
        />
        {side('a')}
        <div className="flex w-24 justify-center sm:w-28">{center}</div>
        {side('b')}
      </div>
    </PaperSheet>
  );
}
