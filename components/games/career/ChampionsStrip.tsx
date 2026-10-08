import PortraitHead from '@/components/games/PortraitHead';
import SeasonGlyph from '@/components/games/career/SeasonGlyph';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt } from '@/lib/utils/format';

export type ChampionEntry = { year: number; season: number; champion: string };

// Every cup of the campaign as a portrait, grouped by year: the player's
// own cups framed in red, a shared room's coaches in their colours, the
// rest of the league in grey
export default function ChampionsStrip({
  champions,
  characterBySlug,
  playerSlug,
  coaches,
}: {
  champions: ChampionEntry[];
  characterBySlug: Map<string, DuelCharacter>;
  playerSlug?: string;
  coaches?: CoachTagMap;
}) {
  const years = [...new Set(champions.map((c) => c.year))];
  const ringOf = (slug: string) => {
    const coach = coaches?.[slug];
    if (coach) return `ring-2 ${COACH_COLOR_CLASSES[coach.color].ring}`;
    if (slug === playerSlug) return 'ring-2 ring-red-700';
    return 'ring-1 ring-slate-900/20 grayscale';
  };
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-3">
      {years.map((year) => (
        <div key={year} className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            {fmt(GAMES_UI.career.hud.year, { year })}
          </span>
          <div className="flex gap-1.5">
            {champions
              .filter((c) => c.year === year)
              .map((c, i) => {
                const character = characterBySlug.get(c.champion);
                return (
                  <span
                    key={i}
                    title={`${seasonName(c.season)}: ${character?.name ?? c.champion}`}
                    className="flex flex-col items-center gap-1"
                  >
                    {character ? (
                      <PortraitHead
                        character={character}
                        className={`h-9 w-9 rounded-sm ${ringOf(c.champion)}`}
                      />
                    ) : (
                      <span className="h-9 w-9 rounded-sm bg-slate-900/10" />
                    )}
                    <SeasonGlyph
                      season={c.season}
                      className="h-3 w-3 text-slate-500"
                    />
                  </span>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
