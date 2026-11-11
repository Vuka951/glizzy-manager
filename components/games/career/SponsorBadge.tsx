import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';
import { GAMES_UI } from '@/data/games/locale';

const NAMES = GAMES_UI.career.sponsors.names as Record<string, string>;

export default function SponsorBadge({ sponsorId }: { sponsorId: SponsorId }) {
  return (
    <span title={NAMES[sponsorId]} className="inline-flex">
      <SponsorEmblem sponsorId={sponsorId} className="h-5 w-5" />
    </span>
  );
}
