import { useRef } from 'react';
import TownMushrooms from '@/components/games/career/town/TownMushrooms';
import TownSceneryEggplantBed from '@/components/games/career/town/TownSceneryEggplantBed';
import TownSnowman from '@/components/games/career/town/TownSnowman';
import TownUmbrella from '@/components/games/career/town/TownUmbrella';
import useSceneMotion from '@/components/games/useSceneMotion';
import { TOWN_EDITION_COUNT, townEditionIndex } from '@/lib/constants/townEditions';
import type { TownLayoutKey } from '@/lib/constants/townLayout';

const VIEW_BOX = ['0 0 60 74', '0 0 80 60', '0 0 70 80', '0 0 70 40'];

// The toy's art size scaled by the layout: 0.7 on desk, 0.4 on phone
const SIZE: Record<TownLayoutKey, string[]> = {
  desk: ['w-[42px] h-[52px]', 'w-[56px] h-[42px]', 'w-[49px] h-[56px]', 'w-[49px] h-[28px]'],
  phone: ['w-[24px] h-[30px]', 'w-[32px] h-[24px]', 'w-[28px] h-[32px]', 'w-[28px] h-[16px]'],
};

// Each edition's poke-able toy on the square, standing on its box point:
// snowman, eggplant bed, beach umbrella, mushrooms
export default function TownSeasonToy({ season, layout }: { season: number; layout: TownLayoutKey }) {
  const seasonIndex = townEditionIndex(season);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useSceneMotion(rootRef, seasonIndex + (layout === 'phone' ? TOWN_EDITION_COUNT : 0), false, '', true);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-0 left-0 -translate-x-1/2 ${SIZE[layout][seasonIndex]}`}
    >
      <svg viewBox={VIEW_BOX[seasonIndex]} className="h-full w-full overflow-visible">
        {seasonIndex === 0 && <TownSnowman />}
        {seasonIndex === 1 && <TownSceneryEggplantBed />}
        {seasonIndex === 2 && <TownUmbrella />}
        {seasonIndex === 3 && <TownMushrooms />}
      </svg>
    </div>
  );
}
