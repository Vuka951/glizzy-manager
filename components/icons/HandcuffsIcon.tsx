export default function HandcuffsIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle cx="7" cy="15" r="4.5" className="fill-none stroke-slate-300" strokeWidth="2.4" />
      <circle cx="17" cy="15" r="4.5" className="fill-none stroke-slate-300" strokeWidth="2.4" />
      <path d="M10 12q2 -3 4 0" className="fill-none stroke-slate-300" strokeWidth="2" />
      <rect x="5" y="8" width="4" height="3" rx="1" className="fill-slate-400" />
      <rect x="15" y="8" width="4" height="3" rx="1" className="fill-slate-400" />
    </svg>
  );
}
