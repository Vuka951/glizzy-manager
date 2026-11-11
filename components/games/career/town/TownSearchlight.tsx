import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import { FACADE_SIGN_AT } from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';

// The full retainer's searchlight on the right slope of the roof, its beam
// sweeping slowly back and forth over the night sky. Shut, the beam goes out
// with the signs and the lamp stays dark
export default function TownSearchlight({ mode }: { mode: TownBuildingMode }) {
  const off = mode !== 'open';
  return (
    <g>
      <g data-swing="20" data-speed="5600" className="origin-bottom [transform-box:fill-box]">
        <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
          <path
            d="M137.4 20L118 -78h46L142.6 20z"
            className="fill-[#e0f2fe] opacity-[0.12] transition-opacity group-hover/building:opacity-20"
          />
          <path d="M139 20L133 -78h14L141 20z" className="fill-[#f8fafc] opacity-[0.12]" />
        </TownFacadeLit>
        <path d="M135.4 24.4l1.2-6.4h6.8l1.2 6.4z" className="fill-[#1e293b]" />
        <rect x="136.2" y="16.6" width="7.6" height="2.2" rx="1" className={off ? 'fill-[#475569]' : 'fill-[#f8fafc]'} />
      </g>
      <path d="M134 29.6l2-5.2h8l2 5.2z" className="fill-[#334155]" />
    </g>
  );
}
