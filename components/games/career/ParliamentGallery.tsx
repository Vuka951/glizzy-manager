import ParliamentChamber from '@/components/games/career/ParliamentChamber';
import type { SponsorId } from '@/lib/utils/careerSave';

// The chamber seen from the public gallery: the benches in their party
// colours under the arch, and below them the speaker's walnut rostrum on a
// red carpet with the government's count cut into its front and the prime
// minister's nameplate on its desk
export default function ParliamentGallery({
  seats,
  government,
  governed,
  line,
  children,
}: {
  seats: Record<SponsorId, number>;
  government: SponsorId[];
  governed: boolean;
  line: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-b-[5px] rounded-t-[7rem] bg-[radial-gradient(ellipse_at_50%_115%,#5b1a22,#2a0d12_45%,#0d0608_80%)] px-3 pt-3 shadow-[inset_0_4px_18px_rgb(0_0_0/0.85),0_1px_0_rgb(255_255_255/0.07)] ring-1 ring-[#000000]/70">
      <ParliamentChamber
        seats={seats}
        government={government}
        dimOutside={governed}
        className="max-h-44 @3xl:max-h-48"
      />
      <div className="mx-auto mt-1 flex w-full flex-col items-center gap-2 bg-gradient-to-b from-[#7a5230] to-[#3f2a1a] px-[9%] pb-2.5 pt-2 [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]">
        <span className="w-full border-y border-[#d4a017]/50 py-0.5 text-center font-sign text-[13px] font-bold uppercase tracking-[0.12em] text-[#e6c25a] [text-shadow:0_1px_0_rgb(0_0_0/0.6)]">
          {line}
        </span>
        {children}
      </div>
    </div>
  );
}
