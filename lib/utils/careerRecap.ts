import { rankBySeeding, seedingKey } from '@/lib/utils/careerPoints';
import { derbyNews, isRivalMatch } from '@/lib/utils/careerRivals';
import type {
  CharacterCareerState,
  NewsItem,
  SavedCareer,
} from '@/lib/utils/careerSave';
import type { MessageRefs } from '@/lib/utils/message';
import {
  cupMatchLoser,
  cupMatchWinner,
  type CupMatch,
  type CupStanding,
} from '@/lib/utils/tournamentSim';

// A table move counts the places jumped and names the place landed on
const TABLE_MOVE_REFS: MessageRefs = { places: 'count', place: 'ordinal' };

const SCENE_BY_REASON: Record<string, string> = {
  meltdown: 'meltdown',
  'overfull-forfeit': 'binge',
  police: 'police',
  withdrawn: 'fired',
  removed: 'police',
};

// How deep the cup run went, from the lost final down to a first-round exit
export function cupPlaceTier(
  place: number,
): 'finalist' | 'semis' | 'quarters' | 'early' {
  if (place === 2) return 'finalist';
  if (place <= 4) return 'semis';
  if (place <= 8) return 'quarters';
  return 'early';
}

// The morning-after paper: champion, your man, every incident, one stat
export function cupRecapNews(
  state: SavedCareer,
  rounds: CupMatch[][],
  standings: CupStanding[],
): NewsItem[] {
  const league = cupRecapLeagueNews(state, rounds, standings);
  return [
    ...league.head,
    ...cupRecapCoachNews(state, rounds, standings),
    ...league.tail,
  ].slice(0, 8);
}

// The paper split in two: what the whole league reads (the champion up top,
// the incidents, the table and the fact underneath) and the coach's own
// stories that go between them
export function cupRecapLeagueNews(
  state: SavedCareer,
  rounds: CupMatch[][],
  standings: CupStanding[],
): { head: NewsItem[]; tail: NewsItem[] } {
  const head: NewsItem[] = [];
  const champion = standings[0]?.slug;
  if (champion) {
    head.push({
      kind: 'recap',
      templateKey: 'cupChampion',
      params: {},
      slugs: [champion],
      freezeframe: 'champion',
    });
  }
  const tail: NewsItem[] = [];
  rounds.flat().forEach((match) => {
    const reason = match.result?.reason;
    if (!reason) return;
    const loser = cupMatchLoser(match);
    if (!loser) return;
    const party = reason === 'removed' ? match.result?.removedBy : undefined;
    tail.push({
      kind: 'recap',
      templateKey: party ? `removal-${party}` : `cup-${reason}`,
      params: {},
      slugs: [loser],
      freezeframe: party ? `removal-${party}` : SCENE_BY_REASON[reason],
    });
  });
  tail.push(...tableShiftNews(state));
  tail.push(pickFact(state));
  return { head, tail };
}

export function cupRecapCoachNews(
  state: SavedCareer,
  rounds: CupMatch[][],
  standings: CupStanding[],
): NewsItem[] {
  const items: NewsItem[] = [];
  const champion = standings[0]?.slug;
  const playerPlace =
    standings.find((s) => s.slug === state.playerSlug)?.place ?? 0;
  if (champion !== state.playerSlug && playerPlace >= 1) {
    items.push({
      kind: 'recap',
      templateKey: `cupPlace-${cupPlaceTier(playerPlace)}`,
      params: { place: playerPlace },
      refs: { place: 'ordinal' },
      slugs: [state.playerSlug],
      freezeframe: `place-${cupPlaceTier(playerPlace)}`,
    });
  }
  const derbyWinner = state.rivalSlug ? derbyWinnerOf(state, rounds) : null;
  if (derbyWinner && state.rivalSlug) {
    items.push(
      derbyNews(
        state.playerSlug,
        state.rivalSlug,
        derbyWinner === state.playerSlug,
      ),
    );
  }
  return items;
}

function derbyWinnerOf(
  state: SavedCareer,
  rounds: CupMatch[][],
): string | null {
  const cupDerby = rounds
    .flat()
    .find((match) => match.result && isRivalMatch(state, match.a, match.b));
  return cupDerby ? cupMatchWinner(cupDerby) : null;
}

// Season-over-season table drama: who shot up and who sank. Compared against
// the table as it stood after the previous cup, so the first season has
// nothing to print
function tableShiftNews(state: SavedCareer): NewsItem[] {
  const prev = state.lastCupRanks ?? [];
  if (prev.length === 0) return [];
  const moves = rankBySeeding(state.characters, seedingKey(state)).flatMap(
    (slug, index) => {
      const prevIndex = prev.indexOf(slug);
      if (prevIndex === -1) return [];
      return [{ slug, index, prevIndex, delta: prevIndex - index }];
    },
  );
  const pick = (list: typeof moves) =>
    list.find((m) => m.slug === state.playerSlug) ?? list[0];

  const items: NewsItem[] = [];
  const used = new Set<string>();
  const push = (
    templateKey: string,
    move: (typeof moves)[number] | undefined,
    params: Record<string, number>,
    freezeframe: string,
    refs?: MessageRefs,
  ) => {
    if (!move || used.has(move.slug)) return;
    used.add(move.slug);
    items.push({
      kind: 'recap',
      templateKey,
      params,
      ...(refs ? { refs } : {}),
      slugs: [move.slug],
      freezeframe,
    });
  };

  const climbers = moves
    .filter((m) => m.delta >= 3)
    .sort((x, y) => y.delta - x.delta);
  const climber = pick(climbers);
  if (climber) {
    push(
      'tableClimb',
      climber,
      { places: climber.delta, place: climber.index + 1 },
      'table-up',
      TABLE_MOVE_REFS,
    );
  }

  const fallers = moves
    .filter((m) => m.delta <= -3)
    .sort((x, y) => x.delta - y.delta);
  const faller = pick(fallers);
  if (faller) {
    push(
      'tableFall',
      faller,
      { places: -faller.delta, place: faller.index + 1 },
      'table-down',
      TABLE_MOVE_REFS,
    );
  }

  return items.slice(0, 3);
}

// One league stat per paper: an extreme in any meter or trained skill, or a
// record
function pickFact(state: SavedCareer): NewsItem {
  const entries = Object.entries(state.characters);
  const extreme = (
    value: (ch: CharacterCareerState) => number,
    lowest = false,
  ) =>
    entries.reduce((best, entry) =>
      lowest
        ? value(entry[1]) < value(best[1])
          ? entry
          : best
        : value(entry[1]) > value(best[1])
          ? entry
          : best,
    );

  const streak = extreme((ch) => ch.titleStreak);
  if (streak[1].titleStreak >= 2) {
    return {
      kind: 'recap',
      templateKey: 'factStreak',
      params: { streak: streak[1].titleStreak + 1 },
      refs: { streak: 'ordinal' },
      slugs: [streak[0]],
      freezeframe: 'champion',
    };
  }

  const candidates: NewsItem[] = [];
  const stat = (
    templateKey: string,
    freezeframe: string,
    value: (ch: CharacterCareerState) => number,
    opts: { lowest?: boolean; min?: number } = {},
  ) => {
    const entry = extreme(value, opts.lowest);
    const v = value(entry[1]);
    if (opts.min !== undefined && v < opts.min) return;
    candidates.push({
      kind: 'recap',
      templateKey,
      params: { value: v },
      slugs: [entry[0]],
      freezeframe,
    });
  };
  stat('factStressHigh', 'stress', (ch) => ch.stress, { min: 50 });
  stat('factAppetiteHigh', 'binge', (ch) => ch.appetite, { min: 60 });
  stat('factAppetiteLow', 'no-appetite', (ch) => ch.appetite, { lowest: true });
  stat('factAmbitionHigh', 'fact-ambition', (ch) => ch.ambition);
  stat('factAmbitionLow', 'fact-ambition-low', (ch) => ch.ambition, {
    lowest: true,
  });
  stat('factEgoHigh', 'fact-ego', (ch) => ch.ego);
  stat('factEgoLow', 'fact-ego-low', (ch) => ch.ego, { lowest: true });
  stat('factFameHigh', 'fact-fame', (ch) => ch.fame);
  stat('factFameLow', 'fact-fame-low', (ch) => ch.fame, { lowest: true });
  stat('factStomachBest', 'train-stomach', (ch) => ch.livesCap.level, {
    min: 1,
  });
  stat('factSnifferBest', 'train-sniffer', (ch) => ch.njuh.level, { min: 1 });
  stat('factNutritionBest', 'train-nutrition', (ch) => ch.nutrition.level, {
    min: 1,
  });
  stat('factFansBest', 'train-fans', (ch) => ch.fanSkill.level, { min: 1 });

  const record = extreme((ch) => ch.wins - ch.losses);
  if (record[1].wins > 0) {
    candidates.push({
      kind: 'recap',
      templateKey: 'factRecord',
      params: { wins: record[1].wins, losses: record[1].losses },
      refs: { wins: 'count' },
      slugs: [record[0]],
      freezeframe: 'fact-record',
    });
  }

  const worstRecord = extreme((ch) => ch.wins - ch.losses, true);
  if (worstRecord[1].losses > worstRecord[1].wins) {
    candidates.push({
      kind: 'recap',
      templateKey: 'factRecordWorst',
      params: { wins: worstRecord[1].wins, losses: worstRecord[1].losses },
      refs: { wins: 'count' },
      slugs: [worstRecord[0]],
      freezeframe: 'fact-record-down',
    });
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}
