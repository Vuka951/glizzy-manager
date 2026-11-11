import { useRef } from 'react';
import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeTint } from '@/lib/utils/townFacade';

// The retainer's guard booth out on the square: a lit window with a guard in
// it and a blue lamp on the roof. Abandoned, the glass is broken and the lamp dead
export default function TownGuardBooth({ mode }: { mode: TownBuildingMode }) {
  const ref = useRef<SVGSVGElement>(null);
  const abandoned = mode === 'abandoned';
  useBuildingMotion(ref, mode);

  return (
    <svg
      ref={ref}
      viewBox="122 160 34 50"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="139" cy="208.4" rx="15" ry="1.6" className="fill-black opacity-30" />
      {!abandoned && (
        <circle cx="139" cy="182" r="14" className="fill-amber-200 opacity-20" />
      )}
      <rect x="126" y="166" width="26" height="5" className="fill-slate-700" />
      <rect x="128" y="171" width="22" height="37" className="fill-slate-900" />
      <rect x="128" y="196" width="22" height="3" className="fill-amber-400" />
      {abandoned ? (
        <TownFacadeBrokenPane x={131} y={175} w={16} h={13} seed={1} />
      ) : (
        <>
          <rect x="131" y="175" width="16" height="13" className="fill-amber-300 opacity-90" />
          <path d="M134 188q5-6 10 0z" className="fill-slate-950" />
          <circle cx="139" cy="183" r="3" className="fill-slate-950" />
          <path d="M134.6 181h8.8l-1.6-2.8h-5.6z" className="fill-slate-950" />
        </>
      )}
      <rect
        x="137"
        y="162"
        width="4"
        height="4"
        rx="1"
        data-blink="2400"
        className={abandoned ? 'fill-[#1e293b]' : 'fill-sky-400'}
      />
    </svg>
  );
}
