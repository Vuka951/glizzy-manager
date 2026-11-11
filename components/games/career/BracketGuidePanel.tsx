import BracketGuideSlot from '@/components/games/career/BracketGuideSlot';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { SEED_PAIRS } from '@/lib/utils/careerSeeding';
import { fmt } from '@/lib/utils/format';

const G = GAMES_UI.career.table.bracketGuide;

// SEED_PAIRS runs down the bracket, so every two pairs share a quarter and
// every two quarters a half
const QUARTERS = [0, 1, 2, 3].map((q) => SEED_PAIRS.slice(q * 2, q * 2 + 2));

export default function BracketGuidePanel({
  order,
  characterBySlug,
  playerSlug,
}: {
  // The table as it stands, top first
  order: string[];
  characterBySlug: Map<string, DuelCharacter>;
  playerSlug: string;
}) {
  const pairCard = (seeds: number[], key: string) => (
    <div
      key={key}
      className="divide-y divide-[#1c1408]/50 rounded-r-[3px] border-y border-r-2 border-[#1c1408]/50"
    >
      {seeds.map((index) => {
        const slug = order[index];
        const character = characterBySlug.get(slug) ?? null;
        return (
          <BracketGuideSlot
            key={index}
            tag={String(index + 1)}
            character={character}
            label={character?.name ?? slug}
            mine={slug === playerSlug}
          />
        );
      })}
    </div>
  );

  // The button sits in the table's legend row, whose sign type the modal would
  // otherwise inherit
  return (
    <div className="flex flex-col gap-3 text-left font-sans font-normal normal-case tracking-normal">
      <PaperSheet className="flex flex-col gap-4 px-3 pb-4 pt-3 sm:px-4">
      <div className="flex flex-col gap-1.5 font-serif text-[12.5px] leading-relaxed text-slate-300">
        <p>{G.seeding}</p>
        <p>{G.halves}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="border-b-[3px] border-double border-[#1c1408]/50 pb-0.5 font-sign text-[15px] font-bold uppercase leading-tight tracking-[0.07em] text-slate-100">
          {G.today}
        </span>
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((half) => (
            <div key={half} className="flex flex-col gap-2">
              <span className="font-sign text-[14px] font-bold uppercase leading-none tracking-[0.07em] text-slate-300">
                {fmt(G.half, { n: half + 1 })}
              </span>
              {QUARTERS.slice(half * 2, half * 2 + 2).map((pairs, q) => {
                const holdsPlayer = pairs
                  .flat()
                  .some((index) => order[index] === playerSlug);
                return (
                  <div
                    key={q}
                    className={`flex flex-col gap-1 border-l-2 py-0.5 pl-1.5 ${
                      holdsPlayer ? 'border-[#ca8a04]' : 'border-[#1c1408]/25'
                    }`}
                  >
                    <span className="font-sign text-[12px] font-semibold uppercase leading-none tracking-[0.06em] text-slate-400">
                      {fmt(G.quarter, { n: half * 2 + q + 1 })}
                    </span>
                    {pairs.map((pair, i) => pairCard(pair, `${q}-${i}`))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      </PaperSheet>
    </div>
  );
}
