export default function WhiteFlagGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 2.5v19" className="stroke-amber-700" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 4q4-2 7 0t7 0v9q-4 2-7 0t-7 0z" className="fill-slate-100" />
    </svg>
  );
}
