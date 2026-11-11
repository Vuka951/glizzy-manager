import CareerToggle from '@/components/games/career/CareerToggle';
import {
  SOLO_OVERLORD_POINT_OPTIONS,
  type OverlordPoints,
} from '@/data/games/careerEconomy';
import { GAMES_UI } from '@/data/games/locale';
import { WOOD_PLANKS } from '@/lib/utils/careerFrameClasses';
import { fmt } from '@/lib/utils/format';

const SELECT = GAMES_UI.career.select;

export default function CrownPointsPicker({
  value,
  onChange,
}: {
  value: OverlordPoints;
  onChange: (points: OverlordPoints) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={SELECT.overlordPointsLabel}
      className={`inline-flex gap-1 rounded-[5px] p-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_0_0_1px_#160c05,0_4px_0_rgb(0_0_0/0.5)] ${WOOD_PLANKS}`}
    >
      {SOLO_OVERLORD_POINT_OPTIONS.map((points) => {
        const active = points === value;
        return (
          <CareerToggle
            selected={active}
            tone="amber"
            key={points}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(points)}
            className="min-h-11 px-4 py-2 uppercase"
          >
            {fmt(SELECT.crownPoints, { points })}
          </CareerToggle>
        );
      })}
    </div>
  );
}
