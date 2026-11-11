'use client';

import {
  SEAT_COLOR_ORDER,
  type SeatColor,
} from '@/lib/constants/rooms';
import { SEAT_PAINT } from '@/lib/constants/seatPaint';
import { GAMES_UI } from '@/data/games/locale';

const COLOR_NAMES = GAMES_UI.careerMp.lobby.colors;

// Eight ink dots on the form; a taken one is crossed out with a pencil
export default function ColorPicker({
  value,
  taken,
  onPick,
}: {
  value: SeatColor | null;
  taken: Set<SeatColor>;
  onPick: (color: SeatColor) => void;
}) {
  return (
    <div className="flex flex-wrap">
      {SEAT_COLOR_ORDER.map((color) => {
        const isTaken = taken.has(color) && color !== value;
        return (
          <button
            key={color}
            type="button"
            disabled={isTaken}
            onClick={() => onPick(color)}
            aria-label={COLOR_NAMES[color]}
            aria-pressed={value === color}
            className="group/dot flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1c1408] disabled:cursor-not-allowed"
          >
            <span
              className={`relative flex h-7 w-7 items-center justify-center rounded-full transition motion-reduce:transition-none ${SEAT_PAINT[color]} ${
                value === color
                  ? 'ring-2 ring-[#1c1408] ring-offset-2 ring-offset-[#f1e8d3]'
                  : 'ring-1 ring-[#1c1408]/30 group-enabled/dot:group-hover/dot:ring-[#1c1408]/70'
              } ${isTaken ? 'opacity-30' : ''}`}
            >
              {isTaken && (
                <span className="font-sign text-base font-bold text-[#1c1408]">
                  x
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
