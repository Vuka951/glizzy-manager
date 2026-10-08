import EggplantIcon from '@/components/icons/EggplantIcon';
import SunIcon from '@/components/icons/SunIcon';

// The season at a glance, in calendar order: a snowflake for the winter
// issue, the eggplant for spring, the sun for summer and a drop of blood for
// the autumn cup
export default function SeasonGlyph({
  season,
  className = 'h-5 w-5',
}: {
  season: number;
  className?: string;
}) {
  if (season === 1) return <EggplantIcon className={className} />;
  if (season === 2) return <SunIcon className={`${className} text-amber-500`} />;
  if (season === 3) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M12 2.5c3.2 5 6.5 8.6 6.5 12.4a6.5 6.5 0 0 1-13 0C5.5 11.1 8.8 7.5 12 2.5z"
          className="fill-red-700"
        />
        <path
          d="M9.2 14.2c0 1.9 1 3.2 2.4 3.6"
          className="fill-none stroke-red-300"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g
        className="stroke-sky-600"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5" />
        <path d="M12 2.5l-2.4 2.4M12 2.5l2.4 2.4M12 21.5l-2.4-2.4M12 21.5l2.4-2.4" />
        <path d="M3.8 7.25l3.3-.9M3.8 7.25l.9 3.3M20.2 16.75l-3.3.9M20.2 16.75l-.9-3.3" />
        <path d="M3.8 16.75l3.3.9M3.8 16.75l.9-3.3M20.2 7.25l-3.3-.9M20.2 7.25l-.9 3.3" />
      </g>
    </svg>
  );
}
