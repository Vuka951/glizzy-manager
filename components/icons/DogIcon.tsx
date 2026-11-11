export default function DogIcon({
  className = 'h-5 w-5',
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M7.4 5C5 4.6 3 7.6 3.2 11.6c.1 1.8 1.6 2.4 2.7 1.3L8 8.2z"
        className="fill-current opacity-70"
      />
      <path
        d="M16.6 5c2.4-.4 4.4 2.6 4.2 6.6-.1 1.8-1.6 2.4-2.7 1.3L16 8.2z"
        className="fill-current opacity-70"
      />
      <path
        d="M12 4c-3.6 0-6 2.6-6 6.5 0 3 1.2 5 2.8 6.4.9 2.4 2 3.6 3.2 3.6s2.3-1.2 3.2-3.6c1.6-1.4 2.8-3.4 2.8-6.4C18 6.6 15.6 4 12 4z"
        className="fill-current"
      />
      <circle cx="9.6" cy="10" r="0.9" className="fill-slate-900" />
      <circle cx="14.4" cy="10" r="0.9" className="fill-slate-900" />
      <path d="M10.4 14.6h3.2L12 16.6z" className="fill-slate-900" />
    </svg>
  );
}
