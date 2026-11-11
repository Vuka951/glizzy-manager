import PortraitHead from '@/components/games/PortraitHead';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { SponsorId } from '@/lib/utils/careerSave';

// What every channel carries once the count is in: the winner on the
// party's colours, its emblem as the station bug and a ticker underneath
export default function ElectionWinStateBroadcast({
  winner,
  party,
}: {
  winner: DuelCharacter;
  party: SponsorId;
}) {
  return (
    <div className={`absolute inset-0 ${SPONSOR_THEMES[party].board}`}>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.35),transparent_55%)]" />
      <span
        data-anim="nod"
        className="absolute left-1/2 top-[3px] h-[24px] w-[24px] origin-bottom -translate-x-1/2"
      >
        <PortraitHead character={winner} className="h-full w-full border" />
      </span>
      <SponsorEmblem
        sponsorId={party}
        className="absolute left-[2px] top-[2px] aspect-square h-[9px] w-auto"
      />
      <span className="absolute inset-x-0 bottom-0 h-[5px] bg-slate-950">
        <span className="absolute inset-y-0 left-0 w-[9px] bg-red-600" />
        <span className="absolute left-[11px] right-[3px] top-[2px] h-px bg-slate-300/70" />
      </span>
    </div>
  );
}
