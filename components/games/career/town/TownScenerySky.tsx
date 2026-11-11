import { useMemo } from 'react';
import TownBird from '@/components/games/career/town/TownBird';
import TownCloud from '@/components/games/career/town/TownCloud';
import TownSkyStreak from '@/components/games/career/town/TownSkyStreak';
import {
  type TownEditionPalette,
  type TownSkyGeometry,
  townEditions,
  townSkyGeometry,
} from '@/lib/constants/townEditions';
import type { TownLayoutKey } from '@/lib/constants/townLayout';

const round = (n: number) => Math.round(n * 10) / 10;

// Deterministic noise so the scene draws the same on every render
const rand = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

type FarTree = { x: number; base: number; h: number; round: boolean };

function pinePath({ x, base, h }: FarTree) {
  return `M${round(x)} ${round(base - h)}l${round(h * 0.24)} ${round(h * 0.5)}h${round(-h * 0.48)}zM${round(x)} ${round(base - h * 0.6)}l${round(h * 0.32)} ${round(h * 0.6)}h${round(-h * 0.64)}z`;
}

function pineSnowPath({ x, base, h }: FarTree) {
  return `M${round(x)} ${round(base - h)}l${round(h * 0.1)} ${round(h * 0.2)}h${round(-h * 0.2)}zM${round(x)} ${round(base - h * 0.6)}l${round(h * 0.13)} ${round(h * 0.24)}h${round(-h * 0.26)}z`;
}

function circlePath(cx: number, cy: number, r: number) {
  return `M${round(cx - r)} ${round(cy)}a${round(r)} ${round(r)} 0 1 0 ${round(2 * r)} 0a${round(r)} ${round(r)} 0 1 0 ${round(-2 * r)} 0z`;
}

// A broadleaf silhouette that reaches down to its base, so it never floats
function canopyPath({ x, base, h }: FarTree) {
  const k = h * 0.64;
  return (
    circlePath(x, base - k * 0.58, k * 0.34) +
    circlePath(x - k * 0.24, base - k * 0.3, k * 0.26) +
    circlePath(x + k * 0.25, base - k * 0.33, k * 0.25) +
    `M${round(x - k * 0.3)} ${round(base)}h${round(k * 0.6)}v${round(-k * 0.3)}h${round(-k * 0.6)}z`
  );
}

function farTreePath(tree: FarTree) {
  return tree.round ? canopyPath(tree) : pinePath(tree);
}

// Blossom, leaf or sunset specks on every other broadleaf crown
function speckPath({ x, base, h }: FarTree, i: number) {
  if (i % 2 === 1) return '';
  const k = h * 0.64;
  return circlePath(x - k * 0.12 + (rand(i + 3) - 0.5) * k * 0.3, base - k * (0.5 + rand(i + 7) * 0.2), Math.max(1, k * 0.035));
}

function smoothPath(points: [number, number][], bottom: number) {
  let d = `M${round(points[0][0])} ${bottom}L${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += `Q${round(x)} ${round(y)} ${round((x + nx) / 2)} ${round((y + ny) / 2)}`;
  }
  const last = points[points.length - 1];
  return `${d}L${round(last[0])} ${round(last[1])}L${round(last[0])} ${bottom}Z`;
}

function buildSky(geo: TownSkyGeometry, season: number, palette: TownEditionPalette) {
  const { w, horizon: h, s, bottom } = geo;
  const left = -720;
  const right = w + 720;

  const peaks: [number, number][] = [];
  const ridge: [number, number][] = [];
  for (let x = left, i = 0; x <= right + 95 * s; x += 95 * s, i += 1) {
    const peak = i % 2 === 1;
    const y = peak ? h - (144 + rand(i) * 26) * s : h - (86 + rand(i) * 18) * s;
    ridge.push([x, y]);
    if (peak) peaks.push([x, y]);
  }
  const far = `M${left} ${bottom}${ridge.map(([x, y]) => `L${round(x)} ${round(y)}`).join('')}L${right + 95 * s} ${bottom}Z`;
  const caps = peaks
    .map(
      ([x, y]) =>
        `M${round(x - 16 * s)} ${round(y + 13 * s)}L${round(x)} ${round(y)}l${round(16 * s)} ${round(13 * s)}l${round(-8 * s)} ${round(-2 * s)}l${round(-8 * s)} ${round(6 * s)}l${round(-8 * s)} ${round(-6 * s)}z`,
    )
    .join('');

  const hills: [number, number][] = [];
  for (let x = left, i = 0; x <= right + 130 * s; x += 130 * s, i += 1) {
    hills.push([x, h - (44 + rand(i + 40) * 18) * s]);
  }
  const near = smoothPath(hills, bottom);
  const nearSnow = hills
    .map(([x, y]) => `M${round(x - 54 * s)} ${round(y + 7 * s)}Q${round(x)} ${round(y - 3 * s)} ${round(x + 54 * s)} ${round(y + 7 * s)}Q${round(x)} ${round(y + 2 * s)} ${round(x - 54 * s)} ${round(y + 7 * s)}z`)
    .join('');

  const lights = geo.lights.flatMap((c, ci) =>
    Array.from({ length: 8 }, (_, j) => ({
      x: round(c + (j - 3.5) * 24 * s + (rand(ci * 10 + j) - 0.5) * 10 * s),
      y: round(h - (62 + rand(ci * 10 + j + 5) * 10) * s),
      bright: j % 2 === 1,
    })),
  );

  const [lakeFrom, lakeTo] = geo.lake;
  const forestRanges = geo.forest.flatMap(([a, b]): [number, number][] => {
    if (season !== 2 || b < lakeFrom || a > lakeTo) return [[a, b]];
    const parts: [number, number][] = [];
    if (a < lakeFrom) parts.push([a, lakeFrom - 10]);
    if (b > lakeTo) parts.push([lakeTo + 10, b]);
    return parts;
  });
  const shape = palette.forestShape;
  const isRound = (i: number) => shape === 'blossom' || shape === 'autumn' || (shape === 'mixed' && i % 3 !== 0);
  const back: FarTree[] = [];
  const front: FarTree[] = [];
  forestRanges.forEach(([a, b], ri) => {
    for (let x = a, i = 0; x <= b; x += 22 * s, i += 1) {
      back.push({ x, base: h - (40 + rand(ri * 300 + i) * 6) * s, h: (54 + rand(ri * 300 + i + 1) * 30) * s, round: isRound(i + 1) });
    }
    for (let x = a + 11 * s, i = 0; x <= b; x += 26 * s, i += 1) {
      front.push({ x, base: h - (32 - rand(ri * 500 + i) * 6) * s, h: (64 + rand(ri * 500 + i + 2) * 36) * s, round: isRound(i) });
    }
  });

  const starTop = season === 2 ? h - 230 * s : h - 150 * s;
  const stars = Array.from({ length: 72 }, (_, i) => ({
    x: round(-700 + rand(i * 2 + 1) * (w + 1400)),
    y: round(-690 + rand(i * 2 + 2) * (h - 150 * s + 690)),
    r: (i % 3 ? 1.3 : 2) * (s < 1 ? 0.85 : 1),
  })).filter((star) => star.y < starTop);

  const fireflies = Array.from({ length: 10 }, (_, i) => ({
    x: round(-160 + rand(i + 900) * (w + 320)),
    y: round(h - (8 + rand(i + 950) * 40) * s),
  }));

  const fog = Array.from({ length: Math.ceil((w + 1400) / (520 * s)) }, (_, i) => ({
    x: round(-700 + i * 520 * s + rand(i + 700) * 120 * s),
    y: round(h - (26 + rand(i + 720) * 14) * s),
  }));

  return {
    far,
    caps,
    near,
    nearSnow,
    lights,
    backForest: back.map(farTreePath).join(''),
    snow: [...back, ...front].filter((tree) => !tree.round).map(pineSnowPath).join(''),
    specks: front.filter((tree) => tree.round).map(speckPath).join(''),
    front,
    stars,
    fireflies,
    fog,
  };
}

// The town's sky and far layers as SVG content in canvas pixels: gradient,
// stars, moon or sun, clouds, birds, far peaks and hills with the town's
// lights, the lake, and the far tree line in the edition's species. `lite`
// keeps only every fourth star twinkling for backdrops behind busy screens
export default function TownScenerySky({
  season,
  layout,
  uid,
  lite = false,
}: {
  season: number;
  layout: TownLayoutKey;
  uid: string;
  lite?: boolean;
}) {
  const geo = townSkyGeometry[layout];
  const palette = townEditions[season];
  const { w, horizon: h, s } = geo;
  const sky = useMemo(() => buildSky(geo, season, palette), [geo, season, palette]);

  const [moonX, moonY, moonR] = geo.moon;
  const [sunX, sunY, sunR] = geo.sun;
  const [lakeFrom, lakeTo] = geo.lake;
  const lakeTop = h - 36 * s;
  const auroraScale = (w + 1400) / 1080;
  const flockFrom = -260;

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} gradientUnits="userSpaceOnUse" x1="0" y1={h - 380 * s} x2="0" y2={h + 100 * s}>
          {palette.sky.map((color, i) => (
            <stop key={color} offset={i / (palette.sky.length - 1)} stopColor={color} />
          ))}
        </linearGradient>
        <linearGradient id={`${uid}-streak`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="72" y2="-33">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0.25" stopColor={palette.glow} stopOpacity={season === 2 ? 0.6 : 0.32} />
          <stop offset="1" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>
        {season === 0 && (
          <linearGradient id={`${uid}-aurora`} x1="0" x2="1">
            <stop offset="0" stopColor="#4ade80" stopOpacity="0.45" />
            <stop offset="0.5" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0.4" />
          </linearGradient>
        )}
        {season === 1 && (
          <mask id={`${uid}-crescent`}>
            <circle cx={moonX} cy={moonY} r={moonR} className="fill-white" />
            <circle cx={moonX + moonR * 0.46} cy={moonY - moonR * 0.3} r={moonR * 0.88} className="fill-black" />
          </mask>
        )}
        {season === 3 && (
          <radialGradient id={`${uid}-blood`}>
            <stop offset="0" stopColor="#f7a35c" />
            <stop offset="0.7" stopColor="#c2412d" />
            <stop offset="1" stopColor="#7f1d1d" />
          </radialGradient>
        )}
      </defs>
      <rect x="-700" y="-700" width={w + 1400} height={geo.bottom + 700} fill={`url(#${uid}-sky)`} />

      {sky.stars.map((star, i) => (
        <circle
          key={i}
          data-star={lite && i % 4 !== 0 ? undefined : true}
          cx={star.x}
          cy={star.y}
          r={star.r}
          className={`origin-center fill-slate-100 [transform-box:fill-box] ${i % 4 === 0 ? 'opacity-90' : 'opacity-60'}`}
        />
      ))}
      {geo.meteors.map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
          <g data-shooting-star className="opacity-0">
            <TownSkyStreak gradient={`${uid}-streak`} />
          </g>
        </g>
      ))}

      {season === 0 && (
        <g transform={`translate(${round(-700 + 40 * auroraScale)} 0) scale(${round(auroraScale * 1000) / 1000} ${s})`}>
          <g data-aurora>
            <path
              d="M-40 120C180 40 360 170 560 90S860 110 1040 60V30C860 90 700 40 540 70S180 20 -40 150Z"
              fill={`url(#${uid}-aurora)`}
            />
          </g>
          <g data-aurora>
            <path
              d="M-40 190C200 120 400 220 620 160S900 170 1040 130V112C880 150 700 120 600 140S200 100 -40 205Z"
              fill={`url(#${uid}-aurora)`}
              opacity="0.5"
            />
          </g>
        </g>
      )}

      {season === 0 && (
        <g>
          <circle data-glow cx={moonX} cy={moonY} r={moonR * 2.2} fill={`url(#${uid}-glow)`} className="origin-center [transform-box:fill-box]" />
          <circle cx={moonX} cy={moonY} r={moonR * 1.3} className="fill-slate-100/10" />
          <circle cx={moonX} cy={moonY} r={moonR} className="fill-[#e9eefb]" />
          <circle cx={moonX - moonR * 0.28} cy={moonY - moonR * 0.28} r={moonR * 0.17} className="fill-slate-300/80" />
          <circle cx={moonX + moonR * 0.33} cy={moonY + moonR * 0.28} r={moonR * 0.14} className="fill-slate-300/70" />
          <circle cx={moonX + moonR * 0.2} cy={moonY - moonR * 0.45} r={moonR * 0.08} className="fill-slate-300/60" />
        </g>
      )}
      {season === 1 && (
        <g>
          <circle data-glow cx={moonX} cy={moonY} r={moonR * 2.2} fill={`url(#${uid}-glow)`} className="origin-center [transform-box:fill-box]" />
          <circle cx={moonX} cy={moonY} r={moonR} className="fill-[#fbe3e8]" mask={`url(#${uid}-crescent)`} />
        </g>
      )}
      {season === 2 && (
        <g>
          <circle data-glow cx={sunX} cy={sunY} r={sunR * 2.6} fill={`url(#${uid}-glow)`} className="origin-center [transform-box:fill-box]" />
          <circle data-float cx={sunX} cy={sunY} r={sunR} className="origin-center fill-[#f8cd67] [transform-box:fill-box]" />
        </g>
      )}
      {season === 3 && (
        <g>
          <circle data-pulse cx={moonX} cy={moonY} r={moonR * 2.6} fill={`url(#${uid}-glow)`} className="origin-center opacity-30 [transform-box:fill-box]" />
          <circle data-pulse cx={moonX} cy={moonY} r={moonR * 1.7} fill={`url(#${uid}-glow)`} className="origin-center opacity-30 [transform-box:fill-box]" />
          <circle cx={moonX} cy={moonY} r={moonR} fill={`url(#${uid}-blood)`} />
          <circle cx={moonX - moonR * 0.32} cy={moonY - moonR * 0.26} r={moonR * 0.18} className="fill-[#9f3429]/50" />
          <circle cx={moonX + moonR * 0.32} cy={moonY + moonR * 0.32} r={moonR * 0.13} className="fill-[#9f3429]/50" />
          <ellipse cx={moonX - moonR * 0.2} cy={moonY + moonR * 0.75} rx={moonR * 0.9} ry={moonR * 0.18} className="fill-[#241a30]/70" />
        </g>
      )}

      {geo.clouds.map(([x, y, scale]) => (
        <TownCloud key={`${x}-${y}`} x={x} y={y} scale={scale * s} tone={palette.cloud} />
      ))}

      <g transform={`translate(${flockFrom} ${round(h - 240 * s)})`}>
        <g data-flock={w - flockFrom * 2}>
          <TownBird x={0} y={20} size={s} tone={palette.bird} />
          <TownBird x={26 * s} y={10} size={s * 0.8} tone={palette.bird} />
          <TownBird x={18 * s} y={34} size={s * 0.9} tone={palette.bird} />
          <TownBird x={48 * s} y={24} size={s * 0.7} tone={palette.bird} />
          <TownBird x={40 * s} y={0} size={s * 0.6} tone={palette.bird} />
        </g>
      </g>

      {season === 3 &&
        [
          [moonX + 130 * s, moonY + 60 * s],
          [moonX + 230 * s, moonY + 100 * s],
          [moonX + 360 * s, moonY + 40 * s],
          [moonX - 90 * s, moonY + 110 * s],
        ].map(([x, y]) => (
          <g key={x} transform={`translate(${round(x)} ${round(y)}) scale(${s})`}>
            <g data-bat className="origin-center [transform-box:fill-box]">
              <path d="M0 0q-8-8-16-2q6 0 8 6q4-4 8-4q4 0 8 4q2-6 8-6q-8-6-16 2z" className="fill-[#0b0908]" />
            </g>
          </g>
        ))}
      {season === 3 &&
        geo.crows.map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
            <g data-glide="36">
              <path
                data-flap
                d="M0 0q-9-7-18-3q7 0 10 5q3-2 8-2t8 2q3-5 10-5q-9-4-18 3z"
                className="origin-center fill-[#141019] [transform-box:fill-box]"
              />
              <path d="M-2 0l2 4 2-4z" className="fill-[#141019]" />
            </g>
          </g>
        ))}
      {season === 1 &&
        geo.swallows.map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
            <g data-swoop="110">
              <path
                data-flap
                d="M0 0q-6-5-14-5q8 3 11 7l-5 7 8-4 8 4-5-7q3-4 11-7q-8 0-14 5z"
                className="origin-center fill-slate-300/85 [transform-box:fill-box]"
              />
              <circle cx="0" cy="1" r="1.2" className="fill-red-300/80" />
            </g>
          </g>
        ))}

      <path d={sky.far} className={palette.far} />
      {season === 0 && <path d={sky.caps} className="fill-slate-100" />}
      <path d={sky.near} className={palette.near} />
      {season === 0 && <path d={sky.nearSnow} className="fill-slate-100/25" />}
      {sky.lights.map((light, i) => (
        <circle
          key={i}
          data-star={lite ? undefined : true}
          cx={light.x}
          cy={light.y}
          r={1.6 * s}
          className={`origin-center fill-amber-200 [transform-box:fill-box] ${light.bright ? 'opacity-90' : 'opacity-60'}`}
        />
      ))}

      {season === 2 && (
        <g>
          <path
            d={`M${lakeFrom} ${h + 10}C${lakeFrom + 16 * s} ${lakeTop + 8 * s} ${lakeFrom + 50 * s} ${lakeTop} ${lakeFrom + 110 * s} ${lakeTop}L${lakeTo} ${lakeTop}V${h + 10}Z`}
            className={palette.water}
          />
          <path d={`M${lakeFrom + 60 * s} ${lakeTop + 1}L${lakeTo} ${lakeTop + 1}`} className="fill-none stroke-amber-200/30" strokeWidth={1.5 * s} />
          <g data-shimmer>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={lakeFrom + (70 + i * 46) * s}
                y={lakeTop + (6 + (i % 3) * 6) * s}
                width={(30 + (i % 2) * 24) * s}
                height={2 * s}
                rx={s}
                className="fill-amber-300/50"
              />
            ))}
          </g>
          <g transform={`translate(${geo.sail[0]} ${round(lakeTop + 9 * s)}) scale(${s})`}>
            <g data-sail={geo.sail[1]} className="origin-center [transform-box:fill-box]">
              <path d="M0 0h24l-4 6H4z" className="fill-[#33241c]" />
              <path d="M11 0v-22" className="stroke-[#33241c]" strokeWidth="1.4" />
              <path d="M12 -2v-19l10 19z" className="fill-slate-100/90" />
              <path d="M10 -3v-14l-7 14z" className="fill-amber-100/80" />
              <path d="M11 -22h5l-5 2.5z" className="fill-red-400" />
            </g>
          </g>
        </g>
      )}

      <path d={sky.backForest} className={palette.forestBack} />
      {sky.front.map((tree, i) =>
        i % 5 === 0 ? (
          <g key={i} data-sway className="origin-bottom [transform-box:fill-box]">
            <path d={farTreePath(tree)} className={palette.forest} />
          </g>
        ) : (
          <path key={i} d={farTreePath(tree)} className={palette.forest} />
        ),
      )}
      {season === 0 && <path d={sky.snow} className={palette.forestSpeck} />}
      {season !== 0 && <path d={sky.specks} className={palette.forestSpeck} />}

      {(season === 0 || season === 3) &&
        sky.fog.map((bank, i) => (
          <g key={i} data-fog>
            <ellipse cx={bank.x} cy={bank.y} rx={300 * s} ry={18 * s} className={season === 3 ? 'fill-slate-200/5' : 'fill-slate-200/[0.03]'} />
            <ellipse cx={bank.x} cy={bank.y + 3 * s} rx={200 * s} ry={9 * s} className={season === 3 ? 'fill-slate-200/5' : 'fill-slate-200/[0.03]'} />
          </g>
        ))}
      {season === 1 &&
        sky.fireflies.map((fly, i) => (
          <circle key={i} data-firefly cx={fly.x} cy={fly.y} r={2 * s} className="origin-center fill-yellow-300 [transform-box:fill-box]" />
        ))}
    </>
  );
}
