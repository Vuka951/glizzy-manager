export default function HeartbreakIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M12 21S4 14.7 4 9.5C4 6.4 6.4 4 9.2 4c1.6 0 2.8 1 2.8 1s1.2-1 2.8-1C17.6 4 20 6.4 20 9.5c0 5.2-8 11.5-8 11.5z"
        className="fill-red-400"
      />
      <path
        d="M12 5.5 9.8 10l3.4 2.6-2.6 4.9"
        className="fill-none stroke-slate-950"
        strokeWidth="1.6"
      />
    </svg>
  );
}
