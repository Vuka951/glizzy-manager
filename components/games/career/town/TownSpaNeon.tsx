import { FACADE_SIGN_AT } from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';

const GLYPH = 'M32.5 29.6a8.5 5.6 0 0 0 17 0M36.4 28q-1.6-1.8 0-3.6t0-3.6M41 28q-1.6-1.8 0-3.6t0-3.6M45.6 28q-1.6-1.8 0-3.6t0-3.6';

// The full spa card's neon up on the left slope of the roof, above the tub:
// the hot spring mark in pink tubes on a dark plate standing on two legs.
// Shut, the tubes go out with the other signs; abandoned, they are dead glass
export default function TownSpaNeon({ mode }: { mode: TownBuildingMode }) {
  const lit = (
    <>
      <circle cx="41" cy="29" r="15" className="fill-pink-400 opacity-15 transition-opacity group-hover/building:opacity-30" />
      <path
        d={GLYPH}
        strokeWidth="3.6"
        strokeLinecap="round"
        className="fill-none stroke-pink-400 opacity-45 transition-opacity group-hover/building:opacity-80"
      />
      <path d={GLYPH} strokeWidth="1.3" strokeLinecap="round" className="fill-none stroke-pink-100" />
    </>
  );
  return (
    <g>
      <path d="M33 37v10.4M49 37v4.2" className="stroke-[#334155]" strokeWidth="1.4" />
      <rect x="29" y="19.6" width="24" height="18.2" rx="2.4" className="fill-[#1c1917]" />
      {mode === 'abandoned' ? (
        <path d={GLYPH} strokeWidth="1.3" strokeLinecap="round" className="fill-none stroke-[#4b5262]" />
      ) : mode === 'shut' ? (
        <>
          <path d={GLYPH} strokeWidth="1.3" strokeLinecap="round" className="fill-none stroke-[#57534e]" />
          <g data-facade-off="" data-at={FACADE_SIGN_AT} className="opacity-0">
            {lit}
          </g>
        </>
      ) : (
        <g data-buzz="">{lit}</g>
      )}
    </g>
  );
}
