import PaperBar from "@/components/games/career/PaperBar";
import PaperSection from "@/components/games/career/PaperSection";
import SponsorEmblem from "@/components/games/career/SponsorEmblem";
import { GAMES_UI } from "@/data/games/locale";
import { SPONSOR_THEMES } from "@/lib/constants/sponsorThemes";
import type { SponsorId } from "@/lib/utils/careerSave";
import { fmt } from "@/lib/utils/format";

const R = GAMES_UI.career.report;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

export type GovernmentRecord = { year: number; government: SponsorId[] };

// Every government the league voted in, and how many years each party sat.
// A government sits from its election to the next one; the last one to the
// end of the campaign, and every party in it counts the years
export default function CampaignGovernments({
  governments,
  lastYear,
}: {
  governments: GovernmentRecord[];
  lastYear: number;
}) {
  const campaignYears = Math.max(1, lastYear);
  const yearsByParty: Partial<Record<SponsorId, number>> = {};
  governments.forEach((g, i) => {
    const until = governments[i + 1]?.year ?? lastYear + 1;
    g.government.forEach((party) => {
      yearsByParty[party] =
        (yearsByParty[party] ?? 0) + Math.max(0, until - g.year);
    });
  });
  const yearsInPower = (
    Object.entries(yearsByParty) as [SponsorId, number][]
  ).sort((a, b) => b[1] - a[1]);
  return (
    <PaperSection title={R.governmentsTitle}>
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <ul className="flex flex-col gap-2">
          {governments.length === 0 && (
            <li className="text-[11px] italic text-slate-500">-</li>
          )}
          {governments.map((g, i) => (
            <li
              key={i}
              className="flex items-center gap-3 border-b border-dotted border-slate-900/30 pb-1.5"
            >
              <span className="w-16 shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                {fmt(GAMES_UI.career.hud.year, { year: g.year })}
              </span>
              <span className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-800">
                {g.government.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1">
                    <SponsorEmblem sponsorId={id} className="h-4 w-4" />
                    {SPONSOR_NAMES[id]}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            {R.yearsInPower}
          </span>
          <ol className="flex flex-col gap-2">
            {yearsInPower.map(([party, years]) => (
              <li
                key={party}
                className="grid grid-cols-[1.5rem_9rem_1fr_3.5rem] items-center gap-x-2"
              >
                <SponsorEmblem sponsorId={party} className="h-5 w-5" />
                <span className="truncate text-[11px] font-semibold text-slate-800">
                  {SPONSOR_NAMES[party]}
                </span>
                <PaperBar
                  value={years}
                  max={campaignYears}
                  className={SPONSOR_THEMES[party].bar}
                />
                <span className="text-right font-mono text-[11px] font-black">
                  {fmt(R.yearsValue, { years })}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </PaperSection>
  );
}
