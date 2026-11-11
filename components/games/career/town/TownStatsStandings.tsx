import PortraitHead from '@/components/games/PortraitHead';
import PrimeMinisterTag from '@/components/games/career/PrimeMinisterTag';
import SeatTag from '@/components/games/rooms/SeatTag';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { primeMinister } from '@/lib/utils/careerLaws';
import { h2hFor } from '@/lib/utils/careerMatch';
import { careerPoints } from '@/lib/utils/careerPoints';
import type { SavedCareer } from '@/lib/utils/careerSave';

const R = GAMES_UI.career.report;
const S = GAMES_UI.career.town.stats;

// The table so far as the stats insert prints it: place, name, points,
// titles and record for the whole league, the reader in red and the year's
// rival marked, with the rival's line against the reader on top
export default function TownStatsStandings({
  career,
  characterBySlug,
  order,
  coaches,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  order: string[];
  coaches?: CoachTagMap;
}) {
  const playerSlug = career.playerSlug;
  const pmSlug = primeMinister(career);
  const rivalSlug = career.rivalSlug ?? null;
  const rival = rivalSlug ? characterBySlug.get(rivalSlug) : undefined;
  const rivalRecord = rivalSlug ? h2hFor(career.h2h, playerSlug, rivalSlug) : null;
  return (
    <div className="flex flex-col gap-3">
      {rival && rivalSlug && career.characters[rivalSlug] && (
        <div className="flex items-center gap-3 border-y-2 border-slate-900 py-2">
          <PortraitHead
            character={rival}
            className="h-10 w-10 shrink-0 rounded-sm ring-2 ring-red-700"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-red-800">
              {S.rival}
            </span>
            <span className="truncate font-serif text-sm font-bold leading-tight">
              {rival.name}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end">
            <span className="font-sign text-[13px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              {R.headers.vsYou}
            </span>
            <span className="font-sign text-[22px] font-bold leading-none tabular-nums">
              {rivalRecord ? `${rivalRecord[1]}-${rivalRecord[0]}` : '0-0'}
            </span>
          </span>
        </div>
      )}
      <div>
        <table className="w-full table-fixed text-left font-serif text-[12px] text-slate-800">
          <thead className="sticky top-0 z-10 bg-[#f5ecd7]">
            <tr className="border-b-2 border-slate-900 font-sign text-[13px] font-semibold uppercase tracking-[0.06em] text-slate-600">
              <th className="w-7 pb-1.5 pl-1 pr-2">#</th>
              <th className="pb-1.5 pr-2">{R.headers.character}</th>
              <th className="w-12 pb-1.5 pr-2 text-center">{R.headers.points}</th>
              <th className="w-12 pb-1.5 pr-2 text-center">{R.headers.titles}</th>
              <th className="w-12 pb-1.5 pr-1 text-center">{R.headers.record}</th>
            </tr>
          </thead>
          <tbody>
            {order.map((slug, i) => {
              const ch = career.characters[slug];
              const character = characterBySlug.get(slug);
              if (!ch || !character) return null;
              const isPlayer = slug === playerSlug;
              const coach = coaches?.[slug];
              return (
                <tr
                  key={slug}
                  className={`border-b border-dotted border-slate-900/30 ${
                    isPlayer ? 'bg-red-700/10 font-bold' : ''
                  }`}
                >
                  <td className="py-1 pl-1 pr-2 font-sign text-[14px] tabular-nums text-slate-500">{i + 1}</td>
                  <td className="py-1 pr-2">
                    <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <PortraitHead
                        character={character}
                        className={`h-5 w-5 shrink-0 ${slug === rivalSlug ? 'ring-2 ring-red-700' : ''}`}
                      />
                      <span className="min-w-0 max-w-full truncate" title={character.name}>
                        {character.name}
                      </span>
                      {slug === pmSlug && <PrimeMinisterTag />}
                      {coach ? (
                        <SeatTag name={coach.name} color={coach.color} onPaper dense />
                      ) : (
                        isPlayer && (
                          <span className="shrink-0 rounded-[2px] bg-red-700 px-1 font-sign text-[11px] font-bold uppercase tracking-[0.06em] text-amber-50">
                            {R.you}
                          </span>
                        )
                      )}
                    </span>
                  </td>
                  <td className="py-1 pr-2 text-center font-sign text-[15px] font-bold tabular-nums">
                    {careerPoints(ch)}
                  </td>
                  <td className="py-1 pr-2 text-center font-sign text-[14px] tabular-nums">
                    {ch.titles > 0 ? ch.titles : ''}
                  </td>
                  <td className="whitespace-nowrap py-1 pr-1 text-center font-sign text-[14px] tabular-nums">
                    {ch.wins}-{ch.losses}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
