import {
  PARLIAMENT_SEATS,
  PARTY_SEAT_ORDER,
} from '@/data/games/careerElections';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';

const VIEW_W = 400;
const VIEW_H = 220;
const ROWS = [12, 16, 20, 24, 28];
const INNER_RADIUS = 66;
const OUTER_RADIUS = 186;
const SEAT_RADIUS = 5.6;

type Seat = { x: number; y: number; angle: number };

// Five arcs of seats, listed from the far left of the chamber to the far
// right so the party order can be painted straight onto them
function seatPositions(): Seat[] {
  const seats: Seat[] = [];
  const step = (OUTER_RADIUS - INNER_RADIUS) / (ROWS.length - 1);
  ROWS.forEach((count, row) => {
    const radius = INNER_RADIUS + row * step;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI - (Math.PI * (i + 0.5)) / count;
      seats.push({
        x: VIEW_W / 2 + radius * Math.cos(angle),
        y: VIEW_H - 8 - radius * Math.sin(angle),
        angle,
      });
    }
  });
  return seats.sort((a, b) => b.angle - a.angle).slice(0, PARLIAMENT_SEATS);
}

const SEATS = seatPositions();

// The hemicycle. Seats are painted party by party in PARTY_SEAT_ORDER,
// Ostrvo on the far left and Zidari on the far right. Revealed caps how many
// seats are lit, for the election night count; dimOutside fades every seat
// that is not in the government
export default function ParliamentChamber({
  seats,
  government = [],
  revealed = PARLIAMENT_SEATS,
  dimOutside = false,
  className = '',
}: {
  seats: Record<SponsorId, number>;
  government?: SponsorId[];
  revealed?: number;
  dimOutside?: boolean;
  className?: string;
}) {
  const painted: { party: SponsorId; fill: string }[] = [];
  PARTY_SEAT_ORDER.forEach((party) => {
    const palette = SPONSOR_THEMES[party].seat;
    for (let i = 0; i < seats[party]; i++) {
      painted.push({ party, fill: palette[i % palette.length] });
    }
  });

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={`w-full ${className}`}
      role="img"
      aria-hidden="true"
    >
      {SEATS.map((seat, index) => {
        const entry = painted[index];
        const lit = index < revealed && entry !== undefined;
        const outside =
          dimOutside &&
          entry !== undefined &&
          !government.includes(entry.party);
        return (
          <circle
            key={index}
            cx={seat.x.toFixed(1)}
            cy={seat.y.toFixed(1)}
            r={SEAT_RADIUS}
            className={`transition-opacity duration-300 ${
              entry ? entry.fill : 'fill-slate-700'
            } ${!lit ? 'opacity-15' : outside ? 'opacity-25' : 'opacity-100'}`}
          />
        );
      })}
    </svg>
  );
}
