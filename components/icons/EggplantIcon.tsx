export default function EggplantIcon({
  className = 'h-10 w-10',
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <path
        d="M22 52 C12 44 14 28 26 19 C34 13 44 12 50 16 C56 20 56 30 50 40 C43 51 30 58 22 52 Z"
        className="fill-purple-500"
      />
      <path
        d="M24 47 C19 42 21 32 29 26"
        className="fill-none stroke-purple-400"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M46 18 C48 12 52 8 58 6 C56 12 54 16 50 19 Z"
        className="fill-green-400"
      />
      <path
        d="M42 22 q6 -4 12 -2 M44 15 q4 5 3 9"
        className="fill-none stroke-green-400"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
