import TownFlagCloth from '@/components/games/career/town/TownFlagCloth';
import type { SponsorId } from '@/lib/utils/careerSave';

// The sponsor's flag on a pole at a front corner of the square
export default function TownFlagPole({ sponsorId }: { sponsorId: SponsorId }) {
  return (
    <svg
      viewBox="0 0 40 96"
      className="h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <ellipse cx="3" cy="95" rx="5" ry="1.6" className="fill-[rgba(0,0,0,0.35)]" />
      <path d="M2.5 96V3" className="stroke-[#9ca3af]" strokeWidth="3" />
      <path d="M1.8 96V3" className="stroke-[#e5e7eb]/60" strokeWidth="0.8" />
      <circle cx="2.5" cy="3" r="2.6" className="fill-[#fcd34d]" />
      <TownFlagCloth flag={sponsorId} x={4} y={6} w={34} h={24} wave={1} />
    </svg>
  );
}
