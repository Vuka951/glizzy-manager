import { useLayoutEffect, useRef } from 'react';
import TownSpyVanArt from '@/components/games/career/town/TownSpyVanArt';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import { TOWN_LAYOUTS, type TownLayoutKey } from '@/lib/constants/townLayout';
import { SCOUT_DETAIL_LEVEL } from '@/data/games/careerInvestments';
import type { TownBuildingMode } from '@/lib/types/town';
import { prefersReducedMotion } from '@/lib/utils/motion';

const ROLL_MS = 2600;

// The top informant's truck, parked on the kerb above the kiosk as a flower
// delivery nobody believes: a dish and a whip antenna on the roof and a cable
// running to the laptop on the bench. It rolls into town the moment the level
// is bought and is simply parked there on any later visit
export default function TownSpyVan({
  level,
  layout,
  mode,
  held,
}: {
  level: number;
  layout: TownLayoutKey;
  mode: TownBuildingMode;
  // The character is still walking the purchase over; the truck waits for them
  held: boolean;
}) {
  const vanRef = useRef<HTMLDivElement | null>(null);
  const wireRef = useRef<SVGPathElement | null>(null);
  const lastLevelRef = useRef(level);
  const dueRef = useRef(false);
  const ambient = useAmbientMotion();
  const place = TOWN_LAYOUTS[layout].street;
  const here = level >= SCOUT_DETAIL_LEVEL;

  useLayoutEffect(() => {
    if (lastLevelRef.current < SCOUT_DETAIL_LEVEL && here) dueRef.current = true;
    lastLevelRef.current = level;
    const van = vanRef.current;
    const wire = wireRef.current;
    if (!van || !dueRef.current) return;
    if (!ambient || prefersReducedMotion()) {
      dueRef.current = false;
      van.style.visibility = '';
      return;
    }
    if (held) {
      van.style.visibility = 'hidden';
      if (wire) wire.style.visibility = 'hidden';
      return;
    }
    dueRef.current = false;
    van.style.visibility = '';
    if (wire) wire.style.visibility = '';
    van.animate(
      [
        { transform: `translateX(${-place.spyVan.x - 110}px)` },
        { transform: 'translateX(4px)', offset: 0.9 },
        { transform: 'translateX(0)' },
      ],
      { duration: ROLL_MS, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)' },
    );
    wire?.animate(
      [{ opacity: 0 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }],
      { duration: ROLL_MS + 800 },
    );
  }, [level, here, held, ambient, place.spyVan.x]);

  if (!here) return null;

  return (
    <>
      <svg
        viewBox={`0 0 ${TOWN_LAYOUTS[layout].w} ${TOWN_LAYOUTS[layout].h}`}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 ${TOWN_LAYOUTS[layout].canvas} ${place.spyVan.wireLayer}`}
      >
        <path
          ref={wireRef}
          d={place.spyVan.wire}
          className="fill-none stroke-[#111827]"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <div
        ref={vanRef}
        className={`pointer-events-none absolute ${place.spyVan.box}`}
      >
        <TownSpyVanArt mode={mode} />
      </div>
    </>
  );
}
