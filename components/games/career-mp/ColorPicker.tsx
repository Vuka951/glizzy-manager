'use client';

import {
  COACH_COLOR_CLASSES,
  COACH_COLOR_ORDER,
  type CoachColor,
} from '@/lib/constants/careerMp';
import { GAMES_UI } from '@/data/games/locale';

const COLOR_NAMES = GAMES_UI.careerMp.lobby.colors;

// Eight ink dots on the form; a taken one is crossed out with a pencil
export default function ColorPicker({
  value,
  taken,
  onPick,
}: {
  value: CoachColor | null;
  taken: Set<CoachColor>;
  onPick: (color: CoachColor) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {COACH_COLOR_ORDER.map((color) => {
        const isTaken = taken.has(color) && color !== value;
        return (
          <button
            key={color}
            type="button"
            disabled={isTaken}
            onClick={() => onPick(color)}
            aria-label={COLOR_NAMES[color]}
            className={`relative h-7 w-7 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
              COACH_COLOR_CLASSES[color].dot
            } ${
              value === color
                ? 'ring-2 ring-slate-900 ring-offset-2 ring-offset-amber-50'
                : 'ring-1 ring-slate-900/20 enabled:hover:ring-slate-900/60'
            } ${isTaken ? 'cursor-not-allowed opacity-25' : ''}`}
          >
            {isTaken && (
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-950">
                x
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
