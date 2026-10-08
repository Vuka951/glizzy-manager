'use client';

import { COUNTDOWN_PRESETS } from '@/lib/constants/careerMp';
import { GAMES_UI } from '@/data/games/locale';

const PRESETS = GAMES_UI.careerMp.lobby.presets as Record<string, string>;

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
    <div className="flex flex-col gap-1.5 border-b border-dotted border-slate-900/30 py-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-40 shrink-0 text-[11px] font-bold text-slate-800">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {COUNTDOWN_PRESETS.map((preset) => (
          <button
            key={String(preset)}
            disabled={disabled}
            onClick={() => onPick(preset)}
            className={`rounded-sm border px-2.5 py-1 font-mono text-[11px] font-bold transition disabled:cursor-default ${
              value === preset
                ? 'border-slate-900 bg-slate-900 text-amber-50'
                : 'border-slate-900/25 text-slate-600 enabled:hover:border-slate-900 enabled:hover:text-slate-900'
            }`}
          >
            {PRESETS[String(preset)]}
          </button>
        ))}
      </div>
    </div>
  );
}
