import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';

const CLOTH: Record<SponsorId, string> = {
  blue: 'bg-slate-50',
  green: 'bg-gradient-to-b from-emerald-500 from-62% to-amber-200 to-62%',
  yellow: 'bg-gradient-to-b from-zinc-950 from-50% to-yellow-300 to-50%',
  red: 'bg-red-700',
};

// A party's ceremonial standard on a gilded pole, the cloth hanging in folds
// beside it the way state flags stand behind a signing table
export default function CoalitionPartyFlag({
  party,
  className = '',
}: {
  party: SponsorId;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute w-9 ${className}`}>
      <span className="absolute bottom-0 left-[-3px] h-[4px] w-[11px] rounded-t-full bg-amber-700" />
      <span className="absolute bottom-0 left-0 top-[3px] w-[3px] rounded-full bg-gradient-to-r from-amber-200 to-amber-500" />
      <span className="absolute left-[-2px] top-[-4px] h-[8px] w-[7px] bg-amber-300 [clip-path:polygon(50%_0,100%_60%,50%_100%,0_60%)]" />
      <span
        className={`absolute left-[3px] top-[4px] h-[42%] w-[31px] origin-left animate-[flagwave_3.2s_ease-in-out_infinite] overflow-hidden rounded-br-md border-b-2 border-amber-300 shadow-md ${CLOTH[party]}`}
      >
        {party === 'blue' && (
          <>
            <span className="absolute inset-x-0 top-[12%] h-[9%] bg-blue-600" />
            <span className="absolute inset-x-0 bottom-[12%] h-[9%] bg-blue-600" />
          </>
        )}
        <span className="absolute inset-0 grid place-items-center">
          <SponsorEmblem sponsorId={party} className="h-4 w-4" />
        </span>
        <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(2,6,23,0)_0px,rgba(2,6,23,0.22)_5px,rgba(2,6,23,0)_10px)]" />
      </span>
    </span>
  );
}
