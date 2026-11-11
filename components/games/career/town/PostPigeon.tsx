export type PigeonPerch = { x: number; flip: boolean; bob: string; tone: string };

export default function PostPigeon({ x, flip, bob, tone }: PigeonPerch) {
  return (
    <g transform={`translate(${x} 0)${flip ? ' scale(-1 1)' : ''}`}>
      <g className={`[transform-box:fill-box] ${bob}`}>
        <ellipse cx="0" cy="31" rx="6" ry="4.5" className={tone} />
        <path d="M-6 30l-4 3 4 1z" className={tone} />
        <circle cx="4" cy="26.5" r="3" className={tone} />
        <circle cx="5" cy="26" r="0.7" className="fill-[#0b0f19]" />
        <path d="M6.5 26.5l3 1-3 1z" className="fill-[#f59e0b]" />
        <path d="M-1 29q3 3 6 0" className="fill-none stroke-[#6b7280]" strokeWidth="0.8" />
        <rect x="-4" y="31" width="7" height="5" className="fill-[#f8fafc] stroke-[#b91c1c]" strokeWidth="0.8" />
        <path d="M-4 31l3.5 2.5 3.5-2.5" className="fill-none stroke-[#b91c1c]" strokeWidth="0.6" />
      </g>
    </g>
  );
}
