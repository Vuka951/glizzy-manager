'use client';

import { useRef, useState } from 'react';
import CampaignGovernments from '@/components/games/career/CampaignGovernments';
import ChampionsStrip from '@/components/games/career/ChampionsStrip';
import TownStatsCharts from '@/components/games/career/town/TownStatsCharts';
import TownStatsStandings from '@/components/games/career/town/TownStatsStandings';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { campaignGovernments } from '@/lib/utils/careerLaws';
import { rankBySeeding, seedingKey } from '@/lib/utils/careerPoints';
import type { SavedCareer } from '@/lib/utils/careerSave';

const S = GAMES_UI.career.town.stats;

type Tab = keyof typeof S.tabs;
const TABS: Tab[] = ['table', 'cups', 'charts', 'power'];

// The league's stats insert from the kiosk: the end report's pages, read
// mid-campaign and set as a printed almanac with a tab per page. A shared
// room prints only what every coach can already see: the money board stays
// out until the final report opens the books. The pages share one fixed
// height so the sheet never jumps between tabs, and only a page longer than
// that scrolls. The scroller reaches into the sheet's margin so portraits set flush with
// the column keep their rings and shadows instead of being cut at its edge
export default function TownLeagueStats({
  career,
  characterBySlug,
  coaches,
  shared = false,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  coaches?: CoachTagMap;
  shared?: boolean;
}) {
  const [tab, setTab] = useState<Tab>('table');
  const pagesRef = useRef<HTMLDivElement | null>(null);
  const order = rankBySeeding(career.characters, seedingKey(career)).filter(
    (slug) => characterBySlug.has(slug),
  );
  const governments = campaignGovernments(career);
  return (
    <div
      className="rounded-[2px] bg-[#f5ecd7] p-3 text-left text-slate-900 shadow-[0_6px_0_-2px_rgb(0_0_0/0.45)] sm:p-4"
    >
      <div className="border-y-4 border-double border-slate-900 py-1.5 text-center">
        <p className="font-serif text-xl font-black uppercase tracking-[0.12em] sm:text-2xl">
          {S.title}
        </p>
      </div>
      <div role="tablist" className="mt-2 flex border-b-2 border-slate-900">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              pagesRef.current?.scrollTo({ top: 0 });
            }}
            className={`-mb-0.5 flex-1 border-b-2 px-1 py-1.5 font-sign pointer-coarse:min-h-11 text-[14px] font-bold uppercase tracking-[0.06em] transition focus-visible:outline-2 focus-visible:outline-[#a11919] ${
              tab === id
                ? 'border-red-800 text-red-800'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {S.tabs[id]}
          </button>
        ))}
      </div>
      <div
        ref={pagesRef}
        className="-mx-3 mt-3 h-[min(calc(80vh/var(--game-zoom,1)_-_15rem),34rem)] overflow-y-auto overscroll-contain px-3 pb-3 [--color-amber-50:#f5ecd7] [--color-slate-400:#6b5b42] [--color-slate-500:#55472f] phone-landscape:h-auto"
      >
        {TABS.map((id) => (
          <div
            key={id}
            role="tabpanel"
            hidden={tab !== id}
          >
            {id === 'table' && (
              <TownStatsStandings
                career={career}
                characterBySlug={characterBySlug}
                order={order}
                coaches={coaches}
              />
            )}
            {id === 'cups' &&
              (career.standingsHistory.length > 0 ? (
                <ChampionsStrip
                  champions={career.standingsHistory}
                  characterBySlug={characterBySlug}
                  playerSlug={career.playerSlug}
                  coaches={coaches}
                />
              ) : (
                <p className="text-center font-sign text-sm text-slate-600">-</p>
              ))}
            {id === 'charts' && (
              <TownStatsCharts
                career={career}
                characterBySlug={characterBySlug}
                order={order}
                coaches={coaches}
                shared={shared}
              />
            )}
            {id === 'power' && (
              <CampaignGovernments
                governments={governments}
                lastYear={career.year}
                characterBySlug={characterBySlug}
                playerSlug={career.playerSlug}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
