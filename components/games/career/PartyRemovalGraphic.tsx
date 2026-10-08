import PortraitHead from '@/components/games/PortraitHead';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';

const REASONS = GAMES_UI.career.favor.reasons as Record<SponsorId, string>;

// The paparazzi still of a player the party made disappear before a match:
// his face in grey, the list's mark in the corner, the official reason
// stamped across the bottom
export default function PartyRemovalGraphic({
  character,
  party,
  small = false,
}: {
  character: DuelCharacter;
  party: SponsorId;
  small?: boolean;
}) {
  return (
    <div
      className={`rotate-[-2deg] rounded-sm border-4 border-slate-100 bg-slate-950 shadow-lg ${
        small ? 'p-0.5' : 'p-1'
      }`}
    >
      <div className="relative flex items-center justify-center px-1">
        <PortraitHead
          character={character}
          className={`grayscale ${small ? 'h-8 w-8' : 'h-10 w-10'}`}
        />
        <span
          className={`absolute -right-0.5 -top-0.5 flex items-center justify-center rounded-full bg-slate-950 ring-1 ring-slate-100 ${
            small ? 'h-4 w-4' : 'h-5 w-5'
          }`}
        >
          <SponsorEmblem
            sponsorId={party}
            className={small ? 'h-3 w-3' : 'h-4 w-4'}
          />
        </span>
      </div>
      <p
        className={`truncate pt-0.5 text-center font-mono font-bold uppercase tracking-widest text-slate-400 ${
          small ? 'max-w-20 text-[6px]' : 'max-w-24 text-[7px]'
        }`}
      >
        {character.name}
      </p>
      <p
        className={`truncate rounded-sm border border-red-500/70 px-1 text-center font-black uppercase text-red-400 ${
          small ? 'max-w-20 text-[5.5px] tracking-wider' : 'max-w-24 text-[6.5px] tracking-widest'
        }`}
      >
        {REASONS[party]}
      </p>
    </div>
  );
}
