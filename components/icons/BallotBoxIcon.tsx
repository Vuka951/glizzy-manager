export default function BallotBoxIcon({
  className = 'h-5 w-5',
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <rect x="6" y="9" width="12" height="2.5" rx="1" className="fill-slate-950" />
      <g transform="rotate(-10 12 6)">
        <rect x="8.5" y="1.5" width="7" height="9.5" rx="0.8" className="fill-slate-100" />
        <path d="M10 5.5l1.6 1.6 2.6-3" className="fill-none stroke-red-500" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M3 11h18v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20.5z" fill="currentColor" />
      <rect x="3" y="14.5" width="18" height="1.6" className="fill-slate-950/40" />
    </svg>
  );
}
