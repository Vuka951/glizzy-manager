import TrendIcon from '@/components/icons/TrendIcon';
import type { GlizzyBet, GlizzyCall } from '@/data/games/careerGlizzflationBets';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const B = GAMES_UI.career.offseason.glizzflationBet;

const CALL_TEXT: Record<GlizzyCall, string> = {
  up: 'text-red-300',
  flat: 'text-slate-200',
  down: 'text-emerald-300',
};
const CALL_LABEL: Record<GlizzyCall, string> = {
  up: B.callUp,
  flat: B.callFlat,
  down: B.callDown,
};

// A bet as it reads on a ticket: the call's arrow, the call and the stake
export default function GlizzflationBetTicketLine({
  bet,
  className = '',
}: {
  bet: GlizzyBet;
  className?: string;
}) {
  return (
    <span
      className={`flex items-center gap-1.5 font-sign font-bold tabular-nums tracking-[0.02em] ${CALL_TEXT[bet.call]} ${className}`}
    >
      <TrendIcon direction={bet.call} className="h-3.5 w-3.5 shrink-0" />
      {fmt(B.callStake, { call: CALL_LABEL[bet.call], stake: bet.stake })}
    </span>
  );
}
