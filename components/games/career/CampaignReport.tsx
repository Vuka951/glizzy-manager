'use client';

import { useRef, useState } from 'react';
import CrownIcon from '@/components/icons/CrownIcon';
import PortraitHead from '@/components/games/PortraitHead';
import CampaignAwards from '@/components/games/career/CampaignAwards';
import CampaignChart from '@/components/games/career/CampaignChart';
import CampaignCupGains from '@/components/games/career/CampaignCupGains';
import CampaignHeadToHead from '@/components/games/career/CampaignHeadToHead';
import CampaignGovernments from '@/components/games/career/CampaignGovernments';
import CampaignPriceChart from '@/components/games/career/CampaignPriceChart';
import CampaignTable from '@/components/games/career/CampaignTable';
import ChampionsStrip from '@/components/games/career/ChampionsStrip';
import PaperSection from '@/components/games/career/PaperSection';
import ReportDownload from '@/components/games/career/ReportDownload';
import ReportFigure from '@/components/games/career/ReportFigure';
import ConstitutionWinners from '@/components/games/career/ConstitutionWinners';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import PaperStamp from '@/components/games/career-mp/PaperStamp';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  campaignGovernments,
  constitutionWin,
  lawsInForce,
} from '@/lib/utils/careerLaws';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import type { SavedCareer, SponsorId } from '@/lib/utils/careerSave';
import { NEWSPRINT_PAINT } from '@/lib/utils/careerNewsprint';
import { fmt, ordinal } from '@/lib/utils/format';

const R = GAMES_UI.career.report;
const NP = GAMES_UI.career.newspaper;
const SELECT = GAMES_UI.career.select;
const PARTY_NAMES = GAMES_UI.career.sponsors.names as Record<SponsorId, string>;

// The last page of a campaign, printed as a special edition of the paper:
// who took the crown, or which party voted itself the city and every coach
// on its list, and how the player's run went, the table and the
// points race drawn cup by cup, every champion, who stood out at what, and
// the whole table with the numbers the season table never had room for
export default function CampaignReport({
  career,
  characters,
  overlordSlug,
  onNewCareer,
}: {
  career: SavedCareer;
  characters: DuelCharacter[];
  // Null when the campaign ended on one-party rule
  overlordSlug: string | null;
  onNewCareer: () => void;
}) {
  const paperRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const bySlug = new Map(characters.map((c) => [c.slug, c]));
  const order = rankBySeeding(career.characters, career.playerSlug).filter(
    (slug) => bySlug.has(slug)
  );
  const playerSlug = career.playerSlug;
  const player = bySlug.get(playerSlug);
  const constitution = overlordSlug ? null : constitutionWin(career.parliament);
  const overlord = overlordSlug ? bySlug.get(overlordSlug) : undefined;
  const playerState = career.characters[playerSlug];
  const overlordState = overlordSlug
    ? career.characters[overlordSlug]
    : undefined;
  if (!player || (!constitution && (!overlord || !overlordState))) return null;
  const winners = (constitution?.winners ?? []).flatMap((slug) => {
    const character = bySlug.get(slug);
    return character ? [character] : [];
  });
  const history = career.standingsHistory;
  const playerPlace = order.indexOf(playerSlug) + 1;
  const won = constitution
    ? constitution.winners.includes(playerSlug)
    : playerSlug === overlordSlug;
  const lawCount = constitution ? lawsInForce(career.parliament).length : 0;
  const lastYear = history[history.length - 1]?.year ?? career.year;
  const priceHistory = career.gliziPriceHistory ?? [];
  const governments = campaignGovernments(career);
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
          {fmt(R.issue, { year: lastYear })}
        </p>
      </div>

      <div className="mt-4 grid gap-6 border-b-2 border-slate-900 pb-5 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="font-sign text-[14px] font-bold uppercase tracking-[0.12em] text-red-800">
            {NP.lead}
          </p>
          <h1 className="font-serif text-4xl font-black uppercase leading-[0.95] tracking-tight [overflow-wrap:anywhere] sm:text-6xl">
            {constitution
              ? fmt(R.constitutionHeadline, {
                  party: PARTY_NAMES[constitution.party],
                })
              : fmt(R.headline, { name: overlord?.name ?? '' })}
          </h1>
          {constitution ? (
            <div className="grid grid-cols-2 divide-x divide-dotted divide-slate-900/40 border-y-2 border-slate-900 sm:grid-cols-4">
              <ReportFigure label={R.constitutionTiles.laws}>{lawCount}</ReportFigure>
              <ReportFigure label={R.constitutionTiles.seats}>
                {career.parliament?.seats[constitution.party] ?? '-'}
              </ReportFigure>
              <ReportFigure label={R.constitutionTiles.winners}>
                {constitution.winners.length}
              </ReportFigure>
              <ReportFigure label={R.constitutionTiles.year}>
                {constitution.year}
              </ReportFigure>
            </div>
          ) : overlordState ? (
            <div className="grid grid-cols-2 divide-x divide-dotted divide-slate-900/40 border-y-2 border-slate-900 sm:grid-cols-4">
              <ReportFigure label={R.tiles.points} icon="bolt">
                {careerPoints(overlordState)}
              </ReportFigure>
              <ReportFigure label={R.tiles.titles} icon="trophy">
                {overlordState.titles}
              </ReportFigure>
              <ReportFigure label={R.tiles.record} icon="swords">
                {overlordState.wins}-{overlordState.losses}
              </ReportFigure>
              <ReportFigure label={R.tiles.sponsor}>
                {overlordState.sponsor ? (
                  <SponsorEmblem
                    sponsorId={overlordState.sponsor.sponsorId}
                    className="h-6 w-6"
                  />
                ) : (
                  '-'
                )}
              </ReportFigure>
            </div>
          ) : null}
          <div
            className={`flex items-center gap-3 rounded-[2px] border-2 px-3 py-2 ${
              won
                ? 'border-red-700 bg-[#fde047]/45'
                : 'border-slate-900/30 bg-white/40'
            }`}
          >
            <PortraitHead character={player} className="h-9 w-9 shrink-0" />
            <span className="flex min-w-0 flex-col">
              <span className="font-sign text-[13px] font-bold uppercase tracking-[0.1em] text-red-800">
                {R.yourColumn}
              </span>
              <span className="font-serif text-[13px] font-semibold leading-snug text-slate-800">
                {won
                  ? constitution
                    ? R.constitutionWon
                    : R.won
                  : constitution
                    ? fmt(R.constitutionLine, {
                        name: player.name,
                        place: ordinal(playerPlace),
                      })
                    : fmt(R.youLine, {
                        name: player.name,
                        place: ordinal(playerPlace),
                        titles: playerState.titles,
                        w: playerState.wins,
                        l: playerState.losses,
                      })}
              </span>
            </span>
          </div>
        </div>
        {constitution ? (
          <figure className="flex flex-col items-center gap-3 self-center">
            <div className="rotate-[-2deg] rounded-[2px] border-[6px] border-[#fdfaf0] bg-slate-950 px-5 py-5 shadow-[0_4px_0_rgb(0_0_0/0.35)]">
              <ConstitutionWinners
                party={constitution.party}
                winners={winners}
                ownSlug={playerSlug}
              />
            </div>
          </figure>
        ) : overlord ? (
          <figure className="flex flex-col items-center gap-3 self-center">
            <div className="rotate-[-2deg] rounded-[2px] border-[6px] border-[#fdfaf0] bg-slate-950 px-6 pb-3 pt-10 shadow-[0_4px_0_rgb(0_0_0/0.35)]">
              <span className="relative block">
                <CrownIcon className="absolute -top-9 left-1/2 h-14 w-14 -translate-x-1/2 -rotate-6 text-amber-300" />
                <PortraitHead
                  character={overlord}
                  className="h-32 w-32 ring-4 ring-amber-300 sm:h-36 sm:w-36"
                />
              </span>
              <p className="mt-3 text-center font-sign text-[15px] font-bold uppercase tracking-[0.12em] text-[#fde68a]">
                {overlord.name}
              </p>
            </div>
          </figure>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-8">
        <CampaignChart
          career={career}
          characterBySlug={bySlug}
          order={order}
          overlordSlug={overlordSlug ?? ''}
          seeded={[
            playerSlug,
            ...(overlordSlug ? [overlordSlug] : (constitution?.winners ?? [])),
          ]}
          exporting={exporting}
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <CampaignCupGains career={career} />
          <CampaignHeadToHead
            career={career}
            characterBySlug={bySlug}
            order={order}
          />
        </div>
        {history.length > 0 && (
          <PaperSection title={R.championsTitle} icon="trophy">
            <ChampionsStrip
              champions={history}
              characterBySlug={bySlug}
              playerSlug={playerSlug}
            />
          </PaperSection>
        )}
        <CampaignAwards
          career={career}
          characterBySlug={bySlug}
          order={order}
        />
        <CampaignTable
          career={career}
          characterBySlug={bySlug}
          order={order}
          overlordSlug={overlordSlug ?? ''}
        />
        {priceHistory.length > 1 && (
          <PaperSection title={R.priceTitle}>
            <CampaignPriceChart index={priceHistory} />
          </PaperSection>
        )}
        {governments.length > 0 && (
          <CampaignGovernments
            governments={governments}
            lastYear={lastYear}
            characterBySlug={bySlug}
            playerSlug={playerSlug}
          />
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 border-t-2 border-slate-900 pt-6">
        <PaperStamp label={R.newCareer} onClick={onNewCareer} />
        <ReportDownload
          targetRef={paperRef}
          fileName={fmt(GAMES_UI.career.report.download.fileName, { year: lastYear })}
          onPrepare={() => setExporting(true)}
          onFinish={() => setExporting(false)}
        />
      </div>
    </div>
  );
}
