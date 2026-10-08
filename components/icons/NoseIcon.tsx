export default function NoseIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M12 3c0 6-5 8-5 13a5 5 0 0 0 10 0c0-5-5-7-5-13z"
        className="fill-current"
      />
      <circle cx="10" cy="17" r="1.3" className="fill-slate-900" />
      <circle cx="14" cy="17" r="1.3" className="fill-slate-900" />
    </svg>
  );
}
