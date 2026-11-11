import type { Ref } from 'react';
import CoalitionEmblems from '@/components/games/career/CoalitionEmblems';
import LawQuorumMeter from '@/components/games/career/LawQuorumMeter';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';

const BALLOT = GAMES_UI.career.laws.ballot;

const COUNT = {
  lg: 'text-[28px]',
  sm: 'text-[17px]',
} as const;

// One bar a law has to clear under the name of whoever's weight it counts:
// their marks and name over the bar, a tick or a cross there once the count
// is in. With tally the YES and NO weight stand at either end of the bar,
// the big bar heading the columns with YES and NO
export default function LawQuorumRow({
  parties,
  label,
  yes,
  no,
  total,
  needed,
  threshold,
  result = null,
  size = 'lg',
  tally = false,
  barRef,
}: {
  parties: SponsorId[];
  label: string;
  yes: number;
  no: number;
  total: number;
  needed: number;
  threshold: string;
  result?: 'met' | 'missed' | null;
  size?: keyof typeof COUNT;
  tally?: boolean;
  barRef?: Ref<HTMLDivElement>;
}) {
  const heads = tally && size === 'lg';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        {tally && (
          <span className="w-14 shrink-0 font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-emerald-300">
            {heads && BALLOT.yes}
          </span>
        )}
        <span className="flex h-4 min-w-0 flex-1 items-center gap-1.5">
          <CoalitionEmblems leader={null} partners={parties} size="h-4 w-4" />
          <span className="truncate font-sign text-[13px] font-bold uppercase tracking-[0.06em] text-slate-200">
            {label}
          </span>
          {result && (
            <span
              className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-black leading-none animate-[bubblein_0.3s_ease-out] ${
                result === 'met'
                  ? 'bg-[#047857] text-[#ffffff]'
                  : 'bg-[#b91c1c] text-[#ffffff]'
              }`}
            >
              {result === 'met' ? '✓' : '✕'}
            </span>
          )}
        </span>
        {tally && (
          <span className="w-14 shrink-0 text-right font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-red-300">
            {heads && BALLOT.no}
          </span>
        )}
      </div>
      <div className="flex items-start gap-3 pb-3.5">
        {tally && (
          <span
            className={`w-14 shrink-0 self-center font-sign font-bold leading-none tabular-nums text-emerald-300 ${COUNT[size]}`}
          >
            {yes}
          </span>
        )}
        <div ref={barRef} className="flex min-w-0 flex-1 self-center">
          <LawQuorumMeter
            yes={yes}
            no={no}
            total={total}
            needed={needed}
            threshold={threshold}
            result={result}
            size={size}
          />
        </div>
        {tally && (
          <span
            className={`w-14 shrink-0 self-center text-right font-sign font-bold leading-none tabular-nums text-red-300 ${COUNT[size]}`}
          >
            {no}
          </span>
        )}
      </div>
    </div>
  );
}
