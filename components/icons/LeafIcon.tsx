export default function LeafIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M20 4C10 4 4 10 4 19c9 0 15-6 16-15z"
        className="fill-current"
      />
      <path d="M6 18C9 13 13 9 18 6" className="fill-none stroke-slate-900" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
