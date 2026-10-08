import ParliamentChamber from '@/components/games/career/ParliamentChamber';
import {
  PARLIAMENT_SEATS,
  PARTY_SEAT_ORDER,
} from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const SHORT_NAMES = GAMES_UI.career.sponsors.shortNames as Record<
  SponsorId,
  string
>;
const NP = GAMES_UI.career.newspaper;

// The government list the result article carries, leader first
export function governmentFromParams(
  params: Record<string, string | number>,
): SponsorId[] {
  return String(params.government ?? '')
    .split(',')
    .filter((id): id is SponsorId =>
      PARTY_SEAT_ORDER.includes(id as SponsorId),
    );
}

// The chamber after the count: the government's seats lit, the opposition
// faded, every list's seats in the legend and the coalition's total under it
export default function ElectionResultGraphic({
  seats,
  government,
  small = false,
}: {
  seats: Record<SponsorId, number>;
  government: SponsorId[];
  small?: boolean;
}) {
  // The legend reads the way the chamber is seated, far left to far right
  const order = PARTY_SEAT_ORDER;
  const held = government.reduce((sum, id) => sum + seats[id], 0);
  return (
    <div
      className={`flex flex-col gap-1 rounded-sm border border-slate-900/40 bg-slate-100 shadow-[2px_2px_0_rgb(15_23_42/0.35)] ${
        small ? 'w-[8.5rem] p-1' : 'w-[12rem] p-1.5'
      }`}
    >
      <ParliamentChamber
        seats={seats}
        government={government}
        dimOutside
        className="w-full"
      />
      <div
        className={`flex justify-between gap-1 border-t border-slate-900/20 pt-1 ${
          small ? 'text-[5.5px]' : 'text-[7px]'
        }`}
      >
        {order.map((id) => (
          <span key={id} className="flex flex-col items-center leading-tight">
            <span className="flex items-center gap-0.5">
              <svg viewBox="0 0 6 6" className="h-1.5 w-1.5" aria-hidden="true">
                <circle cx="3" cy="3" r="3" className={SPONSOR_THEMES[id].bar} />
              </svg>
              <span className="font-mono font-bold text-slate-900">
                {seats[id]}
              </span>
            </span>
            <span
              className={`font-sans font-bold uppercase ${
                government.includes(id) ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              {SHORT_NAMES[id]}
            </span>
          </span>
        ))}
      </div>
      <p
        className={`text-center font-mono font-bold uppercase tracking-widest text-slate-900 ${
          small ? 'text-[5.5px]' : 'text-[7px]'
        }`}
      >
        {fmt(NP.chartGovernment, { seats: held, total: PARLIAMENT_SEATS })}
      </p>
    </div>
  );
}
