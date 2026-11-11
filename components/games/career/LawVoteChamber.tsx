import { PARLIAMENT_SEATS } from '@/data/games/careerElections';
import type { SponsorId } from '@/lib/utils/careerSave';
import {
  CHAMBER_SEAT_RADIUS,
  CHAMBER_SEATS,
  CHAMBER_VIEW_H,
  CHAMBER_VIEW_W,
} from '@/lib/utils/chamberSeats';

// The hemicycle during a law vote: the governing benches lit in the middle,
// the opposition dark on both wings. As the weight comes in, YES turns the
// government's seats green from the left and NO red from the right, each
// in proportion to its share of the voice
export default function LawVoteChamber({
  seats,
  government,
  yes,
  no,
  total,
  className = '',
}: {
  seats: Record<SponsorId, number>;
  government: SponsorId[];
  yes: number;
  no: number;
  total: number;
  className?: string;
}) {
  const ruling = Math.min(
    government.reduce((sum, party) => sum + seats[party], 0),
    PARLIAMENT_SEATS,
  );
  const leftWing = Math.floor((PARLIAMENT_SEATS - ruling) / 2);
  const greens = total > 0 ? Math.round((yes / total) * ruling) : 0;
  const reds =
    total > 0 ? Math.min(ruling - greens, Math.round((no / total) * ruling)) : 0;

  return (
    <svg
      viewBox={`0 0 ${CHAMBER_VIEW_W} ${CHAMBER_VIEW_H}`}
      className={`w-full ${className}`}
      role="img"
      aria-hidden="true"
    >
      {CHAMBER_SEATS.map((seat, index) => {
        const bench = index - leftWing;
        const governing = bench >= 0 && bench < ruling;
        const tone = !governing
          ? 'fill-slate-700 opacity-30'
          : bench < greens
            ? 'fill-emerald-400'
            : bench >= ruling - reds
              ? 'fill-red-500'
              : 'fill-slate-300 opacity-40';
        return (
          <circle
            key={index}
            cx={seat.x.toFixed(1)}
            cy={seat.y.toFixed(1)}
            r={CHAMBER_SEAT_RADIUS}
            className={`transition-[fill,opacity] duration-500 ${tone}`}
          />
        );
      })}
    </svg>
  );
}
