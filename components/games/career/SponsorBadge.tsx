import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';
import { GAMES_UI } from '@/data/games/locale';

const NAMES = GAMES_UI.career.sponsors.names as Record<string, string>;

export default function SponsorBadge({
  sponsorId,
  compact = false,
}: {
  sponsorId: SponsorId;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <span title={NAMES[sponsorId]} className="inline-flex">
        <SponsorEmblem sponsorId={sponsorId} className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/15 bg-slate-800/50 py-1 pl-1.5 pr-3 text-[10px] font-bold uppercase tracking-widest text-slate-300">
      <SponsorEmblem sponsorId={sponsorId} className="h-4 w-4" />
      {NAMES[sponsorId]}
    </span>
  );
}
