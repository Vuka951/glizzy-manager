import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { SponsorId } from '@/lib/utils/careerSave';

// A coalition as a chain of party marks, the leader first and smaller when
// it is the same on every option
export default function CoalitionEmblems({
  leader,
  partners,
  size = 'h-5 w-5',
  leaderSize,
}: {
  leader: SponsorId | null;
  partners: SponsorId[];
  size?: string;
  leaderSize?: string;
}) {
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {leader && (
        <>
          <SponsorEmblem
            sponsorId={leader}
            className={`${leaderSize ?? size} opacity-70`}
          />
          <span className="text-[10px] font-black text-slate-500">+</span>
        </>
      )}
      {partners.map((id, index) => (
        <span key={id} className="flex items-center gap-0.5">
          {index > 0 && (
            <span className="text-[10px] font-black text-slate-500">+</span>
          )}
          <SponsorEmblem sponsorId={id} className={size} />
        </span>
      ))}
    </span>
  );
}
