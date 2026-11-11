// A cobweb strung across the top corner of a window or door, `flip` for the
// right hand corner
export default function TownFacadeCobweb({
  x,
  y,
  r,
  flip = false,
}: {
  x: number;
  y: number;
  r: number;
  flip?: boolean;
}) {
  const rings = [0.4, 0.7, 1].map((k) => {
    const d = r * k;
    return `M${d} 0q${-d * 0.18} ${d * 0.42} ${-d * 0.3} ${d * 0.52}q${-d * 0.02} ${d * 0.4} ${-d * 0.7} ${d * 0.48}`;
  });
  return (
    <g
      transform={`translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}`}
      className="fill-none stroke-[#d4d4d8]"
      strokeWidth="0.45"
      opacity="0.55"
    >
      <path d={`M0 0L${r} 0M0 0L${r * 0.7} ${r * 0.52}M0 0L${r * 0.3} ${r * 0.9}M0 0L0 ${r}`} />
      {rings.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  );
}
