import { SUIT_COLORS } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';

// A sleeve in the party's colour with the hand at its far end. It turns
// about its shoulder end, and whatever it holds rides at the hand
export default function CoalitionArm({
  party,
  className = '',
  anim,
  children,
}: {
  party: SponsorId;
  className?: string;
  anim?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      data-anim={anim}
      className={`absolute h-[8px] origin-[4px_50%] rounded-full ring-1 ring-slate-500/60 ${SUIT_COLORS[party].jacket} ${className}`}
    >
      <span className="absolute right-[-4px] top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full bg-amber-200 ring-1 ring-slate-950/40" />
      {children && (
        <span className="absolute right-[1px] top-1/2 h-0 w-0">{children}</span>
      )}
    </span>
  );
}
