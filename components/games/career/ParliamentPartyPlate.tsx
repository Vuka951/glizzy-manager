import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { GAMES_UI } from '@/data/games/locale';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import { STREET_TRAY } from '@/lib/utils/careerFrameClasses';
import type { SponsorId } from '@/lib/utils/careerSave';

const P = GAMES_UI.career.parliament;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

export type PartyStanding = 'leads' | 'partner' | 'opposition';

const BADGE: Record<PartyStanding, string> = {
  leads: 'bg-[#047857] text-[#ecfdf5]',
  partner: 'bg-[#065f46] text-[#a7f3d0]',
  opposition: 'bg-[#7f1d1d] text-[#fecaca]',
};

// A party's bench, a slot routed into the wood: its colour down the edge as a
// sash, its mark and name, name cards for the players signed to it, and once
// the city has voted its seats and an enamel tab for where it sits. Opposition
// benches dim while a government stands, governing ones get a brass rim
export default function ParliamentPartyPlate({
  party,
  seats,
  standing,
  mine,
  children,
}: {
  party: SponsorId;
  seats: number | null;
  standing: PartyStanding | null;
  mine: boolean;
  children: React.ReactNode;
}) {
  const governing = standing === 'leads' || standing === 'partner';
  return (
    <li
      className={`relative flex items-center gap-2 overflow-hidden py-1.5 pl-5 pr-2.5 text-xs @3xl:py-2.5 @3xl:text-sm ${STREET_TRAY} ${
        governing ? 'ring-1 ring-[#b8862f]' : ''
      } ${standing === 'opposition' ? 'text-slate-400' : 'text-[#f5ead2]'} ${
        mine ? 'outline-2 outline-offset-1 outline-[#fcd34d]' : ''
      }`}
    >
      <svg
        viewBox="0 0 12 40"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 h-full w-2.5 ${standing === 'opposition' ? 'opacity-50' : ''}`}
      >
        <rect width="12" height="40" className={SPONSOR_THEMES[party].bar} />
      </svg>
      <SponsorEmblem
        sponsorId={party}
        className="h-4 w-4 shrink-0 @3xl:h-6 @3xl:w-6"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-serif font-black">
          {SPONSOR_NAMES[party]}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1">
          {children}
        </span>
      </span>
      {(seats !== null || standing) && (
        <span className="flex shrink-0 flex-col items-end gap-1">
          {seats !== null && (
            <span className="font-sign text-[22px] font-bold leading-none tabular-nums">
              {seats}
            </span>
          )}
          {standing && (
            <span
              className={`rounded-[3px] px-1.5 py-0.5 font-sign text-[12px] font-bold uppercase leading-none tracking-[0.06em] shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_1px_0_rgb(0_0_0/0.5)] ${BADGE[standing]}`}
            >
              {standing === 'leads'
                ? P.leads
                : standing === 'partner'
                  ? P.partner
                  : P.opposition}
            </span>
          )}
        </span>
      )}
    </li>
  );
}
