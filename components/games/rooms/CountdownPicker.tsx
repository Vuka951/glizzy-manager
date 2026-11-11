'use client';

import HouseRuleRow from '@/components/games/rooms/HouseRuleRow';
import { GAMES_UI } from '@/data/games/locale';
import { COUNTDOWN_PRESETS } from '@/lib/constants/rooms';

const PRESETS = GAMES_UI.rooms.countdown.presets as Record<string, string>;

// The one line of the house rules: no countdown, or one of three lengths
// that every decision phase gets
export default function CountdownPicker({
  label,
  value,
  disabled,
  onPick,
}: {
  label: string;
  value: number | null;
  disabled: boolean;
  onPick: (seconds: number | null) => void;
}) {
  return (
    <HouseRuleRow
      label={label}
      disabled={disabled}
      options={COUNTDOWN_PRESETS.map((preset) => ({
        key: String(preset),
        label: PRESETS[String(preset)],
        selected: value === preset,
        onPick: () => onPick(preset),
      }))}
    />
  );
}
