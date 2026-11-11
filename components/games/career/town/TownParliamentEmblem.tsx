import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';

// A party's emblem inside SVG art, nested as SVG the way TownFlagCloth draws it
export default function TownParliamentEmblem({
  party,
  x,
  y,
  size,
}: {
  party: SponsorId;
  x: number;
  y: number;
  size: number;
}) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 24 24">
      <SponsorEmblem sponsorId={party} className="h-full w-full" />
    </svg>
  );
}
