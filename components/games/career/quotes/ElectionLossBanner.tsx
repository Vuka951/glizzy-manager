import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';

const CLOTH: Record<SponsorId, string> = {
  blue: 'border-blue-600 bg-slate-50 text-blue-700',
  green: 'border-amber-200 bg-emerald-600 text-amber-100',
  yellow: 'border-yellow-300 bg-zinc-950 text-yellow-300',
  red: 'border-red-300 bg-red-700 text-red-50',
};

// A hand-made party banner: the party's colours, its mark at each end and
// one slogan between them, sized and placed by the caller
export default function ElectionLossBanner({
  party,
  text,
  className = '',
}: {
  party: SponsorId;
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap border-y-[3px] px-1 font-black uppercase leading-none tracking-wide shadow-md ${CLOTH[party]} ${className}`}
    >
      <SponsorEmblem sponsorId={party} className="h-[70%] w-auto shrink-0" />
      {text}
      <SponsorEmblem sponsorId={party} className="h-[70%] w-auto shrink-0" />
    </span>
  );
}
