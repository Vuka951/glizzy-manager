// A dead window on an abandoned building: dark grimy glass, and depending on
// the seed a crack running across it, a shard knocked out of a corner, a
// streak of grime, or nothing but the dark
export default function TownFacadeBrokenPane({
  x,
  y,
  w,
  h,
  seed = 0,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  seed?: number;
}) {
  const kind = seed % 4;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} className="fill-[#161a22]" />
      <rect x={x} y={y + h * 0.62} width={w} height={h * 0.38} className="fill-[#2a2a24] opacity-60" />
      {kind === 0 && (
        <path
          d={`M${x + w * 0.18} ${y}l${w * 0.14} ${h * 0.34}l${-w * 0.08} ${h * 0.2}l${w * 0.22} ${h * 0.46}M${x + w * 0.3} ${y + h * 0.36}l${w * 0.4} ${-h * 0.12}l${w * 0.3} ${h * 0.2}`}
          className="fill-none stroke-[#7c8494]"
          strokeWidth={Math.max(0.5, w * 0.03)}
          strokeLinejoin="round"
        />
      )}
      {kind === 1 && (
        <>
          <path
            d={`M${x + w} ${y}h${-w * 0.46}l${w * 0.12} ${h * 0.22}l${w * 0.12} ${-h * 0.06}l${w * 0.06} ${h * 0.3}l${w * 0.16} ${h * 0.12}z`}
            className="fill-[#05070a]"
          />
          <path
            d={`M${x + w * 0.54} ${y}l${w * 0.12} ${h * 0.22}l${w * 0.12} ${-h * 0.06}l${w * 0.06} ${h * 0.3}l${w * 0.16} ${h * 0.12}`}
            className="fill-none stroke-[#8b93a3]"
            strokeWidth={Math.max(0.5, w * 0.025)}
            strokeLinejoin="round"
          />
        </>
      )}
      {kind === 2 && (
        <path
          d={`M${x} ${y + h * 0.2}l${w} ${h * 0.6}`}
          className="stroke-[#3a3f4a]"
          strokeWidth={Math.max(0.6, h * 0.05)}
        />
      )}
    </g>
  );
}
