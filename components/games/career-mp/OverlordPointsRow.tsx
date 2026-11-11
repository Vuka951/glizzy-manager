'use client';

import HouseRuleRow from '@/components/games/rooms/HouseRuleRow';
import {
  OVERLORD_POINT_OPTIONS,
  type OverlordPoints,
} from '@/data/games/careerEconomy';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const SELECT = GAMES_UI.career.select;

// What the crown costs, as the next line of the house rules
export default function OverlordPointsRow({
  value,
  disabled,
  onPick,
}: {
  value: OverlordPoints;
  disabled: boolean;
  onPick: (points: OverlordPoints) => void;
}) {
  return (
    <HouseRuleRow
      label={SELECT.overlordPointsLabel}
      disabled={disabled}
      options={OVERLORD_POINT_OPTIONS.map((points) => ({
        key: String(points),
        label: fmt(SELECT.overlordPoints, { points }),
        selected: value === points,
        onPick: () => onPick(points),
      }))}
    />
  );
}
