export default function SirenGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 17v-5a6 6 0 0 1 12 0v5z" className="fill-red-500" />
      <path d="M12 6a6 6 0 0 1 6 6v5h-6z" className="fill-blue-500" />
      <rect x="4" y="17" width="16" height="3.5" rx="1" className="fill-slate-200" />
      <path d="M12 1.5v2.5M4.2 4.8l1.8 1.8M19.8 4.8 18 6.6" className="stroke-amber-200" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
