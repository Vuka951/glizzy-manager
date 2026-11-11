'use client';

import SeasonBackdrop from '@/components/games/SeasonBackdrop';
import TownSceneryGround from '@/components/games/career/town/TownSceneryGround';
import TownScenerySky from '@/components/games/career/town/TownScenerySky';
import TownSceneryTrees from '@/components/games/career/town/TownSceneryTrees';
import { SEASON_THEME_INDEX } from '@/data/games/careerSeasons';
import { GAMES_UI } from '@/data/games/locale';
import { TOWN_LAYOUTS, type TownLayoutKey } from '@/lib/constants/townLayout';

const EDITIONS = [0, 1, 2, 3];
const LAYOUTS: TownLayoutKey[] = ['desk', 'phone'];

const CARD: Record<TownLayoutKey, string> = {
  desk: 'aspect-[1000/660] w-full',
  phone: 'aspect-[390/820] w-full',
};

const BACKDROP_BOXES = [
  'aspect-video',
  'aspect-[4/1]',
  'aspect-[9/19]',
  'aspect-square',
];

// Every edition's town scenery on both canvases without the buildings, then
// SeasonBackdrop in the container shapes the game puts it in
export default function TownEditionsPreview() {
  return (
    <div className="flex flex-col gap-6">
      {EDITIONS.map((season) => (
        <section key={season} className="flex flex-col gap-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-200/80">
            {GAMES_UI.cup.studio.themes[SEASON_THEME_INDEX[season]]}
          </h3>
          <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)] items-end gap-3">
            {LAYOUTS.map((layout) => (
              <div
                key={layout}
                className={`relative overflow-hidden rounded-2xl border border-frost-border/40 bg-slate-950 ${CARD[layout]}`}
              >
                <svg
                  viewBox={`0 0 ${TOWN_LAYOUTS[layout].w} ${TOWN_LAYOUTS[layout].h}`}
                  className="absolute inset-0 h-full w-full"
                >
                  <TownScenerySky season={season} layout={layout} uid={`edition${season}${layout}s`} />
                  <TownSceneryGround season={season} layout={layout} uid={`edition${season}${layout}g`} />
                  <TownSceneryTrees season={season} layout={layout} />
                </svg>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,1fr)_minmax(0,2fr)]">
            {BACKDROP_BOXES.map((box) => (
              <div
                key={box}
                className={`relative overflow-hidden rounded-2xl border border-frost-border/40 bg-slate-950 ${box}`}
              >
                <SeasonBackdrop season={season} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
