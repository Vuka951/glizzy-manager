import BallotMark from '@/components/games/career/BallotMark';
import CoalitionEmblems from '@/components/games/career/CoalitionEmblems';
import ParliamentChamber from '@/components/games/career/ParliamentChamber';
import { PARLIAMENT_SEATS } from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';
import { PARTY_PAINT } from '@/lib/utils/partyPaint';

const SHORT_NAMES = GAMES_UI.career.sponsors.shortNames as Record<
  SponsorId,
  string
>;

// One coalition printed on the ballot: its square, the chamber as it would
// sit, the partners and the seats it holds. A line on a phone, a box once two
// fit side by side
export default function CoalitionOptionCard({
  leader,
  partners,
  seats,
  total,
  selected,
  onSelect,
}: {
  leader: SponsorId;
  partners: SponsorId[];
  seats: Record<SponsorId, number>;
  total: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-14 w-full items-center gap-2.5 rounded-[2px] border-2 p-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a] sm:flex-col sm:items-stretch sm:gap-1.5 ${
        selected
          ? 'border-slate-200 bg-[#fde047]/45'
          : 'border-slate-500 hover:border-slate-200 hover:bg-[#1c1408]/5'
      }`}
    >
      <BallotMark marked={selected} className="h-6 w-6 sm:self-end" />
      <span className={`block w-20 shrink-0 sm:w-full ${PARTY_PAINT}`}>
        <ParliamentChamber
          seats={seats}
          government={[leader, ...partners]}
          dimOutside
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center justify-between gap-2">
          <CoalitionEmblems
            leader={leader}
            partners={partners}
            size="h-5 w-5"
            leaderSize="h-4 w-4"
          />
          <span className="font-sign text-[22px] font-bold leading-none tabular-nums text-slate-100">
            {total}
            <span className="text-[13px] font-semibold text-slate-400">
              {' '}
              / {PARLIAMENT_SEATS}
            </span>
          </span>
        </span>
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 font-sign text-[14px] font-bold uppercase tracking-[0.04em] text-slate-200">
          {partners.map((id, index) => (
            <span key={id} className="flex items-baseline gap-1">
              {index > 0 && <span className="text-slate-400">+</span>}
              {SHORT_NAMES[id]}
              <span className="text-[13px] font-semibold tabular-nums text-slate-400">
                {seats[id]}
              </span>
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}
