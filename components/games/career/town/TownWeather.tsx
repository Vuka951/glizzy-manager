import { useRef } from 'react';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import useSceneMotion from '@/components/games/useSceneMotion';
import { townEditionIndex } from '@/lib/constants/townEditions';

const PARTICLE_COUNT = 18;

// The backdrop's particles: snow, petals, a clear summer night, leaves
const PARTICLE_CLASS = [
  'h-1.5 w-1.5 rounded-full bg-slate-100/85 shadow-[0_0_6px_rgba(226,232,240,0.65)]',
  'h-2 w-1.5 rounded-[70%_30%_70%_30%] bg-pink-300/80 shadow-[0_0_5px_rgba(249,168,212,0.45)]',
  '',
  "h-1 w-2 rounded-[100%_0_100%_0] bg-amber-400/70 shadow-[0_0_4px_rgba(251,191,36,0.3)] before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-2 before:-translate-x-1/2 before:-translate-y-1/2 before:-rotate-12 before:bg-amber-950/45 before:content-['']",
];

const PARTICLE_LEFT = [
  'left-[4%]', 'left-[11%]', 'left-[19%]', 'left-[27%]', 'left-[34%]',
  'left-[42%]', 'left-[50%]', 'left-[58%]', 'left-[65%]', 'left-[73%]',
  'left-[80%]', 'left-[87%]', 'left-[93%]', 'left-[97%]',
  'left-[7%]', 'left-[23%]', 'left-[61%]', 'left-[90%]',
];

// The town's weather follows the animation level; a backdrop behind
// cutscenes and matches passes `followsMotionLevel={false}` to keep it
export default function TownWeather({
  season,
  paused = false,
  followsMotionLevel = true,
}: {
  season: number;
  paused?: boolean;
  followsMotionLevel?: boolean;
}) {
  const seasonIndex = townEditionIndex(season);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ambient = useAmbientMotion() || !followsMotionLevel;

  useSceneMotion(rootRef, seasonIndex, paused, '', followsMotionLevel);

  return (
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {ambient &&
        PARTICLE_CLASS[seasonIndex] &&
        Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <span
            key={i}
            data-particle
            className={`absolute top-0 motion-reduce:hidden ${paused ? 'hidden' : ''} ${PARTICLE_CLASS[seasonIndex]} ${PARTICLE_LEFT[i]}`}
          />
        ))}
    </div>
  );
}
