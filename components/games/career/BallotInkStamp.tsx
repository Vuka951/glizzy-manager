import { useId } from 'react';

const STAR =
  'M50 30L55.3 43.6L69.8 44.4L58.6 53.6L62.4 67.8L50 60L37.6 67.8L41.4 53.6L30.2 44.4L44.7 43.6Z';

// The issuing office's round rubber stamp, struck over the corner of a sheet:
// its name around the rim and a star in the middle, in the colour of the
// caller's text
export default function BallotInkStamp({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const rim = `ballotStamp${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`pointer-events-none mix-blend-multiply ${className}`}
    >
      <defs>
        <path id={rim} d="M50 50m-35 0a35 35 0 1 1 70 0a35 35 0 1 1-70 0" />
      </defs>
      <circle cx="50" cy="50" r="47.5" strokeWidth="2.4" className="fill-none stroke-current" />
      <circle cx="50" cy="50" r="44" strokeWidth="0.8" className="fill-none stroke-current" />
      <circle cx="50" cy="50" r="29" strokeWidth="1" className="fill-none stroke-current" />
      <text className="fill-current font-sign text-[11px] font-bold uppercase">
        <textPath href={`#${rim}`} textLength="216" lengthAdjust="spacing">
          {text}
        </textPath>
      </text>
      <path d={STAR} className="fill-current" />
    </svg>
  );
}
