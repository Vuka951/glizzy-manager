import {
  PARLIAMENT_SEATS,
  PARTY_SEAT_ORDER,
} from '@/data/games/careerElections';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';
import {
  CHAMBER_SEAT_RADIUS as SEAT_RADIUS,
  CHAMBER_SEATS as SEATS,
  CHAMBER_VIEW_H as VIEW_H,
  CHAMBER_VIEW_W as VIEW_W,
} from '@/lib/utils/chamberSeats';

// The hemicycle. Seats are painted party by party in PARTY_SEAT_ORDER,
// the Green Party on the far left and the Blue Party on the far right. Revealed caps how many
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
