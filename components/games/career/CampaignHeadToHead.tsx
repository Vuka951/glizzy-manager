import PortraitHead from '@/components/games/PortraitHead';
import PaperBar from '@/components/games/career/PaperBar';
import PaperSection from '@/components/games/career/PaperSection';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { h2hFor } from '@/lib/utils/careerMatch';
import { NEWSPRINT_PAINT } from '@/lib/utils/careerNewsprint';
import type { SavedCareer } from '@/lib/utils/careerSave';

const S = GAMES_UI.career.town.stats;
const ROWS = 8;

// The reader's most played opponents on one shared scale, losses to the left
// of the middle and wins to the right, the ones who own the reader on top
export default function CampaignHeadToHead({
  career,
  characterBySlug,
  order,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  order: string[];
}) {
  const playerSlug = career.playerSlug;
  const lines = order
    .filter((slug) => slug !== playerSlug)
    .flatMap((slug) => {
      const record = h2hFor(career.h2h, playerSlug, slug);
      const character = characterBySlug.get(slug);
      if (!record || !character || record[0] + record[1] === 0) return [];
      return [{ slug, character, won: record[0], lost: record[1] }];
    })
    .sort((a, b) => b.won + b.lost - (a.won + a.lost))
    .slice(0, ROWS)
    .sort((a, b) => b.lost - b.won - (a.lost - a.won));
  if (lines.length === 0) return null;
  const max = Math.max(...lines.flatMap((line) => [line.won, line.lost]));
  return (
    <div className={`w-full ${NEWSPRINT_PAINT}`}>
    <PaperSection title={S.h2hTitle} icon="swords">
      <div className="flex flex-col">
        <div className="grid grid-cols-[1.75rem_minmax(0,6.5rem)_minmax(0,1fr)_minmax(0,1fr)] gap-1.5 px-0.5 pb-1 font-sign text-[13px] font-bold uppercase tracking-[0.05em] text-slate-700 sm:grid-cols-[1.75rem_minmax(0,10rem)_minmax(0,1fr)_minmax(0,1fr)]">
          <span className="col-start-3 flex items-center justify-end gap-1">
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 shrink-0" aria-hidden="true">
              <rect width={10} height={10} className="fill-[#b91c1c]" />
            </svg>
            {S.h2hLost}
          </span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 shrink-0" aria-hidden="true">
              <rect width={10} height={10} className="fill-[#1d4ed8]" />
            </svg>
            {S.h2hWon}
          </span>
        </div>
        {lines.map((line) => (
          <div
            key={line.slug}
            className="grid h-10 grid-cols-[1.75rem_minmax(0,6.5rem)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-1.5 border-t border-dotted border-slate-900/30 px-0.5 sm:grid-cols-[1.75rem_minmax(0,10rem)_minmax(0,1fr)_minmax(0,1fr)]"
          >
            <PortraitHead character={line.character} className="h-7 w-7" />
            <span
              title={line.character.name}
              className="line-clamp-2 min-w-0 font-serif text-[12px] font-bold leading-[1.15] text-slate-900 [overflow-wrap:anywhere] sm:text-[13px]"
            >
              {line.character.name}
            </span>
            <span className="flex min-w-0 items-center gap-1">
              <span className="w-5 shrink-0 text-right font-sign text-[15px] font-bold tabular-nums text-slate-900">
                {line.lost}
              </span>
              <span className="min-w-0 flex-1 -scale-x-100">
                <PaperBar value={line.lost} max={max} className="fill-[#b91c1c]" />
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-1">
              <span className="min-w-0 flex-1">
                <PaperBar value={line.won} max={max} className="fill-[#1d4ed8]" />
              </span>
              <span className="w-5 shrink-0 font-sign text-[15px] font-bold tabular-nums text-slate-900">
                {line.won}
              </span>
            </span>
          </div>
        ))}
      </div>
    </PaperSection>
    </div>
  );
}
