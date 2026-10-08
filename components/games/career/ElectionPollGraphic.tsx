import { PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';

const SHORT_NAMES = GAMES_UI.career.sponsors.shortNames as Record<
  SponsorId,
  string
>;

const VIEW_W = 100;
const VIEW_H = 62;
const BASELINE = 50;
const BAR_MAX_H = 34;
const BAR_W = 15;

// The seat numbers the poll and result articles carry in their params
export function seatsFromParams(
  params: Record<string, string | number>,
): Record<SponsorId, number> | null {
  const seats = {} as Record<SponsorId, number>;
  for (const id of PARTY_SEAT_ORDER) {
    const value = Number(params[id]);
    if (!Number.isFinite(value)) return null;
    seats[id] = value;
  }
  return seats;
}

// The pollster's chart on newsprint: one column per list in its colour,
// biggest first, the projected seats on top and the name under the baseline
export default function ElectionPollGraphic({
  seats,
  small = false,
}: {
  seats: Record<SponsorId, number>;
  small?: boolean;
}) {
  const order = [...PARTY_SEAT_ORDER].sort((a, b) => seats[b] - seats[a]);
  const max = Math.max(1, ...order.map((id) => seats[id]));
  const slot = VIEW_W / order.length;
  return (
    <div
      className={`rounded-sm border border-slate-900/40 bg-slate-100 shadow-[2px_2px_0_rgb(15_23_42/0.35)] ${
        small ? 'w-[8rem] p-1' : 'w-[11rem] p-1.5'
      }`}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full" aria-hidden="true">
        {order.map((id, i) => {
          const h = Math.max(1.5, (seats[id] / max) * BAR_MAX_H);
          const x = slot * i + (slot - BAR_W) / 2;
          const cx = slot * i + slot / 2;
          return (
            <g key={id}>
              <rect
                x={x}
                y={BASELINE - h}
                width={BAR_W}
                height={h}
                rx="1"
                className={SPONSOR_THEMES[id].bar}
              />
              <text
                x={cx}
                y={BASELINE - h - 2.5}
                textAnchor="middle"
                className="fill-slate-900 font-mono text-[7px] font-bold"
              >
                {seats[id]}
              </text>
              <text
                x={cx}
                y={BASELINE + 7}
                textAnchor="middle"
                textLength={SHORT_NAMES[id].length > 7 ? slot - 3 : undefined}
                lengthAdjust="spacingAndGlyphs"
                className="fill-slate-600 font-sans text-[4.6px] font-bold uppercase"
              >
                {SHORT_NAMES[id]}
              </text>
            </g>
          );
        })}
        <line
          x1="0"
          x2={VIEW_W}
          y1={BASELINE}
          y2={BASELINE}
          className="stroke-slate-900/40"
          strokeWidth="0.6"
        />
      </svg>
    </div>
  );
}
