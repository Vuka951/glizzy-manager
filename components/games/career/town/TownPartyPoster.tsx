import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import { FACADE_SHUTTER_AT } from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';

// The Red Party's poster pasted on the TV studio wall while the party is in
// government: the party emblem on a red field on a paper sheet, taped at the top corners. The
// door light catches it while the studio is open; shut, it sits in the dark;
// abandoned, it is faded with the lower corner torn off and a flap peeling.
// The torn patch is painted in the studio's wall colour, so it only works on
// that wall
export default function TownPartyPoster({
  x,
  y,
  w,
  h,
  mode,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  mode: TownBuildingMode;
}) {
  const abandoned = mode === 'abandoned';
  const right = x + w;
  const bottom = y + h;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g transform={`rotate(-2.5 ${cx} ${cy})`}>
      <rect x={x + 0.8} y={y + 1} width={w} height={h} className="fill-[#020617] opacity-40" />
      <rect x={x} y={y} width={w} height={h} className="fill-[#f5f1e6]" />
      <g className={abandoned ? 'opacity-60' : ''}>
        <rect x={x + 1.4} y={y + 1.4} width={w - 2.8} height={h - 6} className="fill-[#b91c1c]" />
        <svg x={x + 1.4} y={y + 1.4} width={w - 2.8} height={h - 6} viewBox="0 0 24 24">
          <SponsorEmblem sponsorId="red" className="h-full w-full" />
        </svg>
      </g>
      <rect x={x + 1.4} y={bottom - 4} width={w - 2.8} height={2.6} className="fill-[#b91c1c]" />
      <rect x={x + 1.4} y={bottom - 3.1} width={w - 2.8} height={0.8} className="fill-[#fef2f2]" />
      <path
        d={`M${x - 1.5} ${y + 1.6}l5 -2.4M${right - 3.5} ${y - 0.8}l5 2.4`}
        className="stroke-[#e7dcc0] opacity-80"
        strokeWidth="2.2"
      />
      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          className="fill-[#fef3c7] opacity-15 transition-opacity group-hover/building:opacity-25"
        />
      </TownFacadeLit>
      {mode === 'shut' && (
        <rect x={x} y={y} width={w} height={h} className="fill-[#020617] opacity-55" />
      )}
      {abandoned && (
        <>
          <path
            d={`M${right + 1} ${bottom - 14}L${right - 3} ${bottom - 11.5} ${right - 2} ${bottom - 8.5} ${right - 6.5} ${bottom - 6.5} ${right - 5} ${bottom - 3.5} ${right - 10} ${bottom - 2} ${right - 9.5} ${bottom + 1}H${right + 1}z`}
            className="fill-slate-700"
          />
          <path
            d={`M${right - 10} ${bottom - 2}l-3.4 3.2 4 -0.6z`}
            className="fill-[#d6cfbd]"
          />
          <path d={`M${x + 4} ${y + 6}l9 7M${x + 9} ${y + 4}l4 4`} className="stroke-[#0f172a] opacity-40" strokeWidth="0.7" />
        </>
      )}
    </g>
  );
}
