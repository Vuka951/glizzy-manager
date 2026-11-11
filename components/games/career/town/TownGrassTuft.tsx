export default function TownGrassTuft({ x, y, scale, season }: { x: number; y: number; scale: number; season: number }) {
  if (season === 0) {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <ellipse cx="0" cy="0" rx="14" ry="4" className="fill-slate-100/45" />
        <ellipse cx="8" cy="-1.5" rx="7" ry="2.5" className="fill-slate-100/60" />
      </g>
    );
  }
  if (season === 3) {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <path d="M-8 0q3-4 6 0q-3 2-6 0z" className="fill-amber-500/60" />
        <path d="M2 2q3-4 6 0q-3 2-6 0z" className="fill-red-700/60" />
        <path d="M-2 -3q3-4 6 0q-3 2-6 0z" className="fill-orange-600/50" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M-6 0q-1-6-4-9M-2 0q0-7 1-11M2 0q1-6 5-9M6 0q1-4 4-6"
        className={`fill-none ${season === 1 ? 'stroke-[#2f7a4f]/70' : 'stroke-[#9a8a52]/60'}`}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {season === 1 && <circle cx="-1" cy="-11" r="1.6" className="fill-pink-300/80" />}
    </g>
  );
}
