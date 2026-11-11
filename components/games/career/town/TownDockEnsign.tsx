import { useId } from 'react';
import TownFlagCloth from '@/components/games/career/town/TownFlagCloth';
import type { TownBuildingMode } from '@/lib/types/town';

// The Green Party's ensign on a staff at the yacht's stern while the party is in
// government. It flies right with the masthead pennant, over the aft deck,
// so nothing hangs past the stern into the TV van on phone. It waves through
// the building motion (`data-wave`), so it rests with the yacht shut, on the
// lite level and under reduced motion; abandoned, it hangs faded and torn
export default function TownDockEnsign({
  x,
  y,
  mode,
}: {
  x: number;
  y: number;
  mode: TownBuildingMode;
}) {
  const tornId = `dockEnsign${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const abandoned = mode === 'abandoned';
  const top = y - 30;
  return (
    <g>
      <path d={`M${x} ${y}V${top}`} className="stroke-[#cbd5e1]" strokeWidth="1.3" />
      <circle cx={x} cy={top} r="1.4" className="fill-[#fcd34d]" />
      {abandoned && (
        <clipPath id={tornId}>
          <path
            d={`M${x} ${top + 1}h16l-3 3 4 2-5 3 3 3-4 2 2 3H${x}z`}
          />
        </clipPath>
      )}
      <g
        data-wave=""
        clipPath={abandoned ? `url(#${tornId})` : undefined}
        className={`origin-left [transform-box:fill-box] ${abandoned ? 'opacity-70' : ''}`}
      >
        <TownFlagCloth
          flag="green"
          x={x + 0.6}
          y={top + 1}
          w={24}
          h={abandoned ? 15 : 16}
          still
        />
      </g>
    </g>
  );
}
