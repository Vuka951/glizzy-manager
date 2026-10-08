export default function MusicNotesIcon({
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
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V6l10-2v12M9 18a2.5 2.5 0 1 1-5 1 2.5 2.5 0 0 1 5-1Zm10-2a2.5 2.5 0 1 1-5 1 2.5 2.5 0 0 1 5-1Z" />
    </svg>
  );
}
