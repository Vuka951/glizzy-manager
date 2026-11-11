import CoalitionEmblems from '@/components/games/career/CoalitionEmblems';
import {
  coalitionPartners,
  coalitionSeats,
} from '@/lib/utils/careerCoalition';
import type { SponsorId } from '@/lib/utils/careerSave';

// The running count under the ballot box: every option with its seats, a
// meter that fills one vote weight at a time, and the weight so far. Once
// the count is through the winner is lit and the rest go dark
export default function CoalitionCountTotals({
  leader,
  options,
  seats,
  tally,
  totalWeight,
  winner,
}: {
  leader: SponsorId;
  options: string[];
  seats: Record<SponsorId, number>;
  tally: Record<string, number>;
  totalWeight: number;
  // Set once the stamp is down
  winner: string | null;
}) {
  return (
    <div className="flex w-full flex-col gap-1">
      {options.map((key) => {
        const weight = tally[key] ?? 0;
        const won = winner === key;
        return (
          <div
            key={key}
            className={`flex h-8 items-center gap-2 rounded-[3px] border-2 px-2 transition-all duration-500 ${
              won
                ? 'border-amber-300 bg-[#3a2606]'
                : winner
                  ? 'border-transparent bg-slate-900 opacity-45'
                  : 'border-transparent bg-slate-900'
            }`}
          >
            <CoalitionEmblems
              leader={leader}
              partners={coalitionPartners(key)}
              size="h-4 w-4"
              leaderSize="h-3 w-3"
            />
            <span className="w-6 shrink-0 font-sign text-[14px] font-bold tabular-nums text-slate-400">
              {coalitionSeats(seats, leader, key)}
            </span>
            <span className="flex h-2 min-w-0 flex-1 gap-px overflow-hidden rounded-[1px]">
              {Array.from({ length: totalWeight }, (_, i) => (
                <span
                  key={i}
                  className={`flex-1 transition-colors duration-300 ${
                    i < weight
                      ? won
                        ? 'bg-amber-300'
                        : 'bg-sky-300'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </span>
            <span
              key={weight}
              className={`w-7 shrink-0 text-right font-sign text-lg font-extrabold tabular-nums animate-[bubblein_0.25s_ease-out] ${
                won ? 'text-amber-200' : weight > 0 ? 'text-white' : 'text-slate-600'
              }`}
            >
              {weight}
            </span>
          </div>
        );
      })}
    </div>
  );
}
