import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import {
  PARTY_SEAT_ORDER,
  SEASON_PAY_LEADER,
  SEASON_PAY_OPPOSITION,
  TABLE_BONUS_LEADER,
  TABLE_BONUS_OPPOSITION,
} from '@/data/games/careerElections';
import { GAMES_UI } from '@/data/games/locale';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';
import { leaderEffectLines } from '@/lib/utils/governmentEffects';

const E = GAMES_UI.career.parliament.effects;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

// What a seat is worth and what every list does with the lead: the terms all
// four share first, then each party's power side by side with the one in
// power called out
export default function GovernmentEffectsInfoPanel({
  leader = null,
}: {
  leader?: SponsorId | null;
}) {
  return (
    <div className="flex flex-col gap-2.5 text-left">
      <p className="text-[11px] leading-relaxed text-slate-400">
        {E.infoIntro}
      </p>
      <div className="flex flex-col gap-0.5 rounded-xl border border-sky-200/10 bg-slate-900/40 px-3 py-2 text-[10px] leading-snug">
        <span className="text-emerald-300/80">
          {fmt(E.generalLeader, {
            table: TABLE_BONUS_LEADER,
            pay: SEASON_PAY_LEADER,
          })}
        </span>
        <span className="text-red-300/80">
          {fmt(E.generalOpposition, {
            table: TABLE_BONUS_OPPOSITION,
            pay: SEASON_PAY_OPPOSITION,
          })}
        </span>
        <span className="text-slate-500">{E.generalPartner}</span>
      </div>
      {PARTY_SEAT_ORDER.map((id) => {
        const lines = leaderEffectLines(id);
        const inPower = id === leader;
        return (
          <div
            key={id}
            className={`flex flex-col gap-1.5 rounded-2xl border p-3 ${SPONSOR_THEMES[id].plaque} ${
              inPower ? 'ring-1 ring-amber-300/50' : ''
            }`}
          >
            <span className="flex items-center gap-2 text-[11px] font-bold text-slate-100">
              <SponsorEmblem sponsorId={id} className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                {SPONSOR_NAMES[id]}
              </span>
              {inPower && (
                <span className="rounded-full border border-amber-300/50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-200">
                  {E.inPower}
                </span>
              )}
            </span>
            <span className="flex items-start gap-2 text-[10px] leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              <span className="text-emerald-100/80">
                <span className="font-semibold text-emerald-300">{E.own}: </span>
                {lines.own}
              </span>
            </span>
            <span className="flex items-start gap-2 text-[10px] leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              <span className="text-red-100/80">
                <span className="font-semibold text-red-300">{E.outside}: </span>
                {lines.outside}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
