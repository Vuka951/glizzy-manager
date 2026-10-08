import {
  LORE_RIVALS,
  RIVAL_LOSS_EGO,
  RIVAL_LOSS_STRESS,
  RIVAL_MAX_PLACE_GAP,
  RIVAL_WIN_EGO,
  RIVAL_WIN_FAME,
} from '@/data/games/careerRivals';
import { rankBySeeding, seedingKey } from '@/lib/utils/careerPoints';
import type {
  CharacterCareerState,
  NewsItem,
  RivalCandidate,
  SavedCareer,
} from '@/lib/utils/careerSave';
import { clampMeter } from '@/lib/utils/careerMeters';
import { shuffleArray } from '@/lib/utils/shuffle';
import { cupMatchWinner, type CupMatch } from '@/lib/utils/tournamentSim';

// The comeback opens with an old grudge from the chronicles
export function firstYearRival(playerSlug: string, roster: string[]): string {
  const pool = (LORE_RIVALS[playerSlug] ?? []).filter((slug) =>
    roster.includes(slug),
  );
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  const others = roster.filter((slug) => slug !== playerSlug);
  return others[Math.floor(Math.random() * others.length)];
}

function playerCupEliminator(state: SavedCareer): string | null {
  const lost = (state.cup?.rounds ?? [])
    .flat()
    .filter(
      (match: CupMatch) =>
        match.result &&
        (match.a === state.playerSlug || match.b === state.playerSlug) &&
        cupMatchWinner(match) !== state.playerSlug,
    )
    .pop();
  if (!lost) return null;
  return (lost.a === state.playerSlug ? lost.b : lost.a) as string;
}

// The new-year shortlist: what the season did to the player outranks the
// chronicles, and the chronicles fill whatever is left. The sitting rival is
// excluded, every year gets fresh blood
export function rivalCandidates(state: SavedCareer): RivalCandidate[] {
  const taken = new Set([state.playerSlug, state.rivalSlug ?? '']);
  const picks: RivalCandidate[] = [];
  const seeding = rankBySeeding(state.characters, seedingKey(state));
  const playerIndex = seeding.indexOf(state.playerSlug);
  const add = (slug: string | null, reason: RivalCandidate['reason']) => {
    if (!slug || taken.has(slug) || !state.characters[slug]) return;
    if (Math.abs(seeding.indexOf(slug) - playerIndex) > RIVAL_MAX_PLACE_GAP) {
      return;
    }
    taken.add(slug);
    picks.push({ slug, reason });
  };

  add(playerCupEliminator(state), 'eliminated');
  const suspects = (state.saboteursThisYear ?? []).filter(
    (slug) => slug !== state.playerSlug,
  );
  add(suspects[suspects.length - 1] ?? null, 'sabotage');
  const lastRecord = state.standingsHistory[state.standingsHistory.length - 1];
  add(lastRecord?.champion ?? null, 'champion');

  if (playerIndex > 0) add(seeding[playerIndex - 1], 'table');
  else add(seeding[1] ?? null, 'chaser');

  for (const slug of shuffleArray(LORE_RIVALS[state.playerSlug] ?? [])) {
    add(slug, 'lore');
  }
  for (const slug of seeding) add(slug, 'lore');

  return picks.slice(0, 3);
}

// The derby swing: the player takes the full hit or the full glory, the
// rival takes the mirrored half
export function applyDerbyMeters(
  characters: Record<string, CharacterCareerState>,
  playerSlug: string,
  rivalSlug: string,
  playerWon: boolean,
): Record<string, CharacterCareerState> {
  const player = characters[playerSlug];
  const rival = characters[rivalSlug];
  if (!player || !rival) return characters;
  return {
    ...characters,
    [playerSlug]: playerWon
      ? {
          ...player,
          fame: clampMeter(player.fame + RIVAL_WIN_FAME),
          ego: clampMeter(player.ego + RIVAL_WIN_EGO),
        }
      : {
          ...player,
          stress: clampMeter(player.stress + RIVAL_LOSS_STRESS),
          ego: clampMeter(player.ego - RIVAL_LOSS_EGO),
        },
    [rivalSlug]: playerWon
      ? {
          ...rival,
          stress: clampMeter(rival.stress + Math.round(RIVAL_LOSS_STRESS / 2)),
          ego: clampMeter(rival.ego - Math.round(RIVAL_LOSS_EGO / 2)),
        }
      : {
          ...rival,
          fame: clampMeter(rival.fame + Math.round(RIVAL_WIN_FAME / 2)),
          ego: clampMeter(rival.ego + Math.round(RIVAL_WIN_EGO / 2)),
        },
  };
}

export function isRivalMatch(
  state: SavedCareer,
  a: string | null,
  b: string | null,
): boolean {
  if (!state.rivalSlug || !a || !b) return false;
  return (
    (a === state.playerSlug && b === state.rivalSlug) ||
    (b === state.playerSlug && a === state.rivalSlug)
  );
}

export function rivalAnnouncedNews(
  playerSlug: string,
  rivalSlug: string,
): NewsItem {
  return {
    kind: 'rival',
    templateKey: 'rival-announced',
    params: { player: playerSlug },
    refs: { player: 'character' },
    slugs: [rivalSlug],
    freezeframe: 'rumor',
  };
}

export function rivalChosenNews(
  playerSlug: string,
  rivalSlug: string,
): NewsItem {
  return {
    kind: 'rival',
    templateKey: 'rival-chosen',
    params: { player: playerSlug },
    refs: { player: 'character' },
    slugs: [rivalSlug],
    freezeframe: 'statement',
  };
}

export function derbyNews(
  playerSlug: string,
  rivalSlug: string,
  playerWon: boolean,
): NewsItem {
  return {
    kind: 'rival',
    templateKey: playerWon ? 'rival-derby-win' : 'rival-derby-loss',
    params: { rival: rivalSlug },
    refs: { rival: 'character' },
    slugs: [playerSlug],
    freezeframe: playerWon ? 'interview' : 'stress',
  };
}
