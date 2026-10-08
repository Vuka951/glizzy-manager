export default function CrownIcon({
  className = 'h-5 w-5',
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M3 8.5 7.2 12 12 5l4.8 7L21 8.5 19.4 18H4.6Z"
        className="fill-current"
      />
      <rect
        x="4.6"
        y="19"
        width="14.8"
        height="2"
        rx="1"
        className="fill-current"
      />
      <circle cx="3" cy="8" r="1.4" className="fill-current" />
      <circle cx="12" cy="4.4" r="1.4" className="fill-current" />
      <circle cx="21" cy="8" r="1.4" className="fill-current" />
    </svg>
  );
}
