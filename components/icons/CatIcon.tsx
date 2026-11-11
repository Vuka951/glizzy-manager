export default function CatIcon({
  className = 'h-5 w-5',
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M7 21c-.6-4.6.6-8.2 3.4-9.6h3.2c2.8 1.4 4 5 3.4 9.6z"
        className="fill-current"
      />
      <path
        d="M16.6 20.6c3 .2 4.8-1.4 4.2-4.6"
        className="fill-none stroke-current"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8.2 3.6l2.4 2.6h2.8l2.4-2.6.4 5.6a4.2 4.2 0 0 1-8.4 0z"
        className="fill-current"
      />
      <circle cx="10.4" cy="9" r="0.85" className="fill-slate-900" />
      <circle cx="13.6" cy="9" r="0.85" className="fill-slate-900" />
    </svg>
  );
}
