export default function PukeGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="11" cy="9.5" r="7.5" className="fill-lime-300" />
      <path d="M7.3 7.6l2 1.2M14.7 7.6l-2 1.2" className="stroke-slate-800" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="11" cy="13" rx="2.4" ry="1.8" className="fill-slate-800" />
      <path d="M10 14q1 5 6 7.5 4 .9 6-.6-3.5-.4-6-3.5-1.5-2-2.6-3.4z" className="fill-lime-500" />
    </svg>
  );
}
