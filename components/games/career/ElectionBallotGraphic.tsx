import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { PARTY_SEAT_ORDER } from '@/data/games/careerElections';

// The city goes to the polls: a ballot sliding into the box, the four lists
// lined up under it
export default function ElectionBallotGraphic({
  small = false,
}: {
  small?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-sm border border-slate-900/40 bg-slate-100 shadow-[2px_2px_0_rgb(15_23_42/0.35)] ${
        small ? 'w-[7rem] p-1' : 'w-[9.5rem] p-1.5'
      }`}
    >
      <svg
        viewBox="0 0 64 44"
        className={small ? 'h-12 w-auto' : 'h-16 w-auto'}
        aria-hidden="true"
      >
        <rect x="8" y="18" width="48" height="24" rx="2" className="fill-slate-900" />
        <rect x="8" y="18" width="48" height="5" className="fill-slate-700" />
        <rect x="22" y="16" width="20" height="3" rx="1" className="fill-slate-300" />
        <g transform="rotate(-12 32 10)">
          <rect x="24" y="1" width="16" height="17" rx="1" className="fill-amber-50 stroke-slate-900" strokeWidth="1" />
          <path d="M28 6h8M28 9.5h8M28 13h5" className="stroke-slate-400" strokeWidth="1" strokeLinecap="round" />
          <path d="M34.5 11.5l3 3M37.5 11.5l-3 3" className="stroke-red-700" strokeWidth="1.4" strokeLinecap="round" />
        </g>
        <path d="M14 30h36" className="stroke-slate-700" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
      <div className="flex items-center justify-center gap-1.5 border-t border-slate-900/20 pt-1">
        {PARTY_SEAT_ORDER.map((id) => (
          <SponsorEmblem
            key={id}
            sponsorId={id}
            className={small ? 'h-3.5 w-3.5' : 'h-5 w-5'}
          />
        ))}
      </div>
    </div>
  );
}
