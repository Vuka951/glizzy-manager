import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { SUIT_COLORS } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';

// A signatory's torso in his party's suit with the party pin on the lapel.
// The box sets the size, the shirt and tie keep to its proportions
export default function CoalitionSuit({
  party,
  className = '',
}: {
  party: SponsorId;
  className?: string;
}) {
  const { jacket, tie } = SUIT_COLORS[party];
  return (
    <span
      className={`absolute overflow-hidden rounded-t-[40%] ring-1 ring-slate-500/50 ${jacket} ${className}`}
    >
      <span className="absolute left-1/2 top-0 h-[55%] w-[34%] -translate-x-1/2 bg-slate-100 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      <span
        className={`absolute left-1/2 top-[6%] h-[50%] w-[11%] -translate-x-1/2 [clip-path:polygon(0_0,100%_0,100%_80%,50%_100%,0_80%)] ${tie}`}
      />
      <span className="absolute left-[16%] top-[30%]">
        <SponsorEmblem sponsorId={party} className="h-[9px] w-[9px]" />
      </span>
    </span>
  );
}
