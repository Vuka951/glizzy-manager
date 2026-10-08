import { ActionError } from '@/lib/server/career-mp/errors';
import type { Room } from '@/lib/server/career-mp/room';
import type {
  CampaignReportData,
  CoachReport,
  LedgerCategory,
} from '@/lib/types/careerMp';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';

const CATEGORIES: LedgerCategory[] = [
  'prize',
  'sponsor',
  'stipend',
  'media',
  'bets',
  'training',
  'guard',
  'plots',
  'fines',
  'donations',
  'investments',
  'tax',
];

// The campaign in numbers, read off the ledger, the counters and the state
// the moment the crown lands
export function buildReport(room: Room): CampaignReportData {
  const league = room.league;
  if (!league) throw new ActionError('bad-room');
  const order = rankBySeeding(league.characters, new Set(league.humanSlugs));
  const coaches: CoachReport[] = Object.entries(league.coachStates).map(
    ([coachId, cs]) => {
      const coach = room.coaches[coachId];
      const ch = league.characters[cs.slug];
      const money = Object.fromEntries(
        CATEGORIES.map((c) => [c, 0]),
      ) as Record<LedgerCategory, number>;
      cs.ledger.forEach((entry) => {
        money[entry.category] += entry.amount;
      });
      const placed = cs.cupPlaces.filter((p) => p > 0);
      return {
        coachId,
        name: coach?.name ?? coachId,
        color: coach?.color ?? 'sky',
        slug: cs.slug,
        place: order.indexOf(cs.slug) + 1,
        points: careerPoints(ch),
        titles: ch.titles,
        seasons: league.standingsHistory.length,
        money,
        plots: {
          booked: cs.plotsBooked,
          landed: cs.plotsLanded,
          blocked: cs.plotsBlocked,
          caught: cs.plotsCaught,
        },
        hitsTaken: cs.hitsTaken,
        guard: { windows: cs.guardWindows, blocks: cs.guardBlocks },
        bets: { placed: cs.betsPlaced, won: cs.betsWon, net: money.bets },
        donations: -money.donations,
        favorsUsed: cs.favorsUsed,
        sponsors: cs.sponsorHistory,
        rivals: cs.rivalHistory,
        bestCup: placed.length > 0 ? Math.min(...placed) : null,
        worstCup: placed.length > 0 ? Math.max(...placed) : null,
      };
    },
  );
  coaches.sort((a, b) => a.place - b.place);
  const h2h: Record<string, Record<string, number>> = {};
  league.humanSlugs.forEach((row) => {
    h2h[row] = {};
    league.humanSlugs.forEach((col) => {
      if (row === col) return;
      const key = [row, col].sort().join('|');
      const record = league.h2h[key];
      if (!record) {
        h2h[row][col] = 0;
        return;
      }
      const [first] = key.split('|');
      h2h[row][col] = first === row ? record[0] : record[1];
    });
  });
  return {
    overlordSlug: league.overlordSlug ?? '',
    coaches,
    champions: league.standingsHistory.map((r) => ({
      year: r.year,
      season: r.season,
      champion: r.champion,
    })),
    governments: league.governments,
    priceIndex: league.gliziPriceHistory,
    h2h,
  };
}
