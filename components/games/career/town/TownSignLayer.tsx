import { useEffect, useState } from 'react';
import TownSign from '@/components/games/career/town/TownSign';
import {
  TOWN_LAYOUTS,
  type TownBuildingId,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';
import type { TownBuildingMode } from '@/lib/types/town';
import type { TownLabels } from '@/lib/utils/gameSettings';

export type TownSignSpec = {
  id: TownBuildingId;
  name: string;
  sub: string | null;
  mode: TownBuildingMode;
  disabled: boolean;
  placement: 'above' | 'mid' | 'roof' | 'below';
};

export type TownHoverSink = { current: (id: TownBuildingId | null) => void };

// Every building's hanging label on one layer over the whole town, so the
// walker, the townsfolk and the dog never cover a sign. Each sits on its
// building's box and lifts with it; the building reports hover and keyboard
// focus through `hoverRef`, so only this layer re-renders
export default function TownSignLayer({
  layout,
  signs,
  labels,
  hoverRef,
}: {
  layout: TownLayoutKey;
  signs: TownSignSpec[];
  labels: TownLabels;
  hoverRef: TownHoverSink;
}) {
  const [hovered, setHovered] = useState<TownBuildingId | null>(null);

  useEffect(() => {
    hoverRef.current = setHovered;
    return () => {
      hoverRef.current = () => undefined;
    };
  }, [hoverRef]);

  return (
    <div className="pointer-events-none absolute left-0 top-0 z-[900] size-0">
      {signs.map((sign) => {
        const on = hovered === sign.id;
        const lifts = on && sign.mode === 'open' && !sign.disabled;
        return (
          <div
            key={sign.id}
            className={`absolute transition-[translate] duration-200 ease-out ${
              TOWN_LAYOUTS[layout].buildings[sign.id].box
            } ${lifts ? '-translate-y-1' : ''}`}
          >
            <TownSign
              name={sign.name}
              sub={sign.mode === 'abandoned' ? null : sign.sub}
              labels={labels}
              mode={sign.mode}
              muted={sign.disabled}
              placement={sign.placement}
              revealed={on}
            />
          </div>
        );
      })}
    </div>
  );
}
