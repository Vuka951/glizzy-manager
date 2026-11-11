import { type MouseEvent, useCallback, useId, useRef, useState } from 'react';
import TownScenerySky from '@/components/games/career/town/TownScenerySky';
import TownShootingStar from '@/components/games/career/town/TownShootingStar';
import useSceneMotion from '@/components/games/useSceneMotion';
import { TOWN_EDITION_COUNT, townEditionIndex, townSkyGeometry } from '@/lib/constants/townEditions';
import type { TownLayoutKey } from '@/lib/constants/townLayout';
import { prefersReducedMotion } from '@/lib/utils/motion';

const round = (n: number) => Math.round(n * 10) / 10;

// The town's sky behind the ground layer; clicking it sends a shooting star
export default function TownSky({ season, layout }: { season: number; layout: TownLayoutKey }) {
  const seasonIndex = townEditionIndex(season);
  const geo = townSkyGeometry[layout];
  const { horizon: h, s } = geo;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const uid = `townSky${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [shots, setShots] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextShot = useRef(0);

  // The key also changes with the layout, so a desk/phone switch re-reads the art
  useSceneMotion(rootRef, seasonIndex + (layout === 'phone' ? TOWN_EDITION_COUNT : 0), false, '', true);

  const removeShot = useCallback((id: number) => {
    setShots((list) => list.filter((shot) => shot.id !== id));
  }, []);

  const shoot = (event: MouseEvent<SVGSVGElement>) => {
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    if (point.y > h - 30 * s) return;
    if (prefersReducedMotion()) return;
    const id = nextShot.current;
    nextShot.current += 1;
    setShots((list) => [...list.slice(-4), { id, x: point.x + 50 * s, y: point.y - 24 * s }]);
  };

  return (
    <div ref={rootRef} aria-hidden="true" className={`absolute ${geo.frame}`}>
      <svg viewBox={geo.viewBox} className="absolute inset-0 h-full w-full" onClick={shoot}>
        <TownScenerySky season={seasonIndex} layout={layout} uid={uid} />
        {shots.map((shot) => (
          <TownShootingStar
            key={shot.id}
            id={shot.id}
            x={round(shot.x)}
            y={round(shot.y)}
            scale={s}
            gradient={`${uid}-streak`}
            onDone={removeShot}
          />
        ))}
      </svg>
    </div>
  );
}
