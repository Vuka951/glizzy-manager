// The one small lamp left burning over a door once a building has shut. With
// `drop` (the distance down to the pavement) it washes the wall below in warm
// light and leaves a pool on the ground, so the shut front keeps its shape
export default function TownFacadeLamp({
  x,
  y,
  r = 1.6,
  drop = 0,
}: {
  x: number;
  y: number;
  r?: number;
  drop?: number;
}) {
  const base = y + drop;
  return (
    <g>
      {drop > 0 && (
        <>
          <path
            d={`M${x - r} ${y + r}L${x - r * 6.5} ${base}H${x + r * 6.5}L${x + r} ${y + r}z`}
            className="fill-[#fbbf24] opacity-[0.17]"
          />
          <ellipse cx={x} cy={base} rx={r * 8} ry={r * 1.5} className="fill-[#fcd34d] opacity-35" />
        </>
      )}
      <circle cx={x} cy={y + r} r={r * 4.6} className="fill-[#fde68a] opacity-25" />
      <rect x={x - r * 1.3} y={y - r * 0.6} width={r * 2.6} height={r * 0.8} rx={r * 0.3} className="fill-[#1f2937]" />
      <circle cx={x} cy={y + r * 0.6} r={r} className="fill-[#fde047]" />
    </g>
  );
}
