import PortraitHead from '@/components/games/PortraitHead';
import ElectionResultGraphic from '@/components/games/career/ElectionResultGraphic';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { SponsorId } from '@/lib/utils/careerSave';

// The result chart with the new premier's photo pinned over its empty top
// corner, his list's mark on the print
export default function PremierPaperGraphic({
  seats,
  government,
  premier,
  small = false,
}: {
  seats: Record<SponsorId, number>;
  government: SponsorId[];
  premier: DuelCharacter;
  small?: boolean;
}) {
  const party = government[0];
  return (
    <div className={`relative ${small ? 'pl-3 pt-4' : 'pl-5 pt-7'}`}>
      <ElectionResultGraphic
        seats={seats}
        government={government}
        small={small}
      />
      <div
        className={`absolute left-0 top-0 z-10 rotate-[-6deg] rounded-sm border-4 border-slate-100 bg-slate-950 shadow-lg ${
          small ? 'p-0.5' : 'p-1'
        }`}
      >
        <div className="relative flex justify-center px-1">
          <PortraitHead
            character={premier}
            className={small ? 'h-8 w-8' : 'h-11 w-11'}
          />
          {party && (
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
          )}
        </div>
        <p
          className={`truncate pt-0.5 text-center font-sign font-bold uppercase tracking-[0.06em] text-slate-400 ${
            small ? 'max-w-20 text-[9px]' : 'max-w-24 text-[10px]'
          }`}
        >
          {premier.name}
        </p>
      </div>
    </div>
  );
}
