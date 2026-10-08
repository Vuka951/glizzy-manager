import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';

export default function SponsorSceneFlavor({
  sponsorId,
}: {
  sponsorId: SponsorId;
}) {
  const flavor = SPONSOR_THEMES[sponsorId];

  return (
    <div
      data-sponsor-flavor={sponsorId}
      className={`pointer-events-none absolute inset-0 z-[7] overflow-hidden ring-1 ring-inset transition-colors duration-700 ${flavor.frame}`}
      aria-hidden="true"
    >
      <span className={`absolute inset-0 transition-colors duration-700 ${flavor.wash}`} />
      <span className={`absolute inset-x-0 top-0 h-1.5 opacity-80 ${flavor.stripe}`} />
      <span className={`absolute inset-x-0 bottom-0 h-1 opacity-60 ${flavor.stripe}`} />
      <span className="absolute bottom-[15%] right-[12%] opacity-[0.08]">
        <SponsorEmblem sponsorId={sponsorId} className="h-24 w-24 sm:h-32 sm:w-32" />
      </span>
      <span className="absolute bottom-0 left-3 flex flex-col items-center">
        <span className={`rounded-t-lg border border-b-0 p-1.5 backdrop-blur-sm ${flavor.plaque}`}>
          <SponsorEmblem sponsorId={sponsorId} className="h-5 w-5" />
        </span>
        <span className={`h-3 w-px ${flavor.stripe}`} />
      </span>
      <span className="absolute bottom-0 right-3 flex flex-col items-center">
        <span className={`rounded-t-lg border border-b-0 p-1.5 backdrop-blur-sm ${flavor.plaque}`}>
          <SponsorEmblem sponsorId={sponsorId} className="h-5 w-5" />
        </span>
        <span className={`h-3 w-px ${flavor.stripe}`} />
      </span>
    </div>
  );
}
