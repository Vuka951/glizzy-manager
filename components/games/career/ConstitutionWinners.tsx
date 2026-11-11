import PortraitHead from '@/components/games/PortraitHead';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { SponsorId } from '@/lib/utils/careerSave';

// The party's seal over every coach on its list, the winners of a campaign
// that ended on one-party rule; the viewer's own man wears an amber ring
export default function ConstitutionWinners({
  party,
  winners,
  ownSlug,
}: {
  party: SponsorId;
  winners: DuelCharacter[];
  ownSlug?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[#991b1b] shadow-[0_0_0_4px_rgb(127_29_29/0.45),0_3px_0_rgb(0_0_0/0.5)]"
      >
        <SponsorEmblem sponsorId={party} className="h-10 w-10" />
      </span>
      <ul className="flex max-w-xs flex-wrap justify-center gap-2 sm:max-w-sm">
        {winners.map((character) => (
          <li key={character.slug} className="flex flex-col items-center gap-1">
            <PortraitHead
              character={character}
              className={`h-11 w-11 ring-2 ${
                character.slug === ownSlug ? 'ring-amber-300' : 'ring-red-700/70'
              }`}
            />
            <span className="max-w-[4.5rem] truncate text-center font-sign text-[12px] font-bold uppercase tracking-[0.04em] text-amber-300">
              {character.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
