export default function HeartIcon({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M12 21S4 14.7 4 9.5C4 6.4 6.4 4 9.2 4c1.6 0 2.8 1 2.8 1s1.2-1 2.8-1C17.6 4 20 6.4 20 9.5c0 5.2-8 11.5-8 11.5z"
        className="fill-current"
      />
    </svg>
  );
}
