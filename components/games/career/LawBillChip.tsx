import LawSeal from '@/components/games/career/LawSeal';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { GAMES_UI } from '@/data/games/locale';
import {
  lawEffectText,
  lawName,
  type LawInForce,
} from '@/lib/utils/careerLaws';
import { fmt } from '@/lib/utils/format';

const PANEL = GAMES_UI.career.laws.panel;

// One law on the books as an article of the gazette: its paragraph number
// and the wax seal of the party that led the government passing it at the
// head, the law and its text, and the governing parties' marks signed over
// the year it passed
export default function LawBillChip({
  law,
  mark,
  className = '',
}: {
  law: LawInForce;
  mark: string;
  className?: string;
}) {
  const party = law.government[0];
  return (
    <li
      className={`flex min-w-0 flex-col gap-1.5 border-b border-slate-500 px-1 py-3 @3xl:px-3 ${className}`}
    >
      <span className="flex items-center gap-2.5">
        {party && <LawSeal party={party} />}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-serif text-[12px] font-black text-slate-400">
            {mark}
          </span>
          <span className="font-serif text-[15px] font-black leading-tight text-slate-100">
            {lawName(law.id)}
          </span>
        </span>
      </span>
      <span className="text-[11px] leading-snug text-slate-300">
        {lawEffectText(law.id)}
      </span>
      <span className="mt-auto flex flex-col items-start gap-0.5 pt-1.5">
        <span className="flex items-center gap-1 border-b border-slate-400 pb-0.5 pr-3">
          {law.government.map((id) => (
            <SponsorEmblem key={id} sponsorId={id} className="h-4 w-4" />
          ))}
        </span>
        <span className="font-sign text-[12px] font-semibold tabular-nums text-slate-400">
          {fmt(PANEL.year, { year: law.year })}
        </span>
      </span>
    </li>
  );
}
