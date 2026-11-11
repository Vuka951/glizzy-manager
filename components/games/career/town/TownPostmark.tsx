import { useId } from 'react';
import { GAMES_UI } from '@/data/games/locale';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt } from '@/lib/utils/format';

const YEAR = GAMES_UI.career.report.yearShort;

// The round date stamp the counter cancels a letter with: the edition it
// was posted in around the rim, the year in the middle, and the wavy
// cancel lines trailing off to the right. Inks in currentColor
export default function TownPostmark({
  season,
  year,
  className = '',
}: {
  season: number;
  year: number;
  className?: string;
}) {
  const rim = useId();
  return (
    <svg
      viewBox="0 0 72 44"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="22" cy="22" r="20" strokeWidth="1.6" />
      <circle cx="22" cy="22" r="11.5" strokeWidth="0.9" />
      <path id={rim} d="M22 37a15 15 0 1 1 0-30a15 15 0 1 1 0 30" />
      <text
        fill="currentColor"
        stroke="none"
        fontSize="5.4"
        fontWeight="800"
        letterSpacing="0.6"
      >
        <textPath href={`#${rim}`} startOffset="50%" textAnchor="middle">
          {seasonName(season).toUpperCase()}
        </textPath>
      </text>
      <text
        x="22"
        y="24"
        fill="currentColor"
        stroke="none"
        fontSize="6"
        fontWeight="900"
        textAnchor="middle"
      >
        {fmt(YEAR, { year })}
      </text>
      <path
        d="M44 14q4-3 7 0t7 0 7 0 6 0M44 22q4-3 7 0t7 0 7 0 6 0M44 30q4-3 7 0t7 0 7 0 6 0"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
