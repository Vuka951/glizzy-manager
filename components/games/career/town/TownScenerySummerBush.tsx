export default function TownScenerySummerBush({ variant }: { variant: number }) {
  if (variant === 1) {
    return (
      <>
        {[-9, 0, 9].map((sx, i) => (
          <g key={sx} transform={`translate(${sx} 0)`}>
            <path d={`M0 0V${-20 - i * 4}`} className="stroke-[#3f7a2f]" strokeWidth="1.8" />
            <path d={`M0 ${-10 - i}q-6-2-7-6q5 0 7 4`} className="fill-[#4f8f3a]" />
            <circle cx="0" cy={-22 - i * 4} r="5" className="fill-[#f2b632]" />
            <circle cx="0" cy={-22 - i * 4} r="2.2" className="fill-[#6b3d1f]" />
          </g>
        ))}
      </>
    );
  }
  if (variant === 2) {
    return (
      <path
        d="M-10 0q-2-10-7-14M-5 0q-1-12 1-18M0 0q1-12 6-17M5 0q2-9 8-12M-14 0q-3-6-9-8"
        className="fill-none stroke-[#e8c15a]"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    );
  }
  return (
    <>
      <ellipse cx="-8" cy="-7" rx="11" ry="8" className="fill-[#2c6a36]" />
      <ellipse cx="7" cy="-9" rx="13" ry="10" className="fill-[#3f8a3a]" />
      <ellipse cx="0" cy="-3" rx="18" ry="5" className="fill-[#245a2a]" />
      <circle cx="-6" cy="-12" r="1.8" className="fill-[#f6d27a]" />
      <circle cx="6" cy="-15" r="1.8" className="fill-[#f8f1d8]" />
      <circle cx="13" cy="-9" r="1.6" className="fill-[#f6d27a]" />
    </>
  );
}
