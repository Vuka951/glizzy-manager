export default function BowlIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d="M3 12h18a9 9 0 0 1-18 0z" className="fill-amber-300" />
      <rect x="8" y="20" width="8" height="1.8" rx="0.9" className="fill-amber-400" />
      <path
        d="M8 8q1.2-2 0-4M12 9q1.2-2 0-4M16 8q1.2-2 0-4"
        className="fill-none stroke-slate-400"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
