const STROKES = [
  'M1 9c3-8 5-8 4-1s3-7 6-6-2 7 1 6 4-5 7-4 3 3 6 1',
  'M1 6c2 4 4 4 5-1s2 6 4 5 1-6 4-6-1 7 3 6 6-3 7-6',
  'M2 8c1-6 3-7 3-2 0 4 3-6 5-5s0 6 3 5 3-6 5-4 1 5 5 1',
];

// A man's name in a hurried scrawl, drawn in when the scene's ink move
// reaches it, or already dry on a page signed off screen
export default function CoalitionSignature({
  stroke = 0,
  className = '',
  drawn = false,
  animDelay,
  animDuration,
}: {
  stroke?: number;
  className?: string;
  drawn?: boolean;
  animDelay?: number;
  animDuration?: number;
}) {
  return (
    <svg
      viewBox="0 0 26 12"
      aria-hidden="true"
      data-anim={drawn ? undefined : 'ink'}
      data-anim-delay={animDelay}
      data-anim-duration={animDuration}
      className={`absolute ${drawn ? '' : '[clip-path:inset(0_100%_0_0)]'} ${className}`}
    >
      <path
        d={STROKES[stroke % STROKES.length]}
        className="fill-none stroke-blue-800"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
