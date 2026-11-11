export default function TownBird({ x, y, size, tone }: { x: number; y: number; size: number; tone: string }) {
  return (
    <path
      data-flap
      d={`M${x} ${y}q${5 * size} ${-6 * size} ${10 * size} 0q${5 * size} ${-6 * size} ${10 * size} 0`}
      className={`origin-center fill-none [transform-box:fill-box] ${tone}`}
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
}
