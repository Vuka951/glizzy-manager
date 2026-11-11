import { SUIT_COLORS } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';

// One arm of the knot in its party's sleeve, outlined so the crossings read
export default function CoalitionSleeve({ d, party }: { d: string; party: SponsorId }) {
  return (
    <>
      <path d={d} className="fill-none stroke-slate-400/70" strokeWidth="12" strokeLinecap="round" />
      <path d={d} className={`fill-none ${SUIT_COLORS[party].sleeve}`} strokeWidth="9" strokeLinecap="round" />
    </>
  );
}
