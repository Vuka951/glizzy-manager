import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { electionWinPalette } from '@/lib/constants/electionWinPalette';
import type { SponsorId } from '@/lib/utils/careerSave';

// The winning party's cloth with its emblem in the middle: a hand flag, a
// rally banner or a channel bug, sized by the caller
export default function ElectionWinPennant({
  party,
  className = 'h-4 w-6',
}: {
  party: SponsorId;
  className?: string;
}) {
  const palette = electionWinPalette[party];
  return (
    <span
      className={`relative flex items-center justify-center overflow-hidden rounded-[2px] shadow ring-1 ring-slate-950/40 ${palette.cloth} ${className}`}
    >
      <span
        className={`absolute inset-x-0 top-[10%] h-[13%] ${palette.trim}`}
      />
      <span
        className={`absolute inset-x-0 bottom-[10%] h-[13%] ${palette.trim}`}
      />
      <SponsorEmblem
        sponsorId={party}
        className="relative aspect-square h-[62%] w-auto"
      />
    </span>
  );
}
