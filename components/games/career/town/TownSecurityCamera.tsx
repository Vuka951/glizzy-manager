import type { TownBuildingMode } from '@/lib/types/town';

// A CCTV camera on the house's front corner, panning slowly over the street
// with its red light blinking. Only the panning and the light stop when the
// house shuts; abandoned, the light is dead
export default function TownSecurityCamera({ mode }: { mode: TownBuildingMode }) {
  return (
    <g>
      <path d="M207 60h4v8h-4z" className="fill-[#334155]" />
      <path d="M208 64h-4" className="stroke-[#475569]" strokeWidth="1.6" />
      <g data-swing="10" data-speed="3200" className="origin-right [transform-box:fill-box]">
        <path d="M193 61.2l12-1.4v7l-12-1.4z" className="fill-[#e2e8f0]" />
        <path d="M193 61.2l12-1.4v1.8l-12 1.2z" className="fill-[#f8fafc]" />
        <rect x="190.4" y="60.8" width="3.2" height="5" rx="0.8" className="fill-[#1e293b]" />
        <circle cx="190.8" cy="63.3" r="1.1" className="fill-[#0ea5e9] opacity-70" />
        <circle
          cx="202"
          cy="62.6"
          r="0.9"
          data-blink="1600"
          className={mode === 'abandoned' ? 'fill-[#3f3f46]' : 'fill-red-500'}
        />
      </g>
    </g>
  );
}
