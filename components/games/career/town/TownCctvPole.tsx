import { useRef } from 'react';
import TownSecurityCamera from '@/components/games/career/town/TownSecurityCamera';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeTint } from '@/lib/utils/townFacade';

// The retainer's camera on a pole of its own over the street
export default function TownCctvPole({ mode }: { mode: TownBuildingMode }) {
  const ref = useRef<SVGSVGElement>(null);
  useBuildingMotion(ref, mode);

  return (
    <svg
      ref={ref}
      viewBox="0 0 34 84"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="25" cy="82.6" rx="6" ry="1.4" className="fill-black opacity-30" />
      <path d="M25 83V14" className="stroke-[#64748b]" strokeWidth="2.4" />
      <path d="M24.4 83V14" className="stroke-[#cbd5e1]/50" strokeWidth="0.7" />
      <g transform="translate(-186 -50)">
        <TownSecurityCamera mode={mode} />
      </g>
    </svg>
  );
}
