import PartyEscort from '@/components/games/career/PartyEscort';
import type { SponsorId } from '@/lib/utils/careerSave';

// A sponsor's own people at the height of the scene figures, in the kit the
// party escort already wears
export default function SponsorUniform({
  sponsor,
  flip = false,
}: {
  sponsor: SponsorId;
  flip?: boolean;
}) {
  return (
    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 [&_svg]:h-[74px]">
      <PartyEscort party={sponsor} flip={flip} />
    </span>
  );
}
