import LawCardOption from '@/components/games/career/LawCardOption';
import type { LawDef } from '@/data/games/careerLaws';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const LAWS = GAMES_UI.career.laws;
const AREAS = LAWS.areas as Record<string, string>;

// One law in the catalog: the bill as the ballot prints it and its area
export default function LawCatalogEntry({ def }: { def: LawDef }) {
  return (
    <li className="flex flex-col gap-1.5">
      <LawCardOption card={{ action: 'pass', law: def.id }} featured />
      {def.conflict && (
        <span className="self-end rounded-full border border-amber-300/40 bg-amber-950/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-200">
          {fmt(LAWS.area, { area: AREAS[def.conflict] })}
        </span>
      )}
    </li>
  );
}
