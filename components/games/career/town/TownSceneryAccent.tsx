import TownSceneryAutumnBits from '@/components/games/career/town/TownSceneryAutumnBits';
import TownSceneryEggplantPatch from '@/components/games/career/town/TownSceneryEggplantPatch';
import TownScenerySnowDrift from '@/components/games/career/town/TownScenerySnowDrift';
import TownScenerySummerBush from '@/components/games/career/town/TownScenerySummerBush';

const round = (n: number) => Math.round(n * 10) / 10;

// A small edition piece on the grass: snow drift or frosted bush, eggplants,
// sunflowers or a summer bush, a pumpkin, mushrooms or a pile of leaves
export default function TownSceneryAccent({
  x,
  y,
  scale,
  season,
  variant,
}: {
  x: number;
  y: number;
  scale: number;
  season: number;
  variant: number;
}) {
  const v = ((variant % 3) + 3) % 3;
  return (
    <g transform={`translate(${round(x)} ${round(y)}) scale(${scale})`}>
      <ellipse cx="1" cy="0" rx="20" ry="3.5" className="fill-slate-950/30" />
      {season === 0 && <TownScenerySnowDrift variant={v} />}
      {season === 1 && <TownSceneryEggplantPatch variant={v} />}
      {season === 2 && <TownScenerySummerBush variant={v} />}
      {season === 3 && <TownSceneryAutumnBits variant={v} />}
    </g>
  );
}
