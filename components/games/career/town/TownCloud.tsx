export default function TownCloud({ x, y, scale, tone }: { x: number; y: number; scale: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g data-cloud>
        <ellipse cx="0" cy="0" rx="46" ry="14" className={tone} />
        <ellipse cx="30" cy="-8" rx="28" ry="13" className={tone} />
        <ellipse cx="-30" cy="-6" rx="24" ry="11" className={tone} />
        <ellipse cx="0" cy="-8" rx="38" ry="9" className="fill-slate-100/5" />
      </g>
    </g>
  );
}
