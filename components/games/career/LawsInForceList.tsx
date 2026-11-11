import LawBillChip from '@/components/games/career/LawBillChip';
import LawEmptySlot from '@/components/games/career/LawEmptySlot';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import { MAX_LAWS_IN_FORCE } from '@/data/games/careerLaws';
import { GAMES_UI } from '@/data/games/locale';
import type { LawInForce } from '@/lib/utils/careerLaws';
import { fmt } from '@/lib/utils/format';

const LAWS = GAMES_UI.career.laws;

// The books as they stand, printed as a page of the gazette: the masthead,
// how full the books are, then each law as an article with the page's rules between them.
export default function LawsInForceList({
  laws,
  slots = false,
  extra,
}: {
  laws: LawInForce[];
  // Every place on the books drawn, free ones as empty bills, so the list
  // keeps its size as laws come and go
  slots?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <PaperSheet className="flex w-full flex-col gap-2 px-3 pb-3 pt-2.5 text-left sm:px-4">
      <span className="border-y-[3px] border-double border-slate-200 py-1 text-center font-serif text-[13px] font-black uppercase tracking-[0.25em] text-slate-100">
        {LAWS.inForceTitle}
      </span>
      <div className="flex min-h-6 flex-wrap items-center gap-2">
        <span className="flex items-center gap-1" aria-hidden="true">
          {Array.from({ length: MAX_LAWS_IN_FORCE }, (_, i) => (
            <span
              key={i}
              className={`h-2 w-4 rounded-[1px] ${
                i < laws.length ? 'bg-slate-100' : 'border border-slate-500'
              }`}
            />
          ))}
        </span>
        <span className="font-sign text-[14px] font-bold tabular-nums text-slate-300">
          {fmt(LAWS.panel.slots, {
            n: laws.length,
            max: MAX_LAWS_IN_FORCE,
          })}
        </span>
        {extra && <span className="ml-auto">{extra}</span>}
      </div>
      {slots ? (
        <ul className="grid grid-cols-1 border-t border-slate-500 @3xl:grid-cols-6 @3xl:[&>li:nth-child(-n+2)]:border-r @3xl:[&>li:nth-child(4)]:border-r">
          {Array.from({ length: MAX_LAWS_IN_FORCE }, (_, i) => {
            // Three across the top, the last two wider under them
            const span = `@3xl:min-h-36 ${
              i < MAX_LAWS_IN_FORCE - 2 ? '@3xl:col-span-2' : '@3xl:col-span-3'
            }`;
            const law = laws[i];
            return law ? (
              <LawBillChip
                key={law.id}
                law={law}
                mark={`§ ${i + 1}`}
                className={span}
              />
            ) : (
              <LawEmptySlot
                key={`slot-${i}`}
                label={`§ ${i + 1}`}
                className={span}
              />
            );
          })}
        </ul>
      ) : laws.length === 0 ? (
        <span className="border-y border-slate-500 px-3 py-5 text-center font-serif text-xs text-slate-400">
          {LAWS.none}
        </span>
      ) : (
        <ul className="flex flex-col border-t border-slate-500">
          {laws.map((law, i) => (
            <LawBillChip key={law.id} law={law} mark={`§ ${i + 1}`} />
          ))}
        </ul>
      )}
    </PaperSheet>
  );
}
