import PortraitHead from '@/components/games/PortraitHead';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';

const P = GAMES_UI.career.parliament;

// The prime minister's brass nameplate on the rostrum desk: his portrait, the
// title and name engraved, and the governing party's mark
export default function ParliamentPmPlate({
  character,
  ring,
  party,
}: {
  character: DuelCharacter;
  ring: string;
  party: SponsorId;
}) {
  return (
    <div className="flex w-full max-w-72 items-center gap-2.5 rounded-[3px] bg-gradient-to-b from-[#fde68a] via-[#d4a017] to-[#a16207] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_2px_0_rgb(0_0_0/0.6)] ring-1 ring-[#78350f]">
      <PortraitHead
        character={character}
        className={`h-10 w-10 shrink-0 ring-2 ${ring}`}
      />
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="font-sign text-[12px] font-bold uppercase leading-tight tracking-[0.1em] text-[#4a3412]">
          {P.primeMinister}
        </span>
        <span className="font-serif text-sm font-black leading-tight text-[#2a1a06] [text-shadow:0_1px_0_rgb(255_240_200/0.5)]">
          {character.name}
        </span>
      </span>
      <SponsorEmblem sponsorId={party} className="h-6 w-6 shrink-0" />
    </div>
  );
}
