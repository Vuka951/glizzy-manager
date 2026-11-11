export default function StopwatchGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="10" y="1" width="4" height="2.5" rx="1" className="fill-slate-300" />
      <circle cx="12" cy="13.5" r="9" className="fill-slate-200" />
      <circle cx="12" cy="13.5" r="7.2" className="fill-red-600" />
      <path d="M12 13.5V8.5M12 13.5l3.5 2" className="stroke-slate-100" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
