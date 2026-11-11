import LawStamp from '@/components/games/career/LawStamp';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { LawId } from '@/data/games/careerLaws';
import { GAMES_UI } from '@/data/games/locale';
import { lawName, type LawVerdict } from '@/lib/utils/careerLaws';
import type { SponsorId } from '@/lib/utils/careerSave';

const STAMPS = GAMES_UI.career.laws.vote.stamps;

// The paper's picture of a law vote: the bill as the chamber printed it, the
// mark of the party that put it up at the head and the verdict stamped across it
export default function LawPaperGraphic({
  law,
  party,
  verdict,
  small = false,
}: {
  law: LawId;
  party: SponsorId | null;
  verdict: LawVerdict;
  small?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col gap-1 rounded-sm border border-slate-900/40 bg-white shadow-[2px_2px_0_rgb(15_23_42/0.35)] ${
        small ? 'w-[7rem] p-1.5' : 'w-[9.5rem] p-2'
      }`}
    >
      <div className="flex items-center gap-1 border-b-[3px] border-double border-slate-900/60 pb-1">
        {party && (
          <SponsorEmblem
            sponsorId={party}
            className={small ? 'h-3.5 w-3.5' : 'h-5 w-5'}
          />
        )}
        <span className="h-1 flex-1 rounded-full bg-slate-300" />
      </div>
      <p
        className={`font-black uppercase leading-tight text-slate-900 ${
          small ? 'text-[9px]' : 'text-[10px]'
        } ${verdict === 'repealed' ? 'line-through decoration-red-700 decoration-2' : ''}`}
      >
        {lawName(law)}
      </p>
      <span className="flex flex-col gap-[3px] pb-3">
        <span className="h-px w-full bg-slate-300" />
        <span className="h-px w-full bg-slate-300" />
        <span className="h-px w-2/3 bg-slate-300" />
      </span>
      <span className="absolute bottom-1 right-1">
        <LawStamp
          verdict={verdict}
          text={STAMPS[verdict]}
          size="sm"
          onPaper
          className={small ? '' : 'text-[11px]'}
        />
      </span>
    </div>
  );
}
