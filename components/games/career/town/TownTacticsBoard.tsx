import { useRef } from 'react';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeTint } from '@/lib/utils/townFacade';

const CROWS = [
  { x: 9, speed: 1300 },
  { x: 25, speed: 1750 },
  { x: 41, speed: 1500 },
];

// The full coaching staff out on the lawn: the assistant coach at a chalkboard
// on an easel, taking an audience of crows on a log through the plan with a
// pointer. Abandoned, the coach and the crows are gone and the board is wiped
export default function TownTacticsBoard({ mode }: { mode: TownBuildingMode }) {
  const ref = useRef<SVGSVGElement>(null);
  const abandoned = mode === 'abandoned';
  useBuildingMotion(ref, mode);

  return (
    <svg
      ref={ref}
      viewBox="0 0 136 68"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="68" cy="65.4" rx="66" ry="2.6" className="fill-black opacity-25" />
      <path d="M86 50l-5 15M122 50l5 15M104 50v15" className="stroke-[#78350f]" strokeWidth="2.2" />
      <rect x="76" y="3" width="56" height="47" rx="1.5" className="fill-[#92400e]" />
      <rect x="79" y="6" width="50" height="41" className="fill-[#14532d]" />
      {!abandoned && (
        <g className="fill-none stroke-[#f8fafc]" strokeLinecap="round">
          <rect x="82.5" y="9.5" width="43" height="34" strokeWidth="0.7" opacity="0.65" />
          <path d="M104 9.5v34" strokeWidth="0.7" opacity="0.65" />
          <circle cx="104" cy="26.5" r="5" strokeWidth="0.7" opacity="0.65" />
          <path d="M87 15l4 4M91 15l-4 4M87 32l4 4M91 32l-4 4" strokeWidth="1.2" />
          <circle cx="118" cy="17" r="2.3" strokeWidth="1.2" />
          <circle cx="118" cy="36" r="2.3" strokeWidth="1.2" />
          <path d="M92 18q11 3 22-.5M112 15.5l2 2-2.4 1.5" strokeWidth="0.9" />
          <path d="M92 35q11-3 22 .5M111.6 33.5l2.4 1.5-2 2" strokeWidth="0.9" />
          <path d="M99 26.5q5-3.5 10 0-5 3.5-10 0z" className="fill-[#fbbf24] stroke-[#f8fafc]" strokeWidth="0.6" />
        </g>
      )}
      <rect x="76" y="49" width="56" height="2.4" className="fill-[#78350f]" />
      {!abandoned && (
        <>
          <g data-bob="1" data-speed="1600">
            <circle cx="66" cy="30" r="5.5" className="fill-[#e2b48a]" />
            <path d="M60.5 28a5.5 5 0 0 1 11 0z" className="fill-red-800" />
            <path d="M59.5 28.5h10" className="stroke-red-800" strokeWidth="1.4" />
            <path d="M59 64l1-28h12l1 28z" className="fill-red-700" />
            <path d="M61.5 37v27M70.5 37v27" className="stroke-slate-50" strokeWidth="1" />
            <path d="M62 37l4 6 4-6" className="fill-none stroke-slate-200" strokeWidth="0.8" />
            <circle cx="66" cy="45" r="1.2" className="fill-amber-300" />
          </g>
          <g
            data-swing="7"
            data-speed="1500"
            className="origin-left [transform-box:fill-box]"
          >
            <path d="M71 40l9-3" className="stroke-red-700" strokeWidth="3" strokeLinecap="round" />
            <path d="M80 37l17-13" className="stroke-[#fef3c7]" strokeWidth="1.2" strokeLinecap="round" />
          </g>
          <rect x="2" y="55" width="50" height="7" rx="3.5" className="fill-[#57341a]" />
          <path d="M6 58h6M20 60h8M36 57h9" className="stroke-[#3b2412]" strokeWidth="0.8" />
          {CROWS.map((crow) => (
            <g
              key={crow.x}
              transform={`translate(${crow.x} 0)`}
            >
              <g data-bob="1" data-speed={crow.speed}>
                <path d="M-2 55q-6-5-4-11 2-4 7-4 3 0 5 3l3 2-3 1q0 7-3 9z" className="fill-[#0f172a]" />
                <path d="M9 45l4 1-4 1z" className="fill-[#f59e0b]" />
                <circle cx="5.5" cy="43.6" r="0.8" className="fill-[#f8fafc]" />
                <path d="M-5 53l-4 3" className="stroke-[#0f172a]" strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>
          ))}
        </>
      )}
    </svg>
  );
}
