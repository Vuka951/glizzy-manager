'use client';

import { useRef, useState } from 'react';
import CrownIcon from '@/components/icons/CrownIcon';
import Icon from '@/components/icons/Icon';
import PortraitHead from '@/components/games/PortraitHead';
import CampaignAwards from '@/components/games/career/CampaignAwards';
import CampaignChart from '@/components/games/career/CampaignChart';
import CampaignGovernments from '@/components/games/career/CampaignGovernments';
import CampaignPriceChart from '@/components/games/career/CampaignPriceChart';
import CampaignTable from '@/components/games/career/CampaignTable';
import ChampionsStrip from '@/components/games/career/ChampionsStrip';
import PaperSection from '@/components/games/career/PaperSection';
import ReportDownload from '@/components/games/career/ReportDownload';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import PaperStamp from '@/components/games/career-mp/PaperStamp';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { IconName } from '@/lib/constants/icons';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fmt, ordinal } from '@/lib/utils/format';

const R = GAMES_UI.career.report;
const NP = GAMES_UI.career.newspaper;
const SELECT = GAMES_UI.career.select;

// One figure in the front-page box score
function Figure({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: IconName;
  children: React.ReactNode;
}) {
  return (
    <span className="flex min-w-0 flex-col items-center gap-0.5 px-2 py-2 text-center">
      <span className="truncate text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      <span className="flex min-w-0 items-center justify-center gap-1.5 font-mono text-xl font-black text-slate-900">
        {icon && (
          <Icon name={icon} className="h-4 w-4 shrink-0 text-slate-500" />
        )}
        {children}
      </span>
    </span>
  );
}

// The last page of a campaign, printed as a special edition of the paper:
// who took the crown and how the player's run went, the table and the
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
  overlordSlug: string;
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
  const overlord = bySlug.get(overlordSlug);
  const playerState = career.characters[playerSlug];
  const overlordState = career.characters[overlordSlug];
  if (!player || !overlord) return null;
  const history = career.standingsHistory;
  const playerPlace = order.indexOf(playerSlug) + 1;
  const won = playerSlug === overlordSlug;
  const lastYear = history[history.length - 1]?.year ?? career.year;
  const priceHistory = career.gliziPriceHistory ?? [];
  // Saves from before the list was kept still hold the sitting government
  const governments =
    career.governments ??
    (career.parliament && career.parliament.electedYear > 0
      ? [
          {
            year: career.parliament.electedYear,
            government: career.parliament.government,
          },
        ]
      : []);
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
          {fmt(R.issue, { year: lastYear })}
        </p>
      </div>

      <div className="mt-4 grid gap-6 border-b-2 border-slate-900 pb-5 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-800">
            {NP.lead}
          </p>
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
            {fmt(R.headline, { name: overlord.name })}
          </h1>
          <div className="grid grid-cols-2 divide-x divide-dotted divide-slate-900/40 border-y-2 border-slate-900 sm:grid-cols-4">
            <Figure label={R.tiles.points} icon="bolt">
              {careerPoints(overlordState)}
            </Figure>
            <Figure label={R.tiles.titles} icon="trophy">
              {overlordState.titles}
            </Figure>
            <Figure label={R.tiles.record} icon="swords">
              {overlordState.wins}-{overlordState.losses}
            </Figure>
            <Figure label={R.tiles.sponsor}>
              {overlordState.sponsor ? (
                <SponsorEmblem
                  sponsorId={overlordState.sponsor.sponsorId}
                  className="h-6 w-6"
                />
              ) : (
                '-'
              )}
            </Figure>
          </div>
          <div
            className={`flex items-center gap-3 rounded-sm border-2 px-3 py-2 ${
              won
                ? 'border-red-700 bg-red-700/5'
                : 'border-slate-900/30 bg-white/40'
            }`}
          >
            <PortraitHead character={player} className="h-9 w-9 shrink-0" />
            <span className="flex min-w-0 flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-red-800">
                {R.yourColumn}
              </span>
              <span className="text-xs font-semibold leading-snug text-slate-800">
                {won
                  ? R.won
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
        <figure className="flex flex-col items-center gap-3 self-center">
          <div className="rotate-[-2deg] rounded-sm border-[6px] border-slate-100 bg-slate-950 px-6 pb-3 pt-10 shadow-xl">
            <span className="relative block">
              <CrownIcon className="absolute -top-9 left-1/2 h-14 w-14 -translate-x-1/2 -rotate-6 text-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
              <PortraitHead
                character={overlord}
                className="h-32 w-32 ring-4 ring-amber-300 sm:h-36 sm:w-36"
              />
            </span>
            <p className="mt-3 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-amber-200">
              {overlord.name}
            </p>
          </div>
        </figure>
      </div>

      <div className="mt-6 flex flex-col gap-8">
        <CampaignChart
          career={career}
          characterBySlug={bySlug}
          order={order}
          overlordSlug={overlordSlug}
          seeded={[playerSlug, overlordSlug]}
          exporting={exporting}
        />
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
          overlordSlug={overlordSlug}
        />
        {priceHistory.length > 1 && (
          <PaperSection title={R.priceTitle}>
            <CampaignPriceChart index={priceHistory} />
          </PaperSection>
        )}
        {governments.length > 0 && (
          <CampaignGovernments governments={governments} lastYear={lastYear} />
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
