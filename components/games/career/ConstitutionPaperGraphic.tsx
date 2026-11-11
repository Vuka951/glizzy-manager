import LawStamp from '@/components/games/career/LawStamp';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { GAMES_UI } from '@/data/games/locale';
import type { LawVerdict } from '@/lib/utils/careerLaws';
import type { SponsorId } from '@/lib/utils/careerSave';

const LAWS = GAMES_UI.career.laws;

// The paper's picture of the constitution vote: the party's seal on a
// heavier sheet, and the verdict stamped across it
export default function ConstitutionPaperGraphic({
  party,
  verdict,
  small = false,
}: {
  party: SponsorId;
  verdict: LawVerdict;
  small?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center gap-1 rounded-sm border border-red-900/40 bg-amber-100 shadow-[2px_2px_0_rgb(69_10_10/0.4)] ${
        small ? 'w-[7rem] p-1.5' : 'w-[9.5rem] p-2'
      }`}
    >
      <span
        className={`flex items-center justify-center rounded-full bg-red-800 ${
          small ? 'h-6 w-6' : 'h-8 w-8'
        }`}
      >
        <SponsorEmblem
          sponsorId={party}
          className={small ? 'h-3.5 w-3.5' : 'h-5 w-5'}
        />
      </span>
      <p
        className={`text-center font-black uppercase leading-tight text-slate-900 ${
          small ? 'text-[9px]' : 'text-[10px]'
        }`}
      >
        {LAWS.ballot.constitutionName}
      </p>
      <span className="flex w-full flex-col gap-[3px] pb-3">
        <span className="h-px w-full bg-red-900/20" />
        <span className="h-px w-full bg-red-900/20" />
        <span className="h-px w-2/3 self-center bg-red-900/20" />
      </span>
      <span className="absolute bottom-1 right-1">
        <LawStamp
          verdict={verdict}
          text={LAWS.vote.stamps[verdict]}
          size="sm"
          onPaper
          className={small ? '' : 'text-[11px]'}
        />
      </span>
    </div>
  );
}
