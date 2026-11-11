import PortraitHead from '@/components/games/PortraitHead';
import SponsorActorGear from '@/components/games/career/SponsorActorGear';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';

const COALITION = GAMES_UI.career.election.coalition;

const TIES: Record<SponsorId, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-300',
  blue: 'bg-blue-500',
  green: 'bg-emerald-400',
};

// A coach of the list in his good suit, the party tie and the party's gear
// on his head. The viewer's own man is ringed; a human the clock voted for
// wears the clock
export default function BallotVoter({
  character,
  slug,
  party,
  own,
  auto,
}: {
  character: DuelCharacter | undefined;
  slug: string;
  party: SponsorId;
  own: boolean;
  auto: boolean;
}) {
  return (
    <span className="relative block h-full w-full">
      <span className="absolute bottom-0 left-[30%] h-[18%] w-[15%] rounded-b-sm bg-slate-900" />
      <span className="absolute bottom-0 right-[30%] h-[18%] w-[15%] rounded-b-sm bg-slate-900" />
      <span className="absolute inset-x-[8%] bottom-[14%] h-[52%] overflow-hidden rounded-t-[42%] rounded-b-md bg-gradient-to-b from-slate-600 to-slate-800 shadow-lg">
        <span className="absolute left-1/2 top-0 h-[46%] w-[34%] -translate-x-1/2 bg-slate-100 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        <span
          className={`absolute left-1/2 top-[6%] h-[44%] w-[11%] -translate-x-1/2 rounded-b-sm ${TIES[party]} [clip-path:polygon(15%_0,85%_0,100%_80%,50%_100%,0_80%)]`}
        />
        <span className="absolute left-[14%] top-0 h-[60%] w-[22%] origin-top-left -skew-x-[18deg] bg-slate-700/80" />
        <span className="absolute right-[14%] top-0 h-[60%] w-[22%] origin-top-right skew-x-[18deg] bg-slate-700/80" />
      </span>
      <span className="absolute left-1/2 top-0 aspect-square h-[40%] -translate-x-1/2">
        {character ? (
          <PortraitHead
            character={character}
            className={`h-full w-full ${own ? 'ring-2 ring-amber-300' : ''}`}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-[#64748b] bg-slate-800 text-sm font-black uppercase text-slate-400">
            {slug.charAt(0)}
          </span>
        )}
        <SponsorActorGear sponsorId={party} variant="seat" />
        {auto && (
          <span
            title={COALITION.auto}
            className="absolute -right-1 -top-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 ring-2 ring-slate-950"
          >
            <svg viewBox="0 0 10 10" className="h-3 w-3" aria-hidden="true">
              <circle
                cx="5"
                cy="5"
                r="3.6"
                className="fill-none stroke-slate-200"
                strokeWidth="1.1"
              />
              <path
                d="M5 3v2.2l1.4 1"
                className="fill-none stroke-slate-200"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
      </span>
    </span>
  );
}
