// The filled wedge reaches into the pill and hides the border under it, while
// the stroke starts at the point where the edges cross the pill outline so no
// line runs across the inside
export default function BubbleTail({
  side,
  className = '',
}: {
  side: 'left' | 'right';
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 10 12"
      aria-hidden="true"
      className={`absolute top-1/2 h-3 w-2.5 -translate-y-1/2 ${
        side === 'left' ? '-left-1.5' : '-right-1.5 -scale-x-100'
      } ${className}`}
    >
      <path d="M10 0 L1 6 L10 12Z" className="stroke-none" />
      <path d="M6.8 2.2 L1 6 L6.8 9.8" className="fill-none" strokeWidth="1" />
    </svg>
  );
}
