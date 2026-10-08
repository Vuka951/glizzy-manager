'use client';

import { useRef, useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import CrownIcon from '@/components/icons/CrownIcon';
import Icon from '@/components/icons/Icon';
import CampaignAwards from '@/components/games/career/CampaignAwards';
import CampaignChart from '@/components/games/career/CampaignChart';
import CampaignGovernments from '@/components/games/career/CampaignGovernments';
import CampaignPriceChart from '@/components/games/career/CampaignPriceChart';
import CampaignTable from '@/components/games/career/CampaignTable';
import ChampionsStrip from '@/components/games/career/ChampionsStrip';
import PaperBar from '@/components/games/career/PaperBar';
import PaperSection from '@/components/games/career/PaperSection';
import ReportDownload from '@/components/games/career/ReportDownload';
import CoachTag from '@/components/games/career-mp/CoachTag';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CampaignReportData, CoachTagMap } from '@/lib/types/careerMp';
import { rankBySeeding } from '@/lib/utils/careerPoints';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fmt, plural } from '@/lib/utils/format';

const F = GAMES_UI.careerMp.finished;
const R = GAMES_UI.careerMp.report;
const CR = GAMES_UI.career.report;
const NP = GAMES_UI.career.newspaper;
const SELECT = GAMES_UI.career.select;

function Figure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex min-w-0 flex-col items-center gap-0.5 px-2 py-2 text-center">
      <span className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      <span className="font-mono text-xl font-black text-slate-900">
        {children}
      </span>
    </span>
  );
}

// A bar drawn as a rect so its length can be data without an inline style
// The room's last page as a special edition of the paper: everything the
// single-player report prints, read from this coach's own view of the
// league, plus the room's own pages: the coach standings as bars, every
// coach's books drawn, the governments, the glizi price and the head to
// head grid between the human characters
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
  const overlord = characterBySlug.get(report.overlordSlug);
  const winner = report.coaches.find((c) => c.slug === report.overlordSlug);
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
  return (
    <div
      ref={paperRef}
      className="w-full max-w-5xl rounded-sm bg-amber-50 p-5 text-left text-slate-900 shadow-2xl sm:p-8"
    >
      <div className="border-y-4 border-double border-slate-900 py-2 text-center">
        <p className="text-2xl font-black uppercase tracking-[0.15em] sm:text-4xl">
          {SELECT.masthead}
        </p>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
          {fmt(CR.issue, { year: lastYear })} ·{' '}
          {GAMES_UI.careerMp.catalog.title}
        </p>
      </div>

      <div className="mt-4 grid gap-6 border-b-2 border-slate-900 pb-5 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-800">
            {NP.lead}
          </p>
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
            {fmt(CR.headline, { name: overlord?.name ?? report.overlordSlug })}
          </h1>
          <div className="grid grid-cols-2 divide-x divide-dotted divide-slate-900/40 border-y-2 border-slate-900 sm:grid-cols-4">
            <Figure label={CR.tiles.points}>{winner?.points ?? '-'}</Figure>
            <Figure label={CR.tiles.titles}>{winner?.titles ?? '-'}</Figure>
            <Figure label={R.seasonsCount}>{seasons}</Figure>
            <Figure label={R.coachesCount}>{report.coaches.length}</Figure>
          </div>
          {children && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border-2 border-slate-900/30 bg-white/40 px-3 py-2">
              <span className="text-[11px] italic text-slate-600">
                {F.title}
              </span>
              {children}
            </div>
          )}
        </div>
        {overlord && (
          <figure className="flex flex-col items-center gap-3 self-center">
            <div className="rotate-[-2deg] rounded-sm border-[6px] border-slate-100 bg-slate-950 px-6 pb-3 pt-10 shadow-xl">
              <span className="relative block">
                <CrownIcon className="absolute -top-9 left-1/2 h-14 w-14 -translate-x-1/2 -rotate-6 text-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
                <PortraitHead
                  character={overlord}
                  className={`h-32 w-32 ring-4 sm:h-36 sm:w-36 ${
                    winner
                      ? COACH_COLOR_CLASSES[winner.color].ring
                      : 'ring-amber-300'
                  }`}
                />
              </span>
              <p className="mt-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-200">
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
                  <span className="font-mono text-base font-black text-slate-900">
                    {coach.place}.
                  </span>
                  {character ? (
                    <PortraitHead
                      character={character}
                      className={`h-9 w-9 rounded-sm ring-2 ${classes.ring}`}
                    />
                  ) : (
                    <span />
                  )}
                  <span className="flex min-w-0 flex-col items-start gap-0.5">
                    <span className="truncate text-xs font-semibold text-slate-800">
                      {character?.name}
                    </span>
                    <CoachTag name={coach.name} color={coach.color} onPaper />
                  </span>
                  <span className="col-span-3 flex items-center gap-2 sm:col-span-1">
                    <PaperBar
                      value={coach.points}
                      max={maxPoints}
                      className={classes.fill}
                    />
                  </span>
                  <span className="col-span-3 grid grid-cols-[5.5rem_1fr] items-center gap-3 whitespace-nowrap font-mono text-[11px] sm:col-span-1 sm:pl-4">
                    <span className="text-right font-black">
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
            seeded={[career.playerSlug, report.overlordSlug, ...slugs]}
            exporting={exporting}
          />
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
                <table className="text-[11px] text-slate-800">
                  <thead>
                    <tr>
                      <th />
                      {slugs.map((s) => {
                        const coach = coachBySlug.get(s);
                        return (
                          <th key={s} className="px-2 py-1 text-center">
                            {coach && (
                              <CoachTag
                                name={coach.name}
                                color={coach.color}
                                onPaper
                              />
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
                              <CoachTag
                                name={coach.name}
                                color={coach.color}
                                onPaper
                              />
                            )}
                          </th>
                          {slugs.map((col) => {
                            const wins = report.h2h[row]?.[col] ?? 0;
                            const strong =
                              row !== col && wins > 0 && wins === maxH2h;
                            return (
                              <td
                                key={col}
                                className={`px-2 py-1 text-center font-mono ${
                                  row === col
                                    ? 'text-slate-400'
                                    : strong
                                      ? 'bg-slate-900 font-black text-amber-50'
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
