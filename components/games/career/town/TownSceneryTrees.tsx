import TownMushrooms from '@/components/games/career/town/TownMushrooms';
import TownSceneryAccent from '@/components/games/career/town/TownSceneryAccent';
import TownSceneryEggplantBed from '@/components/games/career/town/TownSceneryEggplantBed';
import TownSceneryTree from '@/components/games/career/town/TownSceneryTree';
import TownSnowman from '@/components/games/career/town/TownSnowman';
import TownUmbrella from '@/components/games/career/town/TownUmbrella';
import { type TownSceneryItem, townBackdropScenery, townScenery } from '@/lib/constants/townEditions';
import type { TownLayoutKey } from '@/lib/constants/townLayout';

// Each toy's art box: width and the base line it stands on
const TOY_BOX: [number, number][] = [
  [60, 72],
  [80, 58],
  [70, 78],
  [70, 37],
];

const atView = ([fx, ...rest]: TownSceneryItem, [left, width]: [number, number]): TownSceneryItem => [
  Math.round(left + fx * width),
  ...rest,
];

// The edition's trees and ground pieces as SVG, sorted back to front so a
// nearer tree always covers a farther one. Given the backdrop's shown span
// (left edge and width), it lays out the backdrop set against that span
// instead, and draws the season toy itself
export default function TownSceneryTrees({
  season,
  layout,
  backdrop,
}: {
  season: number;
  layout: TownLayoutKey;
  backdrop?: [number, number];
}) {
  const town = townScenery[layout];
  const shown = townBackdropScenery[layout];
  const trees = backdrop ? shown.trees.map((item) => atView(item, backdrop)) : town.trees;
  const accents = backdrop ? shown.accents.map((item) => atView(item, backdrop)) : town.accents;
  const [toyFx, toyY, toyScale] = shown.toy;
  const [toyW, toyBase] = TOY_BOX[season];
  const toyX = backdrop ? backdrop[0] + toyFx * backdrop[1] : 0;

  const items = [
    ...trees.map((item) => ({ item, tree: true })),
    ...accents.map((item) => ({ item, tree: false })),
  ].sort((a, b) => a.item[1] - b.item[1]);

  return (
    <g>
      {items.map(({ item: [x, y, scale, variant], tree }, i) =>
        tree ? (
          <TownSceneryTree
            key={`t${x}-${y}`}
            x={x}
            y={y}
            scale={scale}
            season={season}
            variant={variant}
            sway={i % 4 === 1}
          />
        ) : (
          <TownSceneryAccent key={`a${x}-${y}`} x={x} y={y} scale={scale} season={season} variant={variant} />
        ),
      )}
      {backdrop && (
        <g transform={`translate(${Math.round(toyX - (toyW / 2) * toyScale)} ${toyY - toyBase * toyScale}) scale(${toyScale})`}>
          {season === 0 && <TownSnowman />}
          {season === 1 && <TownSceneryEggplantBed />}
          {season === 2 && <TownUmbrella />}
          {season === 3 && <TownMushrooms />}
        </g>
      )}
    </g>
  );
}
