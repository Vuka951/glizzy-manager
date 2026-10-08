import { GAMES_UI } from '@/data/games/locale';

// Scent rolling off the spot the trained nose caught, aimed at whoever
// smelled it: waves climb toward the top seat and fall toward the bottom one
export default function SniffScent({
  direction,
  className = '',
}: {
  direction: 'up' | 'down';
  className?: string;
}) {
  return (
    <span
      className={`pointer-events-none absolute z-20 ${className}`}
      title={GAMES_UI.cup.viewer.sniffSpot}
    >
      <svg
        viewBox="0 0 32 20"
        className={`h-5 w-8 drop-shadow-[0_0_4px_rgba(163,230,53,0.6)] ${
          direction === 'down' ? '-scale-y-100' : ''
        }`}
        aria-hidden="true"
      >
        <path
          d="M11 17q5-4 10 0"
          className="animate-pulse fill-none stroke-lime-200 motion-reduce:animate-none"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M7 11.5q9-7 18 0"
          className="animate-pulse fill-none stroke-lime-300/80 [animation-delay:150ms] motion-reduce:animate-none"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M3 6q13-9 26 0"
          className="animate-pulse fill-none stroke-lime-300/50 [animation-delay:300ms] motion-reduce:animate-none"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
