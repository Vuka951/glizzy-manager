import IslandMark from '@/components/games/career/sponsors/IslandMark';
import MasonsMark from '@/components/games/career/sponsors/MasonsMark';
import PartyMark from '@/components/games/career/sponsors/PartyMark';
import BlackDwarfMark from '@/components/games/career/sponsors/BlackDwarfMark';
import type { SponsorId } from '@/lib/utils/careerSave';

// One mark per sponsor, all drawn on the same rounded badge in each sponsor's
// palette so contracts read at a glance: zidari brick and stone, ostrvo
// emerald and sand, korporacija yellow on black, stranka gold and red on blue
export default function SponsorEmblem({
  sponsorId,
  className = 'h-5 w-5',
}: {
  sponsorId: SponsorId;
  className?: string;
}) {
  if (sponsorId === 'zidari') return <MasonsMark className={className} />;
  if (sponsorId === 'ostrvo') return <IslandMark className={className} />;
  if (sponsorId === 'korporacija') return <BlackDwarfMark className={className} />;
  return <PartyMark className={className} />;
}
