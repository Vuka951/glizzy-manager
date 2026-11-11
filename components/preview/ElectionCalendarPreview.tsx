'use client';

import type { GlizzyBetTicket } from '@/components/games/career/GlizzflationBetDesk';
import GlizacijaPanel from '@/components/games/career/GlizacijaPanel';
import SeasonPriceInfoPanel from '@/components/games/career/SeasonPriceInfoPanel';
import YearCalendar from '@/components/games/career/YearCalendar';
import BankBuilding from '@/components/games/career/town/BankBuilding';
import TownBuildingTile from '@/components/preview/TownBuildingTile';
import type { SavedCareer } from '@/lib/utils/careerSave';

export default function ElectionCalendarPreview({
  career,
}: {
  career: SavedCareer;
}) {
  const [first, second, third] = Object.keys(career.characters).filter(
    (slug) => slug !== career.playerSlug,
  );
  const otherBets: GlizzyBetTicket[] = [
    {
      coachId: 'preview-a',
      name: 'Robin',
      color: 'violet',
      slug: first,
      bet: { call: 'up', stake: 50 },
      last: null,
    },
    {
      coachId: 'preview-b',
      name: 'Sasha',
      color: 'orange',
      slug: second,
      bet: null,
      last: null,
    },
    {
      coachId: 'preview-c',
      name: 'Kit',
      color: 'teal',
      slug: third,
      bet: { call: 'flat', stake: 100 },
      last: { call: 'down', stake: 25, actualPct: -7, payout: 82 },
    },
  ];
  return (
    <div className="mx-auto w-full max-w-2xl">
      <YearCalendar career={{ ...career, year: 4 }} />
      <SeasonPriceInfoPanel career={career} />
      <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
        <TownBuildingTile box="h-[82%] aspect-[170/175]">
          <BankBuilding mode="open" career={career} />
        </TownBuildingTile>
        <GlizacijaPanel
          career={career}
          onBet={() => undefined}
          onCancelBet={() => undefined}
          otherBets={otherBets}
        />
      </div>
    </div>
  );
}
