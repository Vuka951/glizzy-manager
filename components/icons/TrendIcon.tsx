import type { GlizzyCall } from '@/data/games/careerGlizzflationBets';

const PATHS: Record<GlizzyCall, string> = {
  up: 'M3 17l5-5 4 4 9-9M14 7h7v7',
  flat: 'M3 12h18M16 8l5 4-5 4',
  down: 'M3 7l5 5 4-4 9 9M14 17h7v-7',
};

// The market's three moods, drawn like a ticker arrow
export default function TrendIcon({
  direction,
  className = 'h-4 w-4',
}: {
  direction: GlizzyCall;
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
      <path strokeLinecap="round" strokeLinejoin="round" d={PATHS[direction]} />
    </svg>
  );
}
