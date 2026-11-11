import { useRef } from 'react';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import { GAMES_UI } from '@/data/games/locale';
import type { TownBuildingMode } from '@/lib/types/town';

const SIGN = GAMES_UI.career.town.signs.flowerVan;

// A flower delivery van nobody believes: a dish and a blinking whip antenna on
// the roof, facing right
export default function TownSpyVanArt({ mode }: { mode: TownBuildingMode }) {
  const artRef = useRef<SVGSVGElement>(null);
  const lit = mode === 'open';
  useBuildingMotion(artRef, mode);

  return (
    <svg
      ref={artRef}
      viewBox="0 0 90 52"
      className="h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <ellipse cx="45" cy="50" rx="43" ry="2.4" className="fill-black opacity-35" />
      <path d="M44 16V2" className="stroke-[#94a3b8]" strokeWidth="0.9" />
      <circle
        cx="44"
        cy="1.8"
        r="1.5"
        data-blink="1400"
        className={lit ? 'fill-red-500' : 'fill-[#52525b]'}
      />
      <path d="M26 16v-5" className="stroke-[#64748b]" strokeWidth="1.6" />
      <g transform="rotate(-24 26 9)">
        <path d="M17 7a9 4.4 0 0 0 18 0z" className="fill-[#e2e8f0]" />
        <path d="M17 7h18" className="stroke-[#94a3b8]" strokeWidth="0.7" />
        <path d="M26 7V2" className="stroke-[#64748b]" strokeWidth="0.8" />
      </g>
      <path d="M3 18q0-2 2-2h54q2 0 2 2v28H3z" className="fill-[#f1f5f9]" />
      <path d="M61 22h13q3 0 5 3l7 11q1 2 1 4v6H61z" className="fill-[#e2e8f0]" />
      <path d="M65 26h9q2 0 3 2l5 8H65z" className={lit ? 'fill-[#1e3a5f]' : 'fill-[#0f172a]'} />
      <rect x="3" y="39" width="84" height="3" className="fill-[#db2777]" />
      <rect x="6" y="20" width="14" height="10" rx="1" className="fill-[#0b1220]" />
      <text
        x="39"
        y="29"
        textAnchor="middle"
        className="fill-[#be185d] font-sign text-[10px] font-bold uppercase tracking-[0.04em]"
      >
        {SIGN}
      </text>
      <path d="M34 37q-1-3 0-5" className="fill-none stroke-[#15803d]" strokeWidth="1" />
      <g className="fill-[#ec4899]">
        <circle cx="34" cy="31.4" r="1.2" />
        <circle cx="31.8" cy="33" r="1.2" />
        <circle cx="36.2" cy="33" r="1.2" />
      </g>
      <circle cx="34" cy="32.6" r="0.9" className="fill-[#fde047]" />
      <path d="M84 42h4v4h-4z" className={lit ? 'fill-[#fde68a]' : 'fill-[#475569]'} />
      <g>
        <circle cx="18" cy="46" r="5.4" className="fill-[#0f172a]" />
        <circle cx="18" cy="46" r="2.2" className="fill-[#94a3b8]" />
        <circle cx="72" cy="46" r="5.4" className="fill-[#0f172a]" />
        <circle cx="72" cy="46" r="2.2" className="fill-[#94a3b8]" />
      </g>
    </svg>
  );
}
