export default function TownSceneryEggplant({ x, y, r, flip }: { x: number; y: number; r: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})${flip ? ' scale(-1 1)' : ''}`}>
      <path d="M-2 -1c-9 0-12 7-9 11c3 4 11 3 15-3c3-5 1-8-6-8z" className="fill-[#5b2a86]" />
      <path d="M-7 3c2-3 5-3 7-2" className="fill-none stroke-[#a77bd6]/70" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M-2 -1l3-4 1 3 3-1-2 3 3 1-4 1z" className="fill-[#3f8f5a]" />
    </g>
  );
}
