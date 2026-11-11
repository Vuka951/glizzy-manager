import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';

// One slip for the ballot box with the partner list ringed in pen. A human's
// voice is a thick wad of slips with its weight clipped to the corner
export default function CoalitionCountSlip({
  partners,
  weight,
  className = '',
}: {
  partners: SponsorId[];
  weight: number;
  className?: string;
}) {
  const stacked = weight > 1;
  return (
    <span className={`relative block ${className}`}>
      {stacked && (
        <>
          <span className="absolute inset-0 translate-x-[14%] -translate-y-[9%] rotate-6 rounded-[3px] bg-stone-300 shadow ring-1 ring-stone-400" />
          <span className="absolute inset-0 translate-x-[7%] -translate-y-[5%] rotate-3 rounded-[3px] bg-stone-200 shadow ring-1 ring-stone-400" />
        </>
      )}
      <span className="absolute inset-0 flex flex-col items-center justify-between rounded-[3px] bg-stone-50 px-[12%] py-[10%] shadow-md ring-1 ring-stone-300">
        <span className="h-[5%] w-full rounded-full bg-stone-300" />
        <span className="relative flex flex-col items-center gap-[2px]">
          {partners.map((id) => (
            <SponsorEmblem
              key={id}
              sponsorId={id}
              className={
                partners.length > 1
                  ? 'h-3 w-3 sm:h-3.5 sm:w-3.5'
                  : 'h-4 w-4 sm:h-5 sm:w-5'
              }
            />
          ))}
          <span className="absolute -inset-[5px] -rotate-12 rounded-[50%] border-[1.5px] border-sky-800/80" />
        </span>
        <span className="flex w-full flex-col gap-[3px]">
          <span className="h-px w-full bg-stone-300" />
          <span className="h-px w-2/3 bg-stone-300" />
        </span>
      </span>
      {stacked && (
        <span className="absolute -right-3 -top-2 rounded-full border border-amber-200 bg-amber-300 px-1 font-mono text-[9px] font-black leading-tight text-slate-950 shadow sm:text-[10px]">
          ×{weight}
        </span>
      )}
    </span>
  );
}
