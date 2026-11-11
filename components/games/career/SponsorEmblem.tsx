import BlueMark from '@/components/games/career/sponsors/BlueMark';
import GreenMark from '@/components/games/career/sponsors/GreenMark';
import RedMark from '@/components/games/career/sponsors/RedMark';
import YellowMark from '@/components/games/career/sponsors/YellowMark';
import type { SponsorId } from '@/lib/utils/careerSave';

// One mark per sponsor, all drawn on the same rounded badge in each sponsor's
// palette so contracts read at a glance: blue and white, emerald and sand,
// yellow on black, red and cream
export default function SponsorEmblem({
  sponsorId,
  className = 'h-5 w-5',
}: {
  sponsorId: SponsorId;
  className?: string;
}) {
  if (sponsorId === 'blue') return <BlueMark className={className} />;
  if (sponsorId === 'green') return <GreenMark className={className} />;
  if (sponsorId === 'yellow') return <YellowMark className={className} />;
  return <RedMark className={className} />;
}
