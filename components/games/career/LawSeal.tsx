import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';
import { PARTY_PAINT } from '@/lib/utils/partyPaint';

// A party's wax seal on a law: a disc in the party's colour
// with its mark pressed into a paper centre
export default function LawSeal({ party }: { party: SponsorId }) {
  return (
    <span
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center drop-shadow-[0_1px_1px_rgb(0_0_0/0.45)] ${PARTY_PAINT}`}
    >
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        <circle cx="20" cy="20" r="19" className={SPONSOR_THEMES[party].bar} />
        <circle
          cx="20"
          cy="20"
          r="15.5"
          strokeWidth="1"
          strokeDasharray="2 1.5"
          className="fill-none stroke-[#000000]/30"
        />
        <circle cx="20" cy="20" r="12.5" className="fill-[#fbf6e6]" />
      </svg>
      <SponsorEmblem sponsorId={party} className="relative h-5 w-5" />
    </span>
  );
}
