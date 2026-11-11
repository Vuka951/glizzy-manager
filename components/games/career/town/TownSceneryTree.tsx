import TownSceneryBareTree from '@/components/games/career/town/TownSceneryBareTree';
import TownSceneryPoplar from '@/components/games/career/town/TownSceneryPoplar';
import TownSceneryRoundCrown, { type TownSceneryCrown } from '@/components/games/career/town/TownSceneryRoundCrown';
import TownScenerySnowPine from '@/components/games/career/town/TownScenerySnowPine';
import TownSceneryTrunk from '@/components/games/career/town/TownSceneryTrunk';

const round = (n: number) => Math.round(n * 10) / 10;

const BLOSSOM: TownSceneryCrown[] = [
  { dark: 'fill-[#b65a98]', base: 'fill-[#e48dbd]', light: 'fill-[#f8bddb]', speck: 'fill-[#fff0f7]' },
  { dark: 'fill-[#7f58b8]', base: 'fill-[#ad86df]', light: 'fill-[#d5bbf6]', speck: 'fill-[#f5ecff]' },
  { dark: 'fill-[#c0518f]', base: 'fill-[#ee7fb6]', light: 'fill-[#ffb3d6]', speck: 'fill-[#fde4f1]' },
];

const SUMMER: TownSceneryCrown[] = [
  { dark: 'fill-[#1f4f2b]', base: 'fill-[#33763a]', light: 'fill-[#5aa24a]', speck: 'fill-[#f2c46a]' },
  { dark: 'fill-[#245a2a]', base: 'fill-[#3f8a3a]', light: 'fill-[#77b44c]', speck: 'fill-[#f6d27a]' },
  { dark: 'fill-[#1b4426]', base: 'fill-[#2c6a36]', light: 'fill-[#4f9447]', speck: 'fill-[#f2c46a]' },
];

const AUTUMN: TownSceneryCrown[] = [
  { dark: 'fill-[#6e1b1d]', base: 'fill-[#ad2c29]', light: 'fill-[#d65a2c]', speck: 'fill-[#f0a03c]' },
  { dark: 'fill-[#6a2a14]', base: 'fill-[#a8471c]', light: 'fill-[#d27b2a]', speck: 'fill-[#f2c04a]' },
  { dark: 'fill-[#5a1620]', base: 'fill-[#8f2431]', light: 'fill-[#c23b30]', speck: 'fill-[#e88a3a]' },
];

const GROUND_BITS: [number, number, number][] = [
  [-22, 1.5, 15],
  [-13, -1, -20],
  [-4, 2.5, 40],
  [9, -0.5, -35],
  [18, 2, 10],
  [26, 0.5, -10],
];

// One tree of the edition's species with its base on the grass at x, y:
// snowy pine, pink or violet blossom, lush summer green, crimson autumn
export default function TownSceneryTree({
  x,
  y,
  scale,
  season,
  variant,
  sway = false,
}: {
  x: number;
  y: number;
  scale: number;
  season: number;
  variant: number;
  sway?: boolean;
}) {
  const v = ((variant % 3) + 3) % 3;
  let body: React.ReactNode;
  let litter: string | null = null;
  if (season === 0) {
    body = <TownScenerySnowPine />;
  } else if (season === 1) {
    body = (
      <>
        <TownSceneryTrunk tone="stroke-[#4a2c2e]" />
        <TownSceneryRoundCrown crown={BLOSSOM[v]} wide={v === 2} />
      </>
    );
    litter = v === 1 ? 'fill-[#d5bbf6]' : 'fill-[#f8bddb]';
  } else if (season === 2) {
    body =
      v === 2 ? (
        <TownSceneryPoplar crown={SUMMER[v]} />
      ) : (
        <>
          <TownSceneryTrunk tone="stroke-[#4a3324]" />
          <TownSceneryRoundCrown crown={SUMMER[v]} wide={v === 1} />
        </>
      );
  } else {
    body =
      v === 2 ? (
        <TownSceneryBareTree />
      ) : (
        <>
          <TownSceneryTrunk tone="stroke-[#3b2219]" />
          <TownSceneryRoundCrown crown={AUTUMN[v]} wide={v === 1} />
        </>
      );
    litter = v === 1 ? 'fill-[#d27b2a]' : 'fill-[#b3302a]';
  }

  return (
    <g transform={`translate(${round(x)} ${round(y)}) scale(${scale})`}>
      <ellipse cx="2" cy="0" rx="30" ry="5" className="fill-slate-950/35" />
      {litter &&
        GROUND_BITS.map(([bx, by, r]) => (
          <ellipse
            key={bx}
            cx={bx}
            cy={by}
            rx="2.6"
            ry="1.2"
            transform={`rotate(${r} ${bx} ${by})`}
            className={litter}
          />
        ))}
      {sway ? (
        <g data-sway className="origin-bottom [transform-box:fill-box]">
          {body}
        </g>
      ) : (
        body
      )}
    </g>
  );
}
