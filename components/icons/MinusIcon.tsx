export default function MinusIcon({
  className = 'h-3 w-3',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
      focusable="false"
    >
      <path strokeLinecap="round" d="M20 12H4" />
    </svg>
  );
}
