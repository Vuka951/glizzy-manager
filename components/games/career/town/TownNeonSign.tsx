import { FACADE_SIGN_AT } from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';

// A neon name in the building art: a soft halo stroked under crisp letters,
// brighter while the building is hovered. Shut for the night the tubes are
// off but clean, and flicker out when it closes on screen; on an abandoned
// building they are dead, dusty glass. `fit` squeezes a long name into its
// board whatever the font measures
export default function TownNeonSign({
  x,
  y,
  text,
  size,
  ink,
  halo,
  mode,
  buzz = false,
  tracking = 'tracking-[0.08em]',
  fit,
}: {
  x: number;
  y: number;
  text: string;
  size: number;
  ink: string;
  halo: string;
  mode: TownBuildingMode;
  buzz?: boolean;
  tracking?: string;
  fit?: number;
}) {
  const label = text.toUpperCase();
  const common = {
    x,
    y,
    textAnchor: 'middle' as const,
    fontSize: size,
    textLength: fit,
    lengthAdjust: fit ? ('spacingAndGlyphs' as const) : undefined,
  };
  const lit = (
    <>
      <text
        {...common}
        strokeWidth={size * 0.32}
        strokeLinejoin="round"
        className={`fill-none ${halo} ${tracking} opacity-40 transition-opacity group-hover/building:opacity-80`}
      >
        {label}
      </text>
      <text {...common} className={`${tracking} ${ink}`}>
        {label}
      </text>
    </>
  );
  if (mode === 'abandoned') {
    return (
      <text
        {...common}
        strokeWidth={size * 0.07}
        className={`font-black ${tracking} fill-[#1c212b] stroke-[#4b5262]`}
      >
        {label}
      </text>
    );
  }
  if (mode === 'shut') {
    return (
      <g className="font-black">
        <text {...common} className={`${tracking} fill-[#4b5568]`}>
          {label}
        </text>
        <g data-facade-off="" data-at={FACADE_SIGN_AT} className="opacity-0">
          {lit}
        </g>
      </g>
    );
  }
  return (
    <g data-buzz={buzz ? '' : undefined} className="font-black">
      {lit}
    </g>
  );
}
