import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import {
  PARTY_SEAT_ORDER,
  SEASON_PAY_LEADER,
  SEASON_PAY_OPPOSITION,
  TABLE_BONUS_LEADER,
  TABLE_BONUS_OPPOSITION,
} from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';
import { leaderEffectLines } from '@/lib/utils/governmentEffects';

const E = GAMES_UI.career.parliament.effects;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

// What a seat is worth and what every list does with the lead, as a typed
// notice: the terms all four share first, then each party's power under its
// wax, the one in power marked with a highlighter and a stamp
export default function GovernmentEffectsInfoPanel({
  leader = null,
}: {
  leader?: SponsorId | null;
}) {
  return (
    <PaperSheet className="flex flex-col gap-2.5 px-3 pb-3.5 pt-3 text-left">
      <p className="font-serif text-[12px] leading-snug text-slate-200">
        {E.infoIntro}
      </p>
      <div className="flex flex-col gap-0.5 border-y-[3px] border-double border-slate-200 py-1.5 font-serif text-[12px] leading-snug">
        <span className="text-emerald-300">
          {fmt(E.generalLeader, {
            table: TABLE_BONUS_LEADER,
            pay: SEASON_PAY_LEADER,
          })}
        </span>
        <span className="text-red-300">
          {fmt(E.generalOpposition, {
            table: TABLE_BONUS_OPPOSITION,
            pay: SEASON_PAY_OPPOSITION,
          })}
        </span>
        <span className="text-slate-400">{E.generalPartner}</span>
      </div>
      <div className="flex flex-col">
        {PARTY_SEAT_ORDER.map((id) => {
          const lines = leaderEffectLines(id);
          const inPower = id === leader;
          return (
            <div
              key={id}
              className={`grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2.5 border-b border-slate-600/50 px-1 py-2 last:border-b-0 ${
                inPower ? 'bg-[#fde047]/45' : ''
              }`}
            >
              <SponsorEmblem sponsorId={id} className="h-6 w-6" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex items-baseline gap-2">
                  <span className="min-w-0 flex-1 truncate font-serif text-[13px] font-black text-slate-100">
                    {SPONSOR_NAMES[id]}
                  </span>
                  {inPower && (
                    <span className="shrink-0 -rotate-3 rounded-[2px] border-2 border-red-300 px-1 font-sign text-[12px] font-bold uppercase tracking-[0.08em] text-red-300">
                      {E.inPower}
                    </span>
                  )}
                </span>
                <span className="font-serif text-[12px] leading-snug text-slate-200">
                  <span className="font-sign text-[13px] font-bold uppercase tracking-[0.04em] text-emerald-300">
                    {E.own}:{' '}
                  </span>
                  {lines.own}
                </span>
                <span className="font-serif text-[12px] leading-snug text-slate-200">
                  <span className="font-sign text-[13px] font-bold uppercase tracking-[0.04em] text-red-300">
                    {E.outside}:{' '}
                  </span>
                  {lines.outside}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </PaperSheet>
  );
}
