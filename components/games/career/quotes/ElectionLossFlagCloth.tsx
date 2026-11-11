import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';

const FIELD: Record<SponsorId, string> = {
  blue: 'bg-slate-50',
  green: 'bg-emerald-500',
  yellow: 'bg-zinc-950',
  red: 'bg-red-700',
};

const STRIPES: Record<SponsorId, string[]> = {
  blue: ['top-[10%] h-[15%] bg-blue-600', 'bottom-[10%] h-[15%] bg-blue-600'],
  green: ['bottom-0 h-[28%] bg-amber-200'],
  yellow: ['top-0 h-[16%] bg-yellow-300', 'bottom-0 h-[16%] bg-yellow-300'],
  red: ['top-[10%] h-[8%] bg-red-50', 'bottom-[10%] h-[8%] bg-red-50'],
};

// A party's own cloth with no pole, sized and placed by the caller, so a
// scene can fly it, fold it into a fist or hang it out of a train window.
// Tiny ones drop the emblem and keep only the colours
export default function ElectionLossFlagCloth({
  party,
  emblem = true,
  className = '',
}: {
  party: SponsorId;
  emblem?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`block overflow-hidden ${FIELD[party]} ${className}`}
    >
      {STRIPES[party].map((cls) => (
        <span key={cls} className={`absolute inset-x-0 ${cls}`} />
      ))}
      {emblem && (
        <span className="absolute inset-0 flex items-center justify-center">
          <SponsorEmblem sponsorId={party} className="h-[62%] w-auto" />
        </span>
      )}
    </span>
  );
}
