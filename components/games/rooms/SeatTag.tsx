'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';
import { GAMES_UI } from '@/data/games/locale';
import { SEAT_COLOR_CLASSES, type SeatColor } from '@/lib/constants/rooms';
import { SEAT_PAINT } from '@/lib/constants/seatPaint';

// The tag that names the seat behind a character, in the seat's room color; a
// seat that dropped off the room shows grey. In the street frame it is a
// painted name tag that reads the same on wood and on paper; the classic
// frame keeps the pill
export default function SeatTag({
  name,
  color,
  dense = false,
  connected = true,
  onPaper = false,
}: {
  name: string;
  color: SeatColor;
  dense?: boolean;
  connected?: boolean;
  // On the newspaper's bright paper the pill is solid ink, not a tint
  onPaper?: boolean;
}) {
  const title = connected ? name : `${name} (${GAMES_UI.rooms.seat.offline})`;
  if (useCareerFrames() === 'street') {
    return (
      <span
        title={title}
        className={`inline-flex max-w-24 shrink-0 items-center truncate rounded-[2px] font-sign font-bold uppercase leading-none tracking-[0.05em] shadow-[0_1px_0_rgb(0_0_0/0.35)] ${
          dense ? 'px-1 py-px text-[10px]' : 'px-1.5 py-0.5 text-[12px]'
        } ${
          connected
            ? `text-[#0b0f1c] ${SEAT_PAINT[color]}`
            : 'bg-[#cbd5e1] text-[#475569] line-through'
        }`}
      >
        {name}
      </span>
    );
  }
  return (
    <span
      title={title}
      className={`inline-flex max-w-24 shrink-0 items-center truncate rounded-full border font-bold uppercase tracking-wider ${
        dense ? 'px-1 text-[7px] leading-3' : 'px-1.5 py-px text-[8px]'
      } ${
        !connected
          ? onPaper
            ? 'border-slate-400 bg-slate-200 text-slate-500 line-through'
            : 'border-slate-600 bg-slate-800/60 text-slate-500 line-through'
          : onPaper
            ? `border-transparent text-slate-950 ${SEAT_COLOR_CLASSES[color].dot}`
            : SEAT_COLOR_CLASSES[color].pill
      }`}
    >
      {name}
    </span>
  );
}
