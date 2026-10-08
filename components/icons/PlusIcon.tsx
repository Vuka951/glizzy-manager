export default function PlusIcon({
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
      <path strokeLinecap="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
