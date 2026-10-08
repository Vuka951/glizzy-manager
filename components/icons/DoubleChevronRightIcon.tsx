export default function DoubleChevronRightIcon({
  className = 'h-3.5 w-3.5',
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l7 7-7 7M13 5l7 7-7 7" />
    </svg>
  );
}
