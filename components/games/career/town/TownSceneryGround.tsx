import TownGrassTuft from '@/components/games/career/town/TownGrassTuft';
import { townEditions, townGroundShape } from '@/lib/constants/townEditions';
import type { TownLayoutKey } from '@/lib/constants/townLayout';

// The town's ground as SVG content in canvas pixels: grass from the horizon
// down, the river, the road and its walks. `square` adds the paved square,
// the plaza ring and the crosswalk that only make sense with the town on it
export default function TownSceneryGround({
  season,
  layout,
  uid,
  square = true,
}: {
  season: number;
  layout: TownLayoutKey;
  uid: string;
  square?: boolean;
}) {
  const palette = townEditions[season];
  const shape = townGroundShape[layout];
  const [tileW, tileH] = shape.tile;
  const [zebraX, zebraY, zebraW, zebraH, stripes] = shape.zebra;
  const [plazaX, plazaY, plazaRx, plazaRy] = shape.plaza;
  const desk = layout === 'desk';

  const water = (
    <g>
      <path d={shape.water} className={palette.water} />
      {season === 0 && <path d={shape.water} className="fill-white/20" />}
      <path d={shape.shore} className={`fill-none ${palette.walkStroke}`} strokeWidth={desk ? 4 : 2} />
      {shape.shimmer.map((d) => (
        <g key={d} data-shimmer>
          <path d={d} className={`fill-none ${palette.waterGlint}`} strokeWidth={desk ? 1.6 : 1.4} />
        </g>
      ))}
    </g>
  );

  return (
    <>
      <defs>
        <linearGradient id={`${uid}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.groundTop} />
          <stop offset="1" stopColor={palette.groundBottom} />
        </linearGradient>
        {square && (
          <pattern id={`${uid}-paving`} width={tileW} height={tileH} patternUnits="userSpaceOnUse">
            <rect width={tileW} height={tileH} className={palette.square} />
            <path
              d={`M0 ${tileH}h${tileW}M${tileW / 2} 0v${tileH}`}
              className={palette.roadStroke}
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          </pattern>
        )}
      </defs>

      <path d={`${shape.horizon}V${shape.bottom}H-700Z`} fill={`url(#${uid}-ground)`} />
      <path d={shape.horizon} className={`fill-none ${palette.edge}`} strokeOpacity="0.45" strokeWidth="3" />

      {!desk && water}

      {shape.tufts.map(([x, y, scale]) => (
        <TownGrassTuft key={`${x}-${y}`} x={x} y={y} scale={scale} season={season} />
      ))}

      {square && (
        <g>
          <path d={shape.square} fill={`url(#${uid}-paving)`} />
          <path d={shape.square} className={`fill-none ${palette.walkStroke}`} strokeWidth={desk ? 3 : 2} />
          <ellipse cx={plazaX} cy={plazaY} rx={plazaRx} ry={plazaRy} className={`${palette.walk} opacity-50`} />
          <ellipse cx={plazaX} cy={plazaY} rx={plazaRx} ry={plazaRy} className={`fill-none ${palette.walkStroke}`} strokeWidth="2" />
        </g>
      )}

      <rect x="-700" y={shape.walk[0]} width="2800" height={shape.walk[1] - shape.walk[0]} className={palette.walk} />
      <rect x="-700" y={shape.road[0]} width="2800" height={shape.road[1] - shape.road[0]} className={palette.road} />
      <rect x="-700" y={shape.road[0]} width="2800" height="1.5" className="fill-slate-950/40" />
      <path
        d={`M-700 ${shape.centre}H2100`}
        className={palette.lineStroke}
        strokeWidth={desk ? 2 : 1.6}
        strokeDasharray={shape.dash}
        opacity="0.55"
      />
      {square &&
        Array.from({ length: stripes }, (_, i) => (
          <rect
            key={i}
            x={zebraX}
            y={zebraY + (i * zebraH) / stripes + (zebraH / stripes) * 0.22}
            width={zebraW}
            height={(zebraH / stripes) * 0.56}
            className={`${palette.line} opacity-80`}
          />
        ))}
      <rect x="-700" y={shape.front[0]} width="2800" height={shape.front[1] - shape.front[0]} className={palette.walk} />
      <rect x="-700" y={shape.front[0]} width="2800" height="1.5" className="fill-slate-950/30" />
      {season === 0 && (
        <path
          d={`M-700 ${shape.walk[0]}H2100M-700 ${shape.front[1]}H2100`}
          className="fill-none stroke-slate-50/80"
          strokeWidth={desk ? 3 : 2}
          strokeDasharray={desk ? '40 6 22 4' : '26 4 14 3'}
          strokeLinecap="round"
        />
      )}

      <path d={shape.shade} className={`${palette.shade} opacity-55`} />

      {desk && water}
    </>
  );
}
