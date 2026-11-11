export default function ParliamentBanner({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <path
        d={`M${x + 4} 94v38M${x + 66} 94v38`}
        className="stroke-[#57534e]"
        strokeWidth="1"
      />
      <rect x={x} y="132" width="70" height="21" className="fill-[#b91c1c]" />
      <rect x={x} y="132" width="70" height="3" className="fill-[#7f1d1d]" />
      <text
        x={x + 35}
        y="148"
        textAnchor="middle"
        fontSize="14"
        letterSpacing="2"
        className="fill-[#ffffff] font-sans font-black"
      >
        {label}
      </text>
    </g>
  );
}
