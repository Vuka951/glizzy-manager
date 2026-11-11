import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';

// Where each slip settles in the pile, cycled: across the floor of the box
// first, then a layer up
const SLIP_SPOTS = [
  'left-[8%] bottom-[5%] rotate-[-14deg]',
  'left-[52%] bottom-[4%] rotate-[9deg]',
  'left-[30%] bottom-[7%] rotate-[3deg]',
  'left-[66%] bottom-[9%] rotate-[-7deg]',
  'left-[16%] bottom-[14%] rotate-[12deg]',
  'left-[44%] bottom-[16%] rotate-[-4deg]',
  'left-[60%] bottom-[20%] rotate-[15deg]',
  'left-[24%] bottom-[24%] rotate-[-10deg]',
  'left-[40%] bottom-[28%] rotate-[6deg]',
  'left-[10%] bottom-[32%] rotate-[-3deg]',
  'left-[56%] bottom-[34%] rotate-[-12deg]',
  'left-[32%] bottom-[38%] rotate-[10deg]',
];

// The see-through ballot box on the count table, sealed, the list's mark on
// its front. Every slip that has gone through the slot lies in the pile
export default function BallotBox({
  leader,
  slips,
}: {
  leader: SponsorId;
  // The weight of every landed ballot, in the order they went in
  slips: number[];
}) {
  return (
    <span className="relative block h-full w-full">
      <span className="absolute inset-x-0 bottom-0 top-[12%] overflow-hidden rounded-b-md border-2 border-t-0 border-sky-100/45 bg-sky-100/10 shadow-[inset_0_0_18px_rgba(186,230,253,0.18)]">
        {slips.map((weight, index) => (
          <span
            key={index}
            className={`absolute aspect-[4/3] w-[24%] animate-[bubblein_0.25s_ease-out] ${SLIP_SPOTS[index % SLIP_SPOTS.length]}`}
          >
            {weight > 1 && (
              <span className="absolute inset-0 translate-x-[12%] -translate-y-[18%] rounded-[2px] bg-stone-300" />
            )}
            <span className="absolute inset-0 rounded-[2px] bg-stone-100 shadow-sm ring-1 ring-stone-400/70" />
          </span>
        ))}
        <span className="absolute inset-y-0 left-[8%] w-[10%] bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
        <span className="absolute left-1/2 top-[22%] flex h-[42%] aspect-square -translate-x-1/2 items-center justify-center rounded-full bg-slate-50/90 shadow ring-1 ring-slate-300">
          <SponsorEmblem sponsorId={leader} className="h-[72%] w-[72%]" />
        </span>
        <span className="absolute right-[10%] top-0 h-[38%] w-[6%] bg-red-500/80" />
        <span className="absolute right-[7%] top-[34%] aspect-square w-[12%] rounded-full bg-red-700 shadow" />
      </span>
      <span className="absolute inset-x-[-4%] top-0 h-[14%] rounded-sm bg-gradient-to-b from-slate-300 to-slate-400 shadow-md">
        <span className="absolute left-1/2 top-1/2 h-[34%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950" />
      </span>
    </span>
  );
}
