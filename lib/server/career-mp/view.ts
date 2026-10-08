import { CONNECTED_WINDOW_MS } from '@/lib/constants/careerMp';
import { careerFor } from '@/lib/server/career-mp/lens';
import type { Room } from '@/lib/server/career-mp/room';
import type {
  CoachPublic,
  PhaseState,
  PublicBet,
  RoomSummary,
  RoomView,
} from '@/lib/types/careerMp';
import type { CareerPhase, NewsItem, SavedCareer } from '@/lib/utils/careerSave';
import { cupBetKey } from '@/lib/utils/tournamentSim';

// The single-player phase the coach's screens read for the room's phase
export function careerPhaseFor(phase: PhaseState): CareerPhase {
  switch (phase.kind) {
    case 'window':
      return 'offseason';
    case 'paper':
      return 'news';
    case 'cup-pre':
    case 'match-bets':
    case 'match-clip':
      return 'cup';
    case 'season-end':
      return 'podium';
    default:
      return 'standings';
  }
}

// League stories with no hero print the reader's own man, as in single player
function withOwnSlug(news: NewsItem[], slug: string): NewsItem[] {
  return news.map((item) =>
    item.slugs.length === 0 ? { ...item, slugs: [slug], tagless: true } : item,
  );
}

function redactCareer(career: SavedCareer): SavedCareer {
  const { humanGuards: _guards, ...rest } = career;
  void _guards;
  return {
    ...rest,
    pendingSabotages: career.pendingSabotages.filter(
      (s) => s.bySlug === career.playerSlug,
    ),
    newsQueue: withOwnSlug(career.newsQueue, career.playerSlug),
    lastIssue: career.lastIssue
      ? { ...career.lastIssue, news: withOwnSlug(career.lastIssue.news, career.playerSlug) }
      : career.lastIssue,
    cupRecap: withOwnSlug(career.cupRecap ?? [], career.playerSlug),
  };
}

function publicBets(room: Room): PublicBet[] {
  const phase = room.phase;
  const league = room.league;
  if (!league) return [];
  if (phase.kind !== 'match-bets' && phase.kind !== 'match-clip') return [];
  const out: PublicBet[] = [];
  Object.entries(league.coachStates).forEach(([coachId, cs]) => {
    const bet = cs.matchBets[cupBetKey(phase.stage.round, phase.index)];
    if (bet) out.push({ coachId, side: bet.side, stake: bet.stake });
  });
  return out;
}

export function summaryOf(room: Room, now: number): RoomSummary {
  return {
    code: room.code,
    status: room.status,
    phase: room.phase.kind,
    year: room.league?.year ?? null,
    season: room.league?.season ?? null,
    hostName: room.coaches[room.hostCoachId]?.name ?? '',
    coaches: Object.values(room.coaches)
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        slug: c.slug,
        connected: now - c.lastSeenAt <= CONNECTED_WINDOW_MS,
      })),
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

export function viewFor(room: Room, coachId: string, now: number): RoomView {
  const league = room.league;
  const coaches: CoachPublic[] = Object.values(room.coaches)
    .sort((a, b) => a.joinedAt - b.joinedAt)
    .map((c) => {
      const cs = league?.coachStates[c.id];
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        slug: c.slug,
        connected: now - c.lastSeenAt <= CONNECTED_WINDOW_MS,
        ready: c.ready,
        done: cs?.done ?? false,
        balance: cs?.balance ?? 0,
        withdrawn: cs?.withdrawn ?? false,
        passed: cs?.passed ?? false,
        isHost: c.id === room.hostCoachId,
      };
    });
  const coachBySlug: Record<string, string> = {};
  Object.entries(league?.coachStates ?? {}).forEach(([id, cs]) => {
    coachBySlug[cs.slug] = id;
  });
  Object.values(room.coaches).forEach((c) => {
    if (c.slug && !coachBySlug[c.slug]) coachBySlug[c.slug] = c.id;
  });
  const career =
    league && league.coachStates[coachId]
      ? redactCareer(careerFor(league, coachId, careerPhaseFor(room.phase)))
      : null;
  return {
    code: room.code,
    version: room.version,
    now,
    status: room.status,
    hostCoachId: room.hostCoachId,
    coachId,
    settings: room.settings,
    coaches,
    phase: room.phase,
    career,
    coachBySlug,
    publicBets: publicBets(room),
    skipVotes: {
      round: league?.skipRoundVotes ?? [],
      cup: league?.skipCupVotes ?? [],
    },
    report: room.report,
    log: room.log
      .filter((e) => !e.visibleTo || e.visibleTo === coachId)
      .slice(-60),
    lastElection: league?.lastElection ?? null,
    windowIntro: league?.coachStates[coachId]?.windowIntro ?? null,
    connectedCount: coaches.filter((c) => c.connected).length,
  };
}
