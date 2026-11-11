import { STUDIO_ACCENTS } from '@/lib/constants/studioThemes';

const PETALS = [
  'left-[4%] top-[9%] rotate-12',
  'right-[5%] top-[22%] -rotate-45',
  'left-[2.5%] top-[48%] rotate-[70deg]',
  'right-[3%] top-[66%] rotate-6',
  'left-[9%] bottom-[5%] -rotate-12',
  'right-[11%] bottom-[8%] rotate-[120deg]',
];

const POCKETS = [
  '-left-2 -top-2',
  '-right-2 -top-2',
  '-bottom-2 -left-2',
  '-bottom-2 -right-2',
];

// The one thing each edition leaves on the table: icicles off the winter
// steel, drips off the blood-red lacquer, pockets in the summer pool felt,
// blossom on the aubergine velvet
export default function MatchTableTrim({
  theme,
  place,
}: {
  theme: number;
  place: 'felt' | 'apron';
}) {
  const edition = theme % STUDIO_ACCENTS.length;
  if (place === 'apron' && edition === 0) {
    return (
      <svg
        viewBox="0 0 120 8"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-3 top-full h-2.5 w-[calc(100%-1.5rem)]"
        aria-hidden="true"
      >
        <path
          d="M0 0h120l-2 3-2-3-3 6-3-6-2 2-2-2-4 7-3-7-2 3-3-3-2 2-2-2-3 5-3-5-2 2-2-2-4 8-3-8-2 2-2-2-2 3-2-3-3 6-3-6-2 2-2-2-4 6-3-6-2 3-2-3-3 5-3-5-2 2-2-2-4 7-3-7-2 3-3-3-2 2-2-2-3 6-3-6-2 2-2-2-4 6-3-6z"
          className="fill-[#e0f2fe]/80"
        />
      </svg>
    );
  }
  if (place === 'apron' && edition === 1) {
    return (
      <svg
        viewBox="0 0 120 10"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-6 top-full h-3 w-[calc(100%-3rem)]"
        aria-hidden="true"
      >
        <path
          d="M8 0h7v5a3.5 3.5 0 0 1-7 0zM37 0h4v8a2 2 0 0 1-4 0zM71 0h6v4a3 3 0 0 1-6 0zM101 0h4v8.5a2 2 0 0 1-4 0z"
          className="fill-[#b3122f]"
        />
      </svg>
    );
  }
  if (place === 'felt' && edition === 2) {
    return (
      <>
        {POCKETS.map((spot) => (
          <span
            key={spot}
            className={`absolute h-5 w-5 rounded-full bg-[#02140b] shadow-[inset_0_2px_3px_rgba(0,0,0,0.9),0_0_0_2px_rgba(110,71,33,0.7)] ${spot}`}
          />
        ))}
      </>
    );
  }
  if (place === 'felt' && edition === 3) {
    return (
      <>
        {PETALS.map((spot) => (
          <span
            key={spot}
            className={`absolute h-1.5 w-2.5 rounded-[60%_0] bg-[#f9a8d4]/75 ${spot}`}
          />
        ))}
      </>
    );
  }
  return null;
}
