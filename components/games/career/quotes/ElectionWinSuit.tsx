import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { electionWinPalette } from '@/lib/constants/electionWinPalette';
import type { SponsorId } from '@/lib/utils/careerSave';

// The winner's body under his portrait: a dark suit, the party's tie and its
// badge on the lapel. The caller places and sizes it
export default function ElectionWinSuit({
  party,
  className,
}: {
  party: SponsorId;
  className: string;
}) {
  const palette = electionWinPalette[party];
  return (
    <span
      className={`absolute overflow-hidden rounded-t-[45%] bg-gradient-to-b from-slate-700 to-slate-800 ring-1 ring-slate-950/60 ${className}`}
    >
      <span className="absolute left-1/2 top-0 h-[58%] w-[36%] -translate-x-1/2 bg-slate-100 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      <span
        className={`absolute left-1/2 top-[6%] h-[62%] w-[13%] -translate-x-1/2 rounded-b-full ${palette.tie}`}
      />
      <SponsorEmblem
        sponsorId={party}
        className="absolute left-[9%] top-[26%] aspect-square h-[34%] w-auto"
      />
    </span>
  );
}
