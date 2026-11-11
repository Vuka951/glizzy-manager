// A bare bulb left hanging off its wire over an abandoned door. It is almost
// dead and stutters now and then
export default function TownFacadeBulb({ x, y, drop = 6 }: { x: number; y: number; drop?: number }) {
  return (
    <g>
      <path d={`M${x} ${y}q1.2 ${drop * 0.5} 0 ${drop}`} className="fill-none stroke-[#1f2937]" strokeWidth="0.7" />
      <g data-dying="">
        <circle cx={x} cy={y + drop + 2.4} r="6" className="fill-[#fde68a] opacity-25" />
        <circle cx={x} cy={y + drop + 2.4} r="2" className="fill-[#fef3c7]" />
      </g>
      <rect x={x - 1} y={y + drop - 0.4} width="2" height="1.4" className="fill-[#374151]" />
    </g>
  );
}
