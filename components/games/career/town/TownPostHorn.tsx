// The post horn, the post office's mark on its plate, stamps and plain seals
export default function TownPostHorn({
  className = 'h-5 w-5',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 8.5h14.5" />
      <circle cx="9.5" cy="13" r="4.5" />
      <path d="M17 6.5 21.5 4v9L17 10.5z" fill="currentColor" />
    </svg>
  );
}
