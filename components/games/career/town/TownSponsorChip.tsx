import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';

const SPONSORS = GAMES_UI.career.sponsors;

// The sponsor banner folded into a brass frame on the phone, the contract's
// emblem behind its dark window like the balance in the till
export default function TownSponsorChip({
  sponsorId,
  onOpen,
}: {
  sponsorId: SponsorId | null;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      title={SPONSORS.title}
      aria-label={sponsorId ? SPONSORS.names[sponsorId] : SPONSORS.none}
      className="flex h-11 w-11 shrink-0 items-stretch rounded-[4px] bg-gradient-to-b from-[#e8c066] to-[#a8782a] p-[3px] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_2px_0_rgb(2_6_23/0.65)] transition active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fde68a]"
    >
      <span className="flex w-full items-center justify-center rounded-[2px] bg-[#140d07] shadow-[inset_0_1px_3px_rgb(0_0_0/0.9)]">
        {sponsorId ? (
          <SponsorEmblem sponsorId={sponsorId} className="h-6 w-6 shrink-0" />
        ) : (
          <span className="font-sign text-[17px] font-bold leading-none text-[#fdf0c8]">?</span>
        )}
      </span>
    </button>
  );
}
