'use client';

import { useRef, useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import CrownIcon from '@/components/icons/CrownIcon';
import Icon from '@/components/icons/Icon';
import CampaignAwards from '@/components/games/career/CampaignAwards';
import CampaignChart from '@/components/games/career/CampaignChart';
import CampaignCupGains from '@/components/games/career/CampaignCupGains';
import CampaignHeadToHead from '@/components/games/career/CampaignHeadToHead';
import CampaignGovernments from '@/components/games/career/CampaignGovernments';
import CampaignPriceChart from '@/components/games/career/CampaignPriceChart';
import CampaignTable from '@/components/games/career/CampaignTable';
import ConstitutionWinners from '@/components/games/career/ConstitutionWinners';
import ChampionsStrip from '@/components/games/career/ChampionsStrip';
import PaperBar from '@/components/games/career/PaperBar';
import PaperSection from '@/components/games/career/PaperSection';
import ReportDownload from '@/components/games/career/ReportDownload';
import ReportFigure from '@/components/games/career/ReportFigure';
import SeatTag from '@/components/games/rooms/SeatTag';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CampaignReportData, CoachTagMap } from '@/lib/types/careerMp';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import { lawsInForce } from '@/lib/utils/careerLaws';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';
import { fmt, ordinal, plural } from '@/lib/utils/format';
import { NEWSPRINT_PAINT } from '@/lib/utils/careerNewsprint';

const F = GAMES_UI.careerMp.finished;
const R = GAMES_UI.careerMp.report;
const CR = GAMES_UI.career.report;
const NP = GAMES_UI.career.newspaper;
const SELECT = GAMES_UI.career.select;
const PARTY_NAMES = GAMES_UI.career.sponsors.names as Record<SponsorId, string>;

// The room's last page as a special edition of the paper: everything the
// single-player report prints, read from this coach's own view of the
// league, plus the room's own pages: the coach standings as bars, every
// coach's books drawn, the governments, the glizi price and the head to
// head grid between the human characters. A campaign that ended on one-party
// rule leads with the party and every coach on its list
export default function FinalReport({
  report,
  characterBySlug,
  career,
  coaches,
  children,
}: {
  report: CampaignReportData;
  characterBySlug: Map<string, DuelCharacter>;
  // This coach's league, for the chart, the awards and the final table
  career?: SavedCareer | null;
  coaches?: CoachTagMap;
  children?: React.ReactNode;
}) {
  const paperRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const constitution = report.overlordSlug ? null : (report.constitution ?? null);
  const overlord = characterBySlug.get(report.overlordSlug);
  const winner = report.coaches.find((c) => c.slug === report.overlordSlug);
  const overlordState = career?.characters[report.overlordSlug];
  const winners = (constitution?.winners ?? []).flatMap((slug) => {
    const character = characterBySlug.get(slug);
    return character ? [character] : [];
  });
  const lawCount = constitution ? lawsInForce(career?.parliament).length : 0;
  const slugs = report.coaches.map((c) => c.slug);
  const coachBySlug = new Map(report.coaches.map((c) => [c.slug, c]));
  const maxPoints = Math.max(1, ...report.coaches.map((c) => c.points));
  const seasons = report.champions.length;
  const lastYear = report.champions[seasons - 1]?.year ?? 1;
  const maxH2h = Math.max(
    1,
    ...slugs.flatMap((row) => slugs.map((col) => report.h2h[row]?.[col] ?? 0)),
  );
  const order = career
    ? rankBySeeding(career.characters, new Set(slugs)).filter((slug) =>
        characterBySlug.has(slug),
      )
    : [];
  // The viewing coach's own column; a viewer without a known character
  // gets none
  const viewerSlug = career?.playerSlug;
  const viewer = viewerSlug ? characterBySlug.get(viewerSlug) : undefined;
  const viewerState = viewerSlug ? career?.characters[viewerSlug] : undefined;
  const viewerPlace = viewerSlug ? order.indexOf(viewerSlug) + 1 : 0;
  const viewerWon = constitution
    ? constitution.winners.includes(viewerSlug ?? '')
    : viewerSlug === report.overlordSlug;
  return (
    <div
      ref={paperRef}
      className={`w-full max-w-5xl rounded-[2px] bg-[#f1e8d3] p-5 text-left text-slate-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_6px_0_rgb(0_0_0/0.45)] sm:p-8 ${exporting ? 'min-w-[64rem] [&_*]:[scrollbar-width:none]' : ''} ${NEWSPRINT_PAINT}`}
    >
      <div className="border-y-4 border-double border-slate-900 py-2 text-center">
        <p className="font-serif text-2xl font-black uppercase tracking-[0.12em] sm:text-4xl">
          {SELECT.masthead}
        </p>
        <p className="mt-1 font-sign text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {fmt(CR.issue, { year: lastYear })} ·{' '}
          {GAMES_UI.careerMp.catalog.title}
        </p>
      </div>

      <div className="mt-4 grid gap-6 border-b-2 border-slate-900 pb-5 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="font-sign text-[14px] font-bold uppercase tracking-[0.12em] text-red-800">
            {NP.lead}
          </p>
          <h1 className="font-serif text-4xl font-black uppercase leading-[0.95] tracking-tight [overflow-wrap:anywhere] sm:text-6xl">
            {constitution
              ? fmt(CR.constitutionHeadline, {
                  party: PARTY_NAMES[constitution.party],
                })
              : fmt(CR.headline, {
                  name: overlord?.name ?? report.overlordSlug,
                })}
          </h1>
          {constitution ? (
            <div className="grid grid-cols-2 divide-x divide-dotted divide-slate-900/40 border-y-2 border-slate-900 sm:grid-cols-4">
              <ReportFigure label={CR.constitutionTiles.laws}>{lawCount}</ReportFigure>
              <ReportFigure label={CR.constitutionTiles.seats}>
                {career?.parliament?.seats[constitution.party] ?? '-'}
              </ReportFigure>
              <ReportFigure label={CR.constitutionTiles.winners}>
                {constitution.winners.length}
              </ReportFigure>
              <ReportFigure label={R.seasonsCount}>{seasons}</ReportFigure>
            </div>
          ) : (
            <div className="grid grid-cols-2 divide-x divide-dotted divide-slate-900/40 border-y-2 border-slate-900 sm:grid-cols-4">
              <ReportFigure label={CR.tiles.points}>
                {winner?.points ?? (overlordState ? careerPoints(overlordState) : '-')}
              </ReportFigure>
              <ReportFigure label={CR.tiles.titles}>
                {winner?.titles ?? overlordState?.titles ?? '-'}
              </ReportFigure>
              <ReportFigure label={R.seasonsCount}>{seasons}</ReportFigure>
              <ReportFigure label={R.coachesCount}>{report.coaches.length}</ReportFigure>
            </div>
          )}
          {viewer && viewerState && viewerPlace > 0 && (
            <div
              className={`flex items-center gap-3 rounded-[2px] border-2 px-3 py-2 ${
                viewerWon
                  ? 'border-red-700 bg-[#fde047]/45'
                  : 'border-slate-900/30 bg-white/40'
              }`}
            >
              <PortraitHead character={viewer} className="h-9 w-9 shrink-0" />
              <span className="flex min-w-0 flex-col">
                <span className="font-sign text-[13px] font-bold uppercase tracking-[0.1em] text-red-800">
                  {CR.yourColumn}
                </span>
                <span className="font-serif text-[13px] font-semibold leading-snug text-slate-800">
                  {viewerWon
                    ? constitution
                      ? CR.constitutionWon
                      : CR.won
                    : constitution
                      ? fmt(CR.constitutionLine, {
                          name: viewer.name,
                          place: ordinal(viewerPlace),
                        })
                      : fmt(CR.youLine, {
                          name: viewer.name,
                          place: ordinal(viewerPlace),
                          titles: viewerState.titles,
                          w: viewerState.wins,
                          l: viewerState.losses,
                        })}
                </span>
              </span>
            </div>
          )}
          {children && (
            <div
              data-no-capture
              className="flex flex-wrap items-center justify-between gap-3 rounded-[2px] border-2 border-slate-900/30 bg-white/40 px-3 py-2"
            >
              <span className="font-serif text-[13px] font-semibold text-slate-800">
                {F.title}
              </span>
              {children}
            </div>
          )}
        </div>
        {constitution && (
          <figure className="flex flex-col items-center gap-3 self-center">
            <div className="rotate-[-2deg] rounded-[2px] border-[6px] border-[#fdfaf0] bg-slate-950 px-5 py-5 shadow-[0_4px_0_rgb(0_0_0/0.35)]">
              <ConstitutionWinners
                party={constitution.party}
                winners={winners}
                ownSlug={career?.playerSlug}
              />
            </div>
          </figure>
        )}
        {overlord && (
          <figure className="flex flex-col items-center gap-3 self-center">
            <div className="rotate-[-2deg] rounded-[2px] border-[6px] border-[#fdfaf0] bg-slate-950 px-6 pb-3 pt-10 shadow-[0_4px_0_rgb(0_0_0/0.35)]">
              <span className="relative block">
                <CrownIcon className="absolute -top-9 left-1/2 h-14 w-14 -translate-x-1/2 -rotate-6 text-amber-300" />
                <PortraitHead
                  character={overlord}
                  className={`h-32 w-32 ring-4 sm:h-36 sm:w-36 ${
                    winner
                      ? COACH_COLOR_CLASSES[winner.color].ring
                      : 'ring-amber-300'
                  }`}
                />
              </span>
              <p className="mt-3 text-center font-sign text-[15px] font-bold uppercase tracking-[0.12em] text-[#fde68a]">
                {overlord.name}
              </p>
            </div>
          </figure>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-8">
        <PaperSection title={F.standings} icon="trophy">
          <ol className="flex flex-col gap-2">
            {report.coaches.map((coach) => {
              const character = characterBySlug.get(coach.slug);
              const classes = COACH_COLOR_CLASSES[coach.color];
              return (
                <li
                  key={coach.coachId}
                  className="grid grid-cols-[1.5rem_2.25rem_1fr] items-center gap-x-3 gap-y-1 sm:grid-cols-[1.5rem_2.25rem_11rem_1fr_13rem]"
                >
                  <span className="font-sign text-lg font-bold tabular-nums text-slate-900">
                    {coach.place}.
                  </span>
                  {character ? (
                    <PortraitHead
                      character={character}
                      className={`h-9 w-9 rounded-[2px] ring-2 ${classes.ring}`}
                    />
                  ) : (
                    <span />
                  )}
                  <span className="flex min-w-0 flex-col items-start gap-0.5">
                    <span className="truncate font-serif text-[13px] font-semibold text-slate-800">
                      {character?.name}
                    </span>
                    <SeatTag name={coach.name} color={coach.color} />
                  </span>
                  <span className="col-span-3 flex items-center gap-2 sm:col-span-1">
                    <PaperBar
                      value={coach.points}
                      max={maxPoints}
                      className={classes.fill}
                    />
                  </span>
                  <span className="col-span-3 grid grid-cols-[5.5rem_1fr] items-center gap-3 whitespace-nowrap font-sign text-[14px] tabular-nums sm:col-span-1 sm:pl-4">
                    <span className="text-right font-bold">
                      {plural(F.points, coach.points, { points: coach.points })}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-amber-700">
                      {Array.from({ length: Math.min(coach.titles, 8) }).map(
                        (_, i) => (
                          <Icon key={i} name="trophy" className="h-3 w-3" />
                        ),
                      )}
                      {coach.titles > 8 && <span>+{coach.titles - 8}</span>}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </PaperSection>

        {career && (
          <CampaignChart
            career={career}
            characterBySlug={characterBySlug}
            order={order}
            overlordSlug={report.overlordSlug}
            seeded={[
              career.playerSlug,
              ...(report.overlordSlug
                ? [report.overlordSlug]
                : (constitution?.winners ?? [])),
              ...slugs,
            ]}
            exporting={exporting}
          />
        )}

        {career?.characters[career.playerSlug] && (
          <div className="grid gap-8 lg:grid-cols-2">
            <CampaignCupGains career={career} />
            <CampaignHeadToHead
              career={career}
              characterBySlug={characterBySlug}
              order={order}
            />
          </div>
        )}

        <PaperSection title={CR.championsTitle} icon="trophy">
          <ChampionsStrip
            champions={report.champions}
            characterBySlug={characterBySlug}
            coaches={coaches}
          />
        </PaperSection>

        {career && (
          <CampaignAwards
            career={career}
            characterBySlug={characterBySlug}
            order={order}
            coaches={coaches}
          />
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {slugs.length > 1 && (
            <PaperSection title={R.h2h}>
              <div className="overflow-x-auto">
                <table className="font-sign text-[14px] tabular-nums text-slate-800">
                  <thead>
                    <tr>
                      <th />
                      {slugs.map((s) => {
                        const coach = coachBySlug.get(s);
                        return (
                          <th key={s} className="px-2 py-1 text-center">
                            {coach && (
                              <SeatTag name={coach.name} color={coach.color} />
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {slugs.map((row) => {
                      const coach = coachBySlug.get(row);
                      return (
                        <tr
                          key={row}
                          className="border-t border-dotted border-slate-900/30"
                        >
                          <th className="py-1 pr-2 text-left">
                            {coach && (
                              <SeatTag name={coach.name} color={coach.color} />
                            )}
                          </th>
                          {slugs.map((col) => {
                            const wins = report.h2h[row]?.[col] ?? 0;
                            const strong =
                              row !== col && wins > 0 && wins === maxH2h;
                            return (
                              <td
                                key={col}
                                className={`px-2 py-1 text-center ${
                                  row === col
                                    ? 'text-slate-400'
                                    : strong
                                      ? 'bg-slate-900 font-bold text-amber-50'
                                      : wins > 0
                                        ? 'bg-slate-900/10 font-bold'
                                        : ''
                                }`}
                              >
                                {row === col ? '·' : wins}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </PaperSection>
          )}
          <PaperSection title={CR.priceTitle}>
            <CampaignPriceChart index={report.priceIndex} />
          </PaperSection>
        </div>

        {career && (
          <CampaignTable
            career={career}
            characterBySlug={characterBySlug}
            order={order}
            overlordSlug={report.overlordSlug}
            coaches={coaches}
            bets={Object.fromEntries(
              report.coaches.map((c) => [c.slug, c.bets]),
            )}
          />
        )}

        <CampaignGovernments
          governments={report.governments}
          lastYear={lastYear}
          characterBySlug={characterBySlug}
        />
      </div>

      <div className="mt-8 flex justify-center border-t-2 border-slate-900 pt-6">
        <ReportDownload
          targetRef={paperRef}
          fileName={fmt(GAMES_UI.career.report.download.fileNameRivals, { year: lastYear })}
          onPrepare={() => setExporting(true)}
          onFinish={() => setExporting(false)}
        />
      </div>
    </div>
  );
}
