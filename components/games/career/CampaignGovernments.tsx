import PortraitHead from "@/components/games/PortraitHead";
import PaperSection from "@/components/games/career/PaperSection";
import SponsorEmblem from "@/components/games/career/SponsorEmblem";
import type { DuelCharacter } from "@/data/games/glizzyDuel";
import { GAMES_UI } from "@/data/games/locale";
import { SPONSOR_THEMES } from "@/lib/constants/sponsorThemes";
import type { SponsorId } from "@/lib/utils/careerSave";
import { NEWSPRINT_PAINT } from "@/lib/utils/careerNewsprint";
import { fmt } from "@/lib/utils/format";
import { governmentStints, type GovernmentStint } from "@/lib/utils/reportCharts";

const R = GAMES_UI.career.report;
const PRIME_MINISTER = GAMES_UI.career.parliament.primeMinister;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;
const AXIS_LABELS = 6;
const LANE_GRID =
  "grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_2.75rem] items-center gap-x-2 sm:grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)_3rem]";

export type GovernmentRecord = {
  year: number;
  government: SponsorId[];
  primeMinister?: string | null;
};

const rangeOf = (stint: GovernmentStint) =>
  stint.from === stint.to
    ? fmt(R.yearShort, { year: stint.from })
    : fmt(R.yearRange, { from: stint.from, to: stint.to });

// Who runs the city and who ran it before: the latest government up top, then
// parties and prime ministers on one year axis so a coalition, a gap in power
// and a change of premier all line up, then the earlier prime ministers by name
export default function CampaignGovernments({
  governments,
  lastYear,
  characterBySlug,
  playerSlug,
}: {
  governments: GovernmentRecord[];
  lastYear: number;
  characterBySlug?: Map<string, DuelCharacter>;
  playerSlug?: string;
}) {
  const stints = governmentStints(governments, lastYear);
  const latest = stints[stints.length - 1];
  const earlier = stints.slice(0, -1).reverse();
  const totalYears = Math.max(1, lastYear);
  const years = Array.from({ length: totalYears }, (_, i) => i + 1);
  const labelEvery = Math.ceil(totalYears / AXIS_LABELS);
  const parties = stints.reduce<Partial<Record<SponsorId, number>>>(
    (sum, stint) => {
      stint.government.forEach((party) => {
        sum[party] = (sum[party] ?? 0) + stint.to - stint.from + 1;
      });
      return sum;
    },
    {},
  );
  const ranked = (Object.entries(parties) as [SponsorId, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const pmOf = (stint: GovernmentStint) =>
    stint.primeMinister ? characterBySlug?.get(stint.primeMinister) : undefined;
  const latestPm = latest && pmOf(latest);
  return (
    <div className={`w-full ${NEWSPRINT_PAINT}`}>
      <PaperSection title={R.governmentsTitle}>
        {!latest ? (
          <p className="text-center font-sign text-sm text-slate-600">-</p>
        ) : (
          <div className="@container">
            <div className="grid gap-5 @3xl:grid-cols-2 @3xl:gap-10">
                <div
                  className={`flex items-center gap-3 border-b-4 border-double border-slate-900 pb-3 sm:gap-4 ${
                    latest.primeMinister === playerSlug ? "bg-[#fde047]/45" : ""
                  }`}
                >
                  {latestPm && (
                    <PortraitHead
                      character={latestPm}
                      className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                    />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-sign text-[14px] font-bold uppercase tracking-[0.08em] text-red-800">
                        {PRIME_MINISTER}
                      </span>
                      <span className="font-sign text-[14px] font-bold uppercase tracking-[0.05em] tabular-nums text-slate-600">
                        {rangeOf(latest)}
                      </span>
                    </div>
                    {latestPm && (
                      <span className="font-serif text-[22px] font-black leading-[1.05] text-slate-900 [overflow-wrap:anywhere] sm:text-[28px]">
                        {latestPm.name}
                      </span>
                    )}
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {latest.government.map((party) => (
                        <span
                          key={party}
                          className="inline-flex items-center gap-1.5 font-serif text-[13px] font-semibold text-slate-800"
                        >
                          <SponsorEmblem
                            sponsorId={party}
                            className="h-6 w-6 shrink-0"
                          />
                          {SPONSOR_NAMES[party]}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              <div className="flex min-w-0 flex-col gap-1.5 @3xl:col-start-2 @3xl:row-span-2 @3xl:row-start-1">
                <span className="font-sign text-[14px] font-bold uppercase tracking-[0.06em] text-slate-700">
                  {R.yearsInPower}
                </span>
                <div className={LANE_GRID}>
                  <span className="font-sign text-[13px] font-bold uppercase tracking-[0.05em] text-slate-600">
                    {PRIME_MINISTER}
                  </span>
                  <div className="flex h-9 min-w-0">
                    {years.map((year) => {
                      const stint = stints.find((s) => s.from === year);
                      const character = stint && pmOf(stint);
                      return (
                        <div
                          key={year}
                          title={character?.name}
                          className="relative min-w-0 flex-1"
                        >
                          {character && (
                            <PortraitHead
                              character={character}
                              className="absolute left-0 top-1/2 h-7 w-7 -translate-y-1/2"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {ranked.map(([party, total]) => (
                  <div key={party} className={LANE_GRID}>
                    <span className="flex min-w-0 items-center gap-1.5">
                      <SponsorEmblem
                        sponsorId={party}
                        className="h-5 w-5 shrink-0"
                      />
                      <span
                        title={SPONSOR_NAMES[party]}
                        className="line-clamp-2 min-w-0 font-serif text-[12px] font-semibold leading-[1.15] text-slate-800 sm:text-[13px]"
                      >
                        {SPONSOR_NAMES[party]}
                      </span>
                    </span>
                    <svg
                      viewBox={`0 0 ${totalYears} 1`}
                      preserveAspectRatio="none"
                      className="h-5 w-full"
                      aria-hidden="true"
                    >
                      <rect
                        width={totalYears}
                        height={1}
                        className="fill-slate-900/10"
                      />
                      {stints
                        .filter((stint) => stint.government.includes(party))
                        .map((stint) => (
                          <rect
                            key={stint.from}
                            x={stint.from - 1}
                            width={stint.to - stint.from + 1}
                            height={1}
                            strokeWidth={1}
                            vectorEffect="non-scaling-stroke"
                            className={`${SPONSOR_THEMES[party].bar} stroke-[#1c1408]/50`}
                          />
                        ))}
                    </svg>
                    <span className="text-right font-sign text-[15px] font-bold tabular-nums text-slate-900">
                      {fmt(R.yearsValue, { years: total })}
                    </span>
                  </div>
                ))}
                <div className={LANE_GRID}>
                  <span />
                  <div className="flex min-w-0">
                    {years.map((year) => (
                      <span
                        key={year}
                        className="min-w-0 flex-1 overflow-visible whitespace-nowrap font-sign text-[13px] font-semibold uppercase leading-none tracking-[0.04em] text-slate-600"
                      >
                        {(year - 1) % labelEvery === 0 ? year : ""}
                      </span>
                    ))}
                  </div>
                  <span />
                </div>
              </div>
              {earlier.length > 0 && (
                <div className="flex min-w-0 flex-col @3xl:col-start-1 @3xl:row-start-2">
                  <span className="pb-1 font-sign text-[14px] font-bold uppercase tracking-[0.06em] text-slate-700">
                    {R.earlierPrimeMinisters}
                  </span>
                  {earlier.map((stint) => {
                    const character = pmOf(stint);
                    return (
                      <div
                        key={stint.from}
                        className={`grid min-h-11 grid-cols-[4.75rem_1.75rem_minmax(0,1fr)_auto] items-center gap-2 border-t border-dotted border-slate-900/30 py-1 ${
                          stint.primeMinister === playerSlug
                            ? "bg-[#fde047]/45"
                            : ""
                        }`}
                      >
                        <span className="font-sign text-[13px] font-semibold uppercase tracking-[0.04em] tabular-nums text-slate-600">
                          {rangeOf(stint)}
                        </span>
                        {character ? (
                          <PortraitHead character={character} className="h-7 w-7" />
                        ) : (
                          <span />
                        )}
                        <span className="min-w-0 font-serif text-[13px] font-bold leading-[1.15] text-slate-900 [overflow-wrap:anywhere]">
                          {character?.name ?? "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          {stint.government.map((party) => (
                            <SponsorEmblem
                              key={party}
                              sponsorId={party}
                              className="h-5 w-5 shrink-0"
                            />
                          ))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </PaperSection>
    </div>
  );
}
