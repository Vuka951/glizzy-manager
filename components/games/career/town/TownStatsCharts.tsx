import CampaignChart from '@/components/games/career/CampaignChart';
import CampaignCupGains from '@/components/games/career/CampaignCupGains';
import CampaignHeadToHead from '@/components/games/career/CampaignHeadToHead';
import CampaignPriceChart from '@/components/games/career/CampaignPriceChart';
import PaperSection from '@/components/games/career/PaperSection';
import TownStatsLeaders from '@/components/games/career/town/TownStatsLeaders';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { NEWSPRINT_PAINT } from '@/lib/utils/careerNewsprint';
import { campaignOverlord } from '@/lib/utils/careerPoints';
import type { SavedCareer } from '@/lib/utils/careerSave';

const R = GAMES_UI.career.report;

// The almanac's chart page: how the campaign has moved so far, what the
// reader made cup by cup, who leads at what, and how the reader stands against
// the rest of the league. A reader without a seat skips the pages about them
export default function TownStatsCharts({
  career,
  characterBySlug,
  order,
  coaches,
  shared,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  order: string[];
  coaches?: CoachTagMap;
  shared: boolean;
}) {
  const seated = career.characters[career.playerSlug] !== undefined;
  const priceHistory = career.gliziPriceHistory ?? [];
  return (
    <div className={`flex flex-col gap-6 ${NEWSPRINT_PAINT}`}>
      {career.standingsHistory.length > 0 && (
        <CampaignChart
          career={career}
          characterBySlug={characterBySlug}
          order={order}
          overlordSlug={campaignOverlord(career) ?? ''}
          seeded={[
            ...(seated ? [career.playerSlug] : []),
            ...(career.rivalSlug ? [career.rivalSlug] : []),
            ...(career.humanSlugs ?? []),
            ...order.slice(0, 2),
          ].filter((slug) => characterBySlug.has(slug))}
          live
        />
      )}
      {seated && <CampaignCupGains career={career} />}
      <TownStatsLeaders
        career={career}
        characterBySlug={characterBySlug}
        order={order}
        coaches={coaches}
        shared={shared}
      />
      {seated && (
        <CampaignHeadToHead
          career={career}
          characterBySlug={characterBySlug}
          order={order}
        />
      )}
      {priceHistory.length > 1 && (
        <PaperSection title={R.priceTitle}>
          <div className="overflow-x-auto">
            <div className="min-w-[28rem]">
              <CampaignPriceChart index={priceHistory} />
            </div>
          </div>
        </PaperSection>
      )}
    </div>
  );
}
