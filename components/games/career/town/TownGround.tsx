import { useId, useRef } from 'react';
import TownSceneryGround from '@/components/games/career/town/TownSceneryGround';
import TownSceneryTrees from '@/components/games/career/town/TownSceneryTrees';
import useSceneMotion from '@/components/games/useSceneMotion';
import { TOWN_EDITION_COUNT, townEditionIndex, townGroundShape } from '@/lib/constants/townEditions';
import type { TownLayoutKey } from '@/lib/constants/townLayout';

// The town's ground with the edition's trees standing on it, under the buildings
export default function TownGround({ season, layout }: { season: number; layout: TownLayoutKey }) {
  const seasonIndex = townEditionIndex(season);
  const shape = townGroundShape[layout];
  const rootRef = useRef<HTMLDivElement | null>(null);
  const uid = `townGround${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  useSceneMotion(rootRef, seasonIndex + (layout === 'phone' ? TOWN_EDITION_COUNT : 0), false, '', true);

  return (
    <div ref={rootRef} aria-hidden="true" className={`pointer-events-none absolute ${shape.frame}`}>
      <svg viewBox={shape.viewBox} className="absolute inset-0 h-full w-full">
        <TownSceneryGround season={seasonIndex} layout={layout} uid={uid} />
        <TownSceneryTrees season={seasonIndex} layout={layout} />
      </svg>
    </div>
  );
}
